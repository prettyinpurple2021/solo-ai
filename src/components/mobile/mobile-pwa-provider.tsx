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
  Settings,
  Bell,
  RefreshCw,
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
        {children}
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
    if (typeof navigator === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  },

  // Check if app is running as PWA
  isPWA: () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  },

  // Get device orientation
  getOrientation: () => {
    if (typeof window === 'undefined') return 'portrait'
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  },

  // Check if device supports touch
  isTouchDevice: () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },

  // Get safe area insets for notched devices
  getSafeAreaInsets: () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return { top: 0, right: 0, bottom: 0, left: 0 }
    }
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
    }
  }
}
