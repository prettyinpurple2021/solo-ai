"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"
import { useAsyncState } from "./use-async-state"

export interface Subscription {
  id: string
  user_id: string
  status: string
  price_id: string
  quantity: number
  cancel_at_period_end: boolean
  created: string
  current_period_start: string
  current_period_end: string
  ended_at?: string
  cancel_at?: string
  canceled_at?: string
  trial_start?: string
  trial_end?: string
}

export interface SubscriptionTier {
  name: string
  price: number
  priceId: string
  features: string[]
  popular?: boolean
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    name: "Free",
    price: 0,
    priceId: "free",
    features: ["Basic AI assistance", "5 tasks per day", "Standard support", "Basic templates"],
  },
  {
    name: "Accelerator",
    price: 20,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ACCELERATOR_PRICE_ID || "",
    features: [
      "Advanced AI assistance",
      "Unlimited tasks",
      "Priority support",
      "Premium templates",
      "Team collaboration",
      "Advanced analytics",
    ],
    popular: true,
  },
  {
    name: "Dominator",
    price: 49,
    priceId: process.env.NEXT_PUBLIC_STRIPE_DOMINATOR_PRICE_ID || "",
    features: [
      "Elite AI assistance",
      "Unlimited everything",
      "24/7 premium support",
      "Custom templates",
      "Advanced team features",
      "White-label options",
      "API access",
      "Custom integrations",
    ],
  },
]

export function useSubscription() {
  const { data: subscription, loading, error, setData, setLoading, setError } = useAsyncState<Subscription>()
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setData(null)
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError
        }

        setData(data || null)
      } catch (err: any) {
        console.error("Error fetching subscription:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user, supabase])

  const getCurrentTier = (): SubscriptionTier => {
    if (!subscription) {
      return SUBSCRIPTION_TIERS[0] // Free tier
    }

    return SUBSCRIPTION_TIERS.find((tier) => tier.priceId === subscription.price_id) || SUBSCRIPTION_TIERS[0]
  }

  const hasFeature = (feature: string): boolean => {
    const currentTier = getCurrentTier()
    return currentTier.features.includes(feature)
  }

  const isFreeTier = (): boolean => {
    return !subscription || subscription.price_id === "free"
  }

  const isPaidTier = (): boolean => {
    return !isFreeTier()
  }

  const canUpgrade = (): boolean => {
    const currentTier = getCurrentTier()
    const currentIndex = SUBSCRIPTION_TIERS.findIndex((tier) => tier.name === currentTier.name)
    return currentIndex < SUBSCRIPTION_TIERS.length - 1
  }

  return {
    subscription,
    loading,
    error,
    currentTier: getCurrentTier(),
    hasFeature,
    isFreeTier,
    isPaidTier,
    canUpgrade,
    tiers: SUBSCRIPTION_TIERS,
  }
}

// Named export for compatibility
export { useSubscription as default }
