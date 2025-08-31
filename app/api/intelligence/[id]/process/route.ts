import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { intelligenceData, competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import type { 
  AnalysisResult,
  ExtractedData,
  SourceType,
  ImportanceLevel
} from '@/lib/competitor-intelligence-types'

// Validation schema for processing request
const ProcessingRequestSchema = z.object({
  analysisResults: z.array(z.object({
    agentId: z.string(),
    analysisType: z.string(),
    insights: z.array(z.object({
      id: z.string(),
      type: z.enum(['marketing', 'strategic', 'product', 'pricing', 'technical', 'opportunity', 'threat']),
      title: z.string(),
      description: z.string(),
      confidence: z.number().min(0).max(1),
      impact: z.enum(['low', 'medium', 'high']),
      urgency: z.enum(['low', 'medium', 'high']),
      supportingData: z.array(z.any()).default([]),
    })),
    recommendations: z.array(z.object({
      id: z.string(),
      type: z.enum(['defensive', 'offensive', 'monitoring', 'strategic']),
      title: z.string(),
      description: z.string(),
      priority: z.enum(['low', 'medium', 'high']),
      estimatedEffort: z.string(),
      potentialImpact: z.string(),
      timeline: z.string(),
      actionItems: z.array(z.string()).default([]),
    })),
    confidence: z.number().min(0).max(1),
    analyzedAt: z.string().datetime(),
  })),
  extractedData: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    metadata: z.record(z.any()).default({}),
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
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('intelligence:process', ip, 60_000, 10)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const intelligenceId = parseInt(params.id)
    if (isNaN(intelligenceId)) {
      return NextResponse.json({ error: 'Invalid intelligence ID' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = ProcessingRequestSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Verify intelligence entry belongs to user
    const intelligence = await db
      .select({
        intelligence: intelligenceData,
        competitor: competitorProfiles,
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

    const currentIntelligence = intelligence[0].intelligence
    const competitor = intelligence[0].competitor

    // Merge existing analysis results with new ones
    const existingAnalysisResults = (currentIntelligence.analysis_results as AnalysisResult[]) || []
    const mergedAnalysisResults = [...existingAnalysisResults, ...data.analysisResults]

    // Update extracted data if provided
    const currentExtractedData = (currentIntelligence.extracted_data as ExtractedData) || {}
    const updatedExtractedData = data.extractedData ? {
      ...currentExtractedData,
      ...data.extractedData,
      // Merge arrays
      entities: [
        ...(currentExtractedData.entities || []),
        ...(data.extractedData.entities || [])
      ],
      topics: [
        ...new Set([
          ...(currentExtractedData.topics || []),
          ...(data.extractedData.topics || [])
        ])
      ],
      keyInsights: [
        ...new Set([
          ...(currentExtractedData.keyInsights || []),
          ...(data.extractedData.keyInsights || [])
        ])
      ],
    } : currentExtractedData

    // Update tags if provided
    const currentTags = (currentIntelligence.tags as string[]) || []
    const updatedTags = data.tags ? [
      ...new Set([...currentTags, ...data.tags])
    ] : currentTags

    // Calculate overall confidence based on analysis results
    const overallConfidence = data.confidence || (
      mergedAnalysisResults.length > 0 
        ? mergedAnalysisResults.reduce((sum, result) => sum + result.confidence, 0) / mergedAnalysisResults.length
        : parseFloat(currentIntelligence.confidence || '0')
    )

    // Update intelligence entry
    const [updatedIntelligence] = await db
      .update(intelligenceData)
      .set({
        extracted_data: updatedExtractedData,
        analysis_results: mergedAnalysisResults,
        confidence: overallConfidence.toString(),
        importance: data.importance || currentIntelligence.importance,
        tags: updatedTags,
        processed_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(intelligenceData.id, intelligenceId))
      .returning()

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
      competitor: competitor ? {
        id: competitor.id,
        name: competitor.name,
        domain: competitor.domain,
        threatLevel: competitor.threat_level,
      } : undefined,
      processingResults: {
        newAnalysisCount: data.analysisResults.length,
        totalAnalysisCount: mergedAnalysisResults.length,
        confidenceScore: overallConfidence,
        extractedEntities: updatedExtractedData.entities?.length || 0,
        identifiedTopics: updatedExtractedData.topics?.length || 0,
        keyInsights: updatedExtractedData.keyInsights?.length || 0,
      },
    })
  } catch (error) {
    console.error('Error processing intelligence data:', error)
    return NextResponse.json(
      { error: 'Failed to process intelligence data' },
      { status: 500 }
    )
  }
}