"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CreditCard, 
  Crown, 
  Zap, 
  Users, 
  CheckCircle, 
  XCircle,
  ArrowUpRight,
  Settings
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  limits: {
    tasks: number
    goals: number
    aiAgents: number
    storage: number
    teamMembers: number
  }
  popular?: boolean
}

interface Subscription {
  id: string
  planId: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  usage: {
    tasks: number
    goals: number
    aiAgents: number
    storage: number
    teamMembers: number
  }
}

interface SubscriptionManagerProps {
  className?: string
}

export function SubscriptionManager({ className = "" }: SubscriptionManagerProps) {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { toast } = useToast()

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        'Up to 10 tasks',
        '3 goals',
        '1 AI agent',
        '100MB storage',
        'Basic templates'
      ],
      limits: {
        tasks: 10,
        goals: 3,
        aiAgents: 1,
        storage: 100,
        teamMembers: 1
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      interval: 'month',
      features: [
        'Unlimited tasks',
        'Unlimited goals',
        '5 AI agents',
        '10GB storage',
        'All templates',
        'Priority support',
        'Analytics dashboard'
      ],
      limits: {
        tasks: -1,
        goals: -1,
        aiAgents: 5,
        storage: 10240,
        teamMembers: 5
      },
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: 99,
      interval: 'month',
      features: [
        'Everything in Pro',
        'Unlimited AI agents',
        '100GB storage',
        'Team collaboration',
        'White-label options',
        'API access',
        'Dedicated support'
      ],
      limits: {
        tasks: -1,
        goals: -1,
        aiAgents: -1,
        storage: 102400,
        teamMembers: -1
      }
    }
  ]

  useEffect(() => {
    loadSubscriptionData()
  }, [loadSubscriptionData])

  const loadSubscriptionData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock subscription data
      const mockSubscription: Subscription = {
        id: 'sub_123',
        planId: 'pro',
        status: 'active',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        usage: {
          tasks: 47,
          goals: 8,
          aiAgents: 3,
          storage: 2.5,
          teamMembers: 2
        }
      }
      
      const currentPlanData = plans.find(p => p.id === mockSubscription.planId)
      
      setSubscription(mockSubscription)
      setCurrentPlan(currentPlanData || null)
    } catch {
      console.error('Failed to load subscription data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const upgradePlan = async (planId: string) => {
    try {
      setIsLoading(true)
      
      // Simulate upgrade process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newPlan = plans.find(p => p.id === planId)
      setCurrentPlan(newPlan || null)
      
      toast({
        title: "✅ Plan upgraded successfully!",
        description: `You're now on the ${newPlan?.name} plan`,
      })
      
      setShowUpgrade(false)
    } catch {
      toast({
        title: "❌ Upgrade failed",
        description: "Please try again or contact support",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const cancelSubscription = async () => {
    try {
      setIsLoading(true)
      
      // Simulate cancellation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true
        })
      }
      
      toast({
        title: "Subscription canceled",
        description: "Your subscription will end at the current billing period",
      })
    } catch {
      toast({
        title: "Failed to cancel",
        description: "Please try again or contact support",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const reactivateSubscription = async () => {
    try {
      setIsLoading(true)
      
      // Simulate reactivation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: false
        })
      }
      
      toast({
        title: "✅ Subscription reactivated!",
        description: "Your subscription will continue as normal",
      })
    } catch {
      toast({
        title: "Failed to reactivate",
        description: "Please try again or contact support",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const formatStorage = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`
    }
    return `${mb} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Plan */}
      {currentPlan && subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Current Plan: {currentPlan.name}
            </CardTitle>
            <CardDescription>
              {subscription.cancelAtPeriodEnd 
                ? "Your subscription will end on " + formatDate(subscription.currentPeriodEnd)
                : "Next billing date: " + formatDate(subscription.currentPeriodEnd)
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Plan Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Plan Features</h4>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Usage</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Tasks</span>
                      <span>{subscription.usage.tasks} / {currentPlan.limits.tasks === -1 ? '∞' : currentPlan.limits.tasks}</span>
                    </div>
                    <Progress value={getUsagePercentage(subscription.usage.tasks, currentPlan.limits.tasks)} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Goals</span>
                      <span>{subscription.usage.goals} / {currentPlan.limits.goals === -1 ? '∞' : currentPlan.limits.goals}</span>
                    </div>
                    <Progress value={getUsagePercentage(subscription.usage.goals, currentPlan.limits.goals)} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>AI Agents</span>
                      <span>{subscription.usage.aiAgents} / {currentPlan.limits.aiAgents === -1 ? '∞' : currentPlan.limits.aiAgents}</span>
                    </div>
                    <Progress value={getUsagePercentage(subscription.usage.aiAgents, currentPlan.limits.aiAgents)} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Storage</span>
                      <span>{formatStorage(subscription.usage.storage)} / {formatStorage(currentPlan.limits.storage)}</span>
                    </div>
                    <Progress value={getUsagePercentage(subscription.usage.storage, currentPlan.limits.storage)} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              {subscription.cancelAtPeriodEnd ? (
                <Button onClick={reactivateSubscription} disabled={isLoading}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Reactivate Subscription
                </Button>
              ) : (
                <Button variant="outline" onClick={cancelSubscription} disabled={isLoading}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </Button>
              )}
              
              <Button onClick={() => setShowUpgrade(true)} disabled={isLoading}>
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
              
              <Button variant="outline" disabled={isLoading}>
                <Settings className="w-4 h-4 mr-2" />
                Billing Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison */}
      {showUpgrade && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Plan</CardTitle>
            <CardDescription>
              Select the plan that best fits your needs
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.popular ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {plan.id === 'free' && <Zap className="w-4 h-4" />}
                      {plan.id === 'pro' && <Crown className="w-4 h-4 text-yellow-600" />}
                      {plan.id === 'business' && <Users className="w-4 h-4 text-blue-600" />}
                      {plan.name}
                    </CardTitle>
                    <div className="text-3xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-gray-600">
                        /{plan.interval}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full"
                      variant={plan.id === currentPlan?.id ? "outline" : "default"}
                      onClick={() => upgradePlan(plan.id)}
                      disabled={plan.id === currentPlan?.id || isLoading}
                    >
                      {plan.id === currentPlan?.id ? 'Current Plan' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline" onClick={() => setShowUpgrade(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            View your past invoices and payments
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {[
              { id: '1', date: '2024-01-01', amount: 29, status: 'paid', description: 'Pro Plan - Monthly' },
              { id: '2', date: '2023-12-01', amount: 29, status: 'paid', description: 'Pro Plan - Monthly' },
              { id: '3', date: '2023-11-01', amount: 29, status: 'paid', description: 'Pro Plan - Monthly' }
            ].map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{invoice.description}</p>
                  <p className="text-sm text-gray-600">{formatDate(invoice.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">${invoice.amount}</span>
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
