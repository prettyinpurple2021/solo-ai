// Stripe Integration Setup
import Stripe from 'stripe';
import { db } from './db';
import { subscriptions, users } from '../src/lib/shared/db/schema';
import { eq } from 'drizzle-orm';
import { logError } from './utils/logger';

// Initialize Stripe with secret key from environment
export const stripe = new (Stripe as any)(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover' as any,
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

// Tier limits for feature gating
export const TIER_LIMITS = {
    launch: {
        businesses: 1,
        storage: 5, // Total saved items
        aiGenerations: 10, // Daily limit (soft cap)
        competitors: 1,
        features: ['core', 'view_only']
    },
    accelerator: {
        businesses: 3,
        storage: 50,
        aiGenerations: -1, // Unlimited
        competitors: 5,
        features: ['core', 'agents', 'basic_tools', 'advanced_tools']
    },
    dominator: {
        businesses: -1,
        storage: -1, // Unlimited
        aiGenerations: -1,
        competitors: 50,
        features: ['all', 'api_access', 'team_collaboration', 'whitelabel', 'custom_training']
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

        // If no user found or tier is missing, return launch
        if (!user.length || !user[0].tier) {
            return 'launch';
        }

        const tier = user[0].tier as keyof typeof TIER_LIMITS;
        return TIER_LIMITS[tier] ? tier : 'launch';
    } catch (error) {
        logError('Error fetching user tier', error);
        return 'launch';
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
