"use client"
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { logError } from '@/lib/logger'
import { 
  Download, 
  X, 
  Smartphone, 
  Wifi, 
  Zap,
  Crown,
  Sparkles,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}
interface PWAInstallPromptProps {
  className?: string
  onInstall?: () => void
  onDismiss?: () => void
}
export default function PWAInstallPrompt({ 
  className = "", 
  onInstall, 
  onDismiss 
}: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return
      }
    }
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after a delay for better UX
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }
    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      onInstall?.()
    }
    checkInstalled()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [onInstall])
  const handleInstall = async () => {
    if (!deferredPrompt) return
    setIsInstalling(true)
    try {
      // Show the install prompt
      await deferredPrompt.prompt()
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setShowPrompt(false)
        onInstall?.()
      } else {
        setShowPrompt(false)
        onDismiss?.()
      }
      // Clear the deferredPrompt
      setDeferredPrompt(null)
    } catch (error) {
      logError('Error during installation:', error)
    } finally {
      setIsInstalling(false)
    }
  }
  const handleDismiss = () => {
    setShowPrompt(false)
    onDismiss?.()
  }
  // Don't show if already installed or no prompt available
  if (isInstalled || !deferredPrompt || !showPrompt) {
    return null
  }
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn("fixed bottom-4 left-4 right-4 z-50", className)}
      >
        <Card className="relative overflow-hidden border border-neon-purple bg-dark-card shadow-[0_0_20px_rgba(11,228,236,0.3)]">
          {/* Holographic overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 via-neon-magenta/10 to-neon-cyan/10 opacity-50" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-magenta to-neon-cyan" />
          {/* Sparkle effects */}
          <div className="absolute top-2 right-2">
            <Sparkles className="w-4 h-4 text-neon-purple animate-pulse" />
          </div>
          <CardHeader className="relative pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-dark-bg border border-neon-purple rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(11,228,236,0.2)]">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold font-orbitron uppercase tracking-wider text-white">
                    Install SoloSuccess AI
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-300 font-mono">
                    Get the full mobile experience
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0 hover:bg-dark-hover"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-4">
            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Wifi className="w-4 h-4 text-neon-lime" />
                <span className="text-gray-300 font-mono">Offline access</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-neon-orange" />
                <span className="text-gray-300 font-mono">Faster loading</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-neon-purple" />
                <span className="text-gray-300 font-mono">Full features</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-neon-cyan" />
                <span className="text-gray-300 font-mono">Push notifications</span>
              </div>
            </div>
            {/* Install button */}
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              className="w-full bg-neon-purple hover:bg-neon-purple/80 text-white font-mono font-bold uppercase tracking-wider py-3 rounded-sm shadow-[0_0_20px_rgba(11,228,236,0.3)] transition-all duration-200 transform hover:scale-105"
            >
              {isInstalling ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Installing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Install App
                </div>
              )}
            </Button>
            <div className="text-xs text-gray-300 text-center font-mono">
              💡 Get instant access to your AI business platform
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
// Hook to manage PWA install state
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true)
      }
    }
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }
    checkInstalled()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])
  const install = async () => {
    if (!deferredPrompt) return false
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      return outcome === 'accepted'
    } catch (error) {
      logError('Installation failed:', error)
      return false
    }
  }
  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    install
  }
}
