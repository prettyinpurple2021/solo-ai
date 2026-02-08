import express from 'express';
import { db } from '../db';
import { users, subscriptions, adminActions, usageTracking } from '../db/schema';
import { eq, desc, count, sql } from 'drizzle-orm';
import { requireAdmin, verifyAdminPin } from '../middleware/admin';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware as any);

// Verify PIN endpoint (doesn't require admin role yet, used to elevate session)
router.post('/verify-pin', async (req, res) => {
    try {
        const { pin } = req.body;
        const userEmail = ((req as unknown) as AuthRequest).userEmail;

        if (!userEmail || !pin) {
            return res.status(400).json({ error: 'Missing requirements' });
        }

        const isValid = await verifyAdminPin(userEmail, pin);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid PIN' });
        }

        return res.json({ success: true });
    } catch (error) {
        console.error('PIN verification error:', error);
        return res.status(500).json({ error: 'Verification failed' });
    }
});

// Apply admin role check for all subsequent routes
router.use(requireAdmin as any);

// Analytics Dashboard
router.get('/analytics', async (req: express.Request, res: express.Response) => {
    try {
        const [userCount] = await db.select({ count: count() }).from(users);
        const [subCount] = await db.select({ count: count() }).from(subscriptions);

        // Calculate MRR (simplified)
        const activeSubs = await db.select().from(subscriptions).where(eq(subscriptions.status, 'active'));
        let mrr = 0;
        activeSubs.forEach(sub => {
            if (sub.tier === 'starter') mrr += 29;
            if (sub.tier === 'professional') mrr += 79;
            if (sub.tier === 'empire') mrr += 199;
        });

        return res.json({
            totalUsers: userCount.count,
            totalSubscriptions: subCount.count,
            mrr,
            activeSubscriptions: activeSubs.length
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// User Management
router.get('/users', async (req: express.Request, res: express.Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const allUsers = await db.select({
            id: users.id,
            email: users.email,
            role: users.role,
            createdAt: users.createdAt,
            lastActive: users.updatedAt,
            subscription: subscriptions.tier,
            status: subscriptions.status
        })
            .from(users)
            .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(users.createdAt));

        return res.json(allUsers);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/users/:userId', async (req: express.Request, res: express.Response) => {
    try {
        const userId = req.params.userId;
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if (!user.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        const sub = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
        const usage = await db.select().from(usageTracking).where(eq(usageTracking.userId, userId)).limit(1);

        return res.json({
            user: user[0],
            subscription: sub[0] || null,
            usage: usage[0] || null
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch user details' });
    }
});

router.post('/users/:userId/suspend', async (req: express.Request, res: express.Response) => {
    try {
        const userId = req.params.userId;
        const { reason } = req.body;
        const adminUserId = ((req as unknown) as AuthRequest).userId!;

        // Update user suspended status in database
        await db.update(users)
            .set({
                suspended: true,
                suspendedAt: new Date(),
                suspendedReason: reason || 'Account suspended by administrator'
            })
            .where(eq(users.id, userId));

        // Log the admin action
        await db.insert(adminActions).values({
            adminUserId,
            action: 'suspend_user',
            targetUserId: userId,
            details: { reason }
        });

        return res.json({ success: true, message: 'User suspended successfully' });
    } catch (error) {
        console.error('Error suspending user:', error);
        return res.status(500).json({ error: 'Failed to suspend user' });
    }
});

// System Health
router.get('/system-health', async (req: express.Request, res: express.Response) => {
    try {
        // Check DB connection
        const dbStart = Date.now();
        await db.execute(sql`SELECT 1`);
        const dbLatency = Date.now() - dbStart;

        return res.json({
            status: 'healthy',
            database: {
                status: 'connected',
                latency: `${dbLatency}ms`
            },
            redis: {
                status: process.env.UPSTASH_REDIS_REST_URL ? 'connected' : 'disabled'
            },
            uptime: process.uptime()
        });
    } catch (error) {
        return res.status(500).json({
            status: 'degraded',
            error: 'Database connection failed'
        });
    }
});

export default router;
