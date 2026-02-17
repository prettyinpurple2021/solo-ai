import express, { Request, Response } from 'express';
import { db } from '../db';
import { pitchDecks, slides, slideComponents } from '../../lib/shared/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { checkSuspended } from '../middleware/checkSuspended';
import { logError } from '../utils/logger';

const router = express.Router();

// Apply auth and suspension check to all routes
router.use((authMiddleware as any));
router.use(checkSuspended as any);

// Get all pitch decks for authenticated user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;

        const decks = await db.select()
            .from(pitchDecks)
            .where(eq(pitchDecks.userId, userId))
            .orderBy(desc(pitchDecks.createdAt));

        return res.json(decks);
    } catch (error) {
        logError('Error fetching pitch decks', error);
        return res.status(500).json({ error: 'Failed to fetch pitch decks' });
    }
});

// Get single pitch deck by ID with full structure (slides & components)
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const deckId = req.params.id as string;

        // 1. Fetch Deck
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

        // 2. Fetch Slides
        const deckSlides = await db.select()
            .from(slides)
            .where(eq(slides.deckId, deckId))
            .orderBy(asc(slides.order));

        if (deckSlides.length === 0) {
             return res.json({ ...deck[0], slides: [] });
        }

        // 3. Fetch Components for these slides
        // We can fetch all components for these slides in one go if we had an "in" query or just loop
        // For simplicity/performance with typical deck sizes, fetching all components for the deck's slides via join or loop
        // Let's iterate for now or fetch all components where slideId depends on the fetched slides.
        // A cleaner way without complex "IN" helpers imported is to map.
        
        const slidesWithComponents = await Promise.all(deckSlides.map(async (slide) => {
            const components = await db.select()
                .from(slideComponents)
                .where(eq(slideComponents.slideId, slide.id));
            return { ...slide, components };
        }));

        return res.json({ ...deck[0], slides: slidesWithComponents });
    } catch (error) {
        logError('Error fetching pitch deck', error);
        return res.status(500).json({ error: 'Failed to fetch pitch deck' });
    }
});

// Create pitch deck
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        // `slides` in body should be an array of objects including their components
        const { id, title, theme, slides: initialSlides } = req.body;

        if (!id || !title) {
            return res.status(400).json({ error: 'Missing required fields: id, title' });
        }

        // Transaction to ensure atomicity
        await db.transaction(async (tx) => {
            // 1. Create Deck
            await tx.insert(pitchDecks).values({
                id,
                userId,
                title,
                theme: theme || 'modern',
                version: 1,
                isTemplate: false,
                status: 'draft',
            });

            // 2. Create Slides (if provided)
            if (initialSlides && Array.isArray(initialSlides) && initialSlides.length > 0) {
                for (const [index, slide] of initialSlides.entries()) {
                    const slideId = crypto.randomUUID();
                    
                    await tx.insert(slides).values({
                        id: slideId,
                        deckId: id,
                        order: index,
                        layout: slide.layout || 'blank',
                        title: slide.title || '',
                        notes: slide.notes || '',
                        content: {}, // Legacy JSON holder, can keep empty
                        isVisible: true,
                    });

                    // 3. Create Components for this slide
                    if (slide.components && Array.isArray(slide.components)) {
                        for (const comp of slide.components) {
                            await tx.insert(slideComponents).values({
                                id: crypto.randomUUID(),
                                slideId: slideId,
                                type: comp.type,
                                content: comp.content,
                                position: comp.position,
                                style: comp.style || {},
                                animation: comp.animation || {},
                                zIndex: comp.zIndex || 0,
                            });
                        }
                    }
                }
            }
        });

        return res.status(201).json({ success: true, id });
    } catch (error) {
        logError('Error saving pitch deck', error);
        return res.status(500).json({ error: 'Failed to save pitch deck' });
    }
});

// Update pitch deck metadata (Title, Theme, etc.) - DOES NOT Update Slides
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const deckId = req.params.id as string;
        const { title, theme, status, description, isPublic, thumbnail } = req.body;

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
                theme,
                status,
                description,
                isPublic,
                thumbnail,
                updatedAt: new Date()
            })
            .where(eq(pitchDecks.id, deckId))
            .returning();

        return res.json(updated);
    } catch (error) {
        logError('Error updating pitch deck', error);
        return res.status(500).json({ error: 'Failed to update pitch deck' });
    }
});

// Delete pitch deck
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const deckId = req.params.id as string;

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

        // Cascade delete should handle slides and components if foreign keys are set up correctly
        await db.delete(pitchDecks).where(eq(pitchDecks.id, deckId));

        return res.json({ success: true, message: 'Pitch deck deleted' });
    } catch (error) {
        logError('Error deleting pitch deck', error);
        return res.status(500).json({ error: 'Failed to delete pitch deck' });
    }
});

export default router;
