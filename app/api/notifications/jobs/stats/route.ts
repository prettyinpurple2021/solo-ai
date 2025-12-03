import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { notificationJobQueue } from '@/lib/notification-job-queue'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET: Get job queue statistics
export async function GET(request: NextRequest) {
  try {
    const { allowed } = await rateLimitByIp(request, { requests: 30, window: 60 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmails = (process.env.ADMIN_EMAILS || 'prettyinpurple2021@gmail.com')
      .split(',')
      .map(e => e.trim())
      .filter(Boolean)
    const isAdmin = adminEmails.includes(user.email)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const stats = await notificationJobQueue.getStats()
    const status = notificationJobQueue.getStatus()

    return NextResponse.json({
      stats,
      status,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logError('Error fetching job queue stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job queue statistics' },
      { status: 500 }
    )
  }
}