import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../../lib/shared/db/schema';
import { eq } from 'drizzle-orm';

import { logError } from '../utils/logger';

/**
 * Middleware to check if user account is suspended
 * Should be applied after authMiddleware
 */
export const checkSuspended = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const user = await db.select({
            suspended: users.suspended,
            suspendedReason: users.suspendedReason
        })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user.length) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user[0].suspended) {
            res.status(403).json({
                error: 'Account suspended',
                reason: user[0].suspendedReason || 'Your account has been suspended. Please contact support.'
            });
            return;
        }

        next();
    } catch (error) {
        logError('Error checking suspension status', error);
        res.status(500).json({ error: 'Failed to verify account status' });
        return;
    }
};
