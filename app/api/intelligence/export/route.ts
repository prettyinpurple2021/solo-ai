import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { intelligenceData, competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, or, gte, lte, inArray, ilike, sql } from 'drizzle-orm'
import type { 
  SourceType, 
  ImportanceLevel,
  ExtractedData,
  AnalysisResult
} from '@/lib/competitor-intelligence-types'

// Export format schema
const IntelligenceExportSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']).default('json'),
  // Same filters as search
  query: z.string().optional(),
  competitorIds: z.array(z.number().int().positive()).optional(),
  sourceTypes: z.array(z.enum(['website', 'social_media', 'news', 'job_posting', 'app_store', 'manual'])).optional(),
  dataTypes: z.array(z.string()).optional(),
  importance: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  agentAnalysis: z.array(z.string()).optional(),
  confidenceRange: z.object({
    min: z.number().min(0).max(1),
    max: z.number().min(0).max(1),
  }).optional(),
  hasAnalysis: z.boolean().optional(),
  // Export options
  includeRawContent: z.boolean().default(false),
  includeAnalysis: z.boolean().default(true),
  includeCompetitorInfo: z.boolean().default(true),
  maxRecords: z.number().int().min(1).max(10000).default(1000),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('intelligence:export', ip, 300_000, 5) // 5 exports per 5 minutes
    if (!allowed) {
      return NextResponse.json({ error: 'Too many export requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = IntelligenceExportSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid export parameters', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const filters = parsed.data

    // Build query conditions (same as search)
    const conditions = [eq(intelligenceData.user_id, user.id)]

    // Full-text search
    if (filters.query && filters.query.trim()) {
      const searchTerm = `%${filters.query.trim().toLowerCase()}%`
      conditions.push(
        or(
          sql`LOWER(${intelligenceData.extracted_data}->>'title') LIKE ${searchTerm}`,
          sql`LOWER(${intelligenceData.extracted_data}->>'content') LIKE ${searchTerm}`,
          ilike(intelligenceData.data_type, searchTerm),
          ilike(intelligenceData.source_url, searchTerm),
          sql`EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(${intelligenceData.tags}) AS tag 
            WHERE LOWER(tag) LIKE ${searchTerm}
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

    // Get intelligence data
    const intelligence = await db
      .select({
        intelligence: intelligenceData,
        competitor: filters.includeCompetitorInfo ? {
          id: competitorProfiles.id,
          name: competitorProfiles.name,
          domain: competitorProfiles.domain,
          industry: competitorProfiles.industry,
          threatLevel: competitorProfiles.threat_level,
        } : undefined
      })
      .from(intelligenceData)
      .leftJoin(competitorProfiles, eq(intelligenceData.competitor_id, competitorProfiles.id))
      .where(and(...conditions))
      .limit(filters.maxRecords)

    // Transform data for export
    const exportData = intelligence.map(item => {
      const baseData = {
        id: item.intelligence.id,
        competitorId: item.intelligence.competitor_id,
        sourceType: item.intelligence.source_type,
        sourceUrl: item.intelligence.source_url,
        dataType: item.intelligence.data_type,
        title: (item.intelligence.extracted_data as ExtractedData)?.title || '',
        content: (item.intelligence.extracted_data as ExtractedData)?.content || '',
        confidence: item.intelligence.confidence ? parseFloat(item.intelligence.confidence) : 0,
        importance: item.intelligence.importance,
        tags: (item.intelligence.tags as string[]) || [],
        collectedAt: item.intelligence.collected_at,
        processedAt: item.intelligence.processed_at,
      }

      // Add competitor info if requested
      if (filters.includeCompetitorInfo && item.competitor) {
        Object.assign(baseData, {
          competitorName: item.competitor.name,
          competitorDomain: item.competitor.domain,
          competitorIndustry: item.competitor.industry,
          competitorThreatLevel: item.competitor.threatLevel,
        })
      }

      // Add raw content if requested
      if (filters.includeRawContent) {
        Object.assign(baseData, {
          rawContent: item.intelligence.raw_content,
        })
      }

      // Add analysis if requested
      if (filters.includeAnalysis) {
        const analysisResults = (item.intelligence.analysis_results as AnalysisResult[]) || []
        Object.assign(baseData, {
          analysisCount: analysisResults.length,
          analyzingAgents: analysisResults.map(a => a.agentId).join(', '),
          insights: analysisResults.flatMap(a => a.insights?.map(i => i.description) || []).join('; '),
          recommendations: analysisResults.flatMap(a => a.recommendations?.map(r => r.description) || []).join('; '),
        })
      }

      return baseData
    })

    // Generate export based on format
    switch (filters.format) {
      case 'json':
        return NextResponse.json({
          data: exportData,
          metadata: {
            exportedAt: new Date().toISOString(),
            totalRecords: exportData.length,
            filters: filters,
            exportedBy: user.id,
          }
        }, {
          headers: {
            'Content-Disposition': `attachment; filename="intelligence-export-${new Date().toISOString().split('T')[0]}.json"`,
          }
        })

      case 'csv':
        // Convert to CSV
        if (exportData.length === 0) {
          return new NextResponse('No data to export', { status: 400 })
        }

        const headers = Object.keys(exportData[0])
        const csvContent = [
          headers.join(','),
          ...exportData.map(row => 
            headers.map(header => {
              const value = (row as any)[header]
              if (Array.isArray(value)) {
                return `"${value.join('; ')}"`
              }
              if (typeof value === 'string' && value.includes(',')) {
                return `"${value.replace(/"/g, '""')}"`
              }
              return value || ''
            }).join(',')
          )
        ].join('\n')

        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="intelligence-export-${new Date().toISOString().split('T')[0]}.csv"`,
          }
        })

      case 'xlsx':
        // For XLSX, we'll return JSON with instructions to use a client-side library
        return NextResponse.json({
          message: 'XLSX export requires client-side processing',
          data: exportData,
          format: 'xlsx-data'
        })

      default:
        return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error exporting intelligence data:', error)
    return NextResponse.json(
      { error: 'Failed to export intelligence data' },
      { status: 500 }
    )
  }
}