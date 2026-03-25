// Admin Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users, adminActions } from '../../src/lib/shared/db/schema';
import { eq } from 'drizzle-orm';
import { logError } from '../utils/logger';

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
 * The configured admin email — validated at startup so a missing env var
 * surfaces immediately rather than silently disabling admin operations.
 */
const _adminEmail = process.env.ADMIN_EMAIL;
if (!_adminEmail) {
    throw new Error('ADMIN_EMAIL environment variable is required but not set.');
}
const ADMIN_EMAIL: string = _adminEmail;

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
        logError('Admin middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
}

/**
 * Verify admin PIN for secure admin operations.
 * The expected admin email is read from the ADMIN_EMAIL env var (validated at startup).
 */
export async function verifyAdminPin(email: string, pin: string): Promise<boolean> {
    try {
        // Only allow the configured admin email
        if (email !== ADMIN_EMAIL) {
            return false;
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!user || !user.admin_pin_hash) {
            return false;
        }

        // Compare PIN with stored hash
        return await bcrypt.compare(pin, user.admin_pin_hash);
    } catch (error) {
        logError('PIN verification error:', error);
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
            adminId: adminUserId,
            action,
            targetUserId,
            metadata: details
        });
    } catch (error) {
        logError('Failed to log admin action:', error);
    }
}
