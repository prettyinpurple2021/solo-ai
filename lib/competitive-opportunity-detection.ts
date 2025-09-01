import { db } from '@/db'
import { competitors, intelligenceData, competitorAlerts } from '@/db/schema'
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm'

// Types for opportunity detection
export interface OpportunityDetectionResult {
  id: string
  competitorId: string
  opportunityType: OpportunityType
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  effort: 'low' | 'medium' | 'high'
  timing: 'immediate' | 'short-term' | 'medium-term' | 'long-term'
  evidence: OpportunityEvidence[]
  recommendations: string[]
  detectedAt: Date
}

export type OpportunityType = 
  | 'competitor_weakness'
  | 'market_gap'
  | 'pricing_opportunity'
  | 'talent_acquisition'
  | 'partnership_opportunity'
  | 'product_gap'
  | 'service_improvement'
  | 'technology_advantage'
  | 'market_entry'

export interface OpportunityEvidence {
  type: 'customer_complaint' | 'review' | 'social_media' | 'hiring_data' | 'pricing_data' | 'product_data' | 'news' | 'partnership_change'
  source: string
  content: string
  sentiment?: number
  relevance: number
  collectedAt: Date
}

export interface CompetitorWeakness {
  competitorId: string
  weaknessType: 'product' | 'service' | 'pricing' | 'customer_satisfaction' | 'technology' | 'talent' | 'market_position'
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  evidence: OpportunityEvidence[]
  opportunityPotential: number
}

export interface MarketGap {
  gapType: 'product_feature' | 'service_offering' | 'market_segment' | 'geographic' | 'demographic' | 'price_point'
  description: string
  marketSize: 'small' | 'medium' | 'large' | 'massive'
  competitorsCovering: string[]
  competitorsNotCovering: string[]
  entryBarriers: string[]
  opportunityScore: number
}

export interface PricingOpportunity {
  competitorId: string
  opportunityType: 'underpricing' | 'overpricing' | 'pricing_gap' | 'value_mismatch'
  currentPrice: number
  suggestedPrice: number
  potentialRevenue: number
  marketPosition: 'premium' | 'mid-market' | 'budget'
  confidence: number
}

export interface TalentOpportunity {
  competitorId: string
  opportunityType: 'hiring_freeze' | 'layoffs' | 'key_departure' | 'skill_gap' | 'location_gap'
  roles: string[]
  seniority: 'junior' | 'mid' | 'senior' | 'executive'
  skills: string[]
  estimatedSalary?: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

export interface PartnershipOpportunity {
  competitorId: string
  opportunityType: 'partnership_end' | 'partnership_conflict' | 'integration_gap' | 'channel_gap'
  partnerType: 'technology' | 'distribution' | 'marketing' | 'strategic'
  description: string
  potentialValue: 'low' | 'medium' | 'high' | 'strategic'
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term'
}

export class CompetitiveOpportunityDetector {
  
  /**
   * Detect competitor weaknesses based on customer complaints and reviews
   */
  async detectCompetitorWeaknesses(competitorId: string): Promise<CompetitorWeakness[]> {
    try {
      // Get recent intelligence data for the competitor
      const recentData = await db
        .select()
        .from(intelligenceData)
        .where(
          and(
            eq(intelligenceData.competitorId, competitorId),
            gte(intelligenceData.collectedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
          )
        )
        .orderBy(desc(intelligenceData.collectedAt))

      const weaknesses: CompetitorWeakness[] = []

      // Analyze customer complaints and reviews
      const reviewData = recentData.filter(d => 
        d.dataType === 'review' || 
        d.dataType === 'social_media' || 
        d.dataType === 'customer_feedback'
      )

      // Group complaints by category
      const complaintCategories = this.categorizeComplaints(reviewData)
      
      for (const [category, complaints] of Object.entries(complaintCategories)) {
        if (complaints.length >= 3) { // Threshold for pattern detection
          const avgSentiment = complaints.reduce((sum, c) => sum + (c.sentiment || 0), 0) / complaints.length
          
          if (avgSentiment < -0.3) { // Negative sentiment threshold
            const weakness: CompetitorWeakness = {
              competitorId,
              weaknessType: this.mapCategoryToWeaknessType(category),
              description: `Recurring customer complaints about ${category.toLowerCase()}`,
              severity: this.calculateSeverity(complaints.length, avgSentiment),
              evidence: complaints.map(c => ({
                type: 'customer_complaint',
                source: c.source || 'Unknown',
                content: c.extractedData?.content || c.rawContent?.toString() || '',
                sentiment: c.extractedData?.sentiment?.score,
                relevance: 0.8,
                collectedAt: c.collectedAt
              })),
              opportunityPotential: this.calculateOpportunityPotential(complaints.length, avgSentiment)
            }
            weaknesses.push(weakness)
          }
        }
      }

      // Analyze product/service gaps from social media mentions
      const socialMentions = recentData.filter(d => d.dataType === 'social_media')
      const productGaps = this.detectProductGapsFromSocial(socialMentions, competitorId)
      weaknesses.push(...productGaps)

      return weaknesses
    } catch (error) {
      console.error('Error detecting competitor weaknesses:', error)
      return []
    }
  }

  /**
   * Identify market gaps from competitor product and service analysis
   */
  async identifyMarketGaps(competitorIds: string[]): Promise<MarketGap[]> {
    try {
      const gaps: MarketGap[] = []
      
      // Get product and service data for all competitors
      const productData = await db
        .select()
        .from(intelligenceData)
        .where(
          and(
            sql`${intelligenceData.competitorId} IN (${competitorIds.map(id => `'${id}'`).join(',')})`,
            sql`${intelligenceData.dataType} IN ('product', 'service', 'website', 'pricing')`
          )
        )

      // Analyze feature coverage across competitors
      const featureMatrix = this.buildFeatureMatrix(productData)
      const uncoveredFeatures = this.findUncoveredFeatures(featureMatrix)
      
      for (const feature of uncoveredFeatures) {
        const gap: MarketGap = {
          gapType: 'product_feature',
          description: `Feature gap: ${feature.name} - only covered by ${feature.coveragePercentage}% of competitors`,
          marketSize: this.estimateMarketSize(feature),
          competitorsCovering: feature.competitorsCovering,
          competitorsNotCovering: feature.competitorsNotCovering,
          entryBarriers: this.assessEntryBarriers(feature),
          opportunityScore: this.calculateGapOpportunityScore(feature)
        }
        gaps.push(gap)
      }

      // Analyze pricing gaps
      const pricingGaps = this.identifyPricingGaps(productData)
      gaps.push(...pricingGaps)

      // Analyze geographic gaps
      const geoGaps = await this.identifyGeographicGaps(competitorIds)
      gaps.push(...geoGaps)

      return gaps
    } catch (error) {
      console.error('Error identifying market gaps:', error)
      return []
    }
  }

  /**
   * Detect pricing opportunities based on competitive pricing analysis
   */
  async detectPricingOpportunities(competitorId: string): Promise<PricingOpportunity[]> {
    try {
      const opportunities: PricingOpportunity[] = []
      
      // Get pricing data for the competitor and their competitors
      const pricingData = await db
        .select()
        .from(intelligenceData)
        .where(
          and(
            eq(intelligenceData.dataType, 'pricing'),
            gte(intelligenceData.collectedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
          )
        )

      const competitorPricing = pricingData.filter(d => d.competitorId === competitorId)
      const marketPricing = pricingData.filter(d => d.competitorId !== competitorId)

      for (const pricing of competitorPricing) {
        const analysis = this.analyzePricingPosition(pricing, marketPricing)
        
        if (analysis.opportunityDetected) {
          const opportunity: PricingOpportunity = {
            competitorId,
            opportunityType: analysis.type,
            currentPrice: analysis.currentPrice,
            suggestedPrice: analysis.suggestedPrice,
            potentialRevenue: analysis.potentialRevenue,
            marketPosition: analysis.marketPosition,
            confidence: analysis.confidence
          }
          opportunities.push(opportunity)
        }
      }

      return opportunities
    } catch (error) {
      console.error('Error detecting pricing opportunities:', error)
      return []
    }
  }

  /**
   * Identify talent acquisition opportunities from competitor hiring patterns
   */
  async identifyTalentOpportunities(competitorId: string): Promise<TalentOpportunity[]> {
    try {
      const opportunities: TalentOpportunity[] = []
      
      // Get hiring and job posting data
      const hiringData = await db
        .select()
        .from(intelligenceData)
        .where(
          and(
            eq(intelligenceData.competitorId, competitorId),
            eq(intelligenceData.dataType, 'job_posting'),
            gte(intelligenceData.collectedAt, new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)) // Last 60 days
          )
        )

      // Detect hiring freezes
      const hiringFreeze = this.detectHiringFreeze(hiringData)
      if (hiringFreeze.detected) {
        opportunities.push({
          competitorId,
          opportunityType: 'hiring_freeze',
          roles: hiringFreeze.affectedRoles,
          seniority: 'mid',
          skills: hiringFreeze.skills,
          urgency: 'high'
        })
      }

      // Detect key departures from social media and news
      const departureData = await db
        .select()
        .from(intelligenceData)
        .where(
          and(
            eq(intelligenceData.competitorId, competitorId),
            sql`${intelligenceData.dataType} IN ('social_media', 'news')`,
            gte(intelligenceData.collectedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          )
        )

      const keyDepartures = this.detectKeyDepartures(departureData)
      opportunities.push(...keyDepartures)

      // Analyze skill gaps from job postings
      const skillGaps = this.analyzeSkillGaps(hiringData)
      opportunities.push(...skillGaps)

      return opportunities
    } catch (error) {
      console.error('Error identifying talent opportunities:', error)
      return []
    }
  }

  /**
   * Detect partnership opportunities from competitor relationship changes
   */
  async detectPartnershipOpportunities(competitorId: string): Promise<PartnershipOpportunity[]> {
    try {
      const opportunities: PartnershipOpportunity[] = []
      
      // Get news and social media data about partnerships
      const partnershipData = await db
        .select()
        .from(intelligenceData)
        .where(
          and(
            eq(intelligenceData.competitorId, competitorId),
            sql`${intelligenceData.dataType} IN ('news', 'social_media', 'press_release')`,
            gte(intelligenceData.collectedAt, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) // Last 90 days
          )
        )

      // Detect partnership endings
      const partnershipEndings = this.detectPartnershipEndings(partnershipData)
      opportunities.push(...partnershipEndings)

      // Detect integration gaps
      const integrationGaps = this.detectIntegrationGaps(partnershipData)
      opportunities.push(...integrationGaps)

      // Analyze channel gaps
      const channelGaps = await this.analyzeChannelGaps(competitorId)
      opportunities.push(...channelGaps)

      return opportunities
    } catch (error) {
      console.error('Error detecting partnership opportunities:', error)
      return []
    }
  }

  // Helper methods for analysis

  private categorizeComplaints(reviewData: any[]): Record<string, any[]> {
    const categories: Record<string, any[]> = {
      'Customer Service': [],
      'Product Quality': [],
      'Pricing': [],
      'User Experience': [],
      'Performance': [],
      'Features': [],
      'Support': [],
      'Reliability': []
    }

    for (const review of reviewData) {
      const content = review.extractedData?.content || review.rawContent?.toString() || ''
      const category = this.classifyComplaint(content)
      if (categories[category]) {
        categories[category].push(review)
      }
    }

    return categories
  }

  private classifyComplaint(content: string): string {
    const keywords = {
      'Customer Service': ['support', 'service', 'help', 'response', 'staff', 'representative'],
      'Product Quality': ['quality', 'broken', 'defect', 'poor', 'cheap', 'flimsy'],
      'Pricing': ['expensive', 'price', 'cost', 'money', 'value', 'overpriced'],
      'User Experience': ['confusing', 'difficult', 'hard to use', 'interface', 'navigation'],
      'Performance': ['slow', 'fast', 'speed', 'performance', 'lag', 'loading'],
      'Features': ['feature', 'functionality', 'missing', 'lacking', 'need'],
      'Support': ['documentation', 'tutorial', 'guide', 'help', 'support'],
      'Reliability': ['crash', 'bug', 'error', 'reliable', 'stable', 'downtime']
    }

    const lowerContent = content.toLowerCase()
    let bestMatch = 'Product Quality'
    let maxScore = 0

    for (const [category, words] of Object.entries(keywords)) {
      const score = words.reduce((sum, word) => {
        return sum + (lowerContent.includes(word) ? 1 : 0)
      }, 0)
      
      if (score > maxScore) {
        maxScore = score
        bestMatch = category
      }
    }

    return bestMatch
  }

  private mapCategoryToWeaknessType(category: string): CompetitorWeakness['weaknessType'] {
    const mapping: Record<string, CompetitorWeakness['weaknessType']> = {
      'Customer Service': 'service',
      'Product Quality': 'product',
      'Pricing': 'pricing',
      'User Experience': 'product',
      'Performance': 'technology',
      'Features': 'product',
      'Support': 'service',
      'Reliability': 'technology'
    }
    return mapping[category] || 'product'
  }

  private calculateSeverity(complaintCount: number, avgSentiment: number): CompetitorWeakness['severity'] {
    const severityScore = (complaintCount / 10) + Math.abs(avgSentiment)
    
    if (severityScore >= 2) return 'critical'
    if (severityScore >= 1.5) return 'high'
    if (severityScore >= 1) return 'medium'
    return 'low'
  }

  private calculateOpportunityPotential(complaintCount: number, avgSentiment: number): number {
    return Math.min(1, (complaintCount / 20) + Math.abs(avgSentiment))
  }

  private detectProductGapsFromSocial(socialMentions: any[], competitorId: string): CompetitorWeakness[] {
    // Implementation for detecting product gaps from social media
    return []
  }

  private buildFeatureMatrix(productData: any[]): any {
    // Implementation for building feature coverage matrix
    return {}
  }

  private findUncoveredFeatures(featureMatrix: any): any[] {
    // Implementation for finding uncovered features
    return []
  }

  private estimateMarketSize(feature: any): MarketGap['marketSize'] {
    // Implementation for estimating market size
    return 'medium'
  }

  private assessEntryBarriers(feature: any): string[] {
    // Implementation for assessing entry barriers
    return []
  }

  private calculateGapOpportunityScore(feature: any): number {
    // Implementation for calculating opportunity score
    return 0.5
  }

  private identifyPricingGaps(productData: any[]): MarketGap[] {
    // Implementation for identifying pricing gaps
    return []
  }

  private async identifyGeographicGaps(competitorIds: string[]): Promise<MarketGap[]> {
    // Implementation for identifying geographic gaps
    return []
  }

  private analyzePricingPosition(pricing: any, marketPricing: any[]): any {
    // Implementation for analyzing pricing position
    return {
      opportunityDetected: false,
      type: 'underpricing' as const,
      currentPrice: 0,
      suggestedPrice: 0,
      potentialRevenue: 0,
      marketPosition: 'mid-market' as const,
      confidence: 0
    }
  }

  private detectHiringFreeze(hiringData: any[]): any {
    // Implementation for detecting hiring freezes
    return {
      detected: false,
      affectedRoles: [],
      skills: []
    }
  }

  private detectKeyDepartures(departureData: any[]): TalentOpportunity[] {
    // Implementation for detecting key departures
    return []
  }

  private analyzeSkillGaps(hiringData: any[]): TalentOpportunity[] {
    // Implementation for analyzing skill gaps
    return []
  }

  private detectPartnershipEndings(partnershipData: any[]): PartnershipOpportunity[] {
    // Implementation for detecting partnership endings
    return []
  }

  private detectIntegrationGaps(partnershipData: any[]): PartnershipOpportunity[] {
    // Implementation for detecting integration gaps
    return []
  }

  private async analyzeChannelGaps(competitorId: string): Promise<PartnershipOpportunity[]> {
    // Implementation for analyzing channel gaps
    return []
  }

  /**
   * Generate comprehensive opportunity analysis for a competitor
   */
  async generateOpportunityAnalysis(competitorId: string): Promise<OpportunityDetectionResult[]> {
    try {
      const opportunities: OpportunityDetectionResult[] = []

      // Detect all types of opportunities
      const [
        weaknesses,
        pricingOpportunities,
        talentOpportunities,
        partnershipOpportunities
      ] = await Promise.all([
        this.detectCompetitorWeaknesses(competitorId),
        this.detectPricingOpportunities(competitorId),
        this.identifyTalentOpportunities(competitorId),
        this.detectPartnershipOpportunities(competitorId)
      ])

      // Convert weaknesses to opportunities
      for (const weakness of weaknesses) {
        opportunities.push({
          id: `weakness_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          competitorId,
          opportunityType: 'competitor_weakness',
          title: `Competitor Weakness: ${weakness.description}`,
          description: `Opportunity to capitalize on ${weakness.weaknessType} weakness`,
          confidence: weakness.opportunityPotential,
          impact: weakness.severity,
          effort: this.estimateEffort(weakness),
          timing: this.estimateTiming(weakness),
          evidence: weakness.evidence,
          recommendations: this.generateWeaknessRecommendations(weakness),
          detectedAt: new Date()
        })
      }

      // Convert pricing opportunities
      for (const pricing of pricingOpportunities) {
        opportunities.push({
          id: `pricing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          competitorId,
          opportunityType: 'pricing_opportunity',
          title: `Pricing Opportunity: ${pricing.opportunityType}`,
          description: `Potential to optimize pricing strategy`,
          confidence: pricing.confidence,
          impact: this.mapPricingImpact(pricing.potentialRevenue),
          effort: 'low',
          timing: 'immediate',
          evidence: [],
          recommendations: this.generatePricingRecommendations(pricing),
          detectedAt: new Date()
        })
      }

      // Convert talent opportunities
      for (const talent of talentOpportunities) {
        opportunities.push({
          id: `talent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          competitorId,
          opportunityType: 'talent_acquisition',
          title: `Talent Opportunity: ${talent.opportunityType}`,
          description: `Opportunity to acquire talent from competitor`,
          confidence: 0.7,
          impact: this.mapTalentImpact(talent.urgency),
          effort: 'medium',
          timing: this.mapTalentTiming(talent.urgency),
          evidence: [],
          recommendations: this.generateTalentRecommendations(talent),
          detectedAt: new Date()
        })
      }

      // Convert partnership opportunities
      for (const partnership of partnershipOpportunities) {
        opportunities.push({
          id: `partnership_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          competitorId,
          opportunityType: 'partnership_opportunity',
          title: `Partnership Opportunity: ${partnership.opportunityType}`,
          description: partnership.description,
          confidence: 0.6,
          impact: this.mapPartnershipImpact(partnership.potentialValue),
          effort: 'high',
          timing: partnership.timeframe,
          evidence: [],
          recommendations: this.generatePartnershipRecommendations(partnership),
          detectedAt: new Date()
        })
      }

      return opportunities.sort((a, b) => {
        // Sort by impact and confidence
        const scoreA = this.calculateOpportunityScore(a)
        const scoreB = this.calculateOpportunityScore(b)
        return scoreB - scoreA
      })
    } catch (error) {
      console.error('Error generating opportunity analysis:', error)
      return []
    }
  }

  private estimateEffort(weakness: CompetitorWeakness): OpportunityDetectionResult['effort'] {
    if (weakness.severity === 'critical') return 'low'
    if (weakness.severity === 'high') return 'medium'
    return 'high'
  }

  private estimateTiming(weakness: CompetitorWeakness): OpportunityDetectionResult['timing'] {
    if (weakness.severity === 'critical') return 'immediate'
    if (weakness.severity === 'high') return 'short-term'
    return 'medium-term'
  }

  private generateWeaknessRecommendations(weakness: CompetitorWeakness): string[] {
    const recommendations = [
      `Address the ${weakness.weaknessType} gap that competitor is struggling with`,
      `Highlight your superior ${weakness.weaknessType} in marketing materials`,
      `Target competitor's dissatisfied customers with improved solution`
    ]
    return recommendations
  }

  private mapPricingImpact(revenue: number): OpportunityDetectionResult['impact'] {
    if (revenue > 100000) return 'critical'
    if (revenue > 50000) return 'high'
    if (revenue > 10000) return 'medium'
    return 'low'
  }

  private generatePricingRecommendations(pricing: PricingOpportunity): string[] {
    return [
      `Adjust pricing to ${pricing.suggestedPrice} to capture market opportunity`,
      `Position product as better value compared to competitor`,
      `Consider premium pricing strategy if competitor is underpricing`
    ]
  }

  private mapTalentImpact(urgency: TalentOpportunity['urgency']): OpportunityDetectionResult['impact'] {
    const mapping = {
      'critical': 'critical' as const,
      'high': 'high' as const,
      'medium': 'medium' as const,
      'low': 'low' as const
    }
    return mapping[urgency]
  }

  private mapTalentTiming(urgency: TalentOpportunity['urgency']): OpportunityDetectionResult['timing'] {
    const mapping = {
      'critical': 'immediate' as const,
      'high': 'short-term' as const,
      'medium': 'medium-term' as const,
      'low': 'long-term' as const
    }
    return mapping[urgency]
  }

  private generateTalentRecommendations(talent: TalentOpportunity): string[] {
    return [
      `Reach out to ${talent.roles.join(', ')} professionals from competitor`,
      `Offer competitive packages for ${talent.seniority} level talent`,
      `Leverage competitor's talent gaps to build stronger team`
    ]
  }

  private mapPartnershipImpact(value: PartnershipOpportunity['potentialValue']): OpportunityDetectionResult['impact'] {
    const mapping = {
      'strategic': 'critical' as const,
      'high': 'high' as const,
      'medium': 'medium' as const,
      'low': 'low' as const
    }
    return mapping[value]
  }

  private generatePartnershipRecommendations(partnership: PartnershipOpportunity): string[] {
    return [
      `Explore partnership opportunities in ${partnership.partnerType} space`,
      `Reach out to partners affected by competitor relationship changes`,
      `Position as better alternative partner with superior offering`
    ]
  }

  private calculateOpportunityScore(opportunity: OpportunityDetectionResult): number {
    const impactScore = { low: 1, medium: 2, high: 3, critical: 4 }[opportunity.impact]
    const effortScore = { low: 3, medium: 2, high: 1 }[opportunity.effort]
    const timingScore = { immediate: 4, 'short-term': 3, 'medium-term': 2, 'long-term': 1 }[opportunity.timing]
    
    return (impactScore * 0.4 + effortScore * 0.3 + timingScore * 0.2 + opportunity.confidence * 0.1)
  }
}

// Export singleton instance
export const competitiveOpportunityDetector = new CompetitiveOpportunityDetector()