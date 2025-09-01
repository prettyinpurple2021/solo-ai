import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { CompetitiveIntelligenceIntegration } from '@/lib/competitive-intelligence-integration'
import { createClient } from '@/lib/db'
import { z } from 'zod'

// GET /api/competitive-intelligence/goals - Get goals with competitive context
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const competitorId = searchParams.get('competitor_id')
    const goalId = searchParams.get('goal_id')

    const client = await createClient()
    
    if (goalId) {
      // Get specific goal with competitive progress
      const progress = await CompetitiveIntelligenceIntegration.getCompetitiveProgress(
        parseInt(goalId), 
        user.id
      )
      
      if (!progress) {
        return NextResponse.json({ error: 'Goal not found or no competitive context' }, { status: 404 })
      }
      
      return NextResponse.json({ progress })
    }
    
    // Get all goals with competitive context
    let query = `
      SELECT g.*, 
             COUNT(t.id) as competitive_tasks_count,
             COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_competitive_tasks
      FROM goals g
      LEFT JOIN tasks t ON t.goal_id = g.id 
        AND t.ai_suggestions->>'source' = 'competitive_intelligence'
      WHERE g.user_id = $1 
      AND g.ai_suggestions ? 'competitive_context'
    `
    
    const params = [user.id]
    
    if (competitorId) {
      query += ` AND (g.ai_suggestions->'competitive_context'->>'competitorId')::text = $${params.length + 1}`
      params.push(competitorId)
    }
    
    query += ` GROUP BY g.id ORDER BY g.created_at DESC`
    
    const { rows: goals } = await client.query(query, params)
    
    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Error fetching competitive goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitive goals' },
      { status: 500 }
    )
  }
}

// POST /api/competitive-intelligence/goals - Add competitive context to goal
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitive-goals:create', ip, 60_000, 20)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const BodySchema = z.object({
      goal_id: z.number(),
      competitor_id: z.number(),
      create_milestones: z.boolean().optional().default(false),
      milestone_data: z.array(z.object({
        title: z.string(),
        description: z.string(),
        target_metric: z.string(),
        competitor_benchmark: z.union([z.number(), z.string()]),
        target_value: z.union([z.number(), z.string()]),
        due_date: z.string().optional()
      })).optional()
    })

    const { goal_id, competitor_id, create_milestones, milestone_data } = BodySchema.parse(body)

    // Add competitive context to goal
    const context = await CompetitiveIntelligenceIntegration.addCompetitiveContextToGoal(
      goal_id,
      competitor_id,
      user.id
    )
    
    if (!context) {
      return NextResponse.json({ error: 'Failed to add competitive context' }, { status: 500 })
    }
    
    // Create competitive milestones if requested
    const createdMilestones = []
    if (create_milestones && milestone_data) {
      for (const milestone of milestone_data) {
        const milestoneId = await CompetitiveIntelligenceIntegration.createCompetitiveMilestone(
          goal_id,
          competitor_id,
          {
            ...milestone,
            dueDate: milestone.due_date ? new Date(milestone.due_date) : undefined
          },
          user.id
        )
        
        if (milestoneId) {
          createdMilestones.push(milestoneId)
        }
      }
    }
    
    return NextResponse.json({ 
      context,
      milestones_created: createdMilestones.length,
      milestone_ids: createdMilestones
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding competitive context to goal:', error)
    return NextResponse.json(
      { error: 'Failed to add competitive context to goal' },
      { status: 500 }
    )
  }
}