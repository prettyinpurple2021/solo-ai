import { logError, logWarn, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { predictiveAnalytics, type UserAnalyticsData, type BusinessAnalyticsData, type BusinessTrendPoint, type PredictiveInsight } from '@/lib/predictive-analytics'
import { getDb } from '@/lib/database-client'
import { users, tasks, goals, chatConversations, chatMessages, focusSessions, userSessions } from '@/db/schema'
import { eq, gte, lte, desc, count, and, not, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe'

// Stripe types and some libs require Node.js built-ins; run on Node runtime
export const runtime = 'nodejs'


// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schemas
const InsightRequestSchema = z.object({
  timeframe: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  categories: z.array(z.enum(['productivity', 'engagement', 'performance', 'business', 'user_behavior'])).optional(),
  includeForecast: z.boolean().default(true),
  includeAnomalies: z.boolean().default(true)
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 50, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'
    const categories = searchParams.get('categories')?.split(',') || []
    const includeForecast = searchParams.get('includeForecast') !== 'false'
    const includeAnomalies = searchParams.get('includeAnomalies') !== 'false'

    // Validate parameters
    const validatedParams = InsightRequestSchema.parse({
      timeframe,
      categories,
      includeForecast,
      includeAnomalies
    })

    const db = getDb()
    const userId = user.id

    // Calculate timeframe date
    const now = new Date()
    const timeframeDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[validatedParams.timeframe]

    const startDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000)

    // Gather user data for analysis
    const [{ analytics: userAnalytics, recentTasks }, businessAnalytics] = await Promise.all([
      gatherUserData(db, userId, startDate, now, timeframeDays),
      gatherBusinessData(db, startDate, now, timeframeDays)
    ])

    // Generate predictive insights
    const insights = await predictiveAnalytics.generateInsights(userAnalytics, businessAnalytics)

    // Filter insights by category if specified
    const filteredInsights = validatedParams.categories && validatedParams.categories.length > 0
      ? insights.filter(insight => validatedParams.categories!.includes(insight.category))
      : insights

    // Sort by priority and confidence
    const sortedInsights = filteredInsights.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      return b.confidence - a.confidence
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = {
      success: true,
      data: {
        insights: sortedInsights,
        summary: {
          total: sortedInsights.length,
          byCategory: groupInsightsByCategory(sortedInsights),
          byImpact: groupInsightsByImpact(sortedInsights),
          actionable: sortedInsights.filter(i => i.actionable).length,
          highPriority: sortedInsights.filter(i => i.priority >= 7).length,
          timeframeDays,
          activeUsers: businessAnalytics.activeUsers,
          paidUsers: businessAnalytics.paidUsers
        },
        context: {
          timeframe: validatedParams.timeframe,
          userAnalytics,
          businessAnalytics,
          recentTasks
        }
      }
    }

    // Add forecast if requested
    if (validatedParams.includeForecast) {
      try {
        response.data.forecast = await predictiveAnalytics.generateBusinessForecast(validatedParams.timeframe, businessAnalytics)
      } catch (error) {
        logWarn('Failed to generate forecast:', error)
      }
    }

    // Add anomalies if requested
    if (validatedParams.includeAnomalies) {
      try {
        const anomalyData = [
          {
            name: 'task_completion_rate',
            type: 'user_behavior' as const,
            currentValue: userAnalytics.taskCompletionRate,
            historicalData: userAnalytics.taskCompletionHistory
          },
          {
            name: 'session_duration_minutes',
            type: 'performance' as const,
            currentValue: userAnalytics.avgSessionDurationMinutes,
            historicalData: userAnalytics.sessionDurationHistory
          },
          {
            name: 'ai_interactions',
            type: 'user_behavior' as const,
            currentValue: userAnalytics.aiMessagesCount,
            historicalData: userAnalytics.aiInteractionHistory
          }
        ]

        response.data.anomalies = await predictiveAnalytics.detectAnomalies(anomalyData)
      } catch (error) {
        logWarn('Failed to detect anomalies:', error)
      }
    }

    logInfo(`Generated ${sortedInsights.length} predictive insights for user ${userId}`)
    return NextResponse.json(response)

  } catch (error) {
    logError('Error generating predictive insights:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { error: 'Invalid parameters', details: (error as any).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Gather comprehensive user data for analysis
 */
async function gatherUserData(
  db: ReturnType<typeof getDb>,
  userId: string,
  startDate: Date,
  endDate: Date,
  timeframeDays: number
): Promise<{ analytics: UserAnalyticsData; recentTasks: Array<{ id: number; title: string; status: string; createdAt: string; completedAt: string | null }> }> {
  try {
    const taskRows = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        createdAt: tasks.created_at,
        completedAt: tasks.completed_at
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.user_id, userId),
          gte(tasks.created_at, startDate),
          lte(tasks.created_at, endDate)
        )
      )
      .orderBy(desc(tasks.created_at))

    const goalRows = await db
      .select({
        id: goals.id,
        status: goals.status,
        createdAt: goals.created_at,
        completedAt: goals.completed_at
      })
      .from(goals)
      .where(
        and(
          eq(goals.user_id, userId),
          gte(goals.created_at, startDate),
          lte(goals.created_at, endDate)
        )
      )
      .orderBy(desc(goals.created_at))

    const focusSessionRows = await db
      .select({
        id: focusSessions.id,
        startedAt: focusSessions.started_at,
        endedAt: focusSessions.ended_at,
        durationMinutes: focusSessions.duration_minutes
      })
      .from(focusSessions)
      .where(
        and(
          eq(focusSessions.user_id, userId),
          gte(focusSessions.started_at, startDate),
          lte(focusSessions.started_at, endDate)
        )
      )
      .orderBy(desc(focusSessions.started_at))

    const conversationRows = await db
      .select({
        id: chatConversations.id,
        createdAt: chatConversations.created_at,
        messageCount: chatConversations.message_count
      })
      .from(chatConversations)
      .where(
        and(
          eq(chatConversations.user_id, userId),
          gte(chatConversations.created_at, startDate),
          lte(chatConversations.created_at, endDate)
        )
      )
      .orderBy(desc(chatConversations.created_at))

    const messageRows = await db
      .select({
        id: chatMessages.id,
        createdAt: chatMessages.created_at
      })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.user_id, userId),
          gte(chatMessages.created_at, startDate),
          lte(chatMessages.created_at, endDate)
        )
      )

    const sessionRows = await db
      .select({
        id: userSessions.id,
        lastActivity: userSessions.last_activity,
        createdAt: userSessions.created_at
      })
      .from(userSessions)
      .where(eq(userSessions.user_id, userId))

    const dayKeys = buildDayKeys(startDate, endDate)
    const activeDaySet = new Set<string>()

    const tasksCompleted = taskRows.filter(task => task.status === 'completed').length
    const taskCompletionRate = taskRows.length > 0 ? (tasksCompleted / taskRows.length) * 100 : 0

    const goalsCompleted = goalRows.filter(goal => goal.status === 'completed').length
    const goalCompletionRate = goalRows.length > 0 ? (goalsCompleted / goalRows.length) * 100 : 0

    const totalFocusMinutes = focusSessionRows.reduce((sum, session) => {
      const duration = session.durationMinutes ?? computeDurationMinutes(session.startedAt, session.endedAt)
      const dateKey = session.startedAt ? formatDateKey(session.startedAt) : null
      if (dateKey) {
        activeDaySet.add(dateKey)
      }
      return sum + duration
    }, 0)

    const averageSessionDuration = focusSessionRows.length > 0 ? totalFocusMinutes / focusSessionRows.length : 0

    taskRows.forEach(task => {
      const createdKey = formatDateKey(task.createdAt)
      if (createdKey) {
        activeDaySet.add(createdKey)
      }
      const completedKey = task.completedAt ? formatDateKey(task.completedAt) : null
      if (completedKey) {
        activeDaySet.add(completedKey)
      }
    })

    goalRows.forEach(goal => {
      const createdKey = formatDateKey(goal.createdAt)
      if (createdKey) {
        activeDaySet.add(createdKey)
      }
      const completedKey = goal.completedAt ? formatDateKey(goal.completedAt) : null
      if (completedKey) {
        activeDaySet.add(completedKey)
      }
    })

    messageRows.forEach(message => {
      const dateKey = formatDateKey(message.createdAt)
      if (dateKey) {
        activeDaySet.add(dateKey)
      }
    })

    const loginEvents = sessionRows.filter(session => {
      if (!session.lastActivity) return false
      return session.lastActivity >= startDate && session.lastActivity <= endDate
    })

    const loginFrequencyPerWeek = timeframeDays > 0 ? (loginEvents.length / timeframeDays) * 7 : 0
    const sessionFrequencyPerWeek = timeframeDays > 0 ? (focusSessionRows.length / timeframeDays) * 7 : 0

    const taskCompletionHistory = buildDailyCountSeries(dayKeys, taskRows, task => {
      const key = task.completedAt ? formatDateKey(task.completedAt) : null
      if (!key) return null
      return { key, value: 1 }
    })

    const sessionDurationHistory = buildDailyAverageSeries(dayKeys, focusSessionRows, session => {
      const key = session.startedAt ? formatDateKey(session.startedAt) : null
      if (!key) return null
      const duration = session.durationMinutes ?? computeDurationMinutes(session.startedAt, session.endedAt)
      return { key, value: duration }
    })

    const aiInteractionHistory = buildDailyCountSeries(dayKeys, messageRows, message => {
      const key = formatDateKey(message.createdAt)
      if (!key) return null
      return { key, value: 1 }
    })

    const featureUsage: Record<string, number> = {
      ai_chat: conversationRows.length,
      task_management: taskRows.length,
      goal_tracking: goalRows.length,
      focus_mode: focusSessionRows.length
    }

    const peakHours = computePeakHours(focusSessionRows.map(session => session.startedAt).filter(Boolean) as Date[])

    const recentTasks = taskRows
      .filter(task => task.createdAt !== null)
      .slice(0, 10)
      .map(task => ({
        id: task.id,
        title: task.title,
        status: task.status || 'pending',
        createdAt: task.createdAt!.toISOString(),
        completedAt: task.completedAt ? task.completedAt.toISOString() : null
      }))

    const analytics: UserAnalyticsData = {
      userId,
      timeframeDays,
      tasksTotal: taskRows.length,
      tasksCompleted,
      taskCompletionRate,
      goalsTotal: goalRows.length,
      goalsCompleted,
      goalCompletionRate,
      focusSessionsCount: focusSessionRows.length,
      totalFocusMinutes,
      avgSessionDurationMinutes: averageSessionDuration,
      aiConversationsCount: conversationRows.length,
      aiMessagesCount: messageRows.length,
      loginFrequencyPerWeek,
      sessionFrequencyPerWeek,
      engagementScore: computeEngagementScore({
        taskCompletionRate,
        goalCompletionRate,
        sessionFrequencyPerWeek,
        avgSessionDurationMinutes: averageSessionDuration,
        aiMessagesPerDay: timeframeDays > 0 ? messageRows.length / timeframeDays : 0
      }),
      interactionDepth: conversationRows.reduce((sum, conv) => sum + (conv.messageCount ?? 0), 0),
      featureUsage,
      sessionPatterns: {
        peakHours,
        averageSessionLengthMinutes: averageSessionDuration,
        sessionsPerWeek: sessionFrequencyPerWeek
      },
      taskCompletionHistory,
      sessionDurationHistory,
      aiInteractionHistory,
      activeDays: activeDaySet.size,
      lastLoginAt: loginEvents.length > 0
        ? loginEvents
          .map(event => event.lastActivity)
          .filter((value): value is Date => Boolean(value))
          .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
        : null
    }

    return { analytics, recentTasks }
  } catch (error) {
    logError('Error gathering user data:', error)
    throw error
  }
}

/**
 * Gather business-level data for analysis
 */
async function gatherBusinessData(
  db: ReturnType<typeof getDb>,
  startDate: Date,
  endDate: Date,
  timeframeDays: number
): Promise<BusinessAnalyticsData> {
  try {
    const historyWindowDays = Math.max(timeframeDays, 30)
    const historyStart = new Date(endDate.getTime() - historyWindowDays * 24 * 60 * 60 * 1000)

    const [
      totalUsersResult,
      activeUsersResult,
      paidUsersRecords,
      churnedUsersResult,
      newUsersHistoryRows,
      tasksHistory,
      goalsHistory,
      messagesHistory,
      focusHistory
    ] = await Promise.all([
      db.select({ value: count() }).from(users),
      db
        .select({ value: count() })
        .from(users)
        .where(eq(users.subscription_status, 'active')),
      db
        .select({
          subscriptionTier: users.subscription_tier,
          subscriptionStatus: users.subscription_status,
          createdAt: users.created_at
        })
        .from(users)
        .where(not(isNull(users.subscription_tier))),
      db
        .select({ value: count() })
        .from(users)
        .where(
          and(
            not(eq(users.subscription_status, 'active')),
            gte(users.updated_at, startDate),
            lte(users.updated_at, endDate)
          )
        ),
      db
        .select({
          id: users.id,
          createdAt: users.created_at,
          subscriptionTier: users.subscription_tier
        })
        .from(users)
        .where(
          and(
            gte(users.created_at, historyStart),
            lte(users.created_at, endDate)
          )
        ),
      db
        .select({
          userId: tasks.user_id,
          status: tasks.status,
          createdAt: tasks.created_at,
          completedAt: tasks.completed_at
        })
        .from(tasks)
        .where(
          and(
            gte(tasks.created_at, historyStart),
            lte(tasks.created_at, endDate)
          )
        ),
      db
        .select({
          userId: goals.user_id,
          status: goals.status,
          createdAt: goals.created_at,
          completedAt: goals.completed_at
        })
        .from(goals)
        .where(
          and(
            gte(goals.created_at, historyStart),
            lte(goals.created_at, endDate)
          )
        ),
      db
        .select({
          userId: chatMessages.user_id,
          createdAt: chatMessages.created_at
        })
        .from(chatMessages)
        .where(
          and(
            gte(chatMessages.created_at, historyStart),
            lte(chatMessages.created_at, endDate)
          )
        ),
      db
        .select({
          userId: focusSessions.user_id,
          startedAt: focusSessions.started_at
        })
        .from(focusSessions)
        .where(
          and(
            gte(focusSessions.started_at, historyStart),
            lte(focusSessions.started_at, endDate)
          )
        )
    ])

    const totalUsers = totalUsersResult[0]?.value ?? 0
    const activeUsers = activeUsersResult[0]?.value ?? 0
    const churnedUsers = churnedUsersResult[0]?.value ?? 0

    const paidUserRecordsActive = paidUsersRecords.filter(record => {
      if (!record.subscriptionTier) return false
      const normalizedStatus = (record.subscriptionStatus || '').toLowerCase()
      if (!ACTIVE_SUBSCRIPTION_STATUSES.has(normalizedStatus)) return false
      return isPaidTier(record.subscriptionTier)
    })

    const paidUsersCount = paidUserRecordsActive.length
    const revenue30d = paidUserRecordsActive.reduce((sum, record) => {
      const tierPrice = resolveTierMonthlyPrice(record.subscriptionTier)
      return sum + tierPrice
    }, 0)

    const timeframeTasks = tasksHistory.filter(task => task.createdAt !== null && task.createdAt >= startDate && task.createdAt <= endDate)
    const timeframeGoals = goalsHistory.filter(goal => goal.createdAt !== null && goal.createdAt >= startDate && goal.createdAt <= endDate)
    const timeframeMessages = messagesHistory.filter(message => message.createdAt !== null && message.createdAt >= startDate && message.createdAt <= endDate)

    const tasksCompleted = timeframeTasks.filter(task => task.status === 'completed').length
    const taskCompletionRate = timeframeTasks.length > 0 ? (tasksCompleted / timeframeTasks.length) * 100 : 0

    const goalsCompleted = timeframeGoals.filter(goal => goal.status === 'completed').length
    const goalCompletionRate = timeframeGoals.length > 0 ? (goalsCompleted / timeframeGoals.length) * 100 : 0

    const activeUserIds = new Set<string>()
    timeframeTasks.forEach(task => activeUserIds.add(task.userId))
    timeframeGoals.forEach(goal => activeUserIds.add(goal.userId))
    timeframeMessages.forEach(message => activeUserIds.add(message.userId))
    focusHistory
      .filter(session => session.startedAt !== null && session.startedAt >= startDate && session.startedAt <= endDate)
      .forEach(session => activeUserIds.add(session.userId))

    const dayKeys = buildDayKeys(historyStart, endDate)
    const dailyStats = initializeDailyStats(dayKeys)

    newUsersHistoryRows.forEach(userRow => {
      const dayKey = formatDateKey(userRow.createdAt)
      if (!dayKey || !dailyStats.has(dayKey)) return
      const stats = dailyStats.get(dayKey)!
      stats.newUsers += 1
    })

    tasksHistory.forEach(task => {
      const creationKey = formatDateKey(task.createdAt)
      if (creationKey && dailyStats.has(creationKey)) {
        const stats = dailyStats.get(creationKey)!
        stats.activeUsers.add(task.userId)
        stats.tasksCreated += 1
      }

      const completionKey = task.completedAt ? formatDateKey(task.completedAt) : null
      if (task.status === 'completed' && completionKey && dailyStats.has(completionKey)) {
        const stats = dailyStats.get(completionKey)!
        stats.tasksCompleted += 1
        stats.activeUsers.add(task.userId)
      }
    })

    goalsHistory.forEach(goal => {
      const creationKey = formatDateKey(goal.createdAt)
      if (creationKey && dailyStats.has(creationKey)) {
        const stats = dailyStats.get(creationKey)!
        stats.activeUsers.add(goal.userId)
        stats.goalsCreated += 1
      }

      const completionKey = goal.completedAt ? formatDateKey(goal.completedAt) : null
      if (goal.status === 'completed' && completionKey && dailyStats.has(completionKey)) {
        const stats = dailyStats.get(completionKey)!
        stats.goalsCompleted += 1
        stats.activeUsers.add(goal.userId)
      }
    })

    messagesHistory.forEach(message => {
      const key = formatDateKey(message.createdAt)
      if (!key || !dailyStats.has(key)) return
      const stats = dailyStats.get(key)!
      stats.aiInteractions += 1
      stats.activeUsers.add(message.userId)
    })

    focusHistory.forEach(session => {
      const key = formatDateKey(session.startedAt)
      if (!key || !dailyStats.has(key)) return
      const stats = dailyStats.get(key)!
      stats.activeUsers.add(session.userId)
    })

    const averageDailyRevenue = paidUsersCount > 0 ? revenue30d / 30 : 0
    const historicalTrends: BusinessTrendPoint[] = dayKeys.map(dayKey => {
      const stats = dailyStats.get(dayKey)!
      const taskRate = stats.tasksCreated > 0 ? (stats.tasksCompleted / stats.tasksCreated) * 100 : 0
      const goalRate = stats.goalsCreated > 0 ? (stats.goalsCompleted / stats.goalsCreated) * 100 : 0

      return {
        periodStart: dayKey,
        activeUsers: stats.activeUsers.size,
        newUsers: stats.newUsers,
        paidUsers: paidUsersCount,
        estimatedRevenue: Number(averageDailyRevenue.toFixed(2)),
        taskCompletionRate: taskRate,
        goalCompletionRate: goalRate,
        aiInteractions: stats.aiInteractions
      }
    })

    return {
      timeframeDays,
      totalUsers,
      activeUsers,
      newUsers: newUsersHistoryRows.filter(row => row.createdAt !== null && row.createdAt >= startDate).length,
      paidUsers: paidUsersCount,
      churnRate: totalUsers > 0 ? (churnedUsers / totalUsers) * 100 : 0,
      conversionRate: totalUsers > 0 ? (paidUsersCount / totalUsers) * 100 : 0,
      revenue30d: Number(revenue30d.toFixed(2)),
      taskCompletionRate,
      goalCompletionRate,
      aiInteractions: timeframeMessages.length,
      historicalTrends
    }
  } catch (error) {
    logError('Error gathering business data:', error)
    throw error
  }
}

/**
 * Group insights by category
 */
function groupInsightsByCategory(insights: PredictiveInsight[]): Record<string, number> {
  return insights.reduce<Record<string, number>>((acc, insight) => {
    acc[insight.category] = (acc[insight.category] || 0) + 1
    return acc
  }, {})
}

/**
 * Group insights by impact
 */
function groupInsightsByImpact(insights: PredictiveInsight[]): Record<string, number> {
  return insights.reduce<Record<string, number>>((acc, insight) => {
    acc[insight.impact] = (acc[insight.impact] || 0) + 1
    return acc
  }, {})
}

/**
 * Helpers
 */

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due'])

function buildDayKeys(start: Date, end: Date): string[] {
  const keys: string[] = []
  const current = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()))
  const endDate = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()))

  while (current <= endDate) {
    keys.push(formatDateKey(current)!)
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return keys
}

function formatDateKey(date?: Date | null): string | null {
  if (!date) return null
  return date.toISOString().slice(0, 10)
}

function computeDurationMinutes(startedAt?: Date | null, endedAt?: Date | null): number {
  if (!startedAt) return 0
  if (!endedAt) return 0
  return Math.max(0, (endedAt.getTime() - startedAt.getTime()) / 60000)
}

function buildDailyCountSeries<T>(
  dayKeys: string[],
  rows: T[],
  mapper: (row: T) => { key: string; value: number } | null
): number[] {
  const counts = new Map<string, number>()
  dayKeys.forEach(key => counts.set(key, 0))

  rows.forEach(row => {
    const mapped = mapper(row)
    if (!mapped || !counts.has(mapped.key)) return
    counts.set(mapped.key, (counts.get(mapped.key) ?? 0) + mapped.value)
  })

  return dayKeys.map(key => counts.get(key) ?? 0)
}

function buildDailyAverageSeries<T>(
  dayKeys: string[],
  rows: T[],
  mapper: (row: T) => { key: string; value: number } | null
): number[] {
  const totals = new Map<string, { sum: number; count: number }>()

  dayKeys.forEach(key => totals.set(key, { sum: 0, count: 0 }))

  rows.forEach(row => {
    const mapped = mapper(row)
    if (!mapped || !totals.has(mapped.key)) return
    const entry = totals.get(mapped.key)!
    entry.sum += mapped.value
    entry.count += 1
  })

  return dayKeys.map(key => {
    const entry = totals.get(key)!
    return entry.count > 0 ? entry.sum / entry.count : 0
  })
}

function computePeakHours(dates: Date[]): number[] {
  const counts = new Map<number, number>()

  dates.forEach(date => {
    const hour = date.getUTCHours()
    counts.set(hour, (counts.get(hour) ?? 0) + 1)
  })

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([hour]) => hour)
}

function computeEngagementScore(params: {
  taskCompletionRate: number
  goalCompletionRate: number
  sessionFrequencyPerWeek: number
  avgSessionDurationMinutes: number
  aiMessagesPerDay: number
}): number {
  const taskScore = clamp(params.taskCompletionRate, 0, 100) * 0.25
  const goalScore = clamp(params.goalCompletionRate, 0, 100) * 0.2
  const sessionScore = clamp(params.sessionFrequencyPerWeek * 10, 0, 25)
  const durationScore = clamp(params.avgSessionDurationMinutes / 5, 0, 20)
  const aiScore = clamp(params.aiMessagesPerDay * 5, 0, 20)

  return clamp(taskScore + goalScore + sessionScore + durationScore + aiScore, 0, 100)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function isPaidTier(tier?: string | null): boolean {
  if (!tier) return false
  const normalized = tier.toLowerCase()
  return normalized !== 'launch'
}

function resolveTierMonthlyPrice(tier?: string | null): number {
  if (!tier) return 0
  const normalized = tier.toLowerCase()
  const match = Object.values(SUBSCRIPTION_TIERS).find(entry => entry.id === normalized)
  return match?.price ?? 0
}

function initializeDailyStats(dayKeys: string[]): Map<string, {
  activeUsers: Set<string>
  newUsers: number
  tasksCreated: number
  tasksCompleted: number
  goalsCreated: number
  goalsCompleted: number
  aiInteractions: number
}> {
  const map = new Map<string, {
    activeUsers: Set<string>
    newUsers: number
    tasksCreated: number
    tasksCompleted: number
    goalsCreated: number
    goalsCompleted: number
    aiInteractions: number
  }>()

  dayKeys.forEach(key => {
    map.set(key, {
      activeUsers: new Set<string>(),
      newUsers: 0,
      tasksCreated: 0,
      tasksCompleted: 0,
      goalsCreated: 0,
      goalsCompleted: 0,
      aiInteractions: 0
    })
  })

  return map
}
