import Stripe from "stripe"

// Check if Stripe is configured
const isStripeConfigured = () => {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
}

// Initialize Stripe only if configured
export const stripe = isStripeConfigured()
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
    })
  : null

export type SubscriptionTier = "launchpad" | "accelerator" | "dominator"

export const SUBSCRIPTION_TIERS = {
  LAUNCHPAD: "launchpad" as const,
  ACCELERATOR: "accelerator" as const,
  DOMINATOR: "dominator" as const,
}

export const TIER_FEATURES = {
  launchpad: {
    name: "Launchpad",
    price: 0,
    priceId: null,
    features: ["2 AI Agents", "50 Monthly Tasks", "1GB Briefcase Storage", "Basic Support"],
    limits: {
      aiAgents: 2,
      monthlyTasks: 50,
      briefcaseStorage: 1,
    },
  },
  accelerator: {
    name: "Accelerator Pro",
    price: 20,
    priceId: process.env.STRIPE_ACCELERATOR_PRICE_ID_MONTHLY || "price_accelerator_placeholder",
    features: [
      "All 8 AI Agents",
      "Unlimited Tasks",
      "10GB Briefcase Storage",
      "Full BrandStyler Studio",
      "Priority Support",
    ],
    limits: {
      aiAgents: 8,
      monthlyTasks: -1,
      briefcaseStorage: 10,
    },
  },
  dominator: {
    name: "Dominator Empire",
    price: 49,
    priceId: process.env.STRIPE_DOMINATOR_PRICE_ID_MONTHLY || "price_dominator_placeholder",
    features: [
      "Everything in Pro",
      "Unlimited Storage",
      "Advanced Analytics",
      "Custom AI Training",
      "White-label Options",
      "24/7 Premium Support",
    ],
    limits: {
      aiAgents: -1,
      monthlyTasks: -1,
      briefcaseStorage: -1,
    },
  },
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price)
}

export const getTierFromPriceId = (priceId: string): SubscriptionTier => {
  if (
    priceId === process.env.STRIPE_ACCELERATOR_PRICE_ID_MONTHLY ||
    priceId === process.env.STRIPE_ACCELERATOR_PRICE_ID_YEARLY
  ) {
    return "accelerator"
  }
  if (
    priceId === process.env.STRIPE_DOMINATOR_PRICE_ID_MONTHLY ||
    priceId === process.env.STRIPE_DOMINATOR_PRICE_ID_YEARLY
  ) {
    return "dominator"
  }
  return "launchpad"
}
}

export const getURL = () => {
  let url = process.env.NEXT_PUBLIC_APP_URL ?? "https://v0-solo-boss-ai.vercel.app/"
  url = url.includes("http") ? url : `https://${url}`
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`
  return url
}

// Additional Stripe configuration
export const STRIPE_CONFIG = {
  products: {
    launchpad: process.env.STRIPE_LAUNCHPAD_PRODUCT_ID!,
    accelerator: process.env.STRIPE_ACCELERATOR_PRODUCT_ID!,
    dominator: process.env.STRIPE_DOMINATOR_PRODUCT_ID!,
  },
  prices: {
    launchpad: {
      monthly: process.env.STRIPE_LAUNCHPAD_PRICE_ID_MONTHLY!,
    },
    accelerator: {
      monthly: process.env.STRIPE_ACCELERATOR_PRICE_ID_MONTHLY!,
      yearly: process.env.STRIPE_ACCELERATOR_PRICE_ID_YEARLY!,
    },
    dominator: {
      monthly: process.env.STRIPE_DOMINATOR_PRICE_ID_MONTHLY!,
      yearly: process.env.STRIPE_DOMINATOR_PRICE_ID_YEARLY!,
    },
  },
}
