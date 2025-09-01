import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { opportunityRecommendationSystem } from '@/lib/opportunity-recommendation-system'
import { db } from '@/db'
import { competitiveOpportunities, opportunityActions, opportunityMetrics } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const updateOpportunitySchema = z.object({
  status: z.enum(['identified', 'planned', 'in_progress', 'completed', 'paused', 'cancelled']).optional(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  actualROI: z.number().optional(),
  actualRevenue: z.number().optional(),
  actualCosts: z.number().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const authResult = await authenticateRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const opportunityId = params.id

    // Get opportunity details
    const opportunity = await db
      .select()
      .from(competitiveOpportunities)
      .where(
        and(
          eq(competitiveOpportunities.id, opportunityId),
          eq(competitiveOpportunities.user_id, authResult.user.id)
        )
      )
      .limit(1)

    if (opportunity.length === 0) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Get associated actions
    const actions = await db
      .select()
      .from(opportunityActions)
      .where(eq(opportunityActions.opportunity_id, opportunityId))

    // Get associated metrics
    const metrics = await db
      .select()
      .from(opportunityMetrics)
      .where(eq(opportunityMetrics.opportunity_id, opportunityId))

    return NextResponse.json({
      opportunity: opportunity[0],
      actions,
      metrics
    })
  } catch (error) {
    console.error('Error getting opportunity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const authResult = await authenticateRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const opportunityId = params.id

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateOpportunitySchema.parse(body)

    // Check if opportunity exists and belongs to user
    const existingOpportunity = await db
      .select()
      .from(competitiveOpportunities)
      .where(
        and(
          eq(competitiveOpportunities.id, opportunityId),
          eq(competitiveOpportunities.user_id, authResult.user.id)
        )
      )
      .limit(1)

    if (existingOpportunity.length === 0) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Update opportunity status if provided
    if (validatedData.status) {
      await opportunityRecommendationSystem.updateOpportunityStatus(
        opportunityId,
        authResult.user.id,
        validatedData.status,
        validatedData.progress,
        validatedData.notes
      )
    }

    // Track ROI if provided
    if (validatedData.actualROI !== undefined) {
      await opportunityRecommendationSystem.trackOpportunityROI(
        opportunityId,
        authResult.user.id,
        validatedData.actualROI,
        validatedData.actualRevenue,
        validatedData.actualCosts,
        validatedData.notes
      )
    }

    // Update assignment if provided
    if (validatedData.assignedTo !== undefined) {
      await db
        .update(competitiveOpportunities)
        .set({
          assigned_to: validatedData.assignedTo,
          updated_at: new Date()
        })
        .where(eq(competitiveOpportunities.id, opportunityId))
    }

    // Get updated opportunity
    const updatedOpportunity = await db
      .select()
      .from(competitiveOpportunities)
      .where(eq(competitiveOpportunities.id, opportunityId))
      .limit(1)

    return NextResponse.json({
      opportunity: updatedOpportunity[0]
    })
  } catch (error) {
    console.error('Error updating opportunity:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const authResult = await authenticateRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const opportunityId = params.id

    // Check if opportunity exists and belongs to user
    const existingOpportunity = await db
      .select()
      .from(competitiveOpportunities)
      .where(
        and(
          eq(competitiveOpportunities.id, opportunityId),
          eq(competitiveOpportunities.user_id, authResult.user.id)
        )
      )
      .limit(1)

    if (existingOpportunity.length === 0) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Soft delete by archiving
    await db
      .update(competitiveOpportunities)
      .set({
        is_archived: true,
        updated_at: new Date()
      })
      .where(eq(competitiveOpportunities.id, opportunityId))

    return NextResponse.json({
      message: 'Opportunity archived successfully'
    })
  } catch (error) {
    console.error('Error deleting opportunity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}