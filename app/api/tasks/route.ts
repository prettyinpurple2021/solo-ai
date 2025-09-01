import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { authenticateRequest } from '@/lib/auth-server'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeCompetitive = searchParams.get('include_competitive') === 'true'
    const competitiveOnly = searchParams.get('competitive_only') === 'true'

    const client = await createClient()
    
    let query = `
      SELECT t.*, 
             g.title as goal_title,
             g.category as goal_category
      FROM tasks t
      LEFT JOIN goals g ON t.goal_id = g.id
      WHERE t.user_id = $1
    `
    
    if (competitiveOnly) {
      query += ` AND t.ai_suggestions->>'source' = 'competitive_intelligence'`
    }
    
    if (includeCompetitive) {
      query = `
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
        WHERE t.user_id = $1
      `
      
      if (competitiveOnly) {
        query += ` AND t.ai_suggestions->>'source' = 'competitive_intelligence'`
      }
    }
    
    query += ` ORDER BY t.created_at DESC`
    
    const { rows: tasks } = await client.query(query, [user.id])

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
    console.error('Error fetching tasks:', error)
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const { title, description, priority, due_date, category } = parsed.data

    const client = await createClient()
    const { rows } = await client.query(
      `INSERT INTO tasks (user_id, title, description, priority, due_date, category, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [user.id, title, description || '', priority || 'medium', due_date, category || 'general']
    )

    return NextResponse.json({ task: rows[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
