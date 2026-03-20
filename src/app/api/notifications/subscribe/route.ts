import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database-client'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { pushSubscriptions } from '@/lib/shared/db/schema/social'
import { and, count, eq } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const subscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    expirationTime: z.number().nullable(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const { allowed } = await rateLimitByIp(request, { requests: 5, window: 60 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = subscriptionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid subscription data', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { subscription } = parsed.data
    const now = new Date()
    const device_info = {
      expirationTime: subscription.expirationTime,
      userAgent: request.headers.get('user-agent') || undefined,
    }

    const db = getDb()

    const [row] = await db
      .insert(pushSubscriptions)
      .values({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        device_info,
        is_active: true,
        last_used_at: now,
        created_at: now,
        updated_at: now,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          user_id: user.id,
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          device_info,
          updated_at: now,
          last_used_at: now,
          is_active: true,
        },
      })
      .returning({ id: pushSubscriptions.id, created_at: pushSubscriptions.created_at })

    const [countRow] = await db
      .select({ c: count() })
      .from(pushSubscriptions)
      .where(and(eq(pushSubscriptions.user_id, user.id), eq(pushSubscriptions.is_active, true)))

    if (Number(countRow?.c) === 1) {
      logInfo(`User ${user.id} subscribed to push notifications for the first time`)
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to push notifications',
      subscriptionId: row.id,
      timestamp: row.created_at,
    })
  } catch (error) {
    logError(
      'Error subscribing to push notifications:',
      error instanceof Error ? error : new Error(String(error)),
    )

    if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === '23505') {
      return NextResponse.json({ error: 'Subscription already exists for this endpoint' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to subscribe to push notifications' }, { status: 500 })
  }
}
