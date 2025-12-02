import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { db } from '@/db'
import { competitorProfiles, intelligenceData } from '@/db/schema'
import { eq, and, gte, desc, inArray } from 'drizzle-orm'
import { blazeGrowthIntelligence } from '@/lib/blaze-growth-intelligence'
import { z } from 'zod'
import type { SourceType, ImportanceLevel, ExtractedData, AnalysisResult } from '@/lib/competitor-intelligence-types'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

const pricingAnalysisSchema = z.object({
  competitor_ids: z.array(z.number()).min(1).max(10),
  analysis_scope: z.enum(['pricing_only', 'competitive_positioning', 'revenue_optimization', 'comprehensive']).default('pricing_only'),
  market_context: z.object({
    industry: z.string().optional(),
    target_segment: z.string().optional(),
    business_model: z.string().optional(),
    current_pricing_model: z.string().optional()
  }).optional(),
  include_recommendations: z.boolean().default(true)
})

/**
 * GET /api/competitors/pricing-intelligence
 * Get pricing intelligence overview across multiple competitors
 */
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:pricing-intelligence', ip, 60_000, 15) // 15 requests per minute

    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threatLevels = searchParams.get('threat_levels')?.split(',') || ['high', 'critical']
    const limit = parseInt(searchParams.get('limit') || '5')

    // Get competitors based on threat level
    const competitors = await db.select()
      .from(competitorProfiles)
      .where(
        and(
          eq(competitorProfiles.user_id, user.id),
          eq(competitorProfiles.monitoring_status, 'active'),
          inArray(competitorProfiles.threat_level, threatLevels)
        )
      )
      .orderBy(desc(competitorProfiles.updated_at))
      .limit(limit)

    if (!competitors.length) {
      return NextResponse.json({
        success: true,
        message: 'No competitors found with specified threat levels',
        pricing_intelligence: [],
        summary: {
          total_competitors: 0,
          pricing_strategies_analyzed: 0,
          market_opportunities: 0
        }
      })
    }

    // Get recent pricing-related intelligence for all competitors
    const competitorIds = competitors.map(c => c.id)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const pricingIntelligence = await db.select()
      .from(intelligenceData)
      .where(
        and(
          inArray(intelligenceData.competitor_id, competitorIds),
          eq(intelligenceData.user_id, user.id),
          gte(intelligenceData.collected_at, thirtyDaysAgo)
        )
      )
      .orderBy(desc(intelligenceData.collected_at))

    // Filter for pricing-related intelligence
    const pricingData = pricingIntelligence.filter(intel =>
      intel.data_type.includes('pricing') ||
      (intel.extracted_data as { topics?: string[] })?.topics?.some((topic: string) =>
        topic.toLowerCase().includes('price') ||
        topic.toLowerCase().includes('cost') ||
        topic.toLowerCase().includes('subscription') ||
        topic.toLowerCase().includes('plan')
      )
    )

    // Analyze pricing strategies for each competitor
    const pricingAnalyses = await Promise.all(
      competitors.map(async (competitor) => {
        const competitorPricingData = pricingData.filter(d => d.competitor_id === competitor.id)

        if (competitorPricingData.length === 0) {
          return {
            competitor: {
              id: competitor.id,
              name: competitor.name,
              threat_level: competitor.threat_level
            },
            pricing_analysis: null,
            data_availability: 'insufficient'
          }
        }

        try {
          // Transform database results to match IntelligenceData interface
          const transformedData = competitorPricingData.map(item => ({
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

          const analysis = await blazeGrowthIntelligence.analyzePricingStrategy(
            competitor.id,
            transformedData
          )

          return {
            competitor: {
              id: competitor.id,
              name: competitor.name,
              threat_level: competitor.threat_level,
              industry: competitor.industry
            },
            pricing_analysis: analysis,
            data_availability: 'sufficient',
            intelligence_points: competitorPricingData.length
          }
        } catch (error) {
          logError(`Error analyzing pricing for competitor ${competitor.id}:`, error)
          return {
            competitor: {
              id: competitor.id,
              name: competitor.name,
              threat_level: competitor.threat_level
            },
            pricing_analysis: null,
            data_availability: 'error',
            error: 'Analysis failed'
          }
        }
      })
    )

    // Generate market summary
    const successfulAnalyses = pricingAnalyses.filter(a => a.pricing_analysis !== null)
    const marketOpportunities = successfulAnalyses.reduce((count, analysis) => {
      return count + (analysis.pricing_analysis?.competitivePricing?.pricingGaps?.length || 0)
    }, 0)

    return NextResponse.json({
      success: true,
      pricing_intelligence: pricingAnalyses,
      summary: {
        total_competitors: competitors.length,
        pricing_strategies_analyzed: successfulAnalyses.length,
        market_opportunities: marketOpportunities,
        data_points_analyzed: pricingData.length,
        analysis_period: '30 days'
      },
      analyzed_at: new Date().toISOString(),
      agent: 'blaze'
    })

  } catch (error) {
    logError('Error in pricing intelligence overview:', error)
    return NextResponse.json(
      { error: 'Failed to generate pricing intelligence overview' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/competitors/pricing-intelligence
 * Perform comprehensive pricing analysis across multiple competitors
 */
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitors:pricing-analysis:comprehensive', ip, 300_000, 3) // 3 requests per 5 minutes

    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      competitor_ids,
      analysis_scope,
      market_context
    } = pricingAnalysisSchema.parse(body)

    // Verify all competitors exist and belong to user
    const competitors = await db.select()
      .from(competitorProfiles)
      .where(
        and(
          inArray(competitorProfiles.id, competitor_ids),
          eq(competitorProfiles.user_id, user.id)
        )
      )

    if (competitors.length !== competitor_ids.length) {
      const foundIds = competitors.map(c => c.id)
      const missingIds = competitor_ids.filter(id => !foundIds.includes(id))
      return NextResponse.json({
        error: 'Some competitors not found or not accessible',
        missing_competitor_ids: missingIds
      }, { status: 404 })
    }

    // Get comprehensive intelligence data
    const intelligence = await db.select()
      .from(intelligenceData)
      .where(
        and(
          inArray(intelligenceData.competitor_id, competitor_ids),
          eq(intelligenceData.user_id, user.id)
        )
      )
      .orderBy(desc(intelligenceData.collected_at))
      .limit(500)

    const results: Record<string, any> = {
      competitors: competitors.map(c => ({
        id: c.id,
        name: c.name,
        threat_level: c.threat_level,
        industry: c.industry
      })),
      analysis_scope,
      market_context
    }

    // Perform pricing analysis for each competitor
    if (analysis_scope === 'pricing_only' || analysis_scope === 'comprehensive') {
      results.pricing_analyses = await Promise.all(
        competitors.map(async (competitor) => {
          const competitorIntelligence = intelligence.filter(i => i.competitor_id === competitor.id)

          // Transform database results to match IntelligenceData interface
          const transformedIntelligence = competitorIntelligence.map(item => ({
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

          try {
            const pricingAnalysis = await blazeGrowthIntelligence.analyzePricingStrategy(
              competitor.id,
              transformedIntelligence
            )

            return {
              competitor_id: competitor.id,
              competitor_name: competitor.name,
              pricing_analysis: pricingAnalysis,
              intelligence_data_points: competitorIntelligence.length
            }
          } catch (error) {
            logError(`Pricing analysis failed for competitor ${competitor.id}:`, error)
            return {
              competitor_id: competitor.id,
              competitor_name: competitor.name,
              pricing_analysis: null,
              error: 'Analysis failed'
            }
          }
        })
      )
    }

    // Perform competitive positioning analysis
    if (analysis_scope === 'competitive_positioning' || analysis_scope === 'comprehensive') {
      results.competitive_positioning = await blazeGrowthIntelligence.buildMarketPositioningRecommendations(
        competitor_ids,
        market_context || { industry: competitors[0]?.industry }
      )
    }

    // Generate revenue optimization suggestions
    if (analysis_scope === 'revenue_optimization' || analysis_scope === 'comprehensive') {
      if (results.pricing_analyses) {
        results.revenue_optimization = await Promise.all(
          results.pricing_analyses
            .filter((analysis: any) => analysis.pricing_analysis !== null)
            .map(async (analysis: any) => {
              try {
                const suggestions = await blazeGrowthIntelligence.generateRevenueOptimizationSuggestions(
                  analysis.competitor_id,
                  analysis.pricing_analysis
                )

                return {
                  competitor_id: analysis.competitor_id,
                  competitor_name: analysis.competitor_name,
                  revenue_suggestions: suggestions
                }
              } catch (error) {
                logError(`Revenue optimization failed for competitor ${analysis.competitor_id}:`, error)
                return {
                  competitor_id: analysis.competitor_id,
                  competitor_name: analysis.competitor_name,
                  revenue_suggestions: [],
                  error: 'Optimization analysis failed'
                }
              }
            })
        )
      }
    }

    // Generate cross-competitor insights
    if (analysis_scope === 'comprehensive' && results.pricing_analyses) {
      const successfulAnalyses = results.pricing_analyses.filter((a: any) => a.pricing_analysis !== null)

      results.market_insights = {
        pricing_models_detected: [...new Set(successfulAnalyses.map((a: any) => a.pricing_analysis.pricingModel.type))],
        average_market_position: successfulAnalyses.reduce((sum: number, a: any) => {
          const positionScore = a.pricing_analysis.competitivePricing.marketPosition === 'premium' ? 4 :
            a.pricing_analysis.competitivePricing.marketPosition === 'mid_market' ? 3 :
              a.pricing_analysis.competitivePricing.marketPosition === 'value' ? 2 : 1
          return sum + positionScore
        }, 0) / successfulAnalyses.length,
        total_pricing_gaps: successfulAnalyses.reduce((sum: number, a: any) =>
          sum + (a.pricing_analysis.competitivePricing.pricingGaps?.length || 0), 0
        ),
        market_opportunity_score: Math.min(100, successfulAnalyses.length * 20) // Simple scoring
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      intelligence_data_points: intelligence.length,
      analyzed_at: new Date().toISOString(),
      agent: 'blaze'
    })

  } catch (error) {
    logError('Error in comprehensive pricing analysis:', error)
    return NextResponse.json(
      { error: 'Failed to perform comprehensive pricing analysis' },
      { status: 500 }
    )
  }
}