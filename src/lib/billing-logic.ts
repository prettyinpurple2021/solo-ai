import { db } from "@/db"; // Use the Next.js alias for shared code
import { subscriptions, usageTracking, pitchDecks, competitorReports, businessContext, contacts } from "@/db/schema"; // Use shared schema import
import { eq, and, count } from "drizzle-orm";

// Tier limits for feature gating (Synced with server/routes/stripe.ts)
// TODO: Ideally this config should be in a shared config file or DB
export const TIER_LIMITS = {
    free: {
        businesses: 1,
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
        // Ensure valid integer ID if possible, though schema might use string or int depending on setup
        // NextAuth ID is string, but our DB `users.id` is serial (int). 
        // We need to handle parsing safely.
        const id = typeof userId === 'string' ? parseInt(userId) : userId;
        
        if (isNaN(id)) return 'free';

        const sub = await db.select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, id))
            .limit(1);

        // If no subscription or not active, return free
        if (!sub.length || sub[0].status !== 'active') {
            return 'free';
        }

        const tier = sub[0].tier as Tier;
        return TIER_LIMITS[tier] ? tier : 'free';
    } catch (error) {
        console.error('Error fetching user tier:', error);
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
