import express from 'express';
import { db } from '../db';
import { users } from '../../src/lib/shared/db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { logError } from '../utils/logger';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const router = express.Router();
router.use(authMiddleware);

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const getCached = async (key: string) => {
    try { return await redis.get(key); } catch (e) { return null; }
};

const setCache = async (key: string, data: any) => {
    try { await redis.set(key, JSON.stringify(data), { ex: 3600 }); } catch (e) { logError('Redis set error:', e); }
};

const invalidateCache = async (key: string) => {
    try { await redis.del(key); } catch (e) { logError('Redis del error:', e); }
};

router.get('/', async (req, res) => {
    try {
        const userId = req.userId!;
        const cacheKey = `user:${userId}`;
        
        const cached = await getCached(cacheKey);
        if (cached) return res.json(cached);

        // Check both ID and Stack ID
        let userResults = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (userResults.length === 0) {
            userResults = await db.select().from(users).where(eq(users.stackUserId, userId)).limit(1);
        }

        if (userResults.length === 0) {
            // Create for Stack Auth
            const newUser = await db.insert(users).values({
                id: crypto.randomUUID(),
                email: `${userId}@stack.auth`,
                stackUserId: userId,
                role: 'user',
                created_at: new Date(),
            }).returning();
            await setCache(cacheKey, newUser[0]);
            return res.json(newUser[0]);
        }

        await setCache(cacheKey, userResults[0]);
        res.json(userResults[0]);
    } catch (error) {
        logError('Fetch user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.post('/progress', async (req, res) => {
    try {
        const userId = req.userId!;
        const { xp, level, totalActions } = req.body;

        // Ensure user exists
        let userResults = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (userResults.length === 0) {
            userResults = await db.select().from(users).where(eq(users.stackUserId, userId)).limit(1);
        }

        if (userResults.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updated = await db.update(users)
            .set({ 
                xp, 
                level, 
                total_actions: totalActions, 
                updated_at: new Date(), 
            })
            .where(eq(users.id, userResults[0].id))
            .returning();

        await invalidateCache(`user:${userId}`);
        res.json(updated[0]);
    } catch (error) {
        logError('Update progress error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

export { router as userRouter };
