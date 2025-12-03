import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { neon } from '@neondatabase/serverless'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sql = getSql()

    // Get user's push subscriptions
    const subscriptions = await sql`
      SELECT 
        id,
        endpoint,
        p256dh_key,
        auth_key,
        device_info,
        is_active,
        created_at,
        updated_at
      FROM push_subscriptions 
      WHERE user_id = ${user.id} AND is_active = true
      ORDER BY created_at DESC
    `

    return NextResponse.json({ subscriptions })
  } catch (error) {
    logError('Error fetching push subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscription, deviceInfo } = await request.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    const sql = getSql()

    // Check if subscription already exists
    const existing = await sql`
      SELECT id FROM push_subscriptions 
      WHERE endpoint = ${subscription.endpoint} AND user_id = ${user.id}
    `

    if (existing.length > 0) {
      // Update existing subscription
      const result = await sql`
        UPDATE push_subscriptions 
        SET 
          p256dh_key = ${subscription.keys.p256dh},
          auth_key = ${subscription.keys.auth},
          device_info = ${JSON.stringify(deviceInfo || {})},
          is_active = true,
          updated_at = NOW()
        WHERE endpoint = ${subscription.endpoint} AND user_id = ${user.id}
        RETURNING *
      `

      return NextResponse.json({
        success: true,
        subscription: result[0]
      })
    } else {
      // Create new subscription
      const result = await sql`
        INSERT INTO push_subscriptions (
          user_id,
          endpoint,
          p256dh_key,
          auth_key,
          device_info,
          is_active,
          created_at,
          updated_at
        ) VALUES (
          ${user.id},
          ${subscription.endpoint},
          ${subscription.keys.p256dh},
          ${subscription.keys.auth},
          ${JSON.stringify(deviceInfo || {})},
          true,
          NOW(),
          NOW()
        )
        RETURNING *
      `

      return NextResponse.json({
        success: true,
        subscription: result[0]
      })
    }
  } catch (error) {
    logError('Error saving push subscription:', error)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const endpoint = url.searchParams.get('endpoint')

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 })
    }

    const sql = getSql()

    // Deactivate subscription
    const result = await sql`
      UPDATE push_subscriptions 
      SET is_active = false, updated_at = NOW()
      WHERE endpoint = ${endpoint} AND user_id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription deactivated'
    })
  } catch (error) {
    logError('Error deleting push subscription:', error)
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
  }
}
