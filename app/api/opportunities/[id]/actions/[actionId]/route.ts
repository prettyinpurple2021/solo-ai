import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { db } from '@/db'
import { competitiveOpportunities, opportunityActions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

const updateActionSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  estimatedEffortHours: z.number().min(0).optional(),
  actualEffortHours: z.number().min(0).optional(),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  expectedOutcome: z.string().optional(),
  actualOutcome: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  dueDate: z.string().optional()
})

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; actionId: string }> }
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
    const { id: opportunityId, actionId } = contextParams

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

    // Get specific action
    const action = await db
      .select()
      .from(opportunityActions)
      .where(
        and(
          eq(opportunityActions.id, parseInt(actionId)),
          eq(opportunityActions.opportunity_id, opportunityId),
          eq(opportunityActions.user_id, user.id)
        )
      )
      .limit(1)

    if (action.length === 0) {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      action: action[0]
    })
  } catch (error) {
    logError('Error getting opportunity action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; actionId: string }> }
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
    const { id: opportunityId, actionId } = contextParams

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

    // Verify action exists and belongs to user
    const existingAction = await db
      .select()
      .from(opportunityActions)
      .where(
        and(
          eq(opportunityActions.id, parseInt(actionId)),
          eq(opportunityActions.opportunity_id, opportunityId),
          eq(opportunityActions.user_id, user.id)
        )
      )
      .limit(1)

    if (existingAction.length === 0) {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateActionSchema.parse(body)

    // Build update object
    const updateData: any = {
      updated_at: new Date()
    }

    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority
    if (validatedData.estimatedEffortHours !== undefined) updateData.estimated_effort_hours = validatedData.estimatedEffortHours
    if (validatedData.actualEffortHours !== undefined) updateData.actual_effort_hours = validatedData.actualEffortHours
    if (validatedData.estimatedCost !== undefined) updateData.estimated_cost = validatedData.estimatedCost.toString()
    if (validatedData.actualCost !== undefined) updateData.actual_cost = validatedData.actualCost.toString()
    if (validatedData.expectedOutcome !== undefined) updateData.expected_outcome = validatedData.expectedOutcome
    if (validatedData.actualOutcome !== undefined) updateData.actual_outcome = validatedData.actualOutcome
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
      if (validatedData.status === 'completed') {
        updateData.completed_at = new Date()
      }
    }
    if (validatedData.dueDate !== undefined) {
      updateData.due_date = validatedData.dueDate ? new Date(validatedData.dueDate) : null
    }

    // Update action
    const [updatedAction] = await db
      .update(opportunityActions)
      .set(updateData)
      .where(eq(opportunityActions.id, parseInt(actionId)))
      .returning()

    return NextResponse.json({
      action: updatedAction
    })
  } catch (error) {
    logError('Error updating opportunity action:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as z.ZodError).errors },
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
  context: { params: Promise<{ id: string; actionId: string }> }
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
    const { id: opportunityId, actionId } = contextParams

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

    // Verify action exists and belongs to user
    const existingAction = await db
      .select()
      .from(opportunityActions)
      .where(
        and(
          eq(opportunityActions.id, parseInt(actionId)),
          eq(opportunityActions.opportunity_id, opportunityId),
          eq(opportunityActions.user_id, user.id)
        )
      )
      .limit(1)

    if (existingAction.length === 0) {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      )
    }

    // Delete action
    await db
      .delete(opportunityActions)
      .where(eq(opportunityActions.id, parseInt(actionId)))

    return NextResponse.json({
      message: 'Action deleted successfully'
    })
  } catch (error) {
    logError('Error deleting opportunity action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}