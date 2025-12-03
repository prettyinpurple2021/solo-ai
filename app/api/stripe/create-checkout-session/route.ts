import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import {
  stripe, createCheckoutSession, SUBSCRIPTION_TIERS, STRIPE_PRICES
} from '@/lib/stripe'
import { updateUserStripeCustomerId } from '@/lib/stripe-db-utils'
import { z } from 'zod'

// Stripe API requires Node.js runtime (native modules + TLS)
export const runtime = 'nodejs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schema
const CheckoutSessionSchema = z.object({
  tier: z.enum(['accelerator', 'dominator']),
  billing: z.enum(['monthly', 'yearly']).default('monthly')
})

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

    // Parse request body
    const body = await request.json()
    const { tier, billing } = CheckoutSessionSchema.parse(body)

    // Get subscription tier details
    const subscriptionTier = SUBSCRIPTION_TIERS[tier.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS]
    if (!subscriptionTier) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }

    // Get the appropriate price ID
    let priceId: string
    if (billing === 'yearly') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      priceId = (subscriptionTier as any).stripeYearlyPriceId || subscriptionTier.stripePriceId
    } else {
      priceId = subscriptionTier.stripePriceId
    }

    // Create or get Stripe customer
    let customerId: string
    if (user.stripe_customer_id) {
      customerId = user.stripe_customer_id
    } else {
      if (!stripe) {
        return NextResponse.json(
          { error: 'Stripe not configured' },
          { status: 500 }
        )
      }

      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.full_name || undefined,
        metadata: {
          user_id: user.id,
          platform: 'SoloSuccess-ai'
        }
      })
      customerId = customer.id

      // Update user with Stripe customer ID
      const updateResult = await updateUserStripeCustomerId(user.id, customerId)
      if (!updateResult.success) {
        logError('Failed to update user with Stripe customer ID:', updateResult.error)
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500 }
        )
      }
    }

    // Create checkout session
    const session = await createCheckoutSession(
      customerId,
      priceId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      {
        user_id: user.id,
        tier: tier,
        billing: billing
      }
    )

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    logError('Error creating checkout session:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
