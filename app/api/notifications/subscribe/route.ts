import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/api-utils'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const subscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    expirationTime: z.number().nullable(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string()
    })
  })
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
        { status: 400 }
      )
    }

    const { subscription } = parsed.data
    const now = new Date()
    const sql = getSql()

    // Check if push_subscriptions table exists, if not create it
    await sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        endpoint TEXT NOT NULL UNIQUE,
        expiration_time BIGINT,
        p256dh_key TEXT NOT NULL,
        auth_key TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
      )
    `

    // Create index if it doesn't exist
    await sql`
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id)
    `
    await sql`
      CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint)
    `

    // Insert or update subscription
    const result = await sql`
      INSERT INTO push_subscriptions (
        user_id, endpoint, expiration_time, p256dh_key, auth_key, 
        user_agent, created_at, updated_at, last_used_at, is_active
      ) VALUES (
        ${user.id}, 
        ${subscription.endpoint}, 
        ${subscription.expirationTime}, 
        ${subscription.keys.p256dh}, 
        ${subscription.keys.auth}, 
        ${request.headers.get('user-agent') || 'Unknown'}, 
        ${now}, 
        ${now}, 
        ${now}, 
        true
      )
      ON CONFLICT (endpoint) 
      DO UPDATE SET 
        user_id = EXCLUDED.user_id,
        expiration_time = EXCLUDED.expiration_time,
        p256dh_key = EXCLUDED.p256dh_key,
        auth_key = EXCLUDED.auth_key,
        user_agent = EXCLUDED.user_agent,
        updated_at = EXCLUDED.updated_at,
        last_used_at = EXCLUDED.last_used_at,
        is_active = true
      RETURNING id, created_at
    `

    // Update user's notification preferences if this is their first subscription
    const userSubscriptionsCount = await sql`
      SELECT COUNT(*) as count 
      FROM push_subscriptions 
      WHERE user_id = ${user.id} AND is_active = true
    `

    if (parseInt(userSubscriptionsCount[0].count) === 1) {
      // This might be their first subscription - log the milestone
      logInfo(`User ${user.id} subscribed to push notifications for the first time`)
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to push notifications',
      subscriptionId: result[0].id,
      timestamp: result[0].created_at
    })

  } catch (error) {
    logError('Error subscribing to push notifications:', error)

    // Type-safe error handling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === '23505') {
      // PostgreSQL unique constraint violation
      return NextResponse.json(
        { error: 'Subscription already exists for this endpoint' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to subscribe to push notifications' },
      { status: 500 }
    )
  }
}