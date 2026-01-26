// @ts-nocheck
'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useState, useEffect} from 'react'
import { Button} from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import { Badge} from '@/components/ui/badge'
import { useAuth} from '@/hooks/use-auth'
import { Loader2, CreditCard, Calendar, AlertCircle, CheckCircle} from 'lucide-react'
import { toast} from '@/hooks/use-toast'


interface SubscriptionData {
  subscription_tier: string
  subscription_status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export function SubscriptionManager() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    }
  }, [user])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      logError('Error fetching subscription:', error)
      toast({
        title: "Error",
        description: "Failed to fetch subscription details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (tier: 'accelerator' | 'dominator', billing: 'monthly' | 'yearly') => {
    setActionLoading(`upgrade-${tier}-${billing}`)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier, billing }),
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
      setActionLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setActionLoading('billing')
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to open billing portal')
      }
    } catch (error) {
      logError('Error opening billing portal:', error)
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.')) {
      return
    }

    setActionLoading('cancel')
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Subscription Canceled",
          description: data.message,
        })
        fetchSubscription() // Refresh subscription data
      } else {
        throw new Error(data.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      logError('Error canceling subscription:', error)
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReactivateSubscription = async () => {
    setActionLoading('reactivate')
    try {
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (response.ok) {
        toast({
          title: "Subscription Reactivated",
          description: data.message,
        })
        fetchSubscription() // Refresh subscription data
      } else {
        throw new Error(data.error || 'Failed to reactivate subscription')
      }
    } catch (error) {
      logError('Error reactivating subscription:', error)
      toast({
        title: "Error",
        description: "Failed to reactivate subscription",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No subscription found</p>
        </CardContent>
      </Card>
    )
  }

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'launch': return 'Launch (Free)'
      case 'accelerator': return 'Accelerator'
      case 'dominator': return 'Dominator'
      default: return tier
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'canceled': return 'bg-red-100 text-red-800'
      case 'past_due': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{getTierDisplayName(subscription.subscription_tier)}</h3>
              <Badge className={getStatusColor(subscription.subscription_status)}>
                {subscription.subscription_status}
              </Badge>
            </div>
            {subscription.cancel_at_period_end && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Canceling
              </Badge>
            )}
          </div>

          {subscription.current_period_end && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {subscription.cancel_at_period_end ? 'Access until' : 'Next billing'}:
                {' '}{formatDate(subscription.current_period_end)}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {subscription.stripe_customer_id && (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={actionLoading === 'billing'}
              >
                {actionLoading === 'billing' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Manage Billing
              </Button>
            )}

            {subscription.subscription_tier !== 'launch' && (
              <>
                {subscription.cancel_at_period_end ? (
                  <Button
                    variant="cyan"
                    onClick={handleReactivateSubscription}
                    disabled={actionLoading === 'reactivate'}
                  >
                    {actionLoading === 'reactivate' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Reactivate
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={actionLoading === 'cancel'}
                  >
                    {actionLoading === 'cancel' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    )}
                    Cancel Subscription
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Options */}
      {subscription.subscription_tier === 'launch' && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>
              Unlock more features and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">Accelerator</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Perfect for growing businesses
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade('accelerator', 'monthly')}
                    disabled={actionLoading === 'upgrade-accelerator-monthly'}
                  >
                    {actionLoading === 'upgrade-accelerator-monthly' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    $19/month
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleUpgrade('accelerator', 'yearly')}
                    disabled={actionLoading === 'upgrade-accelerator-yearly'}
                  >
                    {actionLoading === 'upgrade-accelerator-yearly' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    $190/year (Save $38)
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">Dominator</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For enterprise-level needs
                </p>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade('dominator', 'monthly')}
                    disabled={actionLoading === 'upgrade-dominator-monthly'}
                  >
                    {actionLoading === 'upgrade-dominator-monthly' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    $29/month
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleUpgrade('dominator', 'yearly')}
                    disabled={actionLoading === 'upgrade-dominator-yearly'}
                  >
                    {actionLoading === 'upgrade-dominator-yearly' ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    $290/year (Save $58)
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}