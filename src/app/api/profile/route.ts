import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getDb } from '@/lib/database-client'
import { z } from 'zod'
import { logError, logInfo } from '@/lib/logger'
import { eq } from 'drizzle-orm'
import { users } from '@/shared/db/schema'

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
      name: users.name,
      bio: users.bio,
      image: users.image,
      role: users.role,
      xp: users.xp,
      level: users.level,
      total_actions: users.total_actions,
      subscription_tier: users.subscription_tier,
      subscription_status: users.subscription_status,
      stripe_customer_id: users.stripe_customer_id,
      stripe_subscription_id: users.stripe_subscription_id,
      current_period_start: users.current_period_start,
      current_period_end: users.current_period_end,
      cancel_at_period_end: users.cancel_at_period_end,
      onboarding_completed: users.onboarding_completed,
      created_at: users.created_at,
      updated_at: users.updated_at,
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

    // Merge some fields for frontend compatibility (e.g. storageService expects 'totalActions')
    const profileData = {
      ...rows[0],
      name: rows[0].full_name || rows[0].name || '',
      totalActions: rows[0].total_actions,
      achievements: [] // Still empty for now, could join achievements table later
    }

    logInfo('Profile fetched successfully', {
      route,
      userId: user.id,
      status: 200,
      meta: { ip: request.headers.get('x-forwarded-for') || 'unknown' }
    })

    return NextResponse.json(profileData)
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
      bio: z.string().max(2000).nullable().optional(),
      image: z.string().url().nullable().optional(),
      onboarding_completed: z.boolean().optional(),
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
    const { full_name, bio, image, onboarding_completed } = parsed.data

    // Prepare update object
    const updateData: any = {
      updated_at: new Date()
    }

    if (full_name !== undefined) updateData.full_name = full_name
    if (bio !== undefined) updateData.bio = bio
    if (image !== undefined) updateData.image = image
    if (onboarding_completed !== undefined) {
      updateData.onboarding_completed = onboarding_completed
    }

    const db = getDb()
    const rows = await db.update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        email: users.email,
        full_name: users.full_name,
        bio: users.bio,
        image: users.image,
        subscription_tier: users.subscription_tier,
        subscription_status: users.subscription_status,
        onboarding_completed: users.onboarding_completed,
        xp: users.xp,
        level: users.level,
        total_actions: users.total_actions
      })

    logInfo('Profile updated successfully', {
      route,
      userId: user.id,
      status: 200,
      meta: {
        updatedFields: {
          full_name: full_name !== undefined,
          bio: bio !== undefined,
          image: image !== undefined,
          onboarding_completed: onboarding_completed !== undefined
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
