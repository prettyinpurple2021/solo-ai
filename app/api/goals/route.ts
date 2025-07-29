import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Goal schema validation
const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.string().optional(),
  target_date: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const updateGoalSchema = goalSchema.partial().extend({
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
  progress_percentage: z.number().min(0).max(100).optional(),
})

// GET - Fetch user's goals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('goals')
      .select(`
        *,
        tasks (
          id,
          title,
          status,
          priority,
          due_date,
          completed_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: goals, error } = await query

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
    }

    // Calculate goal statistics
    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      paused: goals.filter(g => g.status === 'paused').length,
    }

    return NextResponse.json({ goals, stats })
  } catch (error) {
    console.error('Goals GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = goalSchema.parse(body)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create the goal
    const { data: goal, error: createError } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        ...validatedData,
        target_date: validatedData.target_date ? new Date(validatedData.target_date).toISOString() : null,
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
    }

    // Update daily stats
    await supabase.rpc('update_daily_stats', {
      p_user_id: user.id,
      p_stat_type: 'goals_achieved',
      p_increment: 0 // Just to create/update the daily stats record
    })

    // Check for achievements
    await supabase.rpc('check_achievements', { p_user_id: user.id })

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error) {
    console.error('Goals POST error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update goal
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('id')

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = updateGoalSchema.parse(body)

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if goal belongs to user
    const { data: existingGoal, error: fetchError } = await supabase
      .from('goals')
      .select('id, status')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = { ...validatedData }
    
    if (validatedData.target_date) {
      updateData.target_date = new Date(validatedData.target_date).toISOString()
    }

    // Handle goal completion
    if (validatedData.status === 'completed' && existingGoal.status !== 'completed') {
      updateData.completion_date = new Date().toISOString()
      updateData.progress_percentage = 100

      // Update daily stats for goal completion
      await supabase.rpc('update_daily_stats', {
        p_user_id: user.id,
        p_stat_type: 'goals_achieved',
        p_increment: 1
      })
    }

    // Update the goal
    const { data: goal, error: updateError } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
    }

    // Update user gamification
    await supabase.rpc('update_user_gamification', { p_user_id: user.id })

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Goals PUT error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete goal
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('id')

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete the goal (tasks will be handled by cascade or set to null)
    const { error: deleteError } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Goals DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 