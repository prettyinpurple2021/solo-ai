import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorAlerts, competitorProfiles, users } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, gte, desc, inArray } from 'drizzle-orm'
import type { AlertSeverity } from '@/lib/competitor-intelligence-types'

// Validation schema for notification preferences
const NotificationPreferencesSchema = z.object({
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
  }).default({}),
  competitorFilters: z.array(z.number().int().positive()).optional(),
  alertTypeFilters: z.array(z.string()).optional(),
})

const NotificationDeliverySchema = z.object({
  alertIds: z.array(z.number().int().positive()).min(1).max(50),
  channels: z.array(z.enum(['email', 'push', 'sms'])).min(1),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  template: z.enum(['summary', 'detailed', 'critical_only']).default('summary'),
})

// Mock notification service - in production this would integrate with actual services
async function sendNotification(
  user: any,
  alerts: any[],
  channels: string[],
  template: string,
  priority: string
): Promise<{ success: boolean; deliveredChannels: string[]; errors: string[] }> {
  const deliveredChannels: string[] = []
  const errors: string[] = []

  // Mock email delivery
  if (channels.includes('email')) {
    try {
      // In production, integrate with Resend or similar service
      console.log(`Sending email notification to ${user.email}:`, {
        subject: `${alerts.length} New Competitor Alert${alerts.length > 1 ? 's' : ''}`,
        template,
        priority,
        alertCount: alerts.length,
        criticalCount: alerts.filter(a => a.severity === 'critical').length,
      })
      deliveredChannels.push('email')
    } catch (error) {
      errors.push(`Email delivery failed: ${error}`)
    }
  }

  // Mock push notification
  if (channels.includes('push')) {
    try {
      // In production, integrate with web push or mobile push service
      console.log(`Sending push notification to user ${user.id}:`, {
        title: 'Competitor Alert',
        body: `${alerts.length} new alert${alerts.length > 1 ? 's' : ''} require your attention`,
        priority,
        data: {
          alertIds: alerts.map(a => a.id),
          criticalCount: alerts.filter(a => a.severity === 'critical').length,
        },
      })
      deliveredChannels.push('push')
    } catch (error) {
      errors.push(`Push notification failed: ${error}`)
    }
  }

  // Mock SMS delivery
  if (channels.includes('sms')) {
    try {
      // In production, integrate with Twilio or similar service
      console.log(`Sending SMS to user ${user.id}:`, {
        message: `SoloBoss Alert: ${alerts.length} new competitor alert${alerts.length > 1 ? 's' : ''}. Check your dashboard.`,
        priority,
      })
      deliveredChannels.push('sms')
    } catch (error) {
      errors.push(`SMS delivery failed: ${error}`)
    }
  }

  return {
    success: deliveredChannels.length > 0,
    deliveredChannels,
    errors,
  }
}

export async function GET(request: NextRequest) {
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
    console.error('Error fetching notification summary:', error)
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
        source_data: db.raw(`
          COALESCE(source_data, '{}') || 
          '{"lastNotified": "${notificationTimestamp.toISOString()}", "notificationChannels": ${JSON.stringify(deliveryResult.deliveredChannels)}}'
        `),
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
    console.error('Error sending notifications:', error)
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    )
  }
}