import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStripe, STRIPE_WEBHOOK_EVENTS, SUBSCRIPTION_TIERS } from '@/lib/stripe'
import { db } from '@/db'
import { users, webhookEvents } from '@/shared/db/schema'
import { eq } from 'drizzle-orm'
import { logError, logInfo } from '@/lib/logger'
import type { Stripe } from 'stripe'

// Context7 Verified Implementation
// Reference: Stripe Node Webhook Handling
// https://context7.com/stripe/stripe-node

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature') as string

  if (!signature) {
    logError('Missing stripe-signature header')
    return new NextResponse('Missing stripe-signature', { status: 400 })
  }

  const stripe = await getStripe()
  if (!stripe) {
    logError('Stripe not configured')
    return new NextResponse('Stripe not configured', { status: 500 })
  }

  let event: Stripe.Event

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error: any) {
    logError('Webhook signature verification failed', { error: error.message })
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  // Idempotency check
  try {
    const existingEvent = await db.query.webhookEvents.findFirst({
      where: eq(webhookEvents.id, event.id)
    });

    if (existingEvent) {
      logInfo(`Webhook event ${event.id} already processed. Skipping.`);
      return new NextResponse(null, { status: 200 });
    }
  } catch (error: any) {
    logError('Error checking for existing webhook event', { error: error.message });
    // Continue processing if check fails, better to re-process than drop
  }

  const subscription = event.data.object as Stripe.Subscription

  try {
    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED: {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(sub)
        break
      }
      
      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED: {
        // Handle subscription cancellation
        const sub = event.data.object as Stripe.Subscription;
        // User's subscription is canceled immediately or at period end
        // If deleted, it's gone.
        await handleSubscriptionDeleted(sub);
        break;
      }

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED: {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
            await handlePaymentFailed(invoice.subscription as string, invoice.customer as string);
        }
        break
      }

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED: {
        // Payment succeeded, we can extend access if we have specific logic,
        // but subscription.updated usually covers status changes.
        // We might want to log this or send a receipt.
        break;
      }

      default:
        // Unhandled event type
        // console.log(`Unhandled event type ${event.type}`)
    }

    // Record processed event
    await db.insert(webhookEvents).values({
      id: event.id,
      type: event.type,
      status: 'processed',
      data: event.data.object as any, // Cast to any to satisfy jsonb
      created_at: new Date()
    });

  } catch (error: any) {
    logError('Error handling webhook event', { type: event.type, error: error.message })
    return new NextResponse(`Error processing event: ${error.message}`, { status: 500 })
  }

  return new NextResponse(null, { status: 200 })
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const status = subscription.status
  const priceId = subscription.items.data[0].price.id
  
  // Map price ID to tier
  let tier = 'free'
  
  // Iterate strictly typed keys using explicit checks or manual fallback
  // Using type guards to safely access stripeYearlyPriceId
  const tiers = Object.values(SUBSCRIPTION_TIERS);
  const matchedTier = tiers.find(t => t.stripePriceId === priceId) || 
                      tiers.find(t => 'stripeYearlyPriceId' in t && t.stripeYearlyPriceId === priceId);

  if (matchedTier) {
    tier = matchedTier.id;
  } else if (priceId === SUBSCRIPTION_TIERS.LAUNCH.stripePriceId || 
             priceId === SUBSCRIPTION_TIERS.ACCELERATOR.stripePriceId || 
             priceId === SUBSCRIPTION_TIERS.DOMINATOR.stripePriceId) {
      // Fallback check if simple lookup fails
       if (priceId === SUBSCRIPTION_TIERS.ACCELERATOR.stripePriceId) tier = 'accelerator';
       else if (priceId === SUBSCRIPTION_TIERS.DOMINATOR.stripePriceId) tier = 'dominator';
       else tier = 'launch'; 
  }

  // Update user in DB
  let userId: string | undefined = subscription.metadata?.userId;
  
  if (!userId) {
     // Try to find user by stripe_customer_id
     const existingUser = await db.query.users.findFirst({
         where: eq(users.stripe_customer_id, customerId)
     });
     userId = existingUser?.id;
  }

  if (userId) {
      await db.update(users)
        .set({
            subscription_status: status,
            subscription_tier: tier,
            stripe_subscription_id: subscription.id,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString() as any, // Drizzle timestamp mode string/date
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString() as any,
            cancel_at_period_end: subscription.cancel_at_period_end,
            stripe_customer_id: customerId // Ensure it's set
        })
        .where(eq(users.id, userId));
      
      logInfo(`Updated subscription for user ${userId} to ${tier} (${status})`);
  } else {
      logError(`User not found for subscription ${subscription.id} (Customer: ${customerId})`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    
    // Downgrade to free
    const result = await db.update(users)
        .set({
            subscription_status: 'canceled',
            subscription_tier: 'free',
            current_period_end: new Date().toISOString() as any, // Ends now
            cancel_at_period_end: false
        })
        .where(eq(users.stripe_customer_id, customerId))
        .returning({ id: users.id });

    if (result.length > 0) {
        logInfo(`Subscription deleted for customer ${customerId}, downgraded to free`);
    } else {
        logError(`Failed to downgrade user after subscription deletion: Customer ${customerId} not found`);
    }
}

async function handlePaymentFailed(subscriptionId: string, customerId: string) {
     // Mark as past_due or similar
     await db.update(users)
        .set({
            subscription_status: 'past_due'
        })
        .where(eq(users.stripe_customer_id, customerId));
        
     logInfo(`Payment failed for customer ${customerId}`);
}
