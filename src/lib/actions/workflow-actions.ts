
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
  templateId: z.coerce.string().nullable().optional()
});

export async function createWorkflow(data: any) {
  const { user } = await authenticateAction();
  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = workflowSchema.parse(data);

    const [newWorkflow] = await db.insert(workflows).values({
      user_id: user.id,
      name: validatedData.name,
      description: validatedData.description || '',
      version: '1.0.0',
      status: 'draft',
      trigger_type: validatedData.triggerType,
      trigger_config: validatedData.triggerConfig || {},
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
      template_id: validatedData.templateId
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

  const workflowId = id;

  try {
    const updates = workflowSchema.partial().parse(data);
    
    const dbUpdates: any = { updated_at: new Date() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.triggerType !== undefined) dbUpdates.trigger_type = updates.triggerType;
    if (updates.triggerConfig !== undefined) dbUpdates.trigger_config = updates.triggerConfig;
    if (updates.nodes !== undefined) dbUpdates.nodes = updates.nodes;
    if (updates.edges !== undefined) dbUpdates.edges = updates.edges;
    if (updates.variables !== undefined) dbUpdates.variables = updates.variables;
    if (updates.settings !== undefined) dbUpdates.settings = updates.settings;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.templateId !== undefined) dbUpdates.template_id = updates.templateId;

    const [updated] = await db.update(workflows)
      .set(dbUpdates)
      .where(and(eq(workflows.id, workflowId), eq(workflows.user_id, user.id)))
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

  const workflowId = id;

  try {
    const [deleted] = await db.delete(workflows)
      .where(and(eq(workflows.id, workflowId), eq(workflows.user_id, user.id)))
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
