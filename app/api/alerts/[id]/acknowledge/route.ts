import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorAlerts } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { eq, and } from 'drizzle-orm'
import type { AlertSeverity, ActionItem, Recommendation } from '@/lib/competitor-intelligence-types'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('alerts:acknowledge', ip, 60_000, 50)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alertId = parseInt(params.id)
    if (isNaN(alertId)) {
      return NextResponse.json({ error: 'Invalid alert ID' }, { status: 400 })
    }

    // Verify alert belongs to user
    const existingAlert = await db
      .select()
      .from(competitorAlerts)
      .where(
        and(
          eq(competitorAlerts.id, alertId),
          eq(competitorAlerts.user_id, user.id)
        )
      )
      .limit(1)

    if (existingAlert.length === 0) {
      return NextResponse.json(
        { error: 'Alert not found or access denied' },
        { status: 404 }
      )
    }

    const alert = existingAlert[0]

    // Check if already acknowledged
    if (alert.acknowledged_at) {
      return NextResponse.json(
        { 
          message: 'Alert already acknowledged',
          acknowledgedAt: alert.acknowledged_at,
        },
        { status: 200 }
      )
    }

    // Acknowledge alert (mark as read and set acknowledged timestamp)
    const [updatedAlert] = await db
      .update(competitorAlerts)
      .set({
        is_read: true,
        acknowledged_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(competitorAlerts.id, alertId))
      .returning()

    // Transform result to match interface
    const transformedAlert = {
      id: updatedAlert.id,
      competitorId: updatedAlert.competitor_id,
      userId: updatedAlert.user_id,
      intelligenceId: updatedAlert.intelligence_id || undefined,
      alertType: updatedAlert.alert_type,
      severity: updatedAlert.severity as AlertSeverity,
      title: updatedAlert.title,
      description: updatedAlert.description || undefined,
      sourceData: (updatedAlert.source_data as Record<string, any>) || {},
      actionItems: (updatedAlert.action_items as ActionItem[]) || [],
      recommendedActions: (updatedAlert.recommended_actions as Recommendation[]) || [],
      isRead: updatedAlert.is_read,
      isArchived: updatedAlert.is_archived,
      acknowledgedAt: updatedAlert.acknowledged_at || undefined,
      createdAt: updatedAlert.created_at!,
      updatedAt: updatedAlert.updated_at!,
    }

    return NextResponse.json({
      message: 'Alert acknowledged successfully',
      alert: transformedAlert,
    })
  } catch (error) {
    console.error('Error acknowledging alert:', error)
    return NextResponse.json(
      { error: 'Failed to acknowledge alert' },
      { status: 500 }
    )
  }
}