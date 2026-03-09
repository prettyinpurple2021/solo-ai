import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/database-client';
import { userMfaSettings, users } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Resend } from 'resend';

// Configure Resend if the environment variable is present
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

    // Logic for Email/SMS 2FA fallback
    // Note: In a full production system, you'd store a randomly generated 6-digit code with an expiry 
    // in Redis or a DB table, and then send it via Resend or Twilio.
    
    if (method === 'email' && resend) {
      const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
      if (!user?.email) {
        return NextResponse.json({ success: false, error: 'User email not found' }, { status: 400 });
      }

      // Generate a simple 6 digit code for demonstration of the flow
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store this code in your database or redis to verify later (simulated by comment here)
      // await redis.set(`2fa:${user.id}`, randomCode, { ex: 300 });

      await resend.emails.send({
        from: 'security@solosuccess.ai', // Must be verified in Resend
        to: user.email,
        subject: 'Your 2FA Login Code',
        html: `<p>Your authentication code is: <strong>${randomCode}</strong>. It expires in 5 minutes.</p>`,
      });

      return NextResponse.json({ success: true, message: 'Verification code sent to your email.' });
    }

    return NextResponse.json({ success: true, message: 'Mock sent (Email provider not configured)' });

  } catch (error) {
    console.error('[TOTP Resend] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
