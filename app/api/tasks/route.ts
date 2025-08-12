import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { authenticateRequest } from '@/lib/auth-server'
import { z } from 'zod'

export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await createClient()
    const { rows: tasks } = await client.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )

    return NextResponse.json({ tasks })
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
    const { title, description, priority, due_date, category } = parsed.data as any

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
