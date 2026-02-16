import { logInfo, logError } from '@/lib/logger'
import { NextRequest } from 'next/server'
import { db } from '@/db'
import { analyticsEvents, users, paymentProviderConnections } from '@/shared/db/schema'
import { desc, eq, sql, and, gte, isNotNull } from 'drizzle-orm'
import { RevenueTrackingService } from './revenue-tracking'
import { getRedisClient } from './upstash/clients'

const REVENUE_WINDOW_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000
const CHURN_RATE_THRESHOLD = 5
const METRICS_CACHE_TTL = 300 // 5 minutes in seconds

// Analytics event types
export type AnalyticsEvent =
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  | 'page_view'
  | 'ai_agent_interaction'
  | 'goal_created'
  | 'goal_completed'
  | 'task_created'
  | 'task_completed'
  | 'file_uploaded'
  | 'template_saved'
  | 'dashboard_viewed'
  | 'feature_used'
  | 'error_occurred'
  | 'performance_metric'

export interface AnalyticsEventData {
  event: AnalyticsEvent
  userId?: string
  sessionId?: string
  timestamp: Date
  properties: Record<string, any>
  metadata?: {
    userAgent?: string
    ip?: string
    referrer?: string
    url?: string
  }
}

export interface UserMetrics {
  userId: string
  totalSessions: number
  totalPageViews: number
  totalAIInteractions: number
  goalsCreated: number
  goalsCompleted: number
  tasksCreated: number
  tasksCompleted: number
  filesUploaded: number
  templatesSaved: number
  lastActiveAt: Date
  firstSeenAt: Date
  averageSessionDuration: number
  retentionScore: number
  revenue: number
  mrr: number
}

export interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  errorRate: number
  uptime: number
  memoryUsage: number
  cpuUsage: number
  databaseQueryTime: number
}

export interface BusinessMetrics {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  userRetentionRate: number
  featureAdoptionRate: Record<string, number>
  conversionRate: number
  churnRate: number
  revenue: number
  mrr: number
}

class AnalyticsService {
  /**
   * Track an analytics event
   */
  async trackEvent(
    event: AnalyticsEvent,
    properties: Record<string, any> = {},
    request?: NextRequest
  ): Promise<void> {
    const metadata = request ? {
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      referrer: request.headers.get('referer') || undefined,
      url: request.url
    } : undefined

    try {
      await db.insert(analyticsEvents).values({
        user_id: properties.userId,
        event,
        properties,
        metadata,
        session_id: properties.sessionId,
        timestamp: new Date()
      })

      // Invalidate user metrics cache
      if (properties.userId) {
        const redis = getRedisClient();
        await redis.del(`metrics:user:${properties.userId}`).catch(() => {});
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        logInfo('📊 Analytics Event', { event, properties })
      }
    } catch (error) {
      logError('Failed to track analytics event:', error)
    }
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(metrics: Partial<PerformanceMetrics>): Promise<void> {
    await this.trackEvent('performance_metric', metrics)
  }

  /**
   * Get user metrics
   * Optimized with Redis caching and real logic for session duration and retention
   */
  async getUserMetrics(userId: string): Promise<UserMetrics | null> {
    const redis = getRedisClient();
    const cacheKey = `metrics:user:${userId}`;

    try {
      const cached = await redis.get<UserMetrics>(cacheKey);
      if (cached) return cached;
    } catch (e) {
      logError('Redis cache hit failed', e);
    }

    try {
      // 1. Fetch aggregate event counts
      const eventCounts = await db.select({
        event: analyticsEvents.event,
        count: sql<number>`count(*)`
      })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.user_id, userId))
      .groupBy(analyticsEvents.event);

      if (eventCounts.length === 0) return null;

      const countsMap = new Map(eventCounts.map(e => [e.event, Number(e.count)]));

      // 2. Fetch session and activity timing
      // We use a subquery to calculate durations per session, then average them
      const timingResult = await db.select({
        firstSeen: sql<Date>`min(${analyticsEvents.timestamp})`,
        lastActive: sql<Date>`max(${analyticsEvents.timestamp})`,
        avgSessionDuration: sql<number>`
          avg(
            extract(epoch from (max_ts - min_ts))
          )
        `
      })
      .from(
        db.select({
          sessionId: analyticsEvents.session_id,
          min_ts: sql<Date>`min(${analyticsEvents.timestamp})`.as('min_ts'),
          max_ts: sql<Date>`max(${analyticsEvents.timestamp})`.as('max_ts')
        })
        .from(analyticsEvents)
        .where(and(eq(analyticsEvents.user_id, userId), isNotNull(analyticsEvents.session_id)))
        .groupBy(analyticsEvents.session_id)
        .as('session_durations')
      )
      .limit(1);

      const timing = timingResult[0];

      // 3. Calculate retention score (active days in last 30)
      const thirtyDaysAgo = new Date(Date.now() - 30 * MS_PER_DAY);
      const recentActivity = await db.select({
        uniqueDays: sql<number>`count(distinct date(${analyticsEvents.timestamp}))`
      })
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.user_id, userId), gte(analyticsEvents.timestamp, thirtyDaysAgo)));
      
      const retentionScore = (Number(recentActivity[0]?.uniqueDays || 0) / 30) * 100;

      const metrics: UserMetrics = {
        userId,
        totalSessions: countsMap.get('user_login') || 0,
        totalPageViews: countsMap.get('page_view') || 0,
        totalAIInteractions: countsMap.get('ai_agent_interaction') || 0,
        goalsCreated: countsMap.get('goal_created') || 0,
        goalsCompleted: countsMap.get('goal_completed') || 0,
        tasksCreated: countsMap.get('task_created') || 0,
        tasksCompleted: countsMap.get('task_completed') || 0,
        filesUploaded: countsMap.get('file_uploaded') || 0,
        templatesSaved: countsMap.get('template_saved') || 0,
        lastActiveAt: timing?.lastActive || new Date(),
        firstSeenAt: timing?.firstSeen || new Date(),
        averageSessionDuration: Number(timing?.avgSessionDuration || 0),
        retentionScore,
        revenue: await RevenueTrackingService.calculateRevenue(userId, new Date(Date.now() - REVENUE_WINDOW_DAYS * MS_PER_DAY), new Date()).catch(() => 0),
        mrr: await RevenueTrackingService.calculateMRR(userId).catch(() => 0)
      };

      // Cache the result
      await redis.set(cacheKey, metrics, { ex: METRICS_CACHE_TTL }).catch(() => {});

      return metrics;
    } catch (error) {
      logError('Failed to fetch user metrics:', error);
      return null;
    }
  }

  /**
   * Get all user metrics
   */
  async getAllUserMetrics(): Promise<UserMetrics[]> {
    const allUsers = await db.select({ id: users.id }).from(users)
    const metrics: UserMetrics[] = []

    // Optimized: Fetch in batches to avoid overwhelming the database
    const BATCH_SIZE = 10;
    for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
      const batch = allUsers.slice(i, i + BATCH_SIZE);
      const batchMetrics = await Promise.all(
        batch.map(user => this.getUserMetrics(user.id))
      );
      batchMetrics.forEach(m => { if (m) metrics.push(m) });
    }

    return metrics
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics[]> {
    const events = await db.select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.event, 'performance_metric'))
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(50)

    return events.map(e => e.properties as unknown as PerformanceMetrics)
  }

  /**
   * Calculate business metrics
   */
  async calculateBusinessMetrics(): Promise<BusinessMetrics> {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Helper to count users created after a date
    const countNewUsers = async (date: Date) => {
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.created_at, date))
      return Number(result[0]?.count || 0)
    }

    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users)
    const totalUsers = Number(totalUsersResult[0]?.count || 0)

    const newUsersToday = await countNewUsers(oneDayAgo)
    const newUsersThisWeek = await countNewUsers(oneWeekAgo)
    const newUsersThisMonth = await countNewUsers(oneMonthAgo)

    // Active users (active in last 7 days)
    const activeUsersResult = await db.select({ count: sql<number>`count(distinct ${analyticsEvents.user_id})` })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.timestamp, oneWeekAgo))
    const activeUsers = Number(activeUsersResult[0]?.count || 0)

    // Calculate revenue metrics
    const revenue = await RevenueTrackingService.calculateGlobalRevenue(oneMonthAgo, now)
    const mrr = await RevenueTrackingService.calculateGlobalMRR()

    // Conversion rate (Users with active payment connections / Total users)
    const payingUsersResult = await db.select({ count: sql<number>`count(distinct ${paymentProviderConnections.user_id})` })
      .from(paymentProviderConnections)
      .where(eq(paymentProviderConnections.is_active, true))
    const payingUsers = Number(payingUsersResult[0]?.count || 0)
    const conversionRate = totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0

    // Feature adoption rate
    const featureUsage = await db.select({
      feature: analyticsEvents.event,
      count: sql<number>`count(distinct ${analyticsEvents.user_id})`
    })
    .from(analyticsEvents)
    .groupBy(analyticsEvents.event)

    const featureAdoptionRate: Record<string, number> = {}
    featureUsage.forEach(f => {
      const featureName = f.feature as string
      if (featureName) {
        featureAdoptionRate[featureName] = totalUsers > 0 ? (Number(f.count) / totalUsers) * 100 : 0
      }
    })

    // Calculate churn rate: Users active last week but not this week
    const activeLastWeek = await db.select({ count: sql<number>`count(distinct ${analyticsEvents.user_id})` })
      .from(analyticsEvents)
      .where(and(
        gte(analyticsEvents.timestamp, oneWeekAgo),
        sql`${analyticsEvents.timestamp} < ${now}`,
        isNotNull(analyticsEvents.user_id)
      ));
    
    const activeWeekCount = Number(activeLastWeek[0]?.count || 0);
    const churnRate = activeUsers > 0 ? ((activeWeekCount - activeUsers) / activeWeekCount) * 100 : 0;

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      userRetentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      featureAdoptionRate,
      conversionRate,
      churnRate: Math.max(0, churnRate),
      revenue,
      mrr
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardData(): Promise<{
    events: AnalyticsEventData[]
    userMetrics: UserMetrics[]
    performanceMetrics: PerformanceMetrics[]
    businessMetrics: BusinessMetrics
  }> {
    const businessMetrics = await this.calculateBusinessMetrics()
    const performanceMetrics = await this.getPerformanceMetrics()

    const recentEvents = await db.select()
      .from(analyticsEvents)
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(100)

    const events = recentEvents.map(e => ({
      event: e.event as AnalyticsEvent,
      timestamp: e.timestamp!,
      properties: e.properties as Record<string, any>,
      metadata: e.metadata as any,
      userId: e.user_id || undefined,
      sessionId: e.session_id || undefined
    }))

    return {
      events,
      userMetrics: [], // Aggregated per-user metrics deferred to specific user drill-down
      performanceMetrics,
      businessMetrics
    }
  }

  /**
   * Calculate trend using linear regression
   */
  private calculateTrend(data: number[]): { slope: number, forecast: number } {
    if (data.length < 2) return { slope: 0, forecast: data[0] || 0 }

    const n = data.length
    let sumX = 0
    let sumY = 0
    let sumXY = 0
    let sumXX = 0

    for (let i = 0; i < n; i++) {
      sumX += i
      sumY += data[i]
      sumXY += i * data[i]
      sumXX += i * i
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    const forecast = slope * n + intercept

    return { slope, forecast }
  }

  /**
   * Get predictive metrics
   */
  async getPredictiveMetrics(): Promise<{
    revenueForecast: number
    userGrowthForecast: number
    churnRate: number
    seasonalTrends: string[]
  }> {
    const now = new Date()
    const months = [5, 4, 3, 2, 1, 0]
    
    const revenuePromises = months.map(async (i) => {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        try {
            return await RevenueTrackingService.calculateGlobalRevenue(start, end)
        } catch (error) {
            logError('Failed to calculate revenue for forecast', { error, start, end })
            return 0
        }
    })

    const monthlyRevenue = await Promise.all(revenuePromises)
    const revenueTrend = this.calculateTrend(monthlyRevenue)

    const userGrowthPromises = [3, 2, 1, 0].map(async (i) => {
         const start = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
         const usersResult = await db.select({ count: sql<number>`count(*)` })
            .from(users)
            .where(and(
                gte(users.created_at, start),
                sql`${users.created_at} < ${new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)}`
            ))
         return Number(usersResult[0]?.count || 0)
    })
    
    const weeklyUserCounts = await Promise.all(userGrowthPromises)
    const userGrowthTrend = this.calculateTrend(weeklyUserCounts)

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const activeLastMonth = await db.select({ id: analyticsEvents.user_id })
        .from(analyticsEvents)
        .where(and(
            gte(analyticsEvents.timestamp, lastMonthStart),
            sql`${analyticsEvents.timestamp} < ${thisMonthStart}`,
            isNotNull(analyticsEvents.user_id)
        ))
        .groupBy(analyticsEvents.user_id)
        
    const activeThisMonth = await db.select({ id: analyticsEvents.user_id })
        .from(analyticsEvents)
        .where(and(
            gte(analyticsEvents.timestamp, thisMonthStart),
            isNotNull(analyticsEvents.user_id)
        ))
        .groupBy(analyticsEvents.user_id)
        
    const lastMonthIds = new Set(activeLastMonth.map(u => u.id!))
    const thisMonthIds = new Set(activeThisMonth.map(u => u.id!))
    
    let churnedCount = 0
    if (lastMonthIds.size > 0) {
        lastMonthIds.forEach(id => {
            if (!thisMonthIds.has(id)) churnedCount++
        })
    }
    
    const churnRate = lastMonthIds.size > 0 ? (churnedCount / lastMonthIds.size) * 100 : 0
    
    const trends: string[] = []
    if (revenueTrend.slope > 0) trends.push("Revenue is trending upward")
    if (revenueTrend.slope < 0) trends.push("Revenue is declining")
    if (userGrowthTrend.slope > 0) trends.push("User acquisition is accelerating")
    if (churnRate > CHURN_RATE_THRESHOLD) trends.push("High churn rate detected")

    return {
        revenueForecast: Math.max(0, revenueTrend.forecast),
        userGrowthForecast: Math.max(0, userGrowthTrend.forecast),
        churnRate,
        seasonalTrends: trends
    }
  }

  /**
   * Database cleanup for old analytics events (V1: 90 day retention)
   */
  async clearOldData(): Promise<void> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    try {
      await db.delete(analyticsEvents).where(sql`${analyticsEvents.timestamp} < ${ninetyDaysAgo}`);
      logInfo('✅ Successfully cleared analytics events older than 90 days');
    } catch (error) {
      logError('Failed to clear old analytics data:', error);
    }
  }
}

// Export singleton instance
export const analytics = new AnalyticsService()

// Helper functions for common tracking scenarios
export const trackUserSignup = (userId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('user_signup', { userId, ...properties })

export const trackUserLogin = (userId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('user_login', { userId, ...properties })

export const trackPageView = (userId: string, page: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('page_view', { userId, page, ...properties })

export const trackAIAgentInteraction = (userId: string, agentName: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('ai_agent_interaction', { userId, agentName, ...properties })

export const trackGoalCreated = (userId: string, goalId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('goal_created', { userId, goalId, ...properties })

export const trackGoalCompleted = (userId: string, goalId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('goal_completed', { userId, goalId, ...properties })

export const trackTaskCreated = (userId: string, taskId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('task_created', { userId, taskId, ...properties })

export const trackTaskCompleted = (userId: string, taskId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('task_completed', { userId, taskId, ...properties })

export const trackFileUpload = (userId: string, fileId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('file_uploaded', { userId, fileId, ...properties })

export const trackTemplateSaved = (userId: string, templateId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('template_saved', { userId, templateId, ...properties })

export const trackError = (userId: string, error: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('error_occurred', { userId, error, ...properties })

export const trackPerformance = (metrics: Partial<PerformanceMetrics>) =>
  analytics.trackPerformance(metrics)
