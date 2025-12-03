import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse } from '@/lib/api-response'
import { getSql } from '@/lib/api-utils'
import { authenticateRequest } from '@/lib/auth-server'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const includeCompetitive = searchParams.get('include_competitive') === 'true'
    const competitiveOnly = searchParams.get('competitive_only') === 'true'

    const sql = getSql()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tasks: any[] = []

    if (includeCompetitive) {
      if (competitiveOnly) {
        tasks = await sql`
          SELECT t.*, 
                 g.title as goal_title,
                 g.category as goal_category,
                 cp.name as competitor_name,
                 cp.threat_level as competitor_threat_level,
                 ca.title as alert_title,
                 ca.severity as alert_severity
          FROM tasks t
          LEFT JOIN goals g ON t.goal_id = g.id
          LEFT JOIN competitor_alerts ca ON (t.ai_suggestions->>'alert_id')::text = ca.id::text
          LEFT JOIN competitor_profiles cp ON ca.competitor_id = cp.id
          WHERE t.user_id = ${user.id} 
          AND t.ai_suggestions->>'source' = 'competitive_intelligence'
          ORDER BY t.created_at DESC
        `
      } else {
        tasks = await sql`
          SELECT t.*, 
                 g.title as goal_title,
                 g.category as goal_category,
                 cp.name as competitor_name,
                 cp.threat_level as competitor_threat_level,
                 ca.title as alert_title,
                 ca.severity as alert_severity
          FROM tasks t
          LEFT JOIN goals g ON t.goal_id = g.id
          LEFT JOIN competitor_alerts ca ON (t.ai_suggestions->>'alert_id')::text = ca.id::text
          LEFT JOIN competitor_profiles cp ON ca.competitor_id = cp.id
          WHERE t.user_id = ${user.id}
          ORDER BY t.created_at DESC
        `
      }
    } else {
      if (competitiveOnly) {
        tasks = await sql`
          SELECT t.*, 
                 g.title as goal_title,
                 g.category as goal_category
          FROM tasks t
          LEFT JOIN goals g ON t.goal_id = g.id
          WHERE t.user_id = ${user.id}
          AND t.ai_suggestions->>'source' = 'competitive_intelligence'
          ORDER BY t.created_at DESC
        `
      } else {
        tasks = await sql`
          SELECT t.*, 
                 g.title as goal_title,
                 g.category as goal_category
          FROM tasks t
          LEFT JOIN goals g ON t.goal_id = g.id
          WHERE t.user_id = ${user.id}
          ORDER BY t.created_at DESC
        `
      }
    }

    // Enhance tasks with competitive intelligence context
    const enhancedTasks = tasks.map(task => {
      const aiSuggestions = task.ai_suggestions || {}
      const isCompetitiveTask = aiSuggestions.source === 'competitive_intelligence'

      return {
        ...task,
        competitive_intelligence: isCompetitiveTask ? {
          is_competitive_task: true,
          alert_id: aiSuggestions.alert_id,
          competitor_id: aiSuggestions.competitor_id,
          competitor_name: task.competitor_name,
          threat_level: task.competitor_threat_level,
          alert_title: task.alert_title,
          alert_severity: task.alert_severity,
          template_id: aiSuggestions.template_id,
          created_from_alert: aiSuggestions.created_from_alert || false,
          milestone_type: aiSuggestions.milestone_type
        } : {
          is_competitive_task: false
        }
      }
    })

    return NextResponse.json({ tasks: enhancedTasks })
  } catch (error) {
    logError('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return createErrorResponse('Unauthorized', 401)
    }

    const BodySchema = z.object({
      title: z.string().min(1, 'Task title is required'),
      description: z.string().optional(),
      priority: z.string().optional(),
      due_date: z.union([z.string(), z.date()]).optional(),
      category: z.string().optional(),
    })
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return createErrorResponse('Invalid payload', 400, parsed.error.flatten())
    }
    const { title, description, priority, due_date, category } = parsed.data

    const sql = getSql()
    const rows = await sql`
      INSERT INTO tasks (user_id, title, description, priority, due_date, category, status)
      VALUES (${user.id}, ${title}, ${description || ''}, ${priority || 'medium'}, ${due_date}, ${category || 'general'}, 'pending')
      RETURNING *
    `

    return NextResponse.json({ task: rows[0] }, { status: 201 })
  } catch (error) {
    logError('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
