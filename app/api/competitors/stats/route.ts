import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorProfiles, competitorAlerts, intelligenceData } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { eq, and, count, gte } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date for recent calculations
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get total competitors count
    const totalCompetitorsResult = await db
      .select({ count: count() })
      .from(competitorProfiles)
      .where(eq(competitorProfiles.user_id, user.id))

    const totalCompetitors = totalCompetitorsResult[0]?.count || 0

    // Get active monitoring count
    const activeMonitoringResult = await db
      .select({ count: count() })
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.user_id, user.id),
          eq(competitorProfiles.monitoring_status, 'active')
        )
      )

    const activeMonitoring = activeMonitoringResult[0]?.count || 0

    // Get critical threats count
    const criticalThreatsResult = await db
      .select({ count: count() })
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.user_id, user.id),
          eq(competitorProfiles.threat_level, 'critical')
        )
      )

    const criticalThreats = criticalThreatsResult[0]?.count || 0

    // Get recent alerts count (last 7 days)
    const recentAlertsResult = await db
      .select({ count: count() })
      .from(competitorAlerts)
      .where(
        and(
          eq(competitorAlerts.user_id, user.id),
          gte(competitorAlerts.created_at, sevenDaysAgo)
        )
      )

    const recentAlerts = recentAlertsResult[0]?.count || 0

    // Get intelligence collected count (last 30 days)
    const intelligenceCollectedResult = await db
      .select({ count: count() })
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.user_id, user.id),
          gte(intelligenceData.collected_at, thirtyDaysAgo)
        )
      )

    const intelligenceCollected = intelligenceCollectedResult[0]?.count || 0

    // Get opportunities identified count (high importance intelligence in last 30 days)
    const opportunitiesResult = await db
      .select({ count: count() })
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.user_id, user.id),
          eq(intelligenceData.importance, 'high'),
          gte(intelligenceData.collected_at, thirtyDaysAgo)
        )
      )

    const opportunitiesIdentified = opportunitiesResult[0]?.count || 0

    const stats = {
      total_competitors: totalCompetitors,
      active_monitoring: activeMonitoring,
      critical_threats: criticalThreats,
      recent_alerts: recentAlerts,
      intelligence_collected: intelligenceCollected,
      opportunities_identified: opportunitiesIdentified,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching competitor stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitor stats' },
      { status: 500 }
    )
  }
}