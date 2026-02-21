import { NextRequest, NextResponse } from 'next/server';
import { pushNotificationService, PushSubscriptionData } from '@/lib/push-notification-service';
import { verifyAuth } from '@/lib/auth-server'; // Assuming simple JWT verification
import { logError } from '@/lib/logger';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1)
  })
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth();
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.user.id; // Corrected to use number id

    const body = await request.json();
    const parseResult = subscriptionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid subscription data', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const result = await pushNotificationService.saveSubscription(
      userId,
      parseResult.data as PushSubscriptionData
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to save subscription' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Subscription saved' });
  } catch (error) {
    logError('Error processing subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
