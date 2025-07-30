import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Task schema validation
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  goal_id: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().optional(),
  estimated_minutes: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
})

const updateTaskSchema = taskSchema.partial().extend({
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled']).optional(),
  actual_minutes: z.number().positive().optional(),
})

// GET - Fetch user's tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const goal_id = searchParams.get('goal_id')
    const due_today = searchParams.get('due_today') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('tasks')
      .select(`
        *,
        goals (
          id,
          title,
          status,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    if (goal_id) {
      query = query.eq('goal_id', goal_id)
    }

    if (due_today) {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('due_date', today).lt('due_date', today + 'T23:59:59.999Z')
    }

    const { data: tasks, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    // Calculate task statistics
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => 
        t.due_date && 
        new Date(t.due_date) < new Date() && 
        t.status !== 'completed'
      ).length,
    }

    return NextResponse.json({ tasks, stats })
  } catch (error) {
    console.error('Tasks GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate goal ownership if goal_id is provided
    if (validatedData.goal_id) {
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('id')
        .eq('id', validatedData.goal_id)
        .eq('user_id', user.id)
        .single()

      if (goalError || !goal) {
        return NextResponse.json({ error: 'Goal not found or not accessible' }, { status: 400 })
      }
    }

    // Create the task
    const { data: task, error: createError } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        ...validatedData,
        due_date: validatedData.due_date ? new Date(validatedData.due_date).toISOString() : null,
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Tasks POST error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update task
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if task belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('id, status, goal_id')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Validate goal ownership if goal_id is being updated
    if (validatedData.goal_id && validatedData.goal_id !== existingTask.goal_id) {
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('id')
        .eq('id', validatedData.goal_id)
        .eq('user_id', user.id)
        .single()

      if (goalError || !goal) {
        return NextResponse.json({ error: 'Goal not found or not accessible' }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = { ...validatedData }
    
    if (validatedData.due_date) {
      updateData.due_date = new Date(validatedData.due_date).toISOString()
    }

    // Handle task completion
    if (validatedData.status === 'completed' && existingTask.status !== 'completed') {
      updateData.completed_at = new Date().toISOString()

      // Update daily stats for task completion
      await supabase.rpc('update_daily_stats', {
        p_user_id: user.id,
        p_stat_type: 'tasks_completed',
        p_increment: 1
      })

      // Update goal progress if task is linked to a goal
      if (existingTask.goal_id) {
        await updateGoalProgress(supabase, existingTask.goal_id, user.id)
      }
    }

    // Update the task
    const { data: task, error: updateError } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select(`
        *,
        goals (
          id,
          title,
          status,
          category
        )
      `)
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    // Update user gamification
    await supabase.rpc('update_user_gamification', { p_user_id: user.id })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Tasks PUT error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get task info before deletion for goal progress update
    const { data: task } = await supabase
      .from('tasks')
      .select('goal_id')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    // Delete the task
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }

    // Update goal progress if task was linked to a goal
    if (task?.goal_id) {
      await updateGoalProgress(supabase, task.goal_id, user.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tasks DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to update goal progress based on completed tasks
async function updateGoalProgress(supabase: any, goalId: string, userId: string) {
  try {
    // Get all tasks for this goal
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status')
      .eq('goal_id', goalId)
      .eq('user_id', userId)

    if (tasks && tasks.length > 0) {
      const completedTasks = tasks.filter((t: any) => t.status === 'completed').length
      const totalTasks = tasks.length
      const progressPercentage = Math.round((completedTasks / totalTasks) * 100)

      // Update goal progress
      await supabase
        .from('goals')
        .update({ 
          progress_percentage: progressPercentage,
          // Auto-complete goal if all tasks are done
          status: progressPercentage === 100 ? 'completed' : 'active',
          completion_date: progressPercentage === 100 ? new Date().toISOString() : null
        })
        .eq('id', goalId)
        .eq('user_id', userId)
    }
  } catch (error) {
    console.error('Error updating goal progress:', error)
  }
} 