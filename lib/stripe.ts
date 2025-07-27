// Stripe functionality removed as per user requirements
// This file is kept for future reference but contains no active Stripe code

export const STRIPE_REMOVED = true

// Mock functions for development
export const createCheckoutSession = async () => {
  throw new Error("Stripe functionality has been removed")
}

export const createPortalSession = async () => {
  throw new Error("Stripe functionality has been removed")
}

export const getSubscription = async () => {
  // Return mock subscription data
  return {
    plan: "dominator",
    status: "active",
    billingCycle: "monthly",
    nextBilling: "2024-02-15",
  }
}
