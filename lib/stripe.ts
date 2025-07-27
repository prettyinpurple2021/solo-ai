/**
 * Stripe configuration and tier management utilities.
 */

import { URL } from "url";

// --- Constants and Types ---

/** Subscription tier names */
export const SUBSCRIPTION_TIERS = {
  LAUNCHPAD: "launchpad",
  ACCELERATOR: "accelerator",
  DOMINATOR: "dominator",
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

/** Stripe price IDs (replace placeholder values with actual ones in production) */
export const PRICE_IDS = {
  LAUNCHPAD: null,
  ACCELERATOR: "price_accelerator_placeholder",
  DOMINATOR: "price_dominator_placeholder",
} as const;

/** Features and limits for each subscription tier */
export interface TierFeatures {
  name: string;
  price: number;
  priceId: string | null;
  features: string[];
  limits: {
    aiAgents: number;
    monthlyTasks: number;
    briefcaseStorage: number; // GB
  };
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  [SUBSCRIPTION_TIERS.LAUNCHPAD]: {
    name: "Launchpad",
    price: 0,
    priceId: PRICE_IDS.LAUNCHPAD,
    features: ["Basic platform access", "Limited AI agents"],
    limits: {
      aiAgents: 1,
      monthlyTasks: 100,
      briefcaseStorage: 1,
    },
  },
  [SUBSCRIPTION_TIERS.ACCELERATOR]: {
    name: "Accelerator",
    price: 49,
    priceId: PRICE_IDS.ACCELERATOR,
    features: ["Advanced AI agents", "More tasks", "Increased storage"],
    limits: {
      aiAgents: 5,
      monthlyTasks: 1000,
      briefcaseStorage: 10,
    },
  },
  [SUBSCRIPTION_TIERS.DOMINATOR]: {
    name: "Dominator",
    price: 199,
    priceId: PRICE_IDS.DOMINATOR,
    features: ["Unlimited AI agents", "Unlimited tasks", "Maximum storage"],
    limits: {
      aiAgents: Infinity,
      monthlyTasks: Infinity,
      briefcaseStorage: 100,
    },
  },
};

/** Stripe configuration interface */
export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
}

/** Required environment variables for Stripe */
export const REQUIRED_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
] as const;

// --- Environment Variable Validation ---

/**
 * Validates the presence of required Stripe environment variables.
 * Throws an error if any are missing.
 */
export function validateStripeEnv(): void {
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

// --- Stripe Configuration ---

/**
 * Retrieves Stripe configuration from environment variables.
 * Throws an error if required variables are missing.
 */
export function getStripeConfig(): StripeConfig {
  validateStripeEnv();
  return {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  };
}

/**
 * Checks if Stripe is properly configured.
 * @returns Boolean indicating configuration status.
 */
export const isStripeConfigured = (): boolean =>
  Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// --- Utility Functions ---

/**
 * Returns the application base URL from environment or defaults.
 * Uses Node.js URL class for robustness.
 * @returns Base URL as string.
 */
export function getURL(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://v0-solo-boss-ai.vercel.app/";
  try {
    const url = new URL(appUrl);
    return url.toString();
  } catch {
    // fallback if env var is not a valid URL
    return "https://v0-solo-boss-ai.vercel.app/";
  }
}

/**
 * Formats a price into a currency string (default: USD).
 * @param price - The price to format.
 * @param currency - Currency code, defaults to 'USD'.
 * @returns Formatted price string.
 */
export function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

// --- Price ID to Tier Mapping ---

/** Maps price IDs to subscription tiers for quick lookup */
const priceIdToTierMap: Record<string, SubscriptionTier> = Object.values(SUBSCRIPTION_TIERS)
  .reduce((acc, tier) => {
    const priceId = TIER_FEATURES[tier].priceId;
    if (priceId) acc[priceId] = tier;
    return acc;
  }, {} as Record<string, SubscriptionTier>);

/**
 * Gets the subscription tier from a Stripe price ID.
 * Defaults to 'launchpad' if not found.
 * @param priceId - Stripe price ID.
 * @returns SubscriptionTier.
 */
export function getTierFromPriceId(priceId: string): SubscriptionTier {
  return priceIdToTierMap[priceId] || SUBSCRIPTION_TIERS.LAUNCHPAD;
}

// --- Testability Stub Section ---

/**
 * Example stub for testing: checks all tier configurations.
 */
export function listTierNames(): string[] {
  return Object.values(TIER_FEATURES).map((tier) => tier.name);
}

// --- JSDoc Summary End ---

/*
 * To add unit tests, use your project's preferred testing framework.
 * Example with Jest:
 * test('formatPrice returns USD formatted string', () => {
 *   expect(formatPrice(100)).toBe('$100');
 * });
 */
