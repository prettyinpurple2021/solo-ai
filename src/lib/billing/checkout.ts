import { stripe, createCheckoutSession } from '@/lib/stripe'
import { SUBSCRIPTION_TIERS } from '@/lib/pricing'
import { getUserSubscription, updateUserStripeCustomerId } from '@/lib/stripe-db-utils'
import { logError } from '@/lib/logger'

export type CheckoutTier = 'accelerator' | 'dominator'
export type CheckoutBilling = 'monthly' | 'yearly'

export function resolveSubscriptionPriceId(tier: CheckoutTier, billing: CheckoutBilling): string | null {
  const key = tier.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS
  const tierConfig = SUBSCRIPTION_TIERS[key]
  if (!tierConfig || key === 'LAUNCH') return null

  if (billing === 'yearly') {
    const yearly = tierConfig.stripeYearlyPriceId
    const monthly = tierConfig.stripePriceId
    return (yearly && yearly.length > 0 ? yearly : monthly) || null
  }

  return tierConfig.stripePriceId && tierConfig.stripePriceId.length > 0
    ? tierConfig.stripePriceId
    : null
}

export type CheckoutResult =
  | { ok: true; url: string; sessionId: string }
  | { ok: false; error: string; status: number }

export async function createSubscriptionCheckoutForUser(input: {
  userId: string
  email: string | null | undefined
  fullName: string | null | undefined
  tier: CheckoutTier
  billing: CheckoutBilling
  successUrl: string
  cancelUrl: string
}): Promise<CheckoutResult> {
  const priceId = resolveSubscriptionPriceId(input.tier, input.billing)
  if (!priceId) {
    return {
      ok: false,
      error: 'Invalid plan selected or missing Stripe price configuration',
      status: 400,
    }
  }

  if (!stripe) {
    return { ok: false, error: 'Stripe is not configured in this environment', status: 500 }
  }

  const row = await getUserSubscription(input.userId)
  if (!row) {
    return { ok: false, error: 'User not found', status: 404 }
  }

  let customerId = row.stripe_customer_id
  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        email: input.email || undefined,
        name: input.fullName || undefined,
        metadata: {
          user_id: input.userId,
          platform: 'SoloSuccess-ai',
        },
      })
      customerId = customer.id
      const updateResult = await updateUserStripeCustomerId(input.userId, customerId)
      if (!updateResult.success) {
        logError('Failed to persist Stripe customer ID', updateResult.error)
        return { ok: false, error: 'Failed to create customer', status: 500 }
      }
    } catch (error) {
      logError('Stripe customer creation failed', error)
      return { ok: false, error: 'Failed to create customer', status: 500 }
    }
  }

  try {
    const session = await createCheckoutSession(
      customerId,
      priceId,
      input.successUrl,
      input.cancelUrl,
      {
        user_id: input.userId,
        tier: input.tier,
        billing: input.billing,
      },
    )

    if (!session.url) {
      return { ok: false, error: 'Checkout session missing redirect URL', status: 500 }
    }

    return { ok: true, url: session.url, sessionId: session.id }
  } catch (error) {
    logError('createCheckoutSession failed', error)
    return { ok: false, error: 'Internal server error', status: 500 }
  }
}
