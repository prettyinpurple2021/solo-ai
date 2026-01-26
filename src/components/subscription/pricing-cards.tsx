// @ts-nocheck
'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useState} from 'react'
import { Button} from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import { Badge} from '@/components/ui/badge'
import { Check, Loader2, Zap, Crown, Rocket} from 'lucide-react'
import { useAuth} from '@/hooks/use-auth'
import { toast} from '@/hooks/use-toast'


interface PricingCardProps {
  tier: 'launch' | 'accelerator' | 'dominator'
  title: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

const pricingData: PricingCardProps[] = [
  {
    tier: 'launch',
    title: 'Launch',
    description: 'Perfect for ambitious beginners ready to start their empire',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Access to 2 AI agents (Nova & Echo)',
      '5 AI conversations per day',
      'Basic task automation',
      'Email support',
      'Community access',
      'Mobile app access'
    ],
    icon: <Rocket className="h-6 w-6" />
  },
  {
    tier: 'accelerator',
    title: 'Accelerator',
    description: 'For solo founders ready to scale their empire',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      'Access to all 8 AI agents',
      'Unlimited AI conversations',
      'Advanced automation',
      'Priority support',
      'Advanced analytics',
      'File management (10GB)',
      'Competitive intelligence',
      'Guardian AI compliance',
      'Template library access',
      'API access'
    ],
    popular: true,
    icon: <Zap className="h-6 w-6" />
  },
  {
    tier: 'dominator',
    title: 'Dominator',
    description: 'For empire builders who demand the best',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      'Everything in Accelerator',
      'White-label options',
      'Advanced API access',
      'Custom integrations',
      'File management (100GB)',
      'Priority feature requests',
      'Dedicated support',
      'Advanced analytics',
      'Custom workflows',
      'Team collaboration tools'
    ],
    icon: <Crown className="h-6 w-6" />
  }
]

export function PricingCards() {
  const { user } = useAuth()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (tier: 'accelerator' | 'dominator') => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to upgrade your subscription",
        variant: "destructive"
      })
      return
    }

    setLoading(`${tier}-${billingCycle}`)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier, billing: billingCycle }),
      })

      const data = await response.json()
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      logError('Error creating checkout session:', error)
      toast({
        title: "Error",
        description: "Failed to start upgrade process",
        variant: "destructive"
      })
    } finally {
      setLoading(null)
    }
  }

  const getCurrentPrice = (card: PricingCardProps) => {
    return billingCycle === 'yearly' ? card.yearlyPrice : card.monthlyPrice
  }

  const getSavings = (card: PricingCardProps) => {
    if (billingCycle === 'yearly' && card.monthlyPrice > 0) {
      const monthlyTotal = card.monthlyPrice * 12
      return monthlyTotal - card.yearlyPrice
    }
    return 0
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-muted p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setBillingCycle('yearly')}
          >
            Yearly
            <Badge variant="secondary" className="ml-2 text-xs">
              Save 17%
            </Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        {pricingData.map((card) => {
          const currentPrice = getCurrentPrice(card)
          const savings = getSavings(card)
          const isCurrentPlan = user?.subscription_tier === card.tier

          return (
            <Card
              key={card.tier}
              className={`relative ${
                card.popular
                  ? 'border-primary shadow-lg scale-105'
                  : 'border-border'
              } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
            >
              {card.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    {card.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl">{card.title}</CardTitle>
                <CardDescription className="text-sm">
                  {card.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Pricing */}
                <div className="text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">
                      ${currentPrice}
                    </span>
                    {currentPrice > 0 && (
                      <span className="text-muted-foreground ml-1">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Save ${savings} per year
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {card.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <div className="pt-4">
                  {card.tier === 'launch' ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(card.tier as 'accelerator' | 'dominator')}
                      disabled={loading === `${card.tier}-${billingCycle}` || isCurrentPlan}
                    >
                      {loading === `${card.tier}-${billingCycle}` ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isCurrentPlan ? 'Current Plan' : `Upgrade to ${card.title}`}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>
          All plans include a 14-day free trial. Cancel anytime.
          <br />
          Questions? <a href="/contact" className="text-primary hover:underline">Contact our support team</a>
        </p>
      </div>
    </div>
  )
}
