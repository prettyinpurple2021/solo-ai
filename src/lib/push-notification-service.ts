import webpush from 'web-push';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logError, logInfo } from '@/lib/logger';

const initWebPush = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    logError('VAPID keys are not configured');
    return;
  }

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL || (process.env.NEXT_PUBLIC_APP_URL ? 'admin@' + new URL(process.env.NEXT_PUBLIC_APP_URL).hostname : 'admin@example.com')}`,
    publicKey,
    privateKey
  );
};

// Initialize on import
initWebPush();

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const pushNotificationService = {
  /**
   * Send a push notification to a specific user
   */
  async sendToUser(userId: string, title: string, body: string, url?: string) {
    try {
      // Fetch user's active push subscriptions
      const subscriptions = await db
        .select()
        .from(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.user_id, userId), 
            eq(pushSubscriptions.is_active, true)
          )
        );
      
      if (subscriptions.length === 0) {
        logInfo(`No active push subscriptions found for user ${userId}`);
        return { success: false, error: 'No active subscriptions' };
      }

      logInfo(`Sending push notification to user ${userId} (${subscriptions.length} devices): ${title}`);
      
      const payload = JSON.stringify({
        title,
        body,
        url: url || process.env.NEXT_PUBLIC_APP_URL || '/',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      });

      const results = await Promise.all(subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh_key,
              auth: sub.auth_key
            }
          };

          await webpush.sendNotification(pushSubscription, payload);
          return { success: true, id: sub.id };
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription has expired or is no longer valid
            logInfo(`Push subscription ${sub.id} expired, deactivating`);
            await db
              .update(pushSubscriptions)
              .set({ is_active: false })
              .where(eq(pushSubscriptions.id, sub.id));
          }
          return { success: false, id: sub.id, error: err };
        }
      }));
      
      const successCount = results.filter(r => r.success).length;
      return { 
        success: successCount > 0, 
        message: `Sent to ${successCount}/${subscriptions.length} devices`,
        results 
      };
    } catch (error) {
      logError('Error sending push notification:', error);
      return { success: false, error };
    }
  },

  /**
   * Save a user's subscription
   */
  async saveSubscription(userId: string, subscription: PushSubscriptionData) {
    try {
      // Check if subscription already exists
      const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
        .limit(1);

      if (existing.length > 0) {
        // Update existing subscription if needed (e.g. reactivate)
        if (!existing[0].is_active) {
          await db
            .update(pushSubscriptions)
            .set({ 
              is_active: true,
              user_id: userId, // Ensure ownership is correct
              updated_at: new Date()
            })
            .where(eq(pushSubscriptions.id, existing[0].id));
        }
        return { success: true, id: existing[0].id };
      }

      // Create new subscription
      const [newSub] = await db.insert(pushSubscriptions).values({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        is_active: true
      }).returning();

      logInfo(`Saved push subscription for user ${userId}`);
      return { success: true, id: newSub.id };
    } catch (error) {
      logError('Error saving push subscription:', error);
      return { success: false, error };
    }
  }
};
