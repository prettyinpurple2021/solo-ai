import { logError, logWarn, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorAlerts, competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, gte, desc, inArray, sql } from 'drizzle-orm'
import type { AlertSeverity } from '@/lib/competitor-intelligence-types'
import { Resend } from 'resend'
import webpush from 'web-push'
import twilio from 'twilio'
import { getSql } from '@/lib/api-utils'

// Twilio + web-push depend on Node.js runtime primitives (Streams, crypto)
export const runtime = 'nodejs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schema for notification preferences (for future use)
const _NotificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  push: z.boolean().default(true),
  sms: z.boolean().default(false),
  severityThreshold: z.enum(['info', 'warning', 'urgent', 'critical']).default('warning'),
  frequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']).default('immediate'),
  quietHours: z.object({
    enabled: z.boolean().default(false),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('22:00'), // HH:MM format
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('08:00'),
    timezone: z.string().default('UTC'),
  }).default({
    enabled: false,
    start: '22:00',
    end: '08:00',
    timezone: 'UTC'
  }),
  competitorFilters: z.array(z.number().int().positive()).optional(),
  alertTypeFilters: z.array(z.string()).optional(),
})

const NotificationDeliverySchema = z.object({
  alertIds: z.array(z.number().int().positive()).min(1).max(50),
  channels: z.array(z.enum(['email', 'push', 'sms'])).min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  template: z.enum(['summary', 'detailed', 'critical_only']).default('summary'),
})

// Initialize notification services
let resendClient: Resend | null = null
let twilioClient: twilio.Twilio | null = null
let vapidConfigured = false

function initializeServices() {
  // Initialize Resend
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
    logInfo('Resend email service initialized')
  }

  // Initialize Twilio
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    logInfo('Twilio SMS service initialized')
  }

  // Configure VAPID for web push
  if (!vapidConfigured) {
    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateVapidKey = process.env.VAPID_PRIVATE_KEY

    if (publicVapidKey && privateVapidKey && privateVapidKey !== 'your-private-key-here' && privateVapidKey.length > 20) {
      try {
        webpush.setVapidDetails(
          process.env.VAPID_CONTACT_EMAIL || 'mailto:prettyinpurple2021@gmail.com',
          publicVapidKey,
          privateVapidKey
        )
        vapidConfigured = true
        logInfo('VAPID keys configured for push notifications')
      } catch (error) {
        logWarn('VAPID configuration failed:', error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateEmailContent(alerts: any[], template: string, _priority: string) {
  const criticalCount = alerts.filter(a => a.severity === 'critical').length
  const urgentCount = alerts.filter(a => a.severity === 'urgent').length
  const alertCount = alerts.length

  let subject = ''
  let html = ''
  let text = ''

  if (template === 'summary') {
    subject = `${alertCount} New Competitor Alert${alertCount > 1 ? 's' : ''}`
    const severitySummary = []
    if (criticalCount > 0) severitySummary.push(`${criticalCount} critical`)
    if (urgentCount > 0) severitySummary.push(`${urgentCount} urgent`)

    html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .alert-item { background: white; padding: 16px; margin: 12px 0; border-radius: 6px; border-left: 4px solid #8B5CF6; }
            .severity-critical { border-left-color: #dc2626; }
            .severity-urgent { border-left-color: #d97706; }
            .severity-warning { border-left-color: #f59e0b; }
            .cta-button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Competitor Alert${alertCount > 1 ? 's' : ''}</h1>
              <p>You have ${alertCount} new alert${alertCount > 1 ? 's' : ''} requiring your attention</p>
            </div>
            <div class="content">
              ${alerts.slice(0, 5).map(alert => `
                <div class="alert-item severity-${alert.severity}">
                  <h3>${alert.title}</h3>
                  <p><strong>Competitor:</strong> ${alert.competitor?.name || 'Unknown'}</p>
                  <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
                  <p>${alert.description.substring(0, 200)}${alert.description.length > 200 ? '...' : ''}</p>
                </div>
              `).join('')}
              ${alertCount > 5 ? `<p><em>...and ${alertCount - 5} more alert${alertCount - 5 > 1 ? 's' : ''}</em></p>` : ''}
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://solobossai.fun'}/dashboard/competitors" class="cta-button">
                View All Alerts →
              </a>
            </div>
          </div>
        </body>
      </html>
    `

    text = `${subject}\n\nYou have ${alertCount} new competitor alert${alertCount > 1 ? 's' : ''}:\n\n${alerts.slice(0, 5).map(alert => `- ${alert.title} (${alert.competitor?.name || 'Unknown'}) - ${alert.severity.toUpperCase()}`).join('\n')}${alertCount > 5 ? `\n...and ${alertCount - 5} more` : ''}\n\nView all alerts: ${process.env.NEXT_PUBLIC_APP_URL || 'https://solobossai.fun'}/dashboard/competitors`
  } else if (template === 'detailed') {
    subject = `Detailed Competitor Intelligence: ${alertCount} Alert${alertCount > 1 ? 's' : ''}`
    html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .alert-item { background: white; padding: 20px; margin: 16px 0; border-radius: 6px; border-left: 4px solid #8B5CF6; }
            .severity-critical { border-left-color: #dc2626; }
            .severity-urgent { border-left-color: #d97706; }
            .severity-warning { border-left-color: #f59e0b; }
            .cta-button { display: inline-block; padding: 12px 24px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Detailed Competitor Intelligence</h1>
            </div>
            <div class="content">
              ${alerts.map(alert => `
                <div class="alert-item severity-${alert.severity}">
                  <h3>${alert.title}</h3>
                  <p><strong>Competitor:</strong> ${alert.competitor?.name || 'Unknown'}</p>
                  <p><strong>Domain:</strong> ${alert.competitor?.domain || 'N/A'}</p>
                  <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
                  <p><strong>Type:</strong> ${alert.alertType}</p>
                  <p><strong>Description:</strong></p>
                  <p>${alert.description.replace(/\n/g, '<br>')}</p>
                  <p><small>Created: ${new Date(alert.createdAt).toLocaleString()}</small></p>
                </div>
              `).join('')}
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://solobossai.fun'}/dashboard/competitors" class="cta-button">
                View Full Dashboard →
              </a>
            </div>
          </div>
        </body>
      </html>
    `

    text = alerts.map(alert => `${alert.title}\nCompetitor: ${alert.competitor?.name || 'Unknown'}\nSeverity: ${alert.severity.toUpperCase()}\n\n${alert.description}\n\n---\n`).join('\n')
  } else {
    // critical_only template
    const criticalAlerts = alerts.filter(a => a.severity === 'critical')
    subject = `🚨 ${criticalAlerts.length} Critical Competitor Alert${criticalAlerts.length > 1 ? 's' : ''}`
    html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .alert-item { background: white; padding: 20px; margin: 16px 0; border-radius: 6px; border-left: 4px solid #dc2626; }
            .cta-button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Critical Alerts</h1>
              <p>Immediate attention required</p>
            </div>
            <div class="content">
              ${criticalAlerts.map(alert => `
                <div class="alert-item">
                  <h3>${alert.title}</h3>
                  <p><strong>Competitor:</strong> ${alert.competitor?.name || 'Unknown'}</p>
                  <p>${alert.description}</p>
                </div>
              `).join('')}
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://solobossai.fun'}/dashboard/competitors" class="cta-button">
                View Critical Alerts →
              </a>
            </div>
          </div>
        </body>
      </html>
    `

    text = `CRITICAL ALERTS - Immediate Attention Required\n\n${criticalAlerts.map(alert => `${alert.title}\nCompetitor: ${alert.competitor?.name || 'Unknown'}\n${alert.description}\n\n---\n`).join('\n')}`
  }

  return { subject, html, text }
}

async function sendNotification(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  alerts: any[],
  channels: string[],
  template: string,
  priority: string
): Promise<{ success: boolean; deliveredChannels: string[]; errors: string[] }> {
  initializeServices()

  const deliveredChannels: string[] = []
  const errors: string[] = []

  // Send email notifications
  if (channels.includes('email')) {
    try {
      if (!resendClient) {
        throw new Error('Resend API key not configured')
      }

      if (!user.email) {
        throw new Error('User email address not available')
      }

      const { subject, html, text } = generateEmailContent(alerts, template, priority)

      const response = await resendClient.emails.send({
        from: process.env.FROM_EMAIL || 'SoloSuccess AI <alerts@solobossai.fun>',
        to: user.email,
        subject,
        html,
        text,
      })

      if (response.error) {
        throw new Error(`Resend API error: ${response.error.message}`)
      }

      logInfo(`Email notification sent to ${user.email}`, {
        emailId: response.data?.id,
        alertCount: alerts.length,
        template,
        priority,
      })

      deliveredChannels.push('email')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logError('Email delivery failed:', error)
      errors.push(`Email delivery failed: ${errorMessage}`)
    }
  }

  // Send push notifications
  if (channels.includes('push')) {
    try {
      if (!vapidConfigured) {
        throw new Error('VAPID keys not configured for push notifications')
      }

      const sql = getSql()
      const subscriptions = await sql`
        SELECT endpoint, expiration_time, p256dh_key, auth_key, id
        FROM push_subscriptions
        WHERE user_id = ${user.id} AND is_active = true
      `

      if (subscriptions.length === 0) {
        throw new Error('No active push subscriptions found for user')
      }

      const criticalCount = alerts.filter(a => a.severity === 'critical').length
      const alertCount = alerts.length

      const payload = {
        title: criticalCount > 0
          ? `🚨 ${criticalCount} Critical Alert${criticalCount > 1 ? 's' : ''}`
          : `${alertCount} New Competitor Alert${alertCount > 1 ? 's' : ''}`,
        body: criticalCount > 0
          ? `${criticalCount} critical alert${criticalCount > 1 ? 's' : ''} require immediate attention`
          : `${alertCount} new alert${alertCount > 1 ? 's' : ''} require your attention`,
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        data: {
          alertIds: alerts.map(a => a.id),
          criticalCount,
          alertCount,
          url: '/dashboard/competitors',
        },
        requireInteraction: criticalCount > 0,
        vibrate: criticalCount > 0 ? [200, 100, 200, 100, 200] : [200, 100, 200],
      }

      let successCount = 0
      for (const subscription of subscriptions) {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            expirationTime: subscription.expiration_time,
            keys: {
              p256dh: subscription.p256dh_key,
              auth: subscription.auth_key,
            },
          }

          await webpush.sendNotification(pushSubscription, JSON.stringify(payload))

          await sql`
            UPDATE push_subscriptions 
            SET last_used_at = NOW() 
            WHERE id = ${subscription.id}
          `

          successCount++
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          logError(`Failed to send push to subscription ${subscription.id}:`, error)

          if (error.statusCode === 410 || error.statusCode === 404) {
            await sql`
              UPDATE push_subscriptions 
              SET is_active = false, updated_at = NOW() 
              WHERE id = ${subscription.id}
            `
          }
        }
      }

      if (successCount > 0) {
        logInfo(`Push notifications sent to ${successCount} device(s) for user ${user.id}`, {
          alertCount: alerts.length,
          criticalCount,
        })
        deliveredChannels.push('push')
      } else {
        throw new Error('Failed to send push notifications to any device')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logError('Push notification failed:', error)
      errors.push(`Push notification failed: ${errorMessage}`)
    }
  }

  // Send SMS notifications
  if (channels.includes('sms')) {
    try {
      if (!twilioClient) {
        throw new Error('Twilio credentials not configured')
      }

      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER
      if (!twilioPhoneNumber) {
        throw new Error('Twilio phone number not configured')
      }

      if (!user.phone_number && !user.phone) {
        throw new Error('User phone number not available')
      }

      const phoneNumber = user.phone_number || user.phone
      const criticalCount = alerts.filter(a => a.severity === 'critical').length
      const alertCount = alerts.length

      let message = ''
      if (criticalCount > 0) {
        message = `🚨 SoloSuccess Alert: ${criticalCount} CRITICAL competitor alert${criticalCount > 1 ? 's' : ''} require immediate attention. Check dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://solobossai.fun'}/dashboard/competitors`
      } else {
        message = `SoloSuccess Alert: ${alertCount} new competitor alert${alertCount > 1 ? 's' : ''}. Check dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://solobossai.fun'}/dashboard/competitors`
      }

      const response = await twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: phoneNumber,
      })

      logInfo(`SMS notification sent to ${phoneNumber}`, {
        messageSid: response.sid,
        alertCount: alerts.length,
        criticalCount,
      })

      deliveredChannels.push('sms')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logError('SMS delivery failed:', error)
      errors.push(`SMS delivery failed: ${errorMessage}`)
    }
  }

  return {
    success: deliveredChannels.length > 0,
    deliveredChannels,
    errors,
  }
}

export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get recent unread alerts for notification summary
    const recentAlerts = await db
      .select({
        alert: competitorAlerts,
        competitor: {
          id: competitorProfiles.id,
          name: competitorProfiles.name,
          threatLevel: competitorProfiles.threat_level,
        }
      })
      .from(competitorAlerts)
      .leftJoin(competitorProfiles, eq(competitorAlerts.competitor_id, competitorProfiles.id))
      .where(
        and(
          eq(competitorAlerts.user_id, user.id),
          eq(competitorAlerts.is_read, false),
          eq(competitorAlerts.is_archived, false),
          gte(competitorAlerts.created_at, new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
        )
      )
      .orderBy(desc(competitorAlerts.created_at))
      .limit(50)

    // Group alerts by severity and type
    const alertSummary = {
      total: recentAlerts.length,
      bySeverity: recentAlerts.reduce((acc, item) => {
        acc[item.alert.severity] = (acc[item.alert.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byType: recentAlerts.reduce((acc, item) => {
        acc[item.alert.alert_type] = (acc[item.alert.alert_type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byCompetitor: recentAlerts.reduce((acc, item) => {
        const competitorName = item.competitor?.name || 'Unknown'
        acc[competitorName] = (acc[competitorName] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      criticalAlerts: recentAlerts.filter(item => item.alert.severity === 'critical').length,
      urgentAlerts: recentAlerts.filter(item => item.alert.severity === 'urgent').length,
    }

    return NextResponse.json({
      summary: alertSummary,
      recentAlerts: recentAlerts.slice(0, 10).map(item => ({
        id: item.alert.id,
        title: item.alert.title,
        severity: item.alert.severity,
        alertType: item.alert.alert_type,
        createdAt: item.alert.created_at,
        competitor: item.competitor ? {
          id: item.competitor.id,
          name: item.competitor.name,
          threatLevel: item.competitor.threatLevel,
        } : undefined,
      })),
    })
  } catch (error) {
    logError('Error fetching notification summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification summary' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('alerts:notify', ip, 60_000, 10)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = NotificationDeliverySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { alertIds, channels, priority, template } = parsed.data

    // Get alerts with competitor info
    const alerts = await db
      .select({
        alert: competitorAlerts,
        competitor: {
          id: competitorProfiles.id,
          name: competitorProfiles.name,
          domain: competitorProfiles.domain,
          threatLevel: competitorProfiles.threat_level,
        }
      })
      .from(competitorAlerts)
      .leftJoin(competitorProfiles, eq(competitorAlerts.competitor_id, competitorProfiles.id))
      .where(
        and(
          inArray(competitorAlerts.id, alertIds),
          eq(competitorAlerts.user_id, user.id)
        )
      )

    if (alerts.length === 0) {
      return NextResponse.json(
        { error: 'No alerts found or access denied' },
        { status: 404 }
      )
    }

    // Transform alerts for notification
    const alertsForNotification = alerts.map(item => ({
      id: item.alert.id,
      title: item.alert.title,
      severity: item.alert.severity as AlertSeverity,
      alertType: item.alert.alert_type,
      description: item.alert.description,
      createdAt: item.alert.created_at,
      competitor: item.competitor ? {
        id: item.competitor.id,
        name: item.competitor.name,
        domain: item.competitor.domain,
        threatLevel: item.competitor.threatLevel,
      } : undefined,
    }))

    // Send notifications
    const deliveryResult = await sendNotification(
      user,
      alertsForNotification,
      channels,
      template,
      priority
    )

    // Update alerts to mark as notified (add a notification timestamp to source_data)
    const notificationTimestamp = new Date()
    await db
      .update(competitorAlerts)
      .set({
        source_data: sql`
          COALESCE(source_data, '{}') || 
          '{"lastNotified": "${notificationTimestamp.toISOString()}", "notificationChannels": ${JSON.stringify(deliveryResult.deliveredChannels)}}'::jsonb
        `,
        updated_at: notificationTimestamp,
      })
      .where(
        and(
          inArray(competitorAlerts.id, alertIds),
          eq(competitorAlerts.user_id, user.id)
        )
      )

    return NextResponse.json({
      message: 'Notifications sent successfully',
      deliveryResult,
      notificationSummary: {
        alertCount: alerts.length,
        channels: deliveryResult.deliveredChannels,
        priority,
        template,
        timestamp: notificationTimestamp.toISOString(),
      },
      alerts: alertsForNotification.map(a => ({
        id: a.id,
        title: a.title,
        severity: a.severity,
        competitor: a.competitor?.name,
      })),
    })
  } catch (error) {
    logError('Error sending notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}