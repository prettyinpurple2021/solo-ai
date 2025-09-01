import { generateText } from "ai"
import { getTeamMemberConfig } from "./ai-config"
import { db } from '@/db'
import { intelligenceData, competitorProfiles } from '@/db/schema'
import { eq, and, gte, desc } from 'drizzle-orm'
import type { 
  CompetitorProfile, 
  IntelligenceData, 
  AnalysisResult, 
  Insight, 
  Recommendation 
} from './competitor-intelligence-types'

// Echo-specific marketing intelligence types
export interface MarketingIntelligenceAnalysis {
  competitorId: number
  analysisType: 'content_strategy' | 'brand_positioning' | 'campaign_effectiveness' | 'messaging_analysis' | 'content_gap_analysis'
  insights: MarketingInsight[]
  recommendations: MarketingRecommendation[]
  confidence: number
  analyzedAt: Date
}

export interface MarketingInsight extends Insight {
  type: 'marketing'
  marketingCategory: 'messaging' | 'content' | 'branding' | 'campaign' | 'audience' | 'positioning'
  competitiveAdvantage?: string
  marketingOpportunity?: string
  brandingGap?: string
}

export interface MarketingRecommendation extends Recommendation {
  type: 'offensive' | 'defensive' | 'strategic'
  marketingTactic: 'content_creation' | 'messaging_pivot' | 'brand_repositioning' | 'campaign_launch' | 'audience_targeting'
  expectedOutcome: string
  competitiveResponse?: string
}

export interface ContentStrategyAnalysis {
  competitorId: number
  contentThemes: ContentTheme[]
  messagingPatterns: MessagingPattern[]
  contentGaps: ContentGap[]
  brandVoice: BrandVoiceAnalysis
  contentPerformance: ContentPerformanceMetrics
  strategicRecommendations: string[]
  analyzedAt: Date
}

export interface ContentTheme {
  theme: string
  frequency: number
  engagement: number
  platforms: string[]
  examples: string[]
  effectiveness: 'high' | 'medium' | 'low'
}

export interface MessagingPattern {
  pattern: string
  usage: number
  sentiment: 'positive' | 'neutral' | 'negative'
  targetAudience: string
  effectiveness: number
  examples: string[]
}

export interface ContentGap {
  gapType: 'topic' | 'format' | 'platform' | 'audience'
  description: string
  opportunity: string
  priority: 'high' | 'medium' | 'low'
  estimatedImpact: string
}

export interface BrandVoiceAnalysis {
  tone: string[]
  personality: string[]
  values: string[]
  consistency: number
  differentiation: string[]
  weaknesses: string[]
}

export interface ContentPerformanceMetrics {
  avgEngagement: number
  topPerformingContent: string[]
  underperformingContent: string[]
  optimalPostingTimes: string[]
  bestPerformingFormats: string[]
}

export interface BrandPositioningAnalysis {
  competitorId: number
  positioningStatement: string
  targetMarket: string[]
  valueProposition: string[]
  differentiators: string[]
  competitiveAdvantages: string[]
  positioningGaps: string[]
  marketOpportunities: string[]
  repositioningRecommendations: string[]
  analyzedAt: Date
}

export interface CampaignEffectivenessAnalysis {
  competitorId: number
  campaigns: DetectedCampaign[]
  campaignTypes: CampaignTypeEffectiveness[]
  overallEffectiveness: number
  successFactors: string[]
  failurePatterns: string[]
  campaignRecommendations: string[]
  analyzedAt: Date
}

export interface DetectedCampaign {
  id: string
  name: string
  type: 'product_launch' | 'brand_awareness' | 'lead_generation' | 'engagement' | 'recruitment' | 'seasonal'
  startDate: Date
  endDate?: Date
  platforms: string[]
  content: CampaignContent
  performance: CampaignPerformance
  effectiveness: 'high' | 'medium' | 'low'
  keyTakeaways: string[]
}

export interface CampaignContent {
  themes: string[]
  messages: string[]
  hashtags: string[]
  visualStyle: string[]
  callToActions: string[]
}

export interface CampaignPerformance {
  totalEngagement: number
  avgEngagementRate: number
  reach: number
  conversions?: number
  roi?: number
}

export interface CampaignTypeEffectiveness {
  type: string
  frequency: number
  avgEffectiveness: number
  successRate: number
  bestPractices: string[]
  commonMistakes: string[]
}

/**
 * Echo Marketing Intelligence Service
 * Provides AI-powered marketing analysis for competitor intelligence
 */
export class EchoMarketingIntelligence {
  private echoConfig = getTeamMemberConfig('echo')

  /**
   * Analyze competitor's content strategy and messaging patterns
   */
  async analyzeContentStrategy(competitorId: number, days: number = 30): Promise<ContentStrategyAnalysis> {
    // Get competitor data
    const competitor = await this.getCompetitorProfile(competitorId)
    const socialMediaData = await this.getSocialMediaIntelligence(competitorId, days)
    const websiteData = await this.getWebsiteIntelligence(competitorId, days)

    // Prepare data for Echo analysis
    const analysisPrompt = this.buildContentStrategyPrompt(competitor, socialMediaData, websiteData)

    // Get Echo's analysis
    const { text } = await generateText({
      model: this.echoConfig.model,
      prompt: analysisPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse Echo's response into structured analysis
    const analysis = this.parseContentStrategyAnalysis(text, competitorId)

    // Store the analysis results
    await this.storeMarketingIntelligence(competitorId, 'content_strategy', analysis)

    return analysis
  }

  /**
   * Analyze competitor's brand positioning and messaging
   */
  async analyzeBrandPositioning(competitorId: number, days: number = 60): Promise<BrandPositioningAnalysis> {
    const competitor = await this.getCompetitorProfile(competitorId)
    const allIntelligenceData = await this.getAllIntelligenceData(competitorId, days)

    const analysisPrompt = this.buildBrandPositioningPrompt(competitor, allIntelligenceData)

    const { text } = await generateText({
      model: this.echoConfig.model,
      prompt: analysisPrompt,
      temperature: 0.6,
      maxTokens: 1500,
    })

    const analysis = this.parseBrandPositioningAnalysis(text, competitorId)
    await this.storeMarketingIntelligence(competitorId, 'brand_positioning', analysis)

    return analysis
  }

  /**
   * Analyze effectiveness of competitor's marketing campaigns
   */
  async analyzeCampaignEffectiveness(competitorId: number, days: number = 90): Promise<CampaignEffectivenessAnalysis> {
    const competitor = await this.getCompetitorProfile(competitorId)
    const socialMediaData = await this.getSocialMediaIntelligence(competitorId, days)
    const newsData = await this.getNewsIntelligence(competitorId, days)

    const analysisPrompt = this.buildCampaignEffectivenessPrompt(competitor, socialMediaData, newsData)

    const { text } = await generateText({
      model: this.echoConfig.model,
      prompt: analysisPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    const analysis = this.parseCampaignEffectivenessAnalysis(text, competitorId)
    await this.storeMarketingIntelligence(competitorId, 'campaign_effectiveness', analysis)

    return analysis
  }

  /**
   * Identify content gaps and marketing opportunities
   */
  async analyzeContentGaps(competitorIds: number[], userCompanyData?: any): Promise<ContentGap[]> {
    const competitors = await Promise.all(
      competitorIds.map(id => this.getCompetitorProfile(id))
    )

    const competitorIntelligence = await Promise.all(
      competitorIds.map(id => this.getAllIntelligenceData(id, 60))
    )

    const analysisPrompt = this.buildContentGapAnalysisPrompt(competitors, competitorIntelligence, userCompanyData)

    const { text } = await generateText({
      model: this.echoConfig.model,
      prompt: analysisPrompt,
      temperature: 0.8,
      maxTokens: 1500,
    })

    return this.parseContentGapAnalysis(text)
  }

  /**
   * Generate marketing intelligence briefing
   */
  async generateMarketingBriefing(competitorIds: number[], timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<string> {
    const days = timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : 30

    const briefingData = await Promise.all(
      competitorIds.map(async (id) => {
        const competitor = await this.getCompetitorProfile(id)
        const recentIntelligence = await this.getAllIntelligenceData(id, days)
        return { competitor, intelligence: recentIntelligence }
      })
    )

    const briefingPrompt = this.buildMarketingBriefingPrompt(briefingData, timeframe)

    const { text } = await generateText({
      model: this.echoConfig.model,
      prompt: briefingPrompt,
      temperature: 0.7,
      maxTokens: 2500,
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

  private async getSocialMediaIntelligence(competitorId: number, days: number): Promise<IntelligenceData[]> {
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    return await db
      .select()
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.competitor_id, competitorId),
          eq(intelligenceData.source_type, 'social_media'),
          gte(intelligenceData.collected_at, dateThreshold)
        )
      )
      .orderBy(desc(intelligenceData.collected_at))
  }

  private async getWebsiteIntelligence(competitorId: number, days: number): Promise<IntelligenceData[]> {
    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    return await db
      .select()
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.competitor_id, competitorId),
          eq(intelligenceData.source_type, 'website'),
          gte(intelligenceData.collected_at, dateThreshold)
        )
      )
      .orderBy(desc(intelligenceData.collected_at))
  }

  private async getNewsIntelligence(competitorId: number, days: number): Promise<IntelligenceData[]> {
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

  private buildContentStrategyPrompt(
    competitor: CompetitorProfile, 
    socialMediaData: IntelligenceData[], 
    websiteData: IntelligenceData[]
  ): string {
    return `${this.echoConfig.systemPrompt}

MARKETING INTELLIGENCE ANALYSIS REQUEST:

You are analyzing the content strategy and messaging patterns for competitor: ${competitor.name}

COMPETITOR PROFILE:
- Company: ${competitor.name}
- Industry: ${competitor.industry}
- Domain: ${competitor.domain}
- Threat Level: ${competitor.threatLevel}
- Description: ${competitor.description}

SOCIAL MEDIA DATA (Last 30 days):
${socialMediaData.map(data => `
Platform: ${data.data_type}
Content: ${JSON.stringify(data.raw_content).substring(0, 500)}
Collected: ${data.collected_at}
`).join('\n')}

WEBSITE DATA (Last 30 days):
${websiteData.map(data => `
Source: ${data.source_url}
Content: ${JSON.stringify(data.raw_content).substring(0, 300)}
Collected: ${data.collected_at}
`).join('\n')}

ANALYSIS REQUIREMENTS:
As Echo, analyze this competitor's marketing strategy and provide insights on:

1. CONTENT THEMES: Identify 3-5 main content themes they focus on
2. MESSAGING PATTERNS: Analyze their key messaging patterns and tone
3. BRAND VOICE: Describe their brand personality and voice characteristics
4. CONTENT PERFORMANCE: Assess what content types perform best for them
5. CONTENT GAPS: Identify opportunities they're missing
6. STRATEGIC RECOMMENDATIONS: Provide actionable marketing recommendations

Format your response as a detailed marketing analysis with specific examples and actionable insights. Focus on what we can learn from their strategy and how to compete effectively.

MARKETING ANALYSIS:`
  }

  private buildBrandPositioningPrompt(competitor: CompetitorProfile, allData: IntelligenceData[]): string {
    return `${this.echoConfig.systemPrompt}

BRAND POSITIONING ANALYSIS REQUEST:

Analyze the brand positioning and market messaging for: ${competitor.name}

COMPETITOR PROFILE:
- Company: ${competitor.name}
- Industry: ${competitor.industry}
- Market Position: ${JSON.stringify(competitor.market_position)}
- Competitive Advantages: ${competitor.competitive_advantages?.join(', ')}
- Products: ${competitor.products?.map(p => p.name).join(', ')}

ALL INTELLIGENCE DATA:
${allData.map(data => `
Source: ${data.source_type} - ${data.data_type}
URL: ${data.source_url}
Content: ${JSON.stringify(data.raw_content).substring(0, 400)}
Date: ${data.collected_at}
`).join('\n')}

POSITIONING ANALYSIS REQUIREMENTS:
As Echo, analyze their brand positioning and provide:

1. POSITIONING STATEMENT: How they position themselves in the market
2. TARGET MARKET: Who they're targeting and how
3. VALUE PROPOSITION: Their key value propositions and differentiators
4. COMPETITIVE ADVANTAGES: What they claim as advantages
5. POSITIONING GAPS: Weaknesses in their positioning
6. MARKET OPPORTUNITIES: Positioning opportunities they're missing
7. REPOSITIONING RECOMMENDATIONS: How we can position against them

Provide specific examples from their messaging and actionable competitive positioning strategies.

BRAND POSITIONING ANALYSIS:`
  }

  private buildCampaignEffectivenessPrompt(
    competitor: CompetitorProfile, 
    socialMediaData: IntelligenceData[], 
    newsData: IntelligenceData[]
  ): string {
    return `${this.echoConfig.systemPrompt}

CAMPAIGN EFFECTIVENESS ANALYSIS REQUEST:

Analyze marketing campaign effectiveness for: ${competitor.name}

SOCIAL MEDIA CAMPAIGNS:
${socialMediaData.map(data => `
Platform: ${data.data_type}
Campaign Data: ${JSON.stringify(data.raw_content).substring(0, 600)}
Performance: ${JSON.stringify(data.extracted_data).substring(0, 300)}
Date: ${data.collected_at}
`).join('\n')}

NEWS AND PR DATA:
${newsData.map(data => `
Source: ${data.source_url}
News Content: ${JSON.stringify(data.raw_content).substring(0, 400)}
Date: ${data.collected_at}
`).join('\n')}

CAMPAIGN ANALYSIS REQUIREMENTS:
As Echo, analyze their campaign effectiveness:

1. DETECTED CAMPAIGNS: Identify distinct marketing campaigns
2. CAMPAIGN TYPES: Categorize campaign types and their effectiveness
3. SUCCESS FACTORS: What makes their campaigns successful
4. FAILURE PATTERNS: Common mistakes or weak points
5. PERFORMANCE METRICS: Assess engagement, reach, and conversion patterns
6. CAMPAIGN RECOMMENDATIONS: How to compete with or counter their campaigns

Focus on actionable insights for creating more effective campaigns.

CAMPAIGN EFFECTIVENESS ANALYSIS:`
  }

  private buildContentGapAnalysisPrompt(
    competitors: CompetitorProfile[], 
    competitorIntelligence: IntelligenceData[][], 
    userCompanyData?: any
  ): string {
    return `${this.echoConfig.systemPrompt}

CONTENT GAP ANALYSIS REQUEST:

Analyze content gaps and marketing opportunities across competitors:

COMPETITORS:
${competitors.map((comp, index) => `
${index + 1}. ${comp.name} (${comp.industry})
   - Threat Level: ${comp.threatLevel}
   - Products: ${comp.products?.map(p => p.name).join(', ')}
   - Recent Content: ${JSON.stringify(competitorIntelligence[index]?.slice(0, 3)).substring(0, 500)}
`).join('\n')}

USER COMPANY DATA:
${userCompanyData ? JSON.stringify(userCompanyData).substring(0, 500) : 'Not provided'}

GAP ANALYSIS REQUIREMENTS:
As Echo, identify content and marketing gaps:

1. TOPIC GAPS: Content topics competitors aren't covering
2. FORMAT GAPS: Content formats they're not using effectively
3. PLATFORM GAPS: Platforms they're underutilizing
4. AUDIENCE GAPS: Audience segments they're missing
5. MESSAGING GAPS: Messaging angles they're not using
6. OPPORTUNITY PRIORITY: Rank opportunities by potential impact

Provide specific, actionable content gap opportunities.

CONTENT GAP ANALYSIS:`
  }

  private buildMarketingBriefingPrompt(
    briefingData: Array<{ competitor: CompetitorProfile; intelligence: IntelligenceData[] }>, 
    timeframe: string
  ): string {
    return `${this.echoConfig.systemPrompt}

MARKETING INTELLIGENCE BRIEFING REQUEST:

Create a ${timeframe} marketing intelligence briefing covering recent competitor activities.

COMPETITOR ACTIVITIES:
${briefingData.map(({ competitor, intelligence }) => `
COMPETITOR: ${competitor.name}
Recent Activities (${intelligence.length} items):
${intelligence.map(data => `
- ${data.source_type}: ${JSON.stringify(data.extracted_data).substring(0, 200)}
  Date: ${data.collected_at}
`).join('\n')}
`).join('\n\n')}

BRIEFING REQUIREMENTS:
As Echo, create a comprehensive marketing briefing with:

1. EXECUTIVE SUMMARY: Key marketing developments this ${timeframe}
2. COMPETITOR HIGHLIGHTS: Most significant activities by competitor
3. MARKETING TRENDS: Emerging patterns and trends
4. THREAT ASSESSMENT: Marketing threats and opportunities
5. STRATEGIC RECOMMENDATIONS: Immediate actions to take
6. UPCOMING WATCH ITEMS: What to monitor next ${timeframe}

Write in your signature punk rock marketing style with actionable insights.

MARKETING INTELLIGENCE BRIEFING:`
  }

  // Parsing methods for structured analysis

  private parseContentStrategyAnalysis(analysisText: string, competitorId: number): ContentStrategyAnalysis {
    // This would parse Echo's response into structured data
    // For now, returning a basic structure - in production, implement proper parsing
    return {
      competitorId,
      contentThemes: [],
      messagingPatterns: [],
      contentGaps: [],
      brandVoice: {
        tone: [],
        personality: [],
        values: [],
        consistency: 0,
        differentiation: [],
        weaknesses: []
      },
      contentPerformance: {
        avgEngagement: 0,
        topPerformingContent: [],
        underperformingContent: [],
        optimalPostingTimes: [],
        bestPerformingFormats: []
      },
      strategicRecommendations: [],
      analyzedAt: new Date()
    }
  }

  private parseBrandPositioningAnalysis(analysisText: string, competitorId: number): BrandPositioningAnalysis {
    return {
      competitorId,
      positioningStatement: '',
      targetMarket: [],
      valueProposition: [],
      differentiators: [],
      competitiveAdvantages: [],
      positioningGaps: [],
      marketOpportunities: [],
      repositioningRecommendations: [],
      analyzedAt: new Date()
    }
  }

  private parseCampaignEffectivenessAnalysis(analysisText: string, competitorId: number): CampaignEffectivenessAnalysis {
    return {
      competitorId,
      campaigns: [],
      campaignTypes: [],
      overallEffectiveness: 0,
      successFactors: [],
      failurePatterns: [],
      campaignRecommendations: [],
      analyzedAt: new Date()
    }
  }

  private parseContentGapAnalysis(analysisText: string): ContentGap[] {
    return []
  }

  private async storeMarketingIntelligence(
    competitorId: number, 
    analysisType: string, 
    analysis: any
  ): Promise<void> {
    const analysisResult: AnalysisResult = {
      agentId: 'echo',
      analysisType,
      insights: [],
      recommendations: [],
      confidence: 0.8,
      analyzedAt: new Date()
    }

    // Store in intelligence data table
    await db.insert(intelligenceData).values({
      competitor_id: competitorId,
      user_id: '', // This should be passed from the calling context
      source_type: 'manual',
      data_type: `echo_${analysisType}`,
      raw_content: analysis,
      extracted_data: {
        title: `Echo ${analysisType} Analysis`,
        content: JSON.stringify(analysis),
        metadata: { agent: 'echo', analysisType },
        entities: [],
        topics: [analysisType, 'marketing', 'competitive_intelligence'],
        keyInsights: []
      },
      analysis_results: [analysisResult],
      confidence: 0.8,
      importance: 'high',
      tags: ['echo', 'marketing', analysisType],
      collected_at: new Date(),
      processed_at: new Date()
    })
  }
}