import { db } from '@/db'
import { 
  competitiveOpportunities, 
  opportunityActions, 
  opportunityMetrics,
  competitorProfiles,
  intelligenceData,
  users
} from '@/db/schema'
import { eq, and, desc, gte, sql, asc, lte, isNull, not } from 'drizzle-orm'
import { competitiveOpportunityDetector, type OpportunityDetectionResult } from './competitive-opportunity-detection'

// Types for opportunity recommendation system
export interface OpportunityRecommendation {
  id: string
  opportunityId: string
  title: string
  description: string
  actionType: 'immediate' | 'strategic' | 'research' | 'marketing' | 'product' | 'pricing' | 'talent' | 'partnership'
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedEffort: number // hours
  estimatedCost: number // dollars
  expectedROI: number // percentage
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term'
  prerequisites: string[]
  risks: string[]
  successMetrics: string[]
  resources: string[]
  confidence: number
  createdAt: Date
}

export interface OpportunityPrioritization {
  opportunityId: string
  priorityScore: number
  impactScore: number
  effortScore: number
  timingScore: number
  confidenceScore: number
  riskScore: number
  resourceScore: number
  strategicAlignmentScore: number
  competitiveAdvantageScore: number
  marketTimingScore: number
}

export interface OpportunityTracking {
  opportunityId: string
  status: 'identified' | 'planned' | 'in_progress' | 'completed' | 'paused' | 'cancelled'
  progress: number // 0-100
  milestones: OpportunityMilestone[]
  actions: OpportunityAction[]
  metrics: OpportunityMetric[]
  timeline: OpportunityTimelineEvent[]
  roi: OpportunityROI
  lessons: string[]
}

export interface OpportunityMilestone {
  id: string
  title: string
  description: string
  targetDate: Date
  completedDate?: Date
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  dependencies: string[]
}

export interface OpportunityAction {
  id: string
  title: string
  description: string
  actionType: string
  priority: 'low' | 'medium' | 'high'
  estimatedEffortHours: number
  actualEffortHours?: number
  estimatedCost: number
  actualCost?: number
  expectedOutcome: string
  actualOutcome?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  assignedTo?: string
  dueDate?: Date
  completedAt?: Date
}

export interface OpportunityMetric {
  id: string
  name: string
  type: 'revenue' | 'cost_savings' | 'market_share' | 'customer_acquisition' | 'efficiency' | 'brand' | 'custom'
  baselineValue: number
  targetValue: number
  currentValue: number
  unit: string
  measurementDate: Date
  trend: 'improving' | 'declining' | 'stable'
}

export interface OpportunityTimelineEvent {
  id: string
  eventType: 'created' | 'started' | 'milestone' | 'action_completed' | 'metric_updated' | 'status_changed' | 'note_added'
  title: string
  description: string
  timestamp: Date
  userId: string
  metadata?: Record<string, any>
}

export interface OpportunityROI {
  estimatedROI: number
  actualROI?: number
  investmentAmount: number
  returnAmount: number
  paybackPeriod: number // months
  netPresentValue: number
  internalRateOfReturn: number
  riskAdjustedReturn: number
}

export interface OpportunityCollaboration {
  opportunityId: string
  teamMembers: OpportunityTeamMember[]
  sharedNotes: OpportunityNote[]
  discussions: OpportunityDiscussion[]
  permissions: OpportunityPermissions
}

export interface OpportunityTeamMember {
  userId: string
  role: 'owner' | 'contributor' | 'viewer' | 'stakeholder'
  permissions: string[]
  addedAt: Date
  addedBy: string
}

export interface OpportunityNote {
  id: string
  content: string
  type: 'general' | 'insight' | 'risk' | 'action_item' | 'lesson_learned'
  authorId: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export interface OpportunityDiscussion {
  id: string
  title: string
  messages: OpportunityMessage[]
  participants: string[]
  createdAt: Date
  lastActivity: Date
}

export interface OpportunityMessage {
  id: string
  content: string
  authorId: string
  timestamp: Date
  replyTo?: string
}

export interface OpportunityPermissions {
  canView: string[]
  canEdit: string[]
  canDelete: string[]
  canShare: string[]
  canAssignActions: string[]
}

export class OpportunityRecommendationSystem {

  /**
   * Generate actionable recommendations for a detected opportunity
   */
  async generateRecommendations(opportunity: OpportunityDetectionResult): Promise<OpportunityRecommendation[]> {
    try {
      const recommendations: OpportunityRecommendation[] = []

      // Generate recommendations based on opportunity type
      switch (opportunity.opportunityType) {
        case 'competitor_weakness':
          recommendations.push(...await this.generateWeaknessRecommendations(opportunity))
          break
        case 'market_gap':
          recommendations.push(...await this.generateMarketGapRecommendations(opportunity))
          break
        case 'pricing_opportunity':
          recommendations.push(...await this.generatePricingRecommendations(opportunity))
          break
        case 'talent_acquisition':
          recommendations.push(...await this.generateTalentRecommendations(opportunity))
          break
        case 'partnership_opportunity':
          recommendations.push(...await this.generatePartnershipRecommendations(opportunity))
          break
        default:
          recommendations.push(...await this.generateGenericRecommendations(opportunity))
      }

      // Sort recommendations by priority and expected ROI
      return recommendations.sort((a, b) => {
        const priorityScore = this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority)
        if (priorityScore !== 0) return priorityScore
        return b.expectedROI - a.expectedROI
      })
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }

  /**
   * Calculate priority score for an opportunity based on multiple factors
   */
  async calculatePriorityScore(opportunity: OpportunityDetectionResult): Promise<OpportunityPrioritization> {
    try {
      // Impact scoring (0-10)
      const impactScore = this.calculateImpactScore(opportunity)
      
      // Effort scoring (0-10, inverted - lower effort = higher score)
      const effortScore = this.calculateEffortScore(opportunity)
      
      // Timing scoring (0-10)
      const timingScore = this.calculateTimingScore(opportunity)
      
      // Confidence scoring (0-10)
      const confidenceScore = opportunity.confidence * 10
      
      // Risk scoring (0-10, inverted - lower risk = higher score)
      const riskScore = await this.calculateRiskScore(opportunity)
      
      // Resource availability scoring (0-10)
      const resourceScore = await this.calculateResourceScore(opportunity)
      
      // Strategic alignment scoring (0-10)
      const strategicAlignmentScore = await this.calculateStrategicAlignmentScore(opportunity)
      
      // Competitive advantage scoring (0-10)
      const competitiveAdvantageScore = this.calculateCompetitiveAdvantageScore(opportunity)
      
      // Market timing scoring (0-10)
      const marketTimingScore = await this.calculateMarketTimingScore(opportunity)

      // Weighted priority score calculation
      const weights = {
        impact: 0.25,
        effort: 0.15,
        timing: 0.15,
        confidence: 0.10,
        risk: 0.10,
        resource: 0.10,
        strategicAlignment: 0.10,
        competitiveAdvantage: 0.03,
        marketTiming: 0.02
      }

      const priorityScore = (
        impactScore * weights.impact +
        effortScore * weights.effort +
        timingScore * weights.timing +
        confidenceScore * weights.confidence +
        riskScore * weights.risk +
        resourceScore * weights.resource +
        strategicAlignmentScore * weights.strategicAlignment +
        competitiveAdvantageScore * weights.competitiveAdvantage +
        marketTimingScore * weights.marketTiming
      )

      return {
        opportunityId: opportunity.id,
        priorityScore,
        impactScore,
        effortScore,
        timingScore,
        confidenceScore,
        riskScore,
        resourceScore,
        strategicAlignmentScore,
        competitiveAdvantageScore,
        marketTimingScore
      }
    } catch (error) {
      console.error('Error calculating priority score:', error)
      return {
        opportunityId: opportunity.id,
        priorityScore: 5,
        impactScore: 5,
        effortScore: 5,
        timingScore: 5,
        confidenceScore: 5,
        riskScore: 5,
        resourceScore: 5,
        strategicAlignmentScore: 5,
        competitiveAdvantageScore: 5,
        marketTimingScore: 5
      }
    }
  }

  /**
   * Store opportunity in database with recommendations and prioritization
   */
  async storeOpportunity(
    userId: string, 
    opportunity: OpportunityDetectionResult, 
    recommendations: OpportunityRecommendation[],
    prioritization: OpportunityPrioritization
  ): Promise<string> {
    try {
      // Store the main opportunity
      const [storedOpportunity] = await db
        .insert(competitiveOpportunities)
        .values({
          id: opportunity.id,
          user_id: userId,
          competitor_id: opportunity.competitorId,
          opportunity_type: opportunity.opportunityType,
          title: opportunity.title,
          description: opportunity.description,
          confidence: opportunity.confidence.toString(),
          impact: opportunity.impact,
          effort: opportunity.effort,
          timing: opportunity.timing,
          priority_score: prioritization.priorityScore.toString(),
          evidence: opportunity.evidence,
          recommendations: opportunity.recommendations,
          status: 'identified',
          roi_estimate: this.estimateROI(opportunity).toString(),
          success_metrics: this.generateSuccessMetrics(opportunity),
          tags: this.generateTags(opportunity),
          detected_at: opportunity.detectedAt
        })
        .returning()

      // Store recommended actions
      for (const recommendation of recommendations) {
        await db
          .insert(opportunityActions)
          .values({
            opportunity_id: opportunity.id,
            user_id: userId,
            action_type: recommendation.actionType,
            title: recommendation.title,
            description: recommendation.description,
            priority: recommendation.priority,
            estimated_effort_hours: recommendation.estimatedEffort,
            estimated_cost: recommendation.estimatedCost.toString(),
            expected_outcome: `Expected ROI: ${recommendation.expectedROI}%`,
            status: 'pending'
          })
      }

      // Store initial metrics
      const metrics = this.generateInitialMetrics(opportunity)
      for (const metric of metrics) {
        await db
          .insert(opportunityMetrics)
          .values({
            opportunity_id: opportunity.id,
            user_id: userId,
            metric_name: metric.name,
            metric_type: metric.type,
            baseline_value: metric.baselineValue?.toString(),
            target_value: metric.targetValue?.toString(),
            current_value: metric.baselineValue?.toString(),
            unit: metric.unit
          })
      }

      return opportunity.id
    } catch (error) {
      console.error('Error storing opportunity:', error)
      throw error
    }
  }

  /**
   * Get opportunities for a user with filtering and sorting
   */
  async getOpportunities(
    userId: string,
    filters: {
      status?: string[]
      opportunityType?: string[]
      impact?: string[]
      competitorId?: string
      minPriorityScore?: number
      isArchived?: boolean
    } = {},
    sorting: {
      field: 'priority_score' | 'detected_at' | 'impact' | 'confidence'
      direction: 'asc' | 'desc'
    } = { field: 'priority_score', direction: 'desc' }
  ) {
    try {
      let query = db
        .select({
          opportunity: competitiveOpportunities,
          competitor: competitorProfiles
        })
        .from(competitiveOpportunities)
        .leftJoin(competitorProfiles, eq(competitiveOpportunities.competitor_id, competitorProfiles.id))
        .where(eq(competitiveOpportunities.user_id, userId))

      // Apply filters
      const conditions = [eq(competitiveOpportunities.user_id, userId)]

      if (filters.status?.length) {
        conditions.push(sql`${competitiveOpportunities.status} IN (${filters.status.map(s => `'${s}'`).join(',')})`)
      }

      if (filters.opportunityType?.length) {
        conditions.push(sql`${competitiveOpportunities.opportunity_type} IN (${filters.opportunityType.map(t => `'${t}'`).join(',')})`)
      }

      if (filters.impact?.length) {
        conditions.push(sql`${competitiveOpportunities.impact} IN (${filters.impact.map(i => `'${i}'`).join(',')})`)
      }

      if (filters.competitorId) {
        conditions.push(eq(competitiveOpportunities.competitor_id, filters.competitorId))
      }

      if (filters.minPriorityScore) {
        conditions.push(gte(competitiveOpportunities.priority_score, filters.minPriorityScore.toString()))
      }

      if (filters.isArchived !== undefined) {
        conditions.push(eq(competitiveOpportunities.is_archived, filters.isArchived))
      }

      if (conditions.length > 1) {
        query = query.where(and(...conditions))
      }

      // Apply sorting
      const sortField = competitiveOpportunities[sorting.field]
      query = sorting.direction === 'desc' 
        ? query.orderBy(desc(sortField))
        : query.orderBy(asc(sortField))

      return await query
    } catch (error) {
      console.error('Error getting opportunities:', error)
      return []
    }
  }

  /**
   * Update opportunity status and progress
   */
  async updateOpportunityStatus(
    opportunityId: string, 
    userId: string, 
    status: string, 
    progress?: number,
    notes?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date()
      }

      if (status === 'in_progress' && !progress) {
        updateData.started_at = new Date()
      }

      if (status === 'completed') {
        updateData.completed_at = new Date()
        updateData.progress = 100
      }

      if (notes) {
        updateData.implementation_notes = notes
      }

      await db
        .update(competitiveOpportunities)
        .set(updateData)
        .where(
          and(
            eq(competitiveOpportunities.id, opportunityId),
            eq(competitiveOpportunities.user_id, userId)
          )
        )

      return true
    } catch (error) {
      console.error('Error updating opportunity status:', error)
      return false
    }
  }

  /**
   * Track opportunity ROI and success metrics
   */
  async trackOpportunityROI(
    opportunityId: string,
    userId: string,
    actualROI: number,
    actualRevenue?: number,
    actualCosts?: number,
    notes?: string
  ): Promise<boolean> {
    try {
      await db
        .update(competitiveOpportunities)
        .set({
          actual_roi: actualROI.toString(),
          implementation_notes: notes,
          updated_at: new Date()
        })
        .where(
          and(
            eq(competitiveOpportunities.id, opportunityId),
            eq(competitiveOpportunities.user_id, userId)
          )
        )

      // Update revenue and cost metrics if provided
      if (actualRevenue !== undefined) {
        await this.updateMetric(opportunityId, userId, 'revenue', actualRevenue)
      }

      if (actualCosts !== undefined) {
        await this.updateMetric(opportunityId, userId, 'costs', actualCosts)
      }

      return true
    } catch (error) {
      console.error('Error tracking opportunity ROI:', error)
      return false
    }
  }

  /**
   * Update a specific metric for an opportunity
   */
  async updateMetric(
    opportunityId: string,
    userId: string,
    metricName: string,
    value: number,
    notes?: string
  ): Promise<boolean> {
    try {
      // Check if metric exists
      const existingMetric = await db
        .select()
        .from(opportunityMetrics)
        .where(
          and(
            eq(opportunityMetrics.opportunity_id, opportunityId),
            eq(opportunityMetrics.user_id, userId),
            eq(opportunityMetrics.metric_name, metricName)
          )
        )
        .limit(1)

      if (existingMetric.length > 0) {
        // Update existing metric
        await db
          .update(opportunityMetrics)
          .set({
            current_value: value.toString(),
            measurement_date: new Date(),
            notes,
            updated_at: new Date()
          })
          .where(eq(opportunityMetrics.id, existingMetric[0].id))
      } else {
        // Create new metric
        await db
          .insert(opportunityMetrics)
          .values({
            opportunity_id: opportunityId,
            user_id: userId,
            metric_name: metricName,
            metric_type: 'custom',
            current_value: value.toString(),
            unit: 'units',
            notes
          })
      }

      return true
    } catch (error) {
      console.error('Error updating metric:', error)
      return false
    }
  }

  /**
   * Get opportunity analytics and insights
   */
  async getOpportunityAnalytics(userId: string, timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    try {
      const timeframeDays = {
        week: 7,
        month: 30,
        quarter: 90,
        year: 365
      }

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - timeframeDays[timeframe])

      // Get opportunity statistics
      const stats = await db
        .select({
          total: sql<number>`count(*)`,
          completed: sql<number>`count(*) filter (where status = 'completed')`,
          in_progress: sql<number>`count(*) filter (where status = 'in_progress')`,
          identified: sql<number>`count(*) filter (where status = 'identified')`,
          avg_priority: sql<number>`avg(cast(priority_score as decimal))`,
          total_estimated_roi: sql<number>`sum(cast(roi_estimate as decimal))`,
          total_actual_roi: sql<number>`sum(cast(actual_roi as decimal))`
        })
        .from(competitiveOpportunities)
        .where(
          and(
            eq(competitiveOpportunities.user_id, userId),
            gte(competitiveOpportunities.detected_at, startDate),
            eq(competitiveOpportunities.is_archived, false)
          )
        )

      // Get opportunities by type
      const byType = await db
        .select({
          opportunity_type: competitiveOpportunities.opportunity_type,
          count: sql<number>`count(*)`,
          avg_priority: sql<number>`avg(cast(priority_score as decimal))`
        })
        .from(competitiveOpportunities)
        .where(
          and(
            eq(competitiveOpportunities.user_id, userId),
            gte(competitiveOpportunities.detected_at, startDate),
            eq(competitiveOpportunities.is_archived, false)
          )
        )
        .groupBy(competitiveOpportunities.opportunity_type)

      // Get top performing opportunities
      const topPerforming = await db
        .select()
        .from(competitiveOpportunities)
        .where(
          and(
            eq(competitiveOpportunities.user_id, userId),
            not(isNull(competitiveOpportunities.actual_roi)),
            eq(competitiveOpportunities.is_archived, false)
          )
        )
        .orderBy(desc(competitiveOpportunities.actual_roi))
        .limit(5)

      return {
        stats: stats[0] || {
          total: 0,
          completed: 0,
          in_progress: 0,
          identified: 0,
          avg_priority: 0,
          total_estimated_roi: 0,
          total_actual_roi: 0
        },
        byType,
        topPerforming,
        timeframe
      }
    } catch (error) {
      console.error('Error getting opportunity analytics:', error)
      return null
    }
  }

  // Private helper methods

  private async generateWeaknessRecommendations(opportunity: OpportunityDetectionResult): Promise<OpportunityRecommendation[]> {
    return [
      {
        id: `rec_weakness_${Date.now()}_1`,
        opportunityId: opportunity.id,
        title: 'Develop Superior Solution',
        description: 'Create a product/service that directly addresses the competitor weakness',
        actionType: 'product',
        priority: 'high',
        estimatedEffort: 40,
        estimatedCost: 5000,
        expectedROI: 150,
        timeframe: 'medium-term',
        prerequisites: ['Market research', 'Technical feasibility study'],
        risks: ['Development delays', 'Market timing'],
        successMetrics: ['Customer acquisition', 'Market share gain'],
        resources: ['Development team', 'Marketing budget'],
        confidence: opportunity.confidence,
        createdAt: new Date()
      },
      {
        id: `rec_weakness_${Date.now()}_2`,
        opportunityId: opportunity.id,
        title: 'Targeted Marketing Campaign',
        description: 'Launch marketing campaign highlighting your advantages over competitor weakness',
        actionType: 'marketing',
        priority: 'medium',
        estimatedEffort: 20,
        estimatedCost: 2000,
        expectedROI: 80,
        timeframe: 'short-term',
        prerequisites: ['Marketing materials', 'Target audience analysis'],
        risks: ['Competitor response', 'Brand perception'],
        successMetrics: ['Lead generation', 'Brand awareness'],
        resources: ['Marketing team', 'Creative assets'],
        confidence: opportunity.confidence * 0.8,
        createdAt: new Date()
      }
    ]
  }

  private async generateMarketGapRecommendations(opportunity: OpportunityDetectionResult): Promise<OpportunityRecommendation[]> {
    return [
      {
        id: `rec_gap_${Date.now()}_1`,
        opportunityId: opportunity.id,
        title: 'Market Entry Strategy',
        description: 'Develop strategy to enter the identified market gap',
        actionType: 'strategic',
        priority: 'high',
        estimatedEffort: 60,
        estimatedCost: 10000,
        expectedROI: 200,
        timeframe: 'long-term',
        prerequisites: ['Market analysis', 'Business plan', 'Funding'],
        risks: ['Market validation', 'Competition entry'],
        successMetrics: ['Market penetration', 'Revenue growth'],
        resources: ['Strategy team', 'Investment capital'],
        confidence: opportunity.confidence,
        createdAt: new Date()
      }
    ]
  }

  private async generatePricingRecommendations(opportunity: OpportunityDetectionResult): Promise<OpportunityRecommendation[]> {
    return [
      {
        id: `rec_pricing_${Date.now()}_1`,
        opportunityId: opportunity.id,
        title: 'Pricing Strategy Optimization',
        description: 'Adjust pricing to capitalize on competitor pricing gaps',
        actionType: 'pricing',
        priority: 'high',
        estimatedEffort: 10,
        estimatedCost: 500,
        expectedROI: 120,
        timeframe: 'immediate',
        prerequisites: ['Pricing analysis', 'Customer research'],
        risks: ['Customer reaction', 'Margin impact'],
        successMetrics: ['Revenue increase', 'Market share'],
        resources: ['Pricing team', 'Analytics tools'],
        confidence: opportunity.confidence,
        createdAt: new Date()
      }
    ]
  }

  private async generateTalentRecommendations(opportunity: OpportunityDetectionResult): Promise<OpportunityRecommendation[]> {
    return [
      {
        id: `rec_talent_${Date.now()}_1`,
        opportunityId: opportunity.id,
        title: 'Strategic Talent Acquisition',
        description: 'Recruit key talent from competitor during their hiring challenges',
        actionType: 'talent',
        priority: 'medium',
        estimatedEffort: 30,
        estimatedCost: 15000,
        expectedROI: 100,
        timeframe: 'short-term',
        prerequisites: ['Talent pipeline', 'Competitive packages'],
        risks: ['Legal issues', 'Cultural fit'],
        successMetrics: ['Key hires', 'Team capability'],
        resources: ['HR team', 'Recruitment budget'],
        confidence: opportunity.confidence * 0.7,
        createdAt: new Date()
      }
    ]
  }

  private async generatePartnershipRecommendations(opportunity: OpportunityDetectionResult): Promise<OpportunityRecommendation[]> {
    return [
      {
        id: `rec_partnership_${Date.now()}_1`,
        opportunityId: opportunity.id,
        title: 'Strategic Partnership Development',
        description: 'Develop partnerships to fill gaps left by competitor relationship changes',
        actionType: 'partnership',
        priority: 'medium',
        estimatedEffort: 50,
        estimatedCost: 8000,
        expectedROI: 90,
        timeframe: 'medium-term',
        prerequisites: ['Partner identification', 'Value proposition'],
        risks: ['Partnership failure', 'Integration challenges'],
        successMetrics: ['Partnership deals', 'Revenue impact'],
        resources: ['Business development', 'Legal support'],
        confidence: opportunity.confidence * 0.6,
        createdAt: new Date()
      }
    ]
  }

  private async generateGenericRecommendations(opportunity: OpportunityDetectionResult): Promise<OpportunityRecommendation[]> {
    return [
      {
        id: `rec_generic_${Date.now()}_1`,
        opportunityId: opportunity.id,
        title: 'Opportunity Research',
        description: 'Conduct detailed research to understand the opportunity better',
        actionType: 'research',
        priority: 'medium',
        estimatedEffort: 15,
        estimatedCost: 1000,
        expectedROI: 50,
        timeframe: 'short-term',
        prerequisites: ['Research plan'],
        risks: ['Time investment'],
        successMetrics: ['Research insights', 'Action plan'],
        resources: ['Research team'],
        confidence: opportunity.confidence * 0.5,
        createdAt: new Date()
      }
    ]
  }

  private getPriorityScore(priority: string): number {
    const scores = { low: 1, medium: 2, high: 3, critical: 4 }
    return scores[priority as keyof typeof scores] || 2
  }

  private calculateImpactScore(opportunity: OpportunityDetectionResult): number {
    const impactScores = { low: 2, medium: 5, high: 8, critical: 10 }
    return impactScores[opportunity.impact] || 5
  }

  private calculateEffortScore(opportunity: OpportunityDetectionResult): number {
    const effortScores = { low: 10, medium: 6, high: 3 }
    return effortScores[opportunity.effort] || 6
  }

  private calculateTimingScore(opportunity: OpportunityDetectionResult): number {
    const timingScores = { immediate: 10, 'short-term': 8, 'medium-term': 5, 'long-term': 3 }
    return timingScores[opportunity.timing] || 5
  }

  private async calculateRiskScore(opportunity: OpportunityDetectionResult): Promise<number> {
    // Simple risk assessment based on opportunity type and evidence
    let riskScore = 7 // Default medium-low risk
    
    if (opportunity.evidence.length < 3) riskScore -= 2
    if (opportunity.confidence < 0.5) riskScore -= 2
    if (opportunity.opportunityType === 'partnership_opportunity') riskScore -= 1
    
    return Math.max(1, Math.min(10, riskScore))
  }

  private async calculateResourceScore(opportunity: OpportunityDetectionResult): Promise<number> {
    // Simplified resource availability assessment
    return 6 // Default medium resource availability
  }

  private async calculateStrategicAlignmentScore(opportunity: OpportunityDetectionResult): Promise<number> {
    // Simplified strategic alignment assessment
    return 7 // Default good strategic alignment
  }

  private calculateCompetitiveAdvantageScore(opportunity: OpportunityDetectionResult): number {
    // Higher confidence and more evidence = higher competitive advantage
    return Math.min(10, (opportunity.confidence * 5) + (opportunity.evidence.length * 0.5))
  }

  private async calculateMarketTimingScore(opportunity: OpportunityDetectionResult): Promise<number> {
    // Immediate and short-term opportunities have better market timing
    const timingScores = { immediate: 10, 'short-term': 8, 'medium-term': 6, 'long-term': 4 }
    return timingScores[opportunity.timing] || 6
  }

  private estimateROI(opportunity: OpportunityDetectionResult): number {
    // Simple ROI estimation based on impact and effort
    const impactMultiplier = { low: 50, medium: 100, high: 200, critical: 400 }
    const effortDivisor = { low: 1, medium: 2, high: 4 }
    
    const baseROI = impactMultiplier[opportunity.impact] || 100
    const effortAdjustment = effortDivisor[opportunity.effort] || 2
    
    return Math.round((baseROI / effortAdjustment) * opportunity.confidence)
  }

  private generateSuccessMetrics(opportunity: OpportunityDetectionResult): Record<string, any> {
    const baseMetrics = {
      revenue_impact: { target: 10000, unit: 'USD' },
      market_share: { target: 5, unit: 'percentage' },
      customer_acquisition: { target: 100, unit: 'customers' }
    }

    // Customize metrics based on opportunity type
    switch (opportunity.opportunityType) {
      case 'pricing_opportunity':
        return {
          ...baseMetrics,
          pricing_optimization: { target: 15, unit: 'percentage' }
        }
      case 'talent_acquisition':
        return {
          ...baseMetrics,
          key_hires: { target: 3, unit: 'employees' }
        }
      default:
        return baseMetrics
    }
  }

  private generateTags(opportunity: OpportunityDetectionResult): string[] {
    const tags = [opportunity.opportunityType, opportunity.impact, opportunity.timing]
    
    // Add specific tags based on evidence
    if (opportunity.evidence.some(e => e.type === 'social_media')) {
      tags.push('social_media_driven')
    }
    
    if (opportunity.evidence.some(e => e.type === 'pricing_data')) {
      tags.push('pricing_related')
    }
    
    return tags
  }

  private generateInitialMetrics(opportunity: OpportunityDetectionResult): OpportunityMetric[] {
    return [
      {
        id: `metric_${Date.now()}_1`,
        name: 'Revenue Impact',
        type: 'revenue',
        baselineValue: 0,
        targetValue: this.estimateROI(opportunity) * 100,
        currentValue: 0,
        unit: 'USD',
        measurementDate: new Date(),
        trend: 'stable'
      },
      {
        id: `metric_${Date.now()}_2`,
        name: 'Implementation Progress',
        type: 'efficiency',
        baselineValue: 0,
        targetValue: 100,
        currentValue: 0,
        unit: 'percentage',
        measurementDate: new Date(),
        trend: 'stable'
      }
    ]
  }
}

// Export singleton instance
export const opportunityRecommendationSystem = new OpportunityRecommendationSystem()