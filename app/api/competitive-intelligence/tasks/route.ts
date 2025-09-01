import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { CompetitiveIntelligenceIntegration } from '@/lib/competitive-intelligence-integration'
import { createClient } from '@/lib/db'
import { z } from 'zod'

// GET /api/competitive-intelligence/tasks - Get competitive intelligence tasks
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const competitorId = searchParams.get('competitor_id')
    const alertId = searchParams.get('alert_id')

    const client = await createClient()
    
    let query = `
      SELECT t.*, cp.name as competitor_name, ca.title as alert_title
      FROM tasks t
      LEFT JOIN competitor_alerts ca ON (t.ai_suggestions->>'alert_id')::text = ca.id::text
      LEFT JOIN competitor_profiles cp ON ca.competitor_id = cp.id
      WHERE t.user_id = $1 
      AND t.ai_suggestions->>'source' = 'competitive_intelligence'
    `
    
    const params = [user.id]
    
    if (competitorId) {
      query += ` AND (t.ai_suggestions->>'competitor_id')::text = $${params.length + 1}`
      params.push(competitorId)
    }
    
    if (alertId) {
      query += ` AND (t.ai_suggestions->>'alert_id')::text = $${params.length + 1}`
      params.push(alertId)
    }
    
    query += ` ORDER BY t.created_at DESC`
    
    const { rows: tasks } = await client.query(query, params)
    
    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching competitive intelligence tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitive intelligence tasks' },
      { status: 500 }
    )
  }
}

// POST /api/competitive-intelligence/tasks - Create task from alert
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const { alert_id, template_id, custom_title, custom_description, priority, goal_id } = BodySchema.parse(body)

    const client = await createClient()
    
    // Get the alert
    const { rows: alertRows } = await client.query(
      'SELECT * FROM competitor_alerts WHERE id = $1 AND user_id = $2',
      [alert_id, user.id]
    )
    
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
      
      await client.query(
        `UPDATE tasks SET ${updateFields.join(', ')} 
         WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}`,
        updateValues
      )
    }
    
    // Get the created task
    const { rows: taskRows } = await client.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, user.id]
    )
    
    return NextResponse.json({ task: taskRows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating competitive intelligence task:', error)
    return NextResponse.json(
      { error: 'Failed to create competitive intelligence task' },
      { status: 500 }
    )
  }
}