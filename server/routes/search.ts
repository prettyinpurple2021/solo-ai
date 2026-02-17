import { Router, Request, Response } from 'express';
import { db } from '../db';
import { searchIndex } from '../../lib/shared/db/schema';
import { eq, and, or, ilike, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { SearchIndexer } from '../utils/searchIndexer';
import { logError } from '../utils/logger';

const router = Router();



// Search
router.post('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const { q, filters } = req.query; // q can be in query or body, let's check both
        const query = (req.query.q as string) || (req.body.query as string) || '';

        if (!query || query.length < 2) {
            return res.json([]);
        }

        // Basic fuzzy search using ILIKE
        const results = await db.select().from(searchIndex)
            .where(
                and(
                    eq(searchIndex.userId, userId),
                    or(
                        ilike(searchIndex.title, `%${query}%`),
                        ilike(searchIndex.content, `%${query}%`)
                    )
                )
            )
            .orderBy(desc(searchIndex.updatedAt))
            .limit(20);

        const formatted = results.map(r => ({
            id: r.entityId,
            type: r.entityType,
            title: r.title,
            snippet: r.content.substring(0, 150) + '...',
            path: getPathForType(r.entityType, r.entityId),
            timestamp: r.updatedAt,
            relevance: 1
        }));

        return res.json(formatted);
    } catch (error) {
        logError('Search error', error);
        return res.status(500).json({ error: 'Search failed' });
    }
});

// Manual Index (for testing or manual triggers)
router.post('/index', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const { type, id, title, content, tags } = req.body;

        await SearchIndexer.indexEntity(userId, type, id, title, content, tags);
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Indexing failed' });
    }
});

router.delete('/index', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const { type, id } = req.body;

        await SearchIndexer.removeFromIndex(userId, type, id);
        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Remove failed' });
    }
});

function getPathForType(type: string, id: string): string {
    switch (type) {
        case 'task': return '/app/roadmap';
        case 'contact': return '/app/network';
        case 'report': return '/app/competitor-stalker';
        case 'chat': return `/app/chat/${id}`; // id might need to be agentId
        default: return '/app/dashboard';
    }
}

export default router;
