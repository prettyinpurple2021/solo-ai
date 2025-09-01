import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { db } from '@/db'
import { competitiveOpportunities, opportunityActions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const createActionSchema = z.object({
  actionType: z.string().min(1).max(50),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  estimatedEffortHours: z.number().min(0).optional(),
  estimatedCost: z.number().min(0).optional(),
  expectedOutcome: z.string().optional(),
  dueDate: z.string().optional()
})

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

    // Verify opportunity exists and belongs to user
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

    // Get actions for the opportunity
    const actions = await db
      .select()
      .from(opportunityActions)
      .where(eq(opportunityActions.opportunity_id, opportunityId))

    return NextResponse.json({
      actions
    })
  } catch (error) {
    console.error('Error getting opportunity actions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    // Verify opportunity exists and belongs to user
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createActionSchema.parse(body)

    // Create new action
    const [newAction] = await db
      .insert(opportunityActions)
      .values({
        opportunity_id: opportunityId,
        user_id: authResult.user.id,
        action_type: validatedData.actionType,
        title: validatedData.title,
        description: validatedData.description,
        priority: validatedData.priority,
        estimated_effort_hours: validatedData.estimatedEffortHours,
        estimated_cost: validatedData.estimatedCost?.toString(),
        expected_outcome: validatedData.expectedOutcome,
        due_date: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        status: 'pending'
      })
      .returning()

    return NextResponse.json({
      action: newAction
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating opportunity action:', error)
    
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