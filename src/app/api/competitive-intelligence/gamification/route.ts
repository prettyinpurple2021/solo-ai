import { logError,} from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server'
import { authenticateRequest} from '@/lib/auth-server'
import { rateLimitByIp} from '@/lib/rate-limit'

import { db} from '@/db'
import { users, userCompetitiveStats, achievements, userAchievements} from '@/shared/db/schema'
import { eq} from 'drizzle-orm'
import { z} from 'zod'




// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/competitive-intelligence/gamification - Get competitive intelligence gamification data
export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user stats
    const userRows = await db.select().from(users).where(eq(users.id, user.id))
    
    if (userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const userData = userRows[0]
    
    // Get or create competitive intelligence stats
    let competitiveStatsRows = await db.select().from(userCompetitiveStats).where(eq(userCompetitiveStats.user_id, user.id))
    
    if (competitiveStatsRows.length === 0) {
      // Create initial competitive stats
      await db.insert(userCompetitiveStats).values({
        user_id: user.id,
        competitors_monitored: 0,
        intelligence_gathered: 0,
        alerts_processed: 0,
        opportunities_identified: 0,
        competitive_tasks_completed: 0,
        market_victories: 0,
        threat_responses: 0,
        intelligence_streaks: 0,
        competitive_advantage_points: 0,
      })
      
      competitiveStatsRows = await db.select().from(userCompetitiveStats).where(eq(userCompetitiveStats.user_id, user.id))
    }
    
    const competitiveStats = competitiveStatsRows[0]

    // Fetch user achievements with full details
    const earnedAchievements = await db
      .select({ 
        id: userAchievements.id, 
        earned_at: userAchievements.earned_at, 
        metadata: userAchievements.metadata,
        achievement: achievements
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievement_id, achievements.id))
      .where(eq(userAchievements.user_id, user.id))
    
    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name
      },
      competitive_stats: {
        competitors_monitored: competitiveStats.competitors_monitored,
        intelligence_gathered: competitiveStats.intelligence_gathered,
        alerts_processed: competitiveStats.alerts_processed,
        opportunities_identified: competitiveStats.opportunities_identified,
        competitive_tasks_completed: competitiveStats.competitive_tasks_completed,
        market_victories: competitiveStats.market_victories,
        threat_responses: competitiveStats.threat_responses,
        intelligence_streaks: competitiveStats.intelligence_streaks,
        competitive_advantage_points: competitiveStats.competitive_advantage_points
      },
      achievements: earnedAchievements,
      badges: earnedAchievements.map(a => a.achievement.icon).filter(Boolean),
      competitive_victories: [], // Expanded via dedicated endpoint /api/competitive-intelligence/victories
      leaderboard_position: null,
      level: Math.floor((competitiveStats.competitive_advantage_points || 0) / 100) + 1,
      points_to_next_level: 100 - ((competitiveStats.competitive_advantage_points || 0) % 100)
    })

  } catch (error) {
    logError('Error in competitive intelligence gamification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/competitive-intelligence/gamification - Update competitive intelligence gamification
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitive-gamification:update', ip, 60_000, 30)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const BodySchema = z.object({
      action: z.enum(['update_stats', 'unlock_achievement', 'record_victory']),
      stat_type: z.string().optional(),
      stat_value: z.number().optional(),
      achievement_id: z.string().uuid().optional(),
      victory_data: z.object({
        type: z.string(),
        competitor: z.string(),
        metric: z.string(),
        improvement: z.number(),
        description: z.string()
      }).optional()
    })

    const { action, stat_type, stat_value, achievement_id, victory_data } = BodySchema.parse(body)

    // Get or create competitive stats
    let competitiveStatsRows = await db.select().from(userCompetitiveStats).where(eq(userCompetitiveStats.user_id, user.id))
    
    if (competitiveStatsRows.length === 0) {
      await db.insert(userCompetitiveStats).values({
        user_id: user.id,
        competitors_monitored: 0,
        intelligence_gathered: 0,
        alerts_processed: 0,
        opportunities_identified: 0,
        competitive_tasks_completed: 0,
        market_victories: 0,
        threat_responses: 0,
        intelligence_streaks: 0,
        competitive_advantage_points: 0,
      })
      
      competitiveStatsRows = await db.select().from(userCompetitiveStats).where(eq(userCompetitiveStats.user_id, user.id))
    }

    const competitiveStats = competitiveStatsRows[0]

    if (action === 'update_stats' && stat_type && stat_value !== undefined) {
      // Update specific stat - safely whitelist columns to prevent injection
      const allowedStatColumns = [
        'competitors_monitored', 'intelligence_gathered', 'alerts_processed',
        'opportunities_identified', 'competitive_tasks_completed', 'market_victories',
        'threat_responses', 'intelligence_streaks', 'competitive_advantage_points'
      ] as const
      type AllowedStat = typeof allowedStatColumns[number]

      if (!allowedStatColumns.includes(stat_type as AllowedStat)) {
        return NextResponse.json({ error: 'Invalid stat_type' }, { status: 400 })
      }

      await db.update(userCompetitiveStats)
        .set({ [stat_type]: stat_value, updated_at: new Date() } as any)
        .where(eq(userCompetitiveStats.user_id, user.id))
    }

    if (action === 'unlock_achievement' && achievement_id) {
      // Verify achievement exists and is active
      const [targetAchievement] = await db
        .select()
        .from(achievements)
        .where(eq(achievements.id, achievement_id))

      if (!targetAchievement || !targetAchievement.is_active) {
        return NextResponse.json({ error: 'Achievement not found or inactive' }, { status: 404 })
      }

      // Check if already earned (prevent duplicates due to unique index)
      const [already] = await db
        .select()
        .from(userAchievements)
        .where(eq(userAchievements.user_id, user.id))

      const alreadyEarned = (already as any)?.achievement_id === achievement_id
      if (alreadyEarned) {
        return NextResponse.json({ success: true, message: 'Achievement already earned' })
      }

      // Insert the achievement record + award points atomically
      await db.transaction(async (tx) => {
        await tx.insert(userAchievements).values({
          user_id: user.id,
          achievement_id: achievement_id,
          metadata: { awardedBy: 'system' }
        })

        // Award achievement points
        if (targetAchievement.points > 0) {
          const newPoints = (competitiveStats.competitive_advantage_points || 0) + targetAchievement.points
          await tx.update(userCompetitiveStats)
            .set({ competitive_advantage_points: newPoints, updated_at: new Date() })
            .where(eq(userCompetitiveStats.user_id, user.id))
        }
      })

      return NextResponse.json({
        success: true,
        message: `Achievement '${targetAchievement.title}' unlocked! +${targetAchievement.points} points.`
      })
    }

    if (action === 'record_victory' && victory_data) {
      // Record this market victory – increment the market_victories counter
      // and store the details as additional advantage points
      const pointsAward = Math.min(Math.round(victory_data.improvement), 50) // Cap single award at 50
      const newVictories = (competitiveStats.market_victories || 0) + 1
      const newPoints = (competitiveStats.competitive_advantage_points || 0) + pointsAward

      await db.update(userCompetitiveStats)
        .set({ 
          market_victories: newVictories, 
          competitive_advantage_points: newPoints,
          updated_at: new Date()
        })
        .where(eq(userCompetitiveStats.user_id, user.id))

      return NextResponse.json({
        success: true,
        message: `Market victory recorded! +${pointsAward} CAP.`,
        market_victories: newVictories,
        competitive_advantage_points: newPoints
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Gamification data updated successfully'
    })

  } catch (error) {
    logError('Error updating competitive intelligence gamification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}





