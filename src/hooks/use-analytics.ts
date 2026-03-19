import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from './use-auth'
import { AnalyticsEvent } from '@/lib/analytics'


interface AnalyticsHook {
  track: (event: AnalyticsEvent, properties?: Record<string, any>) => Promise<void>
  trackPageView: (page: string, properties?: Record<string, any>) => Promise<void>
  trackPerformance: (metrics: Record<string, number>) => Promise<void>
  trackError: (error: string, properties?: Record<string, any>) => Promise<void>
}

export function useAnalytics(): AnalyticsHook {
  const { user } = useAuth()
  const sessionStartTime = useRef<number>(Date.now())
  const pageLoadTime = useRef<number>(0)

  // Track page load time
  useEffect(() => {
    pageLoadTime.current = Date.now()
    
    // Track page view when component mounts
    const trackInitialPageView = async () => {
      if (user) {
        await track('page_view', {
          page: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }
    }

    trackInitialPageView()
  }, [user])

  // Track session duration when component unmounts
  useEffect(() => {
    return () => {
      if (user) {
        const sessionDuration = Date.now() - sessionStartTime.current
        track('user_logout', {
          sessionDuration,
          timestamp: new Date().toISOString()
        }).catch(error => logError('Error tracking user logout', {}, error))
      }
    }
  }, [user])

  const track = useCallback(async (
    event: AnalyticsEvent,
    properties: Record<string, any> = {}
  ): Promise<void> => {
    if (!user) return

    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          properties: {
            ...properties,
            userId: user.id,
            sessionId: sessionStartTime.current.toString(),
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        logError('Failed to track analytics event:', response.statusText)
      }
    } catch (error) {
      logError('Error tracking analytics event:', error)
    }
  }, [user])

  const trackPageView = useCallback(async (
    page: string,
    properties: Record<string, any> = {}
  ): Promise<void> => {
    await track('page_view', {
      page,
      ...properties
    })
  }, [track])

  const trackPerformance = useCallback(async (
    metrics: Record<string, number>
  ): Promise<void> => {
    if (!user) return

    try {
      const response = await fetch('/api/analytics/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metrics,
          userId: user.id,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        logError('Failed to track performance metrics:', response.statusText)
      }
    } catch (error) {
      logError('Error tracking performance metrics:', error)
    }
  }, [user])

  const trackError = useCallback(async (
    error: string,
    properties: Record<string, any> = {}
  ): Promise<void> => {
    await track('error_occurred', {
      error,
      ...properties
    })
  }, [track])

  return {
    track,
    trackPageView,
    trackPerformance,
    trackError
  }
}

// Hook for tracking page views automatically
export function usePageTracking() {
  const { trackPageView } = useAnalytics()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const handleRouteChange = () => {
      trackPageView(window.location.pathname)
    }

    // Track initial page view
    trackPageView(window.location.pathname)

    // Listen for route changes (for Next.js router)
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [user, trackPageView])
}

// Hook for tracking performance metrics
export function usePerformanceTracking() {
  const { trackPerformance } = useAnalytics()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Track page load time
    const trackPageLoadTime = () => {
      const loadTime = performance.now()
      trackPerformance({
        pageLoadTime: loadTime
      })
    }

    // Track when page is fully loaded
    if (document.readyState === 'complete') {
      trackPageLoadTime()
    } else {
      window.addEventListener('load', trackPageLoadTime)
    }

    // Track memory usage if available
    const trackMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        trackPerformance({
          memoryUsage: memory.usedJSHeapSize,
          memoryLimit: memory.jsHeapSizeLimit
        })
      }
    }

    // Track memory usage every 30 seconds
    const memoryInterval = setInterval(trackMemoryUsage, 30000)

    return () => {
      window.removeEventListener('load', trackPageLoadTime)
      clearInterval(memoryInterval)
    }
  }, [user, trackPerformance])
}

// Hook for tracking errors
export function useErrorTracking() {
  const { trackError } = useAnalytics()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const handleError = (event: ErrorEvent) => {
      trackError(event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError('Unhandled Promise Rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [user, trackError])
}
