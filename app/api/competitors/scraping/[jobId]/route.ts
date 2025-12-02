import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { ScrapingScheduler } from '@/lib/database-scraping-scheduler'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { db } from '@/db'
import { scrapingJobs, scrapingJobResults } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/competitors/scraping/[jobId] - Get job details and results
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
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
    const jobId = params.jobId

    // Get job details
    const job = await db
      .select()
      .from(scrapingJobs)
      .where(
        and(
          eq(scrapingJobs.id, jobId),
          eq(scrapingJobs.user_id, user.id)
        )
      )
      .limit(1)

    if (job.length === 0) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Get job results (last 10)
    const results = await db
      .select()
      .from(scrapingJobResults)
      .where(eq(scrapingJobResults.job_id, jobId))
      .orderBy(desc(scrapingJobResults.completed_at))
      .limit(10)

    return NextResponse.json({
      success: true,
      data: {
        job: job[0],
        results
      }
    })

  } catch (error) {
    logError('Error getting scraping job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/competitors/scraping/[jobId] - Update job status (pause/resume)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
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
    const jobId = params.jobId
    const body = await request.json()
    const { action } = body

    if (!['pause', 'resume'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "pause" or "resume"' },
        { status: 400 }
      )
    }

    // Verify job ownership
    const job = await db
      .select()
      .from(scrapingJobs)
      .where(
        and(
          eq(scrapingJobs.id, jobId),
          eq(scrapingJobs.user_id, user.id)
        )
      )
      .limit(1)

    if (job.length === 0) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const scheduler = ScrapingScheduler.getInstance()

    if (action === 'pause') {
      await scheduler.pauseJob(jobId)
    } else {
      await scheduler.resumeJob(jobId)
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Job ${action}d successfully`
      }
    })

  } catch (error) {
    logError('Error updating scraping job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/competitors/scraping/[jobId] - Delete a scraping job
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
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
    const jobId = params.jobId

    // Verify job ownership
    const job = await db
      .select()
      .from(scrapingJobs)
      .where(
        and(
          eq(scrapingJobs.id, jobId),
          eq(scrapingJobs.user_id, user.id)
        )
      )
      .limit(1)

    if (job.length === 0) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const scheduler = ScrapingScheduler.getInstance()
    await scheduler.deleteJob(jobId)

    return NextResponse.json({
      success: true,
      data: {
        message: 'Job deleted successfully'
      }
    })

  } catch (error) {
    logError('Error deleting scraping job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}