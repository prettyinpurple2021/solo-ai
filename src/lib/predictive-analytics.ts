import { logError, logInfo } from '@/lib/logger'

export interface PredictiveInsight {
  id: string
  type: 'trend' | 'anomaly' | 'forecast' | 'recommendation' | 'risk'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  category: 'productivity' | 'engagement' | 'performance' | 'business' | 'user_behavior'
  timeframe: 'short_term' | 'medium_term' | 'long_term'
  data: {
    current?: number
    predicted?: number
    change?: number
    changePercent?: number
    historicalData?: number[]
    factors?: string[]
    seriesLabel?: string
  }
  recommendations?: string[]
  actionable: boolean
  priority: number
  createdAt: Date
  expiresAt?: Date
}

export interface BusinessTrendPoint {
  periodStart: string
  activeUsers: number
  newUsers: number
  paidUsers: number
  estimatedRevenue: number
  taskCompletionRate: number
  goalCompletionRate: number
  aiInteractions: number
}

export interface BusinessAnalyticsData {
  timeframeDays: number
  totalUsers: number
  activeUsers: number
  newUsers: number
  paidUsers: number
  churnRate: number
  conversionRate: number
  revenue30d: number
  taskCompletionRate: number
  goalCompletionRate: number
  aiInteractions: number
  historicalTrends: BusinessTrendPoint[]
}

export interface UserAnalyticsData {
  userId: string
  timeframeDays: number
  tasksTotal: number
  tasksCompleted: number
  taskCompletionRate: number
  goalsTotal: number
  goalsCompleted: number
  goalCompletionRate: number
  focusSessionsCount: number
  totalFocusMinutes: number
  avgSessionDurationMinutes: number
  aiConversationsCount: number
  aiMessagesCount: number
  loginFrequencyPerWeek: number
  sessionFrequencyPerWeek: number
  engagementScore: number
  interactionDepth: number
  featureUsage: Record<string, number>
  sessionPatterns: {
    peakHours: number[]
    averageSessionLengthMinutes: number
    sessionsPerWeek: number
  }
  taskCompletionHistory: number[]
  sessionDurationHistory: number[]
  aiInteractionHistory: number[]
  activeDays: number
  lastLoginAt?: Date | null
}

export interface BusinessForecast {
  timeframe: '7d' | '30d' | '90d' | '1y'
  metrics: {
    userGrowth: number[]
    revenue: number[]
    engagement: number[]
    churn: number[]
    featureAdoption: Record<string, number[]>
  }
  confidence: number
  factors: string[]
  assumptions: string[]
}

export interface AnomalyDetection {
  id: string
  type: 'performance' | 'user_behavior' | 'business_metric' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detectedAt: Date
  metric: string
  expectedValue: number
  actualValue: number
  deviation: number
  impact: string
  recommendations: string[]
}

type InsightBuilder = (userData: UserAnalyticsData, businessData: BusinessAnalyticsData) => PredictiveInsight | null

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const average = (values: number[]) => {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const safePercentChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100
  }
  return ((current - previous) / previous) * 100
}

const toSeries = (points: BusinessTrendPoint[], selector: (point: BusinessTrendPoint) => number) =>
  points.map(selector)

const selectTopKeys = (data: Record<string, number>, limit: number) =>
  Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key)

class PredictiveAnalyticsEngine {
  private insights: Map<string, PredictiveInsight> = new Map()
  private anomalies: AnomalyDetection[] = []

  async generateInsights(userData: UserAnalyticsData, businessData: BusinessAnalyticsData): Promise<PredictiveInsight[]> {
    try {
      const builders: InsightBuilder[] = [
        this.buildProductivityInsight,
        this.buildEngagementInsight,
        this.buildChurnRiskInsight,
        this.buildFeatureAdoptionInsight,
        this.buildBusinessHealthInsight,
      ]

      const insights = builders
        .map(builder => builder.call(this, userData, businessData))
        .filter((insight): insight is PredictiveInsight => Boolean(insight))

      insights.forEach(insight => {
        this.insights.set(insight.id, insight)
      })

      logInfo(`Generated ${insights.length} predictive insights`, { userId: userData.userId })
      return insights
    } catch (error) {
      logError('Error generating predictive insights', error)
      return []
    }
  }

  private buildProductivityInsight(userData: UserAnalyticsData): PredictiveInsight | null {
    const history = userData.taskCompletionHistory
    if (history.length < 4) {
      return null
    }

    const midpoint = Math.floor(history.length / 2)
    const previousWindow = history.slice(0, midpoint)
    const recentWindow = history.slice(midpoint)

    const previousAvg = average(previousWindow)
    const recentAvg = average(recentWindow)
    const changePercent = safePercentChange(recentAvg, previousAvg)

    const direction = changePercent > 5 ? 'improving' : changePercent < -5 ? 'declining' : 'stable'
    const confidence = clamp(60 + Math.min(history.length * 5, 30), 60, 95)
    const impact = Math.abs(changePercent) > 15 ? 'high' : Math.abs(changePercent) > 5 ? 'medium' : 'low'
    const priority = impact === 'high' ? 8 : impact === 'medium' ? 6 : 4

    const recommendations: string[] = []
    if (direction === 'declining') {
      recommendations.push('Review task workload and redistribute if necessary')
      recommendations.push('Schedule focus blocks for high-priority work')
      recommendations.push('Use AI assistance to break down complex goals')
    } else if (direction === 'improving') {
      recommendations.push('Reinforce the habits that increased productivity')
      recommendations.push('Capture and replicate successful workflows')
      recommendations.push('Identify upcoming milestones that benefit from current momentum')
    } else {
      recommendations.push('Maintain current routines and monitor for shifts')
      recommendations.push('Experiment with incremental improvements to session structure')
    }

    return {
      id: `productivity_${userData.userId}_${Date.now()}`,
      type: 'trend',
      title: 'Productivity trajectory',
      description: `Task completion is ${direction} by ${changePercent.toFixed(1)}% over the current period.`,
      confidence,
      impact,
      category: 'productivity',
      timeframe: 'medium_term',
      data: {
        current: recentAvg,
        change: recentAvg - previousAvg,
        changePercent,
        historicalData: history,
        seriesLabel: 'Tasks completed per day'
      },
      recommendations,
      actionable: true,
      priority,
      createdAt: new Date()
    }
  }

  private buildEngagementInsight(userData: UserAnalyticsData): PredictiveInsight | null {
    const { sessionFrequencyPerWeek, avgSessionDurationMinutes, engagementScore, sessionPatterns } = userData

    if (userData.sessionDurationHistory.length === 0) {
      return null
    }

    const avgDuration = avgSessionDurationMinutes
    const sessionsPerWeek = sessionFrequencyPerWeek
    const peakHours = sessionPatterns.peakHours

    const engagementLevel =
      engagementScore >= 75 ? 'very high' :
      engagementScore >= 55 ? 'healthy' :
      engagementScore >= 35 ? 'moderate' :
      'at risk'

    const impact =
      engagementScore < 35 ? 'high' :
      engagementScore < 55 ? 'medium' : 'low'

    const confidence = clamp(70 + Math.min(userData.sessionDurationHistory.length * 3, 20), 70, 92)
    const priority = impact === 'high' ? 7 : impact === 'medium' ? 5 : 3

    const recommendations: string[] = []
    if (impact === 'high') {
      recommendations.push('Trigger re-engagement workflow with personalized content')
      recommendations.push('Schedule proactive outreach from success team')
      recommendations.push('Offer guided sessions aligned with peak availability hours')
    } else if (impact === 'medium') {
      recommendations.push('Introduce new feature walkthroughs during peak hours')
      recommendations.push('Surface personalized productivity tips inside focus sessions')
    } else {
      recommendations.push('Maintain engagement cadence and monitor for deviation')
      recommendations.push('Introduce advanced features tied to existing usage patterns')
    }

    return {
      id: `engagement_${userData.userId}_${Date.now()}`,
      type: 'trend',
      title: 'Engagement health assessment',
      description: `User engagement is ${engagementLevel}. Average ${sessionsPerWeek.toFixed(1)} sessions per week at ${avgDuration.toFixed(0)} minutes each.`,
      confidence,
      impact,
      category: 'engagement',
      timeframe: 'short_term',
      data: {
        current: engagementScore,
        historicalData: userData.sessionDurationHistory,
        factors: peakHours.length > 0 ? peakHours.map(hour => `Peak hour ${hour}:00`) : undefined
      },
      recommendations,
      actionable: true,
      priority,
      createdAt: new Date()
    }
  }

  private buildChurnRiskInsight(userData: UserAnalyticsData): PredictiveInsight | null {
    const activityPenalty = clamp(60 - userData.sessionFrequencyPerWeek * 12, 0, 40)
    const completionPenalty = clamp(50 - userData.taskCompletionRate, 0, 30)
    const engagementPenalty = clamp(50 - userData.engagementScore, 0, 30)

    const riskScore = clamp(activityPenalty + completionPenalty + engagementPenalty, 0, 100)
    const riskLevel =
      riskScore >= 70 ? 'critical' :
      riskScore >= 50 ? 'high' :
      riskScore >= 30 ? 'medium' :
      'low'

    const impact = riskScore >= 50 ? 'high' : riskScore >= 30 ? 'medium' : 'low'
    const priority = riskScore >= 50 ? 9 : riskScore >= 30 ? 7 : 4
    const confidence = clamp(65 + userData.taskCompletionHistory.length * 3, 65, 90)

    const factors: string[] = []
    if (activityPenalty > 20) factors.push('Low weekly session frequency')
    if (completionPenalty > 20) factors.push('Task completion below target')
    if (engagementPenalty > 20) factors.push('Decreasing engagement score')

    const recommendations: string[] = []
    recommendations.push('Send tailored retention playbook emphasising quick wins')
    if (activityPenalty > 20) {
      recommendations.push('Invite user to schedule recurring focus sessions')
    }
    if (completionPenalty > 20) {
      recommendations.push('Surface unfinished goals and suggest next best action')
    }
    if (engagementPenalty > 20) {
      recommendations.push('Highlight new capabilities aligned with prior usage')
    }

    return {
      id: `churn_${userData.userId}_${Date.now()}`,
      type: 'risk',
      title: 'Churn risk assessment',
      description: `Churn risk is ${riskLevel} with a score of ${riskScore.toFixed(0)} based on recent activity patterns.`,
      confidence,
      impact,
      category: 'user_behavior',
      timeframe: 'short_term',
      data: {
        current: riskScore,
        factors,
        historicalData: userData.taskCompletionHistory
      },
      recommendations,
      actionable: true,
      priority,
      createdAt: new Date()
    }
  }

  private buildFeatureAdoptionInsight(userData: UserAnalyticsData): PredictiveInsight | null {
    const featureEntries = Object.entries(userData.featureUsage)
    if (featureEntries.length === 0) {
      return null
    }

    const [topFeatureKey, topFeatureValue] = featureEntries.sort((a, b) => b[1] - a[1])[0]
    const underutilised = featureEntries
      .filter(([_, value]) => topFeatureValue > 0 && value / topFeatureValue < 0.3)
      .map(([key]) => key)

    if (underutilised.length === 0) {
      return null
    }

    const recommendations = underutilised.map(feature => {
      switch (feature) {
        case 'goal_tracking':
          return 'Encourage goal tracking by linking active tasks to measurable outcomes.'
        case 'focus_mode':
          return 'Offer guided focus sessions during established peak hours to deepen usage.'
        case 'ai_chat':
          return 'Promote AI co-pilot suggestions within task workflow to increase interactions.'
        case 'task_management':
          return 'Provide task templates aligned with recent activity to accelerate planning.'
        default:
          return `Highlight the benefits of ${feature.replace('_', ' ')} with contextual tips.`
      }
    })

    const confidence = clamp(65 + underutilised.length * 5, 65, 90)

    return {
      id: `adoption_${userData.userId}_${Date.now()}`,
      type: 'recommendation',
      title: 'Feature adoption opportunities',
      description: `Feature adoption is concentrated on ${topFeatureKey.replace('_', ' ')}. ${underutilised.length} capabilities need guidance.`,
      confidence,
      impact: underutilised.length > 2 ? 'medium' : 'low',
      category: 'user_behavior',
      timeframe: 'medium_term',
      data: {
        factors: selectTopKeys(userData.featureUsage, 5),
        current: topFeatureValue
      },
      recommendations,
      actionable: true,
      priority: underutilised.length > 2 ? 6 : 4,
      createdAt: new Date()
    }
  }

  private buildBusinessHealthInsight(_userData: UserAnalyticsData, businessData: BusinessAnalyticsData): PredictiveInsight | null {
    if (businessData.historicalTrends.length < 4) {
      return null
    }

    const userSeries = toSeries(businessData.historicalTrends, point => point.activeUsers)
    const revenueSeries = toSeries(businessData.historicalTrends, point => point.estimatedRevenue)
    const churnSeries = toSeries(businessData.historicalTrends, point => point.paidUsers > 0 ? (point.paidUsers - point.activeUsers) / point.paidUsers : 0)

    const usersChange = safePercentChange(userSeries[userSeries.length - 1], userSeries[0])
    const revenueChange = safePercentChange(revenueSeries[revenueSeries.length - 1], revenueSeries[0])

    const momentum =
      usersChange > 8 && revenueChange > 5 ? 'accelerating' :
      usersChange > 0 || revenueChange > 0 ? 'growing' :
      'flattening'

    const impact =
      revenueChange < -5 || usersChange < -5 ? 'high' :
      revenueChange < 2 && usersChange < 2 ? 'medium' :
      'low'

    const priority = impact === 'high' ? 8 : impact === 'medium' ? 6 : 4
    const confidence = clamp(70 + businessData.historicalTrends.length * 2, 70, 90)

    const recommendations: string[] = []
    if (momentum === 'accelerating') {
      recommendations.push('Scale acquisition channels sustaining user growth.')
      recommendations.push('Reinvest in revenue-driving cohorts to compound gains.')
    } else if (momentum === 'growing') {
      recommendations.push('Protect current growth by monitoring activation to paid conversion.')
      recommendations.push('Pilot pricing or packaging experiments for incremental lift.')
    } else {
      recommendations.push('Investigate recent churn signals and reactivate dormant cohorts.')
      recommendations.push('Align product roadmap with underperforming adoption segments.')
    }

    const churnRecent = churnSeries.slice(-Math.min(5, churnSeries.length))
    const churnAvg = average(churnRecent) * 100

    return {
      id: `business_${Date.now()}`,
      type: 'trend',
      title: 'Business momentum analysis',
      description: `Business momentum is ${momentum}. Active users changed ${usersChange.toFixed(1)}% and revenue ${revenueChange.toFixed(1)}% over the observed window.`,
      confidence,
      impact,
      category: 'business',
      timeframe: 'long_term',
      data: {
        current: businessData.activeUsers,
        changePercent: usersChange,
        historicalData: userSeries,
        factors: [
          `Revenue change ${revenueChange.toFixed(1)}%`,
          `Average churn ${(churnAvg).toFixed(2)}%`
        ]
      },
      recommendations,
      actionable: true,
      priority,
      createdAt: new Date()
    }
  }

  async detectAnomalies(metrics: Array<{
    name: string
    type?: AnomalyDetection['type']
    historicalData: number[]
    currentValue: number
  }>): Promise<AnomalyDetection[]> {
    try {
      const anomalies: AnomalyDetection[] = []

      for (const metric of metrics) {
        const { historicalData, currentValue, name } = metric
        if (historicalData.length < 4) {
          continue
        }

        const mean = average(historicalData)
        const variance = historicalData.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / historicalData.length
        const standardDeviation = Math.sqrt(variance)

        if (standardDeviation === 0) {
          continue
        }

        const deviation = Math.abs(currentValue - mean) / standardDeviation
        if (deviation <= 2) {
          continue
        }

        anomalies.push({
          id: `anomaly_${name}_${Date.now()}`,
          type: metric.type ?? 'performance',
          severity: deviation > 3 ? 'critical' : deviation > 2.5 ? 'high' : 'medium',
          description: `Detected anomaly for ${name}: ${currentValue.toFixed(2)} vs expected ${mean.toFixed(2)}.`,
          detectedAt: new Date(),
          metric: name,
          expectedValue: mean,
          actualValue: currentValue,
          deviation,
          impact: `Deviation of ${(deviation * 100).toFixed(0)}% from expected`,
          recommendations: [
            'Inspect recent changes affecting this metric',
            'Validate upstream data sources for accuracy',
            'Implement temporary guardrails while diagnosing'
          ]
        })
      }

      if (anomalies.length > 0) {
        this.anomalies.push(...anomalies)
        logInfo(`Detected ${anomalies.length} anomalies`, {
          metrics: anomalies.map(anomaly => anomaly.metric)
        })
      }

      return anomalies
    } catch (error) {
      logError('Error detecting anomalies', error)
      return []
    }
  }

  async generateBusinessForecast(timeframe: '7d' | '30d' | '90d' | '1y', businessData: BusinessAnalyticsData): Promise<BusinessForecast> {
    try {
      const projectionSteps: Record<typeof timeframe, number> = {
        '7d': 7,
        '30d': 6,
        '90d': 9,
        '1y': 12
      }

      const steps = projectionSteps[timeframe]
      const history = businessData.historicalTrends

      const makeProjection = (series: number[]) => {
        if (series.length < 2) {
          return Array(steps).fill(series[series.length - 1] ?? 0)
        }

        const lastValue = series[series.length - 1]
        const secondLast = series[series.length - 2]
        const slope = lastValue - secondLast

        return Array.from({ length: steps }, (_, index) => {
          const projected = lastValue + slope * (index + 1)
          return Number(projected.toFixed(2))
        })
      }

      const userGrowthSeries = toSeries(history, point => point.activeUsers)
      const revenueSeries = toSeries(history, point => point.estimatedRevenue)
      const engagementSeries = toSeries(history, point => point.taskCompletionRate)
      const churnSeries = toSeries(history, point => point.paidUsers > 0 ? ((point.paidUsers - point.activeUsers) / point.paidUsers) * 100 : 0)
      const adoptionSeries = {
        ai_chat: toSeries(history, point => point.aiInteractions),
        goals: toSeries(history, point => point.goalCompletionRate),
        tasks: toSeries(history, point => point.taskCompletionRate)
      }

      const forecast: BusinessForecast = {
        timeframe,
        metrics: {
          userGrowth: makeProjection(userGrowthSeries),
          revenue: makeProjection(revenueSeries),
          engagement: makeProjection(engagementSeries),
          churn: makeProjection(churnSeries),
          featureAdoption: Object.fromEntries(
            Object.entries(adoptionSeries).map(([key, series]) => [key, makeProjection(series)])
          )
        },
        confidence: clamp(65 + Math.min(history.length * 3, 25), 65, 92),
        factors: [
          `Active users: ${businessData.activeUsers}`,
          `Paid conversion: ${businessData.conversionRate.toFixed(2)}%`,
          `AI interactions: ${businessData.aiInteractions}`
        ],
        assumptions: [
          'Historical cadence continues without major structural changes',
          'No pricing adjustments or large acquisition spikes',
          'Infrastructure capacity handles projected demand'
        ]
      }

      return forecast
    } catch (error) {
      logError('Error generating business forecast', error)
      throw error
    }
  }

  getInsights(): PredictiveInsight[] {
    return Array.from(this.insights.values())
  }

  getHighPriorityInsights(): PredictiveInsight[] {
    return this.getInsights().filter(insight => insight.priority >= 7)
  }

  getActionableInsights(): PredictiveInsight[] {
    return this.getInsights().filter(insight => insight.actionable)
  }

  getRecentAnomalies(): AnomalyDetection[] {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return this.anomalies.filter(anomaly => anomaly.detectedAt >= twentyFourHoursAgo)
  }
}

export const predictiveAnalytics = new PredictiveAnalyticsEngine()
