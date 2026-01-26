// @ts-nocheck
'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useState, useEffect} from 'react'
import { useAuth} from '@/hooks/use-auth'
import { Button} from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import { Badge} from '@/components/ui/badge'
import { Loader2, Lock, Zap, Crown} from 'lucide-react'
import { useRouter} from 'next/navigation'


interface SubscriptionGuardProps {
  children: React.ReactNode
  requiredTier: 'accelerator' | 'dominator'
  feature: string
  fallback?: React.ReactNode
}

export function SubscriptionGuard({ 
  children, 
  requiredTier, 
  feature, 
  fallback 
}: SubscriptionGuardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAccess()
  }, [user, requiredTier])

  const checkAccess = async () => {
    if (!user) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feature }),
      })

      if (response.ok) {
        const data = await response.json()
        setHasAccess(data.hasAccess)
      } else {
        setHasAccess(false)
      }
    } catch (error) {
      logError('Error checking subscription access:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-muted">
              {requiredTier === 'accelerator' ? (
                <Zap className="h-6 w-6 text-primary" />
              ) : (
                <Crown className="h-6 w-6 text-primary" />
              )}
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-5 w-5" />
            Premium Feature
          </CardTitle>
          <CardDescription>
            This feature requires a {requiredTier} subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              {requiredTier === 'accelerator' ? 'Accelerator Plan' : 'Dominator Plan'}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Upgrade your plan to access {feature} and unlock more powerful features.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              className="w-full" 
              onClick={handleUpgrade}
            >
              Upgrade Now
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}

// Hook for checking subscription access
export function useSubscriptionAccess(requiredTier: 'accelerator' | 'dominator') {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setHasAccess(false)
      setLoading(false)
      return
    }

    const checkAccess = async () => {
      try {
        const response = await fetch('/api/stripe/subscription')
        if (response.ok) {
          const data = await response.json()
          const userTier = data.subscription?.subscription_tier
          
          if (requiredTier === 'accelerator') {
            setHasAccess(userTier === 'accelerator' || userTier === 'dominator')
          } else if (requiredTier === 'dominator') {
            setHasAccess(userTier === 'dominator')
          }
        } else {
          setHasAccess(false)
        }
      } catch (error) {
        logError('Error checking subscription access:', error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, requiredTier])

  return { hasAccess, loading }
}
