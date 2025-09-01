import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { CompetitiveIntelligenceGamification, CompetitiveVictory } from '@/lib/competitive-intelligence-gamification'
import { createClient } from '@/lib/db'
import { z } from 'zod'

// GET /api/competitive-intelligence/gamification - Get competitive intelligence gamification data
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await createClient()
    
    // Get user stats
    const { rows: userRows } = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [user.id]
    )
    
    if (userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const userData = userRows[0]
    
    // Get or create competitive intelligence stats
    let { rows: competitiveStatsRows } = await client.query(
      'SELECT * FROM user_competitive_stats WHERE user_id = $1',
      [user.id]
    )
    
    if (competitiveStatsRows.length === 0) {
      // Create initial competitive stats
      await client.query(
        `INSERT INTO user_competitive_stats (
          user_id, competitors_monitored, intelligence_gathered, alerts_processed,
          opportunities_identified, competitive_tasks_completed, market_victories,
          threat_responses, intelligence_streaks, competitive_advantage_points
        ) VALUES ($1, 0, 0, 0, 0, 0, 0, 0, 0, 0)`,
        [user.id]
      )
      
      competitiveStatsRows = await client.query(
        'SELECT * FROM user_competitive_stats WHERE user_id = $1',
        [user.id]
      ).then(result => result.rows)
    }
    
    const competitiveStats = competitiveStatsRows[0]
    
    // Get unlocked achievements
    const { rows: achievementRows } = await client.query(
      'SELECT achievement_id FROM user_achievements WHERE user_id = $1',
      [user.id]
    )
    const unlockedAchievements = achievementRows.map(row => row.achievement_id)
    
    // Get unlocked badges
    const { rows: badgeRows } = await client.query(
      'SELECT badge_id FROM user_competitive_badges WHERE user_id = $1',
      [user.id]
    )
    const unlockedBadges = badgeRows.map(row => row.badge_id)
    
    // Get competitive victories
    const { rows: victoryRows } = await client.query(
      'SELECT * FROM competitive_victories WHERE user_id = $1 ORDER BY achieved_at DESC',
      [user.id]
    )
    
    // Initialize gamification engine
    const gamification = new CompetitiveIntelligenceGamification(
      {
        level: userData.level || 1,
        totalPoints: userData.total_points || 0,
        currentStreak: userData.current_streak || 0,
        longestStreak: userData.longest_streak || 0,
        tasksCompleted: userData.tasks_completed || 0,
        goalsAchieved: userData.goals_achieved || 0,
        focusMinutes: userData.focus_minutes || 0,
        wellnessScore: userData.wellness_score || 50,
        collaborationSessions: userData.collaboration_sessions || 0
      },
      {
        competitors_monitored: competitiveStats.competitors_monitored || 0,
        intelligence_gathered: competitiveStats.intelligence_gathered || 0,
        alerts_processed: competitiveStats.alerts_processed || 0,
        opportunities_identified: competitiveStats.opportunities_identified || 0,
        competitive_tasks_completed: competitiveStats.competitive_tasks_completed || 0,
        market_victories: competitiveStats.market_victories || 0,
        threat_responses: competitiveStats.threat_responses || 0,
        intelligence_streaks: competitiveStats.intelligence_streaks || 0,
        competitive_advantage_points: competitiveStats.competitive_advantage_points || 0
      },
      unlockedAchievements,
      unlockedBadges,
      victoryRows
    )
    
    // Get gamification data
    const currentLevel = gamification.getCurrentLevel()
    const nextLevel = gamification.getNextLevel()
    const progressToNext = gamification.getProgressToNextLevel()
    const leaderboardPosition = await gamification.getLeaderboardPosition(user.id)
    const weeklyChallenge = gamification.generateWeeklyChallenge()
    const insights = gamification.getCompetitiveInsights()
    
    return NextResponse.json({
      user_stats: {
        level: currentLevel.level,
        title: currentLevel.title,
        emoji: currentLevel.emoji,
        total_points: userData.total_points || 0,
        competitive_advantage_points: competitiveStats.competitive_advantage_points || 0
      },
      competitive_stats: competitiveStats,
      level_info: {
        current: currentLevel,
        next: nextLevel,
        progress_percentage: progressToNext
      },
      leaderboard: leaderboardPosition,
      weekly_challenge: weeklyChallenge,
      insights,
      unlocked_achievements: unlockedAchievements.length,
      unlocked_badges: unlockedBadges.length,
      recent_victories: victoryRows.slice(0, 5)
    })
  } catch (error) {
    console.error('Error fetching competitive intelligence gamification data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gamification data' },
      { status: 500 }
    )
  }
}

// POST /api/competitive-intelligence/gamification - Record competitive intelligence activity
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitive-gamification', ip, 60_000, 50)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const BodySchema = z.object({
      activity_type: z.enum([
        'competitor_added',
        'intelligence_gathered', 
        'alert_processed',
        'opportunity_identified',
        'competitive_task_completed',
        'threat_response',
        'intelligence_streak',
        'competitive_victory'
      ]),
      value: z.number().optional().default(1),
      victory_data: z.object({
        title: z.string(),
        description: z.string(),
        competitor_name: z.string(),
        victory_type: z.enum(['market_share_gain', 'pricing_advantage', 'product_superiority', 'talent_acquisition', 'crisis_response']),
        impact_level: z.enum(['minor', 'moderate', 'major', 'game_changing']),
        points_awarded: z.number(),
        evidence: z.array(z.string())
      }).optional()
    })

    const { activity_type, value, victory_data } = BodySchema.parse(body)

    const client = await createClient()
    
    // Get current user and competitive stats
    const { rows: userRows } = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [user.id]
    )
    
    const { rows: competitiveStatsRows } = await client.query(
      'SELECT * FROM user_competitive_stats WHERE user_id = $1',
      [user.id]
    )
    
    if (userRows.length === 0 || competitiveStatsRows.length === 0) {
      return NextResponse.json({ error: 'User or competitive stats not found' }, { status: 404 })
    }
    
    const userData = userRows[0]
    const competitiveStats = competitiveStatsRows[0]
    
    // Get unlocked achievements and badges
    const { rows: achievementRows } = await client.query(
      'SELECT achievement_id FROM user_achievements WHERE user_id = $1',
      [user.id]
    )
    const unlockedAchievements = achievementRows.map(row => row.achievement_id)
    
    const { rows: badgeRows } = await client.query(
      'SELECT badge_id FROM user_competitive_badges WHERE user_id = $1',
      [user.id]
    )
    const unlockedBadges = badgeRows.map(row => row.badge_id)
    
    // Initialize gamification engine
    const gamification = new CompetitiveIntelligenceGamification(
      {
        level: userData.level || 1,
        totalPoints: userData.total_points || 0,
        currentStreak: userData.current_streak || 0,
        longestStreak: userData.longest_streak || 0,
        tasksCompleted: userData.tasks_completed || 0,
        goalsAchieved: userData.goals_achieved || 0,
        focusMinutes: userData.focus_minutes || 0,
        wellnessScore: userData.wellness_score || 50,
        collaborationSessions: userData.collaboration_sessions || 0
      },
      {
        competitors_monitored: competitiveStats.competitors_monitored || 0,
        intelligence_gathered: competitiveStats.intelligence_gathered || 0,
        alerts_processed: competitiveStats.alerts_processed || 0,
        opportunities_identified: competitiveStats.opportunities_identified || 0,
        competitive_tasks_completed: competitiveStats.competitive_tasks_completed || 0,
        market_victories: competitiveStats.market_victories || 0,
        threat_responses: competitiveStats.threat_responses || 0,
        intelligence_streaks: competitiveStats.intelligence_streaks || 0,
        competitive_advantage_points: competitiveStats.competitive_advantage_points || 0
      },
      unlockedAchievements,
      unlockedBadges,
      []
    )
    
    // Process activity and check for achievements/badges
    const newAchievements = gamification.checkCompetitiveAchievements(activity_type, value)
    const newBadges = gamification.checkCompetitiveBadges()
    
    // Handle competitive victory
    let newVictory: CompetitiveVictory | null = null
    if (activity_type === 'competitive_victory' && victory_data) {
      newVictory = gamification.recordCompetitiveVictory(victory_data)
      
      // Save victory to database
      await client.query(
        `INSERT INTO competitive_victories (
          id, user_id, title, description, competitor_name, victory_type,
          impact_level, points_awarded, evidence, achieved_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newVictory.id,
          user.id,
          newVictory.title,
          newVictory.description,
          newVictory.competitor_name,
          newVictory.victory_type,
          newVictory.impact_level,
          newVictory.points_awarded,
          JSON.stringify(newVictory.evidence),
          newVictory.achieved_at
        ]
      )
    }
    
    // Update competitive stats in database
    const statUpdates = this.getStatUpdates(activity_type, value, competitiveStats)
    await client.query(
      `UPDATE user_competitive_stats SET 
       ${Object.keys(statUpdates).map((key, index) => `${key} = $${index + 2}`).join(', ')},
       updated_at = NOW()
       WHERE user_id = $1`,
      [user.id, ...Object.values(statUpdates)]
    )
    
    // Save new achievements
    for (const achievement of newAchievements) {
      await client.query(
        'INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES ($1, $2, NOW())',
        [user.id, achievement.id]
      )
    }
    
    // Save new badges
    for (const badge of newBadges) {
      await client.query(
        'INSERT INTO user_competitive_badges (user_id, badge_id, unlocked_at) VALUES ($1, $2, NOW())',
        [user.id, badge.id]
      )
    }
    
    // Update user total points
    const totalPointsGained = newAchievements.reduce((sum, a) => sum + a.points, 0) +
                             newBadges.reduce((sum, b) => sum + this.getBadgePoints(b.tier), 0) +
                             (newVictory?.points_awarded || 0)
    
    if (totalPointsGained > 0) {
      await client.query(
        'UPDATE users SET total_points = total_points + $1, updated_at = NOW() WHERE id = $2',
        [totalPointsGained, user.id]
      )
    }
    
    return NextResponse.json({
      success: true,
      activity_processed: activity_type,
      points_gained: totalPointsGained,
      new_achievements: newAchievements,
      new_badges: newBadges,
      new_victory: newVictory,
      celebrations: [
        ...newAchievements.map(a => gamification.generateCelebration(a)),
        ...newBadges.map(b => `🎉 New Badge Unlocked: ${b.title} ${b.emoji}`)
      ]
    })
  } catch (error) {
    console.error('Error processing competitive intelligence activity:', error)
    return NextResponse.json(
      { error: 'Failed to process competitive intelligence activity' },
      { status: 500 }
    )
  }
}

// Helper function to get stat updates
function getStatUpdates(activityType: string, value: number, currentStats: any): Record<string, number> {
  const updates: Record<string, number> = {}
  
  switch (activityType) {
    case 'competitor_added':
      updates.competitors_monitored = (currentStats.competitors_monitored || 0) + value
      break
    case 'intelligence_gathered':
      updates.intelligence_gathered = (currentStats.intelligence_gathered || 0) + value
      break
    case 'alert_processed':
      updates.alerts_processed = (currentStats.alerts_processed || 0) + value
      break
    case 'opportunity_identified':
      updates.opportunities_identified = (currentStats.opportunities_identified || 0) + value
      break
    case 'competitive_task_completed':
      updates.competitive_tasks_completed = (currentStats.competitive_tasks_completed || 0) + value
      break
    case 'threat_response':
      updates.threat_responses = (currentStats.threat_responses || 0) + value
      break
    case 'intelligence_streak':
      updates.intelligence_streaks = Math.max(currentStats.intelligence_streaks || 0, value)
      break
    case 'competitive_victory':
      updates.market_victories = (currentStats.market_victories || 0) + value
      break
  }
  
  return updates
}

// Helper function to get badge points
function getBadgePoints(tier: string): number {
  const tierPoints = {
    bronze: 50,
    silver: 100,
    gold: 200,
    platinum: 500,
    diamond: 1000
  }
  return tierPoints[tier as keyof typeof tierPoints] || 50
}