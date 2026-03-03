
'use server'

import { db } from '@/db';
import { competitorProfiles } from '@/shared/db/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateAction } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logError, logInfo } from '@/lib/logger';

const createCompetitorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  domain: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  headquarters: z.string().optional(),
  foundedYear: z.number().nullable().optional(),
  employeeCount: z.number().nullable().optional(),
  fundingStage: z.string().optional(),
  threatLevel: z.string().default('medium'),
  monitoringStatus: z.string().default('active'),
  socialMediaHandles: z.record(z.string()).optional(),
  monitoringConfig: z.record(z.any()).optional()
});

const updateCompetitorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  domain: z.string().url().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  estimatedSize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  threatLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  reasoning: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  keyIndicators: z.array(z.string()).optional(),
  monitoringConfig: z.record(z.any()).optional(),
  monitoringStatus: z.enum(['active', 'paused', 'archived']).optional(),
});

export async function createCompetitor(data: any) {
  const { user } = await authenticateAction();
  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = createCompetitorSchema.parse(data);

    const [newCompetitor] = await db.insert(competitorProfiles).values({
      user_id: user.id,
      name: validatedData.name,
      domain: validatedData.domain,
      description: validatedData.description,
      industry: validatedData.industry,
      headquarters: validatedData.headquarters,
      founded_year: validatedData.foundedYear,
      employee_count: validatedData.employeeCount,
      funding_stage: validatedData.fundingStage,
      threat_level: validatedData.threatLevel,
      monitoring_status: validatedData.monitoringStatus,
      social_media_handles: validatedData.socialMediaHandles,
      monitoring_config: validatedData.monitoringConfig || {},
      created_at: new Date(),
      updated_at: new Date(),
      key_personnel: [],
      products: [],
      market_position: {},
      competitive_advantages: [],
      vulnerabilities: []
    }).returning();

    logInfo('Competitor created via Server Action', { 
      competitorId: newCompetitor.id, 
      userId: user.id 
    });

    revalidatePath('/dashboard/competitors');
    return { success: true, competitor: newCompetitor };
  } catch (error) {
    logError('Error in createCompetitor action:', error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create competitor" };
  }
}

export async function updateCompetitor(data: any) {
  const { user } = await authenticateAction();
  if (!user) throw new Error("Unauthorized");

  try {
    const validatedData = updateCompetitorSchema.parse(data);
    const { id, ...updateFields } = validatedData;

    // Map fields from camelCase to snake_case for DB
    const mappedFields: any = {
      updated_at: new Date()
    };
    
    if (updateFields.name) mappedFields.name = updateFields.name;
    if (updateFields.domain) mappedFields.domain = updateFields.domain;
    if (updateFields.description) mappedFields.description = updateFields.description;
    if (updateFields.industry) mappedFields.industry = updateFields.industry;
    if (updateFields.threatLevel) mappedFields.threat_level = updateFields.threatLevel;
    if (updateFields.monitoringStatus) mappedFields.monitoring_status = updateFields.monitoringStatus;
    if (updateFields.monitoringConfig) mappedFields.monitoring_config = updateFields.monitoringConfig;

    const [updated] = await db.update(competitorProfiles)
      .set(mappedFields)
      .where(and(eq(competitorProfiles.id, id), eq(competitorProfiles.user_id, user.id)))
      .returning();

    if (!updated) return { success: false, error: "Competitor not found" };

    revalidatePath('/dashboard/competitors');
    revalidatePath(`/dashboard/competitors/${id}`);
    return { success: true, competitor: updated };
  } catch (error) {
    logError('Error in updateCompetitor action:', error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update competitor" };
  }
}

export async function deleteCompetitor(id: string) {
  const { user } = await authenticateAction();
  if (!user) throw new Error("Unauthorized");

  try {
    const [deleted] = await db.delete(competitorProfiles)
      .where(and(eq(competitorProfiles.id, id), eq(competitorProfiles.user_id, user.id)))
      .returning();

    if (!deleted) return { success: false, error: "Competitor not found" };

    logInfo('Competitor deleted via Server Action', { competitorId: id, userId: user.id });

    revalidatePath('/dashboard/competitors');
    return { success: true };
  } catch (error) {
    logError('Error in deleteCompetitor action:', error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete competitor" };
  }
}
