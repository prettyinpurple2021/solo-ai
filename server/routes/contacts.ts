import express, { Request, Response } from 'express';
import { db } from '../db';
import { contacts } from '../../lib/shared/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { checkSuspended } from '../middleware/checkSuspended';
import { SearchIndexer } from '../utils/searchIndexer';
import { logError } from '../utils/logger';

const router = express.Router();

// Apply auth and suspension check to all routes
router.use(authMiddleware as any);
router.use(checkSuspended as any);

// Get all contacts for authenticated user
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;

        const userContacts = await db.select()
            .from(contacts)
            .where(eq(contacts.userId, userId))
            .orderBy(desc(contacts.updatedAt));

        return res.json(userContacts);
    } catch (error) {
        logError('Error fetching contacts', error);
        return res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// Get single contact by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const contactId = Number(req.params.id);

        const contact = await db.select()
            .from(contacts)
            .where(and(
                eq(contacts.id, contactId),
                eq(contacts.userId, userId)
            ))
            .limit(1);

        if (!contact.length) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        return res.json(contact[0]);
    } catch (error) {
        logError('Error fetching contact', error);
        return res.status(500).json({ error: 'Failed to fetch contact' });
    }
});

// Create new contact
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const { name, email, company, role, notes, linkedinUrl, tags, lastContact, relationship } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const [newContact] = await db.insert(contacts)
            .values({
                userId: userId,
                name,
                email,
                company,
                role,
                notes,
                linkedinUrl,
                tags: tags as string[],
                lastContact: lastContact ? new Date(lastContact) : null,
                relationship
            })
            .returning();

        // Index for search
        await SearchIndexer.indexContact(userId, newContact);

        return res.status(201).json(newContact);
    } catch (error) {
        logError('Error creating contact', error);
        return res.status(500).json({ error: 'Failed to create contact' });
    }
});

// Update contact
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const contactId = Number(req.params.id);
        const { name, email, company, role, notes, linkedinUrl, tags, lastContact, relationship } = req.body;

        // Verify ownership
        const existing = await db.select()
            .from(contacts)
            .where(and(
                eq(contacts.id, contactId),
                eq(contacts.userId, userId)
            ))
            .limit(1);

        if (!existing.length) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        const [updated] = await db.update(contacts)
            .set({
                name,
                email,
                company,
                role,
                notes,
                linkedinUrl,
                tags,
                lastContact: lastContact ? new Date(lastContact) : null,
                relationship,
                updatedAt: new Date()
            })
            .where(eq(contacts.id, contactId))
            .returning();

        // Update index
        await SearchIndexer.indexContact(userId, updated);

        return res.json(updated);
    } catch (error) {
        logError('Error updating contact', error);
        return res.status(500).json({ error: 'Failed to update contact' });
    }
});

// Delete contact
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const contactId = Number(req.params.id);

        // Verify ownership before deleting
        const existing = await db.select()
            .from(contacts)
            .where(and(
                eq(contacts.id, contactId),
                eq(contacts.userId, userId)
            ))
            .limit(1);

        if (!existing.length) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        await db.delete(contacts)
            .where(eq(contacts.id, contactId));

        // Remove from index
        await SearchIndexer.removeFromIndex(userId, 'contact', String(contactId));

        return res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        logError('Error deleting contact', error);
        return res.status(500).json({ error: 'Failed to delete contact' });
    }
});

export default router;
