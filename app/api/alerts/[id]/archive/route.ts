import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorAlerts } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import type { AlertSeverity, ActionItem, Recommendation } from '@/lib/competitor-intelligence-types'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schema for archive request
const ArchiveRequestSchema = z.object({
  archive: z.boolean().default(true),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('alerts:archive', ip, 60_000, 50)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alertId = parseInt(id)
    if (isNaN(alertId)) {
      return NextResponse.json({ error: 'Invalid alert ID' }, { status: 400 })
    }

    // Parse request body
    const body = await request.json().catch(() => ({}))
    const parsed = ArchiveRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { archive } = parsed.data

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

    // Check if already in desired state
    if (alert.is_archived === archive) {
      return NextResponse.json(
        {
          message: `Alert already ${archive ? 'archived' : 'unarchived'}`,
          isArchived: alert.is_archived,
        },
        { status: 200 }
      )
    }

    // Update archive status
    const [updatedAlert] = await db
      .update(competitorAlerts)
      .set({
        is_archived: archive,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      message: `Alert ${archive ? 'archived' : 'unarchived'} successfully`,
      alert: transformedAlert,
    })
  } catch (error) {
    logError('Error archiving alert:', error)
    return NextResponse.json(
      { error: 'Failed to archive alert' },
      { status: 500 }
    )
  }
}