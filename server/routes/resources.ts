
import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
    warRoomSessions, sops, jobDescriptions, interviewGuides,
    productSpecs, pivotAnalyses, legalDocs, trainingHistory,
    campaigns, creativeAssets, codeSnippets,
    launchStrategies, tribeBlueprints, boardReports,
    competitorReports, agentInstructions
} from '../../src/lib/shared/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { logError } from '../utils/logger';

const router = Router();

// Helper for generic CRUD
const createCrudRoutes = (path: string, table: any, dateField = 'generatedAt') => {
    // GET ALL
    router.get(`/${path}`, (authMiddleware as any), async (req: Request, res: Response) => {
        try {
            const userId = req.userId;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const items = await db.select().from(table)
                .where(eq(table.userId, userId)) // Ensure userId is string for DB
                .orderBy(desc(table[dateField]));

            return res.json(items);
        } catch (error) {
            logError(`Error fetching ${path}`, error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // CREATE
    router.post(`/${path}`, (authMiddleware as any), async (req: Request, res: Response) => {
        try {
            const userId = req.userId;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const data = { ...req.body, userId: userId }; // Ensure userId is string
            // Ensure ID is present if it's a text ID field, otherwise let DB handle serial
            // We check if the 'id' column is of type string (text/varchar)
            if (!data.id && (table.id as any).dataType === 'string') {
                data.id = `${path}-${Date.now()}`;
            }

            const result = await db.insert(table).values(data).returning();
            return res.json((result as any[])[0]);
        } catch (error) {
            logError(`Error creating ${path}`, error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // DELETE
    router.delete(`/${path}/:id`, (authMiddleware as any), async (req: Request, res: Response) => {
        try {
            const userId = req.userId;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            await db.delete(table).where(
                and(eq(table.id, req.params.id), eq(table.userId, userId))
            );
            return res.json({ success: true });
        } catch (error) {
            logError(`Error deleting ${path}`, error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};

// Register routes
createCrudRoutes('war-room', warRoomSessions, 'timestamp');
createCrudRoutes('sops', sops);
createCrudRoutes('job-descriptions', jobDescriptions);
createCrudRoutes('interview-guides', interviewGuides);
createCrudRoutes('product-specs', productSpecs);
createCrudRoutes('pivot-analyses', pivotAnalyses);
createCrudRoutes('legal-docs', legalDocs);
createCrudRoutes('training', trainingHistory, 'timestamp');

createCrudRoutes('campaigns', campaigns);
createCrudRoutes('creative', creativeAssets);
createCrudRoutes('snippets', codeSnippets);
createCrudRoutes('launch', launchStrategies);
createCrudRoutes('tribe', tribeBlueprints);
createCrudRoutes('board-reports', boardReports);
createCrudRoutes('competitor-reports', competitorReports);
createCrudRoutes('agent-instructions', agentInstructions, 'updatedAt');

export default router;
