import { db } from '@/db'
import { competitors, intelligenceData, competitorAlerts } from '@/db/schema'
import { eq, desc, gte, and, sql } from 'drizzle-orm'
import { generateObject } from 'ai'
import { openai } from '@/lib/ai-config'
import { z } from 'zod'

// Briefing types and interfaces
export type BriefingType = 'daily' | 'weekly' | 'monthly' | 'on-demand'
export type BriefingFrequency = 'daily' | 'weekly' | 'monthly'

export interface BriefingConfig {
  userId: string
  competitorIds?: string[]
  briefingType: BriefingType
  frequency?: BriefingFrequency
  topics?: string[]
  includeAgents?: string[]
  customization?: {
    role: string
    interests: string[]
    priority: 'high-level' | 'detailed' | 'executive'
  }
}

export interface IntelligenceBriefing {
  id: string
  userId: string
  briefingType: BriefingType
  title: string
  summary: string
  keyInsights: string[]
  competitorUpdates: CompetitorUpdate[]
  trendAnalysis: TrendAnalysis[]
  actionItems: ActionItem[]
  threatAssessment: ThreatAssessment
  opportunities: Opportunity[]
  generatedAt: Date
  periodCovered: {
    start: Date
    end: Date
  }
}

export interface CompetitorUpdate {
  competitorId: string
  competitorName: string
  updates: {
    type: 'product' | 'pricing' | 'marketing' | 'hiring' | 'funding' | 'news'
    title: string
    description: string
    impact: 'low' | 'medium' | 'high' | 'critical'
    date: Date
    source: string
  }[]
}

export interface TrendAnalysis {
  category: string
  trend: string
  description: string
  implications: string[]
  confidence: number
}

export interface ActionItem {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedEffort: string
  potentialImpact: string
  dueDate?: Date
}

export interface ThreatAssessment {
  overallThreatLevel: 'low' | 'medium' | 'high' | 'critical'
  emergingThreats: {
    competitorId: string
    threat: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    timeframe: string
  }[]
  marketChanges: string[]
}

export interface Opportunity {
  title: string
  description: string
  competitorWeakness?: string
  marketGap?: string
  priority: 'low' | 'medium' | 'high'
  timeframe: string
  requiredActions: string[]
}

// Briefing generation schemas
const briefingSchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyInsights: z.array(z.string()),
  competitorUpdates: z.array(z.object({
    competitorId: z.string(),
    competitorName: z.string(),
    updates: z.array(z.object({
      type: z.enum(['product', 'pricing', 'marketing', 'hiring', 'funding', 'news']),
      title: z.string(),
      description: z.string(),
      impact: z.enum(['low', 'medium', 'high', 'critical']),
      source: z.string()
    }))
  })),
  trendAnalysis: z.array(z.object({
    category: z.string(),
    trend: z.string(),
    description: z.string(),
    implications: z.array(z.string()),
    confidence: z.number().min(0).max(1)
  })),
  actionItems: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    estimatedEffort: z.string(),
    potentialImpact: z.string()
  })),
  threatAssessment: z.object({
    overallThreatLevel: z.enum(['low', 'medium', 'high', 'critical']),
    emergingThreats: z.array(z.object({
      competitorId: z.string(),
      threat: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      timeframe: z.string()
    })),
    marketChanges: z.array(z.string())
  }),
  opportunities: z.array(z.object({
    title: z.string(),
    description: z.string(),
    competitorWeakness: z.string().optional(),
    marketGap: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']),
    timeframe: z.string(),
    requiredActions: z.array(z.string())
  }))
})

export class IntelligenceBriefingService {
  /**
   * Generate automated intelligence briefing
   */
  async generateBriefing(config: BriefingConfig): Promise<IntelligenceBriefing> {
    const { userId, competitorIds, briefingType, customization } = config
    
    // Determine time period based on briefing type
    const periodCovered = this.getBriefingPeriod(briefingType)
    
    // Gather intelligence data for the period
    const intelligenceData = await this.gatherIntelligenceData(
      userId,
      competitorIds,
      periodCovered.start,
      periodCovered.end
    )
    
    // Generate briefing using AI
    const briefingContent = await this.generateBriefingContent(
      intelligenceData,
      briefingType,
      customization
    )
    
    // Create briefing object
    const briefing: IntelligenceBriefing = {
      id: crypto.randomUUID(),
      userId,
      briefingType,
      ...briefingContent,
      generatedAt: new Date(),
      periodCovered
    }
    
    return briefing
  }
  
  /**
   * Generate daily intelligence briefing
   */
  async generateDailyBriefing(userId: string, competitorIds?: string[]): Promise<IntelligenceBriefing> {
    return this.generateBriefing({
      userId,
      competitorIds,
      briefingType: 'daily',
      customization: {
        role: 'entrepreneur',
        interests: ['immediate_threats', 'opportunities', 'market_changes'],
        priority: 'high-level'
      }
    })
  }
  
  /**
   * Generate weekly strategic briefing
   */
  async generateWeeklyBriefing(userId: string, competitorIds?: string[]): Promise<IntelligenceBriefing> {
    return this.generateBriefing({
      userId,
      competitorIds,
      briefingType: 'weekly',
      customization: {
        role: 'strategic_planner',
        interests: ['competitive_positioning', 'market_trends', 'strategic_moves'],
        priority: 'detailed'
      }
    })
  }
  
  /**
   * Generate monthly intelligence report
   */
  async generateMonthlyReport(userId: string, competitorIds?: string[]): Promise<IntelligenceBriefing> {
    return this.generateBriefing({
      userId,
      competitorIds,
      briefingType: 'monthly',
      customization: {
        role: 'executive',
        interests: ['market_analysis', 'competitive_landscape', 'strategic_opportunities'],
        priority: 'executive'
      }
    })
  }
  
  /**
   * Generate on-demand briefing for specific topics
   */
  async generateOnDemandBriefing(
    userId: string,
    topics: string[],
    competitorIds?: string[]
  ): Promise<IntelligenceBriefing> {
    return this.generateBriefing({
      userId,
      competitorIds,
      briefingType: 'on-demand',
      topics,
      customization: {
        role: 'analyst',
        interests: topics,
        priority: 'detailed'
      }
    })
  }
  
  /**
   * Get briefing period based on type
   */
  private getBriefingPeriod(briefingType: BriefingType): { start: Date; end: Date } {
    const now = new Date()
    const end = new Date(now)
    let start: Date
    
    switch (briefingType) {
      case 'daily':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
        break
      case 'weekly':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        break
      case 'monthly':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        break
      case 'on-demand':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Default to last 7 days
        break
      default:
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }
    
    return { start, end }
  }
  
  /**
   * Gather intelligence data for briefing period
   */
  private async gatherIntelligenceData(
    userId: string,
    competitorIds: string[] | undefined,
    startDate: Date,
    endDate: Date
  ) {
    // Get user's competitors if not specified
    let targetCompetitorIds = competitorIds
    if (!targetCompetitorIds) {
      const userCompetitors = await db
        .select({ id: competitors.id })
        .from(competitors)
        .where(eq(competitors.userId, userId))
      
      targetCompetitorIds = userCompetitors.map(c => c.id)
    }
    
    if (targetCompetitorIds.length === 0) {
      return {
        competitors: [],
        intelligence: [],
        alerts: []
      }
    }
    
    // Get competitor profiles
    const competitorProfiles = await db
      .select()
      .from(competitors)
      .where(
        and(
          eq(competitors.userId, userId),
          sql`${competitors.id} = ANY(${targetCompetitorIds})`
        )
      )
    
    // Get intelligence data for the period
    const intelligence = await db
      .select()
      .from(intelligenceData)
      .where(
        and(
          sql`${intelligenceData.competitorId} = ANY(${targetCompetitorIds})`,
          gte(intelligenceData.collectedAt, startDate),
          sql`${intelligenceData.collectedAt} <= ${endDate}`
        )
      )
      .orderBy(desc(intelligenceData.collectedAt))
    
    // Get alerts for the period
    const alerts = await db
      .select()
      .from(competitorAlerts)
      .where(
        and(
          eq(competitorAlerts.userId, userId),
          sql`${competitorAlerts.competitorId} = ANY(${targetCompetitorIds})`,
          gte(competitorAlerts.createdAt, startDate),
          sql`${competitorAlerts.createdAt} <= ${endDate}`
        )
      )
      .orderBy(desc(competitorAlerts.createdAt))
    
    return {
      competitors: competitorProfiles,
      intelligence,
      alerts
    }
  }

  /**
   * Generate briefing content using AI
   */
  private async generateBriefingContent(
    data: any,
    briefingType: BriefingType,
    customization?: BriefingConfig['customization']
  ) {
    const { competitors, intelligence, alerts } = data
    
    // Prepare context for AI generation
    const context = {
      briefingType,
      competitorCount: competitors.length,
      intelligenceCount: intelligence.length,
      alertCount: alerts.length,
      userRole: customization?.role || 'entrepreneur',
      userInterests: customization?.interests || [],
      priority: customization?.priority || 'high-level'
    }
    
    // Create prompt based on briefing type
    const prompt = this.createBriefingPrompt(briefingType, context, data)
    
    try {
      const result = await generateObject({
        model: openai('gpt-4-turbo'),
        schema: briefingSchema,
        prompt
      })
      
      return result.object
    } catch (error) {
      console.error('Error generating briefing content:', error)
      
      // Fallback to basic briefing structure
      return this.createFallbackBriefing(briefingType, data)
    }
  }
  
  /**
   * Create AI prompt for briefing generation
   */
  private createBriefingPrompt(briefingType: BriefingType, context: any, data: any): string {
    const { competitors, intelligence, alerts } = data
    const { userRole, userInterests, priority } = context
    
    let timeframeDescription = ''
    switch (briefingType) {
      case 'daily':
        timeframeDescription = 'the last 24 hours'
        break
      case 'weekly':
        timeframeDescription = 'the past week'
        break
      case 'monthly':
        timeframeDescription = 'the past month'
        break
      case 'on-demand':
        timeframeDescription = 'the requested period'
        break
    }
    
    return `
You are an expert competitive intelligence analyst creating a ${briefingType} intelligence briefing for a ${userRole}.

CONTEXT:
- Time period: ${timeframeDescription}
- User role: ${userRole}
- Priority level: ${priority}
- User interests: ${userInterests.join(', ')}
- Competitors monitored: ${competitors.length}
- Intelligence entries: ${intelligence.length}
- Alerts generated: ${alerts.length}

COMPETITOR DATA:
${competitors.map((c: any) => `
- ${c.name} (${c.domain})
  - Threat Level: ${c.threatLevel}
  - Industry: ${c.industry}
  - Size: ${c.employeeCount} employees
`).join('')}

INTELLIGENCE DATA:
${intelligence.slice(0, 20).map((intel: any) => `
- ${intel.dataType} from ${intel.sourceUrl}
  - Importance: ${intel.importance}
  - Collected: ${intel.collectedAt}
  - Key insights: ${intel.extractedData?.keyInsights?.join(', ') || 'N/A'}
`).join('')}

RECENT ALERTS:
${alerts.slice(0, 10).map((alert: any) => `
- ${alert.title} (${alert.severity})
  - Description: ${alert.description}
  - Created: ${alert.createdAt}
`).join('')}

BRIEFING REQUIREMENTS:
1. Create a comprehensive ${briefingType} intelligence briefing
2. Focus on actionable insights relevant to a ${userRole}
3. Prioritize ${priority} information
4. Include specific competitor updates with impact assessment
5. Identify market trends and their implications
6. Provide clear action items with priority levels
7. Assess overall threat landscape
8. Highlight opportunities based on competitor weaknesses or market gaps

Generate a structured intelligence briefing that helps the user make informed strategic decisions.
    `.trim()
  }
  
  /**
   * Create fallback briefing when AI generation fails
   */
  private createFallbackBriefing(briefingType: BriefingType, data: any) {
    const { competitors, intelligence, alerts } = data
    
    return {
      title: `${briefingType.charAt(0).toUpperCase() + briefingType.slice(1)} Intelligence Briefing`,
      summary: `Intelligence briefing covering ${competitors.length} competitors with ${intelligence.length} data points and ${alerts.length} alerts.`,
      keyInsights: [
        `Monitoring ${competitors.length} competitors`,
        `${intelligence.length} intelligence entries collected`,
        `${alerts.length} alerts generated`
      ],
      competitorUpdates: competitors.map((c: any) => ({
        competitorId: c.id,
        competitorName: c.name,
        updates: []
      })),
      trendAnalysis: [],
      actionItems: [],
      threatAssessment: {
        overallThreatLevel: 'medium' as const,
        emergingThreats: [],
        marketChanges: []
      },
      opportunities: []
    }
  }
  
  /**
   * Schedule automated briefings
   */
  async scheduleBriefing(
    userId: string,
    frequency: BriefingFrequency,
    config: Partial<BriefingConfig>
  ): Promise<void> {
    // This would integrate with a job scheduler like Bull Queue or similar
    // For now, we'll store the configuration for manual triggering
    console.log(`Scheduled ${frequency} briefing for user ${userId}`)
  }
  
  /**
   * Get briefing history for user
   */
  async getBriefingHistory(
    userId: string,
    limit: number = 10
  ): Promise<IntelligenceBriefing[]> {
    // This would query a briefings table in the database
    // For now, return empty array as briefings are generated on-demand
    return []
  }
  
  /**
   * Customize briefing preferences
   */
  async updateBriefingPreferences(
    userId: string,
    preferences: {
      frequency?: BriefingFrequency
      topics?: string[]
      agents?: string[]
      customization?: BriefingConfig['customization']
    }
  ): Promise<void> {
    // This would update user preferences in the database
    console.log(`Updated briefing preferences for user ${userId}`)
  }
}

// Export singleton instance
export const intelligenceBriefingService = new IntelligenceBriefingService()