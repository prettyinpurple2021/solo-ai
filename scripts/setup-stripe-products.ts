
import 'dotenv/config';
import Stripe from 'stripe';

/**
 * Creates Stripe Products/Prices for paid tiers that match the app:
 * @see src/lib/pricing.ts (SUBSCRIPTION_TIERS, PRICE_IDS)
 * @see src/lib/subscription-utils.ts (TIERS: free, launch, accelerator, dominator)
 *
 * Env vars the Next.js app reads: STRIPE_ACCELERATOR_PRICE_ID, STRIPE_DOMINATOR_PRICE_ID
 * (and optional yearly: STRIPE_*_YEARLY_PRICE_ID).
 *
 * Legacy names solo/pro/agency are not used by checkout or webhooks.
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover' as any,
});

async function setupProducts() {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('❌ STRIPE_SECRET_KEY is missing in .env.local');
        return;
    }

    console.log('🔄 Setting up Stripe products (Accelerator + Dominator, monthly)...');

    const products = [
        {
            name: 'SoloSuccess AI — Accelerator',
            description: 'Pro-agents, expanded limits, and growth tooling for serious founders.',
            price: 1900, // $19.00 — matches src/lib/pricing.ts ACCELERATOR.price
            currency: 'usd',
            interval: 'month',
            key: 'accelerator'
        },
        {
            name: 'SoloSuccess AI — Dominator',
            description: 'Full squad, war room, and maximum limits.',
            price: 2900, // $29.00 — matches src/lib/pricing.ts DOMINATOR.price
            currency: 'usd',
            interval: 'month',
            key: 'dominator'
        }
    ];

    const results: Record<string, string> = {};

    for (const p of products) {
        try {
            console.log(`Creating product: ${p.name}...`);
            const product = await stripe.products.create({
                name: p.name,
                description: p.description,
            });

            console.log(`Creating price for ${p.name}...`);
            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: p.price,
                currency: p.currency,
                recurring: {
                    interval: p.interval as any
                }
            });

            console.log(`✅ Created ${p.name}: Product ID: ${product.id}, Price ID: ${price.id}`);
            results[p.key] = price.id;
        } catch (error) {
            console.error(`❌ Failed to create ${p.name}:`, error);
        }
    }

    console.log('\n--- Copy into .env / deployment (see src/lib/pricing.ts) ---');
    console.log(`STRIPE_ACCELERATOR_PRICE_ID=${results.accelerator ?? ''}`);
    console.log(`STRIPE_DOMINATOR_PRICE_ID=${results.dominator ?? ''}`);
    console.log('\nOptional yearly prices: create in Stripe Dashboard, then set:');
    console.log('# STRIPE_ACCELERATOR_YEARLY_PRICE_ID=price_...');
    console.log('# STRIPE_DOMINATOR_YEARLY_PRICE_ID=price_...');
}

setupProducts();
