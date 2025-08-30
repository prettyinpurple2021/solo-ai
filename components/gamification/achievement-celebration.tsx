"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Achievement, LevelInfo } from "@/lib/gamification-system"
import {
  Trophy,
  Star,
  Crown,
  Sparkles,
  Target,
  Users,
  Flame,
  CheckCircle,
  Gift,
  PartyPopper,
  ArrowRight,
} from "lucide-react"

interface AchievementCelebrationProps {
  achievement: Achievement | null
  onClose: () => void
  onShare?: () => void
}

interface LevelUpCelebrationProps {
  newLevel: LevelInfo
  oldLevel: LevelInfo
  onClose: () => void
}

interface StreakCelebrationProps {
  streakCount: number
  onClose: () => void
}

export function AchievementCelebration({ achievement, onClose, onShare }: AchievementCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (achievement) {
      setShowConfetti(true)
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [achievement, onClose])

  if (!achievement) return null

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-green-400 to-green-500"
      case "rare":
        return "from-blue-400 to-blue-500"
      case "epic":
        return "from-purple-400 to-purple-500"
      case "legendary":
        return "from-yellow-400 to-pink-500"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common":
        return <CheckCircle className="h-8 w-8" />
      case "rare":
        return <Star className="h-8 w-8" />
      case "epic":
        return <Trophy className="h-8 w-8" />
      case "legendary":
        return <Crown className="h-8 w-8" />
      default:
        return <Target className="h-8 w-8" />
    }
  }

  return (
    <Dialog open={!!achievement} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] boss-card border-2 border-purple-200 overflow-hidden">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="confetti-animation">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    backgroundColor: ["#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444"][
                      Math.floor(Math.random() * 5)
                    ],
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <DialogHeader className="text-center space-y-4 relative z-10">
          <div className="mx-auto">
            <div
              className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${getRarityColor(
                achievement.rarity,
              )} flex items-center justify-center text-white animate-bounce`}
            >
              {getRarityIcon(achievement.rarity)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <DialogTitle className="text-2xl font-bold boss-heading">Achievement Unlocked!</DialogTitle>
              <PartyPopper className="h-6 w-6 text-purple-600" />
            </div>
            <Badge className={`girlboss-badge text-lg px-4 py-1 ${achievement.rarity}`}>
              {achievement.rarity.toUpperCase()} {achievement.emoji}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 relative z-10">
          <Card className="boss-card bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-6 text-center space-y-3">
              <h3 className="text-xl font-bold empowering-text">{achievement.title}</h3>
              <p className="text-muted-foreground font-medium">{achievement.description}</p>
              <div className="flex items-center justify-center gap-2 text-lg font-bold soloboss-text-gradient">
                <Sparkles className="h-5 w-5" />+{achievement.points} Boss Points
                <Sparkles className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {/* Celebration Messages */}
          <div className="text-center space-y-2">
            <div className="text-lg font-bold empowering-text">
              {achievement.rarity === "legendary" && "🚨 LEGENDARY BOSS ALERT! 🚨"}
              {achievement.rarity === "epic" && "EPIC ACHIEVEMENT UNLOCKED! 💥"}
              {achievement.rarity === "rare" && "RARE BOSS ENERGY! ✨"}
              {achievement.rarity === "common" && "Boss move completed! 🎉"}
            </div>
            <p className="text-muted-foreground font-medium">
              {achievement.rarity === "legendary" &&
                "You've reached mythical status! This is the kind of boss energy legends are made of! 👑💎"}
              {achievement.rarity === "epic" &&
                "You're absolutely slaying! This achievement puts you in the top tier of boss babes! 🔥👑"}
              {achievement.rarity === "rare" &&
                "Look at you being all legendary! This is rare achievement energy! ✨💪"}
              {achievement.rarity === "common" &&
                "Every boss journey starts with moves like this! Keep crushing it! 💪"}
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Continue Slaying
            </Button>
            {onShare && (
              <Button onClick={onShare} className="punk-button text-white flex-1">
                <Users className="mr-2 h-4 w-4" />
                Share Victory
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function LevelUpCelebration({ newLevel, oldLevel, onClose }: LevelUpCelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 6000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] boss-card border-2 border-yellow-300 overflow-hidden">
        {/* Level Up Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 animate-pulse" />

        <DialogHeader className="text-center space-y-4 relative z-10">
          <div className="mx-auto">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center text-white animate-bounce">
              <Crown className="h-12 w-12" />
            </div>
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-3xl font-bold boss-heading text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-pink-600">
              LEVEL UP! 🎉
            </DialogTitle>
            <DialogDescription className="text-lg font-semibold">
              You&apos;ve ascended to boss level {newLevel.level}!
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 relative z-10">
          <Card className="boss-card bg-gradient-to-r from-yellow-50 to-pink-50">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="text-4xl">{oldLevel.emoji}</div>
                <div className="flex flex-col items-center">
                  <div className="text-sm text-muted-foreground">Level {oldLevel.level}</div>
                  <ArrowRight className="h-6 w-6 text-purple-600 my-1" />
                </div>
                <div className="text-4xl">{newLevel.emoji}</div>
              </div>

              <div>
                <h3 className="text-2xl font-bold empowering-text">{newLevel.title}</h3>
                <p className="text-muted-foreground font-medium">Level {newLevel.level} Boss Status</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold empowering-text">New Boss Perks Unlocked:</h4>
                <div className="space-y-1">
                  {newLevel.perks.map((perk, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Gift className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-2">
            <div className="text-xl font-bold empowering-text">🚀 BOSS LEVEL ACHIEVED! 🚀</div>
            <p className="text-muted-foreground font-medium">
              Your empire is growing stronger! These new perks will help you dominate even harder! 💪👑
            </p>
          </div>

          <Button onClick={onClose} className="w-full punk-button text-white text-lg py-3">
            <Sparkles className="mr-2 h-5 w-5" />
            Continue Building Empire
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function StreakCelebration({ streakCount, onClose }: StreakCelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const getStreakMessage = (count: number) => {
    if (count >= 30) return "UNSTOPPABLE FORCE! 🌟"
    if (count >= 14) return "CONSISTENCY QUEEN! 👑"
    if (count >= 7) return "STREAK MASTER! 🔥"
    if (count >= 3) return "MOMENTUM BUILDING! ⚡"
    return "STREAK STARTED! 💪"
  }

  const getStreakEmoji = (count: number) => {
    if (count >= 30) return "🌟"
    if (count >= 14) return "👑"
    if (count >= 7) return "🔥"
    if (count >= 3) return "⚡"
    return "💪"
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] boss-card border-2 border-orange-300">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center text-white animate-pulse">
              <Flame className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold boss-heading">{getStreakMessage(streakCount)}</DialogTitle>
            <div className="text-4xl font-bold soloboss-text-gradient">
              {streakCount} Day Streak! {getStreakEmoji(streakCount)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <p className="text-muted-foreground font-medium">
            {streakCount >= 30 && "30 days of pure boss energy! You're absolutely legendary! 🌟"}
            {streakCount >= 14 && streakCount < 30 && "Two weeks of consistency! You're building an empire! 👑"}
            {streakCount >= 7 && streakCount < 14 && "One week strong! This is how habits are built! 🔥"}
            {streakCount >= 3 && streakCount < 7 && "Building momentum! Keep this energy going! ⚡"}
            {streakCount < 3 && "Every streak starts with day one! You've got this! 💪"}
          </p>

          <Button onClick={onClose} className="w-full punk-button text-white">
            Keep the Streak Alive! 🔥
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


