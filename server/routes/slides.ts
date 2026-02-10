import express, { Request, Response } from 'express';
import { db } from '../db';
import { slides, slideComponents, pitchDecks } from '../db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { checkSuspended } from '../middleware/checkSuspended';

const router = express.Router();

router.use((authMiddleware as any));
router.use(checkSuspended as any);

// --- Slides ---

// Add a new slide to a deck
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const { deckId, order, layout, title } = req.body;

        if (!deckId) {
            return res.status(400).json({ error: 'Missing required field: deckId' });
        }

        // Verify deck ownership
        const deck = await db.select().from(pitchDecks)
            .where(and(eq(pitchDecks.id, deckId), eq(pitchDecks.userId, userId)))
            .limit(1);

        if (!deck.length) {
            return res.status(404).json({ error: 'Deck not found or unauthorized' });
        }

        const newSlideId = crypto.randomUUID();
        // Determine order if not provided (append to end)
        let finalOrder = order;
        if (finalOrder === undefined) {
             const lastSlide = await db.select().from(slides)
                .where(eq(slides.deckId, deckId))
                .orderBy(desc(slides.order))
                .limit(1);
             finalOrder = lastSlide.length > 0 ? lastSlide[0].order + 1 : 0;
        }

        const [newSlide] = await db.insert(slides).values({
            id: newSlideId,
            deckId,
            order: finalOrder,
            layout: layout || 'default',
            title: title || 'New Slide',
            content: {},
            isVisible: true
        }).returning();

        return res.status(201).json(newSlide);
    } catch (error) {
        console.error('Error creating slide:', error);
        return res.status(500).json({ error: 'Failed to create slide' });
    }
});

// Update a slide
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const slideId = req.params.id as string;
        const { layout, title, notes, isVisible, content } = req.body;

        // Verify ownership via join (Slide -> Deck -> User)
        // OR fetch slide, get deckId, check deck ownership.
        // Option 2 is simpler to write without complex joins if relations aren't set up.
        
        const slide = await db.select().from(slides).where(eq(slides.id, slideId)).limit(1);
        if (!slide.length) return res.status(404).json({ error: 'Slide not found' });

        const deck = await db.select().from(pitchDecks)
            .where(and(eq(pitchDecks.id, slide[0].deckId), eq(pitchDecks.userId, userId)))
            .limit(1);
            
        if (!deck.length) return res.status(403).json({ error: 'Unauthorized' });

        const [updated] = await db.update(slides)
            .set({
                layout,
                title,
                notes,
                isVisible,
                content,
                updatedAt: new Date().toISOString()
            })
            .where(eq(slides.id, slideId))
            .returning();

        return res.json(updated);
    } catch (error) {
        console.error('Error updating slide:', error);
        return res.status(500).json({ error: 'Failed to update slide' });
    }
});

// --- Components ---

// Add a component to a slide
router.post('/:id/components', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const slideId = req.params.id;
        const { type, content, position, style, animation, zIndex } = req.body;

        // Verify slide ownership
        const slide = await db.select().from(slides).where(eq(slides.id, slideId)).limit(1);
        if (!slide.length) return res.status(404).json({ error: 'Slide not found' });

        const deck = await db.select().from(pitchDecks)
            .where(and(eq(pitchDecks.id, slide[0].deckId), eq(pitchDecks.userId, userId)))
            .limit(1);
        if (!deck.length) return res.status(403).json({ error: 'Unauthorized' });

        const newComponentId = crypto.randomUUID();
        const [component] = await db.insert(slideComponents).values({
            id: newComponentId,
            slideId,
            type,
            content,
            position,
            style: style || {},
            animation: animation || {},
            zIndex: zIndex || 0
        }).returning();

        return res.status(201).json(component);

    } catch (error) {
        console.error('Error adding component:', error);
        return res.status(500).json({ error: 'Failed to add component' });
    }
});

// Update a component
router.put('/:slideId/components/:componentId', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const { slideId, componentId } = req.params;
        const updates = req.body;

        // Verify slide ownership
        const slide = await db.select().from(slides).where(eq(slides.id, slideId)).limit(1);
        if (!slide.length) return res.status(404).json({ error: 'Slide not found' });

        const deck = await db.select().from(pitchDecks)
            .where(and(eq(pitchDecks.id, slide[0].deckId), eq(pitchDecks.userId, userId)))
            .limit(1);
        if (!deck.length) return res.status(403).json({ error: 'Unauthorized' });

        const [updated] = await db.update(slideComponents)
            .set({ ...updates, updatedAt: new Date().toISOString() })
            .where(and(eq(slideComponents.id, componentId), eq(slideComponents.slideId, slideId)))
            .returning();

        if (!updated) return res.status(404).json({ error: 'Component not found' });

        return res.json(updated);

    } catch (error) {
        console.error('Error updating component:', error);
        return res.status(500).json({ error: 'Failed to update component' });
    }
});

// Delete a component
router.delete('/:slideId/components/:componentId', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const { slideId, componentId } = req.params;

        // Verify slide ownership
        const slide = await db.select().from(slides).where(eq(slides.id, slideId)).limit(1);
        if (!slide.length) return res.status(404).json({ error: 'Slide not found' });

        const deck = await db.select().from(pitchDecks)
            .where(and(eq(pitchDecks.id, slide[0].deckId), eq(pitchDecks.userId, userId)))
            .limit(1);
        if (!deck.length) return res.status(403).json({ error: 'Unauthorized' });

        await db.delete(slideComponents)
            .where(and(eq(slideComponents.id, componentId), eq(slideComponents.slideId, slideId)));

        return res.status(204).send();

    } catch (error) {
        console.error('Error deleting component:', error);
        return res.status(500).json({ error: 'Failed to delete component' });
    }
});

// Delete a slide
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const slideId = req.params.id as string;

        const slide = await db.select().from(slides).where(eq(slides.id, slideId)).limit(1);
        if (!slide.length) return res.status(404).json({ error: 'Slide not found' });

        const deck = await db.select().from(pitchDecks)
            .where(and(eq(pitchDecks.id, slide[0].deckId), eq(pitchDecks.userId, userId)))
            .limit(1);

        if (!deck.length) return res.status(403).json({ error: 'Unauthorized' });

        await db.delete(slides).where(eq(slides.id, slideId));

        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting slide:', error);
        return res.status(500).json({ error: 'Failed to delete slide' });
    }
});

// --- Components ---

// Add component to slide
router.post('/:id/components', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const slideId = req.params.id as string;
        const { type, content, position, style, animation, zIndex } = req.body;

        // Auth check
        const slide = await db.select().from(slides).where(eq(slides.id, slideId)).limit(1);
        if (!slide.length) return res.status(404).json({ error: 'Slide not found' });
        
        const deck = await db.select().from(pitchDecks)
            .where(and(eq(pitchDecks.id, slide[0].deckId), eq(pitchDecks.userId, userId)))
            .limit(1);
        if (!deck.length) return res.status(403).json({ error: 'Unauthorized' });

        const newCompId = crypto.randomUUID();
        const [newComp] = await db.insert(slideComponents).values({
            id: newCompId,
            slideId,
            type,
            content,
            position, // { x, y, width, height }
            style: style || {},
            animation: animation || {},
            zIndex: zIndex || 0
        }).returning();

        return res.status(201).json(newComp);
    } catch (error) {
        console.error('Error creating component:', error);
        return res.status(500).json({ error: 'Failed to create component' });
    }
});

// Update component
router.put('/components/:id', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const compId = req.params.id as string;
        const { content, position, style, animation, zIndex } = req.body;

        // Auth check... a bit repetitive, but necessary without eager loading
        const comp = await db.select().from(slideComponents).where(eq(slideComponents.id, compId)).limit(1);
        if (!comp.length) return res.status(404).json({ error: 'Component not found' });

        const slide = await db.select().from(slides).where(eq(slides.id, comp[0].slideId)).limit(1);
        const deck = await db.select().from(pitchDecks)
             .where(and(eq(pitchDecks.id, slide[0].deckId), eq(pitchDecks.userId, userId))).limit(1);
        
        if (!deck.length) return res.status(403).json({ error: 'Unauthorized' });

        const [updated] = await db.update(slideComponents)
            .set({
                content,
                position,
                style,
                animation,
                zIndex,
                updatedAt: new Date().toISOString()
            })
            .where(eq(slideComponents.id, compId))
            .returning();

        return res.json(updated);
    } catch (error) {
        console.error('Error updating component:', error);
        return res.status(500).json({ error: 'Failed to update component' });
    }
});

// Delete component
router.delete('/components/:id', async (req: Request, res: Response) => {
    try {
        const userId = ((req as unknown) as AuthRequest).userId!;
        const compId = req.params.id as string;

        const comp = await db.select().from(slideComponents).where(eq(slideComponents.id, compId)).limit(1);
        if (!comp.length) return res.status(404).json({ error: 'Component not found' });

        const slide = await db.select().from(slides).where(eq(slides.id, comp[0].slideId)).limit(1);
        const deck = await db.select().from(pitchDecks)
             .where(and(eq(pitchDecks.id, slide[0].deckId), eq(pitchDecks.userId, userId))).limit(1);
        
        if (!deck.length) return res.status(403).json({ error: 'Unauthorized' });

        await db.delete(slideComponents).where(eq(slideComponents.id, compId));

        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting component:', error);
        return res.status(500).json({ error: 'Failed to delete component' });
    }
});

export default router;
