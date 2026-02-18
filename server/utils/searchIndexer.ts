import { db } from '../db';
import { searchIndex } from '../../lib/shared/db/schema';
import { eq, and } from 'drizzle-orm';
import { logError, logInfo } from './logger';
import { generateEmbedding } from './embeddings';

export class SearchIndexer {
    /**
     * Index a task
     */
    static async indexTask(userId: string, task: any) {
        try {
            await this.indexEntity(
                userId,
                'task',
                task.id,
                task.title,
                `${task.title} ${task.description || ''} ${task.status} ${task.priority}`,
                ['task', task.status, task.priority, task.assignee]
            );
        } catch (error) {
            logError('Failed to index task', error);
        }
    }

    /**
     * Index a contact
     */
    static async indexContact(userId: string, contact: any) {
        try {
            await this.indexEntity(
                userId,
                'contact',
                String(contact.id),
                contact.name,
                `${contact.name} ${contact.company || ''} ${contact.role || ''} ${contact.notes || ''}`,
                ['contact', ...(contact.tags || [])]
            );
        } catch (error) {
            logError('Failed to index contact', error);
        }
    }

    /**
     * Index a report
     */
    static async indexReport(userId: string, report: any) {
        try {
            await this.indexEntity(
                userId,
                'report',
                String(report.id),
                `Intel: ${report.competitorName}`,
                `${report.competitorName} ${report.threatLevel} ${JSON.stringify(report.data)}`,
                ['report', 'intel', report.threatLevel]
            );
        } catch (error) {
            logError('Failed to index report', error);
        }
    }

    /**
     * Index a generic entity with vector embeddings
     */
    static async indexEntity(
        userId: string,
        type: string,
        id: string,
        title: string,
        content: string,
        tags: string[] = []
    ) {
        try {
            logInfo(`Generating embedding for ${type} ${id}...`);
            const embedding = await generateEmbedding(`${title}\n${content}`);

            // Check if exists
            const existing = await db.select().from(searchIndex).where(
                and(
                    eq(searchIndex.userId, userId),
                    eq(searchIndex.entityType, type),
                    eq(searchIndex.entityId, id)
                )
            ).limit(1);

            if (existing.length > 0) {
                await db.update(searchIndex)
                    .set({
                        title,
                        content,
                        tags,
                        embedding,
                        updatedAt: new Date()
                    })
                    .where(eq(searchIndex.id, existing[0].id));
            } else {
                await db.insert(searchIndex).values({
                    userId,
                    entityType: type,
                    entityId: id,
                    title,
                    content,
                    tags,
                    embedding
                });
            }
        } catch (error) {
            logError(`Error indexing ${type} ${id}`, error);
        }
    }

    /**
     * Remove from index
     */
    static async removeFromIndex(userId: string, type: string, id: string) {
        try {
            await db.delete(searchIndex).where(
                and(
                    eq(searchIndex.userId, userId),
                    eq(searchIndex.entityType, type),
                    eq(searchIndex.entityId, id)
                )
            );
        } catch (error) {
            logError(`Error removing from index ${type} ${id}`, error);
        }
    }
}
