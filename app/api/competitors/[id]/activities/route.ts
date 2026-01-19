import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
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
    
    const sql = getSql()

    // Verify competitor belongs to user
    const competitor = await sql`
      SELECT id FROM competitor_profiles 
      WHERE id = ${competitorId} AND user_id = ${user.id}
    `

    if (competitor.length === 0) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // Get intelligence data as activities
    const activities = await sql`
      SELECT 
        id,
        source_type as type,
        data_type,
        source_url as source,
        extracted_data,
        importance,
        collected_at as timestamp,
        analysis_results
      FROM intelligence_data 
      WHERE competitor_id = ${competitorId}
      ORDER BY collected_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Format activities
    const formattedActivities = activities.map(activity => {
      const extractedData = typeof activity.extracted_data === 'string' 
        ? JSON.parse(activity.extracted_data) 
        : activity.extracted_data

      return {
        id: activity.id,
        type: activity.type,
        title: extractedData?.title || `${activity.data_type} update`,
        description: extractedData?.description || `New ${activity.data_type} detected`,
        source: activity.source,
        importance: activity.importance,
        timestamp: activity.timestamp,
        metadata: extractedData || {}
      }
    })

    return NextResponse.json(formattedActivities)
  } catch (error) {
    logError('Error fetching competitor activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}
