import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { createBillingPortalSession } from '@/lib/stripe'

export const runtime = 'nodejs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 10, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has Stripe customer ID
    if (!user.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing information found' },
        { status: 404 }
      )
    }

    // Create billing portal session
    const session = await createBillingPortalSession(
      user.stripe_customer_id,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    )

    return NextResponse.json({
      success: true,
      url: session.url
    })

  } catch (error) {
    logError('Error creating billing portal session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
