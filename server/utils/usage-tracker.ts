
import { Redis } from '@upstash/redis';
import { db } from '../db';
import { users } from '../../lib/shared/db/schema';
import { eq } from 'drizzle-orm';
import { logError } from './logger';

// Initialize Redis (using the same env vars as index.ts)
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export type UsageMetric = 'conversations' | 'storage' | 'aiGenerations';
export type SubscriptionTier = 'free' | 'launchpad' | 'accelerator' | 'dominator';

// Define limits (Source of Truth matches Frontend)
const TIER_LIMITS: Record<SubscriptionTier, Record<UsageMetric, number>> = {
    free: { conversations: 10, storage: 50 * 1024 * 1024, aiGenerations: 10 }, // 50MB
    launchpad: { conversations: 100, storage: 500 * 1024 * 1024, aiGenerations: 100 }, // 500MB (Solo)
    accelerator: { conversations: 500, storage: 1 * 1024 * 1024 * 1024, aiGenerations: 500 }, // 1GB (Pro)
    dominator: { conversations: -1, storage: 100 * 1024 * 1024 * 1024, aiGenerations: -1 } // 100GB (Agency)
};

// Helper to normalized tier names from DB (which might be mixed case or mapped differently)
function normalizeTier(tier: string | null): SubscriptionTier {
    if (!tier) return 'free';
    const t = tier.toLowerCase();
    if (t === 'solo') return 'launchpad';
    if (t === 'pro') return 'accelerator';
    if (t === 'agency') return 'dominator';
    if (['launchpad', 'accelerator', 'dominator'].includes(t)) return t as SubscriptionTier;
    return 'free';
}

export class UsageTracker {
    
    static async getUserTier(userId: string): Promise<SubscriptionTier> {
        // Try cache first
        const cacheKey = `user:tier:${userId}`;
        const cached = await redis.get<string>(cacheKey);
        if (cached) return cached as SubscriptionTier;

        try {
            const user = await db.select({ tier: users.subscription_tier }).from(users).where(eq(users.id, userId)).limit(1);
            const tier = normalizeTier(user[0]?.tier || 'free');
            
            // Cache for 10 minutes
            await redis.setex(cacheKey, 600, tier);
            return tier;
        } catch (error) {
            logError('Failed to get user tier', error);
            return 'free'; // Default to free on error
        }
    }

    static async getUsage(userId: string, metric: UsageMetric): Promise<number> {
        const key = this.getDailyKey(userId, metric);
        if (metric === 'storage') {
            // Storage is persistent, not daily
            const storageKey = `usage:storage:${userId}`;
            const usage = await redis.get<number>(storageKey);
            return usage || 0;
        }
        const usage = await redis.get<number>(key);
        return usage || 0;
    }

    static async incrementUsage(userId: string, metric: UsageMetric, amount: number = 1): Promise<number> {
        const tier = await this.getUserTier(userId);
        const limit = TIER_LIMITS[tier][metric];

        if (limit !== -1) {
            const currentusage = await this.getUsage(userId, metric);
            if (currentusage + amount > limit) {
                throw new Error(`Usage limit exceeded for ${metric}.`);
            }
        }

        if (metric === 'storage') {
            const storageKey = `usage:storage:${userId}`;
            return await redis.incrby(storageKey, amount);
        } else {
            const key = this.getDailyKey(userId, metric);
            const newValue = await redis.incrby(key, amount);
            // Set expire if new key (24 hours + buffer)
            if (newValue === amount) {
                await redis.expire(key, 86400 + 3600);
            }
            return newValue;
        }
    }

    static async checkLimit(userId: string, metric: UsageMetric, projectedAmount: number = 0): Promise<boolean> {
        const tier = await this.getUserTier(userId);
        const limit = TIER_LIMITS[tier][metric];
        
        if (limit === -1) return true; // Unlimited

        const currentUsage = await this.getUsage(userId, metric);
        return (currentUsage + projectedAmount) <= limit;
    }

    private static getDailyKey(userId: string, metric: string): string {
        const date = new Date().toISOString().split('T')[0];
        return `usage:${userId}:${metric}:${date}`;
    }
}
