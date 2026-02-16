import { logError } from '@/lib/logger'
import { generateText } from 'ai'
import { getTeamMemberConfig } from './ai-config'
import { db } from '@/db'
import { intelligenceData, competitorProfiles } from '@/shared/db/schema'
import { eq, and, gte, desc } from 'drizzle-orm'

import type {
  CompetitorProfile, 
  IntelligenceData, 
  AnalysisResult, 
  Insight, 
  Recommendation,
  PromptIntelligenceData 
} from './competitor-intelligence-types'
import { MarketIntelligenceService } from './market-intelligence-service'

// Blaze-specific pricing and growth intelligence types
export interface GrowthIntelligenceAnalysis {
  competitorId: string
  analysisType: 'pricing_strategy' | 'growth_analysis' | 'market_positioning' | 'revenue_optimization' | 'expansion_patterns'
  insights: GrowthInsight[]
  recommendations: GrowthRecommendation[]
  confidence: number
  analyzedAt: Date
}

export interface GrowthInsight extends Omit<Insight, 'type'> {
  type: 'pricing' | 'strategic' | 'opportunity'
  growthCategory: 'pricing' | 'market_expansion' | 'customer_acquisition' | 'revenue_optimization' | 'competitive_response'
  revenueImpact: string
  marketImplications: string[]
  competitiveAdvantage: string
  implementationComplexity: 'low' | 'medium' | 'high'
}

export interface GrowthRecommendation extends Omit<Recommendation, 'type'> {
  type: 'offensive' | 'defensive' | 'strategic'
  growthAction: 'pricing_adjustment' | 'market_entry' | 'product_positioning' | 'competitive_response' | 'revenue_optimization'
  revenueImpact: string
  marketTiming: 'immediate' | 'short_term' | 'medium_term' | 'long_term'
  investmentRequired: string
  riskAssessment: string
  successMetrics: string[]
}

export interface PricingModel {
  type: 'subscription' | 'one_time' | 'freemium' | 'usage_based' | 'tiered' | 'custom'
  billingCycle?: 'monthly' | 'quarterly' | 'annually' | 'usage'
  currency: string
  hasFreeTier: boolean
  hasTrial: boolean
  trialDuration?: number
}

export interface PricePoint {
  tier: string
  price: number
  currency: string
  billingCycle: string
  features: string[]
  limitations?: string[]
  targetSegment: string
}

export interface PricingTier {
  name: string
  position: number
  price: number
  currency: string
  billingCycle: string
  features: string[]
  limitations: string[]
  targetMarket: string
  competitiveAdvantage?: string
}

export interface PricingChange {
  date: Date
  changeType: 'increase' | 'decrease' | 'new_tier' | 'removed_tier' | 'feature_change'
  oldPrice?: number
  newPrice?: number
  affectedTier: string
  reason?: string
  marketResponse?: string
}

export interface CompetitivePricingAnalysis {
  marketPosition: 'premium' | 'mid_market' | 'budget' | 'value'
  priceAdvantage: number // percentage difference from market average
  valueProposition: string
  pricingGaps: PricingGap[]
  recommendedActions: PricingRecommendation[]
}

export interface PricingGap {
  segment: string
  opportunity: string
  potentialRevenue: string
  competitorWeakness: string
  recommendedPrice: number
}

export interface PricingRecommendation {
  action: string
  rationale: string
  expectedImpact: string
  riskLevel: 'low' | 'medium' | 'high'
  timeline: string
}

export interface PricingStrategyAnalysis {
  competitorId: string
  pricingModel: PricingModel
  pricePoints: PricePoint[]
  pricingTiers: PricingTier[]
  pricingChanges: PricingChange[]
  competitivePricing: CompetitivePricingAnalysis
  pricingStrategy: string
  marketPositioning: string
  analyzedAt: Date
}

export interface GrowthPatternAnalysis {
  competitorId: string
  growthMetrics: GrowthMetric[]
  expansionPatterns: ExpansionPattern[]
  customerAcquisition: CustomerAcquisitionAnalysis
  revenueGrowth: RevenueGrowthAnalysis
  marketExpansion: MarketExpansionAnalysis
  competitivePositioning: CompetitivePositioning
  analyzedAt: Date
}

export interface GrowthMetric {
  metric: string
  value: number
  trend: 'increasing' | 'decreasing' | 'stable'
  changeRate: number
  timeframe: string
  benchmark?: number
}

export interface ExpansionPattern {
  type: 'geographic' | 'product' | 'market_segment' | 'channel' | 'partnership'
  description: string
  timeline: string
  investmentLevel: 'low' | 'medium' | 'high'
  successIndicators: string[]
  riskFactors: string[]
}

export interface CustomerAcquisitionAnalysis {
  channels: AcquisitionChannel[]
  costTrends: CostTrend[]
  conversionRates: ConversionRate[]
  retentionMetrics: RetentionMetric[]
  competitiveAdvantages: string[]
}

export interface AcquisitionChannel {
  channel: string
  effectiveness: 'high' | 'medium' | 'low'
  cost: string
  volume: string
  trend: 'growing' | 'declining' | 'stable'
}

export interface CostTrend {
  metric: string
  currentCost: number
  trend: 'increasing' | 'decreasing' | 'stable'
  efficiency: number
}

export interface ConversionRate {
  funnel: string
  rate: number
  trend: 'improving' | 'declining' | 'stable'
  benchmark?: number
}

export interface RetentionMetric {
  timeframe: string
  rate: number
  trend: 'improving' | 'declining' | 'stable'
  churnReasons: string[]
}

export interface RevenueGrowthAnalysis {
  growthRate: number
  revenueStreams: RevenueStream[]
  seasonality: SeasonalityPattern[]
  predictedGrowth: GrowthPrediction[]
  riskFactors: string[]
}

export interface RevenueStream {
  source: string
  contribution: number
  growth: number
  stability: 'high' | 'medium' | 'low'
  trend: 'growing' | 'declining' | 'stable'
}

export interface SeasonalityPattern {
  period: string
  impact: number
  description: string
}

export interface GrowthPrediction {
  timeframe: string
  predictedGrowth: number
  confidence: number
  assumptions: string[]
}

export interface MarketExpansionAnalysis {
  currentMarkets: Market[]
  targetMarkets: Market[]
  expansionStrategy: string
  barriers: string[]
  opportunities: string[]
  timeline: string
}

export interface Market {
  name: string
  size: string
  growth: number
  competition: 'low' | 'medium' | 'high'
  entryBarriers: string[]
  opportunity: string
}

export interface CompetitivePositioning {
  marketShare: number
  position: 'leader' | 'challenger' | 'follower' | 'niche'
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

/**
 * Blaze Growth Intelligence Service
 * Analyzes competitor pricing strategies and growth patterns
 * 
 * TEMPORARILY DISABLED - Using fallback responses during worker migration
 */
export class BlazeGrowthIntelligence {
  private blazeConfig = getTeamMemberConfig('blaze')
  private marketIntelligence = new MarketIntelligenceService()

  /**
   * Analyze competitor pricing strategies and changes
   */
  async analyzePricingStrategy(competitorId: string, intelligenceData: IntelligenceData[]): Promise<PricingStrategyAnalysis> {
    const competitor = await db
      .select()
      .from(competitorProfiles)
      .where(eq(competitorProfiles.id, competitorId))
      .limit(1)

    if (!competitor.length) {
      throw new Error(`Competitor ${competitorId} not found`)
    }

    const profile = competitor[0]
    const pricingEntries = intelligenceData.filter((entry) => {
      const topicMatch = (entry.extractedData.topics || []).some((topic) =>
        ['price', 'pricing', 'plan', 'tier', 'subscription', 'billing'].some((keyword) =>
          topic.toLowerCase().includes(keyword),
        ),
      )
      const insightMatch = (entry.extractedData.keyInsights || []).some((insight) =>
        ['price', 'pricing', 'plan', 'tier', 'subscription', 'billing'].some((keyword) =>
          insight.toLowerCase().includes(keyword),
        ),
      )
      return topicMatch || insightMatch || entry.dataType.toLowerCase().includes('pricing')
    })

    const pricingSummary = pricingEntries
      .slice(0, 12)
      .map((entry) => {
        const title = entry.extractedData.title || entry.dataType
        const insights = (entry.extractedData.keyInsights || []).join('; ')
        return `Source: ${entry.sourceType} | Title: ${title} | Key Insights: ${insights}`
      })
      .join('\n')

    // Fetch real-time pricing and funding news
    const marketEvents = await this.marketIntelligence.searchFundingAndPricing(profile.name, 90)
    
    const formattedRealTimeData: PromptIntelligenceData[] = marketEvents.map(event => ({
      sourceType: 'news' as const,
      dataType: 'market_event',
      extractedData: { 
        title: event.title, 
        description: event.description, 
        type: event.type,
        impact: event.impact 
      } as any,
      collectedAt: event.eventDate
    }))

    const realTimeContext = formattedRealTimeData.length > 0
      ? `
      RECENT MARKET EVENTS (Real-time):
      ${formattedRealTimeData.map(d => `- [${d.collectedAt.toISOString().split('T')[0]}] ${d.extractedData.type}: ${d.extractedData.title} (${d.extractedData.impact} impact)`).join('\n')}
      `
      : 'No recent market events found.'

    const analysisPrompt = `
You are Blaze, the growth and pricing strategist. Analyze the competitor's pricing strategy and respond with JSON that matches the following structure:
{
  "pricingModel": {
    "type": "subscription | one_time | freemium | usage_based | tiered | custom",
    "billingCycle": "monthly | quarterly | annually | usage",
    "currency": "USD",
    "hasFreeTier": boolean,
    "hasTrial": boolean,
    "trialDuration": number | null
  },
  "pricePoints": Array<{
    "tier": string,
    "price": number,
    "currency": string,
    "billingCycle": string,
    "features": string[],
    "limitations": string[],
    "targetSegment": string
  }>,
  "pricingTiers": Array<{
    "name": string,
    "position": number,
    "price": number,
    "currency": string,
    "billingCycle": string,
    "features": string[],
    "limitations": string[],
    "targetMarket": string,
    "competitiveAdvantage": string
  }>,
  "pricingChanges": Array<{
    "date": string,
    "changeType": "increase | decrease | new_tier | removed_tier | feature_change",
    "oldPrice": number | null,
    "newPrice": number | null,
    "affectedTier": string,
    "reason": string,
    "marketResponse": string
  }>,
  "competitivePricing": {
    "marketPosition": "premium | mid_market | budget | value",
    "priceAdvantage": number,
    "valueProposition": string,
    "pricingGaps": Array<{
      "segment": string,
      "opportunity": string,
      "potentialRevenue": string,
      "competitorWeakness": string,
      "recommendedPrice": number
    }>,
    "recommendedActions": Array<{
      "action": string,
      "rationale": string,
      "expectedImpact": string,
      "riskLevel": "low | medium | high",
      "timeline": string
    }>
  },
  "pricingStrategy": string,
  "marketPositioning": string
}

Competitor profile:
- Name: ${profile.name}
- Threat level: ${profile.threat_level}
- Market position: ${JSON.stringify(profile.market_position)}
- Advantages: ${(profile as any).competitive_advantages?.join(', ') ?? 'N/A'}

Relevant intelligence data:
${pricingSummary || 'No direct pricing intelligence available - infer using competitor profile.'}

${realTimeContext}
`

    const { text } = await generateText({
      model: this.blazeConfig.model as any,
      messages: [
        { role: 'system', content: this.blazeConfig.systemPrompt },
        { role: 'user', content: analysisPrompt },
      ],
      temperature: 0.4,
      // maxTokens: 1800,
    })

    return this.parsePricingAnalysis(text, competitorId)
  }

  /**
   * Perform cost-benefit analysis for competitive pricing responses
   */
  async performCostBenefitAnalysis(
    competitorId: string, 
    proposedAction: string,
    marketData: any[]
  ): Promise<GrowthRecommendation[]> {
    try {
      const competitor = await db.select()
        .from(competitorProfiles)
        .where(eq(competitorProfiles.id, competitorId))
        .limit(1)

      if (!competitor.length) {
        throw new Error(`Competitor ${competitorId} not found`)
      }

      const competitorProfile = competitor[0]

      const analysisPrompt = `
        As Blaze, perform a cost-benefit analysis for responding to competitor "${competitorProfile.name}".
        
        Proposed Action: ${proposedAction}
        
        Competitor Context:
        - Threat Level: ${competitorProfile.threat_level}
        - Market Position: ${JSON.stringify(competitorProfile.market_position)}
        - Competitive Advantages: ${(competitorProfile as any).competitive_advantages?.join(', ')}
        
        Market Data:
        ${JSON.stringify(marketData)}
        
        Analyze:
        1. Costs of implementation (financial, resource, opportunity)
        2. Expected benefits (revenue, market share, competitive advantage)
        3. Risk assessment and mitigation strategies
        4. Timeline and resource requirements
        5. Success metrics and KPIs
        6. Alternative approaches and their trade-offs
        
        Provide actionable recommendations with clear ROI projections.
      `

      const response = await generateText({
        model: this.blazeConfig.model as any,
        messages: [
          {
            role: 'system',
            content: this.blazeConfig.systemPrompt
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.6, // maxTokens: 1500
      })

      return this.parseGrowthRecommendations(response.text, competitorId)
    } catch (error) {
      logError('Error performing cost-benefit analysis:', error)
      throw error
    }
  }

  /**
   * Analyze competitor growth strategy based on expansion patterns
   */
  async analyzeGrowthStrategy(competitorId: string, intelligenceData: IntelligenceData[]): Promise<GrowthPatternAnalysis> {
    try {
      // Filter growth-related intelligence data
      const growthData = intelligenceData.filter(data => 
        data.dataType.includes('hiring') || 
        data.dataType.includes('funding') ||
        data.dataType.includes('expansion') ||
        data.extractedData.topics.some(topic => 
          topic.toLowerCase().includes('growth') || 
          topic.toLowerCase().includes('expansion') ||
          topic.toLowerCase().includes('market') ||
          topic.toLowerCase().includes('revenue')
        )
      )

      const competitor = await db.select()
        .from(competitorProfiles)
        .where(eq(competitorProfiles.id, competitorId))
        .limit(1)

      if (!competitor.length) {
        throw new Error(`Competitor ${competitorId} not found`)
      }

      const competitorProfile = competitor[0]

      // Fetch real-time growth indicators
      const fundingNews = await this.marketIntelligence.searchFundingAndPricing(competitorProfile.name, 180)
      const expansionNews = await this.marketIntelligence.searchCompetitorNews(`${competitorProfile.name} expansion market entry new office`, 180)

      const realTimeGrowthContext = `
      REAL-TIME GROWTH SIGNALS:
      Funding/Pricing Events:
      ${fundingNews.map(n => `- ${n.eventDate.toISOString().split('T')[0]}: ${n.title} (${n.type})`).join('\n')}
      
      Expansion News:
      ${expansionNews.slice(0, 5).map(n => `- ${n.publishedAt.toISOString().split('T')[0]}: ${n.title}`).join('\n')}
      `

      const analysisPrompt = `
        As Blaze, analyze the growth strategy for competitor "${competitorProfile.name}".
        
        Competitor Profile:
        - Industry: ${competitorProfile.industry}
        - Employee Count: ${competitorProfile.employee_count}
        - Funding: $${competitorProfile.funding_amount} (${competitorProfile.funding_stage})
        - Current Markets: ${(competitorProfile.market_position as any)?.target_markets?.join(', ')}
        
        Growth Intelligence:
        ${growthData.map(data => `
        - ${data.sourceType}: ${data.extractedData.title}
        - Key Insights: ${data.extractedData.keyInsights.join(', ')}
        - Topics: ${data.extractedData.topics.join(', ')}
        `).join('\n')}
        
        ${realTimeGrowthContext}
        
        Analyze:
        1. Growth metrics and trends
        2. Expansion patterns (geographic, product, market)
        3. Customer acquisition strategies
        4. Revenue growth analysis
        5. Market expansion plans
        6. Competitive positioning changes
        
        Identify opportunities and threats for our competitive response.
      `

      const response = await generateText({
        model: this.blazeConfig.model as any,
        messages: [
          {
            role: 'system',
            content: this.blazeConfig.systemPrompt
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        // maxTokens: 2000
      })

      return this.parseGrowthPatternAnalysis(response.text, competitorId)
    } catch (error) {
      logError('Error analyzing growth strategy:', error)
      throw error
    }
  }

  /**
   * Build market positioning recommendations based on competitive landscape
   */
  async buildMarketPositioningRecommendations(
    competitorIds: string[],
    userBusinessContext: any
  ): Promise<GrowthRecommendation[]> {
    try {
      // Get all competitor profiles
      const competitors = await db.select()
        .from(competitorProfiles)
        .where(eq(competitorProfiles.id, competitorIds[0])) // V1 Limit: Analyze primary competitor

      // Get recent intelligence for market analysis
      const recentIntelligence = await db.select()
        .from(intelligenceData)
        .where(
          and(
            eq(intelligenceData.competitor_id, competitorIds[0]),
            gte(intelligenceData.collected_at, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
          )
        )
        .orderBy(desc(intelligenceData.collected_at))
        .limit(50)

      const analysisPrompt = `
        As Blaze, provide market positioning recommendations based on the competitive landscape.
        
        User Business Context:
        ${JSON.stringify(userBusinessContext)}
        
        Competitive Intelligence:
        ${competitors.map(comp => `
        Competitor: ${comp.name}
        - Threat Level: ${(comp as any).threat_level}
        - Market Position: ${JSON.stringify((comp as any).market_position)}
        - Advantages: ${((comp as any).competitive_advantages || []).join(', ')}
        - Vulnerabilities: ${((comp as any).vulnerabilities || []).join(', ')}
        `).join('\n')}
        
        Recent Market Activity:
        ${recentIntelligence.map(intel => `
        - ${(intel as any).sourceType || (intel as any).source_type}: ${((intel as any).extractedData || (intel as any).extracted_data)?.title}
        - Insights: ${(((intel as any).extractedData || (intel as any).extracted_data)?.keyInsights || []).join(', ')}
        `).join('\n')}
        
        Provide strategic recommendations for:
        1. Market positioning against these competitors
        2. Pricing strategy optimization
        3. Product differentiation opportunities
        4. Market expansion priorities
        5. Competitive response tactics
        
        Focus on actionable, revenue-impacting recommendations.
      `

      const response = await generateText({
        model: this.blazeConfig.model as any,
        messages: [
          {
            role: 'system',
            content: this.blazeConfig.systemPrompt
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.6, // maxTokens: 1800
      })

      return this.parseGrowthRecommendations(response.text, competitorIds[0])
    } catch (error) {
      logError('Error building market positioning recommendations:', error)
      throw error
    }
  }

  /**
   * Add revenue optimization suggestions based on competitor pricing gaps
   */
  async generateRevenueOptimizationSuggestions(
    competitorId: string,
    pricingAnalysis: PricingStrategyAnalysis
  ): Promise<GrowthRecommendation[]> {
    try {
      const analysisPrompt = `
        As Blaze, generate revenue optimization suggestions based on competitor pricing analysis.
        
        Competitor Pricing Analysis:
        - Pricing Model: ${pricingAnalysis.pricingModel.type}
        - Market Position: ${pricingAnalysis.competitivePricing.marketPosition}
        - Price Advantage: ${pricingAnalysis.competitivePricing.priceAdvantage}%
        - Value Proposition: ${pricingAnalysis.competitivePricing.valueProposition}
        
        Pricing Gaps Identified:
        ${pricingAnalysis.competitivePricing.pricingGaps.map(gap => `
        - Segment: ${gap.segment}
        - Opportunity: ${gap.opportunity}
        - Potential Revenue: ${gap.potentialRevenue}
        - Recommended Price: $${gap.recommendedPrice}
        `).join('\n')}
        
        Generate specific revenue optimization recommendations:
        1. Pricing adjustments to capture market gaps
        2. New pricing tiers or packages
        3. Value-based pricing opportunities
        4. Competitive pricing responses
        5. Revenue model innovations
        
        Include ROI projections and implementation timelines.
      `

      const response = await generateText({
        model: this.blazeConfig.model as any,
        messages: [
          {
            role: 'system',
            content: this.blazeConfig.systemPrompt
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.6, // maxTokens: 1500
      })

      return this.parseGrowthRecommendations(response.text, competitorId)
    } catch (error) {
      logError('Error generating revenue optimization suggestions:', error)
      throw error
    }
  }

  /**
   * Parse pricing analysis from AI response
   */
  private parsePricingAnalysis(analysisText: string, competitorId: string): PricingStrategyAnalysis {
    try {
      // Try to parse JSON response first
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          competitorId,
          ...parsed,
          analyzedAt: new Date()
        };
      }
    } catch (error) {
      // Fallback to text parsing
    }

    // Fallback: create structured analysis from text
    return {
      competitorId,
      pricingModel: {
        type: 'subscription',
        currency: 'USD',
        hasFreeTier: analysisText.toLowerCase().includes('free'),
        hasTrial: analysisText.toLowerCase().includes('trial')
      },
      pricePoints: [],
      pricingTiers: [],
      pricingChanges: [],
      competitivePricing: {
        marketPosition: 'mid_market',
        priceAdvantage: 0,
        valueProposition: 'Competitive pricing analysis needed',
        pricingGaps: [],
        recommendedActions: []
      },
      pricingStrategy: analysisText.substring(0, 500),
      marketPositioning: 'Analysis in progress',
      analyzedAt: new Date()
    };
  }

  /**
   * Parse growth recommendations from AI response
   */
  private parseGrowthRecommendations(responseText: string, competitorId: string): GrowthRecommendation[] {
    const recommendations: GrowthRecommendation[] = [];
    
    // Extract recommendations from text
    const lines = responseText.split('\n');
    let currentRecommendation: Partial<GrowthRecommendation> = {};
    
    for (const line of lines) {
      if (line.includes('Recommendation') || line.includes('Action')) {
        if (currentRecommendation.title) {
          recommendations.push(this.completeRecommendation(currentRecommendation, competitorId));
        }
        currentRecommendation = {
          title: line.trim(),
          type: 'strategic'
        };
      } else if (line.trim() && currentRecommendation.title) {
        currentRecommendation.description = (currentRecommendation.description || '') + ' ' + line.trim();
      }
    }
    
    if (currentRecommendation.title) {
      recommendations.push(this.completeRecommendation(currentRecommendation, competitorId));
    }
    
    return recommendations.length > 0 ? recommendations : [{
      id: `blaze-rec-${Date.now()}`,
      type: 'strategic',
      title: 'Competitive Analysis Required',
      description: 'Further analysis needed to generate specific recommendations',
      priority: 'medium',
      estimatedEffort: '1-2 weeks',
      potentialImpact: 'Medium revenue impact',
      timeline: '30 days',
      actionItems: ['Gather more competitive intelligence', 'Analyze market positioning'],
      growthAction: 'competitive_response',
      revenueImpact: 'TBD',
      marketTiming: 'short_term',
      investmentRequired: 'Low',
      riskAssessment: 'Low risk',
      successMetrics: ['Market share', 'Revenue growth']
    }];
  }

  /**
   * Complete recommendation with default values
   */
  private completeRecommendation(partial: Partial<GrowthRecommendation>, competitorId: string): GrowthRecommendation {
    return {
      id: `blaze-rec-${competitorId}-${Date.now()}`,
      type: partial.type || 'strategic',
      title: partial.title || 'Growth Recommendation',
      description: partial.description || 'Detailed analysis required',
      priority: 'medium',
      estimatedEffort: '2-4 weeks',
      potentialImpact: 'Medium to high revenue impact',
      timeline: '60 days',
      actionItems: ['Implement recommendation', 'Monitor results'],
      growthAction: 'competitive_response',
      revenueImpact: 'Positive',
      marketTiming: 'short_term',
      investmentRequired: 'Medium',
      riskAssessment: 'Moderate risk',
      successMetrics: ['Revenue growth', 'Market position']
    };
  }

  /**
   * Parse growth pattern analysis from AI response
   */
  private parseGrowthPatternAnalysis(analysisText: string, competitorId: string): GrowthPatternAnalysis {
    return {
      competitorId,
      growthMetrics: [],
      expansionPatterns: [],
      customerAcquisition: {
        channels: [],
        costTrends: [],
        conversionRates: [],
        retentionMetrics: [],
        competitiveAdvantages: []
      },
      revenueGrowth: {
        growthRate: 0,
        revenueStreams: [],
        seasonality: [],
        predictedGrowth: [],
        riskFactors: []
      },
      marketExpansion: {
        currentMarkets: [],
        targetMarkets: [],
        expansionStrategy: analysisText.substring(0, 200),
        barriers: [],
        opportunities: [],
        timeline: '12 months'
      },
      competitivePositioning: {
        marketShare: 0,
        position: 'challenger',
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      },
      analyzedAt: new Date()
    };
  }

}

// Export singleton instance
export const blazeGrowthIntelligence = new BlazeGrowthIntelligence();
