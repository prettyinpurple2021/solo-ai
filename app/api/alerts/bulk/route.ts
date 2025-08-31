import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorAlerts } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, inArray } from 'drizzle-orm'

// Validation schema for bulk operations
const BulkOperationSchema = z.object({
  alertIds: z.array(z.number().int().positive()).min(1).max(100),
  operation: z.enum(['acknowledge', 'archive', 'unarchive', 'mark_read', 'mark_unread', 'delete']),
  competitorId: z.number().int().positive().optional(), // Optional filter for additional security
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('alerts:bulk', ip, 60_000, 10)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = BulkOperationSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { alertIds, operation, competitorId } = parsed.data

    // Build conditions for alert verification
    const conditions = [
      inArray(competitorAlerts.id, alertIds),
      eq(competitorAlerts.user_id, user.id)
    ]

    if (competitorId) {
      conditions.push(eq(competitorAlerts.competitor_id, competitorId))
    }

    // Verify all alerts belong to user (and optionally to specific competitor)
    const existingAlerts = await db
      .select({ id: competitorAlerts.id })
      .from(competitorAlerts)
      .where(and(...conditions))

    if (existingAlerts.length !== alertIds.length) {
      return NextResponse.json(
        { error: 'Some alerts not found or access denied' },
        { status: 404 }
      )
    }

    let updateData: any = { updated_at: new Date() }
    let resultMessage = ''

    // Determine update based on operation
    switch (operation) {
      case 'acknowledge':
        updateData.is_read = true
        updateData.acknowledged_at = new Date()
        resultMessage = 'Alerts acknowledged successfully'
        break
      
      case 'archive':
        updateData.is_archived = true
        resultMessage = 'Alerts archived successfully'
        break
      
      case 'unarchive':
        updateData.is_archived = false
        resultMessage = 'Alerts unarchived successfully'
        break
      
      case 'mark_read':
        updateData.is_read = true
        resultMessage = 'Alerts marked as read successfully'
        break
      
      case 'mark_unread':
        updateData.is_read = false
        resultMessage = 'Alerts marked as unread successfully'
        break
      
      case 'delete':
        // For delete operation, we don't update but delete
        await db
          .delete(competitorAlerts)
          .where(and(...conditions))
        
        return NextResponse.json({
          message: 'Alerts deleted successfully',
          operation,
          affectedCount: alertIds.length,
          alertIds,
        })
      
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }

    // Perform bulk update for non-delete operations
    const updatedAlerts = await db
      .update(competitorAlerts)
      .set(updateData)
      .where(and(...conditions))
      .returning({
        id: competitorAlerts.id,
        competitorId: competitorAlerts.competitor_id,
        alertType: competitorAlerts.alert_type,
        severity: competitorAlerts.severity,
        title: competitorAlerts.title,
        isRead: competitorAlerts.is_read,
        isArchived: competitorAlerts.is_archived,
        acknowledgedAt: competitorAlerts.acknowledged_at,
        updatedAt: competitorAlerts.updated_at,
      })

    // Get summary of affected alerts by competitor
    const competitorSummary = updatedAlerts.reduce((acc, alert) => {
      const competitorId = alert.competitorId
      if (!acc[competitorId]) {
        acc[competitorId] = {
          competitorId,
          alertCount: 0,
          severityBreakdown: { info: 0, warning: 0, urgent: 0, critical: 0 },
        }
      }
      acc[competitorId].alertCount++
      acc[competitorId].severityBreakdown[alert.severity as keyof typeof acc[typeof competitorId]['severityBreakdown']]++
      return acc
    }, {} as Record<number, any>)

    return NextResponse.json({
      message: resultMessage,
      operation,
      affectedCount: updatedAlerts.length,
      alertIds: updatedAlerts.map(a => a.id),
      competitorSummary: Object.values(competitorSummary),
      operationTimestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error performing bulk alert operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}