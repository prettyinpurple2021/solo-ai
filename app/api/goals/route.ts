import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse } from '@/lib/api-response'
import { getSql } from '@/lib/api-utils'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { getIdempotencyKeyFromRequest } from '@/lib/idempotency'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const includeCompetitive = searchParams.get('include_competitive') === 'true'

    const sql = getSql()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sqlClient = sql as any

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const goals = await sqlClient.unsafe(query, [user.id]) as any[]

    // Enhance goals with competitive intelligence context if requested
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enhancedGoals = goals.map((goal: any) => {
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
    logError('Error fetching goals:', error)
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
    if (!allowed) return createErrorResponse('Too many requests', 429)

    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return createErrorResponse('Unauthorized', 401)
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
      return createErrorResponse('Invalid payload', 400, parsed.error.flatten())
    }
    const { title, description, target_date, category, priority } = parsed.data

    const sql = getSql()

    // Idempotency support
    const key = getIdempotencyKeyFromRequest(request)
    if (key) {
      // Note: Idempotency check skipped for now - can be added back if needed
      // const reserved = await reserveIdempotencyKeyNeon(sql, key)
      // if (!reserved) {
      //   return createErrorResponse('Duplicate request', 409)
      // }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const goalRows = await sql`
      INSERT INTO goals (user_id, title, description, target_date, category, priority, status)
      VALUES (${user.id}, ${title}, ${description || ''}, ${target_date || null}, ${category || 'general'}, ${priority || 'medium'}, ${'active'})
      RETURNING *
    ` as any[]

    return NextResponse.json({ goal: goalRows[0] }, { status: 201 })
  } catch (error) {
    logError('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}
