import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorAlerts, competitorProfiles, intelligenceData } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { z } from 'zod'
import { eq, and, desc, asc, gte, lte, inArray } from 'drizzle-orm'
import type { 
  AlertSeverity,
  ActionItem,
  Recommendation
} from '@/lib/competitor-intelligence-types'

// Validation schema for query parameters
const AlertQuerySchema = z.object({
  alertTypes: z.array(z.string()).optional(),
  severity: z.array(z.enum(['info', 'warning', 'urgent', 'critical'])).optional(),
  isRead: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  sortBy: z.enum(['createdAt', 'severity', 'alertType', 'acknowledgedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
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

    const competitorId = parseInt(params.id)
    if (isNaN(competitorId)) {
      return NextResponse.json({ error: 'Invalid competitor ID' }, { status: 400 })
    }

    // Verify competitor belongs to user
    const competitor = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, user.id)
        )
      )
      .limit(1)

    if (competitor.length === 0) {
      return NextResponse.json(
        { error: 'Competitor not found or access denied' },
        { status: 404 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    // Parse arrays from query string
    if (queryParams.alertTypes) {
      queryParams.alertTypes = queryParams.alertTypes.split(',')
    }
    if (queryParams.severity) {
      queryParams.severity = queryParams.severity.split(',')
    }
    
    // Parse booleans
    if (queryParams.isRead) {
      queryParams.isRead = queryParams.isRead === 'true'
    }
    if (queryParams.isArchived) {
      queryParams.isArchived = queryParams.isArchived === 'true'
    }
    
    // Parse date range
    if (queryParams.startDate && queryParams.endDate) {
      queryParams.dateRange = {
        start: queryParams.startDate,
        end: queryParams.endDate,
      }
      delete queryParams.startDate
      delete queryParams.endDate
    }
    
    // Convert string numbers to numbers
    if (queryParams.page) queryParams.page = parseInt(queryParams.page as string)
    if (queryParams.limit) queryParams.limit = parseInt(queryParams.limit as string)

    const filters = AlertQuerySchema.parse(queryParams)

    // Build query conditions
    const conditions = [
      eq(competitorAlerts.competitor_id, competitorId),
      eq(competitorAlerts.user_id, user.id)
    ]

    if (filters.alertTypes && filters.alertTypes.length > 0) {
      conditions.push(inArray(competitorAlerts.alert_type, filters.alertTypes))
    }

    if (filters.severity && filters.severity.length > 0) {
      conditions.push(inArray(competitorAlerts.severity, filters.severity))
    }

    if (filters.isRead !== undefined) {
      conditions.push(eq(competitorAlerts.is_read, filters.isRead))
    }

    if (filters.isArchived !== undefined) {
      conditions.push(eq(competitorAlerts.is_archived, filters.isArchived))
    }

    if (filters.dateRange) {
      conditions.push(
        and(
          gte(competitorAlerts.created_at, new Date(filters.dateRange.start)),
          lte(competitorAlerts.created_at, new Date(filters.dateRange.end))
        )!
      )
    }

    // Build sort order
    let orderBy
    switch (filters.sortBy) {
      case 'severity':
        orderBy = filters.sortOrder === 'asc' ? asc(competitorAlerts.severity) : desc(competitorAlerts.severity)
        break
      case 'alertType':
        orderBy = filters.sortOrder === 'asc' ? asc(competitorAlerts.alert_type) : desc(competitorAlerts.alert_type)
        break
      case 'acknowledgedAt':
        orderBy = filters.sortOrder === 'asc' ? asc(competitorAlerts.acknowledged_at) : desc(competitorAlerts.acknowledged_at)
        break
      default:
        orderBy = filters.sortOrder === 'asc' ? asc(competitorAlerts.created_at) : desc(competitorAlerts.created_at)
    }

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: competitorAlerts.id })
      .from(competitorAlerts)
      .where(and(...conditions))

    // Get paginated results with intelligence info
    const offset = (filters.page - 1) * filters.limit
    const alerts = await db
      .select({
        alert: competitorAlerts,
        intelligence: {
          id: intelligenceData.id,
          sourceType: intelligenceData.source_type,
          dataType: intelligenceData.data_type,
          sourceUrl: intelligenceData.source_url,
        }
      })
      .from(competitorAlerts)
      .leftJoin(intelligenceData, eq(competitorAlerts.intelligence_id, intelligenceData.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(filters.limit)
      .offset(offset)

    // Transform database results to match interface
    const transformedAlerts = alerts.map(item => ({
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
      intelligence: item.intelligence ? {
        id: item.intelligence.id,
        sourceType: item.intelligence.sourceType,
        dataType: item.intelligence.dataType,
        sourceUrl: item.intelligence.sourceUrl || undefined,
      } : undefined,
    }))

    // Get alert summary stats for this competitor
    const summaryStats = await db
      .select({
        severity: competitorAlerts.severity,
        alertType: competitorAlerts.alert_type,
        isRead: competitorAlerts.is_read,
        isArchived: competitorAlerts.is_archived,
      })
      .from(competitorAlerts)
      .where(
        and(
          eq(competitorAlerts.competitor_id, competitorId),
          eq(competitorAlerts.user_id, user.id)
        )
      )

    // Calculate summary statistics
    const summary = {
      total: summaryStats.length,
      unread: summaryStats.filter(s => !s.isRead).length,
      archived: summaryStats.filter(s => s.isArchived).length,
      bySeverity: summaryStats.reduce((acc, item) => {
        acc[item.severity] = (acc[item.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      byType: summaryStats.reduce((acc, item) => {
        acc[item.alertType] = (acc[item.alertType] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      criticalUnread: summaryStats.filter(s => !s.isRead && s.severity === 'critical').length,
      urgentUnread: summaryStats.filter(s => !s.isRead && s.severity === 'urgent').length,
    }

    return NextResponse.json({
      competitor: {
        id: competitor[0].id,
        name: competitor[0].name,
        domain: competitor[0].domain,
        threatLevel: competitor[0].threat_level,
      },
      alerts: transformedAlerts,
      summary,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: totalCountResult.length,
        totalPages: Math.ceil(totalCountResult.length / filters.limit),
      },
    })
  } catch (error) {
    console.error('Error fetching competitor alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitor alerts' },
      { status: 500 }
    )
  }
}