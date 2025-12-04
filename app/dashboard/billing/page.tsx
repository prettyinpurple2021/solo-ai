"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import {
  CreditCard,
  Crown,
  Zap,
  Check,
  X,
  Shield,
  Target,
  Users,
  ArrowRight,
  Star,
  Trophy,
  Clock,
  DollarSign,
  Settings,
  Download,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import {
  TacticalButton,
  GlassCard,
  RankStars,
  CamoBackground,
  SergeantDivider,
  StatsBadge,
  TacticalGrid,
  TacticalGridItem
} from '@/components/military'
import Link from 'next/link'

export default function BillingPage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/api/billing/subscription', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setSubscription(data)
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      }
    }

    if (user) {
      fetchSubscription()
    }
  }, [user])

  const handleManageBilling = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          toast({
            title: "Billing Portal",
            description: data.message || "Redirecting to billing portal...",
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to access billing portal",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error accessing billing portal:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async (tier: string) => {
    setIsLoading(true)
    try {
      // Map tier to price ID (in a real app, these would be constants or fetched)
      const priceIds = {
        launch: 'price_launch_id',
        accelerator: 'price_accelerator_id',
        dominator: 'price_dominator_id'
      }
      
      const priceId = priceIds[tier as keyof typeof priceIds]
      
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priceId })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          toast({
            title: "Upgrade Initiated",
            description: data.message || `Processing upgrade to ${tier} plan...`,
          })
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to initiate upgrade",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error initiating upgrade:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-military-midnight flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-military-hot-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-military-midnight relative overflow-hidden">
      <CamoBackground opacity={0.1} withGrid>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-panel-strong border-b border-military-hot-pink/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link href="/dashboard" className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-military-hot-pink to-military-blush-pink flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown className="w-6 h-6 text-white" />
                </motion.div>
                <span className="font-heading text-xl font-bold text-white">SoloSuccess AI</span>
              </Link>

              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <TacticalButton variant="outline" size="sm">
                    Back to Command
                  </TacticalButton>
                </Link>
                <TacticalButton size="sm" onClick={handleManageBilling} disabled={isLoading}>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Billing
                </TacticalButton>
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
                <RankStars count={5} size="lg" />
                <span className="text-military-hot-pink font-tactical text-sm uppercase tracking-wider">
                  Elite Command Center
                </span>
              </div>

              <h1 className="font-heading text-5xl font-bold text-white mb-6">
                Tactical <span className="text-transparent bg-clip-text bg-gradient-to-r from-military-hot-pink to-military-blush-pink">Billing</span>
              </h1>

              <p className="text-xl text-military-storm-grey max-w-2xl">
                Manage your elite subscription and tactical resources.
                Upgrade your arsenal for maximum business domination.
              </p>
            </motion.div>

            {/* Current Plan Card */}
            <GlassCard className="p-8 mb-12 border-military-hot-pink/50" glow>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-military-hot-pink to-military-blush-pink flex items-center justify-center shadow-lg shadow-military-hot-pink/20">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-heading font-bold text-white">
                        {subscription?.tier ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1) : 'Free'} Plan
                      </h2>
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-military-storm-grey">
                      Next billing date: {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <p className="text-sm text-military-storm-grey mb-1">Current Usage</p>
                    <p className="text-xl font-bold text-white">85%</p>
                  </div>
                  <TacticalButton size="lg" onClick={() => handleUpgrade('dominator')}>
                    Upgrade Plan
                    <Zap className="w-4 h-4 ml-2" />
                  </TacticalButton>
                </div>
              </div>
            </GlassCard>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Launch Plan */}
              <GlassCard className="p-8 relative overflow-hidden group hover:border-military-hot-pink/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target className="w-24 h-24" />
                </div>

                <h3 className="text-2xl font-heading font-bold text-white mb-2">Launch</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-military-storm-grey">/month</span>
                </div>

                <p className="text-military-storm-grey mb-8 h-12">
                  Essential tools for new entrepreneurs starting their journey.
                </p>

                <TacticalButton
                  variant="outline"
                  className="w-full mb-8"
                  onClick={() => handleUpgrade('launch')}
                  disabled={subscription?.tier === 'launch' || subscription?.tier === 'free'}
                >
                  {subscription?.tier === 'launch' || subscription?.tier === 'free' ? 'Current Plan' : 'Downgrade'}
                </TacticalButton>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-military-hot-pink" />
                    <span className="text-white">Basic Business Plan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-military-hot-pink" />
                    <span className="text-white">3 Competitor Analyses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-military-hot-pink" />
                    <span className="text-white">Limited AI Credits</span>
                  </div>
                </div>
              </GlassCard>

              {/* Accelerator Plan */}
              <GlassCard className="p-8 relative overflow-hidden border-military-hot-pink/50 shadow-lg shadow-military-hot-pink/10 transform scale-105 z-10">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Zap className="w-24 h-24" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-military-hot-pink text-white text-xs font-bold px-3 py-1 rounded-b-lg">
                  MOST POPULAR
                </div>

                <h3 className="text-2xl font-heading font-bold text-white mb-2 mt-4">Accelerator</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">$29</span>
                  <span className="text-military-storm-grey">/month</span>
                </div>

                <p className="text-military-storm-grey mb-8 h-12">
                  Advanced tactical tools for growing businesses.
                </p>

                <TacticalButton
                  className="w-full mb-8"
                  onClick={() => handleUpgrade('accelerator')}
                  disabled={subscription?.tier === 'accelerator'}
                >
                  {subscription?.tier === 'accelerator' ? 'Current Plan' : 'Upgrade Now'}
                </TacticalButton>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-military-hot-pink" />
                    <span className="text-white">Advanced Business Plan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-military-hot-pink" />
                    <span className="text-white">10 Competitor Analyses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-military-hot-pink" />
                    <span className="text-white">Priority AI Support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-military-hot-pink" />
                    <span className="text-white">Market Intelligence</span>
                  </div>
                </div>
              </GlassCard>

              {/* Dominator Plan */}
              <GlassCard className="p-8 relative overflow-hidden group hover:border-military-hot-pink/50 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Crown className="w-24 h-24" />
                </div>

                <h3 className="text-2xl font-heading font-bold text-white mb-2">Dominator</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">$99</span>
                  <span className="text-military-storm-grey">/month</span>
                </div>

                <p className="text-military-storm-grey mb-8 h-12">
                  Full arsenal for total market domination.
                </p>

                <TacticalButton
                  variant="outline"
                  className="w-full mb-8"
                  onClick={() => handleUpgrade('dominator')}
                  disabled={subscription?.tier === 'dominator'}
                >
                  {subscription?.tier === 'dominator' ? 'Current Plan' : 'Upgrade Now'}
                </TacticalButton>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-military-hot-pink" />
                    <span className="text-white">Unlimited Everything</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-military-hot-pink" />
                    <span className="text-white">Dedicated Strategist</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-military-hot-pink" />
                    <span className="text-white">API Access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-military-hot-pink" />
                    <span className="text-white">White Label Reports</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </CamoBackground>
    </div>
  )
}