import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorAlerts, competitorProfiles, intelligenceData } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import type { 
  AlertSeverity,
  ActionItem,
  Recommendation
} from '@/lib/competitor-intelligence-types'

// Validation schema for alert updates
const AlertUpdateSchema = z.object({
  alertType: z.string().min(1).max(100).optional(),
  severity: z.enum(['info', 'warning', 'urgent', 'critical']).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  sourceData: z.record(z.any()).optional(),
  actionItems: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    estimatedEffort: z.string(),
    potentialImpact: z.string(),
    recommendedBy: z.string(),
    dueDate: z.string().datetime().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']).default('pending'),
  })).optional(),
  recommendedActions: z.array(z.object({
    id: z.string(),
    type: z.enum(['defensive', 'offensive', 'monitoring', 'strategic']),
    title: z.string(),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    estimatedEffort: z.string(),
    potentialImpact: z.string(),
    timeline: z.string(),
    actionItems: z.array(z.string()).default([]),
  })).optional(),
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alertId = parseInt(params.id)
    if (isNaN(alertId)) {
      return NextResponse.json({ error: 'Invalid alert ID' }, { status: 400 })
    }

    // Get alert with competitor and intelligence info
    const alert = await db
      .select({
        alert: competitorAlerts,
        competitor: {
          id: competitorProfiles.id,
          name: competitorProfiles.name,
          domain: competitorProfiles.domain,
          threatLevel: competitorProfiles.threat_level,
        },
        intelligence: {
          id: intelligenceData.id,
          sourceType: intelligenceData.source_type,
          dataType: intelligenceData.data_type,
          sourceUrl: intelligenceData.source_url,
        }
      })
      .from(competitorAlerts)
      .leftJoin(competitorProfiles, eq(competitorAlerts.competitor_id, competitorProfiles.id))
      .leftJoin(intelligenceData, eq(competitorAlerts.intelligence_id, intelligenceData.id))
      .where(
        and(
          eq(competitorAlerts.id, alertId),
          eq(competitorAlerts.user_id, user.id)
        )
      )
      .limit(1)

    if (alert.length === 0) {
      return NextResponse.json(
        { error: 'Alert not found or access denied' },
        { status: 404 }
      )
    }

    const item = alert[0]

    // Transform database result to match interface
    const transformedAlert = {
      id: item.alert.id,
      competitorId: item.alert.competitor_id,
      userId: item.alert.user_id,
      intelligenceId: item.alert.intelligence_id || undefined,
      alertType: item.alert.alert_type,
      severity: item.alert.severity as AlertSeverity,
      title: item.alert.title,
      description: item.alert.description || undefined,
      sourceData: (item.alert.source_data as Record<string, any>) || {},
      actionItems: (item.alert.action_items as ActionItem[]) || [],
      recommendedActions: (item.alert.recommended_actions as Recommendation[]) || [],
      isRead: item.alert.is_read,
      isArchived: item.alert.is_archived,
      acknowledgedAt: item.alert.acknowledged_at || undefined,
      createdAt: item.alert.created_at!,
      updatedAt: item.alert.updated_at!,
    }

    return NextResponse.json({
      alert: transformedAlert,
      competitor: item.competitor ? {
        id: item.competitor.id,
        name: item.competitor.name,
        domain: item.competitor.domain || undefined,
        threatLevel: item.competitor.threatLevel as any,
      } : undefined,
      intelligence: item.intelligence ? {
        id: item.intelligence.id,
        sourceType: item.intelligence.sourceType,
        dataType: item.intelligence.dataType,
        sourceUrl: item.intelligence.sourceUrl || undefined,
      } : undefined,
    })
  } catch (error) {
    console.error('Error fetching alert:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alert' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alertId = parseInt(params.id)
    if (isNaN(alertId)) {
      return NextResponse.json({ error: 'Invalid alert ID' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = AlertUpdateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

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

    // Build update object
    const updateData: any = {
      updated_at: new Date(),
    }

    if (data.alertType !== undefined) updateData.alert_type = data.alertType
    if (data.severity !== undefined) updateData.severity = data.severity
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.sourceData !== undefined) updateData.source_data = data.sourceData
    if (data.actionItems !== undefined) updateData.action_items = data.actionItems
    if (data.recommendedActions !== undefined) updateData.recommended_actions = data.recommendedActions
    if (data.isRead !== undefined) updateData.is_read = data.isRead
    if (data.isArchived !== undefined) updateData.is_archived = data.isArchived

    // Update alert
    const [updatedAlert] = await db
      .update(competitorAlerts)
      .set(updateData)
      .where(eq(competitorAlerts.id, alertId))
      .returning()

    // Get competitor and intelligence info
    const competitor = await db
      .select({
        id: competitorProfiles.id,
        name: competitorProfiles.name,
        domain: competitorProfiles.domain,
        threatLevel: competitorProfiles.threat_level,
      })
      .from(competitorProfiles)
      .where(eq(competitorProfiles.id, updatedAlert.competitor_id))
      .limit(1)

    let intelligence = null
    if (updatedAlert.intelligence_id) {
      const intelligenceResult = await db
        .select({
          id: intelligenceData.id,
          sourceType: intelligenceData.source_type,
          dataType: intelligenceData.data_type,
          sourceUrl: intelligenceData.source_url,
        })
        .from(intelligenceData)
        .where(eq(intelligenceData.id, updatedAlert.intelligence_id))
        .limit(1)
      
      intelligence = intelligenceResult.length > 0 ? intelligenceResult[0] : null
    }

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
      alert: transformedAlert,
      competitor: competitor.length > 0 ? {
        id: competitor[0].id,
        name: competitor[0].name,
        domain: competitor[0].domain || undefined,
        threatLevel: competitor[0].threatLevel as any,
      } : undefined,
      intelligence: intelligence ? {
        id: intelligence.id,
        sourceType: intelligence.sourceType,
        dataType: intelligence.dataType,
        sourceUrl: intelligence.sourceUrl || undefined,
      } : undefined,
    })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Delete alert
    await db
      .delete(competitorAlerts)
      .where(eq(competitorAlerts.id, alertId))

    return NextResponse.json({
      message: 'Alert deleted successfully',
      deletedId: alertId,
    })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}