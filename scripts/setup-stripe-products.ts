
import 'dotenv/config';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover' as any,
});

async function setupProducts() {
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('❌ STRIPE_SECRET_KEY is missing in .env.local');
        return;
    }

    console.log('🔄 Setting up Stripe products...');

    const products = [
        {
            name: 'SoloSuccess AI - Solo',
            description: 'For the side-hustler. Includes 50 saved items, unlimited AI text, and 5 competitors.',
            price: 2900, // $29.00
            currency: 'usd',
            interval: 'month',
            key: 'solo'
        },
        {
            name: 'SoloSuccess AI - Pro',
            description: 'For the full-time founder. Includes unlimited storage, AI text, and 15 competitors.',
            price: 4900, // $49.00
            currency: 'usd',
            interval: 'month',
            key: 'pro'
        },
        {
            name: 'SoloSuccess AI - Agency',
            description: 'For power users & teams. Unlimited everything and API access.',
            price: 9900, // $99.00
            currency: 'usd',
            interval: 'month',
            key: 'agency'
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

    console.log('\n--- NEW PRICE IDs (Copy these to your .env.local and Railway) ---');
    console.log(`STRIPE_SOLO_PRICE_ID=${results.solo}`);
    console.log(`STRIPE_PRO_PRICE_ID=${results.pro}`);
    console.log(`STRIPE_AGENCY_PRICE_ID=${results.agency}`);
    console.log(`NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID=${results.solo}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${results.pro}`);
    console.log(`NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID=${results.agency}`);
}

setupProducts();
