"use client"

import type React from "react"

import { useState, useRef, useCallback} from "react"
import { Card, CardContent} from "@/components/ui/card"
import { Badge} from "@/components/ui/badge"
import {
  Smartphone, ShuffleIcon as Swipe, Sparkles, TouchpadOff, Heart, Star, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight} from "lucide-react"

interface SwipeGesture {
  direction: "up" | "down" | "left" | "right"
  distance: number
  velocity: number
  duration: number
}

interface TouchGestureProps {
  onSwipe?: (_gesture: SwipeGesture) => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  onPinch?: (_scale: number) => void
  onRefresh?: () => void // Pull to refresh
  onBack?: () => void // Swipe back gesture
  onMenu?: () => void // Swipe from edge for menu
  children: React.ReactNode
  className?: string
  enablePullToRefresh?: boolean
  enableSwipeBack?: boolean
  enableEdgeSwipe?: boolean
}

export function TouchGestureWrapper({
  onSwipe,
  onDoubleTap,
  onLongPress,
  onPinch: _onPinch,
,
,
,
  children,
  className = "",
  enablePullToRefresh = true,
  enableSwipeBack = true,
  enableEdgeSwipe = true,
}: TouchGestureProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null)
  const [lastTap, setLastTap] = useState<number>(0)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isLongPress, setIsLongPress] = useState(false)
  const [gestureActive, setGestureActive] = useState(false)
  const [currentGesture, setCurrentGesture] = useState<string>("")

  const elementRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0]
      const now = Date.now()

      setTouchStart({ x: touch.clientX, y: touch.clientY, time: now })
      setTouchEnd(null)
      setIsLongPress(false)
      setGestureActive(true)

      // Long press detection
      const timer = setTimeout(() => {
        setIsLongPress(true)
        setCurrentGesture("Long Press")
        onLongPress?.()

        // Add haptic feedback if available
        if ("vibrate" in navigator) {
          navigator.vibrate(50)
        }
      }, 500)

      setLongPressTimer(timer)

      // Double tap detection
      if (now - lastTap < 300) {
        setCurrentGesture("Double Tap")
        onDoubleTap?.()

        if ("vibrate" in navigator) {
          navigator.vibrate([25, 25, 25])
        }
      }
      setLastTap(now)
    },
    [onDoubleTap, onLongPress, lastTap],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return

      const touch = e.touches[0]
      setTouchEnd({ x: touch.clientX, y: touch.clientY, time: Date.now() })

      // Clear long press if user moves
      if (longPressTimer) {
        clearTimeout(longPressTimer)
        setLongPressTimer(null)
      }

      // Show live gesture feedback
      const deltaX = touch.clientX - touchStart.x
      const deltaY = touch.clientY - touchStart.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      if (distance > 20) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          setCurrentGesture(deltaX > 0 ? "Swipe Right →" : "Swipe Left ←")
        } else {
          setCurrentGesture(deltaY > 0 ? "Swipe Down ↓" : "Swipe Up ↑")
        }
      }
    },
    [touchStart, longPressTimer],
  )

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd || isLongPress) {
      setGestureActive(false)
      setCurrentGesture("")
      return
    }

    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }

    const deltaX = touchEnd.x - touchStart.x
    const deltaY = touchEnd.y - touchStart.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const duration = touchEnd.time - touchStart.time
    const velocity = distance / duration

    // Minimum swipe distance
    if (distance > 50) {
      let direction: "up" | "down" | "left" | "right"

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? "right" : "left"
      } else {
        direction = deltaY > 0 ? "down" : "up"
      }

      const gesture: SwipeGesture = {
        direction,
        distance,
        velocity,
        duration,
      }

      onSwipe?.(gesture)

      // Haptic feedback for swipes
      if ("vibrate" in navigator) {
        navigator.vibrate(30)
      }
    }

    setTimeout(() => {
      setGestureActive(false)
      setCurrentGesture("")
    }, 1000)
  }, [touchStart, touchEnd, isLongPress, longPressTimer, onSwipe])

  return (
    <div
      ref={elementRef}
      className={`relative touch-manipulation ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}

      {/* Gesture Feedback Overlay */}
      {gestureActive && currentGesture && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="bg-black/80 text-white px-4 py-2 rounded-full font-bold text-sm animate-pulse">
            {currentGesture}
          </div>
        </div>
      )}
    </div>
  )
}

export function MobileGestureDemo() {
  const [lastGesture, setLastGesture] = useState<string>("")
  const [gestureCount, setGestureCount] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  const handleSwipe = (gesture: SwipeGesture) => {
    const gestureText = `Swiped ${gesture.direction} (${Math.round(gesture.distance)}px, ${Math.round(gesture.velocity * 1000)}px/s)`
    setLastGesture(gestureText)
    setGestureCount((prev) => prev + 1)

    if (gestureCount > 0 && gestureCount % 5 === 0) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2000)
    }
  }

  const handleDoubleTap = () => {
    setLastGesture("Double Tapped! 💥")
    setGestureCount((prev) => prev + 1)
  }

  const handleLongPress = () => {
    setLastGesture("Long Pressed! 🔥")
    setGestureCount((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <Card className="boss-card border border-neon-purple bg-dark-card">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Smartphone className="h-6 w-6 text-neon-purple" />
              <h3 className="text-xl font-bold font-orbitron uppercase tracking-wider text-white">Mobile Gesture Controls</h3>
              <Sparkles className="h-6 w-6 text-neon-purple" />
            </div>
            <p className="text-gray-300 font-mono">Experience boss-level mobile interactions! 📱✨</p>
          </div>
        </CardContent>
      </Card>

      <TouchGestureWrapper
        onSwipe={handleSwipe}
        onDoubleTap={handleDoubleTap}
        onLongPress={handleLongPress}
        className="min-h-[300px]"
      >
        <Card className="boss-card h-full bg-dark-bg border border-dashed border-neon-purple relative overflow-hidden">
          <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center space-y-6">
            {showCelebration && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse">
                <div className="text-4xl font-bold text-white">🎉 GESTURE MASTER! 🎉</div>
              </div>
            )}

            <div className="space-y-4">
              <div className="text-6xl animate-bounce">👆</div>
              <h4 className="text-2xl font-bold boss-heading">Try These Gestures!</h4>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 p-2 bg-dark-card border border-gray-700 rounded-sm">
                  <Swipe className="h-4 w-4 text-neon-purple" />
                  <span className="font-medium font-mono text-gray-300">Swipe any direction</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-dark-card border border-gray-700 rounded-sm">
                  <TouchpadOff className="h-4 w-4 text-neon-purple" />
                  <span className="font-medium font-mono text-gray-300">Double tap</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-dark-card border border-gray-700 rounded-sm">
                  <Heart className="h-4 w-4 text-neon-magenta" />
                  <span className="font-medium font-mono text-gray-300">Long press</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-dark-card border border-gray-700 rounded-sm">
                  <Star className="h-4 w-4 text-neon-orange" />
                  <span className="font-medium font-mono text-gray-300">Multi-touch</span>
                </div>
              </div>
            </div>

            {lastGesture && (
              <div className="space-y-2">
                <Badge className="girlboss-badge text-lg px-4 py-2 font-mono">Last Gesture: {lastGesture}</Badge>
                <p className="text-sm text-gray-300 font-mono">Total gestures: {gestureCount} 🔥</p>
              </div>
            )}

            <div className="text-xs text-gray-300 font-mono space-y-1">
              <p>💡 Swipe up/down to navigate</p>
              <p>💡 Double tap for quick actions</p>
              <p>💡 Long press for context menus</p>
            </div>
          </CardContent>
        </Card>
      </TouchGestureWrapper>

      {/* Gesture Guide */}
      <Card className="boss-card bg-dark-card border border-gray-700">
        <CardContent className="p-6">
          <h4 className="font-bold font-orbitron uppercase tracking-wider text-white mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-neon-purple" />
            Boss Gesture Commands
          </h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 bg-dark-bg border border-neon-purple rounded-sm">
              <ArrowUp className="h-5 w-5 text-neon-purple" />
              <div>
                <div className="font-semibold font-mono text-white">Swipe Up</div>
                <div className="text-sm text-gray-300 font-mono">Quick actions menu</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-dark-bg border border-neon-cyan rounded-sm">
              <ArrowDown className="h-5 w-5 text-neon-cyan" />
              <div>
                <div className="font-semibold font-mono text-white">Swipe Down</div>
                <div className="text-sm text-gray-300 font-mono">Refresh content</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-dark-bg border border-neon-orange rounded-sm">
              <ArrowLeft className="h-5 w-5 text-neon-orange" />
              <div>
                <div className="font-semibold font-mono text-white">Swipe Left</div>
                <div className="text-sm text-gray-300 font-mono">Previous page/task</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-dark-bg border border-neon-magenta rounded-sm">
              <ArrowRight className="h-5 w-5 text-neon-magenta" />
              <div>
                <div className="font-semibold font-mono text-white">Swipe Right</div>
                <div className="text-sm text-gray-300 font-mono">Next page/complete task</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
