import express from 'express';
import { db } from '../db';
import { tasks } from '../../src/lib/shared/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { logError } from '../utils/logger';
import { Redis } from '@upstash/redis';
import { broadcastToUser } from '../realtime';
import { SearchIndexer } from '../utils/searchIndexer';

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
        const cacheKey = `tasks:${userId}`;
        
        const cached = await getCached(cacheKey);
        if (cached) return res.json(cached);

        const allTasks = await db.select().from(tasks)
            .where(eq(tasks.user_id, userId))
            .orderBy(desc(tasks.created_at));

        await setCache(cacheKey, allTasks);
        res.json(allTasks);
    } catch (error) {
        logError('Fetch tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

router.post('/', async (req, res) => {
    try {
        const userId = req.userId!;
        const taskData = { ...req.body, user_id: userId };
        
        const existing = await db.select().from(tasks).where(
            and(eq(tasks.id, taskData.id), eq(tasks.user_id, userId))
        );

        let result;
        if (existing.length > 0) {
            result = await db.update(tasks).set(taskData).where(eq(tasks.id, taskData.id)).returning();
        } else {
            result = await db.insert(tasks).values(taskData).returning();
        }

        await invalidateCache(`tasks:${userId}`);
        broadcastToUser(userId, 'task:updated', result[0]);
        await SearchIndexer.indexTask(userId, result[0]);

        res.json(result[0]);
    } catch (error) {
        logError('Save task error:', error);
        res.status(500).json({ error: 'Failed to save task' });
    }
});

router.post('/batch', async (req, res) => {
    try {
        const userId = req.userId!;
        const taskList = req.body;
        if (!Array.isArray(taskList)) return res.status(400).json({ error: 'Expected array' });

        for (const t of taskList) {
            const taskData = { ...t, user_id: userId };
            const existing = await db.select().from(tasks).where(
                and(eq(tasks.id, t.id), eq(tasks.user_id, userId))
            );
            if (existing.length > 0) {
                await db.update(tasks).set(taskData).where(eq(tasks.id, t.id));
            } else {
                await db.insert(tasks).values(taskData);
            }
            await SearchIndexer.indexTask(userId, taskData);
        }

        await invalidateCache(`tasks:${userId}`);
        broadcastToUser(userId, 'tasks:batch_updated', taskList);
        res.json({ success: true });
    } catch (error) {
        logError('Batch save error:', error);
        res.status(500).json({ error: 'Failed to batch save' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const userId = req.userId!;
        const { id } = req.params;

        await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.user_id, userId)));

        await invalidateCache(`tasks:${userId}`);
        broadcastToUser(userId, 'task:deleted', { id });
        await SearchIndexer.removeFromIndex(userId, 'task', id);

        res.json({ success: true });
    } catch (error) {
        logError('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

router.delete('/', async (req, res) => {
    try {
        const userId = req.userId!;
        await db.delete(tasks).where(eq(tasks.user_id, userId));
        await invalidateCache(`tasks:${userId}`);
        broadcastToUser(userId, 'tasks:cleared', {});
        res.json({ success: true });
    } catch (error) {
        logError('Clear tasks error:', error);
        res.status(500).json({ error: 'Failed to clear tasks' });
    }
});

export { router as tasksRouter };
