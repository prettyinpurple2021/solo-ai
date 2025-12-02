import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { getSql } from '@/lib/api-utils'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:stats', ip, 60_000, 10)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const sql = getSql()

    // Get total competitors count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalCompetitorsRows = await sql`
      SELECT COUNT(*) as count
      FROM competitor_profiles
      WHERE user_id = ${userId}
    ` as any[]
    const totalCompetitors = { count: parseInt(totalCompetitorsRows[0]?.count || '0') }

    // Get competitors by threat level
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const threatLevelStatsRows = await sql`
      SELECT threat_level, COUNT(*) as count
      FROM competitor_profiles
      WHERE user_id = ${userId}
      GROUP BY threat_level
    ` as any[]

    // Get recent alerts count (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentAlertsRows = await sql`
      SELECT COUNT(*) as count
      FROM competitor_alerts ca
      WHERE ca.competitor_id IN (
        SELECT id FROM competitor_profiles WHERE user_id = ${userId}
      ) AND ca.created_at >= ${thirtyDaysAgo.toISOString()}
    ` as any[]
    const recentAlerts = { count: parseInt(recentAlertsRows[0]?.count || '0') }

    // Get recent activities count (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentActivitiesRows = await sql`
      SELECT COUNT(*) as count
      FROM competitor_activities ca
      WHERE ca.competitor_id IN (
        SELECT id FROM competitor_profiles WHERE user_id = ${userId}
      ) AND ca.created_at >= ${sevenDaysAgo.toISOString()}
    ` as any[]
    const recentActivities = { count: parseInt(recentActivitiesRows[0]?.count || '0') }

    // Get active monitoring count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeMonitoringRows = await sql`
      SELECT COUNT(*) as count
      FROM competitor_profiles
      WHERE user_id = ${userId} AND monitoring_status = 'active'
    ` as any[]
    const activeMonitoring = { count: parseInt(activeMonitoringRows[0]?.count || '0') }

    // Calculate threat distribution
    const threatDistribution = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    threatLevelStatsRows.forEach((stat: any) => {
      if (stat.threat_level && stat.threat_level in threatDistribution) {
        threatDistribution[stat.threat_level as keyof typeof threatDistribution] = parseInt(stat.count || '0')
      }
    })

    // Calculate average employee count (if column exists)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avgEmployeeCountRows = await sql`
      SELECT AVG(employee_count) as avg
      FROM competitor_profiles
      WHERE user_id = ${userId} AND employee_count IS NOT NULL
    ` as any[]
    const avgEmployeeCount = { avg: parseFloat(avgEmployeeCountRows[0]?.avg || '0') }

    // Calculate total funding tracked (if column exists)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalFundingRows = await sql`
      SELECT SUM(funding_amount) as sum
      FROM competitor_profiles
      WHERE user_id = ${userId} AND funding_amount IS NOT NULL
    ` as any[]
    const totalFunding = { sum: parseFloat(totalFundingRows[0]?.sum || '0') }

    const stats = {
      totalCompetitors: totalCompetitors.count,
      activeMonitoring: activeMonitoring.count,
      recentAlerts: recentAlerts.count,
      recentActivities: recentActivities.count,
      threatDistribution,
      averageEmployeeCount: Math.round(avgEmployeeCount.avg || 0),
      totalFundingTracked: totalFunding.sum || 0,
      monitoringCoverage: totalCompetitors.count > 0 ?
        Math.round((activeMonitoring.count / totalCompetitors.count) * 100) : 0,
      alertFrequency: recentAlerts.count > 0 ?
        Math.round(recentAlerts.count / 30 * 7) : 0, // Alerts per week
      activityLevel: recentActivities.count > 0 ?
        Math.round(recentActivities.count / 7) : 0, // Activities per day
      lastUpdated: new Date().toISOString()
    }

    logInfo('Competitor stats calculated successfully', { userId, stats })

    return NextResponse.json(stats)
  } catch (error) {
    logError('Error fetching competitor stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitor statistics' },
      { status: 500 }
    )
  }
}