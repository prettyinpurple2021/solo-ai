import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { intelligenceData, competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, or, desc, asc, gte, lte, inArray } from 'drizzle-orm'
import type { 
  IntelligenceData, 
  IntelligenceFilters, 
  SourceType, 
  ImportanceLevel,
  ExtractedData,
  AnalysisResult
} from '@/lib/competitor-intelligence-types'

// Validation schemas
const IntelligenceCreateSchema = z.object({
  competitorId: z.number().int().positive(),
  sourceType: z.enum(['website', 'social_media', 'news', 'job_posting', 'app_store', 'manual']),
  sourceUrl: z.string().url().optional(),
  dataType: z.string().min(1).max(100),
  rawContent: z.any().optional(),
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
  }).default({}),
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
  })).default([]),
  confidence: z.number().min(0).max(1).default(0.5),
  importance: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  tags: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
})

const IntelligenceFiltersSchema = z.object({
  competitorIds: z.array(z.number().int().positive()).optional(),
  sourceTypes: z.array(z.enum(['website', 'social_media', 'news', 'job_posting', 'app_store', 'manual'])).optional(),
  dataTypes: z.array(z.string()).optional(),
  importance: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['collectedAt', 'processedAt', 'importance', 'confidence']).default('collectedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    // Parse arrays from query string
    if (queryParams.competitorIds) {
      queryParams.competitorIds = queryParams.competitorIds.split(',').map(id => parseInt(id))
    }
    if (queryParams.sourceTypes) {
      queryParams.sourceTypes = queryParams.sourceTypes.split(',')
    }
    if (queryParams.dataTypes) {
      queryParams.dataTypes = queryParams.dataTypes.split(',')
    }
    if (queryParams.importance) {
      queryParams.importance = queryParams.importance.split(',')
    }
    if (queryParams.tags) {
      queryParams.tags = queryParams.tags.split(',')
    }
    
    // Parse date range
    if (queryParams.startDate && queryParams.endDate) {
      queryParams.dateRange = {
        start: queryParams.startDate,
        end: queryParams.endDate,
      }
      delete queryParams.startDate
      delete queryParams.endDate
    }
    
    // Convert string numbers to numbers
    if (queryParams.page) queryParams.page = parseInt(queryParams.page as string)
    if (queryParams.limit) queryParams.limit = parseInt(queryParams.limit as string)

    const filters = IntelligenceFiltersSchema.parse(queryParams)

    // Build query conditions
    const conditions = [eq(intelligenceData.user_id, user.id)]

    if (filters.competitorIds && filters.competitorIds.length > 0) {
      conditions.push(inArray(intelligenceData.competitor_id, filters.competitorIds))
    }

    if (filters.sourceTypes && filters.sourceTypes.length > 0) {
      conditions.push(inArray(intelligenceData.source_type, filters.sourceTypes))
    }

    if (filters.dataTypes && filters.dataTypes.length > 0) {
      conditions.push(inArray(intelligenceData.data_type, filters.dataTypes))
    }

    if (filters.importance && filters.importance.length > 0) {
      conditions.push(inArray(intelligenceData.importance, filters.importance))
    }

    if (filters.dateRange) {
      conditions.push(
        and(
          gte(intelligenceData.collected_at, new Date(filters.dateRange.start)),
          lte(intelligenceData.collected_at, new Date(filters.dateRange.end))
        )!
      )
    }

    if (filters.tags && filters.tags.length > 0) {
      // Use JSON contains operator for tags array
      conditions.push(
        or(...filters.tags.map(tag => 
          // This is a simplified approach - in production you'd want proper JSON array contains
          eq(intelligenceData.tags, JSON.stringify(filters.tags))
        ))!
      )
    }

    // Build sort order
    let orderBy
    switch (filters.sortBy) {
      case 'processedAt':
        orderBy = filters.sortOrder === 'asc' ? asc(intelligenceData.processed_at) : desc(intelligenceData.processed_at)
        break
      case 'importance':
        orderBy = filters.sortOrder === 'asc' ? asc(intelligenceData.importance) : desc(intelligenceData.importance)
        break
      case 'confidence':
        orderBy = filters.sortOrder === 'asc' ? asc(intelligenceData.confidence) : desc(intelligenceData.confidence)
        break
      default:
        orderBy = filters.sortOrder === 'asc' ? asc(intelligenceData.collected_at) : desc(intelligenceData.collected_at)
    }

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: intelligenceData.id })
      .from(intelligenceData)
      .where(and(...conditions))

    // Get paginated results with competitor info
    const offset = (filters.page - 1) * filters.limit
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
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(filters.limit)
      .offset(offset)

    // Transform database results to match interface
    const transformedIntelligence = intelligence.map(item => ({
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
      competitor: item.competitor ? {
        id: item.competitor.id,
        name: item.competitor.name,
        domain: item.competitor.domain || undefined,
        threatLevel: item.competitor.threatLevel as any,
      } : undefined,
    }))

    return NextResponse.json({
      intelligence: transformedIntelligence,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: totalCountResult.length,
        totalPages: Math.ceil(totalCountResult.length / filters.limit),
      },
    })
  } catch (error) {
    console.error('Error fetching intelligence data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch intelligence data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('intelligence:create', ip, 60_000, 20)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = IntelligenceCreateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Verify competitor belongs to user
    const competitor = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, data.competitorId),
          eq(competitorProfiles.user_id, user.id)
        )
      )
      .limit(1)

    if (competitor.length === 0) {
      return NextResponse.json(
        { error: 'Competitor not found or access denied' },
        { status: 404 }
      )
    }

    // Create intelligence entry
    const [newIntelligence] = await db
      .insert(intelligenceData)
      .values({
        competitor_id: data.competitorId,
        user_id: user.id,
        source_type: data.sourceType,
        source_url: data.sourceUrl || null,
        data_type: data.dataType,
        raw_content: data.rawContent || null,
        extracted_data: data.extractedData,
        analysis_results: data.analysisResults,
        confidence: data.confidence.toString(),
        importance: data.importance,
        tags: data.tags,
        processed_at: data.analysisResults.length > 0 ? new Date() : null,
        expires_at: data.expiresAt ? new Date(data.expiresAt) : null,
      })
      .returning()

    // Transform result to match interface
    const transformedIntelligence = {
      id: newIntelligence.id,
      competitorId: newIntelligence.competitor_id,
      userId: newIntelligence.user_id,
      sourceType: newIntelligence.source_type as SourceType,
      sourceUrl: newIntelligence.source_url || undefined,
      dataType: newIntelligence.data_type,
      rawContent: newIntelligence.raw_content,
      extractedData: (newIntelligence.extracted_data as ExtractedData) || {},
      analysisResults: (newIntelligence.analysis_results as AnalysisResult[]) || [],
      confidence: newIntelligence.confidence ? parseFloat(newIntelligence.confidence) : 0,
      importance: newIntelligence.importance as ImportanceLevel,
      tags: (newIntelligence.tags as string[]) || [],
      collectedAt: newIntelligence.collected_at!,
      processedAt: newIntelligence.processed_at || undefined,
      expiresAt: newIntelligence.expires_at || undefined,
      createdAt: newIntelligence.created_at!,
      updatedAt: newIntelligence.updated_at!,
    }

    return NextResponse.json(
      { intelligence: transformedIntelligence },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating intelligence entry:', error)
    return NextResponse.json(
      { error: 'Failed to create intelligence entry' },
      { status: 500 }
    )
  }
}