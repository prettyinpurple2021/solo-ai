"use client"

import { useState, useEffect } from "react"

export interface Subscription {
  plan: "launchpad" | "accelerator" | "dominator"
  status: "active" | "canceled" | "past_due" | "trialing"
  billingCycle: "monthly" | "yearly"
  nextBilling: string
  cancelAtPeriodEnd: boolean
}

export interface Usage {
  conversations: {
    used: number
    limit: number // -1 for unlimited
  }
  agents: {
    used: number
    limit: number
  }
  automations: {
    used: number
    limit: number // -1 for unlimited
  }
  teamMembers: {
    used: number
    limit: number // -1 for unlimited
  }
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription>({
    plan: "dominator", // Default to highest plan for development
    status: "active",
    billingCycle: "monthly",
    nextBilling: "2024-02-15",
    cancelAtPeriodEnd: false,
  })

  const [usage, setUsage] = useState<Usage>({
    conversations: {
      used: 45,
      limit: -1, // Unlimited for dominator
    },
    agents: {
      used: 8,
      limit: 8,
    },
    automations: {
      used: 12,
      limit: -1, // Unlimited for dominator
    },
    teamMembers: {
      used: 3,
      limit: -1, // Unlimited for dominator
    },
  })

  const [isLoading, setIsLoading] = useState(false)

  // Mock data based on plan
  useEffect(() => {
    const updateUsageBasedOnPlan = () => {
      switch (subscription.plan) {
        case "launchpad":
          setUsage({
            conversations: { used: 3, limit: 5 },
            agents: { used: 2, limit: 2 },
            automations: { used: 1, limit: 3 },
            teamMembers: { used: 1, limit: 1 },
          })
          break
        case "accelerator":
          setUsage({
            conversations: { used: 67, limit: 100 },
            agents: { used: 5, limit: 5 },
            automations: { used: 8, limit: 15 },
            teamMembers: { used: 2, limit: 3 },
          })
          break
        case "dominator":
          setUsage({
            conversations: { used: 156, limit: -1 },
            agents: { used: 8, limit: 8 },
            automations: { used: 23, limit: -1 },
            teamMembers: { used: 5, limit: -1 },
          })
          break
      }
    }

    updateUsageBasedOnPlan()
  }, [subscription.plan])

  const upgradePlan = async (newPlan: "accelerator" | "dominator") => {
    setIsLoading(true)
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSubscription((prev) => ({ ...prev, plan: newPlan }))
    setIsLoading(false)
  }

  const cancelSubscription = async () => {
    setIsLoading(true)
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSubscription((prev) => ({ ...prev, cancelAtPeriodEnd: true }))
    setIsLoading(false)
  }

  const reactivateSubscription = async () => {
    setIsLoading(true)
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSubscription((prev) => ({ ...prev, cancelAtPeriodEnd: false }))
    setIsLoading(false)
  }

  return {
    subscription,
    usage,
    isLoading,
    upgradePlan,
    cancelSubscription,
    reactivateSubscription,
  }
}
