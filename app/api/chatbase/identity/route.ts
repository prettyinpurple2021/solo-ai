import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { logApi, logError } from '@/lib/logger'
import { getDb } from '@/lib/database-client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ROUTE_PATH = '/api/chatbase/identity'

interface ChatbaseIdentityPayload {
  user_id: string
  email: string
  full_name?: string | null
  subscription_tier?: string | null
  subscription_status?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
}

export async function GET(request: NextRequest) {
  const start = Date.now()

  try {
    const rateLimitResult = await rateLimitByIp(request, { requests: 20, window: 60 })
    if (!rateLimitResult.allowed) {
      logApi('GET', ROUTE_PATH, 429, Date.now() - start, { reason: 'rate_limited' })
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error: authError } = await authenticateRequest()
    if (authError || !user) {
      logApi('GET', ROUTE_PATH, 401, Date.now() - start, { reason: authError || 'unauthorized' })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.CHATBOT_IDENTITY_SECRET) {
      throw new Error('CHATBOT_IDENTITY_SECRET is not configured')
    }

    const db = getDb()
    const [dbUser] = await db
      .select({
        id: users.id,
        email: users.email,
        full_name: users.full_name,
        subscription_tier: users.subscription_tier,
        subscription_status: users.subscription_status,
        stripe_customer_id: users.stripe_customer_id,
        stripe_subscription_id: users.stripe_subscription_id,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (!dbUser) {
      logApi('GET', ROUTE_PATH, 404, Date.now() - start, { userId: user.id })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const payload: ChatbaseIdentityPayload = {
      user_id: dbUser.id,
      email: dbUser.email,
      full_name: dbUser.full_name,
      subscription_tier: dbUser.subscription_tier,
      subscription_status: dbUser.subscription_status,
      stripe_customer_id: dbUser.stripe_customer_id,
      stripe_subscription_id: dbUser.stripe_subscription_id,
    }

    const sanitizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([ value]) => value !== undefined && value !== null && value !== '')
    ) as ChatbaseIdentityPayload

    const token = jwt.sign(sanitizedPayload, process.env.CHATBOT_IDENTITY_SECRET, {
      expiresIn: '1h',
    })

    logApi('GET', ROUTE_PATH, 200, Date.now() - start, { userId: user.id })
    return NextResponse.json({ token })
  } catch (error) {
    logError('Failed to issue Chatbase identity token', {
      route: ROUTE_PATH,
      error: error instanceof Error ? error.message : String(error),
    })
    logApi('GET', ROUTE_PATH, 500, Date.now() - start)
    return NextResponse.json({ error: 'Unable to issue identity token' }, { status: 500 })
  }
}

