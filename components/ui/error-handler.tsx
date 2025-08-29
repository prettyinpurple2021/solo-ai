"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  X, 
  Info,
  CheckCircle,
  Clock,
  Zap,
  Lightbulb
} from "lucide-react"

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
      console.error('Retry failed:', retryError)
    } finally {
      setIsRetrying(false)
    }
  }

  const getErrorIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "info": return <Info className="h-5 w-5 text-blue-500" />
      case "success": return <CheckCircle className="h-5 w-5 text-green-500" />
      default: return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
  }

  const getErrorColor = (type: string) => {
    switch (type) {
      case "error": return "border-red-200 bg-red-50"
      case "warning": return "border-yellow-200 bg-yellow-50"
      case "info": return "border-blue-200 bg-blue-50"
      case "success": return "border-green-200 bg-green-50"
      default: return "border-red-200 bg-red-50"
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
        <Alert className="border-yellow-200 bg-yellow-50">
          <WifiOff className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You're currently offline. Some features may be limited. 
            <Button 
              variant="link" 
              className="p-0 h-auto text-yellow-800 underline ml-1"
              onClick={() => window.location.reload()}
            >
              Refresh when online
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Card className={`border-2 ${getErrorColor(error.type)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getErrorIcon(error.type)}
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    {error.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {error.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
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
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-700 mb-4">
              {getErrorMessage(error)}
            </p>

            {error.details && (
              <details className="mb-4">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-gray-600">
                  Technical Details
                </summary>
                <pre className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
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
                    variant="outline"
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
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
      console.error('Global error caught:', event.error)
      setError(event.error)
      setHasError(true)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      setError(new Error(event.reason?.message || 'Promise rejected'))
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
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-700">
              We encountered an unexpected error. Please refresh the page or contact support if the problem persists.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('/contact', '_blank')}
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
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
          <p className="text-sm text-muted-foreground">Loading...</p>
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
      <Alert className="border-yellow-200 bg-yellow-50 shadow-lg">
        <WifiOff className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          You're offline. Some features may be limited.
        </AlertDescription>
      </Alert>
    </div>
  )
}
