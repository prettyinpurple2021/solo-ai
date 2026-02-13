import express from 'express';
import { stripe, PRICE_IDS } from '../stripe';
import { db } from '../db';
import { subscriptions, users, usageTracking } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logError, logInfo } from '../utils/logger';

const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { priceId, userId } = req.body;

        if (!priceId || !userId) {
            return res.status(400).json({ error: 'Missing priceId or userId' });
        }

        // Get user email
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: user[0].email || undefined,
            client_reference_id: userId.toString(),
            success_url: `${CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CLIENT_URL}/pricing`,
            metadata: {
                userId: userId.toString(),
            }
        });

        return res.json({ url: session.url });
    } catch (error: any) {
        logError('Stripe Checkout Error', error);
        return res.status(500).json({ error: error.message });
    }
});

// Get Subscription Status
router.get('/subscription', async (req, res) => {
    try {
        const userId = (req.headers['x-user-id'] || req.query.userId) as string;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const sub = await db.select().from(subscriptions)
            .where(eq(subscriptions.userId, userId))
            .limit(1);

        if (!sub.length) {
            return res.json({ tier: 'free', status: 'active' });
        }

        return res.json(sub[0]);
    } catch (error) {
        logError('Error fetching subscription', error);
        return res.status(500).json({ error: 'Failed to fetch subscription' });
    }
});

// Get Usage Statistics
router.get('/usage', async (req, res) => {
    try {
        const userId = (req.headers['x-user-id'] || req.query.userId) as string;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get current month in format YYYY-MM
        const currentMonth = new Date().toISOString().slice(0, 7);

        const usage = await db.select().from(usageTracking)
            .where(
                eq(usageTracking.userId, userId)
            )
            .limit(1);

        if (!usage.length) {
            return res.json({
                aiGenerations: 0,
                competitorsTracked: 0,
                businessProfiles: 1
            });
        }

        return res.json(usage[0]);
    } catch (error) {
        logError('Error fetching usage', error);
        return res.status(500).json({ error: 'Failed to fetch usage' });
    }
});

// Create Customer Portal Session
router.post('/customer-portal', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        // Get customer ID from subscription
        const sub = await db.select().from(subscriptions)
            .where(eq(subscriptions.userId, userId))
            .limit(1);

        if (!sub.length || !sub[0].stripeCustomerId) {
            return res.status(404).json({ error: 'No subscription found' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: sub[0].stripeCustomerId,
            return_url: `${CLIENT_URL}/app`,
        });

        return res.json({ url: session.url });
    } catch (error: any) {
        logError('Customer Portal Error', error);
        return res.status(500).json({ error: error.message });
    }
});

// Webhook Handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (!sig || !endpointSecret) throw new Error('Missing signature or secret');
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
        logError(`Webhook Error: ${err.message}`, err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleCheckoutCompleted(session);
            break;
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            await handleSubscriptionUpdated(subscription);
            break;
        default:
            logInfo(`Unhandled event type ${event.type}`);
    }

    return res.send();
});

async function handleCheckoutCompleted(session: any) {
    const userId = session.client_reference_id; // already string
    const subscriptionId = session.subscription;
    const customerId = session.customer;

    // Retrieve subscription to get the price ID (to determine tier)
    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
    const priceId = subscription.items.data[0].price.id;

    let tier = 'free';
    if (priceId === PRICE_IDS.solo) tier = 'solo';
    if (priceId === PRICE_IDS.pro) tier = 'pro';
    if (priceId === PRICE_IDS.agency) tier = 'agency';

    // Update or Insert Subscription
    // Check if exists
    const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));

    if (existing.length) {
        await db.update(subscriptions)
            .set({
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                stripePriceId: priceId,
                tier: tier,
                status: 'active',
                currentPeriodEnd: new Date(subscription.current_period_end * 1000)
            })
            .where(eq(subscriptions.userId, userId));
    } else {
        await db.insert(subscriptions).values({
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            tier: tier,
            status: 'active',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        });
    }
}

async function handleSubscriptionUpdated(subscription: any) {
    const subscriptionId = subscription.id;
    const status = subscription.status;
    const priceId = subscription.items.data[0].price.id;

    let tier = 'free';
    if (status === 'active') {
        if (priceId === PRICE_IDS.solo) tier = 'solo';
        if (priceId === PRICE_IDS.pro) tier = 'pro';
        if (priceId === PRICE_IDS.agency) tier = 'agency';
    }

    await db.update(subscriptions)
        .set({
            status: status,
            tier: tier,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
}

export default router;
