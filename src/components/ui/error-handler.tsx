"use client"

import { logError, logWarn,} from '@/lib/logger'
import { useState, useEffect} from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Badge} from "@/components/ui/badge"
import { Alert, AlertDescription} from "@/components/ui/alert"

import {
  TriangleAlert, RefreshCw, WifiOff, X, Info, CheckCircle, Clock, Lightbulb, Home} from "lucide-react"

interface ErrorInfo {
  id: string
  type: "error" | "warning" | "info" | "success"
  title: string
  message: string
  details?: string
  retryAction?: () => Promise<void>
  dismissible?: boolean
  autoRetry?: boolean
  retryCount?: number
  maxRetries?: number
  timestamp: Date
}

interface ErrorHandlerProps {
  error?: ErrorInfo | null
  onRetry?: () => void
  onDismiss?: () => void
  showOfflineIndicator?: boolean
  className?: string
}

export function ErrorHandler({ 
  error, 
  onRetry, 
  onDismiss, 
  showOfflineIndicator = true,
  className 
}: ErrorHandlerProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = async () => {
    if (!error?.retryAction) {
      onRetry?.()
      return
    }

    setIsRetrying(true)
    setRetryCount(prev => prev + 1)

    try {
      await error.retryAction()
    } catch (retryError) {
      logError('Retry failed:', retryError)
    } finally {
      setIsRetrying(false)
    }
  }

  const getErrorIcon = (type: string) => {
    switch (type) {
      case "error": return <TriangleAlert className="h-5 w-5 text-neon-magenta" />
      case "warning": return <TriangleAlert className="h-5 w-5 text-neon-orange" />
      case "info": return <Info className="h-5 w-5 text-neon-cyan" />
      case "success": return <CheckCircle className="h-5 w-5 text-neon-lime" />
      default: return <TriangleAlert className="h-5 w-5 text-neon-magenta" />
    }
  }

  const getErrorColor = (type: string) => {
    switch (type) {
      case "error": return "border-neon-magenta bg-neon-magenta/10"
      case "warning": return "border-neon-orange bg-neon-orange/10"
      case "info": return "border-neon-cyan bg-neon-cyan/10"
      case "success": return "border-neon-lime bg-neon-lime/10"
      default: return "border-neon-magenta bg-neon-magenta/10"
    }
  }

  const getErrorMessage = (error: ErrorInfo) => {
    // Common error messages with user-friendly alternatives
    const errorMessages: Record<string, string> = {
      "NETWORK_ERROR": "We're having trouble connecting to our servers. Please check your internet connection and try again.",
      "TIMEOUT_ERROR": "The request is taking longer than expected. This might be due to high server load.",
      "AUTH_ERROR": "Your session has expired. Please sign in again to continue.",
      "PERMISSION_ERROR": "You don't have permission to perform this action. Please contact support if you believe this is an error.",
      "VALIDATION_ERROR": "Please check your input and try again. Some fields may be missing or incorrect.",
      "SERVER_ERROR": "We're experiencing technical difficulties. Our team has been notified and is working to fix this.",
      "RATE_LIMIT_ERROR": "You've made too many requests. Please wait a moment before trying again.",
      "FILE_TOO_LARGE": "The file you're trying to upload is too large. Please choose a smaller file or compress it.",
      "UNSUPPORTED_FILE_TYPE": "This file type is not supported. Please use a different format.",
      "STORAGE_QUOTA_EXCEEDED": "You've reached your storage limit. Please delete some files or upgrade your plan.",
      "DEFAULT": "Something went wrong. Please try again or contact support if the problem persists."
    }

    return errorMessages[error.id] || error.message || errorMessages.DEFAULT
  }

  const getRetryMessage = () => {
    if (retryCount === 0) return "Try again"
    if (retryCount === 1) return "Try again"
    if (retryCount === 2) return "One more time"
    return `Retry (${retryCount})`
  }

  const canRetry = error && (error.retryAction || onRetry) && 
    (!error.maxRetries || retryCount < error.maxRetries)

  if (!error && !showOfflineIndicator) return null

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Offline Indicator */}
      {showOfflineIndicator && !isOnline && (
        <Alert className="border-neon-orange bg-neon-orange/10">
          <WifiOff className="h-4 w-4 text-neon-orange" />
          <AlertDescription className="text-gray-300">
            You&apos;re currently offline. Some features may be limited. 
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-neon-orange underline ml-1"
              onClick={() => window.location.reload()}
            >
              Refresh when online
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Card className={`border-2 ${getErrorColor(error.type)} bg-dark-card`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getErrorIcon(error.type)}
                <div className="flex-1">
                  <CardTitle className="text-base font-bold text-white">
                    {error.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="cyan" className="text-xs">
                      {error.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {error.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              {error.dismissible && onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="h-6 w-6 p-0 text-gray-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-300 mb-4 font-mono">
              {getErrorMessage(error)}
            </p>

            {error.details && (
              <details className="mb-4">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-neon-cyan font-mono">
                  Technical Details
                </summary>
                <pre className="text-xs text-gray-400 mt-2 p-2 bg-dark-bg border border-gray-700 rounded-sm overflow-x-auto font-mono">
                  {error.details}
                </pre>
              </details>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {canRetry && (
                  <Button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    variant="cyan"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {isRetrying ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {getRetryMessage()}
                  </Button>
                )}

                {error.autoRetry && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                    <Clock className="h-3 w-3" />
                    Auto-retrying in 30s...
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('/help', '_blank')}
                  className="text-xs"
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Get Help
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('/contact', '_blank')}
                  className="text-xs"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Global error boundary component
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Ignore errors that shouldn't trigger error boundary
      // - ResizeObserver errors (common browser quirk)
      // - Network errors (handled by network error handlers)
      // - Script loading errors for external resources
      // - CSP violations (already logged by browser)
      const errorMessage = event.error?.message || event.message || ''
      const errorSource = event.filename || ''
      
      // Ignore non-critical errors
      if (
        errorMessage.includes('ResizeObserver') ||
        errorMessage.includes('Non-Error promise rejection') ||
        errorMessage.includes('Script error') ||
        errorSource.includes('googletagmanager.com') ||
        errorSource.includes('google-analytics.com') ||
        errorMessage.includes('Failed to load resource') ||
        errorMessage.includes('net::ERR_')
      ) {
        logWarn('Ignored non-critical error:', { message: errorMessage, source: errorSource })
        return
      }

      // Only catch actual runtime errors
      if (event.error && event.error instanceof Error) {
        logError('Global error caught:', event.error)
        setError(event.error)
        setHasError(true)
      } else {
        logWarn('Non-Error event caught:', event)
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Ignore non-error rejections and navigation cancellations
      const reason = event.reason
      const reasonMessage = reason?.message || String(reason) || ''
      
      // Ignore navigation cancellations and common non-critical rejections
      if (
        reasonMessage.includes('navigation') ||
        reasonMessage.includes('AbortError') ||
        reasonMessage.includes('canceled') ||
        reasonMessage.includes('aborted') ||
        !(reason instanceof Error)
      ) {
        logWarn('Ignored promise rejection:', reason)
        return
      }

      logError('Unhandled promise rejection:', reason)
      setError(reason instanceof Error ? reason : new Error(reasonMessage || 'Promise rejected'))
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (hasError) {
    const errorMessage = error?.message || 'An unexpected error occurred'
    const isNetworkError = errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')
    const isNavigationError = errorMessage.toLowerCase().includes('navigation') || errorMessage.toLowerCase().includes('route')
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg">
        <Card className="w-full max-w-lg border-2 border-neon-magenta shadow-[0_0_30px_rgba(255,0,110,0.3)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-magenta">
              <TriangleAlert className="h-5 w-5" />
              SYSTEM ERROR
            </CardTitle>
            <CardDescription className="text-gray-400 font-mono">
              {isNetworkError 
                ? 'Network connection issue detected. Please check your internet connection.'
                : isNavigationError
                ? 'Navigation error occurred. The page you requested may not exist.'
                : 'An unexpected error occurred. Our team has been notified.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-dark-bg p-4 rounded-sm border border-gray-700">
              <p className="text-xs font-mono text-gray-500 mb-2">Error Details:</p>
              <p className="text-sm text-gray-300 break-words font-mono">{errorMessage}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="cyan"
                onClick={() => {
                  try {
                    setHasError(false)
                    setError(null)
                    window.location.reload()
                  } catch (e) {
                    logError('Error during page reload:', e)
                  }
                }}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    setHasError(false)
                    setError(null)
                    window.location.href = '/'
                  } catch (e) {
                    logError('Error during navigation:', e)
                  }
                }}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  try {
                    window.open('/contact', '_blank')
                  } catch (e) {
                    logError('Error opening contact page:', e)
                  }
                }}
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

// Loading state with error handling
export function LoadingWithError({ 
  loading, 
  error, 
  onRetry, 
  children 
}: { 
  loading: boolean
  error?: ErrorInfo | null
  onRetry?: () => void
  children: React.ReactNode 
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-neon-cyan mx-auto" />
          <p className="text-sm text-gray-500 font-mono">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorHandler 
        error={error} 
        onRetry={onRetry}
        className="p-8"
      />
    )
  }

  return <>{children}</>
}

// Offline indicator component
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="border-neon-orange bg-dark-card shadow-[0_0_20px_rgba(255,102,0,0.3)]">
        <WifiOff className="h-4 w-4 text-neon-orange" />
        <AlertDescription className="text-gray-300 font-mono">
          You&apos;re offline. Some features may be limited.
        </AlertDescription>
      </Alert>
    </div>
  )
}
