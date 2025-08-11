import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { authenticateRequest } from '@/lib/auth-server'

export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await createClient()
    const { rows: goals } = await client.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )

    return NextResponse.json({ goals })
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
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, target_date, category, priority } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Goal title is required' },
        { status: 400 }
      )
    }

    const client = await createClient()
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
