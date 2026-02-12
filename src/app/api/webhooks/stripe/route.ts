import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStripe, STRIPE_WEBHOOK_EVENTS, SUBSCRIPTION_TIERS } from '@/lib/stripe'
import { db } from '@/db'
import { users } from '@/db/schema'
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

  const session = event.data.object as Stripe.Checkout.Session
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
  // Iterate strictly typed keys if possible or just manual check
  if (Object.values(SUBSCRIPTION_TIERS).find(t => t.stripePriceId === priceId)) {
      tier = Object.values(SUBSCRIPTION_TIERS).find(t => t.stripePriceId === priceId)?.id || 'free';
  } else if (Object.values(SUBSCRIPTION_TIERS).find(t => t.stripeYearlyPriceId === priceId)) {
      tier = Object.values(SUBSCRIPTION_TIERS).find(t => t.stripeYearlyPriceId === priceId)?.id || 'free';
  } else if (priceId === SUBSCRIPTION_TIERS.LAUNCH.stripePriceId || priceId === SUBSCRIPTION_TIERS.ACCELERATOR.stripePriceId || priceId === SUBSCRIPTION_TIERS.DOMINATOR.stripePriceId) {
      // Fallback check
       if (priceId === SUBSCRIPTION_TIERS.ACCELERATOR.stripePriceId) tier = 'accelerator';
       else if (priceId === SUBSCRIPTION_TIERS.DOMINATOR.stripePriceId) tier = 'dominator';
       else tier = 'launch'; 
  }

  // Update user in DB
  // We need to find the user by Stripe Customer ID.
  // If we don't have the customer ID in DB yet (first time), we might have metadata in subscription or we need to look up by email.
  // Best practice: Store stripeCustomerId in user when creating checkout session, OR pass userId in metadata.
  
  let userId = subscription.metadata?.userId;
  
  if (!userId) {
     // Try to find user by stripeCustomerId
     const existingUser = await db.query.users.findFirst({
         where: eq(users.stripeCustomerId, customerId)
     });
     userId = existingUser?.id;
  }

  if (userId) {
      await db.update(users)
        .set({
            subscriptionStatus: status,
            subscriptionTier: tier,
            stripeSubscriptionId: subscription.id,
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            stripeCustomerId: customerId // Ensure it's set
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
    await db.update(users)
        .set({
            subscriptionStatus: 'canceled',
            subscriptionTier: 'free',
            currentPeriodEnd: new Date().toISOString(), // Ends now
            cancelAtPeriodEnd: false
        })
        .where(eq(users.stripeCustomerId, customerId));

    logInfo(`Subscription deleted for customer ${customerId}, downgraded to free`);
}

async function handlePaymentFailed(subscriptionId: string, customerId: string) {
     // Mark as past_due or similar
     await db.update(users)
        .set({
            subscriptionStatus: 'past_due'
        })
        .where(eq(users.stripeCustomerId, customerId));
        
     logInfo(`Payment failed for customer ${customerId}`);
}
