"use client"

import { logError,} from '@/lib/logger'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'


import {
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Wallet,
  Store
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link'

interface PaymentProviderConnection {
  provider: string
  connected: boolean
  accountName?: string
  accountEmail?: string
  lastSyncedAt?: string
  isSyncing?: boolean
}

interface PaymentProvider {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  setupGuide: string
  quickStartGuide: string
  color: string
}

const PAYMENT_PROVIDERS: PaymentProvider[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Connect your Stripe account to track payments, subscriptions, and revenue',
    setupGuide: '/docs/user-guides/STRIPE_CONNECT_SETUP.md',
    quickStartGuide: '/docs/user-guides/STRIPE_CONNECT_QUICK_START.md',
    color: 'bg-purple-500'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <Wallet className="w-5 h-5" />,
    description: 'Connect your PayPal Business account to track transactions and revenue',
    setupGuide: '/docs/user-guides/PAYPAL_SETUP.md',
    quickStartGuide: '/docs/user-guides/PAYPAL_QUICK_START.md',
    color: 'bg-blue-500'
  },
  {
    id: 'square',
    name: 'Square',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Connect your Square account to track in-person and online payments',
    setupGuide: '/docs/user-guides/SQUARE_SETUP.md',
    quickStartGuide: '/docs/user-guides/SQUARE_QUICK_START.md',
    color: 'bg-green-500'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: <ShoppingCart className="w-5 h-5" />,
    description: 'Connect your Shopify store to track sales and revenue',
    setupGuide: '/docs/user-guides/SHOPIFY_SETUP.md',
    quickStartGuide: '/docs/user-guides/SHOPIFY_QUICK_START.md',
    color: 'bg-emerald-500'
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    icon: <Store className="w-5 h-5" />,
    description: 'Connect your WooCommerce store via REST API to track sales',
    setupGuide: '/docs/user-guides/WOOCOMMERCE_SETUP.md',
    quickStartGuide: '/docs/user-guides/WOOCOMMERCE_QUICK_START.md',
    color: 'bg-orange-500'
  },
  {
    id: 'manual',
    name: 'Manual Entry',
    icon: <DollarSign className="w-5 h-5" />,
    description: 'Manually enter your revenue data (no API connection required)',
    setupGuide: '/docs/user-guides/MANUAL_REVENUE_SETUP.md',
    quickStartGuide: '/docs/user-guides/MANUAL_REVENUE_QUICK_START.md',
    color: 'bg-gray-500'
  }
]

interface RevenueIntegrationProps {
  className?: string
}

export function RevenueIntegration({ className = "" }: RevenueIntegrationProps) {
  const [connections, setConnections] = useState<Record<string, PaymentProviderConnection>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [ setShowCredentialsDialog] = useState<string | null>(null)
  const [] = useState<Record<string, any>>({})
  const { toast } = useToast()

  // Initialize connections state
  useEffect(() => {
    const initialConnections: Record<string, PaymentProviderConnection> = {}
    PAYMENT_PROVIDERS.forEach(provider => {
      initialConnections[provider.id] = {
        provider: provider.id,
        connected: false
      }
    })
    setConnections(initialConnections)
  }, [])

  const checkConnections = useCallback(async () => {
    const providers = PAYMENT_PROVIDERS.filter(p => p.id !== 'manual').map(p => p.id)
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
    if (!token) return

    for (const provider of providers) {
      try {
        const response = await fetch(`/api/integrations/payment-providers/${provider}?action=status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setConnections(prev => ({
            ...prev,
            [provider]: {
              ...prev[provider],
              connected: data.connected,
              accountName: data.accountName || data.account_name,
              accountEmail: data.accountEmail || data.account_email,
              lastSyncedAt: data.lastSyncedAt || data.last_synced_at
            }
          }))
        }
      } catch (error) {
        logError(`Failed to check ${provider} connection:`, error)
      }
    }
  }, [])

  useEffect(() => {
    checkConnections()
  }, [checkConnections])

  const handleConnect = async (providerId: string) => {
    const provider = PAYMENT_PROVIDERS.find(p => p.id === providerId)
    if (!provider) return

    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to connect payment providers',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      if (providerId === 'stripe') {
        // Stripe uses OAuth Connect
        const response = await fetch('/api/integrations/stripe/connect?action=auth_url', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const { url } = await response.json()
          if (url) {
            window.location.href = url
          } else {
            throw new Error('No authorization URL received')
          }
        } else {
          const error = await response.json()
          throw new Error(error.message || 'Failed to get authorization URL')
        }
      } else if (providerId === 'manual') {
        // Manual entry doesn't need connection
        toast({
          title: 'Manual Entry',
          description: 'You can manually enter revenue data in the Treasury component',
        })
        setIsLoading(false)
        return
      } else {
        // Other providers may need API credentials
        setShowCredentialsDialog(providerId)
        setIsLoading(false)
        return
      }
    } catch (error: any) {
      logError(`Failed to connect ${providerId}:`, error)
      toast({
        title: 'Connection Failed',
        description: error.message || `Failed to connect ${provider.name}`,
        variant: 'destructive'
      })
      setIsLoading(false)
    }
  }

  const handleDisconnect = async (providerId: string) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
    if (!token) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/integrations/payment-providers/${providerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disconnect: true })
      })

      if (response.ok) {
        setConnections(prev => ({
          ...prev,
          [providerId]: {
            ...prev[providerId],
            connected: false,
            accountName: undefined,
            accountEmail: undefined,
            lastSyncedAt: undefined
          }
        }))
        toast({
          title: 'Disconnected',
          description: `${PAYMENT_PROVIDERS.find(p => p.id === providerId)?.name} account disconnected`
        })
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (error) {
      logError(`Failed to disconnect ${providerId}:`, error)
      toast({
        title: 'Disconnect Failed',
        description: `Failed to disconnect ${PAYMENT_PROVIDERS.find(p => p.id === providerId)?.name}`,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async (providerId: string) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
    if (!token) return

    setConnections(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        isSyncing: true
      }
    }))

    try {
      const response = await fetch(`/api/integrations/payment-providers/${providerId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await checkConnections()
        toast({
          title: 'Sync Complete',
          description: 'Revenue data has been updated'
        })
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      logError(`Failed to sync ${providerId}:`, error)
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync revenue data',
        variant: 'destructive'
      })
    } finally {
      setConnections(prev => ({
        ...prev,
        [providerId]: {
          ...prev[providerId],
          isSyncing: false
        }
      }))
    }
  }

  // Handle Stripe OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const stripeCode = urlParams.get('stripe_code')
    const stripeState = urlParams.get('stripe_state')
    const stripeError = urlParams.get('stripe_error')

    if (stripeError) {
      toast({
        title: 'Stripe Connection Failed',
        description: urlParams.get('stripe_error_description') || 'Failed to connect Stripe account',
        variant: 'destructive'
      })
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname + window.location.search.replace(/[?&]stripe_(code|state|error|error_description)=[^&]*/g, ''))
      return
    }

    if (stripeCode && stripeState) {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
      if (token) {
        fetch('/api/integrations/stripe/connect', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code: stripeCode, state: stripeState })
        })
          .then(async (res) => {
            if (res.ok) {
              await checkConnections()
              toast({
                title: 'Stripe Connected',
                description: 'Your Stripe account has been connected successfully'
              })
            } else {
              const error = await res.json()
              throw new Error(error.message || 'Failed to connect')
            }
          })
          .catch((error) => {
            logError('Stripe OAuth callback error:', error)
            toast({
              title: 'Connection Failed',
              description: error.message || 'Failed to connect Stripe account',
              variant: 'destructive'
            })
          })
          .finally(() => {
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname + window.location.search.replace(/[?&]stripe_(code|state|error|error_description)=[^&]*/g, ''))
          })
      }
    }
  }, [checkConnections, toast])

  return (
    <div className={className}>
      <Card className="border-2 border-neon-cyan bg-dark-card rounded-sm border-military-hot-pink/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-military-hot-pink" />
                Revenue Tracking
              </CardTitle>
              <CardDescription className="text-military-storm-grey mt-2">
                Connect your payment providers to automatically track revenue, MRR, and financial metrics
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Banner */}
          <div className="bg-military-tactical/30 border border-military-hot-pink/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-military-hot-pink flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-military-storm-grey">
              <p className="font-semibold text-white mb-1">Your Data, Your Privacy</p>
              <p>
                All payment provider connections use secure OAuth. SoloSuccess AI never stores your payment credentials or secret keys. 
                You can disconnect at any time.
              </p>
            </div>
          </div>

          {/* Payment Provider Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PAYMENT_PROVIDERS.map((provider) => {
              const connection = connections[provider.id] || { provider: provider.id, connected: false }
              const isConnected = connection.connected

              return (
                <Card key={provider.id} className="border-2 border-neon-cyan bg-dark-card rounded-sm border-military-tactical/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`${provider.color} p-2 rounded-lg text-white`}>
                          {provider.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{provider.name}</h3>
                          <p className="text-xs text-military-storm-grey">{provider.description}</p>
                        </div>
                      </div>
                      {isConnected ? (
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-military-tactical/30 text-military-storm-grey border-military-tactical/50">
                          <XCircle className="w-3 h-3 mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>

                    {isConnected && (
                      <div className="mb-3 space-y-1 text-xs text-military-storm-grey">
                        {connection.accountName && (
                          <p><span className="text-white">Account:</span> {connection.accountName}</p>
                        )}
                        {connection.accountEmail && (
                          <p><span className="text-white">Email:</span> {connection.accountEmail}</p>
                        )}
                        {connection.lastSyncedAt && (
                          <p><span className="text-white">Last Synced:</span> {new Date(connection.lastSyncedAt).toLocaleString()}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {!isConnected ? (
                        <Button
                          onClick={() => handleConnect(provider.id)}
                          disabled={isLoading}
                          className="flex-1 bg-military-hot-pink hover:bg-military-hot-pink/80 text-white"
                          size="sm"
                        >
                          Connect {provider.name}
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleSync(provider.id)}
                            disabled={connection.isSyncing || isLoading}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            {connection.isSyncing ? (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Sync Now
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleDisconnect(provider.id)}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            Disconnect
                          </Button>
                        </>
                      )}

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2"
                              asChild
                            >
                              <Link href={provider.setupGuide} target="_blank" rel="noopener noreferrer">
                                <HelpCircle className="w-4 h-4 text-military-storm-grey hover:text-military-hot-pink" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Setup Guide</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Quick Start Link */}
                    <div className="mt-2">
                      <Link
                        href={provider.quickStartGuide}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-military-hot-pink hover:text-military-blush-pink flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Quick Start Guide
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Help Section */}
          <div className="mt-6 p-4 bg-military-tactical/20 rounded-lg border border-military-tactical/30">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-military-hot-pink" />
              Need Help?
            </h4>
            <p className="text-xs text-military-storm-grey mb-3">
              Each payment provider has detailed setup guides. Click the help icon (?) next to any provider for step-by-step instructions.
            </p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_PROVIDERS.map(provider => (
                <Link
                  key={provider.id}
                  href={provider.setupGuide}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-military-hot-pink hover:text-military-blush-pink flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {provider.name} Guide
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

