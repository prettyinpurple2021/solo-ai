"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { logError, logInfo } from "@/lib/logger"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import {
  Crown,
  Zap,
  Target,
  Star,
  Settings,
  CheckCircle
} from "lucide-react"
import { UIOverlayLines } from '@/components/cyber/UIOverlayLines'
import { NeuralNetworkCanvas } from '@/components/cyber/NeuralNetworkCanvas'
import { HudBorder } from "@/components/cyber/HudBorder"
import { CyberButton } from "@/components/cyber/CyberButton"

import { SubscriptionInfo } from "@/lib/subscription-utils"
import Link from 'next/link'

export default function BillingPage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/billing/subscription')
        if (response.ok) {
          const data = await response.json()
          setSubscription(data)
        }
      } catch (error) {
        logError('Failed to fetch subscription:', error)
      }
    }

    if (user) {
      fetchSubscription()
    }
  }, [user])

  const handleManageBilling = async () => {
    setIsLoading(true)
    toast({
      title: "Billing Portal",
      description: "Redirecting to secure billing portal...",
    })
    
    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
        return
      }

      // Expected state for free users: no paid Stripe customer yet.
      if (response.status === 404) {
        toast({
          title: "No Active Paid Subscription",
          description: "You are currently on a free plan. Choose a paid tier to enable billing portal access.",
        })
        return
      }

      if (!response.ok) {
        logInfo('Billing portal request returned non-OK status', { status: response.status, error: data?.error })
        toast({
          title: "Portal Unavailable",
          description: data?.error || "Unable to open billing portal right now.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Portal Unavailable",
          description: "Unable to open billing portal right now.",
          variant: "destructive"
        })
      }
    } catch (error) {
      logError('Billing portal error:', error);
      toast({
        title: "Portal Error",
        description: "Failed to open billing portal. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpgrade = async (tier: string) => {
    // Free/Launch is not a Stripe checkout plan.
    // If user is paid, this requests cancellation at period end.
    if (tier === 'launch') {
      setIsLoading(true)
      try {
        const response = await fetch('/api/billing/cancel-subscription', { method: 'POST' })
        const data = await response.json()

        if (response.ok) {
          toast({
            title: "Downgrade Scheduled",
            description: data?.message || "Your subscription will be canceled at the end of the current billing period.",
          })
          return
        }

        if (response.status === 404) {
          toast({
            title: "Already on Free Plan",
            description: "No active paid subscription was found.",
          })
          return
        }

        toast({
          title: "Downgrade Error",
          description: data?.error || "Unable to process downgrade right now.",
          variant: "destructive"
        })
      } catch (error) {
        logError('Downgrade error:', error)
        toast({
          title: "Downgrade Error",
          description: "Unable to process downgrade right now.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
      return
    }

    setIsLoading(true)
    toast({
      title: "Upgrade Initiated",
      description: `Processing upgrade to ${tier} plan...`,
    })
    
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });

      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
        return
      }

      // Do not treat expected validation errors as hard app failures.
      if (response.status === 400) {
        toast({
          title: "Plan Selection Required",
          description: data?.error || "Please select a valid paid plan.",
        })
        return
      }

      if (!response.ok) {
        logInfo('Checkout request returned non-OK status', { status: response.status, error: data?.error, tier })
        toast({
          title: "Checkout Error",
          description: data?.error || "Failed to initiate checkout. Please try again later.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Checkout Error",
          description: "Failed to initiate checkout. Please try again later.",
          variant: "destructive"
        })
      }
    } catch (error) {
      logError('Checkout error:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to initiate checkout. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <NeuralNetworkCanvas />
      <UIOverlayLines />
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-neon-cyan/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link href="/dashboard" className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 rounded-none bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown className="w-6 h-6 text-white" />
                </motion.div>
                <span className="font-orbitron text-xl font-bold text-white tracking-widest">SOLOSUCCESS AI</span>
              </Link>

              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <CyberButton variant="ghost" size="sm" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                    Back to Command
                  </CyberButton>
                </Link>
                <CyberButton size="sm" onClick={handleManageBilling} disabled={isLoading} variant="purple">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Billing
                </CyberButton>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-neon-purple fill-neon-purple" />
                <span className="text-neon-purple font-mono text-sm uppercase tracking-wider">
                  Elite Command Center
                </span>
              </div>

              <h1 className="font-orbitron text-5xl font-bold text-white mb-6">
                Tactical <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">Billing</span>
              </h1>

              <p className="text-xl text-gray-400 max-w-2xl font-mono">
                Manage your elite subscription and tactical resources.
                Upgrade your arsenal for maximum business domination.
              </p>
            </motion.div>

            {/* Current Plan Card */}
            <HudBorder className="p-8 mb-12 border-neon-purple/50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-none bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-orbitron font-bold text-white">
                        {subscription?.tier ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1) : 'Free'} Plan
                      </h2>
                      <span className="px-3 py-1 bg-neon-green/20 text-neon-green text-xs font-bold border border-neon-green/30 font-mono">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-gray-400 font-mono">
                      Next billing date: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <p className="text-sm text-gray-400 mb-1 font-mono">Current Usage</p>
                    <p className="text-xl font-bold text-white font-orbitron">
                      {subscription?.usage_percentage !== undefined 
                        ? `${Math.round(subscription.usage_percentage)}%` 
                        : '—'}
                    </p>
                  </div>
                  <CyberButton size="lg" onClick={() => handleUpgrade('dominator')} variant="purple" disabled={isLoading}>
                    Upgrade Plan
                    <Zap className="w-4 h-4 ml-2" />
                  </CyberButton>
                </div>
              </div>
            </HudBorder>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Launch Plan */}
              {/* Launch Plan */}
              <HudBorder className="p-8 relative overflow-hidden group hover:border-neon-cyan/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target className="w-24 h-24 text-neon-cyan" />
                </div>

                <h3 className="text-2xl font-orbitron font-bold text-white mb-2">Launch</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white font-mono">$0</span>
                  <span className="text-gray-400 font-mono">/month</span>
                </div>

                <p className="text-gray-400 mb-8 h-12 font-mono">
                  Essential tools for new entrepreneurs starting their journey.
                </p>

                <CyberButton
                  variant="ghost"
                  className="w-full mb-8 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                  onClick={() => handleUpgrade('launch')}
                  disabled={subscription?.tier === 'launch' || subscription?.tier === 'free' || isLoading}
                >
                  {subscription?.tier === 'launch' || subscription?.tier === 'free' ? 'Current Plan' : 'Downgrade'}
                </CyberButton>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neon-cyan" />
                    <span className="text-white font-mono">Basic Business Plan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neon-cyan" />
                    <span className="text-white font-mono">3 Competitor Analyses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neon-cyan" />
                    <span className="text-white font-mono">Limited AI Credits</span>
                  </div>
                </div>
              </HudBorder>

              {/* Accelerator Plan */}
              {/* Accelerator Plan */}
              <HudBorder className="p-8 relative overflow-hidden border-neon-purple/50 shadow-[0_0_20px_rgba(168,85,247,0.2)] transform scale-105 z-10">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Zap className="w-24 h-24 text-neon-purple" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-neon-purple text-white text-xs font-bold px-3 py-1 font-mono">
                  MOST POPULAR
                </div>

                <h3 className="text-2xl font-orbitron font-bold text-white mb-2 mt-4">Accelerator</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white font-mono">$29</span>
                  <span className="text-gray-400 font-mono">/month</span>
                </div>

                <p className="text-gray-400 mb-8 h-12 font-mono">
                  Advanced tactical tools for growing businesses.
                </p>

                <CyberButton
                  className="w-full mb-8 bg-neon-purple hover:bg-neon-purple/90"
                  onClick={() => handleUpgrade('accelerator')}
                  disabled={subscription?.tier === 'accelerator' || isLoading}
                  variant="purple"
                >
                  {subscription?.tier === 'accelerator' ? 'Current Plan' : 'Upgrade Now'}
                </CyberButton>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neon-purple" />
                    <span className="text-white font-mono">Advanced Business Plan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neon-purple" />
                    <span className="text-white font-mono">10 Competitor Analyses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neon-purple" />
                    <span className="text-white font-mono">Priority AI Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neon-purple" />
                    <span className="text-white font-mono">Market Intelligence</span>
                  </div>
                </div>
              </HudBorder>

              {/* Dominator Plan */}
              {/* Dominator Plan */}
              <HudBorder className="p-8 relative overflow-hidden group hover:border-neon-magenta/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Crown className="w-24 h-24 text-neon-magenta" />
                </div>

                <h3 className="text-2xl font-orbitron font-bold text-white mb-2">Dominator</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white font-mono">$99</span>
                  <span className="text-gray-400 font-mono">/month</span>
                </div>

                <p className="text-gray-400 mb-8 h-12 font-mono">
                  Full arsenal for total market domination.
                </p>

                <CyberButton
                  variant="ghost"
                  className="w-full mb-8 border-neon-magenta/30 text-neon-magenta hover:bg-neon-magenta/10"
                  onClick={() => handleUpgrade('dominator')}
                  disabled={subscription?.tier === 'dominator' || isLoading}
                >
                  {subscription?.tier === 'dominator' ? 'Current Plan' : 'Upgrade Now'}
                </CyberButton>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neon-magenta" />
                    <span className="text-white font-mono">Unlimited Everything</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neon-magenta" />
                    <span className="text-white font-mono">Dedicated Strategist</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neon-magenta" />
                    <span className="text-white font-mono">API Access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-neon-magenta" />
                    <span className="text-white font-mono">White Label Reports</span>
                  </div>
                </div>
              </HudBorder>
            </div>
          </div>
      </div>
    </div>
  )
}
