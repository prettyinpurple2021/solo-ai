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

    // Get intelligence data with analysis results as insights
    const insights = await sql`
      SELECT 
        id,
        data_type as type,
        extracted_data,
        analysis_results,
        confidence,
        importance,
        tags,
        collected_at as timestamp
      FROM intelligence_data 
      WHERE competitor_id = ${competitorId}
        AND analysis_results IS NOT NULL
        AND jsonb_array_length(analysis_results) > 0
      ORDER BY collected_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // Format insights
    const formattedInsights = insights.map(insight => {
      const extractedData = typeof insight.extracted_data === 'string' 
        ? JSON.parse(insight.extracted_data) 
        : insight.extracted_data
      
      const analysisResults = typeof insight.analysis_results === 'string'
        ? JSON.parse(insight.analysis_results)
        : insight.analysis_results

      // Get the most recent analysis result
      const latestAnalysis = analysisResults && analysisResults.length > 0 
        ? analysisResults[0] 
        : {}

      return {
        id: insight.id,
        type: insight.type,
        title: latestAnalysis.title || `${insight.type} Analysis`,
        description: latestAnalysis.summary || latestAnalysis.description || `Analysis of ${insight.type} data`,
        confidence: insight.confidence,
        timestamp: insight.timestamp,
        tags: insight.tags || [],
        actionable: latestAnalysis.actionable || false,
        recommendations: latestAnalysis.recommendations || [],
        metadata: extractedData || {}
      }
    })

    return NextResponse.json(formattedInsights)
  } catch (error) {
    logError('Error fetching competitor insights:', error)
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 })
  }
}
