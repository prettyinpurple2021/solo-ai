import express, { Request, Response } from 'express';
import { db } from '../db';
import { pitchDecks } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { checkSuspended } from '../middleware/checkSuspended';

const router = express.Router();

// Apply auth and suspension check to all routes
router.use((authMiddleware as any));
router.use(checkSuspended as any);

// Get all pitch decks for authenticated user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;

        const decks = await db.select()
            .from(pitchDecks)
            .where(eq(pitchDecks.userId, userId))
            .orderBy(desc(pitchDecks.createdAt));

        return res.json(decks);
    } catch (error) {
        console.error('Error fetching pitch decks:', error);
        return res.status(500).json({ error: 'Failed to fetch pitch decks' });
    }
});

// Get single pitch deck by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const deckId = req.params.id as string;

        const deck = await db.select()
            .from(pitchDecks)
            .where(and(
                eq(pitchDecks.id, deckId),
                eq(pitchDecks.userId, userId)
            ))
            .limit(1);

        if (!deck.length) {
            return res.status(404).json({ error: 'Pitch deck not found' });
        }

        return res.json(deck[0]);
    } catch (error) {
        console.error('Error fetching pitch deck:', error);
        return res.status(500).json({ error: 'Failed to fetch pitch deck' });
    }
});

// Create or update pitch deck
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const { id, title, slides, generatedAt } = req.body;

        if (!id || !title || !slides) {
            return res.status(400).json({ error: 'Missing required fields: id, title, slides' });
        }

        // Check if deck exists
        const existing = await db.select()
            .from(pitchDecks)
            .where(and(
                eq(pitchDecks.id, id),
                eq(pitchDecks.userId, userId)
            ))
            .limit(1);

        if (existing.length) {
            // Update existing
            const [updated] = await db.update(pitchDecks)
                .set({
                    title,
                    slides,
                    updatedAt: new Date()
                })
                .where(eq(pitchDecks.id, id))
                .returning();

            return res.json(updated);
        } else {
            // Create new
            const [newDeck] = await db.insert(pitchDecks)
                .values({
                    id,
                    userId: userId,
                    title,
                    slides,
                    createdAt: generatedAt ? new Date(generatedAt) : new Date()
                })
                .returning();

            return res.status(201).json(newDeck);
        }
    } catch (error) {
        console.error('Error saving pitch deck:', error);
        return res.status(500).json({ error: 'Failed to save pitch deck' });
    }
});

// Update pitch deck
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const deckId = req.params.id as string;
        const { title, slides } = req.body;

        // Verify ownership
        const existing = await db.select()
            .from(pitchDecks)
            .where(and(
                eq(pitchDecks.id, deckId),
                eq(pitchDecks.userId, userId)
            ))
            .limit(1);

        if (!existing.length) {
            return res.status(404).json({ error: 'Pitch deck not found' });
        }

        const [updated] = await db.update(pitchDecks)
            .set({
                title,
                slides,
                updatedAt: new Date()
            })
            .where(eq(pitchDecks.id, deckId))
            .returning();

        return res.json(updated);
    } catch (error) {
        console.error('Error updating pitch deck:', error);
        return res.status(500).json({ error: 'Failed to update pitch deck' });
    }
});

// Delete pitch deck
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const deckId = req.params.id as string;

        // Verify ownership before deleting
        const existing = await db.select()
            .from(pitchDecks)
            .where(and(
                eq(pitchDecks.id, deckId),
                eq(pitchDecks.userId, userId)
            ))
            .limit(1);

        if (!existing.length) {
            return res.status(404).json({ error: 'Pitch deck not found' });
        }

        await db.delete(pitchDecks)
            .where(eq(pitchDecks.id, deckId));

        return res.json({ success: true, message: 'Pitch deck deleted' });
    } catch (error) {
        console.error('Error deleting pitch deck:', error);
        return res.status(500).json({ error: 'Failed to delete pitch deck' });
    }
});

export default router;
