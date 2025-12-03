import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { intelligenceData, competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'

import type {
  SourceType,
  ImportanceLevel,
  ExtractedData,
  AnalysisResult
} from '@/lib/competitor-intelligence-types'

// Validation schema for intelligence update
const IntelligenceUpdateSchema = z.object({
  sourceUrl: z.string().url().optional(),
  dataType: z.string().min(1).max(100).optional(),
  rawContent: z.any().optional(),
  extractedData: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    metadata: z.record(z.string(), z.any()).default({}),
    entities: z.array(z.object({
      text: z.string(),
      type: z.enum(['person', 'organization', 'location', 'product', 'technology', 'other']),
      confidence: z.number().min(0).max(1),
    })).default([]),
    sentiment: z.object({
      score: z.number().min(-1).max(1),
      magnitude: z.number().min(0).max(1),
      label: z.enum(['positive', 'negative', 'neutral']),
    }).optional(),
    topics: z.array(z.string()).default([]),
    keyInsights: z.array(z.string()).default([]),
  }).optional(),
  confidence: z.number().min(0).max(1).optional(),
  importance: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  tags: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
})


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const intelligenceId = parseInt(params.id)
    if (isNaN(intelligenceId)) {
      return NextResponse.json({ error: 'Invalid intelligence ID' }, { status: 400 })
    }

    // Get intelligence entry with competitor info
    const intelligence = await db
      .select({
        intelligence: intelligenceData,
        competitor: {
          id: competitorProfiles.id,
          name: competitorProfiles.name,
          domain: competitorProfiles.domain,
          threatLevel: competitorProfiles.threat_level,
        }
      })
      .from(intelligenceData)
      .leftJoin(competitorProfiles, eq(intelligenceData.competitor_id, competitorProfiles.id))
      .where(
        and(
          eq(intelligenceData.id, intelligenceId),
          eq(intelligenceData.user_id, user.id)
        )
      )
      .limit(1)

    if (intelligence.length === 0) {
      return NextResponse.json(
        { error: 'Intelligence entry not found or access denied' },
        { status: 404 }
      )
    }

    const item = intelligence[0]

    // Transform database result to match interface
    const transformedIntelligence = {
      id: item.intelligence.id,
      competitorId: item.intelligence.competitor_id,
      userId: item.intelligence.user_id,
      sourceType: item.intelligence.source_type as SourceType,
      sourceUrl: item.intelligence.source_url || undefined,
      dataType: item.intelligence.data_type,
      rawContent: item.intelligence.raw_content,
      extractedData: (item.intelligence.extracted_data as ExtractedData) || {},
      analysisResults: (item.intelligence.analysis_results as AnalysisResult[]) || [],
      confidence: item.intelligence.confidence ? parseFloat(item.intelligence.confidence) : 0,
      importance: item.intelligence.importance as ImportanceLevel,
      tags: (item.intelligence.tags as string[]) || [],
      collectedAt: item.intelligence.collected_at!,
      processedAt: item.intelligence.processed_at || undefined,
      expiresAt: item.intelligence.expires_at || undefined,
      createdAt: item.intelligence.created_at!,
      updatedAt: item.intelligence.updated_at!,
    }

    return NextResponse.json({
      intelligence: transformedIntelligence,
      competitor: item.competitor ? {
        id: item.competitor.id,
        name: item.competitor.name,
        domain: item.competitor.domain || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        threatLevel: item.competitor.threatLevel as any,
      } : undefined,
    })
  } catch (error) {
    logError('Error fetching intelligence entry:', error)
    return NextResponse.json(
      { error: 'Failed to fetch intelligence entry' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const intelligenceId = parseInt(params.id)
    if (isNaN(intelligenceId)) {
      return NextResponse.json({ error: 'Invalid intelligence ID' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = IntelligenceUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Verify intelligence entry belongs to user
    const existingIntelligence = await db
      .select()
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.id, intelligenceId),
          eq(intelligenceData.user_id, user.id)
        )
      )
      .limit(1)

    if (existingIntelligence.length === 0) {
      return NextResponse.json(
        { error: 'Intelligence entry not found or access denied' },
        { status: 404 }
      )
    }

    // Build update object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      updated_at: new Date(),
    }

    if (data.sourceUrl !== undefined) updateData.source_url = data.sourceUrl
    if (data.dataType !== undefined) updateData.data_type = data.dataType
    if (data.rawContent !== undefined) updateData.raw_content = data.rawContent
    if (data.extractedData !== undefined) updateData.extracted_data = data.extractedData
    if (data.confidence !== undefined) updateData.confidence = data.confidence.toString()
    if (data.importance !== undefined) updateData.importance = data.importance
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.expiresAt !== undefined) updateData.expires_at = new Date(data.expiresAt)

    // Update intelligence entry
    const [updatedIntelligence] = await db
      .update(intelligenceData)
      .set(updateData)
      .where(eq(intelligenceData.id, intelligenceId))
      .returning()

    // Get competitor info
    const competitor = await db
      .select({
        id: competitorProfiles.id,
        name: competitorProfiles.name,
        domain: competitorProfiles.domain,
        threatLevel: competitorProfiles.threat_level,
      })
      .from(competitorProfiles)
      .where(eq(competitorProfiles.id, updatedIntelligence.competitor_id))
      .limit(1)

    // Transform result to match interface
    const transformedIntelligence = {
      id: updatedIntelligence.id,
      competitorId: updatedIntelligence.competitor_id,
      userId: updatedIntelligence.user_id,
      sourceType: updatedIntelligence.source_type as SourceType,
      sourceUrl: updatedIntelligence.source_url || undefined,
      dataType: updatedIntelligence.data_type,
      rawContent: updatedIntelligence.raw_content,
      extractedData: (updatedIntelligence.extracted_data as ExtractedData) || {},
      analysisResults: (updatedIntelligence.analysis_results as AnalysisResult[]) || [],
      confidence: updatedIntelligence.confidence ? parseFloat(updatedIntelligence.confidence) : 0,
      importance: updatedIntelligence.importance as ImportanceLevel,
      tags: (updatedIntelligence.tags as string[]) || [],
      collectedAt: updatedIntelligence.collected_at!,
      processedAt: updatedIntelligence.processed_at || undefined,
      expiresAt: updatedIntelligence.expires_at || undefined,
      createdAt: updatedIntelligence.created_at!,
      updatedAt: updatedIntelligence.updated_at!,
    }

    return NextResponse.json({
      intelligence: transformedIntelligence,
      competitor: competitor.length > 0 ? {
        id: competitor[0].id,
        name: competitor[0].name,
        domain: competitor[0].domain || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        threatLevel: competitor[0].threatLevel as any,
      } : undefined,
    })
  } catch (error) {
    logError('Error updating intelligence entry:', error)
    return NextResponse.json(
      { error: 'Failed to update intelligence entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const intelligenceId = parseInt(params.id)
    if (isNaN(intelligenceId)) {
      return NextResponse.json({ error: 'Invalid intelligence ID' }, { status: 400 })
    }

    // Verify intelligence entry belongs to user
    const existingIntelligence = await db
      .select()
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.id, intelligenceId),
          eq(intelligenceData.user_id, user.id)
        )
      )
      .limit(1)

    if (existingIntelligence.length === 0) {
      return NextResponse.json(
        { error: 'Intelligence entry not found or access denied' },
        { status: 404 }
      )
    }

    // Delete intelligence entry
    await db
      .delete(intelligenceData)
      .where(eq(intelligenceData.id, intelligenceId))

    return NextResponse.json({
      message: 'Intelligence entry deleted successfully',
      deletedId: intelligenceId,
    })
  } catch (error) {
    logError('Error deleting intelligence entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete intelligence entry' },
      { status: 500 }
    )
  }
}