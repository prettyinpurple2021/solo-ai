import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { getSql } from '@/lib/api-utils'
import { createErrorResponse } from '@/lib/api-response'
import { logError, logInfo } from '@/lib/logger'
import { db } from '@/db'
import { competitorProfiles } from '@/shared/db/schema'
import { z } from 'zod'




// Force dynamic rendering
export const dynamic = 'force-dynamic'



export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:list', ip, 60_000, 30)
    if (!allowed) {
      return createErrorResponse('Too many requests', 429)
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const threatLevel = url.searchParams.get('threatLevel')
    const industry = url.searchParams.get('industry')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')
    
    const offset = (page - 1) * limit

    // Build dynamic query based on filters
    let whereConditions = [`user_id = $1`]
    let params = [user.id]
    let paramIndex = 2
    
    if (threatLevel && threatLevel !== 'all') {
      whereConditions.push(`threat_level = $${paramIndex}`)
      params.push(threatLevel)
      paramIndex++
    }
    
    if (industry && industry !== 'all') {
      whereConditions.push(`industry ILIKE $${paramIndex}`)
      params.push(`%${industry}%`)
      paramIndex++
    }
    
    if (status && status !== 'all') {
      whereConditions.push(`monitoring_status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }
    
    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR domain ILIKE $${paramIndex + 1} OR description ILIKE $${paramIndex + 2})`)
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
      paramIndex += 3
    }

    const whereClause = whereConditions.join(' AND ')
    const sql = getSql()
    const sqlClient = sql as any

    // Get competitors with pagination
    const queryParams = [...params, limit, offset]
    const competitorsQuery = `
      SELECT 
        id,
        name,
        domain,
        description,
        industry,
        estimated_size,
        threat_level,
        reasoning,
        confidence_score,
        key_indicators,
        monitoring_config,
        monitoring_status,
        last_scraped_at,
        created_at,
        updated_at
      FROM competitor_profiles 
      WHERE ${whereClause}
      ORDER BY 
        CASE threat_level 
          WHEN 'critical' THEN 4 
          WHEN 'high' THEN 3 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 1 
        END DESC,
        created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    const competitors = await sqlClient.unsafe(competitorsQuery, queryParams) as any[]

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM competitor_profiles 
      WHERE ${whereClause}
    `
    const countResult = await sqlClient.unsafe(countQuery, params) as any[]

    const total = parseInt(countResult[0]?.total || '0')

    // Transform the data
    const transformedCompetitors = competitors.map((competitor: any) => ({
      id: competitor.id,
      name: competitor.name,
      domain: competitor.domain,
      description: competitor.description || '',
      industry: competitor.industry || '',
      estimatedSize: competitor.estimated_size || 'medium',
      threatLevel: competitor.threat_level,
      reasoning: competitor.reasoning || '',
      confidence: competitor.confidence_score || 0.5,
      keyIndicators: competitor.key_indicators || [],
      monitoringConfig: competitor.monitoring_config || {},
      monitoringStatus: competitor.monitoring_status || 'active',
      lastScrapedAt: competitor.last_scraped_at,
      createdAt: competitor.created_at,
      updatedAt: competitor.updated_at,
    }))

    return NextResponse.json({
      success: true,
      competitors: transformedCompetitors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    logError('Error fetching competitors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    )
  }
}

// Validator for competitor creation
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
})

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:create', ip, 60_000, 10)
    
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // 2. Authentication
    const { user, error: authError } = await authenticateRequest()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 3. Parse & Validate Body
    const body = await request.json()
    const validatedData = createCompetitorSchema.parse(body)

    // 4. Database Insertion
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
      // Default values for other fields
      key_personnel: [],
      products: [],
      market_position: {},
      competitive_advantages: [],
      vulnerabilities: []
    }).returning()

    logInfo('Competitor created', { 
      competitorId: newCompetitor.id, 
      userId: user.id 
    })

    return NextResponse.json({ 
      success: true, 
      competitor: newCompetitor 
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
    }

    logError('Error creating competitor:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
