
import { Router, Response, Request } from 'express';
import { authMiddleware } from '../middleware/auth';
import { db } from '../db';
import { briefcaseItems, userBriefcases } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { logError } from '../utils/logger';
import { UsageTracker } from '../utils/usage-tracker';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/unified-briefcase
// Get briefcase items with optional filtering
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const { type, limit, offset, search, briefcaseId } = req.query;

        let conditions = [eq(briefcaseItems.userId, userId)];

        if (type) {
            conditions.push(eq(briefcaseItems.type, type as string));
        }

        if (briefcaseId) {
            conditions.push(eq(briefcaseItems.briefcaseId, briefcaseId as string));
        }

        // if (search) { ... } // implementations for search if needed

        const query = db.select()
            .from(briefcaseItems)
            .where(and(...conditions))
            .orderBy(desc(briefcaseItems.createdAt));

        if (limit) {
            query.limit(Number(limit));
        }
        
        if (offset) {
            query.offset(Number(offset));
        }

        const items = await query;

        return res.json({ items });
    } catch (error) {
        logError('Get briefcase items error', error);
        return res.status(500).json({ error: 'Failed to fetch briefcase items' });
    }
});

// POST /api/unified-briefcase
// Save an item to the briefcase
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const { type, title, description, content, metadata, tags } = req.body;

        if (!type || !title) {
            return res.status(400).json({ error: 'Type and title are required' });
        }

        // Calculate approximate size
        const payloadSize = JSON.stringify({ content, metadata, tags }).length;
        
        // Check storage limit
        const hasSpace = await UsageTracker.checkLimit(userId, 'storage', payloadSize);
        if (!hasSpace) {
            return res.status(402).json({ error: 'Storage quota exceeded. Please upgrade your plan.' });
        }

        // Ensure user has a default briefcase
        let defaultBriefcase = await db.select()
            .from(userBriefcases)
            .where(and(eq(userBriefcases.userId, userId), eq(userBriefcases.isDefault, true)))
            .limit(1);

        let briefcaseId;

        if (defaultBriefcase.length === 0) {
            // Create default briefcase
            const newBriefcase = await db.insert(userBriefcases).values({
                id: crypto.randomUUID(),
                userId,
                name: 'Main Briefcase',
                description: 'Default briefcase',
                isDefault: true
            }).returning();
            briefcaseId = newBriefcase[0].id;
        } else {
            briefcaseId = defaultBriefcase[0].id;
        }

        // Validate content based on type (simplified logic from original)
        if (type === 'chat' && !content?.messages) {
             return res.status(400).json({ error: 'Chat content must include messages array' });
        }
        if (type === 'brand' && !content) {
            return res.status(400).json({ error: 'Brand content is required' });
        }

        const newItem = await db.insert(briefcaseItems).values({
            id: crypto.randomUUID(),
            userId,
            briefcaseId,
            type,
            title,
            description,
            content,
            metadata: metadata || {},
            tags: tags || [], // Array of strings handled by Drizzle if defined as text[]
            isPrivate: true
        }).returning();

        // Increment usage
        await UsageTracker.incrementUsage(userId, 'storage', payloadSize);

        return res.json({
            success: true,
            item: newItem[0]
        });

    } catch (error) {
        logError('Save briefcase item error', error);
        return res.status(500).json({ error: 'Failed to save item' });
    }
});

// DELETE /api/unified-briefcase
// Delete an item
// Note: original route used query param ?id, but standard REST uses /:id
// We will support both for compatibility or stick to query param if we want to match Next.js exactly?
// Next.js route used `const itemId = searchParams.get('id')`.
// So it was `DELETE /api/unified-briefcase?id=...`
// Express can handle this on `/` with DELETE method.

router.delete('/', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Item ID is required' });
        }

        const result = await db.delete(briefcaseItems)
            .where(and(
                eq(briefcaseItems.id, id as string),
                eq(briefcaseItems.userId, userId)
            ))
            .returning();

        if (result.length > 0) {
            const item = result[0];
            // Decrement usage
            const payloadSize = JSON.stringify({ 
                content: item.content, 
                metadata: item.metadata, 
                tags: item.tags 
            }).length;
            await UsageTracker.incrementUsage(userId, 'storage', -payloadSize);
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Item not found or unauthorized' });
        }

        return res.json({
            success: true,
            message: 'Item deleted successfully'
        });

    } catch (error) {
        logError('Delete briefcase item error', error);
        return res.status(500).json({ error: 'Failed to delete item' });
    }
});

export default router;
