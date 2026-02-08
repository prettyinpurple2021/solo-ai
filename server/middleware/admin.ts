// Admin Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, adminActions } from '../db/schema';
import { eq } from 'drizzle-orm';

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            userId?: string;
            userRole?: string;
        }
    }
}

/**
 * Middleware to require admin access
 * Must be used after requireAuth middleware
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });

        if (!user || user.role !== 'admin') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        req.userRole = user.role;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
}

/**
 * Verify admin PIN for secure admin operations
 */
export async function verifyAdminPin(email: string, pin: string): Promise<boolean> {
    try {
        // Only allow specific admin email
        if (email !== 'support@solosuccessai.fun') {
            return false;
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!user || !user.adminPinHash) {
            return false;
        }

        // Compare PIN with stored hash
        return await bcrypt.compare(pin, user.adminPinHash);
    } catch (error) {
        console.error('PIN verification error:', error);
        return false;
    }
}

/**
 * Hash admin PIN for storage
 */
export async function hashAdminPin(pin: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(pin, saltRounds);
}

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(
    adminUserId: string,
    action: string,
    targetUserId?: string,
    details?: any
) {
    try {
        await db.insert(adminActions).values({
            adminUserId,
            action,
            targetUserId,
            details
        });
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
}
