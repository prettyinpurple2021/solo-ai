import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db, eq } from '@/server/db';
import { users } from '@/server/db/schema';
import { logError, logInfo } from '@/lib/logger';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  if (!endpointSecret) {
    logError('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    logError(`Webhook Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const userId = session.metadata?.userId;

        if (userId) {
          // If we have a subscription, fetch it to get details
          let tier = 'free';
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0].price.id;
            
            // Map price ID to tier
            if (priceId === process.env.STRIPE_ACCELERATOR_PRICE_ID || priceId === process.env.STRIPE_ACCELERATOR_YEARLY_PRICE_ID) {
              tier = 'accelerator';
            } else if (priceId === process.env.STRIPE_DOMINATOR_PRICE_ID || priceId === process.env.STRIPE_DOMINATOR_YEARLY_PRICE_ID) {
              tier = 'dominator';
            }
          }

          await db.update(users)
            .set({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_tier: tier,
              subscription_status: 'active',
              updated_at: new Date(),
            })
            .where(eq(users.id, userId));
          
          logInfo(`User ${userId} subscription activated via checkout: ${tier}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;
        
        let tier = 'free';
        if (priceId === process.env.STRIPE_ACCELERATOR_PRICE_ID || priceId === process.env.STRIPE_ACCELERATOR_YEARLY_PRICE_ID) {
          tier = 'accelerator';
        } else if (priceId === process.env.STRIPE_DOMINATOR_PRICE_ID || priceId === process.env.STRIPE_DOMINATOR_YEARLY_PRICE_ID) {
          tier = 'dominator';
        }

        await db.update(users)
          .set({
            subscription_tier: tier,
            subscription_status: subscription.status === 'active' ? 'active' : 'past_due',
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date(),
          })
          .where(eq(users.stripe_subscription_id, subscription.id));
        
        logInfo(`Subscription ${subscription.id} updated: ${tier} (${subscription.status})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await db.update(users)
          .set({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            updated_at: new Date(),
          })
          .where(eq(users.stripe_subscription_id, subscription.id));
        
        logInfo(`Subscription ${subscription.id} deleted. User moved back to free tier.`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          await db.update(users)
            .set({
              subscription_status: 'past_due',
              updated_at: new Date(),
            })
            .where(eq(users.stripe_subscription_id, subscriptionId));
          
          logInfo(`Payment failed for subscription ${subscriptionId}. Status set to past_due.`);
        }
        break;
      }

      default:
        logInfo(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logError('Error processing Stripe webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
