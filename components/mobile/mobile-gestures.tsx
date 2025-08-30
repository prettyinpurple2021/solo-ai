"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Smartphone,
  ShuffleIcon as Swipe,
} from "lucide-react"

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
  children: React.ReactNode
  className?: string
}

export function TouchGestureWrapper({
  onSwipe,
  onDoubleTap,
  onLongPress,
  onPinch: _onPinch,
  children,
  className = "",
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
      <Card className="boss-card border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Smartphone className="h-6 w-6 text-purple-600" />
              <h3 className="text-xl font-bold boss-heading">Mobile Gesture Controls</h3>
              <Sparkles className="h-6 w-6 text-pink-500" />
            </div>
            <p className="text-muted-foreground font-medium">Experience boss-level mobile interactions! 📱✨</p>
          </div>
        </CardContent>
      </Card>

      <TouchGestureWrapper
        onSwipe={handleSwipe}
        onDoubleTap={handleDoubleTap}
        onLongPress={handleLongPress}
        className="min-h-[300px]"
      >
        <Card className="boss-card h-full bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 relative overflow-hidden">
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
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <Swipe className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Swipe any direction</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <TouchpadOff className="h-4 w-4 text-pink-500" />
                  <span className="font-medium">Double tap</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Long press</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">Multi-touch</span>
                </div>
              </div>
            </div>

            {lastGesture && (
              <div className="space-y-2">
                <Badge className="girlboss-badge text-lg px-4 py-2">Last Gesture: {lastGesture}</Badge>
                <p className="text-sm text-muted-foreground font-medium">Total gestures: {gestureCount} 🔥</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>💡 Swipe up/down to navigate</p>
              <p>💡 Double tap for quick actions</p>
              <p>💡 Long press for context menus</p>
            </div>
          </CardContent>
        </Card>
      </TouchGestureWrapper>

      {/* Gesture Guide */}
      <Card className="boss-card">
        <CardContent className="p-6">
          <h4 className="font-bold boss-heading mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Boss Gesture Commands
          </h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <ArrowUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-semibold">Swipe Up</div>
                <div className="text-sm text-muted-foreground">Quick actions menu</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <ArrowDown className="h-5 w-5 text-pink-600" />
              <div>
                <div className="font-semibold">Swipe Down</div>
                <div className="text-sm text-muted-foreground">Refresh content</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <ArrowLeft className="h-5 w-5 text-teal-600" />
              <div>
                <div className="font-semibold">Swipe Left</div>
                <div className="text-sm text-muted-foreground">Previous page/task</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <ArrowRight className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-semibold">Swipe Right</div>
                <div className="text-sm text-muted-foreground">Next page/complete task</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
