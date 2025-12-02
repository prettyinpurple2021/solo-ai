import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
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

// Validation schema for saving discovered competitors
const SaveCompetitorSchema = z.object({
  name: z.string().min(1, 'Competitor name is required'),
  domain: z.string().url('Valid domain URL is required'),
  description: z.string().optional(),
  industry: z.string().optional(),
  estimatedSize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  threatLevel: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  reasoning: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.5),
  keyIndicators: z.array(z.string()).optional(),
  suggestedMonitoringConfig: z.object({
    websiteMonitoring: z.boolean().default(true),
    socialMediaMonitoring: z.boolean().default(false),
    newsMonitoring: z.boolean().default(false),
    jobPostingMonitoring: z.boolean().default(false),
    appStoreMonitoring: z.boolean().default(false),
    monitoringFrequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
    alertThresholds: z.object({
      pricing: z.boolean().default(true),
      productLaunches: z.boolean().default(true),
      hiring: z.boolean().default(false),
      funding: z.boolean().default(false),
      partnerships: z.boolean().default(false),
    }).optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:save-discovered', ip, 60_000, 10)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = SaveCompetitorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const competitorData = parsed.data
    const sql = getSql()

    // Check if competitor already exists for this user
    const existingCompetitor = await sql`
      SELECT id FROM competitor_profiles 
      WHERE user_id = ${user.id} AND domain = ${competitorData.domain}
    `

    if (existingCompetitor.length > 0) {
      return NextResponse.json(
        { error: 'Competitor already exists', competitorId: existingCompetitor[0].id },
        { status: 409 }
      )
    }

    // Insert new competitor profile
    const result = await sql`
      INSERT INTO competitor_profiles (
        user_id,
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
        created_at,
        updated_at
      ) VALUES (
        ${user.id},
        ${competitorData.name},
        ${competitorData.domain},
        ${competitorData.description || ''},
        ${competitorData.industry || ''},
        ${competitorData.estimatedSize || 'medium'},
        ${competitorData.threatLevel},
        ${competitorData.reasoning || ''},
        ${competitorData.confidence},
        ${JSON.stringify(competitorData.keyIndicators || [])},
        ${JSON.stringify(competitorData.suggestedMonitoringConfig || {})},
        'active',
        NOW(),
        NOW()
      )
      RETURNING id, name, domain, threat_level, monitoring_status, created_at
    `

    const newCompetitor = result[0]

    return NextResponse.json({
      success: true,
      competitor: {
        id: newCompetitor.id,
        name: newCompetitor.name,
        domain: newCompetitor.domain,
        threatLevel: newCompetitor.threat_level,
        monitoringStatus: newCompetitor.monitoring_status,
        createdAt: newCompetitor.created_at,
      },
      message: 'Competitor successfully added to your monitoring list'
    }, { status: 201 })

  } catch (error) {
    logError('Error saving discovered competitor:', error)
    return NextResponse.json(
      { error: 'Failed to save competitor' },
      { status: 500 }
    )
  }
}
