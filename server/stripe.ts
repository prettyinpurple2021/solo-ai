// Stripe Integration Setup
import Stripe from 'stripe';
import { db } from './db';
import { subscriptions, usageTracking, pitchDecks, competitorReports, businessContext, contacts } from './db/schema';
import { eq, and, count } from 'drizzle-orm';

// Initialize Stripe with secret key from environment
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-11-17.clover',
});

// Price IDs for each tier
export const PRICE_IDS = {
    free: '', // Free tier has no price ID
    solo: process.env.STRIPE_SOLO_PRICE_ID || '',
    pro: process.env.STRIPE_PRO_PRICE_ID || '',
    agency: process.env.STRIPE_AGENCY_PRICE_ID || '',
};

// Monthly prices for MRR calculation (in USD)
export const TIER_PRICES = {
    free: 0,
    solo: 29,
    pro: 79,
    agency: 199
};

// Tier limits for feature gating
export const TIER_LIMITS = {
    free: {
        businesses: 1,
        storage: 5, // Total saved items
        aiGenerations: 10, // Daily limit (soft cap)
        competitors: 1,
        features: ['core', 'view_only']
    },
    solo: {
        businesses: 1,
        storage: 50,
        aiGenerations: -1, // Unlimited
        competitors: 5,
        features: ['core', 'agents', 'basic_tools', 'advanced_tools']
    },
    pro: {
        businesses: 3,
        storage: -1, // Unlimited
        aiGenerations: -1,
        competitors: 15,
        features: ['core', 'agents', 'basic_tools', 'advanced_tools', 'email_integration', 'forecasting']
    },
    agency: {
        businesses: -1,
        storage: -1,
        aiGenerations: -1,
        competitors: 50,
        features: ['all', 'api_access', 'team_collaboration', 'whitelabel', 'custom_training']
    }
};

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: number): Promise<keyof typeof TIER_LIMITS> {
    try {
        const sub = await db.select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId))
            .limit(1);

        // If no subscription or not active, return free
        if (!sub.length || sub[0].status !== 'active') {
            return 'free';
        }

        // Map old tiers to new ones if necessary, or just return the tier
        // Assuming database migration or manual update will handle 'starter' -> 'free' etc if needed
        // For now, we trust the DB value matches one of our keys, or fallback to free
        const tier = sub[0].tier as keyof typeof TIER_LIMITS;
        return TIER_LIMITS[tier] ? tier : 'free';
    } catch (error) {
        console.error('Error fetching user tier:', error);
        return 'free';
    }
}

/**
 * Check if user can access a feature
 */
export async function canAccessFeature(userId: number, feature: string): Promise<boolean> {
    const tier = await getUserTier(userId);
    const limits = TIER_LIMITS[tier];

    if (!limits) return false;

    return limits.features.includes(feature) || limits.features.includes('all');
}

/**
 * Get current storage usage (Total items)
 */
async function getStorageUsage(userId: number): Promise<number> {
    try {
        // Count items in various tables
        // 1. Pitch Decks
        const [decks] = await db.select({ count: count() })
            .from(pitchDecks)
            .where(eq(pitchDecks.userId, userId));

        // 2. Competitor Reports
        // Note: userId in competitorReports is text, but we are passing number. 
        // We need to cast or ensure consistency. Schema says userId is text.
        // Let's assume we need to convert userId to string for these queries if schema is text.
        // Schema check: 
        // pitchDecks.userId -> integer
        // competitorReports.userId -> text
        // businessContext.userId -> text
        // contacts.userId -> integer

        // This inconsistency is annoying. We should handle it.
        const userIdStr = userId.toString();

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
        console.error('Error calculating storage:', error);
        return 0;
    }
}

/**
 * Check if user has exceeded usage limits
 */
export async function checkUsageLimit(
    userId: number,
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

        // For businesses and competitors, we should check actual DB count too, 
        // but for now we'll stick to usageTracking for AI gens and consistency
        // Actually, for 'businesses' and 'competitors', checking DB count is more accurate than usageTracking
        // usageTracking is good for 'events' like AI generations.

        if (type === 'businesses') {
            const userIdStr = userId.toString();
            const [countRes] = await db.select({ count: count() })
                .from(businessContext)
                .where(eq(businessContext.userId, userIdStr));
            const current = countRes?.count || 0;
            return { allowed: current < limit, limit, current };
        }

        if (type === 'competitors') {
            const userIdStr = userId.toString();
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
        console.error('Error checking usage limit:', error);
        // On error, allow the action to prevent blocking users
        return { allowed: true, limit: -1, current: 0 };
    }
}

/**
 * Increment usage counter (Only for event-based limits like AI Generations)
 */
export async function incrementUsage(
    userId: number,
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
        console.error('Error incrementing usage:', error);
    }
}

