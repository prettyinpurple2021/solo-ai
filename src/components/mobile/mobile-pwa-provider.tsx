"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { logError } from '@/lib/logger'
import { motion, AnimatePresence } from 'framer-motion'
import PWAInstallPrompt from './pwa-install-prompt'
import OfflineDataManager from './offline-data-manager'
import { TouchGestureWrapper } from './mobile-gestures'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Download, 
  Zap,
  Settings,
  Bell,
  RefreshCw,
  Menu,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PWAMobileContextType {
  isInstalled: boolean
  isOnline: boolean
  canInstall: boolean
  install: () => Promise<boolean>
  refresh: () => void
  showInstallPrompt: () => void
  hideInstallPrompt: () => void
}

const PWAMobileContext = createContext<PWAMobileContextType | null>(null)

interface MobilePWAProviderProps {
  children: ReactNode
  className?: string
}

export function MobilePWAProvider({ children, className = "" }: MobilePWAProviderProps) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [canInstall, setCanInstall] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showOfflineManager, setShowOfflineManager] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true)
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      setCanInstall(false)
    }

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    checkInstalled()
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const install = async (): Promise<boolean> => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      return outcome === 'accepted'
    } catch (error) {
      logError('Installation failed', error as any)
      return false
    }
  }

  const refresh = () => {
    window.location.reload()
  }

  const handleSwipe = (gesture: any) => {
    switch (gesture.direction) {
      case 'down':
        if (gesture.distance > 100) {
          refresh()
        }
        break
      case 'right':
        if (gesture.distance > 100 && !isOnline) {
          setShowOfflineManager(true)
        }
        break
    }
  }

  const handleDoubleTap = () => {
    if (canInstall && !isInstalled) {
      setShowInstallPrompt(true)
    }
  }

  const handleLongPress = () => {
    // Show mobile settings/options
    setShowOfflineManager(true)
  }

  const contextValue: PWAMobileContextType = {
    isInstalled,
    isOnline,
    canInstall,
    install,
    refresh,
    showInstallPrompt: () => setShowInstallPrompt(true),
    hideInstallPrompt: () => setShowInstallPrompt(false)
  }

  return (
    <PWAMobileContext.Provider value={contextValue}>
      <TouchGestureWrapper
        onSwipe={handleSwipe}
        onDoubleTap={handleDoubleTap}
        onLongPress={handleLongPress}
        enablePullToRefresh={true}
        enableSwipeBack={true}
        enableEdgeSwipe={true}
        className={cn("min-h-screen", className)}
      >
        {/* Mobile Status Bar */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-900">SoloSuccess AI</span>
              {isInstalled && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Installed
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                isOnline ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              )}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              </div>
              
              {/* Install Button */}
              {canInstall && !isInstalled && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowInstallPrompt(true)}
                  className="h-6 px-2 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Install
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content with top padding for status bar */}
        <div className="pt-12">
          {children}
        </div>

        {/* Install Prompt */}
        <AnimatePresence>
          {showInstallPrompt && (
            <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-sm"
              >
                <PWAInstallPrompt
                  onInstall={() => setShowInstallPrompt(false)}
                  onDismiss={() => setShowInstallPrompt(false)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Offline Manager Modal */}
        <AnimatePresence>
          {showOfflineManager && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md"
              >
                <Card className="max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold">Mobile Settings</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOfflineManager(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="p-4">
                    <OfflineDataManager />
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Floating Action Buttons */}
        {!isOnline && (
          <div className="fixed bottom-20 right-4 z-30 space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowOfflineManager(true)}
              className="h-10 w-10 p-0 bg-white/90 backdrop-blur-sm shadow-lg"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Quick Actions Bar */}
        <div className="fixed bottom-4 left-4 right-4 z-30">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-around">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <Home className="w-5 h-5" />
                  <span className="text-xs">Home</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refresh}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-xs">Refresh</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOfflineManager(true)}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <Bell className="w-5 h-5" />
                  <span className="text-xs">Sync</span>
                </Button>
                
                {canInstall && !isInstalled && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInstallPrompt(true)}
                    className="flex flex-col items-center gap-1 h-auto py-2"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-xs">Install</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TouchGestureWrapper>
    </PWAMobileContext.Provider>
  )
}

// Hook to use PWA mobile context
export function usePWAMobile() {
  const context = useContext(PWAMobileContext)
  if (!context) {
    throw new Error('usePWAMobile must be used within a MobilePWAProvider')
  }
  return context
}

// Higher-order component for mobile optimization
export function withMobilePWA<T extends object>(Component: React.ComponentType<T>) {
  return function MobilePWAComponent(props: T) {
    return (
      <MobilePWAProvider>
        <Component {...props} />
      </MobilePWAProvider>
    )
  }
}

// Mobile-specific utilities
export const mobileUtils = {
  // Check if device is mobile
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },

  // Check if app is running as PWA
  isPWA: () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true
  },

  // Get device orientation
  getOrientation: () => {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  },

  // Check if device supports touch
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },

  // Get safe area insets for notched devices
  getSafeAreaInsets: () => {
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
    }
  }
}
