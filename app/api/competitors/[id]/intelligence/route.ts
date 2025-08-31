import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { intelligenceData, competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { z } from 'zod'
import { eq, and, desc, asc, gte, lte, inArray } from 'drizzle-orm'
import type { 
  IntelligenceData, 
  SourceType, 
  ImportanceLevel,
  ExtractedData,
  AnalysisResult
} from '@/lib/competitor-intelligence-types'

// Validation schema for query parameters
const IntelligenceQuerySchema = z.object({
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const competitorId = parseInt(params.id)
    if (isNaN(competitorId)) {
      return NextResponse.json({ error: 'Invalid competitor ID' }, { status: 400 })
    }

    // Verify competitor belongs to user
    const competitor = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
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

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    // Parse arrays from query string
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

    const filters = IntelligenceQuerySchema.parse(queryParams)

    // Build query conditions
    const conditions = [
      eq(intelligenceData.competitor_id, competitorId),
      eq(intelligenceData.user_id, user.id)
    ]

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
      // This is a simplified approach - in production you'd want proper JSON array contains
      conditions.push(
        // For now, we'll use a simple string match - this should be improved with proper JSON operators
        eq(intelligenceData.tags, JSON.stringify(filters.tags))
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

    // Get paginated results
    const offset = (filters.page - 1) * filters.limit
    const intelligence = await db
      .select()
      .from(intelligenceData)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(filters.limit)
      .offset(offset)

    // Transform database results to match interface
    const transformedIntelligence = intelligence.map(item => ({
      id: item.id,
      competitorId: item.competitor_id,
      userId: item.user_id,
      sourceType: item.source_type as SourceType,
      sourceUrl: item.source_url || undefined,
      dataType: item.data_type,
      rawContent: item.raw_content,
      extractedData: (item.extracted_data as ExtractedData) || {},
      analysisResults: (item.analysis_results as AnalysisResult[]) || [],
      confidence: item.confidence ? parseFloat(item.confidence) : 0,
      importance: item.importance as ImportanceLevel,
      tags: (item.tags as string[]) || [],
      collectedAt: item.collected_at!,
      processedAt: item.processed_at || undefined,
      expiresAt: item.expires_at || undefined,
      createdAt: item.created_at!,
      updatedAt: item.updated_at!,
    }))

    // Get intelligence summary stats
    const summaryStats = await db
      .select({
        sourceType: intelligenceData.source_type,
        importance: intelligenceData.importance,
        count: intelligenceData.id,
      })
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.competitor_id, competitorId),
          eq(intelligenceData.user_id, user.id)
        )
      )

    // Calculate summary statistics
    const sourceTypeStats = summaryStats.reduce((acc, item) => {
      acc[item.sourceType] = (acc[item.sourceType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const importanceStats = summaryStats.reduce((acc, item) => {
      acc[item.importance] = (acc[item.importance] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      competitor: {
        id: competitor[0].id,
        name: competitor[0].name,
        domain: competitor[0].domain,
        threatLevel: competitor[0].threat_level,
      },
      intelligence: transformedIntelligence,
      summary: {
        total: totalCountResult.length,
        bySourceType: sourceTypeStats,
        byImportance: importanceStats,
      },
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: totalCountResult.length,
        totalPages: Math.ceil(totalCountResult.length / filters.limit),
      },
    })
  } catch (error) {
    console.error('Error fetching competitor intelligence:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitor intelligence' },
      { status: 500 }
    )
  }
}