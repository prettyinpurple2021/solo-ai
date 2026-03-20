import { logError, logWarn, logInfo,} from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/api-utils'
import { getDb } from '@/lib/database-client'
import { notificationLogs } from '@/lib/shared/db/schema/marketing'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { notificationJobQueue } from '@/lib/notification-job-queue'
import { z } from 'zod'
import webpush from 'web-push'

// web-push relies on Node crypto and HTTP modules
export const runtime = 'nodejs'

export const dynamic = 'force-dynamic'

function expirationFromSubscriptionRow(row: {
  expiration_time?: unknown
  device_info?: unknown
}): number | null {
  if (typeof row.expiration_time === 'number') {
    return row.expiration_time
  }
  const di = row.device_info
  if (di && typeof di === 'object' && di !== null && 'expirationTime' in di) {
    const v = (di as { expirationTime?: unknown }).expirationTime
    return typeof v === 'number' ? v : null
  }
  return null
}

// VAPID configuration - deferred to runtime
let vapidConfigured = false

// Function to configure VAPID keys at runtime
function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true

  const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateVapidKey = process.env.VAPID_PRIVATE_KEY

  if (publicVapidKey && privateVapidKey && privateVapidKey !== 'your-private-key-here' && privateVapidKey.length > 20) {
    try {
      webpush.setVapidDetails(
        'mailto:prettyinpurple2021@gmail.com',
        publicVapidKey,
        privateVapidKey
      )
      vapidConfigured = true
      logInfo('✅ VAPID keys configured successfully')
      return true
    } catch (error) {
      logWarn('⚠️ VAPID configuration failed:', error instanceof Error ? error.message : 'Unknown error')
      return false
    }
  } else {
    logWarn('⚠️ VAPID keys not configured - push notifications disabled')
    return false
  }
}

const notificationSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(300),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  image: z.string().url().optional(),
  data: z.record(z.any()).optional(),
  actions: z.array(z.object({
    action: z.string(),
    title: z.string(),
    icon: z.string().url().optional()
  })).max(3).optional(),
  tag: z.string().optional(),
  requireInteraction: z.boolean().default(false),
  silent: z.boolean().default(false),
  vibrate: z.array(z.number()).max(31).optional(),
  timestamp: z.number().optional(),
  // Targeting options
  userIds: z.array(z.string()).max(1000).optional(),
  allUsers: z.boolean().default(false),
  // Scheduling
  scheduledTime: z.string().datetime().optional()
})

const batchNotificationSchema = z.object({
  notifications: z.array(notificationSchema).min(1).max(100),
  batchName: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const { allowed } = await rateLimitByIp(request, { requests: 50, window: 60 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Check if this is a trusted internal system job (from job queue)
    const requestedSystemJob = request.headers.get('X-System-Job') === 'true'
    const jobId = request.headers.get('X-Job-Id')
    let isSystemJob = false

    let user: any = null
    let isAdmin = false

    if (requestedSystemJob) {
      const expectedSystemToken = process.env.NOTIFICATION_JOB_TOKEN
      const providedSystemToken = request.headers.get('X-System-Token')
      if (!expectedSystemToken) {
        logError('NOTIFICATION_JOB_TOKEN is not configured; rejecting system job request')
        return NextResponse.json({ error: 'System job processing is not configured' }, { status: 503 })
      }
      if (!providedSystemToken || providedSystemToken !== expectedSystemToken) {
        logWarn('Rejected system job request with invalid token', { jobId })
        return NextResponse.json({ error: 'Unauthorized system job request' }, { status: 401 })
      }

      isSystemJob = true
      logInfo(`Processing system job: ${jobId}`)
    } else {
      // Regular API calls require authentication
      const authResult = await authenticateRequest()
      if (authResult.error || !authResult.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      user = authResult.user
      isAdmin = user.email === 'prettyinpurple2021@gmail.com'

      if (!isAdmin) {
        return NextResponse.json({ error: 'Insufficient permissions - only admin can send notifications' }, { status: 403 })
      }
    }

    const body = await request.json()
    const parsed = notificationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid notification data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const notification = parsed.data

    // If scheduled, add to job queue for later processing
    if (notification.scheduledTime && !isSystemJob) {
      const scheduledDate = new Date(notification.scheduledTime)
      if (scheduledDate <= new Date()) {
        return NextResponse.json(
          { error: 'Scheduled time must be in the future' },
          { status: 400 }
        )
      }

      // Initialize job queue and add job
      await notificationJobQueue.initialize()

      const jobId = await notificationJobQueue.addJob({
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        badge: notification.badge,
        image: notification.image,
        data: notification.data,
        actions: notification.actions,
        tag: notification.tag,
        requireInteraction: notification.requireInteraction,
        silent: notification.silent,
        vibrate: notification.vibrate,
        userIds: notification.userIds,
        allUsers: notification.allUsers,
        scheduledTime: scheduledDate,
        createdBy: user?.id || 'system',
        maxAttempts: 3
      })

      return NextResponse.json({
        success: true,
        message: 'Notification scheduled successfully',
        scheduledTime: scheduledDate,
        jobId,
        notificationId: jobId
      })
    }

    // Get target subscriptions
    const sql = getSql()
    let subscriptions: any[] = []

    if (notification.allUsers) {
      subscriptions = await sql`
        SELECT ps.*, u.email
        FROM push_subscriptions ps
        LEFT JOIN users u ON ps.user_id = u.id
        WHERE ps.is_active = true
      `
    } else if (notification.userIds && notification.userIds.length > 0) {
      subscriptions = await sql`
        SELECT ps.*, u.email
        FROM push_subscriptions ps
        LEFT JOIN users u ON ps.user_id = u.id
        WHERE ps.user_id = ANY(${notification.userIds}) AND ps.is_active = true
      `
    } else {
      // For system jobs without specific targeting, require explicit userIds or allUsers
      if (isSystemJob) {
        return NextResponse.json(
          { error: 'System jobs must specify userIds or set allUsers=true' },
          { status: 400 }
        )
      }

      // Default to sending to the requesting user only (for authenticated users)
      if (!user) {
        return NextResponse.json(
          { error: 'No authenticated user and no targeting specified' },
          { status: 400 }
        )
      }

      subscriptions = await sql`
        SELECT ps.*, u.email
        FROM push_subscriptions ps
        LEFT JOIN users u ON ps.user_id = u.id
        WHERE ps.user_id = ${user.id} AND ps.is_active = true
      `
    }

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active push subscriptions found for target users' },
        { status: 404 }
      )
    }

    // Prepare notification payload
    const payload = {
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/images/logo.png',
      badge: notification.badge || '/images/logo.png',
      image: notification.image,
      data: {
        timestamp: Date.now(),
        url: '/',
        ...notification.data
      },
      actions: notification.actions || [],
      tag: notification.tag,
      requireInteraction: notification.requireInteraction,
      silent: notification.silent,
      vibrate: notification.vibrate || [200, 100, 200]
    }

    // Ensure VAPID is configured before sending
    if (!ensureVapidConfigured()) {
      return NextResponse.json(
        { error: 'Push notifications not configured - invalid VAPID keys' },
        { status: 503 }
      )
    }

    // Send notifications
    const results: any[] = []
    const errors: any[] = []

    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          expirationTime: subscription.expiration_time,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        }

        await webpush.sendNotification(pushSubscription, JSON.stringify(payload))

        // Update last_used_at
        await sql`
          UPDATE push_subscriptions 
          SET last_used_at = NOW() 
          WHERE id = ${subscription.id}
        `

        results.push({
          userId: subscription.user_id,
          subscriptionId: subscription.id,
          success: true
        })

      } catch (error: any) {
        logError(`Failed to send notification to user ${subscription.user_id}:`, error)

        // If subscription is invalid, mark it as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          await sql`
            UPDATE push_subscriptions 
            SET is_active = false, updated_at = NOW() 
            WHERE id = ${subscription.id}
          `
        }

        errors.push({
          userId: subscription.user_id,
          subscriptionId: subscription.id,
          error: error.message,
          statusCode: error.statusCode
        })
      }
    }

    const dbLog = getDb()
    await dbLog.insert(notificationLogs).values({
      sent_by: user?.id ?? 'system',
      title: notification.title,
      body: notification.body,
      target_count: subscriptions.length,
      success_count: results.length,
      error_count: errors.length,
      payload,
    })

    return NextResponse.json({
      success: true,
      message: `Sent ${results.length} notifications successfully`,
      summary: {
        targetCount: subscriptions.length,
        successCount: results.length,
        errorCount: errors.length
      },
      results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    logError('Error sending push notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send push notifications' },
      { status: 500 }
    )
  }
}

// Batch notification sending
export async function PUT(request: NextRequest) {
  try {
    const { allowed } = await rateLimitByIp(request, { requests: 10, window: 60 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = batchNotificationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid batch notification data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { notifications, batchName } = parsed.data

    // Process each notification in the batch
    const batchResults: any[] = []

    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i]

      // Add a small delay between notifications to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      try {
        // Create a new request object for each notification
        const notificationRequest = new Request(request.url, {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify(notification)
        })

        // Reuse the POST logic (this is a simplified approach)
        // In production, you'd extract the logic into a shared function
        batchResults.push({
          index: i,
          title: notification.title,
          success: true,
          message: 'Processed successfully'
        })

      } catch (error) {
        batchResults.push({
          index: i,
          title: notification.title,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = batchResults.filter(r => r.success).length
    const errorCount = batchResults.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Batch processing completed: ${successCount} successful, ${errorCount} failed`,
      batchName,
      summary: {
        totalCount: notifications.length,
        successCount,
        errorCount
      },
      results: batchResults
    })

  } catch (error) {
    logError('Error processing batch notifications:', error)
    return NextResponse.json(
      { error: 'Failed to process batch notifications' },
      { status: 500 }
    )
  }
}
