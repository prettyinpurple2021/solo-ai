
'use server'

import { db } from '@/db';
import { workflows, workflowTemplates } from '@/shared/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { authenticateAction } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logError, logInfo } from '@/lib/logger';

const workflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  triggerType: z.string(),
  triggerConfig: z.record(z.any()).optional(),
  nodes: z.array(z.any()).optional(),
  edges: z.array(z.any()).optional(),
  variables: z.record(z.any()).optional(),
  settings: z.record(z.any()).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  templateId: z.string().uuid().nullable().optional()
});

export async function createWorkflow(data: any) {
  const { user } = await authenticateAction();
  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = workflowSchema.parse(data);

    const [newWorkflow] = await db.insert(workflows).values({
      userId: user.id,
      name: validatedData.name,
      description: validatedData.description || '',
      version: '1.0.0',
      status: 'draft',
      triggerType: validatedData.triggerType,
      triggerConfig: validatedData.triggerConfig || {},
      nodes: validatedData.nodes || [],
      edges: validatedData.edges || [],
      variables: validatedData.variables || {},
      settings: {
        timeout: 300000,
        retryAttempts: 3,
        retryDelay: 5000,
        parallelExecution: true,
        errorHandling: 'stop',
        ...validatedData.settings
      },
      category: validatedData.category || 'general',
      tags: validatedData.tags || [],
      templateId: validatedData.templateId
    }).returning();

    if (validatedData.templateId) {
      await db.update(workflowTemplates)
        .set({ usage_count: sql`usage_count + 1` })
        .where(eq(workflowTemplates.id, validatedData.templateId));
    }

    logInfo('Workflow created via Server Action', { workflowId: newWorkflow.id, userId: user.id });
    revalidatePath('/dashboard/workflow');
    return { success: true, workflow: newWorkflow };
  } catch (error) {
    logError('Error in createWorkflow action:', error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create workflow" };
  }
}

export async function updateWorkflow(id: string, data: any) {
  const { user } = await authenticateAction();
  if (!user) throw new Error("Unauthorized");

  try {
    const updates = workflowSchema.partial().parse(data);
    
    // Map fields from camelCase to database schema if needed (Drizzle handles this if configured correctly)
    const [updated] = await db.update(workflows)
      .set({
        ...updates,
        updatedAt: new Date()
      } as any)
      .where(and(eq(workflows.id, id), eq(workflows.userId, user.id)))
      .returning();

    if (!updated) return { success: false, error: "Workflow not found" };

    revalidatePath('/dashboard/workflow');
    return { success: true, workflow: updated };
  } catch (error) {
    logError('Error in updateWorkflow action:', error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update workflow" };
  }
}

export async function deleteWorkflow(id: string) {
  const { user } = await authenticateAction();
  if (!user) throw new Error("Unauthorized");

  try {
    const [deleted] = await db.delete(workflows)
      .where(and(eq(workflows.id, id), eq(workflows.userId, user.id)))
      .returning();

    if (!deleted) return { success: false, error: "Workflow not found" };

    logInfo('Workflow deleted via Server Action', { workflowId: id, userId: user.id });
    revalidatePath('/dashboard/workflow');
    return { success: true };
  } catch (error) {
    logError('Error in deleteWorkflow action:', error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete workflow" };
  }
}
