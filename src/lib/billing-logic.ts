import { db } from "@/db"; // Use the Next.js alias for shared code
import { logError } from "@/lib/logger";
import { users, briefcases } from "@/db/schema";
import { competitorProfiles } from "@/db/schema/intelligence";
import { eq, count } from "drizzle-orm";

// Tier limits for feature gating (Synced with server/routes/stripe.ts)
export const TIER_LIMITS = {
    free: {
        businesses: 1, // Mapped to Briefcases
        storage: 5,
        aiGenerations: 10,
        conversations: 10,
        agents: 1,
        automations: 0,
        teamMembers: 1,
        competitors: 1,
        features: ['core', 'view_only']
    },
    solo: {
        businesses: 1,
        storage: 50,
        aiGenerations: -1, // Unlimited
        conversations: 100,
        agents: 3,
        automations: 5,
        teamMembers: 1,
        competitors: 5,
        features: ['core', 'agents', 'basic_tools', 'advanced_tools']
    },
    pro: {
        businesses: 3,
        storage: -1, // Unlimited
        aiGenerations: -1,
        conversations: -1,
        agents: 8,
        automations: 20,
        teamMembers: 3,
        competitors: 15,
        features: ['core', 'agents', 'basic_tools', 'advanced_tools', 'email_integration', 'forecasting']
    },
    agency: {
        businesses: -1, // Unlimited
        storage: -1,
        aiGenerations: -1,
        conversations: -1,
        agents: -1,
        automations: -1,
        teamMembers: -1,
        competitors: 50,
        features: ['all', 'api_access', 'team_collaboration', 'whitelabel', 'custom_training']
    }
};

export type Tier = keyof typeof TIER_LIMITS;

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: number | string): Promise<Tier> {
    try {
        // NextAuth ID is string (UUID for this project), no need to parse if DB uses text
        const id = userId.toString();
        
        const user = await db.select({
            tier: users.subscription_tier,
            status: users.subscription_status
        })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        // If no user or not active, return free
        if (!user.length || user[0].status !== 'active') {
            return 'free';
        }

        const tier = user[0].tier as Tier;
        return TIER_LIMITS[tier] ? tier : 'free';
    } catch (error) {
        logError('Error fetching user tier', { error, userId });
        return 'free';
    }
}

/**
 * Check if user can access a feature
 */
export async function canAccessFeature(userId: number | string, feature: string): Promise<boolean> {
    const tier = await getUserTier(userId);
    const limits = TIER_LIMITS[tier];

    if (!limits) return false;

    return limits.features.includes(feature) || limits.features.includes('all');
}

/**
 * Check if user has reached a usage limit
 * @param resource - 'businesses' | 'competitors'
 */
export async function hasReachedLimit(userId: number | string, resource: 'businesses' | 'competitors'): Promise<boolean> {
    const tier = await getUserTier(userId);
    const limits = TIER_LIMITS[tier];
    const limit = limits[resource]; // TS might complain if resource key isn't keyof TierLimits

    if (limit === -1) return false;

    const id = userId.toString();
    try {
        let currentCount = 0;

        if (resource === 'businesses') {
            const result = await db.select({ count: count() }).from(briefcases).where(eq(briefcases.user_id, id));
            currentCount = result[0].count;
        } else if (resource === 'competitors') {
            const result = await db.select({ count: count() }).from(competitorProfiles).where(eq(competitorProfiles.user_id, id));
            currentCount = result[0].count;
        }

        return currentCount >= limit;
    } catch (error) {
        logError(`Error checking limits for ${resource}`, { error, userId, resource });
        return true; // Fail safe
    }
}
