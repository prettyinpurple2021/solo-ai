import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getDb } from '@/lib/database-client'
import { z } from 'zod'
import { logError, logInfo } from '@/lib/logger'
import { eq } from 'drizzle-orm'
import { users } from '@/db/schema'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const route = '/api/profile'
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      logInfo('Unauthorized profile request', {
        route,
        status: 401,
        meta: { ip: request.headers.get('x-forwarded-for') || 'unknown' }
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getDb()
    const rows = await db.select({
      id: users.id,
      email: users.email,
      full_name: users.full_name,
      avatar_url: users.avatar_url,
      subscription_tier: users.subscription_tier,
      subscription_status: users.subscription_status,
      stripe_customer_id: users.stripe_customer_id,
      stripe_subscription_id: users.stripe_subscription_id,
      current_period_start: users.current_period_start,
      current_period_end: users.current_period_end,
      cancel_at_period_end: users.cancel_at_period_end,
      // level: users.level, // Not in schema currently
      // total_points: users.total_points, // Not in schema currently
      // current_streak: users.current_streak, // Not in schema currently
      // wellness_score: users.wellness_score, // Not in schema currently
      // focus_minutes: users.focus_minutes, // Not in schema currently
      onboarding_completed: users.onboarding_completed,
      // preferred_ai_agent: users.preferred_ai_agent // Not in schema currently
    })
      .from(users)
      .where(eq(users.id, user.id))

    if (rows.length === 0) {
      logInfo('Profile not found', {
        route,
        userId: user.id,
        status: 404,
        meta: { ip: request.headers.get('x-forwarded-for') || 'unknown' }
      })
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    logInfo('Profile fetched successfully', {
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
      logInfo('Unauthorized profile update attempt', {
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
      onboarding_data: z.unknown().optional(),
    })
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      logInfo('Invalid profile update payload', {
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

    const shouldUpdateOnboardingData = typeof onboarding_data !== 'undefined'

    // Prepare update object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      updated_at: new Date()
    }

    if (full_name !== undefined) updateData.full_name = full_name
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (onboarding_completed !== undefined) {
      updateData.onboarding_completed = onboarding_completed
      if (onboarding_completed === true) {
        updateData.onboarding_completed_at = new Date()
      } else if (onboarding_completed === false) {
        updateData.onboarding_completed_at = null
      }
    }
    if (shouldUpdateOnboardingData) {
      updateData.onboarding_data = onboarding_data
    }

    const db = getDb()
    const rows = await db.update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        email: users.email,
        full_name: users.full_name,
        avatar_url: users.avatar_url,
        subscription_tier: users.subscription_tier,
        subscription_status: users.subscription_status,
        onboarding_completed: users.onboarding_completed,
        onboarding_completed_at: users.onboarding_completed_at,
        onboarding_data: users.onboarding_data
      })

    logInfo('Profile updated successfully', {
      route,
      userId: user.id,
      status: 200,
      meta: {
        updatedFields: {
          full_name: full_name !== undefined,
          avatar_url: avatar_url !== undefined,
          onboarding_completed: onboarding_completed !== undefined,
          onboarding_data: shouldUpdateOnboardingData
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