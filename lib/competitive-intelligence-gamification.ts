import { Achievement, UserStats, GamificationEngine } from './gamification-system'
import { createClient } from '@/lib/db'

export interface CompetitiveIntelligenceStats {
  competitors_monitored: number
  intelligence_gathered: number
  alerts_processed: number
  opportunities_identified: number
  competitive_tasks_completed: number
  market_victories: number
  threat_responses: number
  intelligence_streaks: number
  competitive_advantage_points: number
}

export interface CompetitiveVictory {
  id: string
  title: string
  description: string
  competitor_name: string
  victory_type: 'market_share_gain' | 'pricing_advantage' | 'product_superiority' | 'talent_acquisition' | 'crisis_response'
  impact_level: 'minor' | 'moderate' | 'major' | 'game_changing'
  points_awarded: number
  evidence: string[]
  achieved_at: Date
}

export interface CompetitiveBadge {
  id: string
  title: string
  description: string
  icon: string
  emoji: string
  category: 'intelligence' | 'strategy' | 'victory' | 'positioning'
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  requirements: {
    metric: string
    threshold: number
    timeframe?: string
  }
  perks: string[]
}

// Competitive Intelligence Achievements
export const competitiveAchievements: Achievement[] = [
  // Intelligence Gathering Achievements
  {
    id: "first_competitor",
    title: "Intelligence Operative",
    description: "Add your first competitor to monitoring - the spy game begins!",
    icon: "Eye",
    emoji: "🕵️‍♀️",
    category: "productivity",
    rarity: "common",
    points: 25,
    requirements: { type: "count", target: 1, metric: "competitors_monitored" }
  },
  {
    id: "intelligence_network",
    title: "Intelligence Network",
    description: "Monitor 5 competitors simultaneously - you're building a spy network!",
    icon: "Network",
    emoji: "🕸️",
    category: "productivity",
    rarity: "rare",
    points: 100,
    requirements: { type: "count", target: 5, metric: "competitors_monitored" }
  },
  {
    id: "data_collector",
    title: "Data Collector",
    description: "Gather 100 pieces of competitive intelligence",
    icon: "Database",
    emoji: "📊",
    category: "productivity",
    rarity: "rare",
    points: 150,
    requirements: { type: "count", target: 100, metric: "intelligence_gathered" }
  },
  {
    id: "intelligence_master",
    title: "Intelligence Master",
    description: "Gather 1000 pieces of competitive intelligence - you're a master spy!",
    icon: "Crown",
    emoji: "🎯",
    category: "productivity",
    rarity: "legendary",
    points: 500,
    requirements: { type: "count", target: 1000, metric: "intelligence_gathered" }
  },

  // Alert Processing Achievements
  {
    id: "alert_responder",
    title: "Alert Responder",
    description: "Process your first competitive alert - staying vigilant!",
    icon: "Bell",
    emoji: "🚨",
    category: "productivity",
    rarity: "common",
    points: 20,
    requirements: { type: "count", target: 1, metric: "alerts_processed" }
  },
  {
    id: "threat_detector",
    title: "Threat Detector",
    description: "Process 50 competitive alerts - nothing escapes your notice!",
    icon: "Shield",
    emoji: "🛡️",
    category: "productivity",
    rarity: "rare",
    points: 120,
    requirements: { type: "count", target: 50, metric: "alerts_processed" }
  },
  {
    id: "early_warning_system",
    title: "Early Warning System",
    description: "Process 200 competitive alerts - you're the ultimate early warning system!",
    icon: "Radar",
    emoji: "📡",
    category: "productivity",
    rarity: "epic",
    points: 300,
    requirements: { type: "count", target: 200, metric: "alerts_processed" }
  },

  // Opportunity Identification Achievements
  {
    id: "opportunity_spotter",
    title: "Opportunity Spotter",
    description: "Identify your first competitive opportunity - eagle eyes!",
    icon: "Target",
    emoji: "🎯",
    category: "productivity",
    rarity: "common",
    points: 30,
    requirements: { type: "count", target: 1, metric: "opportunities_identified" }
  },
  {
    id: "opportunity_hunter",
    title: "Opportunity Hunter",
    description: "Identify 25 competitive opportunities - you see what others miss!",
    icon: "Crosshair",
    emoji: "🏹",
    category: "productivity",
    rarity: "rare",
    points: 200,
    requirements: { type: "count", target: 25, metric: "opportunities_identified" }
  },
  {
    id: "market_oracle",
    title: "Market Oracle",
    description: "Identify 100 competitive opportunities - you predict the future!",
    icon: "Crystal",
    emoji: "🔮",
    category: "productivity",
    rarity: "legendary",
    points: 750,
    requirements: { type: "count", target: 100, metric: "opportunities_identified" }
  },

  // Competitive Victory Achievements
  {
    id: "first_victory",
    title: "First Blood",
    description: "Achieve your first competitive victory - taste of success!",
    icon: "Trophy",
    emoji: "🏆",
    category: "productivity",
    rarity: "rare",
    points: 100,
    requirements: { type: "count", target: 1, metric: "market_victories" }
  },
  {
    id: "market_dominator",
    title: "Market Dominator",
    description: "Achieve 10 competitive victories - you're dominating the market!",
    icon: "Crown",
    emoji: "👑",
    category: "productivity",
    rarity: "epic",
    points: 500,
    requirements: { type: "count", target: 10, metric: "market_victories" }
  },
  {
    id: "empire_empress",
    title: "Empire Empress",
    description: "Achieve 50 competitive victories - you rule the market empire!",
    icon: "Castle",
    emoji: "🏰",
    category: "productivity",
    rarity: "legendary",
    points: 2000,
    requirements: { type: "count", target: 50, metric: "market_victories" }
  },

  // Strategic Response Achievements
  {
    id: "quick_responder",
    title: "Quick Responder",
    description: "Complete 10 competitive response tasks - lightning fast!",
    icon: "Zap",
    emoji: "⚡",
    category: "productivity",
    rarity: "rare",
    points: 150,
    requirements: { type: "count", target: 10, metric: "competitive_tasks_completed" }
  },
  {
    id: "strategic_mastermind",
    title: "Strategic Mastermind",
    description: "Complete 50 competitive response tasks - master strategist!",
    icon: "Brain",
    emoji: "🧠",
    category: "productivity",
    rarity: "epic",
    points: 400,
    requirements: { type: "count", target: 50, metric: "competitive_tasks_completed" }
  },

  // Intelligence Streak Achievements
  {
    id: "intelligence_streak_7",
    title: "Intelligence Streak",
    description: "Maintain 7-day intelligence gathering streak - consistent spy!",
    icon: "Flame",
    emoji: "🔥",
    category: "streak",
    rarity: "rare",
    points: 100,
    requirements: { type: "streak", target: 7, metric: "intelligence_streaks" }
  },
  {
    id: "intelligence_streak_30",
    title: "Surveillance Master",
    description: "Maintain 30-day intelligence gathering streak - ultimate surveillance!",
    icon: "Eye",
    emoji: "👁️",
    category: "streak",
    rarity: "legendary",
    points: 1000,
    requirements: { type: "streak", target: 30, metric: "intelligence_streaks" }
  }
]

// Competitive Intelligence Badges
export const competitiveBadges: CompetitiveBadge[] = [
  {
    id: "market_spy",
    title: "Market Spy",
    description: "Elite intelligence gathering specialist",
    icon: "Eye",
    emoji: "🕵️‍♀️",
    category: "intelligence",
    tier: "bronze",
    requirements: { metric: "intelligence_gathered", threshold: 50 },
    perks: ["Enhanced intelligence alerts", "Priority data processing"]
  },
  {
    id: "threat_analyst",
    title: "Threat Analyst",
    description: "Expert at identifying and analyzing competitive threats",
    icon: "Shield",
    emoji: "🛡️",
    category: "intelligence",
    tier: "silver",
    requirements: { metric: "alerts_processed", threshold: 100 },
    perks: ["Advanced threat detection", "Predictive threat analysis"]
  },
  {
    id: "opportunity_seeker",
    title: "Opportunity Seeker",
    description: "Master at spotting market opportunities",
    icon: "Target",
    emoji: "🎯",
    category: "strategy",
    tier: "gold",
    requirements: { metric: "opportunities_identified", threshold: 50 },
    perks: ["Opportunity prediction algorithms", "Market gap analysis"]
  },
  {
    id: "market_conqueror",
    title: "Market Conqueror",
    description: "Legendary competitive victory achiever",
    icon: "Crown",
    emoji: "👑",
    category: "victory",
    tier: "platinum",
    requirements: { metric: "market_victories", threshold: 25 },
    perks: ["Victory celebration animations", "Competitive advantage multiplier"]
  },
  {
    id: "intelligence_overlord",
    title: "Intelligence Overlord",
    description: "Supreme master of competitive intelligence",
    icon: "Castle",
    emoji: "🏰",
    category: "positioning",
    tier: "diamond",
    requirements: { metric: "competitive_advantage_points", threshold: 10000 },
    perks: ["All competitive intelligence features", "Custom intelligence dashboards", "Predictive market modeling"]
  }
]

export class CompetitiveIntelligenceGamification extends GamificationEngine {
  private competitiveStats: CompetitiveIntelligenceStats
  private unlockedBadges: Set<string>
  private victories: CompetitiveVictory[]

  constructor(
    userStats: UserStats, 
    competitiveStats: CompetitiveIntelligenceStats,
    unlockedAchievements: string[] = [],
    unlockedBadges: string[] = [],
    victories: CompetitiveVictory[] = []
  ) {
    super(userStats, unlockedAchievements)
    this.competitiveStats = competitiveStats
    this.unlockedBadges = new Set(unlockedBadges)
    this.victories = victories
  }

  /**
   * Check for new competitive intelligence achievements
   */
  checkCompetitiveAchievements(activityType: string, value = 1): Achievement[] {
    // Update competitive stats based on activity
    this.updateCompetitiveStats(activityType, value)
    
    const newAchievements: Achievement[] = []

    for (const achievement of competitiveAchievements) {
      if (this.unlockedAchievements.has(achievement.id)) continue

      const isUnlocked = this.evaluateCompetitiveAchievement(achievement)

      if (isUnlocked) {
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date().toISOString()
        })
        this.unlockedAchievements.add(achievement.id)
        this.userStats.totalPoints += achievement.points
      }
    }

    return newAchievements
  }

  /**
   * Check for new competitive intelligence badges
   */
  checkCompetitiveBadges(): CompetitiveBadge[] {
    const newBadges: CompetitiveBadge[] = []

    for (const badge of competitiveBadges) {
      if (this.unlockedBadges.has(badge.id)) continue

      const isUnlocked = this.evaluateCompetitiveBadge(badge)

      if (isUnlocked) {
        newBadges.push(badge)
        this.unlockedBadges.add(badge.id)
        // Award bonus points for badges
        const badgePoints = this.getBadgePoints(badge.tier)
        this.userStats.totalPoints += badgePoints
      }
    }

    return newBadges
  }

  /**
   * Record a competitive victory
   */
  recordCompetitiveVictory(victory: Omit<CompetitiveVictory, 'id' | 'achieved_at'>): CompetitiveVictory {
    const newVictory: CompetitiveVictory = {
      ...victory,
      id: this.generateVictoryId(),
      achieved_at: new Date()
    }

    this.victories.push(newVictory)
    this.competitiveStats.market_victories += 1
    this.competitiveStats.competitive_advantage_points += victory.points_awarded
    this.userStats.totalPoints += victory.points_awarded

    return newVictory
  }

  /**
   * Calculate competitive advantage points
   */
  calculateCompetitiveAdvantagePoints(): number {
    return this.competitiveStats.competitive_advantage_points
  }

  /**
   * Get competitive intelligence leaderboard position
   */
  async getLeaderboardPosition(userId: string): Promise<{
    position: number
    total_users: number
    percentile: number
  }> {
    try {
      const client = await createClient()
      
      // Get user's competitive advantage points
      const userPoints = this.competitiveStats.competitive_advantage_points
      
      // Count users with higher points
      const { rows: higherUsers } = await client.query(
        `SELECT COUNT(*) as count 
         FROM users u
         JOIN user_competitive_stats ucs ON u.id = ucs.user_id
         WHERE ucs.competitive_advantage_points > $1`,
        [userPoints]
      )
      
      // Count total users with competitive stats
      const { rows: totalUsers } = await client.query(
        `SELECT COUNT(*) as count 
         FROM users u
         JOIN user_competitive_stats ucs ON u.id = ucs.user_id`
      )
      
      const position = (higherUsers[0]?.count || 0) + 1
      const total = totalUsers[0]?.count || 1
      const percentile = Math.round(((total - position + 1) / total) * 100)
      
      return {
        position,
        total_users: total,
        percentile
      }
    } catch (error) {
      console.error('Error getting leaderboard position:', error)
      return { position: 1, total_users: 1, percentile: 100 }
    }
  }

  /**
   * Generate competitive intelligence challenges
   */
  generateWeeklyChallenge(): {
    id: string
    title: string
    description: string
    objectives: { task: string; points: number; completed: boolean }[]
    total_points: number
    expires_at: Date
  } {
    const challenges = [
      {
        title: "Intelligence Gathering Sprint",
        description: "Gather competitive intelligence across multiple channels",
        objectives: [
          { task: "Monitor 3 new competitors", points: 50, completed: false },
          { task: "Process 10 competitive alerts", points: 30, completed: false },
          { task: "Identify 2 market opportunities", points: 40, completed: false }
        ]
      },
      {
        title: "Strategic Response Challenge",
        description: "Respond quickly and effectively to competitive threats",
        objectives: [
          { task: "Complete 5 competitive response tasks", points: 60, completed: false },
          { task: "Achieve 1 competitive victory", points: 100, completed: false },
          { task: "Maintain 7-day intelligence streak", points: 40, completed: false }
        ]
      },
      {
        title: "Market Domination Week",
        description: "Establish market dominance through superior intelligence",
        objectives: [
          { task: "Gather 50 pieces of intelligence", points: 40, completed: false },
          { task: "Process 20 alerts within 24 hours", points: 60, completed: false },
          { task: "Identify 5 competitive opportunities", points: 50, completed: false },
          { task: "Complete 3 strategic framework analyses", points: 50, completed: false }
        ]
      }
    ]
    
    const challenge = challenges[Math.floor(Math.random() * challenges.length)]
    const totalPoints = challenge.objectives.reduce((sum, obj) => sum + obj.points, 0)
    
    return {
      id: `challenge_${Date.now()}`,
      title: challenge.title,
      description: challenge.description,
      objectives: challenge.objectives,
      total_points: totalPoints,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
  }

  /**
   * Get competitive intelligence insights for gamification
   */
  getCompetitiveInsights(): {
    performance_summary: string
    next_milestone: string
    recommended_actions: string[]
    competitive_position: string
  } {
    const insights = {
      performance_summary: this.generatePerformanceSummary(),
      next_milestone: this.getNextMilestone(),
      recommended_actions: this.getRecommendedActions(),
      competitive_position: this.getCompetitivePosition()
    }
    
    return insights
  }

  // Private helper methods
  private updateCompetitiveStats(activityType: string, value: number): void {
    switch (activityType) {
      case 'competitor_added':
        this.competitiveStats.competitors_monitored += value
        break
      case 'intelligence_gathered':
        this.competitiveStats.intelligence_gathered += value
        break
      case 'alert_processed':
        this.competitiveStats.alerts_processed += value
        break
      case 'opportunity_identified':
        this.competitiveStats.opportunities_identified += value
        break
      case 'competitive_task_completed':
        this.competitiveStats.competitive_tasks_completed += value
        break
      case 'threat_response':
        this.competitiveStats.threat_responses += value
        break
      case 'intelligence_streak':
        this.competitiveStats.intelligence_streaks = Math.max(this.competitiveStats.intelligence_streaks, value)
        break
    }
  }

  private evaluateCompetitiveAchievement(achievement: Achievement): boolean {
    const { requirements } = achievement
    
    const statMap: Record<string, number> = {
      competitors_monitored: this.competitiveStats.competitors_monitored,
      intelligence_gathered: this.competitiveStats.intelligence_gathered,
      alerts_processed: this.competitiveStats.alerts_processed,
      opportunities_identified: this.competitiveStats.opportunities_identified,
      competitive_tasks_completed: this.competitiveStats.competitive_tasks_completed,
      market_victories: this.competitiveStats.market_victories,
      intelligence_streaks: this.competitiveStats.intelligence_streaks
    }
    
    const currentValue = statMap[requirements.metric] || 0
    
    switch (requirements.type) {
      case "count":
        return currentValue >= requirements.target
      case "streak":
        return this.competitiveStats.intelligence_streaks >= requirements.target
      default:
        return false
    }
  }

  private evaluateCompetitiveBadge(badge: CompetitiveBadge): boolean {
    const statMap: Record<string, number> = {
      intelligence_gathered: this.competitiveStats.intelligence_gathered,
      alerts_processed: this.competitiveStats.alerts_processed,
      opportunities_identified: this.competitiveStats.opportunities_identified,
      market_victories: this.competitiveStats.market_victories,
      competitive_advantage_points: this.competitiveStats.competitive_advantage_points
    }
    
    const currentValue = statMap[badge.requirements.metric] || 0
    return currentValue >= badge.requirements.threshold
  }

  private getBadgePoints(tier: string): number {
    const tierPoints = {
      bronze: 50,
      silver: 100,
      gold: 200,
      platinum: 500,
      diamond: 1000
    }
    return tierPoints[tier as keyof typeof tierPoints] || 50
  }

  private generateVictoryId(): string {
    return `victory_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  private generatePerformanceSummary(): string {
    const totalActivities = this.competitiveStats.intelligence_gathered + 
                           this.competitiveStats.alerts_processed + 
                           this.competitiveStats.opportunities_identified
    
    if (totalActivities === 0) {
      return "Ready to start your competitive intelligence journey! Add your first competitor to begin."
    }
    
    return `You've gathered ${this.competitiveStats.intelligence_gathered} intelligence pieces, processed ${this.competitiveStats.alerts_processed} alerts, and identified ${this.competitiveStats.opportunities_identified} opportunities. ${this.competitiveStats.market_victories} competitive victories achieved!`
  }

  private getNextMilestone(): string {
    // Find the next unachieved competitive achievement
    for (const achievement of competitiveAchievements) {
      if (!this.unlockedAchievements.has(achievement.id)) {
        return `${achievement.title}: ${achievement.description}`
      }
    }
    return "All competitive intelligence milestones achieved! You're a master strategist!"
  }

  private getRecommendedActions(): string[] {
    const actions = []
    
    if (this.competitiveStats.competitors_monitored < 3) {
      actions.push("Add more competitors to your monitoring list")
    }
    
    if (this.competitiveStats.alerts_processed < 10) {
      actions.push("Process pending competitive alerts")
    }
    
    if (this.competitiveStats.opportunities_identified < 5) {
      actions.push("Analyze competitor weaknesses for opportunities")
    }
    
    if (this.competitiveStats.competitive_tasks_completed < 5) {
      actions.push("Complete competitive response tasks")
    }
    
    if (actions.length === 0) {
      actions.push("Continue monitoring competitors for new intelligence")
      actions.push("Analyze market trends for strategic opportunities")
    }
    
    return actions.slice(0, 3)
  }

  private getCompetitivePosition(): string {
    const points = this.competitiveStats.competitive_advantage_points
    
    if (points < 100) return "Intelligence Rookie - Building your spy network"
    if (points < 500) return "Market Analyst - Gathering valuable insights"
    if (points < 1000) return "Strategic Advisor - Making informed decisions"
    if (points < 2500) return "Competitive Strategist - Dominating the intelligence game"
    if (points < 5000) return "Market Dominator - Ruling the competitive landscape"
    return "Intelligence Overlord - Master of all competitive domains"
  }
}