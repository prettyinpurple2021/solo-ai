import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { opportunityRecommendationSystem } from '@/lib/opportunity-recommendation-system'
import { competitiveOpportunityDetector } from '@/lib/competitive-opportunity-detection'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

const createOpportunitySchema = z.object({
  competitorId: z.string(),
  opportunityType: z.enum([
    'competitor_weakness',
    'market_gap',
    'pricing_opportunity',
    'talent_acquisition',
    'partnership_opportunity',
    'product_gap',
    'service_improvement',
    'technology_advantage',
    'market_entry'
  ]),
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  confidence: z.number().min(0).max(1),
  impact: z.enum(['low', 'medium', 'high', 'critical']),
  effort: z.enum(['low', 'medium', 'high']),
  timing: z.enum(['immediate', 'short-term', 'medium-term', 'long-term']),
  evidence: z.array(z.object({
    type: z.string(),
    source: z.string(),
    content: z.string(),
    sentiment: z.number().optional(),
    relevance: z.number(),
    collectedAt: z.string()
  })).optional().default([]),
  recommendations: z.array(z.string()).optional().default([])
})

const getOpportunitiesSchema = z.object({
  status: z.array(z.string()).optional(),
  opportunityType: z.array(z.string()).optional(),
  impact: z.array(z.string()).optional(),
  competitorId: z.string().optional(),
  minPriorityScore: z.string().optional(),
  isArchived: z.string().optional(),
  sortField: z.enum(['priority_score', 'detected_at', 'impact', 'confidence']).optional().default('priority_score'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20')
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())

    // Parse arrays from query string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedParams: any = { ...queryParams }
    if (queryParams.status) {
      parsedParams.status = queryParams.status.split(',')
    }
    if (queryParams.opportunityType) {
      parsedParams.opportunityType = queryParams.opportunityType.split(',')
    }
    if (queryParams.impact) {
      parsedParams.impact = queryParams.impact.split(',')
    }

    const validatedParams = getOpportunitiesSchema.parse(parsedParams)

    // Build filters
    const filters = {
      status: validatedParams.status,
      opportunityType: validatedParams.opportunityType,
      impact: validatedParams.impact,
      competitorId: validatedParams.competitorId,
      minPriorityScore: validatedParams.minPriorityScore ? parseFloat(validatedParams.minPriorityScore) : undefined,
      isArchived: validatedParams.isArchived ? validatedParams.isArchived === 'true' : false
    }

    const sorting = {
      field: validatedParams.sortField,
      direction: validatedParams.sortDirection
    }

    // Get opportunities
    const opportunities = await opportunityRecommendationSystem.getOpportunities(
      user.id,
      filters,
      sorting
    )

    // Pagination
    const page = parseInt(validatedParams.page)
    const limit = parseInt(validatedParams.limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedOpportunities = opportunities.slice(startIndex, endIndex)

    return NextResponse.json({
      opportunities: paginatedOpportunities,
      pagination: {
        page,
        limit,
        total: opportunities.length,
        totalPages: Math.ceil(opportunities.length / limit)
      }
    })
  } catch (error) {
    logError('Error getting opportunities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createOpportunitySchema.parse(body)

    // Create opportunity detection result
    const opportunityResult = {
      id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      competitorId: validatedData.competitorId,
      opportunityType: validatedData.opportunityType,
      title: validatedData.title,
      description: validatedData.description,
      confidence: validatedData.confidence,
      impact: validatedData.impact,
      effort: validatedData.effort,
      timing: validatedData.timing,
      evidence: validatedData.evidence.map(e => ({
        ...e,
        collectedAt: new Date(e.collectedAt)
      })),
      recommendations: validatedData.recommendations,
      detectedAt: new Date()
    }

    // Generate recommendations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recommendations = await opportunityRecommendationSystem.generateRecommendations(opportunityResult as any)

    // Calculate prioritization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prioritization = await opportunityRecommendationSystem.calculatePriorityScore(opportunityResult as any)

    // Store opportunity
    const opportunityId = await opportunityRecommendationSystem.storeOpportunity(
      user.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      opportunityResult as any,
      recommendations,
      prioritization
    )

    return NextResponse.json({
      opportunityId,
      opportunity: opportunityResult,
      recommendations,
      prioritization
    }, { status: 201 })
  } catch (error) {
    logError('Error creating opportunity:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', // eslint-disable-next-line @typescript-eslint/no-explicit-any
        details: (error as any).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}