import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { intelligenceData, competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, inArray, gte, desc } from 'drizzle-orm'
import { AgentCollaborationSystem } from '@/lib/custom-ai-agents/agent-collaboration-system'



import type {
  IntelligenceData,
  AnalysisResult,
  ExtractedData,
  SourceType,
  ImportanceLevel
} from '@/lib/competitor-intelligence-types'


// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Validation schema for analysis request
const AnalysisRequestSchema = z.object({
  intelligenceIds: z.array(z.string()).min(1).max(50),
  analysisType: z.enum(['comprehensive', 'trend', 'sentiment', 'competitive', 'opportunity']).default('comprehensive'),
  agentIds: z.array(z.string()).optional(), // Specific agents to use for analysis
  focusAreas: z.array(z.enum(['marketing', 'strategic', 'product', 'pricing', 'technical', 'opportunity', 'threat'])).optional(),
})

// Fallback AI analysis service during migration
const INSIGHT_TYPES: AnalysisResult['insights'][number]['type'][] = [
  'marketing',
  'strategic',
  'product',
  'pricing',
  'technical',
  'opportunity',
  'threat',
]

const RECOMMENDATION_TYPES: AnalysisResult['recommendations'][number]['type'][] = [
  'defensive',
  'offensive',
  'monitoring',
  'strategic',
]

const PRIORITY_LEVELS = ['low', 'medium', 'high'] as const

async function performIntelligenceAnalysis(
  userId: string,
  intelligenceEntries: any[],
  analysisType: string,
  agentIds?: string[],
  focusAreas?: string[]
): Promise<AnalysisResult[]> {
  const system = new AgentCollaborationSystem(userId)
  const agents = agentIds && agentIds.length ? agentIds : ['echo', 'lexi', 'nova', 'blaze']
  const focusLabel = focusAreas && focusAreas.length ? focusAreas.join(', ') : 'all focus areas'

  const buildEntrySummary = (entry: any, index: number) => {
    const competitor = entry.competitor
    const extracted = entry.intelligence.extracted_data || {}
    const title = extracted.title || entry.intelligence.data_type || 'Untitled intelligence'
    const snippets = Array.isArray(extracted.keyInsights) ? extracted.keyInsights.slice(0, 3).join(' | ') : ''

    return `
Intelligence ${index + 1}:
- Title: ${title}
- Source: ${entry.intelligence.source_type}${entry.intelligence.source_url ? ` (${entry.intelligence.source_url})` : ''}
- Competitor: ${competitor?.name ?? 'Unknown'}${competitor?.threatLevel ? ` (Threat: ${competitor.threatLevel})` : ''}
- Importance: ${entry.intelligence.importance}
- Summary: ${snippets || 'No extracted insights yet'}
- Tags: ${(entry.intelligence.tags || []).join(', ')}
`
  }

  const intelligenceSummary = intelligenceEntries.map(buildEntrySummary).join('\n')

  const results: AnalysisResult[] = []

  for (const agentId of agents) {
    try {
      const prompt = `
You are providing a ${analysisType} intelligence analysis focusing on ${focusLabel}.

Analyze the intelligence entries below and produce structured insights and recommendations that map to the SoloSuccess AI intelligence schema.

${intelligenceSummary}

Requirements:
- Insights must use one of: "marketing", "strategic", "product", "pricing", "technical", "opportunity", "threat".
- Recommendations must use one of: "defensive", "offensive", "monitoring", "strategic".
- Be specific about supporting evidence and actionability.
- Highlight cross-intelligence patterns, emerging risks, and opportunities.
`

      const response = await system.processRequest(
        prompt,
        {
          analysisType,
          focusAreas,
          intelligenceCount: intelligenceEntries.length,
        },
        agentId
      )

      const analysis = response.primaryResponse.analysis

      if (!analysis || analysis.insights.length === 0) {
        logWarn('Agent response missing structured analysis, falling back to content parsing', { agentId })

        results.push({
          agentId,
          analysisType,
          insights: [
            {
              id: `auto-insight-${Date.now()}-${agentId}`,
              type: 'strategic',
              title: 'Qualitative Intelligence Summary',
              description: response.primaryResponse.content,
              confidence: response.primaryResponse.confidence,
              impact: 'medium',
              urgency: 'medium',
              supportingData: [],
            },
          ],
          recommendations: response.primaryResponse.suggestedActions.map((action, index) => ({
            id: `auto-rec-${Date.now()}-${agentId}-${index}`,
            type: 'strategic',
            title: action,
            description: action,
            priority: 'medium',
            estimatedEffort: 'moderate',
            potentialImpact: 'medium',
            timeline: '30 days',
            actionItems: [],
          })),
          confidence: response.primaryResponse.confidence,
          analyzedAt: new Date(),
        })

        continue
      }

      results.push({
        agentId,
        analysisType,
        insights: analysis.insights.map((insight, index) => ({
          id: insight.id || `insight-${Date.now()}-${agentId}-${index}`,
          type: (INSIGHT_TYPES.includes(insight.type as any) ? (insight.type as any) : 'strategic') as AnalysisResult['insights'][number]['type'],
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence ?? response.primaryResponse.confidence,
          impact: (PRIORITY_LEVELS.includes(insight.impact as any) ? (insight.impact as any) : 'medium'),
          urgency: (PRIORITY_LEVELS.includes(insight.urgency as any) ? (insight.urgency as any) : 'medium'),
          supportingData: insight.supportingData ?? [],
        })),
        recommendations: analysis.recommendations.map((recommendation, index) => ({
          id: recommendation.id || `recommendation-${Date.now()}-${agentId}-${index}`,
          type: (RECOMMENDATION_TYPES.includes(recommendation.type as any)
            ? (recommendation.type as any)
            : 'strategic') as AnalysisResult['recommendations'][number]['type'],
          title: recommendation.title,
          description: recommendation.description,
          priority: (PRIORITY_LEVELS.includes(recommendation.priority as any)
            ? (recommendation.priority as any)
            : 'medium'),
          estimatedEffort: recommendation.estimatedEffort ?? 'moderate',
          potentialImpact: recommendation.potentialImpact ?? 'medium',
          timeline: recommendation.timeline ?? '30 days',
          actionItems: recommendation.actionItems ?? [],
        })),
        confidence: response.primaryResponse.confidence,
        analyzedAt: new Date(),
      })
    } catch (error) {
      logError(`Agent analysis failed for ${agentId}`, error)
      results.push({
        agentId,
        analysisType,
        insights: [
          {
            id: `error-insight-${Date.now()}-${agentId}`,
            type: 'threat',
            title: 'Analysis failed',
            description: `Agent ${agentId} failed to analyze intelligence: ${error instanceof Error ? error.message : 'Unknown error'
              }`,
            confidence: 0.1,
            impact: 'low',
            urgency: 'low',
            supportingData: [],
          },
        ],
        recommendations: [],
        confidence: 0.1,
        analyzedAt: new Date(),
      })
    }
  }

  return results
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('intelligence:analyze', ip, 60_000, 5)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = AnalysisRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Fetch intelligence entries with competitor info
    const intelligence = await db
      .select({
        intelligence: intelligenceData,
        competitor: {
          id: competitorProfiles.id,
          name: competitorProfiles.name,
          domain: competitorProfiles.domain,
          threatLevel: competitorProfiles.threat_level,
        }
      })
      .from(intelligenceData)
      .leftJoin(competitorProfiles, eq(intelligenceData.competitor_id, competitorProfiles.id))
      .where(
        and(
          inArray(intelligenceData.id, data.intelligenceIds),
          eq(intelligenceData.user_id, user.id)
        )
      )

    if (intelligence.length === 0) {
      return NextResponse.json(
        { error: 'No intelligence entries found or access denied' },
        { status: 404 }
      )
    }

    // Transform intelligence data for analysis
    const intelligenceForAnalysis = intelligence.map(item => ({
      id: item.intelligence.id,
      competitorId: item.intelligence.competitor_id,
      sourceType: item.intelligence.source_type as SourceType,
      sourceUrl: item.intelligence.source_url,
      dataType: item.intelligence.data_type,
      rawContent: item.intelligence.raw_content,
      extractedData: (item.intelligence.extracted_data as ExtractedData) || {},
      analysisResults: (item.intelligence.analysis_results as AnalysisResult[]) || [],
      confidence: item.intelligence.confidence ? parseFloat(item.intelligence.confidence) : 0,
      importance: item.intelligence.importance as ImportanceLevel,
      tags: (item.intelligence.tags as string[]) || [],
      collectedAt: item.intelligence.collected_at!,
      competitor: item.competitor,
    }))

    // Perform AI analysis
    const analysisResults = await performIntelligenceAnalysis(
      user.id,
      intelligenceForAnalysis,
      data.analysisType,
      data.agentIds,
      data.focusAreas
    )

    // Update intelligence entries with new analysis results
    const updatePromises = intelligence.map(async (item) => {
      const existingAnalysisResults = (item.intelligence.analysis_results as AnalysisResult[]) || []
      const newAnalysisResults = analysisResults.filter(_result =>
        // Link all generated analysis results to this intelligence entry
        // In the future, we could use relevance scores to selectively link specific insights
        true
      )
      const mergedAnalysisResults = [...existingAnalysisResults, ...newAnalysisResults]

      return db
        .update(intelligenceData)
        .set({
          analysis_results: mergedAnalysisResults,
          processed_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(intelligenceData.id, item.intelligence.id))
    })

    await Promise.all(updatePromises)

    // Generate analysis summary
    const summary = {
      totalIntelligenceAnalyzed: intelligence.length,
      competitorsAnalyzed: [...new Set(intelligence.map(i => i.intelligence.competitor_id))].length,
      analysisResultsGenerated: analysisResults.length,
      averageConfidence: analysisResults.reduce((sum, r) => sum + r.confidence, 0) / (analysisResults.length || 1),
      insightsByType: analysisResults.reduce((acc, result) => {
        result.insights.forEach(insight => {
          acc[insight.type] = (acc[insight.type] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>),
      recommendationsByType: analysisResults.reduce((acc, result) => {
        result.recommendations.forEach(rec => {
          acc[rec.type] = (acc[rec.type] || 0) + 1
        })
        return acc
      }, {} as Record<string, number>),
      highPriorityRecommendations: analysisResults.reduce((count, result) =>
        count + result.recommendations.filter(r => r.priority === 'high').length, 0
      ),
    }

    return NextResponse.json({
      analysisResults,
      summary,
      intelligenceEntries: intelligenceForAnalysis.map(entry => ({
        id: entry.id,
        competitorId: entry.competitorId,
        sourceType: entry.sourceType,
        dataType: entry.dataType,
        importance: entry.importance,
        collectedAt: entry.collectedAt,
        competitor: entry.competitor,
      })),
    })
  } catch (error) {
    logError('Error analyzing intelligence data:', error)
    return NextResponse.json(
      { error: 'Failed to analyze intelligence data' },
      { status: 500 }
    )
  }
}