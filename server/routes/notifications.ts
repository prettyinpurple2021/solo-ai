import { Router, Request, Response } from 'express';
import { db } from '../db';
import { notifications, notificationPreferences } from '../../src/lib/shared/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
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
router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;

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
router.post('/create', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const parsed = CreateNotificationSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
        }

        const payload = parsed.data;
        const [created] = await db.insert(notifications).values({
            userId: userId,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            priority: payload.priority,
            actionUrl: payload.actionUrl,
            isRead: false,
            metadata: { ...((payload as any).metadata || {}), category: payload.category },
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
router.post('/:id/read', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const notificationId = req.params.id as string;

        const [updated] = await db.update(notifications)
            .set({ isRead: true })
            .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
            .returning();

        if (!updated) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        broadcastToUser(String(userId), 'notification:updated', { id: notificationId, isRead: true });
        return res.json(updated);
    } catch (error) {
        logError('Failed to mark notification as read', error);
        return res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// Mark all as read
router.post('/read-all', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;

        const updated = await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId))
            .returning({ id: notifications.id });

        if (updated.length > 0) {
            broadcastToUser(String(userId), 'notification:updated', { isRead: true, all: true });
        }
        return res.json({ success: true, updated: updated.length });
    } catch (error) {
        logError('Failed to mark all as read', error);
        return res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// Delete notification
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const notificationId = req.params.id as string;

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
router.get('/preferences', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;

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
router.put('/preferences', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
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

// System send endpoint (called by job queue)
router.post('/send', async (req: Request, res: Response) => {
    try {
        const isSystemJob = req.headers['x-system-job'] === 'true';
        if (!isSystemJob) {
            // If not a system job, require auth (though ideally this endpoint is internal only)
            // For now, restrict to system jobs only
            return res.status(401).json({ error: 'Unauthorized: System access only' });
        }

        const {
            title,
            body,
            icon,
            badge,
            image,
            data,
            actions,
            tag,
            priority,
            userIds,
            allUsers
        } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Missing title or body' });
        }

        let targets: string[] = [];

        if (allUsers) {
             const allUserRecords = await db.query.users.findMany({
                columns: { id: true }
            });
            targets = allUserRecords.map(u => u.id);
        } else if (Array.isArray(userIds)) {
            targets = userIds;
        }

        if (targets.length === 0) {
            return res.json({ message: 'No targets found' });
        }

        // Process in batches to avoid overwhelming DB/Socket
        const results: string[] = [];
        
        for (const userId of targets) {
            try {
                const [notification] = await db.insert(notifications).values({
                    userId: userId,
                    type: 'in_app', // Defaulting to in_app for now
                    title: title,
                    message: body,
                    priority: priority || 'medium',
                    actionUrl: data?.url || actions?.[0]?.url, // Try to extract URL from data or actions
                    isRead: false,
                    sentAt: new Date(),
                    metadata: { category: 'system', ...data }, // Moved category to metadata
                    createdAt: new Date(),
                }).returning();

                // Broadcast real-time event
                broadcastToUser(userId, 'notification:new', notification);
                results.push(notification.id);
            } catch (err) {
                 logError(`Failed to send notification to user ${userId}`, err);
            }
        }

        return res.json({ success: true, count: results.length });

    } catch (error) {
        logError('Error in send notification endpoint', error);
        return res.status(500).json({ error: 'Failed to send notifications' });
    }
});

export default router;
