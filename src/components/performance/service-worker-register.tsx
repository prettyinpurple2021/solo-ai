"use client"

import { logError, logWarn, logInfo,} from '@/lib/logger'
import { useEffect, useState} from 'react'
import { Button} from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import { Badge} from '@/components/ui/badge'
import { Download, RefreshCw, CheckCircle} from 'lucide-react'


export function ServiceWorkerRegister() {
  const [isSupported, setIsSupported] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<Event (null)

  useEffect(() => {
    // Check if service worker is supported
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      setIsSupported(true)
      registerServiceWorker()
    }

    // Check online status
    setIsOnline(navigator.onLine)
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))

    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    })

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('online', () => setIsOnline(true))
      window.removeEventListener('offline', () => setIsOnline(false))
    }
  }, [])

  useEffect(() => {
    // Fire-and-forget sitemap ping after deploy in browser context
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/ping-search', { method: 'POST' }).catch(() => {})
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        // Check if service worker is already registered
        const existingRegistration = await navigator.serviceWorker.getRegistration()
        if (existingRegistration) {
          logInfo('Service Worker already registered')
          return
        }
        
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        logInfo('Service Worker registered successfully:', registration)
      }
    } catch (error) {
      logError('Service Worker registration failed:', error)
      // Don't show error to user for service worker issues
      logWarn('Service Worker registration failed - this is not critical for app functionality')
    }
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Cast to the proper type to access prompt method
      const installPrompt = deferredPrompt as any
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      
      if (outcome === 'accepted') {
        logInfo('PWA installed successfully')
        setIsInstalled(true)
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (!isSupported) {
    return null
  }

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && !isInstalled && (
        <Card className="fixed top-4 right-4 w-80 z-50 bg-white/95 backdrop-blur-sm border-2 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              Install SoloSuccess AI
            </CardTitle>
            <CardDescription className="text-xs">
              Get the full app experience with offline access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-gray-600">
              <p>✨ Access your AI squad offline</p>
              <p>🚀 Faster loading times</p>
              <p>📱 App-like experience</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleInstall} className="flex-1">
                Install App
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowInstallPrompt(false)}
              >
                Later
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Indicator */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 border shadow-sm">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs font-medium">
            {isOnline ? 'Online' : 'Offline'}
          </span>
          {isInstalled && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Installed
            </Badge>
          )}
          {!isOnline && (
            <Button size="sm" variant="ghost" onClick={handleRefresh}>
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
