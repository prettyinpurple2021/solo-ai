import express from 'express';
import { db } from '../db';
import jwt from 'jsonwebtoken';
import { users, subscriptions, adminActions, usageTracking } from '../../src/lib/shared/db/schema';
import { eq, desc, count, sql, and } from 'drizzle-orm';
import { requireAdmin, verifyAdminPin } from '../middleware/admin';
import { authMiddleware } from '../middleware/auth';
import { logError } from '../utils/logger';
import { PRICE_IDS } from '../stripe-config';

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// ... (verify-pin route remains the same)

// Analytics Dashboard
router.get('/analytics', async (req: express.Request, res: express.Response) => {
    try {
        const [userCount] = await db.select({ count: count() }).from(users);
        const [subCount] = await db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.status, 'active'));

        // Calculate MRR and Tier Distribution
        const activeSubs = await db.select().from(subscriptions).where(eq(subscriptions.status, 'active'));
        
        let mrr = 0;
        const tiers = {
            free: 0,
            launch: 0,
            accelerator: 0,
            dominator: 0
        };

        activeSubs.forEach(sub => {
            const priceId = sub.stripePriceId;
            
            if (priceId === PRICE_IDS.accelerator.monthly) {
                mrr += 79;
                tiers.accelerator++;
            } else if (priceId === PRICE_IDS.accelerator.yearly) {
                mrr += 65.83; // $790 / 12
                tiers.accelerator++;
            } else if (priceId === PRICE_IDS.dominator.monthly) {
                mrr += 199;
                tiers.dominator++;
            } else if (priceId === PRICE_IDS.dominator.yearly) {
                mrr += 165.83; // $1990 / 12
                tiers.dominator++;
            } else {
                tiers.launch++;
            }
        });

        // Get total users for conversion rate
        const totalUsers = userCount.count;
        const conversionRate = totalUsers > 0 ? ((activeSubs.length / totalUsers) * 100).toFixed(1) : "0.0";

        // Recent Activity
        const recentActivity = await db.select({
            email: users.email,
            tier: users.subscription_tier,
            timestamp: subscriptions.updatedAt
        })
        .from(subscriptions)
        .leftJoin(users, eq(subscriptions.userId, users.id))
        .orderBy(desc(subscriptions.updatedAt))
        .limit(5);

        return res.json({
            totalUsers,
            totalSubscriptions: subCount.count,
            mrr: Math.round(mrr),
            activeSubscriptions: activeSubs.length,
            conversionRate: `${conversionRate}%`,
            tierDistribution: [
                { name: 'Accelerator', value: tiers.accelerator, color: '#10b981' },
                { name: 'Dominator', value: tiers.dominator, color: '#8b5cf6' },
                { name: 'Launch', value: tiers.launch, color: '#f59e0b' },
            ],
            recentActivity: recentActivity.map(a => ({
                email: a.email,
                tier: a.tier,
                time: a.timestamp
            }))
        });
    } catch (error) {
        logError('Analytics error', error);
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
            createdAt: users.created_at,
            lastActive: users.updated_at,
            subscription: users.subscription_tier,
            status: users.subscription_status,
            suspended: users.suspended,
            suspendedReason: users.suspended_reason
        })
            .from(users)
            .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(users.created_at));

        return res.json(allUsers);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/users/:userId', async (req: express.Request, res: express.Response) => {
    try {
        const userId = req.params.userId as string;
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
        const userId = req.params.userId as string;
        const { reason } = req.body;
        const adminUserId = req.userId!;

        // Update user suspended status in database
        await db.update(users)
            .set({
                suspended: true,
                suspended_at: new Date(),
                suspended_reason: reason || 'Account suspended by administrator'
            })
            .where(eq(users.id, userId));

        // Log the admin action
        await db.insert(adminActions).values({
            adminId: adminUserId,
            action: 'suspend_user',
            targetUserId: userId,
            metadata: { reason }
        });

        return res.json({ success: true, message: 'User suspended successfully' });
    } catch (error) {
        logError('Error suspending user', error);
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
