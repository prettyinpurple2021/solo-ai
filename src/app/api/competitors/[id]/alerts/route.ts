import { logError,} from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { neon } from '@neondatabase/serverless'





// Force dynamic rendering
export const dynamic = 'force-dynamic'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const competitorId = params.id
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const severity = url.searchParams.get('severity')
    
    const sql = getSql()

    // Verify competitor belongs to user
    const competitor = await sql`
      SELECT id FROM competitor_profiles 
      WHERE id = ${competitorId} AND user_id = ${user.id}
    `

    if (competitor.length === 0) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // Build query with optional severity filter
    let query = sql`
      SELECT 
        id,
        alert_type as type,
        severity,
        title,
        description,
        source_data,
        action_items,
        recommended_actions,
        is_read as isRead,
        acknowledged_at,
        created_at as timestamp
      FROM competitor_alerts 
      WHERE competitor_id = ${competitorId}
    `

    if (severity) {
      query = sql`
        SELECT 
          id,
          alert_type as type,
          severity,
          title,
          description,
          source_data,
          action_items,
          recommended_actions,
          is_read as isRead,
          acknowledged_at,
          created_at as timestamp
        FROM competitor_alerts 
        WHERE competitor_id = ${competitorId} AND severity = ${severity}
      `
    }

    const alerts = await sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Format alerts
    const formattedAlerts = alerts.map(alert => ({
      id: alert.id,
      type: alert.type,
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      timestamp: alert.timestamp,
      status: alert.isRead ? 'read' : 'unread',
      actionRequired: !alert.acknowledged_at,
      sourceData: alert.source_data || {},
      actionItems: alert.action_items || [],
      recommendedActions: alert.recommended_actions || []
    }))

    return NextResponse.json(formattedAlerts)
  } catch (error) {
    logError('Error fetching competitor alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}
