import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { intelligenceData, competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, or, desc, asc, gte, lte, inArray, ilike, sql } from 'drizzle-orm'
import type { 
  IntelligenceData, 
  SourceType, 
  ImportanceLevel,
  ExtractedData,
  AnalysisResult
} from '@/lib/competitor-intelligence-types'

// Enhanced search schema with full-text search capabilities
const IntelligenceSearchSchema = z.object({
  query: z.string().optional(), // Full-text search query
  competitorIds: z.array(z.number().int().positive()).optional(),
  sourceTypes: z.array(z.enum(['website', 'social_media', 'news', 'job_posting', 'app_store', 'manual'])).optional(),
  dataTypes: z.array(z.string()).optional(),
  importance: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  agentAnalysis: z.array(z.string()).optional(), // Filter by analyzing agent
  confidenceRange: z.object({
    min: z.number().min(0).max(1),
    max: z.number().min(0).max(1),
  }).optional(),
  hasAnalysis: z.boolean().optional(), // Filter items with/without AI analysis
  sortBy: z.enum(['relevance', 'collectedAt', 'processedAt', 'importance', 'confidence']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('intelligence:search', ip, 60_000, 100)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

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
    if (queryParams.agentAnalysis) {
      queryParams.agentAnalysis = queryParams.agentAnalysis.split(',')
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

    // Parse confidence range
    if (queryParams.minConfidence && queryParams.maxConfidence) {
      queryParams.confidenceRange = {
        min: parseFloat(queryParams.minConfidence as string),
        max: parseFloat(queryParams.maxConfidence as string),
      }
      delete queryParams.minConfidence
      delete queryParams.maxConfidence
    }
    
    // Convert string numbers and booleans
    if (queryParams.page) queryParams.page = parseInt(queryParams.page as string)
    if (queryParams.limit) queryParams.limit = parseInt(queryParams.limit as string)
    if (queryParams.hasAnalysis) queryParams.hasAnalysis = queryParams.hasAnalysis === 'true'

    const filters = IntelligenceSearchSchema.parse(queryParams)

    // Build query conditions
    const conditions = [eq(intelligenceData.user_id, user.id)]

    // Full-text search across multiple fields
    if (filters.query && filters.query.trim()) {
      const searchTerm = `%${filters.query.trim().toLowerCase()}%`
      conditions.push(
        or(
          // Search in extracted data title and content
          sql`LOWER(${intelligenceData.extracted_data}->>'title') LIKE ${searchTerm}`,
          sql`LOWER(${intelligenceData.extracted_data}->>'content') LIKE ${searchTerm}`,
          // Search in data type
          ilike(intelligenceData.data_type, searchTerm),
          // Search in source URL
          ilike(intelligenceData.source_url, searchTerm),
          // Search in tags array
          sql`EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(${intelligenceData.tags}) AS tag 
            WHERE LOWER(tag) LIKE ${searchTerm}
          )`,
          // Search in analysis results
          sql`EXISTS (
            SELECT 1 FROM jsonb_array_elements(${intelligenceData.analysis_results}) AS analysis
            WHERE LOWER(analysis->>'insights') LIKE ${searchTerm}
            OR LOWER(analysis->>'recommendations') LIKE ${searchTerm}
          )`
        )!
      )
    }

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
      // Check if any of the specified tags exist in the tags array
      conditions.push(
        or(...filters.tags.map(tag => 
          sql`${intelligenceData.tags} ? ${tag}`
        ))!
      )
    }

    if (filters.agentAnalysis && filters.agentAnalysis.length > 0) {
      conditions.push(
        or(...filters.agentAnalysis.map(agent => 
          sql`EXISTS (
            SELECT 1 FROM jsonb_array_elements(${intelligenceData.analysis_results}) AS analysis
            WHERE analysis->>'agentId' = ${agent}
          )`
        ))!
      )
    }

    if (filters.confidenceRange) {
      conditions.push(
        and(
          gte(intelligenceData.confidence, filters.confidenceRange.min.toString()),
          lte(intelligenceData.confidence, filters.confidenceRange.max.toString())
        )!
      )
    }

    if (filters.hasAnalysis !== undefined) {
      if (filters.hasAnalysis) {
        conditions.push(sql`jsonb_array_length(${intelligenceData.analysis_results}) > 0`)
      } else {
        conditions.push(sql`jsonb_array_length(${intelligenceData.analysis_results}) = 0`)
      }
    }

    // Build sort order
    let orderBy
    switch (filters.sortBy) {
      case 'relevance':
        // For relevance, prioritize by importance and confidence when there's a search query
        if (filters.query) {
          orderBy = [
            desc(intelligenceData.importance),
            desc(intelligenceData.confidence),
            desc(intelligenceData.collected_at)
          ]
        } else {
          orderBy = desc(intelligenceData.collected_at)
        }
        break
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
      .select({ count: sql<number>`count(*)` })
      .from(intelligenceData)
      .where(and(...conditions))

    const totalCount = totalCountResult[0]?.count || 0

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
      .orderBy(Array.isArray(orderBy) ? orderBy : [orderBy])
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

    // Calculate search statistics
    const searchStats = {
      totalResults: totalCount,
      hasQuery: !!filters.query,
      appliedFilters: {
        competitors: filters.competitorIds?.length || 0,
        sourceTypes: filters.sourceTypes?.length || 0,
        dataTypes: filters.dataTypes?.length || 0,
        importance: filters.importance?.length || 0,
        tags: filters.tags?.length || 0,
        agents: filters.agentAnalysis?.length || 0,
        dateRange: !!filters.dateRange,
        confidenceRange: !!filters.confidenceRange,
        hasAnalysis: filters.hasAnalysis !== undefined,
      }
    }

    return NextResponse.json({
      intelligence: transformedIntelligence,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / filters.limit),
      },
      searchStats,
      appliedFilters: filters,
    })
  } catch (error) {
    console.error('Error searching intelligence data:', error)
    return NextResponse.json(
      { error: 'Failed to search intelligence data' },
      { status: 500 }
    )
  }
}