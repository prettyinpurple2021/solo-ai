import { useState, useEffect, useCallback } from "react"
import { useUser } from "@/lib/auth-client"
import { apiClient, endpoints } from "@/lib/api-client"
import { logError } from "@/lib/logger"

// Public Plans Configuration
const PLANS = {
  launchpad: { // Solo
    id: 'launchpad',
    name: "Launchpad"
  },
  accelerator: { // Pro
    id: 'accelerator',
    name: "Accelerator"
  },
  dominator: { // Agency
    id: 'dominator',
    name: "Dominator"
  }
}

export interface Subscription {
  plan: "free" | "launchpad" | "accelerator" | "dominator"
  status: "active" | "canceled" | "past_due" | "trialing" | "free"
  billingCycle: "monthly" | "yearly"
  nextBilling: string | null
  cancelAtPeriodEnd: boolean
}

export interface Usage {
  conversations: { used: number; limit: number }
  agents: { used: number; limit: number }
  automations: { used: number; limit: number }
  teamMembers: { used: number; limit: number }
  storage: { used: number; limit: number }
  aiGenerations: { used: number; limit: number }
}

const TIER_LIMITS = {
  free: { conversations: 10, agents: 1, automations: 0, teamMembers: 1, storage: 5, aiGenerations: 10 },
  launchpad: { conversations: 100, agents: 3, automations: 5, teamMembers: 1, storage: 50, aiGenerations: -1 },
  accelerator: { conversations: -1, agents: 8, automations: 20, teamMembers: 3, storage: -1, aiGenerations: -1 },
  dominator: { conversations: -1, agents: -1, automations: -1, teamMembers: -1, storage: -1, aiGenerations: -1 }
}

export function useSubscription() {
  const { data: user } = useUser()
  const [subscription, setSubscription] = useState<Subscription>({
    plan: "free",
    status: "free",
    billingCycle: "monthly",
    nextBilling: null, 
    cancelAtPeriodEnd: false,
  })

  // Start with restrictive limits until loaded
  const [usage, setUsage] = useState<Usage>({
    conversations: { used: 0, limit: 10 },
    agents: { used: 0, limit: 1 },
    automations: { used: 0, limit: 0 },
    teamMembers: { used: 0, limit: 1 },
    storage: { used: 0, limit: 5 },
    aiGenerations: { used: 0, limit: 10 }
  })

  const [isLoading, setIsLoading] = useState(true)

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      
      // 1. Fetch Subscription Status
      const subRes = await apiClient.get(endpoints.stripe.subscription)
      
      if (subRes.data) {
        const subData = subRes.data
        setSubscription({
          plan: subData.tier || 'free',
          status: subData.status || 'free',
          billingCycle: 'monthly', // TODO: Infer from price interval if needed
          nextBilling: subData.currentPeriodEnd ? new Date(subData.currentPeriodEnd).toISOString() : null,
          cancelAtPeriodEnd: false // TODO: Backend should return this flag
        })
      }

      // 2. Fetch Usage Statistics
      const usageRes = await apiClient.get(endpoints.stripe.usage)

      if (usageRes.data) {
        const usageData = usageRes.data
        // Map backend usage to frontend state
        // Note: The backend returns a simpler object, so we merge it with TIER_LIMITS
        const currentTier = (subRes.data ? subRes.data.tier : 'free') as keyof typeof TIER_LIMITS
        const limits = TIER_LIMITS[currentTier] || TIER_LIMITS.free

        setUsage({
          conversations: { used: 0, limit: limits.conversations }, // Not tracked in backend usage endpoint yet
          agents: { used: usageData.aiGenerations || 0, limit: limits.agents }, // Mapping AI gen to "Agents" loosely, or separate
          automations: { used: 0, limit: limits.automations },
          teamMembers: { used: 1, limit: limits.teamMembers },
          storage: { used: 0, limit: limits.storage },
          aiGenerations: { used: usageData.aiGenerations || 0, limit: limits.aiGenerations }
        })
      }
    } catch (error) {
      logError("Failed to fetch subscription", { error })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Initial load
  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const upgradePlan = async (planKey: 'launchpad' | 'accelerator' | 'dominator') => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const res = await apiClient.post(endpoints.stripe.createCheckoutSession, 
        {
          tier: planKey === 'launchpad' ? 'launch' : planKey,
          billing: 'monthly' // Defaulting to monthly for this hook unless extended
        }
      )

      if (res.data.url) {
        window.location.href = res.data.url
      } else {
        throw new Error(res.data.error || "Failed to create checkout session")
      }
    } catch (error) {
        logError("Upgrade failed", { error })
        alert("Failed to start upgrade process.")
        setIsLoading(false)
    }
  }

  const manageSubscription = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const res = await apiClient.post(endpoints.stripe.customerPortal)

      if (res.data.url) {
        window.location.href = res.data.url
      } else {
         // Fallback if no subscription exists
         throw new Error("No active subscription to manage")
      }
    } catch (error) {
       logError("Portal failed", { error })
       alert("Could not access billing portal. You may not have an active subscription yet.")
       setIsLoading(false)
    }
  }

  return {
    subscription,
    usage,
    isLoading,
    upgradePlan,
    manageSubscription,
    // Alias for backward compatibility if needed, using manageSubscription
    cancelSubscription: manageSubscription, 
    reactivateSubscription: manageSubscription, // Portal handles this
  }
}
