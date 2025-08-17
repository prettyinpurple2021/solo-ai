import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { authenticateRequest } from '@/lib/auth-server'
import { z } from 'zod'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const BodySchema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      due_date: z.union([z.string(), z.date()]).optional(),
      category: z.string().optional(),
      goal_id: z.string().optional(),
      estimated_minutes: z.number().optional(),
      actual_minutes: z.number().optional(),
    })
    
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }

    const client = await createClient()
    
    // First verify the task belongs to the user
    const { rows: existingTask } = await client.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [params.id, user.id]
    )

    if (existingTask.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Build update query dynamically
    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    Object.entries(parsed.data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`)
        updateValues.push(value)
        paramIndex++
      }
    })

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    updateFields.push('updated_at = NOW()')
    updateValues.push(params.id, user.id)

    const { rows } = await client.query(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`,
      updateValues
    )

    return NextResponse.json({ task: rows[0] })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await createClient()
    
    // Verify the task belongs to the user and delete it in one step
    const { rowCount } = await client.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [params.id, user.id]
    )

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}