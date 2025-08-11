"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, Clock, Target, TrendingUp, Coffee, Brain, Zap, Crown, Flame, Star } from "lucide-react"

export default function FocusMode() {
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [sessionType, setSessionType] = useState<keyof typeof sessionTypes>("work") // work, short-break, long-break
  const [_sessionDuration, _setSessionDuration] = useState(25)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [weeklyGoal] = useState(20)

  const sessionTypes = {
    work: { duration: 25, label: "Boss Work Session", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    "short-break": { duration: 5, label: "Quick Recharge", color: "bg-gradient-to-r from-teal-500 to-green-500" },
    "long-break": { duration: 15, label: "Power Break", color: "bg-gradient-to-r from-blue-500 to-purple-500" },
  } as const

  const focusTips = [
    "Remove all distractions from your boss workspace 💪",
    "Set a clear intention for this session ✨",
    "Keep a glass of water nearby - hydration is key! 💧",
    "Take deep breaths before starting 🧘‍♀️",
    "Focus on one task at a time like a boss 🎯",
    "You've got this, queen! 👑",
  ]

  const presets = [
    { name: "Boss Classic", work: 25, shortBreak: 5, longBreak: 15, emoji: "👑" },
    { name: "Power Focus", work: 45, shortBreak: 10, longBreak: 20, emoji: "🔥" },
    { name: "Quick Wins", work: 15, shortBreak: 3, longBreak: 10, emoji: "⚡" },
    { name: "Deep Work", work: 90, shortBreak: 15, longBreak: 30, emoji: "🧠" },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      if (sessionType === "work") {
        setCompletedSessions((prev) => prev + 1)
      }
      // Auto-switch to break or work
      const nextType = sessionType === "work" ? (completedSessions % 4 === 3 ? "long-break" : "short-break") : "work"
      setSessionType(nextType as keyof typeof sessionTypes)
      setTimeLeft(sessionTypes[nextType].duration * 60)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isActive, timeLeft, sessionType, completedSessions])

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }, [])

  const startTimer = useCallback(() => setIsActive(true), [])
  const pauseTimer = useCallback(() => setIsActive(false), [])
  const resetTimer = useCallback(() => {
    setIsActive(false)
    setTimeLeft(sessionTypes[sessionType].duration * 60)
  }, [sessionType])

  const progress =
    ((sessionTypes[sessionType].duration * 60 - timeLeft) / (sessionTypes[sessionType].duration * 60)) * 100

  // Memoized motivational footer to prevent unnecessary re-renders
  const MotivationalFooter = memo(() => (
    <Card className="boss-card soloboss-gradient text-white static-content">
      <CardContent className="p-6 text-center">
        <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Target className="h-6 w-6" />
          Focus like a boss. Slay like a queen.
          <Crown className="h-6 w-6" />
        </h3>
        <p className="text-lg opacity-90 opacity-optimized">
          Every focused minute is a step closer to your empire. You've got this! 💪✨
        </p>
      </CardContent>
    </Card>
  ))

  const handlePresetClick = useCallback((preset: typeof presets[0]) => {
    setSessionType("work")
    setTimeLeft(preset.work * 60)
    setIsActive(false)
  }, [])

  const handleSessionTypeChange = useCallback((value: string) => {
    setSessionType(value as keyof typeof sessionTypes)
  }, [])

  MotivationalFooter.displayName = 'MotivationalFooter'

  return (
    <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-gradient-to-r from-purple-50 to-teal-50">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">Focus Mode</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-4 bg-gradient-to-br from-purple-50/30 via-white to-teal-50/30">
          {/* Header Section */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight boss-heading flex items-center justify-center gap-3">
              <Target className="h-10 w-10 text-purple-600" />
              Boss Focus Mode
              <span className="text-2xl">🎯</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Eliminate distractions and maximize your productivity like the boss you are!
              <br />
              <span className="empowering-text font-semibold">Time to get in the zone and slay those goals! 💪</span>
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="boss-card glitter-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold empowering-text">Today's Sessions</CardTitle>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-purple-600" />
                  <Crown className="h-3 w-3 text-pink-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold soloboss-text-gradient">{completedSessions}</div>
                <p className="text-sm text-muted-foreground font-medium">Boss sessions slayed 🔥</p>
              </CardContent>
            </Card>

            <Card className="boss-card glitter-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold empowering-text">Weekly Goal</CardTitle>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  <Star className="h-3 w-3 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold soloboss-text-gradient">
                  {completedSessions}/{weeklyGoal}
                </div>
                <div className="mt-2 rebel-progress">
                  <div
                    className="h-full transition-all duration-500 ease-out opacity-optimized"
                    style={{ 
                      width: `${(completedSessions / weeklyGoal) * 100}%`,
                      transform: 'translateZ(0)' // GPU acceleration
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground font-medium mt-1">On track to dominate! 👑</p>
              </CardContent>
            </Card>

            <Card className="boss-card glitter-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold empowering-text">Focus Time</CardTitle>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-pink-600" />
                  <Flame className="h-3 w-3 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold soloboss-text-gradient">
                  {Math.floor((completedSessions * 25) / 60)}h {(completedSessions * 25) % 60}m
                </div>
                <p className="text-sm text-muted-foreground font-medium">Deep work domination ⚡</p>
              </CardContent>
            </Card>

            <Card className="boss-card glitter-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold empowering-text">Boss Streak</CardTitle>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <Star className="h-3 w-3 text-teal-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold soloboss-text-gradient">5</div>
                <p className="text-sm text-muted-foreground font-medium">days of slaying 🚀</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Timer Section */}
            <Card className="md:col-span-2 boss-card focus-punk">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-3 boss-heading text-2xl">
                  <div className={`w-4 h-4 rounded-full ${sessionTypes[sessionType].color} glitter-effect`}></div>
                  {sessionTypes[sessionType].label}
                  <div className="skull-decoration text-lg"></div>
                </CardTitle>
                <CardDescription className="font-medium text-base">
                  {sessionType === "work"
                    ? "Time to boss up and get things done! 💪"
                    : "Take a well-deserved break, queen! ✨"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Timer Display */}
                <div className="text-center">
                  <div className="text-8xl font-bold font-mono mb-6 soloboss-text-gradient glitter-effect">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="w-full max-w-md mx-auto rebel-progress">
                    <div 
                      className="h-full transition-all duration-1000 ease-out opacity-optimized" 
                      style={{ 
                        width: `${progress}%`,
                        transform: 'translateZ(0)' // GPU acceleration
                      }} 
                    />
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex justify-center gap-4">
                  {!isActive ? (
                    <Button
                      onClick={startTimer}
                      size="lg"
                      className="punk-button text-white font-bold px-8 py-4 text-lg"
                    >
                      <Play className="mr-2 h-6 w-6" />
                      Start Slaying
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseTimer}
                      size="lg"
                      variant="outline"
                      className="border-2 border-purple-400 hover:bg-purple-50 font-bold px-8 py-4 text-lg bg-transparent"
                    >
                      <Pause className="mr-2 h-6 w-6" />
                      Pause
                    </Button>
                  )}
                  <Button
                    onClick={resetTimer}
                    size="lg"
                    variant="outline"
                    className="border-2 border-teal-400 hover:bg-teal-50 font-bold px-8 py-4 text-lg bg-transparent"
                  >
                    <RotateCcw className="mr-2 h-6 w-6" />
                    Reset
                  </Button>
                </div>

                {/* Session Type Selector */}
                <div className="flex justify-center">
                                    <Select value={sessionType} onValueChange={handleSessionTypeChange}>
                    <SelectTrigger className="w-full border-purple-200 dark:border-purple-800">
                      <SelectValue placeholder="Select session type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sessionTypes).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Focus Tips & Presets */}
            <div className="space-y-6">
              <Card className="boss-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 boss-heading">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Boss Focus Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {focusTips.slice(0, 4).map((tip, index) => (
                      <div key={index} className="text-sm p-3 boss-card rounded-lg font-medium">
                        {tip}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="boss-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 boss-heading">
                    <Coffee className="h-5 w-5 text-teal-600" />
                    Quick Presets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {presets.map((preset, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left bg-transparent border-2 border-purple-200 hover:border-purple-400 bounce-on-hover"
                        onClick={() => handlePresetClick(preset)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{preset.emoji}</span>
                          <div>
                            <div className="font-bold empowering-text">{preset.name}</div>
                            <div className="text-xs text-muted-foreground font-medium">
                              {preset.work}m work • {preset.shortBreak}m break
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Motivational Footer */}
          <MotivationalFooter />
        </div>
      </SidebarInset>
  )
}
