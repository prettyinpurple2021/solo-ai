import { logError,} from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server'
import { authenticateRequest} from '@/lib/auth-server'
import { rateLimitByIp} from '@/lib/rate-limit'

import { db} from '@/db'
import { users, userCompetitiveStats} from '@/db/schema'
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
    
    // Return gamification data (Stats active, Achievements/Badges V2)
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
      achievements: [],
      badges: [],
      competitive_victories: [],
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
      achievement_id: z.string().optional(),
      victory_data: z.object({
        type: z.string(),
        competitor: z.string(),
        metric: z.string(),
        improvement: z.number(),
        description: z.string()
      }).optional()
    })

    const { action, stat_type, stat_value,} = BodySchema.parse(body)

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
      // Update specific stat
      const updateData: any = {}
      if (stat_type in competitiveStats) {
        updateData[stat_type as keyof typeof competitiveStats] = stat_value
        await db.update(userCompetitiveStats)
          .set(updateData)
          .where(eq(userCompetitiveStats.user_id, user.id))
      }
    }

    // V1 Implementation: Achievements and Victories are currently placeholders.
    // Future: Implement 'achievements' and 'market_victories' tables to track these events.
    // Current logic only updates stats.

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