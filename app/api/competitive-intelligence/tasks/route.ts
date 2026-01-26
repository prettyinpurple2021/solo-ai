import { logError,} from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server'
import { authenticateRequest} from '@/lib/auth-server'
import { rateLimitByIp} from '@/lib/rate-limit'
import { CompetitiveIntelligenceIntegration} from '@/lib/competitive-intelligence-integration'
import { getSql } from '@/lib/api-utils'
import { z} from 'zod'





// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/competitive-intelligence/tasks - Get competitive intelligence tasks
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
      if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

    const { searchParams } = new URL(request.url)
    const competitorId = searchParams.get('competitor_id')
    const alertId = searchParams.get('alert_id')

    const sql = getSql()
    const sqlClient = sql as any
    
    let query = `
      SELECT t.*, cp.name as competitor_name, ca.title as alert_title
      FROM tasks t
      LEFT JOIN competitor_alerts ca ON (t.ai_suggestions->>'alert_id'): text = ca.id: text
      LEFT JOIN competitor_profiles cp ON ca.competitor_id = cp.id
      WHERE t.user_id = $1 
      AND t.ai_suggestions->>'source' = 'competitive_intelligence'
    `
    
    const params = [user.id]
    
    if (competitorId) {
      query += ` AND (t.ai_suggestions->>'competitor_id'): text = $2`
      params.push(competitorId)
      if (alertId) {
        query += ` AND (t.ai_suggestions->>'alert_id'): text = $3`
        params.push(alertId)
      }
    } else if (alertId) {
      query += ` AND (t.ai_suggestions->>'alert_id'): text = $2`
      params.push(alertId)
    }
    
    query += ` ORDER BY t.created_at DESC`
    
    const tasks = await sqlClient.unsafe(query, params) as any[]
    
    return NextResponse.json({ tasks })
  } catch (error) {
    logError('Error fetching competitive intelligence tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitive intelligence tasks' },
      { status: 500 }
    )
  }
}

// POST /api/competitive-intelligence/tasks - Create task from alert
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
      if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
    
    const sql = getSql()
    const sqlClient = sql as any

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitive-tasks:create', ip, 60_000, 30)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const BodySchema = z.object({
      alert_id: z.number(),
      template_id: z.string().optional(),
      custom_title: z.string().optional(),
      custom_description: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      goal_id: z.number().optional()
    })

    const { alert_id, custom_title, custom_description, priority, goal_id } = BodySchema.parse(body)

    
    // Get the alert
    const alertRows = await sql`
      SELECT * FROM competitor_alerts WHERE id = ${alert_id} AND user_id = ${user.id}
    ` as any[]
    
    if (alertRows.length === 0) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }
    
    const alert = alertRows[0]
    
    // Create task from alert
    const taskId = await CompetitiveIntelligenceIntegration.createTaskFromAlert(alert, user.id)
    
    if (!taskId) {
      return NextResponse.json({ error: 'Failed to create task from alert' }, { status: 500 })
    }
    
    // Update task with custom values if provided
    if (custom_title || custom_description || priority || goal_id) {
      const updateFields = []
      const updateValues = []
      let paramIndex = 1
      
      if (custom_title) {
        updateFields.push(`title = $${paramIndex}`)
        updateValues.push(custom_title)
        paramIndex++
      }
      
      if (custom_description) {
        updateFields.push(`description = $${paramIndex}`)
        updateValues.push(custom_description)
        paramIndex++
      }
      
      if (priority) {
        updateFields.push(`priority = $${paramIndex}`)
        updateValues.push(priority)
        paramIndex++
      }
      
      if (goal_id) {
        updateFields.push(`goal_id = $${paramIndex}`)
        updateValues.push(goal_id)
        paramIndex++
      }
      
      updateFields.push(`updated_at = NOW()`)
      updateValues.push(taskId, user.id)
      
      await sqlClient.unsafe(
        `UPDATE tasks SET ${updateFields.join(', ')} 
         WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}`,
        updateValues
      )
    }
    
    // Get the created task
    const taskRows = await sql`
      SELECT * FROM tasks WHERE id = ${taskId} AND user_id = ${user.id}
    ` as any[]
    
    return NextResponse.json({ task: taskRows[0] }, { status: 201 })
  } catch (error) {
    logError('Error creating competitive intelligence task:', error)
    return NextResponse.json(
      { error: 'Failed to create competitive intelligence task' },
      { status: 500 }
    )
  }
}