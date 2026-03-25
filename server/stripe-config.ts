// Stripe Integration Setup
import Stripe from 'stripe';
import { db } from './db';
import { subscriptions, users } from '../src/lib/shared/db/schema';
import { eq } from 'drizzle-orm';
import { logError } from './utils/logger';

let stripeClient: InstanceType<typeof Stripe> | null = null;

function getStripeClient(): InstanceType<typeof Stripe> {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set');
    }
    if (!stripeClient) {
        stripeClient = new (Stripe as any)(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-12-15.clover' as any,
        });
    }
    return stripeClient!;
}

// Lazy proxy so importing this module never crashes at startup when STRIPE_SECRET_KEY is absent.
// The error is only thrown when a stripe method is actually called.
export const stripe = new Proxy({} as InstanceType<typeof Stripe>, {
    get(_target, prop) {
        return Reflect.get(getStripeClient() as object, prop);
    },
});

// Price IDs for each tier
export const PRICE_IDS = {
    launch: {
        monthly: '',
        yearly: ''
    },
    accelerator: {
        monthly: process.env.STRIPE_ACCELERATOR_PRICE_ID || '',
        yearly: process.env.STRIPE_ACCELERATOR_YEARLY_PRICE_ID || ''
    },
    dominator: {
        monthly: process.env.STRIPE_DOMINATOR_PRICE_ID || '',
        yearly: process.env.STRIPE_DOMINATOR_YEARLY_PRICE_ID || ''
    }
};

// Tier limits for feature gating (Synchronized with src/lib/subscription-utils.ts)
export const TIER_LIMITS = {
    free: {
        businesses: 1,
        storage: 50 * 1024 * 1024, // 50MB
        aiGenerations: 10, // Daily limit
        competitors: 0,
        features: ['core']
    },
    launch: {
        businesses: 1,
        storage: 50 * 1024 * 1024, // 50MB
        aiGenerations: 10, // Daily limit
        competitors: 1,
        features: ['core', 'view_only']
    },
    accelerator: {
        businesses: 3,
        storage: 1024 * 1024 * 1024, // 1GB
        aiGenerations: 100, // Daily limit
        competitors: 5,
        features: ['core', 'agents', 'basic_tools', 'advanced_tools', 'idea_incinerator', 'tactical_roadmap']
    },
    dominator: {
        businesses: -1,
        storage: 100 * 1024 * 1024 * 1024, // 100GB
        aiGenerations: -1, // Unlimited
        competitors: 50,
        features: ['all', 'api_access', 'team_collaboration', 'whitelabel', 'custom_training', 'war_room', 'ironclad', 'boardroom']
    }
};

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: string): Promise<keyof typeof TIER_LIMITS> {
    try {
        const user = await db.select({ tier: users.subscription_tier })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        // If no user found or tier is missing, return free
        if (!user.length || !user[0].tier) {
            return 'free';
        }

        const tier = user[0].tier as keyof typeof TIER_LIMITS;
        return TIER_LIMITS[tier] ? tier : 'free';
    } catch (error) {
        logError('Error fetching user tier', error);
        return 'free';
    }
}

/**
 * Check if user can access a feature
 */
export async function canAccessFeature(userId: string, feature: string): Promise<boolean> {
    const tier = await getUserTier(userId);
    const limits = TIER_LIMITS[tier];

    if (!limits) return false;

    return limits.features.includes(feature) || limits.features.includes('all');
}

// Functions removed as they are unused and rely on incorrect schema usage. 
// See server/utils/usage-tracker.ts for actual usage tracking implementation.
