import { createBillingPortalSession } from '@/lib/stripe'
import { getUserSubscription } from '@/lib/stripe-db-utils'

export type PortalResult =
  | { ok: true; url: string }
  | { ok: false; error: string; status: number }

export async function createBillingPortalForUser(input: {
  userId: string
  returnUrl: string
}): Promise<PortalResult> {
  const row = await getUserSubscription(input.userId)
  const customerId = row?.stripe_customer_id
  if (!customerId) {
    return {
      ok: false,
      error: 'No active subscription found. Please subscribe to a tier first.',
      status: 404,
    }
  }

  try {
    const session = await createBillingPortalSession(customerId, input.returnUrl)
    return { ok: true, url: session.url }
  } catch {
    return { ok: false, error: 'Internal server error', status: 500 }
  }
}
