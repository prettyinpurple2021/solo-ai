import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { intelligenceData, competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, or, desc, asc, gte, lte, inArray } from 'drizzle-orm'
import type { 
  SourceType, 
  ImportanceLevel,
  ExtractedData,
  AnalysisResult
} from '@/lib/competitor-intelligence-types'

// Validation schema for export request
const ExportRequestSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']).default('json'),
  competitorIds: z.array(z.number().int().positive()).optional(),
  sourceTypes: z.array(z.enum(['website', 'social_media', 'news', 'job_posting', 'app_store', 'manual'])).optional(),
  dataTypes: z.array(z.string()).optional(),
  importance: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  includeRawContent: z.boolean().default(false),
  includeAnalysisResults: z.boolean().default(true),
  sortBy: z.enum(['collectedAt', 'processedAt', 'importance', 'confidence']).default('collectedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().min(1).max(10000).default(1000),
})

// Helper function to convert data to CSV format
function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''

  // Get all unique keys from all objects
  const allKeys = new Set<string>()
  data.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key))
  })

  const headers = Array.from(allKeys)
  const csvRows = [headers.join(',')]

  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""')
      return String(value).replace(/"/g, '""')
    })
    csvRows.push(row.map(field => `"${field}"`).join(','))
  })

  return csvRows.join('\n')
}

// Helper function to flatten intelligence data for export
function flattenIntelligenceData(intelligence: any[], includeRawContent: boolean, includeAnalysisResults: boolean) {
  return intelligence.map(item => {
    const flattened: any = {
      id: item.id,
      competitorId: item.competitorId,
      competitorName: item.competitor?.name || '',
      competitorDomain: item.competitor?.domain || '',
      competitorThreatLevel: item.competitor?.threatLevel || '',
      sourceType: item.sourceType,
      sourceUrl: item.sourceUrl || '',
      dataType: item.dataType,
      importance: item.importance,
      confidence: item.confidence,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      collectedAt: item.collectedAt,
      processedAt: item.processedAt || '',
      expiresAt: item.expiresAt || '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }

    // Add extracted data fields
    if (item.extractedData) {
      flattened.extractedTitle = item.extractedData.title || ''
      flattened.extractedContent = item.extractedData.content || ''
      flattened.extractedTopics = Array.isArray(item.extractedData.topics) ? item.extractedData.topics.join(', ') : ''
      flattened.extractedKeyInsights = Array.isArray(item.extractedData.keyInsights) ? item.extractedData.keyInsights.join(', ') : ''
      flattened.extractedEntitiesCount = Array.isArray(item.extractedData.entities) ? item.extractedData.entities.length : 0
      
      if (item.extractedData.sentiment) {
        flattened.sentimentScore = item.extractedData.sentiment.score
        flattened.sentimentLabel = item.extractedData.sentiment.label
        flattened.sentimentMagnitude = item.extractedData.sentiment.magnitude
      }
    }

    // Add raw content if requested
    if (includeRawContent && item.rawContent) {
      flattened.rawContent = typeof item.rawContent === 'object' ? JSON.stringify(item.rawContent) : item.rawContent
    }

    // Add analysis results summary if requested
    if (includeAnalysisResults && Array.isArray(item.analysisResults)) {
      flattened.analysisResultsCount = item.analysisResults.length
      flattened.averageAnalysisConfidence = item.analysisResults.length > 0 
        ? item.analysisResults.reduce((sum: number, r: any) => sum + (r.confidence || 0), 0) / item.analysisResults.length
        : 0
      
      const insightCounts = item.analysisResults.reduce((acc: any, result: any) => {
        if (Array.isArray(result.insights)) {
          result.insights.forEach((insight: any) => {
            acc[insight.type] = (acc[insight.type] || 0) + 1
          })
        }
        return acc
      }, {})
      
      flattened.insightTypes = Object.keys(insightCounts).join(', ')
      flattened.totalInsights = Object.values(insightCounts).reduce((sum: any, count: any) => sum + count, 0)
      
      const recommendationCounts = item.analysisResults.reduce((acc: any, result: any) => {
        if (Array.isArray(result.recommendations)) {
          result.recommendations.forEach((rec: any) => {
            acc[rec.priority] = (acc[rec.priority] || 0) + 1
          })
        }
        return acc
      }, {})
      
      flattened.highPriorityRecommendations = recommendationCounts.high || 0
      flattened.totalRecommendations = Object.values(recommendationCounts).reduce((sum: any, count: any) => sum + count, 0)
    }

    return flattened
  })
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('intelligence:export', ip, 60_000, 3)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = ExportRequestSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Build query conditions
    const conditions = [eq(intelligenceData.user_id, user.id)]

    if (data.competitorIds && data.competitorIds.length > 0) {
      conditions.push(inArray(intelligenceData.competitor_id, data.competitorIds))
    }

    if (data.sourceTypes && data.sourceTypes.length > 0) {
      conditions.push(inArray(intelligenceData.source_type, data.sourceTypes))
    }

    if (data.dataTypes && data.dataTypes.length > 0) {
      conditions.push(inArray(intelligenceData.data_type, data.dataTypes))
    }

    if (data.importance && data.importance.length > 0) {
      conditions.push(inArray(intelligenceData.importance, data.importance))
    }

    if (data.dateRange) {
      conditions.push(
        and(
          gte(intelligenceData.collected_at, new Date(data.dateRange.start)),
          lte(intelligenceData.collected_at, new Date(data.dateRange.end))
        )!
      )
    }

    if (data.tags && data.tags.length > 0) {
      // Use JSON contains operator for tags array
      conditions.push(
        or(...data.tags.map(tag => 
          eq(intelligenceData.tags, JSON.stringify([tag]))
        ))!
      )
    }

    // Build sort order
    let orderBy
    switch (data.sortBy) {
      case 'processedAt':
        orderBy = data.sortOrder === 'asc' ? asc(intelligenceData.processed_at) : desc(intelligenceData.processed_at)
        break
      case 'importance':
        orderBy = data.sortOrder === 'asc' ? asc(intelligenceData.importance) : desc(intelligenceData.importance)
        break
      case 'confidence':
        orderBy = data.sortOrder === 'asc' ? asc(intelligenceData.confidence) : desc(intelligenceData.confidence)
        break
      default:
        orderBy = data.sortOrder === 'asc' ? asc(intelligenceData.collected_at) : desc(intelligenceData.collected_at)
    }

    // Get intelligence data with competitor info
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
      .limit(data.limit)

    // Transform database results
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

    // Generate export based on format
    let exportData: string | object
    let contentType: string
    let filename: string

    const timestamp = new Date().toISOString().split('T')[0]

    switch (data.format) {
      case 'csv':
        const flattenedData = flattenIntelligenceData(transformedIntelligence, data.includeRawContent, data.includeAnalysisResults)
        exportData = convertToCSV(flattenedData)
        contentType = 'text/csv'
        filename = `intelligence-export-${timestamp}.csv`
        break

      case 'xlsx':
        // For XLSX, we'll return JSON with a flag to convert on client side
        // In a real implementation, you'd use a library like xlsx to generate the file
        const xlsxData = flattenIntelligenceData(transformedIntelligence, data.includeRawContent, data.includeAnalysisResults)
        exportData = {
          format: 'xlsx',
          data: xlsxData,
          filename: `intelligence-export-${timestamp}.xlsx`
        }
        contentType = 'application/json'
        filename = `intelligence-export-${timestamp}.json`
        break

      default: // json
        exportData = {
          exportMetadata: {
            exportedAt: new Date().toISOString(),
            exportedBy: user.id,
            totalRecords: transformedIntelligence.length,
            filters: {
              competitorIds: data.competitorIds,
              sourceTypes: data.sourceTypes,
              dataTypes: data.dataTypes,
              importance: data.importance,
              dateRange: data.dateRange,
              tags: data.tags,
            },
            includeRawContent: data.includeRawContent,
            includeAnalysisResults: data.includeAnalysisResults,
          },
          intelligence: transformedIntelligence,
        }
        contentType = 'application/json'
        filename = `intelligence-export-${timestamp}.json`
        break
    }

    // Set appropriate headers for file download
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    })

    if (data.format === 'csv') {
      return new NextResponse(exportData as string, { headers })
    } else {
      return NextResponse.json(exportData, { headers })
    }

  } catch (error) {
    console.error('Error exporting intelligence data:', error)
    return NextResponse.json(
      { error: 'Failed to export intelligence data' },
      { status: 500 }
    )
  }
}