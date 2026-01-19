import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server'
import { authenticateRequest} from '@/lib/auth-server'
import { rateLimitByIp} from '@/lib/rate-limit'
import { CompetitiveIntelligenceIntegration} from '@/lib/competitive-intelligence-integration'
import { getSql } from '@/lib/api-utils'
import { z} from 'zod'





// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/competitive-intelligence/milestones - Get competitive milestones
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
      if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('goal_id')
    const competitorId = searchParams.get('competitor_id')

    const sql = getSql()
    const sqlClient = sql as any
    
    let query = `
      SELECT t.*, g.title as goal_title, cp.name as competitor_name
      FROM tasks t
      LEFT JOIN goals g ON t.goal_id = g.id
      LEFT JOIN competitor_profiles cp ON (t.ai_suggestions->>'competitor_id')::int = cp.id
      WHERE t.user_id = $1 
      AND t.category = 'Competitive Milestone'
      AND t.ai_suggestions->>'milestone_type' = 'competitive_benchmark'
    `
    
    const params = [user.id]
    
    if (goalId) {
      query += ` AND t.goal_id = $${params.length + 1}`
      params.push(goalId)
    }
    
    if (competitorId) {
      query += ` AND (t.ai_suggestions->>'competitor_id')::text = $${params.length + 1}`
      params.push(competitorId)
    }
    
    query += ` ORDER BY t.due_date ASC, t.created_at DESC`
    
    const milestones = await sqlClient.unsafe(query, params) as any[]
    
    // Enhance milestones with progress data
    const enhancedMilestones = milestones.map((milestone: any) => {
      const aiSuggestions = milestone.ai_suggestions || {}
      return {
        ...milestone,
        competitive_data: {
          competitor_id: aiSuggestions.competitor_id,
          target_metric: aiSuggestions.target_metric,
          competitor_benchmark: aiSuggestions.competitor_benchmark,
          target_value: aiSuggestions.target_value,
          progress_percentage: milestone.status === 'completed' ? 100 : 0
        }
      }
    })
    
    return NextResponse.json({ milestones: enhancedMilestones })
  } catch (error) {
    logError('Error fetching competitive milestones:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitive milestones' },
      { status: 500 }
    )
  }
}

// POST /api/competitive-intelligence/milestones - Create competitive milestone
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
      if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
    
    const sql = getSql()

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitive-milestones:create', ip, 60_000, 20)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const BodySchema = z.object({
      goal_id: z.number(),
      competitor_id: z.number(),
      title: z.string().min(1),
      description: z.string(),
      target_metric: z.string(),
      competitor_benchmark: z.union([z.number(), z.string()]),
      target_value: z.union([z.number(), z.string()]),
      due_date: z.string().optional()
    })

    const milestoneData = BodySchema.parse(body)

    const milestoneId = await CompetitiveIntelligenceIntegration.createCompetitiveMilestone(
      milestoneData.goal_id,
      milestoneData.competitor_id,
      {
        title: milestoneData.title,
        description: milestoneData.description,
        targetMetric: milestoneData.target_metric,
        competitorBenchmark: milestoneData.competitor_benchmark,
        targetValue: milestoneData.target_value,
        dueDate: milestoneData.due_date ? new Date(milestoneData.due_date) : undefined
      },
      user.id
    )
    
    if (!milestoneId) {
      return NextResponse.json({ error: 'Failed to create competitive milestone' }, { status: 500 })
    }
    
    // Get the created milestone
    const milestoneRows = await sql`
      SELECT * FROM tasks WHERE id = ${milestoneId} AND user_id = ${user.id}
    ` as any[]
    
    return NextResponse.json({ milestone: milestoneRows[0] }, { status: 201 })
  } catch (error) {
    logError('Error creating competitive milestone:', error)
    return NextResponse.json(
      { error: 'Failed to create competitive milestone' },
      { status: 500 }
    )
  }
}

// PUT /api/competitive-intelligence/milestones/[id] - Update milestone progress
export async function PUT(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
      if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
    
    const sql = getSql()
    const sqlClient = sql as any

    const body = await request.json()
    const BodySchema = z.object({
      milestone_id: z.number(),
      current_value: z.union([z.number(), z.string()]).optional(),
      progress_notes: z.string().optional(),
      status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional()
    })

    const { milestone_id, current_value, progress_notes, status } = BodySchema.parse(body)

    
    // Get current milestone
    const milestoneRows = await sql`
      SELECT * FROM tasks WHERE id = ${milestone_id} AND user_id = ${user.id} AND category = ${'Competitive Milestone'}
    ` as any[]
    
    if (milestoneRows.length === 0) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }
    
    const milestone = milestoneRows[0]
    const aiSuggestions = milestone.ai_suggestions || {}
    
    // Update AI suggestions with progress data
    const updatedAiSuggestions = {
      ...aiSuggestions,
      current_value,
      progress_notes,
      last_updated: new Date().toISOString()
    }
    
    const updateFields = ['ai_suggestions = $1', 'updated_at = NOW()']
    const updateValues = [JSON.stringify(updatedAiSuggestions)]
    let paramIndex = 2
    
    if (status) {
      updateFields.push(`status = $${paramIndex}`)
      updateValues.push(status)
      paramIndex++
      
      if (status === 'completed') {
        updateFields.push(`completed_at = NOW()`)
      }
    }
    
    updateValues.push(milestone_id.toString(), user.id)
    
    const updatedRows = await sqlClient.unsafe(
      `UPDATE tasks SET ${updateFields.join(', ')} 
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} 
       RETURNING *`,
      updateValues
    ) as any[]
    
    return NextResponse.json({ milestone: updatedRows[0] })
  } catch (error) {
    logError('Error updating competitive milestone:', error)
    return NextResponse.json(
      { error: 'Failed to update competitive milestone' },
      { status: 500 }
    )
  }
}