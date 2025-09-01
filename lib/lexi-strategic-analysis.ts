import { generateText } from "ai"
import { getTeamMemberConfig } from "./ai-config"
import { db } from '@/db'
import { intelligenceData, competitorProfiles } from '@/db/schema'
import { eq, and, gte, desc, inArray } from 'drizzle-orm'
import type { 
  CompetitorProfile, 
  IntelligenceData, 
  AnalysisResult, 
  Insight, 
  Recommendation 
} from './competitor-intelligence-types'

// Lexi-specific strategic analysis types
export interface StrategicAnalysis {
  competitorId: number
  analysisType: 'competitive_positioning' | 'market_trends' | 'strategic_moves' | 'threat_assessment' | 'opportunity_identification'
  insights: StrategicInsight[]
  recommendations: StrategicRecommendation[]
  confidence: number
  analyzedAt: Date
}

export interface StrategicInsight extends Insight {
  type: 'strategic'
  strategicCategory: 'positioning' | 'market_dynamics' | 'competitive_moves' | 'threats' | 'opportunities' | 'trends'
  dataPoints: DataPoint[]
  marketImplications: string[]
  competitiveImplications: string[]
}

export interface StrategicRecommendation extends Recommendation {
  type: 'strategic'
  strategicAction: 'market_entry' | 'competitive_response' | 'positioning_shift' | 'resource_allocation' | 'partnership' | 'innovation'
  marketTiming: 'immediate' | 'short_term' | 'medium_term' | 'long_term'
  resourceRequirements: string[]
  riskFactors: string[]
  successMetrics: string[]
}

export interface DataPoint {
  metric: string
  value: number | string
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  significance: 'high' | 'medium' | 'low'
  source: string
  timestamp: Date
}

export interface CompetitivePositioningAnalysis {
  competitorId: number
  marketPosition: MarketPositionAnalysis
  competitiveAdvantages: CompetitiveAdvantage[]
  vulnerabilities: CompetitiveVulnerability[]
  marketShare: MarketShareAnalysis
  positioningMap: PositioningMapData
  strategicRecommendations: PositioningRecommendation[]
  analyzedAt: Date
}

export interface MarketPositionAnalysis {
  currentPosition: string
  targetMarket: string[]
  marketSegments: MarketSegment[]
  positioningStrength: number // 0-100
  differentiationLevel: number // 0-100
  marketFit: number // 0-100
}

export interface MarketSegment {
  segment: string
  size: number
  growth: number
  competitorPresence: number
  opportunity: number
}

export interface CompetitiveAdvantage {
  advantage: string
  strength: number // 0-100
  sustainability: 'high' | 'medium' | 'low'
  defensibility: 'high' | 'medium' | 'low'
  marketValue: string
  threats: string[]
}

export interface CompetitiveVulnerability {
  vulnerability: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  exploitability: 'high' | 'medium' | 'low'
  marketImpact: string
  exploitationStrategy: string[]
}

export interface MarketShareAnalysis {
  estimatedShare: number
  shareGrowth: number
  marketSize: number
  keyCompetitors: CompetitorShare[]
  shareOpportunities: string[]
}

export interface CompetitorShare {
  competitorId: number
  name: string
  estimatedShare: number
  trend: 'gaining' | 'losing' | 'stable'
}

export interface PositioningMapData {
  xAxis: string
  yAxis: string
  competitors: PositionedCompetitor[]
  gaps: MarketGap[]
  opportunities: PositioningOpportunity[]
}

export interface PositionedCompetitor {
  competitorId: number
  name: string
  xValue: number
  yValue: number
  size: number
  advantages: string[]
}

export interface MarketGap {
  description: string
  xValue: number
  yValue: number
  opportunity: string
  difficulty: 'low' | 'medium' | 'high'
}

export interface PositioningOpportunity {
  opportunity: string
  rationale: string
  requirements: string[]
  timeline: string
  expectedOutcome: string
}

export interface PositioningRecommendation {
  recommendation: string
  rationale: string
  implementation: string[]
  timeline: string
  resources: string[]
  risks: string[]
  successMetrics: string[]
}

export interface MarketTrendAnalysis {
  industryTrends: IndustryTrend[]
  competitorTrends: CompetitorTrend[]
  emergingOpportunities: EmergingOpportunity[]
  threatIndicators: ThreatIndicator[]
  trendPredictions: TrendPrediction[]
  strategicImplications: string[]
  analyzedAt: Date
}

export interface IndustryTrend {
  trend: string
  direction: 'growing' | 'declining' | 'stable' | 'emerging'
  strength: number // 0-100
  timeframe: string
  drivers: string[]
  implications: string[]
  competitorResponse: string[]
}

export interface CompetitorTrend {
  competitorId: number
  trend: string
  evidence: string[]
  confidence: number
  implications: string[]
  counterStrategies: string[]
}

export interface EmergingOpportunity {
  opportunity: string
  marketSize: string
  timeline: string
  requirements: string[]
  competitorActivity: string[]
  firstMoverAdvantage: boolean
  entryBarriers: string[]
}

export interface ThreatIndicator {
  threat: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  probability: number // 0-100
  timeline: string
  indicators: string[]
  mitigationStrategies: string[]
}

export interface TrendPrediction {
  prediction: string
  confidence: number // 0-100
  timeframe: string
  assumptions: string[]
  implications: string[]
  preparationActions: string[]
}

export interface StrategicMoveAnalysis {
  competitorId: number
  detectedMoves: StrategicMove[]
  movePatterns: MovePattern[]
  predictedMoves: PredictedMove[]
  responseStrategies: ResponseStrategy[]
  analyzedAt: Date
}

export interface StrategicMove {
  moveType: 'hiring' | 'investment' | 'partnership' | 'acquisition' | 'product_launch' | 'market_entry' | 'pricing' | 'technology'
  description: string
  evidence: string[]
  confidence: number
  strategicIntent: string
  marketImpact: string
  competitiveImplications: string[]
  detectedAt: Date
}

export interface MovePattern {
  pattern: string
  frequency: number
  success_rate: number
  typical_timeline: string
  resource_requirements: string[]
  market_conditions: string[]
}

export interface PredictedMove {
  prediction: string
  probability: number // 0-100
  timeframe: string
  indicators: string[]
  potential_impact: string
  preparation_actions: string[]
}

export interface ResponseStrategy {
  strategy: string
  trigger_conditions: string[]
  actions: string[]
  timeline: string
  resources: string[]
  success_metrics: string[]
}

export interface ThreatAssessment {
  competitorId: number
  overallThreatLevel: 'critical' | 'high' | 'medium' | 'low'
  threatCategories: ThreatCategory[]
  competitiveThreats: CompetitiveThreat[]
  mitigationStrategies: MitigationStrategy[]
  monitoringRecommendations: string[]
  analyzedAt: Date
}

export interface ThreatCategory {
  category: 'market_share' | 'pricing' | 'innovation' | 'talent' | 'partnerships' | 'resources'
  severity: 'critical' | 'high' | 'medium' | 'low'
  probability: number
  impact: string
  evidence: string[]
  trends: string[]
}

export interface CompetitiveThreat {
  threat: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  immediacy: 'immediate' | 'short_term' | 'medium_term' | 'long_term'
  evidence: string[]
  potential_impact: string
  affected_areas: string[]
}

export interface MitigationStrategy {
  strategy: string
  threat_addressed: string[]
  actions: string[]
  timeline: string
  resources: string[]
  effectiveness: number // 0-100
  implementation_difficulty: 'low' | 'medium' | 'high'
}

/**
 * Lexi Strategic Analysis Service
 * Provides AI-powered strategic competitive analysis
 */
export class LexiStrategicAnalysis {
  private lexiConfig = getTeamMemberConfig('lexi')

  /**
   * Perform comprehensive competitive positioning analysis
   */
  async analyzeCompetitivePositioning(competitorId: number): Promise<CompetitivePositioningAnalysis> {
    const competitor = await this.getCompetitorProfile(competitorId)
    const allIntelligence = await this.getAllIntelligenceData(competitorId, 90)
    const marketData = await this.getMarketIntelligence(competitor.industry || '', 60)

    const analysisPrompt = this.buildPositioningAnalysisPrompt(competitor, allIntelligence, marketData)

    const { text } = await generateText({
      model: this.lexiConfig.model,
      prompt: analysisPrompt,
      temperature: 0.6,
      maxTokens: 2500,
    })

    const analysis = this.parsePositioningAnalysis(text, competitorId)
    await this.storeStrategicAnalysis(competitorId, 'competitive_positioning', analysis)

    return analysis
  }

  /**
   * Analyze market trends based on competitor activities
   */
  async analyzeMarketTrends(competitorIds: number[], industry?: string): Promise<MarketTrendAnalysis> {
    const competitors = await Promise.all(
      competitorIds.map(id => this.getCompetitorProfile(id))
    )

    const competitorIntelligence = await Promise.all(
      competitorIds.map(id => this.getAllIntelligenceData(id, 90))
    )

    const industryData = industry ? await this.getMarketIntelligence(industry, 90) : []

    const analysisPrompt = this.buildMarketTrendAnalysisPrompt(competitors, competitorIntelligence, industryData)

    const { text } = await generateText({
      model: this.lexiConfig.model,
      prompt: analysisPrompt,
      temperature: 0.7,
      maxTokens: 2500,
    })

    const analysis = this.parseMarketTrendAnalysis(text)
    
    // Store analysis for each competitor
    for (const competitorId of competitorIds) {
      await this.storeStrategicAnalysis(competitorId, 'market_trends', analysis)
    }

    return analysis
  }

  /**
   * Predict strategic moves based on competitor hiring and investments
   */
  async analyzeStrategicMoves(competitorId: number): Promise<StrategicMoveAnalysis> {
    const competitor = await this.getCompetitorProfile(competitorId)
    const hiringData = await this.getHiringIntelligence(competitorId, 180)
    const investmentData = await this.getInvestmentIntelligence(competitorId, 365)
    const partnershipData = await this.getPartnershipIntelligence(competitorId, 180)

    const analysisPrompt = this.buildStrategicMoveAnalysisPrompt(
      competitor, 
      hiringData, 
      investmentData, 
      partnershipData
    )

    const { text } = await generateText({
      model: this.lexiConfig.model,
      prompt: analysisPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    const analysis = this.parseStrategicMoveAnalysis(text, competitorId)
    await this.storeStrategicAnalysis(competitorId, 'strategic_moves', analysis)

    return analysis
  }

  /**
   * Build competitive threat assessment with actionable recommendations
   */
  async assessCompetitiveThreats(competitorId: number): Promise<ThreatAssessment> {
    const competitor = await this.getCompetitorProfile(competitorId)
    const recentIntelligence = await this.getAllIntelligenceData(competitorId, 60)
    const competitorProfile = await this.getCompetitorProfile(competitorId)

    const analysisPrompt = this.buildThreatAssessmentPrompt(competitor, recentIntelligence, competitorProfile)

    const { text } = await generateText({
      model: this.lexiConfig.model,
      prompt: analysisPrompt,
      temperature: 0.6,
      maxTokens: 2000,
    })

    const assessment = this.parseThreatAssessment(text, competitorId)
    await this.storeStrategicAnalysis(competitorId, 'threat_assessment', assessment)

    return assessment
  }

  /**
   * Identify market opportunities based on competitor gaps
   */
  async identifyMarketOpportunities(competitorIds: number[]): Promise<EmergingOpportunity[]> {
    const competitors = await Promise.all(
      competitorIds.map(id => this.getCompetitorProfile(id))
    )

    const competitorIntelligence = await Promise.all(
      competitorIds.map(id => this.getAllIntelligenceData(id, 90))
    )

    const analysisPrompt = this.buildOpportunityAnalysisPrompt(competitors, competitorIntelligence)

    const { text } = await generateText({
      model: this.lexiConfig.model,
      prompt: analysisPrompt,
      temperature: 0.8,
      maxTokens: 2000,
    })

    const opportunities = this.parseOpportunityAnalysis(text)

    // Store opportunities for each competitor
    for (const competitorId of competitorIds) {
      await this.storeStrategicAnalysis(competitorId, 'opportunity_identification', opportunities)
    }

    return opportunities
  }

  /**
   * Generate strategic intelligence briefing
   */
  async generateStrategicBriefing(
    competitorIds: number[], 
    timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<string> {
    const days = timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : 30

    const briefingData = await Promise.all(
      competitorIds.map(async (id) => {
        const competitor = await this.getCompetitorProfile(id)
        const recentIntelligence = await this.getAllIntelligenceData(id, days)
        const threatLevel = competitor.threat_level
        return { competitor, intelligence: recentIntelligence, threatLevel }
      })
    )

    const briefingPrompt = this.buildStrategicBriefingPrompt(briefingData, timeframe)

    const { text } = await generateText({
      model: this.lexiConfig.model,
      prompt: briefingPrompt,
      temperature: 0.7,
      maxTokens: 3000,
    })

    return text
  }

  // Private helper methods

  private async getCompetitorProfile(competitorId: number): Promise<CompetitorProfile> {
    const result = await db
      .select()
      .from(competitorProfiles)
      .where(eq(competitorProfiles.id, competitorId))
      .limit(1)

    if (!result[0]) {
      throw new Error(`Competitor profile not found: ${competitorId}`)
    }

    return result[0] as CompetitorProfile
  }

  private async getAllIntelligenceData(competitorId: number, days: number): Promise<IntelligenceData[]> {
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    return await db
      .select()
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.competitor_id, competitorId),
          gte(intelligenceData.collected_at, dateThreshold)
        )
      )
      .orderBy(desc(intelligenceData.collected_at))
  }

  private async getMarketIntelligence(industry: string, days: number): Promise<IntelligenceData[]> {
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    // Get intelligence data for all competitors in the same industry
    const competitorsInIndustry = await db
      .select()
      .from(competitorProfiles)
      .where(eq(competitorProfiles.industry, industry))

    const competitorIds = competitorsInIndustry.map(c => c.id)

    if (competitorIds.length === 0) return []

    return await db
      .select()
      .from(intelligenceData)
      .where(
        and(
          inArray(intelligenceData.competitor_id, competitorIds),
          gte(intelligenceData.collected_at, dateThreshold)
        )
      )
      .orderBy(desc(intelligenceData.collected_at))
  }

  private async getHiringIntelligence(competitorId: number, days: number): Promise<IntelligenceData[]> {
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    return await db
      .select()
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.competitor_id, competitorId),
          eq(intelligenceData.source_type, 'job_posting'),
          gte(intelligenceData.collected_at, dateThreshold)
        )
      )
      .orderBy(desc(intelligenceData.collected_at))
  }

  private async getInvestmentIntelligence(competitorId: number, days: number): Promise<IntelligenceData[]> {
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    return await db
      .select()
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.competitor_id, competitorId),
          eq(intelligenceData.source_type, 'news'),
          gte(intelligenceData.collected_at, dateThreshold)
        )
      )
      .orderBy(desc(intelligenceData.collected_at))
  }

  private async getPartnershipIntelligence(competitorId: number, days: number): Promise<IntelligenceData[]> {
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    return await db
      .select()
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.competitor_id, competitorId),
          eq(intelligenceData.source_type, 'news'),
          gte(intelligenceData.collected_at, dateThreshold)
        )
      )
      .orderBy(desc(intelligenceData.collected_at))
  }

  // Prompt building methods

  private buildPositioningAnalysisPrompt(
    competitor: CompetitorProfile, 
    intelligence: IntelligenceData[], 
    marketData: IntelligenceData[]
  ): string {
    return `${this.lexiConfig.systemPrompt}

STRATEGIC COMPETITIVE POSITIONING ANALYSIS REQUEST:

Analyze the competitive positioning for: ${competitor.name}

COMPETITOR PROFILE:
- Company: ${competitor.name}
- Industry: ${competitor.industry}
- Threat Level: ${competitor.threat_level}
- Market Position: ${JSON.stringify(competitor.market_position)}
- Competitive Advantages: ${competitor.competitive_advantages?.join(', ')}
- Vulnerabilities: ${competitor.vulnerabilities?.join(', ')}
- Products: ${competitor.products?.map(p => `${p.name}: ${p.description}`).join('; ')}

COMPETITOR INTELLIGENCE DATA:
${intelligence.slice(0, 10).map(data => `
Source: ${data.source_type} - ${data.data_type}
Content: ${JSON.stringify(data.extracted_data).substring(0, 400)}
Date: ${data.collected_at}
`).join('\n')}

MARKET INTELLIGENCE DATA:
${marketData.slice(0, 5).map(data => `
Source: ${data.source_type}
Market Data: ${JSON.stringify(data.extracted_data).substring(0, 300)}
Date: ${data.collected_at}
`).join('\n')}

POSITIONING ANALYSIS REQUIREMENTS:
As Lexi, provide a comprehensive strategic analysis including:

1. MARKET POSITION ANALYSIS: Current positioning strength and market fit
2. COMPETITIVE ADVANTAGES: Sustainable advantages and their defensibility
3. VULNERABILITIES: Strategic weaknesses and exploitation opportunities
4. MARKET SHARE ANALYSIS: Estimated share and growth opportunities
5. POSITIONING MAP: Strategic positioning relative to market dimensions
6. STRATEGIC RECOMMENDATIONS: Actionable positioning strategies

Use data-driven insights with specific metrics and strategic frameworks.

STRATEGIC POSITIONING ANALYSIS:`
  }

  private buildMarketTrendAnalysisPrompt(
    competitors: CompetitorProfile[], 
    competitorIntelligence: IntelligenceData[][], 
    industryData: IntelligenceData[]
  ): string {
    return `${this.lexiConfig.systemPrompt}

MARKET TREND ANALYSIS REQUEST:

Analyze market trends based on competitor activities and industry data.

COMPETITORS ANALYZED:
${competitors.map((comp, index) => `
${index + 1}. ${comp.name} (${comp.industry})
   - Threat Level: ${comp.threat_level}
   - Recent Activities: ${competitorIntelligence[index]?.length || 0} data points
   - Key Intelligence: ${JSON.stringify(competitorIntelligence[index]?.slice(0, 2)).substring(0, 300)}
`).join('\n')}

INDUSTRY DATA:
${industryData.slice(0, 10).map(data => `
Source: ${data.source_type}
Industry Intelligence: ${JSON.stringify(data.extracted_data).substring(0, 300)}
Date: ${data.collected_at}
`).join('\n')}

TREND ANALYSIS REQUIREMENTS:
As Lexi, analyze market trends and provide:

1. INDUSTRY TRENDS: Key trends shaping the market
2. COMPETITOR TRENDS: Patterns in competitor behavior
3. EMERGING OPPORTUNITIES: New market opportunities
4. THREAT INDICATORS: Early warning signals
5. TREND PREDICTIONS: Future market developments
6. STRATEGIC IMPLICATIONS: How trends affect competitive strategy

Focus on data-driven insights with predictive analytics.

MARKET TREND ANALYSIS:`
  }

  private buildStrategicMoveAnalysisPrompt(
    competitor: CompetitorProfile, 
    hiringData: IntelligenceData[], 
    investmentData: IntelligenceData[], 
    partnershipData: IntelligenceData[]
  ): string {
    return `${this.lexiConfig.systemPrompt}

STRATEGIC MOVE PREDICTION ANALYSIS REQUEST:

Predict strategic moves for: ${competitor.name}

HIRING INTELLIGENCE:
${hiringData.map(data => `
Job Posting: ${JSON.stringify(data.extracted_data).substring(0, 300)}
Date: ${data.collected_at}
`).join('\n')}

INVESTMENT INTELLIGENCE:
${investmentData.map(data => `
Investment News: ${JSON.stringify(data.extracted_data).substring(0, 300)}
Date: ${data.collected_at}
`).join('\n')}

PARTNERSHIP INTELLIGENCE:
${partnershipData.map(data => `
Partnership News: ${JSON.stringify(data.extracted_data).substring(0, 300)}
Date: ${data.collected_at}
`).join('\n')}

STRATEGIC MOVE ANALYSIS REQUIREMENTS:
As Lexi, analyze strategic indicators and provide:

1. DETECTED MOVES: Current strategic moves in progress
2. MOVE PATTERNS: Historical patterns in strategic decisions
3. PREDICTED MOVES: Likely future strategic moves
4. RESPONSE STRATEGIES: How to respond to their moves

Use pattern recognition and predictive analytics for strategic insights.

STRATEGIC MOVE ANALYSIS:`
  }

  private buildThreatAssessmentPrompt(
    competitor: CompetitorProfile, 
    intelligence: IntelligenceData[], 
    profile: CompetitorProfile
  ): string {
    return `${this.lexiConfig.systemPrompt}

COMPETITIVE THREAT ASSESSMENT REQUEST:

Assess competitive threats from: ${competitor.name}

COMPETITOR PROFILE:
- Threat Level: ${competitor.threat_level}
- Competitive Advantages: ${competitor.competitive_advantages?.join(', ')}
- Market Position: ${JSON.stringify(competitor.market_position)}
- Recent Funding: $${competitor.funding_amount} (${competitor.funding_stage})

RECENT INTELLIGENCE:
${intelligence.slice(0, 15).map(data => `
Source: ${data.source_type}
Threat Intelligence: ${JSON.stringify(data.extracted_data).substring(0, 300)}
Date: ${data.collected_at}
`).join('\n')}

THREAT ASSESSMENT REQUIREMENTS:
As Lexi, provide comprehensive threat analysis:

1. OVERALL THREAT LEVEL: Assessment of competitive threat
2. THREAT CATEGORIES: Specific areas of competitive threat
3. COMPETITIVE THREATS: Immediate and future threats
4. MITIGATION STRATEGIES: How to counter their threats
5. MONITORING RECOMMENDATIONS: What to watch for

Provide actionable threat intelligence with specific countermeasures.

COMPETITIVE THREAT ASSESSMENT:`
  }

  private buildOpportunityAnalysisPrompt(
    competitors: CompetitorProfile[], 
    competitorIntelligence: IntelligenceData[][]
  ): string {
    return `${this.lexiConfig.systemPrompt}

MARKET OPPORTUNITY IDENTIFICATION REQUEST:

Identify market opportunities based on competitor gap analysis.

COMPETITOR LANDSCAPE:
${competitors.map((comp, index) => `
${comp.name}:
- Market Position: ${JSON.stringify(comp.market_position)}
- Products: ${comp.products?.map(p => p.name).join(', ')}
- Vulnerabilities: ${comp.vulnerabilities?.join(', ')}
- Recent Intelligence: ${JSON.stringify(competitorIntelligence[index]?.slice(0, 2)).substring(0, 400)}
`).join('\n\n')}

OPPORTUNITY ANALYSIS REQUIREMENTS:
As Lexi, identify strategic opportunities:

1. MARKET GAPS: Underserved market segments
2. PRODUCT GAPS: Missing product categories
3. GEOGRAPHIC GAPS: Untapped markets
4. TECHNOLOGY GAPS: Innovation opportunities
5. SERVICE GAPS: Unmet customer needs

Focus on quantifiable opportunities with market sizing and entry strategies.

MARKET OPPORTUNITY ANALYSIS:`
  }

  private buildStrategicBriefingPrompt(
    briefingData: Array<{ competitor: CompetitorProfile; intelligence: IntelligenceData[]; threatLevel: string }>, 
    timeframe: string
  ): string {
    return `${this.lexiConfig.systemPrompt}

STRATEGIC INTELLIGENCE BRIEFING REQUEST:

Create a ${timeframe} strategic intelligence briefing.

COMPETITIVE LANDSCAPE:
${briefingData.map(({ competitor, intelligence, threatLevel }) => `
COMPETITOR: ${competitor.name} (Threat: ${threatLevel})
Recent Strategic Activities (${intelligence.length} items):
${intelligence.map(data => `
- ${data.source_type}: ${JSON.stringify(data.extracted_data).substring(0, 200)}
  Strategic Significance: ${data.importance}
  Date: ${data.collected_at}
`).join('\n')}
`).join('\n\n')}

STRATEGIC BRIEFING REQUIREMENTS:
As Lexi, create a comprehensive strategic briefing with:

1. EXECUTIVE SUMMARY: Key strategic developments
2. THREAT ANALYSIS: Competitive threats and their implications
3. OPPORTUNITY ASSESSMENT: Strategic opportunities identified
4. MARKET DYNAMICS: Changes in competitive landscape
5. STRATEGIC RECOMMENDATIONS: Immediate and long-term actions
6. MONITORING PRIORITIES: Key metrics and indicators to track

Provide data-driven strategic insights with actionable intelligence.

STRATEGIC INTELLIGENCE BRIEFING:`
  }

  // Parsing methods (simplified for implementation)

  private parsePositioningAnalysis(analysisText: string, competitorId: number): CompetitivePositioningAnalysis {
    return {
      competitorId,
      marketPosition: {
        currentPosition: '',
        targetMarket: [],
        marketSegments: [],
        positioningStrength: 0,
        differentiationLevel: 0,
        marketFit: 0
      },
      competitiveAdvantages: [],
      vulnerabilities: [],
      marketShare: {
        estimatedShare: 0,
        shareGrowth: 0,
        marketSize: 0,
        keyCompetitors: [],
        shareOpportunities: []
      },
      positioningMap: {
        xAxis: '',
        yAxis: '',
        competitors: [],
        gaps: [],
        opportunities: []
      },
      strategicRecommendations: [],
      analyzedAt: new Date()
    }
  }

  private parseMarketTrendAnalysis(analysisText: string): MarketTrendAnalysis {
    return {
      industryTrends: [],
      competitorTrends: [],
      emergingOpportunities: [],
      threatIndicators: [],
      trendPredictions: [],
      strategicImplications: [],
      analyzedAt: new Date()
    }
  }

  private parseStrategicMoveAnalysis(analysisText: string, competitorId: number): StrategicMoveAnalysis {
    return {
      competitorId,
      detectedMoves: [],
      movePatterns: [],
      predictedMoves: [],
      responseStrategies: [],
      analyzedAt: new Date()
    }
  }

  private parseThreatAssessment(analysisText: string, competitorId: number): ThreatAssessment {
    return {
      competitorId,
      overallThreatLevel: 'medium',
      threatCategories: [],
      competitiveThreats: [],
      mitigationStrategies: [],
      monitoringRecommendations: [],
      analyzedAt: new Date()
    }
  }

  private parseOpportunityAnalysis(analysisText: string): EmergingOpportunity[] {
    return []
  }

  private async storeStrategicAnalysis(
    competitorId: number, 
    analysisType: string, 
    analysis: any
  ): Promise<void> {
    const analysisResult: AnalysisResult = {
      agentId: 'lexi',
      analysisType,
      insights: [],
      recommendations: [],
      confidence: 0.85,
      analyzedAt: new Date()
    }

    await db.insert(intelligenceData).values({
      competitor_id: competitorId,
      user_id: '', // This should be passed from the calling context
      source_type: 'manual',
      data_type: `lexi_${analysisType}`,
      raw_content: analysis,
      extracted_data: {
        title: `Lexi ${analysisType} Analysis`,
        content: JSON.stringify(analysis),
        metadata: { agent: 'lexi', analysisType },
        entities: [],
        topics: [analysisType, 'strategic', 'competitive_intelligence'],
        keyInsights: []
      },
      analysis_results: [analysisResult],
      confidence: 0.85,
      importance: 'high',
      tags: ['lexi', 'strategic', analysisType],
      collected_at: new Date(),
      processed_at: new Date()
    })
  }
}