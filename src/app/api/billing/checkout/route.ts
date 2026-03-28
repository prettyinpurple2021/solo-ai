import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createSubscriptionCheckoutForUser } from '@/lib/billing/checkout'
import { logError, logInfo } from '@/lib/logger'
import { z } from 'zod'

const bodySchema = z.object({
  tier: z.enum(['accelerator', 'dominator']),
  billing: z.enum(['monthly', 'yearly']).optional().default('monthly'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const raw = await req.json()
    const parsed = bodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { tier, billing } = parsed.data
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '')
    const successUrl = `${baseUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/dashboard/billing`

    logInfo('Creating checkout session', {
      userId: session.user.id,
      tier,
      billing,
    })

    const result = await createSubscriptionCheckoutForUser({
      userId: session.user.id,
      email: session.user.email,
      fullName: session.user.name,
      tier,
      billing,
      successUrl,
      cancelUrl,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      url: result.url,
      success: true,
      sessionId: result.sessionId,
    })
  } catch (error) {
    logError('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
