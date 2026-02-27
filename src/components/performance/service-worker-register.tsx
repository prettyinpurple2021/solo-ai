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
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)

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
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 bg-dark-card/90 backdrop-blur-sm rounded-full px-3 py-2 border border-gray-800 shadow-[0_0_10px_rgba(11,228,236,0.2)]">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-neon-lime' : 'bg-red-500'}`} />
          <span className="text-xs font-medium font-mono text-gray-300">
            {isOnline ? 'Online' : 'Offline'}
          </span>
          {isInstalled && (
            <Badge variant="secondary" className="text-[10px] bg-dark-bg border-neon-cyan/30 text-neon-cyan px-1.5 font-mono">
              <CheckCircle className="w-3 h-3 mr-1" />
              Installed
            </Badge>
          )}
          {!isOnline && (
            <Button size="sm" variant="ghost" onClick={handleRefresh} className="h-6 w-6 p-0 hover:bg-dark-bg">
              <RefreshCw className="w-3 h-3 text-neon-orange" />
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
