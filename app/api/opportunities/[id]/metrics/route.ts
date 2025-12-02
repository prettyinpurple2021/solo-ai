import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { opportunityRecommendationSystem } from '@/lib/opportunity-recommendation-system'
import { db } from '@/db'
import { competitiveOpportunities, opportunityMetrics } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

const updateMetricSchema = z.object({
  metricName: z.string().min(1).max(100),
  value: z.number(),
  notes: z.string().optional()
})

const createMetricSchema = z.object({
  metricName: z.string().min(1).max(100),
  metricType: z.enum(['revenue', 'cost_savings', 'market_share', 'customer_acquisition', 'efficiency', 'brand', 'custom']),
  baselineValue: z.number().optional(),
  targetValue: z.number(),
  currentValue: z.number(),
  unit: z.string().min(1).max(50)
})

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const contextParams = await context.params
    const opportunityId = contextParams.id

    // Verify opportunity exists and belongs to user
    const opportunity = await db
      .select()
      .from(competitiveOpportunities)
      .where(
        and(
          eq(competitiveOpportunities.id, opportunityId),
          eq(competitiveOpportunities.user_id, user.id)
        )
      )
      .limit(1)

    if (opportunity.length === 0) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Get metrics for the opportunity
    const metrics = await db
      .select()
      .from(opportunityMetrics)
      .where(eq(opportunityMetrics.opportunity_id, opportunityId))

    return NextResponse.json({
      metrics
    })
  } catch (error) {
    logError('Error getting opportunity metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const contextParams = await context.params
    const opportunityId = contextParams.id

    // Verify opportunity exists and belongs to user
    const opportunity = await db
      .select()
      .from(competitiveOpportunities)
      .where(
        and(
          eq(competitiveOpportunities.id, opportunityId),
          eq(competitiveOpportunities.user_id, user.id)
        )
      )
      .limit(1)

    if (opportunity.length === 0) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createMetricSchema.parse(body)

    // Create new metric
    const [newMetric] = await db
      .insert(opportunityMetrics)
      .values({
        opportunity_id: opportunityId,
        user_id: user.id,
        metric_name: validatedData.metricName,
        metric_type: validatedData.metricType,
        baseline_value: validatedData.baselineValue?.toString(),
        target_value: validatedData.targetValue.toString(),
        current_value: validatedData.currentValue.toString(),
        unit: validatedData.unit
      })
      .returning()

    return NextResponse.json({
      metric: newMetric
    }, { status: 201 })
  } catch (error) {
    logError('Error creating opportunity metric:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as any).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const contextParams = await context.params
    const opportunityId = contextParams.id

    // Verify opportunity exists and belongs to user
    const opportunity = await db
      .select()
      .from(competitiveOpportunities)
      .where(
        and(
          eq(competitiveOpportunities.id, opportunityId),
          eq(competitiveOpportunities.user_id, user.id)
        )
      )
      .limit(1)

    if (opportunity.length === 0) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateMetricSchema.parse(body)

    // Update metric
    const success = await opportunityRecommendationSystem.updateMetric(
      opportunityId,
      user.id,
      validatedData.metricName,
      validatedData.value,
      validatedData.notes
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update metric' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Metric updated successfully'
    })
  } catch (error) {
    logError('Error updating opportunity metric:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as any).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}