
import { Request, Response, NextFunction } from 'express';
import { UsageTracker, SubscriptionTier, UsageMetric } from '../utils/usage-tracker';
import { logWarn, logError } from '../utils/logger';
import { getUserId } from '../utils/auth';

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
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const currentTier = await UsageTracker.getUserTier(userId) as SubscriptionTier;
            
            if (TIER_LEVELS[currentTier] < TIER_LEVELS[minTier]) {
                logWarn(`Access denied: User ${userId} is ${currentTier}, needed ${minTier}`);
                res.status(403).json({ 
                    error: 'Premium subscription required',
                    requiredTier: minTier,
                    currentTier: currentTier
                });
                return;
            }

            next();
        } catch (error) {
            logError('Subscription middleware error', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
    };
};

export const checkUsage = (metric: UsageMetric, cost: number = 1) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = getUserId(req);
            if (!userId) {
                // If checking usage, we generally imply checking valid user
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const allowed = await UsageTracker.checkLimit(userId, metric, cost);
            if (!allowed) {
                logWarn(`Usage limit exceeded: User ${userId} for ${metric}`);
                res.status(402).json({ 
                    error: 'Usage limit exceeded',
                    metric: metric
                });
                return;
            }

            // Note: We don't increment here. The controller should increment upon success.
            // Or we can have a mode to increment upfront.
            // For now, just Check.
            next();
        } catch (error) {
            logError('Usage middleware error', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
    };
};
