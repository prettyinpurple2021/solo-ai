import { Router, Request, Response } from 'express';
import { db } from '../db';
import { notifications, notificationPreferences } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { broadcastToUser } from '../realtime';
import { z } from 'zod';
import { logError } from '../utils/logger';

const router = Router();

const CreateNotificationSchema = z.object({
    type: z.enum(['email', 'sms', 'in_app']).default('in_app'),
    category: z.string().min(1).max(50),
    title: z.string().min(1).max(200),
    message: z.string().min(1),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    actionUrl: z.string().url().optional(),
    sentAt: z.coerce.date().optional(),
});

// Get all notifications
router.get('/', (authMiddleware as any), async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).userId!;

        const userNotifications = await db.select().from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(50);

        return res.json(userNotifications);
    } catch (error) {
        logError('Error fetching notifications', error);
        return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Create notification and emit real-time event
router.post('/create', (authMiddleware as any), async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).userId!;
        const parsed = CreateNotificationSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
        }

        const payload = parsed.data;
        const [created] = await db.insert(notifications).values({
            userId: userId,
            type: payload.type,
            category: payload.category,
            title: payload.title,
            message: payload.message,
            priority: payload.priority,
            actionUrl: payload.actionUrl,
            read: false,
            sentAt: payload.sentAt ?? new Date(),
            createdAt: new Date(),
        }).returning();

        broadcastToUser(String(userId), 'notification:new', created);
        return res.json(created);
    } catch (error) {
        logError('Error creating notification', error);
        return res.status(500).json({ error: 'Failed to create notification' });
    }
});

// Mark as read
router.post('/:id/read', (authMiddleware as any), async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).userId!;
        const notificationId = Number(req.params.id);

        const [updated] = await db.update(notifications)
            .set({ read: true })
            .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
            .returning();

        if (!updated) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        broadcastToUser(String(userId), 'notification:updated', { id: notificationId, read: true });
        return res.json(updated);
    } catch (error) {
        logError('Failed to mark notification as read', error);
        return res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// Mark all as read
router.post('/read-all', (authMiddleware as any), async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).userId!;

        const updated = await db.update(notifications)
            .set({ read: true })
            .where(eq(notifications.userId, userId))
            .returning({ id: notifications.id });

        if (updated.length > 0) {
            broadcastToUser(String(userId), 'notification:updated', { read: true, all: true });
        }
        return res.json({ success: true, updated: updated.length });
    } catch (error) {
        logError('Failed to mark all as read', error);
        return res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// Delete notification
router.delete('/:id', (authMiddleware as any), async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).userId!;
        const notificationId = Number(req.params.id);

        const deleted = await db.delete(notifications)
            .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
            .returning({ id: notifications.id });

        if (deleted.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        broadcastToUser(String(userId), 'notification:deleted', { id: notificationId });
        return res.json({ success: true });
    } catch (error) {
        logError('Failed to delete notification', error);
        return res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// Get preferences
router.get('/preferences', (authMiddleware as any), async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).userId!;

        const prefs = await db.select().from(notificationPreferences)
            .where(eq(notificationPreferences.userId, userId))
            .limit(1);

        if (prefs.length === 0) {
            // Return defaults if not set
            return res.json({
                emailEnabled: true,
                smsEnabled: false,
                inAppEnabled: true,
                taskDeadlines: true,
                financialAlerts: true,
                competitorAlerts: true,
                dailyDigest: true,
                digestTime: '08:00'
            });
        }

        return res.json(prefs[0]);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

// Update preferences
router.put('/preferences', (authMiddleware as any), async (req: Request, res: Response) => {
    try {
        const userId = (req as AuthRequest).userId!;
        const newPrefs = req.body;

        const existing = await db.select().from(notificationPreferences)
            .where(eq(notificationPreferences.userId, userId))
            .limit(1);

        if (existing.length > 0) {
            await db.update(notificationPreferences)
                .set({ ...newPrefs, updatedAt: new Date() })
                .where(eq(notificationPreferences.userId, userId));
        } else {
            await db.insert(notificationPreferences)
                .values({ ...newPrefs, userId: userId });
        }

        return res.json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update preferences' });
    }
});

export default router;
