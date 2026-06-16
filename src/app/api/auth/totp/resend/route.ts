import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/database-client';
import { userMfaSettings, users } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Redis } from '@upstash/redis';
import { logError } from '@/lib/logger';
import { isEmailConfigured, sendTransactionalEmail, getDefaultFromAddress } from '@/lib/mail-transport';

// Configure Redis for session/temp data storage
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const resendSchema = z.object({
  method: z.enum(['email', 'sms']).default('email'),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = resendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid request data' }, { status: 400 });
    }

    const { method } = parsed.data;

    // Check if the user has TOTP enabled. If yes, resending a code makes no sense as they generate it.
    const [mfaSettings] = await db
      .select()
      .from(userMfaSettings)
      .where(eq(userMfaSettings.user_id, session.user.id));

    if (mfaSettings?.totp_enabled) {
      return NextResponse.json({ 
        success: false, 
        error: 'You are using an Authenticator app. Please open your app to get the current code.' 
      }, { status: 400 });
    }

    if (method === 'email') {
      if (!isEmailConfigured()) {
        return NextResponse.json({ success: false, error: 'Email service not configured' }, { status: 503 });
      }
      if (!redis) {
        return NextResponse.json({ success: false, error: 'Persistence service not configured' }, { status: 503 });
      }

      const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
      if (!user?.email) {
        return NextResponse.json({ success: false, error: 'User email not found' }, { status: 400 });
      }

      // Generate a secure 6 digit code
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store this code in Redis with a 5-minute expiry
      await redis.set(`2fa:code:${session.user.id}`, randomCode, { ex: 300 });

      const emailResult = await sendTransactionalEmail({
        from: getDefaultFromAddress(),
        to: user.email,
        subject: 'Your 2FA Login Code',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #333;">Security Verification</h2>
            <p>You requested a login code for your SoloSuccess AI account.</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
              ${randomCode}
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This code will expire in 5 minutes. If you did not request this code, please ignore this email.
            </p>
          </div>
        `,
      });

      if (!emailResult.success) {
        return NextResponse.json({ success: false, error: 'Failed to send verification email' }, { status: 503 });
      }

      return NextResponse.json({ success: true, message: 'Verification code sent to your email.' });
    }

    return NextResponse.json({ success: false, error: 'Unsupported verification method' }, { status: 400 });

  } catch (error) {
    logError(
      '[TOTP Resend] Error',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
