export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  emoji: string
  category: "productivity" | "wellness" | "social" | "learning" | "streak"
  rarity: "common" | "rare" | "epic" | "legendary"
  points: number
  requirements: {
    type: "count" | "streak" | "time" | "percentage" | "combo"
    target: number
    metric: string
  }
  unlockedAt?: string
  progress?: number
}

export interface UserStats {
  level: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  tasksCompleted: number
  goalsAchieved: number
  focusMinutes: number
  wellnessScore: number
  collaborationSessions: number
}

export interface LevelInfo {
  level: number
  title: string
  emoji: string
  pointsRequired: number
  perks: string[]
  color: string
}

export const achievements: Achievement[] = [
  // Productivity Achievements
  {
    id: "first_task",
    title: "First Founder Move",
    description: "Complete your first task like the queen you are!",
    icon: "CheckSquare",
    emoji: "👑",
    category: "productivity",
    rarity: "common",
    points: 10,
    requirements: { type: "count", target: 1, metric: "tasks_completed" },
  },
  {
    id: "task_crusher",
    title: "Task Crusher",
    description: "Complete 50 tasks - you're unstoppable!",
    icon: "Target",
    emoji: "💪",
    category: "productivity",
    rarity: "rare",
    points: 100,
    requirements: { type: "count", target: 50, metric: "tasks_completed" },
  },
  {
    id: "goal_slayer",
    title: "Goal Slayer",
    description: "Complete your first major goal!",
    icon: "Trophy",
    emoji: "🏆",
    category: "productivity",
    rarity: "epic",
    points: 200,
    requirements: { type: "count", target: 1, metric: "goals_completed" },
  },
  {
    id: "empire_builder",
    title: "Empire Builder",
    description: "Complete 10 major goals - you're building an empire!",
    icon: "Crown",
    emoji: "🏰",
    category: "productivity",
    rarity: "legendary",
    points: 500,
    requirements: { type: "count", target: 10, metric: "goals_completed" },
  },

  // Focus & Wellness Achievements
  {
    id: "focus_master",
    title: "Focus Master",
    description: "Complete 25 focus sessions - your concentration is legendary!",
    icon: "Brain",
    emoji: "🧠",
    category: "wellness",
    rarity: "rare",
    points: 150,
    requirements: { type: "count", target: 25, metric: "focus_sessions" },
  },
  {
    id: "zen_queen",
    title: "Zen Queen",
    description: "Maintain wellness score above 80% for a week",
    icon: "Heart",
    emoji: "🧘‍♀️",
    category: "wellness",
    rarity: "epic",
    points: 250,
    requirements: { type: "percentage", target: 80, metric: "weekly_wellness" },
  },

  // Streak Achievements
  {
    id: "consistency_boss",
    title: "Consistency Founder",
    description: "Maintain a 7-day productivity streak!",
    icon: "Flame",
    emoji: "🔥",
    category: "streak",
    rarity: "rare",
    points: 120,
    requirements: { type: "streak", target: 7, metric: "daily_activity" },
  },
  {
    id: "unstoppable_force",
    title: "Unstoppable Force",
    description: "30-day streak - you're absolutely unstoppable!",
    icon: "Zap",
    emoji: "⚡",
    category: "streak",
    rarity: "legendary",
    points: 1000,
    requirements: { type: "streak", target: 30, metric: "daily_activity" },
  },

  // Social & Collaboration
  {
    id: "ai_whisperer",
    title: "AI Whisperer",
    description: "Have 100 conversations with your AI squad",
    icon: "MessageCircle",
    emoji: "🤖",
    category: "social",
    rarity: "rare",
    points: 100,
    requirements: { type: "count", target: 100, metric: "ai_conversations" },
  },
  {
    id: "collaboration_queen",
    title: "Collaboration Queen",
    description: "Complete 5 multi-agent collaboration projects",
    icon: "Users",
    emoji: "👯‍♀️",
    category: "social",
    rarity: "epic",
    points: 300,
    requirements: { type: "count", target: 5, metric: "collaborations_completed" },
  },
]

export const levels: LevelInfo[] = [
  {
    level: 1,
    title: "Founder Rookie",
    emoji: "🌱",
    pointsRequired: 0,
    perks: ["Access to AI Squad", "Basic task management"],
    color: "bg-gradient-to-r from-green-400 to-green-500",
  },
  {
    level: 5,
    title: "Rising Founder",
    emoji: "🚀",
    pointsRequired: 500,
    perks: ["Advanced analytics", "Custom themes", "Priority AI responses"],
    color: "bg-gradient-to-r from-blue-400 to-blue-500",
  },
  {
    level: 10,
    title: "Founder",
    emoji: "💪",
    pointsRequired: 1500,
    perks: ["Collaboration features", "Advanced wellness tracking", "Custom celebrations"],
    color: "bg-gradient-to-r from-purple-400 to-purple-500",
  },
  {
    level: 15,
    title: "Empire Queen",
    emoji: "👑",
    pointsRequired: 3000,
    perks: ["All features unlocked", "VIP AI responses", "Custom agent personalities"],
    color: "bg-gradient-to-r from-pink-400 to-pink-500",
  },
  {
    level: 20,
    title: "Legendary Founder",
    emoji: "✨",
    pointsRequired: 5000,
    perks: ["Exclusive features", "Beta access", "Founder Hall of Fame"],
    color: "bg-gradient-to-r from-yellow-400 to-yellow-500",
  },
]

export class GamificationEngine {
  protected userStats: UserStats
  protected unlockedAchievements: Set<string>

  constructor(userStats: UserStats, unlockedAchievements: string[] = []) {
    this.userStats = userStats
    this.unlockedAchievements = new Set(unlockedAchievements)
  }

  checkAchievements(_activityType: string, _value = 1): Achievement[] {
    const newAchievements: Achievement[] = []

    for (const achievement of achievements) {
      if (this.unlockedAchievements.has(achievement.id)) continue

      const isUnlocked = this.evaluateAchievement(achievement)

      if (isUnlocked) {
        newAchievements.push(achievement)
        this.unlockedAchievements.add(achievement.id)
        this.userStats.totalPoints += achievement.points
      }
    }

    return newAchievements
  }

  private evaluateAchievement(achievement: Achievement): boolean {
    const { requirements } = achievement

    // Map activity types to user stats
    const statMap: Record<string, number> = {
      tasks_completed: this.userStats.tasksCompleted,
      goals_completed: this.userStats.goalsAchieved,
      focus_sessions: Math.floor(this.userStats.focusMinutes / 25), // 25-min sessions
      daily_activity: this.userStats.currentStreak,
      ai_conversations: this.userStats.collaborationSessions,
      collaborations_completed: this.userStats.collaborationSessions,
      weekly_wellness: this.userStats.wellnessScore,
    }

    const currentValue = statMap[requirements.metric] || 0

    switch (requirements.type) {
      case "count":
        return currentValue >= requirements.target
      case "streak":
        return this.userStats.currentStreak >= requirements.target
      case "percentage":
        return currentValue >= requirements.target
      default:
        return false
    }
  }

  updateStats(updates: Partial<UserStats>) {
    this.userStats = { ...this.userStats, ...updates }
  }

  getCurrentLevel(): LevelInfo {
    const currentLevel =
      levels
        .slice()
        .reverse()
        .find((level) => this.userStats.totalPoints >= level.pointsRequired) || levels[0]

    return currentLevel
  }

  getNextLevel(): LevelInfo | null {
    const currentLevel = this.getCurrentLevel()
    const nextLevelIndex = levels.findIndex((l) => l.level === currentLevel.level) + 1

    return nextLevelIndex < levels.length ? levels[nextLevelIndex] : null
  }

  getProgressToNextLevel(): number {
    const currentLevel = this.getCurrentLevel()
    const nextLevel = this.getNextLevel()

    if (!nextLevel) return 100

    const pointsInCurrentLevel = this.userStats.totalPoints - currentLevel.pointsRequired
    const pointsNeededForNext = nextLevel.pointsRequired - currentLevel.pointsRequired

    return Math.min(100, (pointsInCurrentLevel / pointsNeededForNext) * 100)
  }

  getRecentAchievements(): Achievement[] {
    return achievements
      .filter((a) => this.unlockedAchievements.has(a.id))
      .sort((a, b) => (b.unlockedAt || "").localeCompare(a.unlockedAt || ""))
      .slice(0, 5)
  }

  generateCelebration(achievement: Achievement): string {
    const celebrations = {
      common: ["Nice work, founder! 🎉", "You're on fire! 🔥", "Founder move unlocked! 💪"],
      rare: [
        "YASSS QUEEN! That's rare achievement energy! ✨",
        "Look at you being all legendary! 👑",
        "This is what I call BOSS LEVEL! 🚀",
      ],
      epic: [
        "EPIC ACHIEVEMENT UNLOCKED! You're absolutely slaying! 💥",
        "This is the kind of founder energy we LIVE for! 🔥👑",
        "LEGENDARY status incoming! You're unstoppable! ⚡",
      ],
      legendary: [
        "🚨 LEGENDARY BOSS ALERT! 🚨 You've reached mythical status! 🏆✨",
        "EMPIRE LEVEL UNLOCKED! You're not just a founder, you're THE BOSS! 👑💎",
        "HISTORY MADE! This achievement is absolutely LEGENDARY! 🌟💪",
      ],
    }

    const messages = celebrations[achievement.rarity]
    return messages[Math.floor(Math.random() * messages.length)]
  }
}
