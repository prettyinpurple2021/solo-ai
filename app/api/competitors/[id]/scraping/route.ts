import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { scrapingScheduler } from '@/lib/scraping-scheduler'
import { webScrapingService } from '@/lib/web-scraping-service'
import { db } from '@/db'
import { competitorProfiles } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

// Request schemas
const scheduleJobSchema = z.object({
  jobType: z.enum(['website', 'pricing', 'products', 'jobs']),
  url: z.string().url(),
  frequency: z.object({
    type: z.enum(['interval', 'cron', 'manual']),
    value: z.union([z.string(), z.number()]),
    timezone: z.string().optional(),
  }),
  config: z.object({
    enableChangeDetection: z.boolean().default(true),
    changeThreshold: z.number().min(0).max(1).default(0.1),
    notifyOnChange: z.boolean().default(true),
    storeHistory: z.boolean().default(true),
    customSelectors: z.record(z.string()).optional(),
    excludePatterns: z.array(z.string()).optional(),
  }).optional(),
})

const executeJobSchema = z.object({
  jobType: z.enum(['website', 'pricing', 'products', 'jobs']),
  url: z.string().url(),
})

/**
 * GET /api/competitors/[id]/scraping
 * Get all scraping jobs for a competitor
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const authResult = await authenticateRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const competitorId = parseInt(params.id)
    if (isNaN(competitorId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      )
    }

    // Verify competitor exists and belongs to user
    const competitor = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, authResult.user.id)
        )
      )
      .limit(1)

    if (competitor.length === 0) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      )
    }

    // Get scraping jobs for this competitor
    const jobs = scrapingScheduler.getCompetitorJobs(competitorId)
    
    // Get job history for each job
    const jobsWithHistory = jobs.map(job => ({
      ...job,
      history: scrapingScheduler.getJobHistory(job.id).slice(-5), // Last 5 executions
    }))

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobsWithHistory,
        metrics: scrapingScheduler.getMetrics(),
      },
    })
  } catch (error) {
    console.error('Error fetching scraping jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/competitors/[id]/scraping
 * Schedule a new scraping job for a competitor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const authResult = await authenticateRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const competitorId = parseInt(params.id)
    if (isNaN(competitorId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      )
    }

    // Verify competitor exists and belongs to user
    const competitor = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, authResult.user.id)
        )
      )
      .limit(1)

    if (competitor.length === 0) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = scheduleJobSchema.parse(body)

    // Schedule the scraping job
    const jobId = await scrapingScheduler.scheduleJob(
      competitorId,
      authResult.user.id,
      validatedData.jobType,
      validatedData.url,
      validatedData.frequency,
      validatedData.config
    )

    const job = scrapingScheduler.getJob(jobId)

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        job,
        message: 'Scraping job scheduled successfully',
      },
    })
  } catch (error) {
    console.error('Error scheduling scraping job:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
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
 * PUT /api/competitors/[id]/scraping
 * Execute immediate scraping for a competitor
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const authResult = await authenticateRequest(request)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const competitorId = parseInt(params.id)
    if (isNaN(competitorId)) {
      return NextResponse.json(
        { error: 'Invalid competitor ID' },
        { status: 400 }
      )
    }

    // Verify competitor exists and belongs to user
    const competitor = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, authResult.user.id)
        )
      )
      .limit(1)

    if (competitor.length === 0) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = executeJobSchema.parse(body)

    // Execute immediate scraping
    let result
    switch (validatedData.jobType) {
      case 'website':
        result = await webScrapingService.scrapeCompetitorWebsite(validatedData.url)
        break
      case 'pricing':
        result = await webScrapingService.monitorPricingPages(validatedData.url)
        break
      case 'products':
        result = await webScrapingService.trackProductPages(validatedData.url)
        break
      case 'jobs':
        result = await webScrapingService.scrapeJobPostings(validatedData.url)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid job type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: {
        result,
        executedAt: new Date().toISOString(),
        jobType: validatedData.jobType,
        url: validatedData.url,
      },
    })
  } catch (error) {
    console.error('Error executing immediate scraping:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}