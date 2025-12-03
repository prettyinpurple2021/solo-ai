import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'

import {
  initializeNotificationProcessor,
  stopNotificationProcessor,
  getProcessorStatus
} from '@/lib/notification-processor'


// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET: Get processor status
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
      .split(',').map(e => e.trim()).filter(Boolean)
    if (!adminEmails.includes(user.email)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const status = getProcessorStatus()

    return NextResponse.json({
      processor: status,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logError('Error fetching processor status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch processor status' },
      { status: 500 }
    )
  }
}

// POST: Start or stop the processor
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

    const adminEmails2 = (process.env.ADMIN_EMAILS || 'prettyinpurple2021@gmail.com')
      .split(',').map(e => e.trim()).filter(Boolean)
    if (!adminEmails2.includes(user.email)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    if (!['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      )
    }

    if (action === 'start') {
      await initializeNotificationProcessor()
      return NextResponse.json({
        success: true,
        message: 'Notification processor started',
        status: getProcessorStatus(),
        timestamp: new Date().toISOString()
      })
    } else {
      stopNotificationProcessor()
      return NextResponse.json({
        success: true,
        message: 'Notification processor stopped',
        status: getProcessorStatus(),
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    logError('Error controlling processor:', error)
    return NextResponse.json(
      { error: 'Failed to control notification processor' },
      { status: 500 }
    )
  }
}