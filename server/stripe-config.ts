// Stripe Integration Setup
import Stripe from 'stripe';
import { db } from './db';
import { subscriptions, usageTracking, pitchDecks, competitorReports, businessContext, contacts } from '../lib/shared/db/schema';
import { eq, and, count } from 'drizzle-orm';
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
        const sub = await db.select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId))
            .limit(1);

        // If no subscription or not active, return launch
        if (!sub.length || sub[0].status !== 'active') {
            return 'launch';
        }

        // Map old tiers to new ones if necessary
        // Default to 'launch' if tier is unrecognized or inactive
        const tier = sub[0].tier as keyof typeof TIER_LIMITS;
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

/**
 * Get current storage usage (Total items)
 */
async function getStorageUsage(userId: string): Promise<number> {
    try {
        // Count items in various tables
        const [decks] = await db.select({ count: count() })
            .from(pitchDecks)
            .where(eq(pitchDecks.userId, userId));

        // userId is already string
        const userIdStr = userId;

        const [reports] = await db.select({ count: count() })
            .from(competitorReports)
            .where(eq(competitorReports.userId, userIdStr));

        const [businesses] = await db.select({ count: count() })
            .from(businessContext)
            .where(eq(businessContext.userId, userIdStr));

        const [contactList] = await db.select({ count: count() })
            .from(contacts)
            .where(eq(contacts.userId, userId));

        return (decks?.count || 0) + (reports?.count || 0) + (businesses?.count || 0) + (contactList?.count || 0);
    } catch (error) {
        logError('Error calculating storage', error);
        return 0;
    }
}

/**
 * Check if user has exceeded usage limits
 */
export async function checkUsageLimit(
    userId: string,
    type: 'aiGenerations' | 'competitors' | 'businesses' | 'storage'
): Promise<{ allowed: boolean; limit: number; current: number }> {
    try {
        const tier = await getUserTier(userId);
        const limits = TIER_LIMITS[tier];

        // Handle Storage separately
        if (type === 'storage') {
            const limit = limits.storage;
            if (limit === -1) return { allowed: true, limit: -1, current: 0 };

            const current = await getStorageUsage(userId);
            return {
                allowed: current < limit,
                limit,
                current
            };
        }

        const limit = limits[type];

        // -1 means unlimited
        if (limit === -1) {
            return { allowed: true, limit: -1, current: 0 };
        }

        // Check specific resource counts
        if (type === 'businesses') {
            const userIdStr = userId;
            const [countRes] = await db.select({ count: count() })
                .from(businessContext)
                .where(eq(businessContext.userId, userIdStr));
            const current = countRes?.count || 0;
            return { allowed: current < limit, limit, current };
        }

        if (type === 'competitors') {
            const userIdStr = userId;
            const [countRes] = await db.select({ count: count() })
                .from(competitorReports)
                .where(eq(competitorReports.userId, userIdStr));
            const current = countRes?.count || 0;
            return { allowed: current < limit, limit, current };
        }

        // For AI Generations, use usageTracking
        const month = new Date().toISOString().slice(0, 7);
        let usage = await db.select()
            .from(usageTracking)
            .where(
                and(
                    eq(usageTracking.userId, userId),
                    eq(usageTracking.month, month)
                )
            )
            .limit(1);

        if (!usage.length) {
            // Initialize if empty
            const [newUsage] = await db.insert(usageTracking)
                .values({
                    userId,
                    month,
                    aiGenerations: 0,
                    competitorsTracked: 0,
                    businessProfiles: 0
                })
                .returning();
            usage = [newUsage];
        }

        const current = usage[0].aiGenerations || 0;

        return {
            allowed: current < limit,
            limit,
            current
        };
    } catch (error) {
        logError('Error checking usage limit', error);
        // On error, allow the action to prevent blocking users
        return { allowed: true, limit: -1, current: 0 };
    }
}

/**
 * Increment usage counter (Only for event-based limits like AI Generations)
 */
export async function incrementUsage(
    userId: string,
    type: 'aiGenerations'
): Promise<void> {
    try {
        const month = new Date().toISOString().slice(0, 7);

        // Get or create usage record
        let usage = await db.select()
            .from(usageTracking)
            .where(
                and(
                    eq(usageTracking.userId, userId),
                    eq(usageTracking.month, month)
                )
            )
            .limit(1);

        if (usage.length) {
            await db.update(usageTracking)
                .set({ aiGenerations: (usage[0].aiGenerations || 0) + 1 })
                .where(eq(usageTracking.id, usage[0].id));
        } else {
            await db.insert(usageTracking)
                .values({
                    userId,
                    month,
                    aiGenerations: 1,
                    competitorsTracked: 0,
                    businessProfiles: 0
                });
        }
    } catch (error) {
        logError('Error incrementing usage', error);
    }
}
