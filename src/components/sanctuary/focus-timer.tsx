"use client"

import { useState, useEffect, useCallback } from "react"
import { logError } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Play, Pause, Square, Trophy } from "lucide-react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

export function FocusTimer() {
  const [isActive, setIsActive] = useState(false)
  const [duration, setDuration] = useState(25) // Default 25 mins
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [sessionCount, setSessionCount] = useState(0)

  const handleComplete = useCallback(async () => {
      try {
          const res = await fetch('/api/wellness/focus', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  durationMinutes: duration,
                  taskDescription: "Focus Session"
              })
          })

          if (res.ok) {
              const data = await res.json()
              toast.success(`Session Complete! You earned ${data.xpEarned} XP!`, {
                  icon: <Trophy className="w-4 h-4 text-yellow-500" />
              })
              setSessionCount(prev => prev + 1)
          } else {
              const errData = await res.json().catch(() => ({}));
              toast.error(errData.error || "Failed to save session");
          }
      } catch (e) {
          logError('Failed to save focus session', { error: e })
          toast.error("Error saving focus session");
      }
  }, [duration])



  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      handleComplete()
    }

    return () => {
        if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, handleComplete])

  const toggleTimer = () => setIsActive(!isActive)

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(duration * 60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100

  return (
    <div className="p-6 border rounded-xl bg-card flex flex-col items-center justify-center space-y-6">
        <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">Deep Focus</h3>
            <p className="text-sm text-muted-foreground">Work without distraction.</p>
        </div>

        <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Simple Circular Progress via SVG or just clean text for now */}
            <div className={`text-5xl font-mono font-bold tracking-wider ${isActive ? 'text-indigo-600 animate-pulse' : ''}`}>
                {formatTime(timeLeft)}
            </div>
        </div>

        <Progress value={progress} className="w-full h-2" />

        <div className="flex gap-4">
            <Button
                size="lg"
                variant={isActive ? "outline" : "default"}
                onClick={toggleTimer}
                className="w-32"
            >
                {isActive ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Start</>}
            </Button>
            
            <Button size="icon" variant="ghost" onClick={resetTimer}>
                <Square className="w-4 h-4 fill-current opacity-50" />
            </Button>
        </div>
        
        {sessionCount > 0 && (
            <p className="text-xs text-muted-foreground">
                Sessions completed today: {sessionCount}
            </p>
        )}
    </div>
  )
}
