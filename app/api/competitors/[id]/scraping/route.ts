import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { queueProcessor } from '@/lib/scraping-queue-processor'
import { authenticateRequest } from '@/lib/auth-server'
import { getFeatureFlags } from '@/lib/feature-flags'
import { db } from '@/db'
import { scrapingJobs } from '@/db/schema'
import { and, eq, gte } from 'drizzle-orm'
import { rateLimitByIp } from '@/lib/rate-limit'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

const createDefaultJobsSchema = z.object({
  domain: z.string().optional(),
  socialMediaHandles: z.object({
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional()
  }).optional()
})

const updateFrequencySchema = z.object({
  threatLevel: z.enum(['low', 'medium', 'high', 'critical'])
})

/**
 * GET /api/competitors/[id]/scraping - Get scraping jobs for a competitor
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await context.params;
    const competitorId = parseInt(params.id, 10)
    if (isNaN(competitorId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      )
    }

    // Get jobs for the competitor
    const jobs = await queueProcessor.getCompetitorJobs(competitorId, user.id)

    return NextResponse.json({
      success: true,
      data: jobs
    })

  } catch (error) {
    logError('Error getting competitor scraping jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/competitors/[id]/scraping - Create default scraping jobs for a competitor
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await context.params;
    const competitorId = parseInt(params.id, 10)
    if (isNaN(competitorId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createDefaultJobsSchema.parse(body)

    // Budget guard: enforce per-user hourly cap before bulk creation
    const flags = getFeatureFlags()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentJobs = await db
      .select({ id: scrapingJobs.id })
      .from(scrapingJobs)
      .where(and(eq(scrapingJobs.user_id, user.id), gte(scrapingJobs.created_at, oneHourAgo as any)))
    if (recentJobs.length >= flags.scrapingUserHourlyCap) {
      return NextResponse.json({ error: `Scraping hourly cap reached (${flags.scrapingUserHourlyCap})` }, { status: 429 })
    }

    // Create default monitoring jobs
    const jobIds = await queueProcessor.createDefaultJobs(
      competitorId,
      user.id,
      validatedData
    )

    return NextResponse.json({
      success: true,
      data: {
        jobIds,
        count: jobIds.length,
        message: `Created ${jobIds.length} default monitoring jobs`
      }
    }, { status: 201 })

  } catch (error) {
    logError('Error creating default scraping jobs:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: (error as any).errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/competitors/[id]/scraping - Update scraping job frequencies based on threat level
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await context.params;
    const competitorId = parseInt(params.id, 10)
    if (isNaN(competitorId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateFrequencySchema.parse(body)

    // Update job frequencies
    await queueProcessor.updateJobFrequencies(
      competitorId,
      user.id,
      validatedData.threatLevel
    )

    return NextResponse.json({
      success: true,
      data: {
        message: `Updated scraping frequencies for threat level: ${validatedData.threatLevel}`
      }
    })

  } catch (error) {
    logError('Error updating scraping frequencies:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: (error as any).errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/competitors/[id]/scraping - Delete all scraping jobs for a competitor
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await context.params;
    const competitorId = parseInt(params.id, 10)
    if (isNaN(competitorId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      )
    }

    // Delete all jobs for the competitor
    await queueProcessor.deleteCompetitorJobs(competitorId, user.id)

    return NextResponse.json({
      success: true,
      data: {
        message: 'All scraping jobs deleted successfully'
      }
    })

  } catch (error) {
    logError('Error deleting competitor scraping jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}