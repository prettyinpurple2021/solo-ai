import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { getIdempotencyKeyFromRequest, reserveIdempotencyKey } from '@/lib/idempotency'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeCompetitive = searchParams.get('include_competitive') === 'true'

    const client = await createClient()
    
    let query = `
      SELECT g.*,
             COUNT(t.id) as total_tasks,
             COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks
      FROM goals g
      LEFT JOIN tasks t ON t.goal_id = g.id
      WHERE g.user_id = $1
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `
    
    if (includeCompetitive) {
      query = `
        SELECT g.*,
               COUNT(t.id) as total_tasks,
               COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
               COUNT(CASE WHEN t.ai_suggestions->>'source' = 'competitive_intelligence' THEN 1 END) as competitive_tasks,
               cp.name as primary_competitor_name,
               cp.threat_level as primary_competitor_threat_level
        FROM goals g
        LEFT JOIN tasks t ON t.goal_id = g.id
        LEFT JOIN competitor_profiles cp ON cp.id = (g.ai_suggestions->'competitive_context'->>'competitorId')::int
        WHERE g.user_id = $1
        GROUP BY g.id, cp.name, cp.threat_level
        ORDER BY g.created_at DESC
      `
    }
    
    const { rows: goals } = await client.query(query, [user.id])

    // Enhance goals with competitive intelligence context if requested
    const enhancedGoals = goals.map(goal => {
      const competitiveContext = goal.ai_suggestions?.competitive_context
      return {
        ...goal,
        competitive_intelligence: includeCompetitive && competitiveContext ? {
          has_competitive_context: true,
          competitor_id: competitiveContext.competitorId,
          competitor_name: goal.primary_competitor_name || competitiveContext.competitorName,
          threat_level: goal.primary_competitor_threat_level || competitiveContext.threatLevel,
          competitive_tasks_count: parseInt(goal.competitive_tasks) || 0,
          benchmark_metrics: competitiveContext.benchmarkMetrics || []
        } : {
          has_competitive_context: false,
          competitive_tasks_count: 0
        }
      }
    })

    return NextResponse.json({ goals: enhancedGoals })
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('goals:create', ip, 60_000, 60)
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const BodySchema = z.object({
      title: z.string().min(1, 'Goal title is required'),
      description: z.string().optional(),
      target_date: z.union([z.string(), z.date()]).optional(),
      category: z.string().optional(),
      priority: z.string().optional(),
    })
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const { title, description, target_date, category, priority } = parsed.data as any

    const client = await createClient()

    // Idempotency support
    const key = getIdempotencyKeyFromRequest(request)
    if (key) {
      const reserved = await reserveIdempotencyKey(client, key)
      if (!reserved) {
        return NextResponse.json({ error: 'Duplicate request' }, { status: 409 })
      }
    }
    const { rows } = await client.query(
      `INSERT INTO goals (user_id, title, description, target_date, category, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING *`,
      [user.id, title, description || '', target_date, category || 'general', priority || 'medium']
    )

    return NextResponse.json({ goal: rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}
