import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { users } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { logInfo, logError } from '@/lib/logger';
import type { Stripe } from 'stripe';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is missing');
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        logError('Webhook signature verification failed', { error: error.message });
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Idempotency check using webhook_events table if it exists, or simple log
    logInfo(`Processing webhook event: ${event.type}`, { id: event.id });

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(session);
                break;
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionChange(event.data.object as Stripe.Subscription);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object as Stripe.Invoice);
                break;
            default:
                // Unhandled event type
        }
    } catch (error: any) {
        logError('Error processing webhook', { type: event.type, error: error.message });
        return new NextResponse('Webhook handler failed', { status: 500 });
    }

    return new NextResponse('Received', { status: 200 });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
     if (!session.metadata?.userId) {
        logError('Webhook: No userId in session metadata', { sessionId: session.id });
        return;
    }
    // Logic to update user subscription status or credits
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
    // Sync subscription status, tier, current_period_end to DB
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    const priceId = subscription.items.data[0].price.id;
    // Map priceId to tier... (simplified logic here)
    let tier = 'free';
    // Add mapping logic if needed

    await db.update(users)
        .set({
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            subscription_tier: tier,
            subscription_status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000)
        })
        .where(eq(users.id, userId));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    await db.update(users)
        .set({
            subscription_tier: 'free',
            subscription_status: 'canceled',
            current_period_end: new Date(subscription.current_period_end * 1000)
        })
        .where(eq(users.id, userId));
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;
    if (!subscriptionId) return;

    // We might want to mark user as past_due
    await db.update(users)
        .set({ subscription_status: 'past_due' })
        .where(eq(users.stripe_subscription_id, subscriptionId));
}
