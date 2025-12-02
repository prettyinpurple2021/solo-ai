import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { competitorAlerts, competitorProfiles, intelligenceData } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, desc, asc, gte, lte, inArray } from 'drizzle-orm'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'

import type {
  AlertSeverity,
  ActionItem,
  Recommendation
} from '@/lib/competitor-intelligence-types'


// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schemas
const AlertCreateSchema = z.object({
  competitorId: z.number().int().positive(),
  intelligenceId: z.number().int().positive().optional(),
  alertType: z.string().min(1).max(100),
  severity: z.enum(['info', 'warning', 'urgent', 'critical']).default('info'),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  sourceData: z.record(z.string(), z.any()).default({}),
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
  })).default([]),
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
  })).default([]),
})

const AlertFiltersSchema = z.object({
  competitorIds: z.array(z.number().int().positive()).optional(),
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

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())

    // Parse parameters into correct types for schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedParams: any = { ...queryParams }

    // Parse arrays from query string
    if (parsedParams.competitorIds) {
      parsedParams.competitorIds = parsedParams.competitorIds
        .split(',')
        .map((id: string) => parseInt(id, 10))
        .filter((id: number) => Number.isInteger(id) && id > 0)
    }
    if (parsedParams.alertTypes) {
      parsedParams.alertTypes = parsedParams.alertTypes.split(',')
    }
    if (parsedParams.severity) {
      parsedParams.severity = parsedParams.severity.split(',')
    }

    // Parse booleans
    if (parsedParams.isRead) {
      parsedParams.isRead = parsedParams.isRead === 'true'
    }
    if (parsedParams.isArchived) {
      parsedParams.isArchived = parsedParams.isArchived === 'true'
    }

    // Parse date range
    if (parsedParams.startDate && parsedParams.endDate) {
      parsedParams.dateRange = {
        start: parsedParams.startDate,
        end: parsedParams.endDate,
      }
      delete parsedParams.startDate
      delete parsedParams.endDate
    }

    // Convert string numbers to numbers
    if (parsedParams.page) parsedParams.page = parseInt(parsedParams.page as string)
    if (parsedParams.limit) parsedParams.limit = parseInt(parsedParams.limit as string)

    const filters = AlertFiltersSchema.parse(parsedParams)

    // Build query conditions
    const conditions = [eq(competitorAlerts.user_id, user.id)]

    if (filters.competitorIds && filters.competitorIds.length > 0) {
      conditions.push(inArray(competitorAlerts.competitor_id, filters.competitorIds))
    }

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
        // Custom severity ordering: critical > urgent > warning > info
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

    // Get paginated results with competitor and intelligence info
    const offset = (filters.page - 1) * filters.limit
    const alerts = await db
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sourceData: (item.alert.source_data as Record<string, any>) || {},
      actionItems: (item.alert.action_items as ActionItem[]) || [],
      recommendedActions: (item.alert.recommended_actions as Recommendation[]) || [],
      isRead: item.alert.is_read,
      isArchived: item.alert.is_archived,
      acknowledgedAt: item.alert.acknowledged_at || undefined,
      createdAt: item.alert.created_at!,
      updatedAt: item.alert.updated_at!,
      competitor: item.competitor ? {
        id: item.competitor.id,
        name: item.competitor.name,
        domain: item.competitor.domain || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        threatLevel: item.competitor.threatLevel as any,
      } : undefined,
      intelligence: item.intelligence ? {
        id: item.intelligence.id,
        sourceType: item.intelligence.sourceType,
        dataType: item.intelligence.dataType,
        sourceUrl: item.intelligence.sourceUrl || undefined,
      } : undefined,
    }))

    // Get summary statistics
    const summaryStats = await db
      .select({
        severity: competitorAlerts.severity,
        alertType: competitorAlerts.alert_type,
        isRead: competitorAlerts.is_read,
        isArchived: competitorAlerts.is_archived,
      })
      .from(competitorAlerts)
      .where(eq(competitorAlerts.user_id, user.id))

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
    }

    return NextResponse.json({
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
    logError('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('alerts:create', ip, 60_000, 30)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = AlertCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Verify competitor belongs to user
    const competitor = await db
      .select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, data.competitorId),
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

    // Verify intelligence entry belongs to user if provided
    if (data.intelligenceId) {
      const intelligence = await db
        .select()
        .from(intelligenceData)
        .where(
          and(
            eq(intelligenceData.id, data.intelligenceId),
            eq(intelligenceData.user_id, user.id),
            eq(intelligenceData.competitor_id, data.competitorId)
          )
        )
        .limit(1)

      if (intelligence.length === 0) {
        return NextResponse.json(
          { error: 'Intelligence entry not found or access denied' },
          { status: 404 }
        )
      }
    }

    // Create alert
    const [newAlert] = await db
      .insert(competitorAlerts)
      .values({
        competitor_id: data.competitorId,
        user_id: user.id,
        intelligence_id: data.intelligenceId || null,
        alert_type: data.alertType,
        severity: data.severity,
        title: data.title,
        description: data.description || null,
        source_data: data.sourceData,
        action_items: data.actionItems,
        recommended_actions: data.recommendedActions,
      })
      .returning()

    // Get competitor info for response
    const competitorInfo = competitor[0]

    // Transform result to match interface
    const transformedAlert = {
      id: newAlert.id,
      competitorId: newAlert.competitor_id,
      userId: newAlert.user_id,
      intelligenceId: newAlert.intelligence_id || undefined,
      alertType: newAlert.alert_type,
      severity: newAlert.severity as AlertSeverity,
      title: newAlert.title,
      description: newAlert.description || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sourceData: (newAlert.source_data as Record<string, any>) || {},
      actionItems: (newAlert.action_items as ActionItem[]) || [],
      recommendedActions: (newAlert.recommended_actions as Recommendation[]) || [],
      isRead: newAlert.is_read,
      isArchived: newAlert.is_archived,
      acknowledgedAt: newAlert.acknowledged_at || undefined,
      createdAt: newAlert.created_at!,
      updatedAt: newAlert.updated_at!,
    }

    return NextResponse.json(
      {
        alert: transformedAlert,
        competitor: {
          id: competitorInfo.id,
          name: competitorInfo.name,
          domain: competitorInfo.domain,
          threatLevel: competitorInfo.threat_level,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    logError('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}