import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'
import { z } from 'zod'
import { info, error as logError } from '@/lib/log'

// Edge runtime disabled because jsonwebtoken is not compatible with Edge
// export const runtime = 'edge'

// GET current user's profile
export async function GET(request: NextRequest) {
  const route = '/api/profile'
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      info('Unauthorized profile request', { 
        route, 
        status: 401,
        meta: { ip: request.headers.get('x-forwarded-for') || 'unknown' }
      })
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
      info('Profile not found', { 
        route, 
        userId: user.id,
        status: 404,
        meta: { ip: request.headers.get('x-forwarded-for') || 'unknown' }
      })
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    info('Profile fetched successfully', { 
      route, 
      userId: user.id,
      status: 200,
      meta: { ip: request.headers.get('x-forwarded-for') || 'unknown' }
    })

    return NextResponse.json(rows[0])
  } catch (err) {
    logError('Error fetching profile', {
      route,
      status: 500,
      error: err,
      meta: { 
        errorMessage: err instanceof Error ? err.message : String(err),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update current user's profile
export async function PATCH(request: NextRequest) {
  const route = '/api/profile'
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      info('Unauthorized profile update attempt', { 
        route, 
        status: 401,
        meta: { ip: request.headers.get('x-forwarded-for') || 'unknown' }
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const BodySchema = z.object({
      full_name: z.string().min(1).max(200).nullable().optional(),
      avatar_url: z.string().url().nullable().optional(),
      onboarding_completed: z.boolean().optional(),
      onboarding_data: z.any().optional(),
    })
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      info('Invalid profile update payload', { 
        route, 
        userId: user.id,
        status: 400,
        meta: { 
          validationErrors: parsed.error.flatten(),
          ip: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const { full_name, avatar_url, onboarding_completed, onboarding_data } = parsed.data

    const client = await createClient()
    const { rows } = await client.query(
      `UPDATE users
          SET full_name = COALESCE($1, full_name),
              avatar_url = COALESCE($2, avatar_url),
              onboarding_completed = COALESCE($3, onboarding_completed),
              notification_preferences = CASE 
                WHEN $4 IS NOT NULL THEN $4::jsonb 
                ELSE notification_preferences 
              END,
              updated_at = NOW()
        WHERE id = $5
        RETURNING id, email, full_name, avatar_url, subscription_tier, subscription_status, onboarding_completed`,
      [full_name ?? null, avatar_url ?? null, onboarding_completed ?? null, onboarding_data ? JSON.stringify(onboarding_data) : null, user.id]
    )

    info('Profile updated successfully', { 
      route, 
      userId: user.id,
      status: 200,
      meta: { 
        updatedFields: {
          full_name: full_name !== undefined,
          avatar_url: avatar_url !== undefined
        },
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })

    return NextResponse.json(rows[0])
  } catch (err) {
    logError('Error updating profile', {
      route,
      status: 500,
      error: err,
      meta: { 
        errorMessage: err instanceof Error ? err.message : String(err),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}