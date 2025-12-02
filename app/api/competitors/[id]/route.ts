import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { logError } from '@/lib/logger'
import { z } from 'zod'
import { neon } from '@neondatabase/serverless'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


// Force dynamic rendering
export const dynamic = 'force-dynamic'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

// Validation schema for updating competitor
const UpdateCompetitorSchema = z.object({
  name: z.string().min(1).optional(),
  domain: z.string().url().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  estimatedSize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  threatLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  reasoning: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  keyIndicators: z.array(z.string()).optional(),
  monitoringConfig: z.object({
    websiteMonitoring: z.boolean().optional(),
    socialMediaMonitoring: z.boolean().optional(),
    newsMonitoring: z.boolean().optional(),
    jobPostingMonitoring: z.boolean().optional(),
    appStoreMonitoring: z.boolean().optional(),
    monitoringFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    alertThresholds: z.object({
      pricing: z.boolean().optional(),
      productLaunches: z.boolean().optional(),
      hiring: z.boolean().optional(),
      funding: z.boolean().optional(),
      partnerships: z.boolean().optional(),
    }).optional(),
  }).optional(),
  monitoringStatus: z.enum(['active', 'paused', 'archived']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:get', ip, 60_000, 100)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const competitorId = parseInt(id)
    if (isNaN(competitorId)) {
      return NextResponse.json({ error: 'Invalid competitor ID' }, { status: 400 })
    }

    const sql = getSql()

    // Get competitor with related data
    const competitor = await sql`
      SELECT 
        id,
        name,
        domain,
        description,
        industry,
        estimated_size,
        threat_level,
        reasoning,
        confidence_score,
        key_indicators,
        monitoring_config,
        monitoring_status,
        last_scraped_at,
        created_at,
        updated_at
      FROM competitor_profiles 
      WHERE id = ${competitorId} AND user_id = ${user.id}
    `

    if (competitor.length === 0) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    const competitorData = competitor[0]

    // Get recent alerts for this competitor
    const alerts = await sql`
      SELECT 
        id,
        alert_type,
        severity,
        title,
        description,
        is_read,
        is_archived,
        created_at
      FROM competitor_alerts 
      WHERE competitor_id = ${competitorId} AND user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 10
    `

    // Get recent intelligence data
    const intelligence = await sql`
      SELECT 
        id,
        data_type,
        title,
        content,
        source_url,
        confidence_score,
        created_at
      FROM intelligence_data 
      WHERE competitor_id = ${competitorId}
      ORDER BY created_at DESC
      LIMIT 10
    `

    const transformedCompetitor = {
      id: competitorData.id,
      name: competitorData.name,
      domain: competitorData.domain,
      description: competitorData.description || '',
      industry: competitorData.industry || '',
      estimatedSize: competitorData.estimated_size || 'medium',
      threatLevel: competitorData.threat_level,
      reasoning: competitorData.reasoning || '',
      confidence: competitorData.confidence_score || 0.5,
      keyIndicators: competitorData.key_indicators || [],
      monitoringConfig: competitorData.monitoring_config || {},
      monitoringStatus: competitorData.monitoring_status || 'active',
      lastScrapedAt: competitorData.last_scraped_at,
      createdAt: competitorData.created_at,
      updatedAt: competitorData.updated_at,
      recentAlerts: alerts.map(alert => ({
        id: alert.id,
        type: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        isRead: alert.is_read,
        isArchived: alert.is_archived,
        createdAt: alert.created_at,
      })),
      recentIntelligence: intelligence.map(item => ({
        id: item.id,
        type: item.data_type,
        title: item.title,
        content: item.content,
        sourceUrl: item.source_url,
        confidence: item.confidence_score,
        createdAt: item.created_at,
      })),
    }

    return NextResponse.json({
      success: true,
      competitor: transformedCompetitor
    })

  } catch (error) {
    logError('Error fetching competitor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:update', ip, 60_000, 20)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const competitorId = parseInt(id)
    if (isNaN(competitorId)) {
      return NextResponse.json({ error: 'Invalid competitor ID' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = UpdateCompetitorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updateData = parsed.data
    const sql = getSql()

    // Check if competitor exists and belongs to user
    const existingCompetitor = await sql`
      SELECT id FROM competitor_profiles 
      WHERE id = ${competitorId} AND user_id = ${user.id}
    `

    if (existingCompetitor.length === 0) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // Build dynamic update query
    const updateFields = []
    const updateValues = []

    if (updateData.name !== undefined) {
      updateFields.push('name = $' + (updateValues.length + 1))
      updateValues.push(updateData.name)
    }
    if (updateData.domain !== undefined) {
      updateFields.push('domain = $' + (updateValues.length + 1))
      updateValues.push(updateData.domain)
    }
    if (updateData.description !== undefined) {
      updateFields.push('description = $' + (updateValues.length + 1))
      updateValues.push(updateData.description)
    }
    if (updateData.industry !== undefined) {
      updateFields.push('industry = $' + (updateValues.length + 1))
      updateValues.push(updateData.industry)
    }
    if (updateData.estimatedSize !== undefined) {
      updateFields.push('estimated_size = $' + (updateValues.length + 1))
      updateValues.push(updateData.estimatedSize)
    }
    if (updateData.threatLevel !== undefined) {
      updateFields.push('threat_level = $' + (updateValues.length + 1))
      updateValues.push(updateData.threatLevel)
    }
    if (updateData.reasoning !== undefined) {
      updateFields.push('reasoning = $' + (updateValues.length + 1))
      updateValues.push(updateData.reasoning)
    }
    if (updateData.confidence !== undefined) {
      updateFields.push('confidence_score = $' + (updateValues.length + 1))
      updateValues.push(updateData.confidence)
    }
    if (updateData.keyIndicators !== undefined) {
      updateFields.push('key_indicators = $' + (updateValues.length + 1))
      updateValues.push(JSON.stringify(updateData.keyIndicators))
    }
    if (updateData.monitoringConfig !== undefined) {
      updateFields.push('monitoring_config = $' + (updateValues.length + 1))
      updateValues.push(JSON.stringify(updateData.monitoringConfig))
    }
    if (updateData.monitoringStatus !== undefined) {
      updateFields.push('monitoring_status = $' + (updateValues.length + 1))
      updateValues.push(updateData.monitoringStatus)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    updateFields.push('updated_at = NOW()')
    updateValues.push(competitorId, user.id)

    const updateQuery = `
      UPDATE competitor_profiles 
      SET ${updateFields.join(', ')}
      WHERE id = $${updateValues.length - 1} AND user_id = $${updateValues.length}
      RETURNING id, name, domain, threat_level, monitoring_status, updated_at
    `

    const sqlClient = sql as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await sqlClient.unsafe(updateQuery, updateValues) as any[]

    if (result.length === 0) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    const updatedCompetitor = result[0]

    return NextResponse.json({
      success: true,
      competitor: {
        id: updatedCompetitor.id,
        name: updatedCompetitor.name,
        domain: updatedCompetitor.domain,
        threatLevel: updatedCompetitor.threat_level,
        monitoringStatus: updatedCompetitor.monitoring_status,
        updatedAt: updatedCompetitor.updated_at,
      },
      message: 'Competitor updated successfully'
    })

  } catch (error) {
    logError('Error updating competitor:', error)
    return NextResponse.json(
      { error: 'Failed to update competitor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:delete', ip, 60_000, 10)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const competitorId = parseInt(id)
    if (isNaN(competitorId)) {
      return NextResponse.json({ error: 'Invalid competitor ID' }, { status: 400 })
    }

    const sql = getSql()

    // Delete competitor (cascade will handle related data)
    const result = await sql`
      DELETE FROM competitor_profiles 
      WHERE id = ${competitorId} AND user_id = ${user.id}
      RETURNING id, name
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    const deletedCompetitor = result[0]

    return NextResponse.json({
      success: true,
      message: `Competitor "${deletedCompetitor.name}" has been deleted`,
      deletedId: deletedCompetitor.id
    })

  } catch (error) {
    logError('Error deleting competitor:', error)
    return NextResponse.json(
      { error: 'Failed to delete competitor' },
      { status: 500 }
    )
  }
}