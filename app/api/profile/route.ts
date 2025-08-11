import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'

// GET current user's profile
export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await createClient()
    const { rows } = await client.query(
      `SELECT id, email, full_name, avatar_url, subscription_tier, subscription_status,
              level, total_points, current_streak, wellness_score, focus_minutes, onboarding_completed, preferred_ai_agent
         FROM users WHERE id = $1`,
      [user.id]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update current user's profile
export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, avatar_url } = body

    const client = await createClient()
    const { rows } = await client.query(
      `UPDATE users
          SET full_name = COALESCE($1, full_name),
              avatar_url = COALESCE($2, avatar_url),
              updated_at = NOW()
        WHERE id = $3
        RETURNING id, email, full_name, avatar_url, subscription_tier, subscription_status`,
      [full_name ?? null, avatar_url ?? null, user.id]
    )

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


