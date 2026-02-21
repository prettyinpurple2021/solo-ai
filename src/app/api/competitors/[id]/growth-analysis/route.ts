import { logError,} from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server'
import { authenticateRequest} from '@/lib/auth-server'
import { rateLimitByIp} from '@/lib/rate-limit'
import { db} from '@/db'
import { competitorProfiles, intelligenceData} from '@/shared/db/schema'
import { eq, and, gte, desc} from 'drizzle-orm'
import { blazeGrowthIntelligence} from '@/lib/blaze-growth-intelligence'
import { z} from 'zod'
import type { SourceType, ImportanceLevel, ExtractedData, AnalysisResult } from '@/lib/competitor-intelligence-types'





// Force dynamic rendering
export const dynamic = 'force-dynamic'

const analysisRequestSchema = z.object({
  analysis_type: z.enum(['pricing_strategy', 'growth_analysis', 'market_positioning', 'revenue_optimization']).optional(),
  include_cost_benefit: z.boolean().optional().default(false),
  market_context: z.object({
    industry: z.string().optional(),
    target_market: z.string().optional(),
    business_model: z.string().optional(),
    current_pricing: z.any().optional()
  }).optional()
})

/**
 * GET /api/competitors/[id]/growth-analysis
 * Get Blaze's pricing and growth intelligence analysis for a competitor
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:growth-analysis', ip, 60_000, 10) // 10 requests per minute

    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
      if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

    const { id } = await context.params;
    const competitorId = id as string
    if (!competitorId) {
      return NextResponse.json({ error: 'Invalid competitor ID' }, { status: 400 })
    }

    // Verify competitor exists and belongs to user
    const competitor = await db.select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, user.id)
        )
      )
      .limit(1)

    if (!competitor.length) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // Get recent intelligence data for analysis
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const rawIntelligence = await db.select()
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.competitor_id, competitorId),
          eq(intelligenceData.user_id, user.id),
          gte(intelligenceData.collected_at, thirtyDaysAgo)
        )
      )
      .orderBy(desc(intelligenceData.collected_at))
      .limit(100)

    // Transform database results to match interface
    const intelligence = rawIntelligence.map(item => ({
      id: item.id,
      competitorId: item.competitor_id,
      userId: item.user_id,
      sourceType: item.source_type as any,
      sourceUrl: item.source_url || undefined,
      dataType: item.data_type,
      rawContent: item.raw_content,
      extractedData: item.extracted_data ? item.extracted_data as any : {
        metadata: {},
        entities: [],
        topics: [],
        keyInsights: []
      },
      analysisResults: (item.analysis_results as any[]) || [],
      confidence: item.confidence ? parseFloat(item.confidence) : 0,
      importance: item.importance as any,
      tags: (item.tags as string[]) || [],
      collectedAt: item.collected_at!,
      processedAt: item.processed_at || undefined,
      expiresAt: item.expires_at || undefined,
      createdAt: item.created_at!,
      updatedAt: item.updated_at || new Date()!,
    }))

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const analysisType = searchParams.get('analysis_type') || 'pricing_strategy'

    let analysisResult

    switch (analysisType) {
      case 'pricing_strategy':
        analysisResult = await blazeGrowthIntelligence.analyzePricingStrategy(
          competitorId, 
          intelligence
        )
        break
      case 'growth_analysis':
        analysisResult = await blazeGrowthIntelligence.analyzeGrowthStrategy(
          competitorId, 
          intelligence
        )
        break
      case 'market_positioning':
        analysisResult = await blazeGrowthIntelligence.buildMarketPositioningRecommendations(
          [competitorId],
          { industry: competitor[0].industry }
        )
        break
      case 'revenue_optimization':
        // First get pricing analysis, then generate revenue optimization
        const pricingAnalysis = await blazeGrowthIntelligence.analyzePricingStrategy(
          competitorId, 
          intelligence
        )
        analysisResult = await blazeGrowthIntelligence.generateRevenueOptimizationSuggestions(
          competitorId,
          pricingAnalysis
        )
        break
      default:
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      competitor: {
        id: competitor[0].id,
        name: competitor[0].name,
        threat_level: competitor[0].threat_level
      },
      analysis_type: analysisType,
      analysis_result: analysisResult,
      intelligence_data_points: intelligence.length,
      analyzed_at: new Date().toISOString(),
      agent: 'blaze'
    })

  } catch (error) {
    logError('Error in growth analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyze competitor growth strategy' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/competitors/[id]/growth-analysis
 * Trigger comprehensive growth and pricing analysis with custom parameters
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:growth-analysis:create', ip, 300_000, 5) // 5 requests per 5 minutes

    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
      if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

    const { id } = await context.params;
    const competitorId = id as string
    if (!competitorId) {
      return NextResponse.json({ error: 'Invalid competitor ID' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      analysis_type = 'pricing_strategy', 
      include_cost_benefit = false,
      market_context 
    } = analysisRequestSchema.parse(body)

    // Verify competitor exists and belongs to user
    const competitor = await db.select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.id, competitorId),
          eq(competitorProfiles.user_id, user.id)
        )
      )
      .limit(1)

    if (!competitor.length) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // Get comprehensive intelligence data
    const intelligenceRaw = await db.select()
      .from(intelligenceData)
      .where(
        and(
          eq(intelligenceData.competitor_id, competitorId),
          eq(intelligenceData.user_id, user.id)
        )
      )
      .orderBy(desc(intelligenceData.collected_at))
      .limit(200)

    // Transform database results to match IntelligenceData interface
    const intelligence = intelligenceRaw.map(item => ({
      id: item.id,
      competitorId: item.competitor_id,
      userId: item.user_id,
      sourceType: item.source_type as SourceType,
      sourceUrl: item.source_url || undefined,
      dataType: item.data_type,
      rawContent: item.raw_content,
      extractedData: item.extracted_data as ExtractedData,
      analysisResults: item.analysis_results as AnalysisResult[],
      confidence: item.confidence ? parseFloat(item.confidence) : 0,
      importance: item.importance as ImportanceLevel,
      tags: Array.isArray(item.tags) ? item.tags : [],
      collectedAt: item.collected_at || new Date(),
      processedAt: item.processed_at || undefined,
      createdAt: item.created_at || new Date(),
      updatedAt: item.updated_at || new Date()
    }))

    const results: any = {}

    // Perform requested analysis
    if (analysis_type === 'pricing_strategy' || analysis_type === 'revenue_optimization') {
      results.pricing_analysis = await blazeGrowthIntelligence.analyzePricingStrategy(
        competitorId, 
        intelligence
      )

      if (analysis_type === 'revenue_optimization') {
        results.revenue_optimization = await blazeGrowthIntelligence.generateRevenueOptimizationSuggestions(
          competitorId,
          results.pricing_analysis
        )
      }
    }

    if (analysis_type === 'growth_analysis') {
      results.growth_analysis = await blazeGrowthIntelligence.analyzeGrowthStrategy(
        competitorId, 
        intelligence
      )
    }

    if (analysis_type === 'market_positioning') {
      results.market_positioning = await blazeGrowthIntelligence.buildMarketPositioningRecommendations(
        [competitorId],
        market_context || { industry: competitor[0].industry }
      )
    }

    // Perform cost-benefit analysis if requested
    if (include_cost_benefit && results.market_positioning) {
      const topRecommendation = Array.isArray(results.market_positioning) 
        ? results.market_positioning[0]?.title || 'Competitive response strategy'
        : 'Market positioning adjustment'

      results.cost_benefit_analysis = await blazeGrowthIntelligence.performCostBenefitAnalysis(
        competitorId,
        topRecommendation,
        intelligence.slice(0, 20) // Use recent intelligence as market data
      )
    }

    return NextResponse.json({
      success: true,
      competitor: {
        id: competitor[0].id,
        name: competitor[0].name,
        threat_level: competitor[0].threat_level,
        industry: competitor[0].industry
      },
      analysis_type,
      results,
      intelligence_data_points: intelligence.length,
      market_context,
      analyzed_at: new Date().toISOString(),
      agent: 'blaze'
    })

  } catch (error) {
    logError('Error in comprehensive growth analysis:', error)
    return NextResponse.json(
      { error: 'Failed to perform comprehensive growth analysis' },
      { status: 500 }
    )
  }
}
