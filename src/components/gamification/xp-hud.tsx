"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star } from "lucide-react"

interface UserStats {
  level: number
  xp: number
  nextLevelProgress: number
}

export function XpHud() {
  const [stats, setStats] = useState<UserStats | null>(null)

  const fetchStats = async () => {
    // In a real app, this might come from a global context or user session
    // For now, we'll fetch from a dedicated endpoint or profile endpoint
    // We can reuse the learning-analytics endpoint which returns level info
    try {
        const res = await fetch('/api/academy/analytics') // We haven't created this specific route yet, but we'll mock or create it
        // Actually, let's create a quick route for this or assume we use the session context if we had it.
        // Let's assume we can fetch it from user profile.
    } catch (e) {
        // Fallback for demo
        setStats({ level: 1, xp: 0, nextLevelProgress: 0 })
    }
  }
  
  // For this MVF (Minimum Viable Feature), I'll make it self-contained to fetch specific stats if available, or just render static for now until connected.
  // Ideally this connects to `useUser()` or similar.
  
  return (
    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white border border-white/20 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="bg-yellow-500 p-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wider opacity-80">Level</span>
            <span className="text-lg font-bold leading-none">{stats?.level || 1}</span>
        </div>
      </div>
      
      <div className="w-24">
        <div className="flex justify-between text-[10px] mb-1 opacity-80">
            <span>{stats?.xp || 0} XP</span>
            <span>Next Lvl</span>
        </div>
        <Progress value={stats?.nextLevelProgress || 10} className="h-1.5 bg-white/20" indicatorClassName="bg-yellow-400" />
      </div>
    </div>
  )
}
