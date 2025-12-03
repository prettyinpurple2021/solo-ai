import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { notificationJobQueue } from '@/lib/notification-job-queue'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

const cleanupSchema = z.object({
  olderThanDays: z.number().min(1).max(365).default(30)
})

// POST: Clean up old completed and failed jobs
export async function POST(request: NextRequest) {
  try {
    const { allowed } = await rateLimitByIp(request, { requests: 5, window: 60 })
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

    const body = await request.json()
    const parsed = cleanupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid cleanup parameters', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { olderThanDays } = parsed.data
    const deletedCount = await notificationJobQueue.cleanup(olderThanDays)

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} old notification jobs`,
      deletedCount,
      olderThanDays,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logError('Error cleaning up notification jobs:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup notification jobs' },
      { status: 500 }
    )
  }
}