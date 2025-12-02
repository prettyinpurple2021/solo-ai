import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { notificationJobQueue } from '@/lib/notification-job-queue'
import { getFeatureFlags } from '@/lib/feature-flags'
import { z } from 'zod'
import { getSql } from '@/lib/api-utils'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const createJobSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(300),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  image: z.string().url().optional(),
  data: z.record(z.string(), z.any()).optional(),
  actions: z.array(z.object({
    action: z.string(),
    title: z.string(),
    icon: z.string().url().optional()
  })).max(3).optional(),
  tag: z.string().optional(),
  requireInteraction: z.boolean().default(false),
  silent: z.boolean().default(false),
  vibrate: z.array(z.number()).max(31).optional(),
  userIds: z.array(z.string()).max(1000).optional(),
  allUsers: z.boolean().default(false),
  scheduledTime: z.string().datetime(),
  maxAttempts: z.number().min(1).max(10).default(3)
})

// Initialize job queue on first request
let initialized = false

async function ensureInitialized() {
  if (!initialized) {
    await notificationJobQueue.initialize()
    initialized = true
  }
}

// GET: List jobs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { allowed } = await rateLimitByIp(request, { requests: 50, window: 60 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmails = (process.env.ADMIN_EMAILS || 'prettyinpurple2021@gmail.com')
      .split(',').map(e => e.trim()).filter(Boolean)
    if (!adminEmails.includes(user.email)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await ensureInitialized()
    const flags = getFeatureFlags()
    if (!flags.enableNotifications) {
      return NextResponse.json({ error: 'Notifications are disabled' }, { status: 403 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') || undefined
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0)
    const createdBy = url.searchParams.get('createdBy') || undefined

    const { jobs, total } = await notificationJobQueue.getJobs(status, limit, offset, createdBy)

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    logError('Error fetching notification jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification jobs' },
      { status: 500 }
    )
  }
}

// POST: Create a new scheduled notification job
export async function POST(request: NextRequest) {
  try {
    const { allowed } = await rateLimitByIp(request, { requests: 20, window: 60 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmails2 = (process.env.ADMIN_EMAILS || 'prettyinpurple2021@gmail.com')
      .split(',').map(e => e.trim()).filter(Boolean)
    if (!adminEmails2.includes(user.email)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await ensureInitialized()

    const body = await request.json()
    const parsed = createJobSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid job data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const jobData = parsed.data
    const scheduledTime = new Date(jobData.scheduledTime)
    const flags = getFeatureFlags()

    if (scheduledTime <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    // Enforce daily cap (last 24 hours, DB-accurate)
    const last24 = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const sql = getSql()
    const capRes = await sql`SELECT COUNT(*)::int AS cnt FROM notification_jobs WHERE created_at >= ${last24}`
    const recentCount = capRes[0]?.cnt || 0
    if (recentCount >= flags.notifDailyCap) {
      return NextResponse.json({ error: `Daily notifications cap reached (${flags.notifDailyCap}). Try again later.` }, { status: 429 })
    }

    const jobId = await notificationJobQueue.addJob({
      title: jobData.title,
      body: jobData.body,
      icon: jobData.icon,
      badge: jobData.badge,
      image: jobData.image,
      data: jobData.data,
      actions: jobData.actions,
      tag: jobData.tag,
      requireInteraction: jobData.requireInteraction,
      silent: jobData.silent,
      vibrate: jobData.vibrate,
      userIds: jobData.userIds,
      allUsers: jobData.allUsers,
      scheduledTime,
      createdBy: user.id,
      maxAttempts: jobData.maxAttempts
    })

    return NextResponse.json({
      success: true,
      message: 'Notification job scheduled successfully',
      jobId,
      scheduledTime: scheduledTime.toISOString()
    })

  } catch (error) {
    logError('Error creating notification job:', error)
    return NextResponse.json(
      { error: 'Failed to create notification job' },
      { status: 500 }
    )
  }
}

// DELETE: Bulk cancel jobs
export async function DELETE(request: NextRequest) {
  try {
    const { allowed } = await rateLimitByIp(request, { requests: 10, window: 60 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmails3 = (process.env.ADMIN_EMAILS || 'prettyinpurple2021@gmail.com')
      .split(',').map(e => e.trim()).filter(Boolean)
    if (!adminEmails3.includes(user.email)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    await ensureInitialized()

    const body = await request.json()
    const { jobIds } = body

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: 'jobIds array is required' },
        { status: 400 }
      )
    }

    if (jobIds.length > 50) {
      return NextResponse.json(
        { error: 'Cannot cancel more than 50 jobs at once' },
        { status: 400 }
      )
    }

    const results = []
    for (const jobId of jobIds) {
      try {
        const cancelled = await notificationJobQueue.cancelJob(jobId)
        results.push({ jobId, cancelled })
      } catch (error) {
        results.push({
          jobId,
          cancelled: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const cancelledCount = results.filter(r => r.cancelled).length

    return NextResponse.json({
      success: true,
      message: `Cancelled ${cancelledCount} out of ${jobIds.length} jobs`,
      results
    })

  } catch (error) {
    logError('Error cancelling notification jobs:', error)
    return NextResponse.json(
      { error: 'Failed to cancel notification jobs' },
      { status: 500 }
    )
  }
}