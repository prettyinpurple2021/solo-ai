
import { Request, Response, NextFunction } from 'express';
import { UsageTracker, SubscriptionTier, UsageMetric } from '../utils/usage-tracker';
import { logWarn } from '../utils/logger';

// Helper to extract user ID (assuming auth middleware ran first)
const getUserId = (req: Request): string | null => {
    // This logic duplicates index.ts but is needed for isolated middleware testing references
    // Ideally, we'd attach user to req in index.ts
    // For now, let's rely on the token logic or expect req.user might be set if we refactor.
    // Given the current index.ts, we need to re-parse.
    // BUT index.ts has getUserId helper but doesn't export it. 
    // Let's assume we will check headers directly or improved pattern.
    
    // RE-IMPLEMENTATION of getUserId logic for middleware
    const { verifyToken } = require('../utils/jwt');
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (decoded) return decoded.userId;
    }
    const stackUserId = req.headers['x-stack-user-id'] as string;
    return stackUserId || null;
};

// Hierarchy of tiers for comparison
export const TIER_LEVELS: Record<SubscriptionTier, number> = {
    free: 0,
    launchpad: 1,
    accelerator: 2,
    dominator: 3
};

export const requireSubscription = (minTier: SubscriptionTier) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const currentTier = await UsageTracker.getUserTier(userId) as SubscriptionTier;
            
            if (TIER_LEVELS[currentTier] < TIER_LEVELS[minTier]) {
                logWarn(`Access denied: User ${userId} is ${currentTier}, needed ${minTier}`);
                return res.status(403).json({ 
                    error: 'Premium subscription required',
                    requiredTier: minTier,
                    currentTier: currentTier
                });
            }

            next();
        } catch (error) {
            console.error('Subscription middleware error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

export const checkUsage = (metric: UsageMetric, cost: number = 1) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = getUserId(req);
            if (!userId) {
                // If checking usage, we generally imply checking valid user
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const allowed = await UsageTracker.checkLimit(userId, metric, cost);
            if (!allowed) {
                logWarn(`Usage limit exceeded: User ${userId} for ${metric}`);
                return res.status(402).json({ 
                    error: 'Usage limit exceeded',
                    metric: metric
                });
            }

            // Note: We don't increment here. The controller should increment upon success.
            // Or we can have a mode to increment upfront.
            // For now, just Check.
            next();
        } catch (error) {
            console.error('Usage middleware error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};
