import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { intelligenceData, competitorProfiles } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, inArray, gte, desc } from 'drizzle-orm'
import type { 
  IntelligenceData,
  AnalysisResult,
  ExtractedData,
  SourceType,
  ImportanceLevel
} from '@/lib/competitor-intelligence-types'

// Validation schema for analysis request
const AnalysisRequestSchema = z.object({
  intelligenceIds: z.array(z.number().int().positive()).min(1).max(50),
  analysisType: z.enum(['comprehensive', 'trend', 'sentiment', 'competitive', 'opportunity']).default('comprehensive'),
  agentIds: z.array(z.string()).optional(), // Specific agents to use for analysis
  focusAreas: z.array(z.enum(['marketing', 'strategic', 'product', 'pricing', 'technical', 'opportunity', 'threat'])).optional(),
})

// Mock AI analysis service - in production this would call actual AI services
async function performIntelligenceAnalysis(
  intelligenceEntries: any[],
  analysisType: string,
  agentIds?: string[],
  focusAreas?: string[]
): Promise<AnalysisResult[]> {
  // This is a mock implementation - replace with actual AI service calls
  const analysisResults: AnalysisResult[] = []

  // Simulate different agent analyses
  const agents = agentIds || ['echo', 'lexi', 'nova', 'blaze']
  
  for (const agentId of agents) {
    const insights = []
    const recommendations = []

    // Generate mock insights based on agent specialization
    switch (agentId) {
      case 'echo':
        if (!focusAreas || focusAreas.includes('marketing')) {
          insights.push({
            id: `echo-insight-${Date.now()}`,
            type: 'marketing' as const,
            title: 'Marketing Strategy Pattern Detected',
            description: 'Competitor is shifting focus to social media engagement with increased posting frequency',
            confidence: 0.85,
            impact: 'medium' as const,
            urgency: 'medium' as const,
            supportingData: intelligenceEntries.filter(e => e.sourceType === 'social_media'),
          })
          
          recommendations.push({
            id: `echo-rec-${Date.now()}`,
            type: 'offensive' as const,
            title: 'Counter Social Media Strategy',
            description: 'Increase our social media presence to match competitor engagement levels',
            priority: 'medium' as const,
            estimatedEffort: '2-3 weeks',
            potentialImpact: 'Medium - could capture competitor audience',
            timeline: 'Immediate',
            actionItems: ['Audit current social media strategy', 'Increase posting frequency', 'Engage with competitor audience'],
          })
        }
        break

      case 'lexi':
        if (!focusAreas || focusAreas.includes('strategic')) {
          insights.push({
            id: `lexi-insight-${Date.now()}`,
            type: 'strategic' as const,
            title: 'Strategic Direction Shift',
            description: 'Hiring patterns suggest competitor is expanding into new market segments',
            confidence: 0.78,
            impact: 'high' as const,
            urgency: 'high' as const,
            supportingData: intelligenceEntries.filter(e => e.sourceType === 'job_posting'),
          })
          
          recommendations.push({
            id: `lexi-rec-${Date.now()}`,
            type: 'strategic' as const,
            title: 'Market Expansion Analysis',
            description: 'Conduct thorough analysis of new market segments competitor is targeting',
            priority: 'high' as const,
            estimatedEffort: '1-2 months',
            potentialImpact: 'High - could identify new opportunities or threats',
            timeline: 'Within 30 days',
            actionItems: ['Research target markets', 'Analyze competitive positioning', 'Evaluate our capabilities'],
          })
        }
        break

      case 'nova':
        if (!focusAreas || focusAreas.includes('product')) {
          insights.push({
            id: `nova-insight-${Date.now()}`,
            type: 'product' as const,
            title: 'Product Feature Gap Identified',
            description: 'Competitor website updates reveal new features we lack',
            confidence: 0.92,
            impact: 'high' as const,
            urgency: 'medium' as const,
            supportingData: intelligenceEntries.filter(e => e.sourceType === 'website'),
          })
          
          recommendations.push({
            id: `nova-rec-${Date.now()}`,
            type: 'offensive' as const,
            title: 'Feature Development Priority',
            description: 'Prioritize development of identified missing features',
            priority: 'high' as const,
            estimatedEffort: '3-6 months',
            potentialImpact: 'High - maintain competitive parity',
            timeline: 'Next quarter',
            actionItems: ['Spec out missing features', 'Estimate development effort', 'Plan roadmap integration'],
          })
        }
        break

      case 'blaze':
        if (!focusAreas || focusAreas.includes('pricing')) {
          insights.push({
            id: `blaze-insight-${Date.now()}`,
            type: 'pricing' as const,
            title: 'Pricing Strategy Opportunity',
            description: 'Competitor pricing changes create market positioning opportunity',
            confidence: 0.88,
            impact: 'medium' as const,
            urgency: 'high' as const,
            supportingData: intelligenceEntries.filter(e => e.dataType.includes('pricing')),
          })
          
          recommendations.push({
            id: `blaze-rec-${Date.now()}`,
            type: 'offensive' as const,
            title: 'Pricing Optimization',
            description: 'Adjust pricing strategy to capitalize on competitor positioning gap',
            priority: 'high' as const,
            estimatedEffort: '1-2 weeks',
            potentialImpact: 'Medium - potential revenue increase',
            timeline: 'Immediate',
            actionItems: ['Analyze pricing gap', 'Model revenue impact', 'Implement pricing changes'],
          })
        }
        break
    }

    if (insights.length > 0 || recommendations.length > 0) {
      analysisResults.push({
        agentId,
        analysisType,
        insights,
        recommendations,
        confidence: insights.reduce((sum, i) => sum + i.confidence, 0) / (insights.length || 1),
        analyzedAt: new Date(),
      })
    }
  }

  return analysisResults
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
      intelligenceForAnalysis,
      data.analysisType,
      data.agentIds,
      data.focusAreas
    )

    // Update intelligence entries with new analysis results
    const updatePromises = intelligence.map(async (item) => {
      const existingAnalysisResults = (item.intelligence.analysis_results as AnalysisResult[]) || []
      const newAnalysisResults = analysisResults.filter(result => 
        // Add analysis results to all entries for now - in production you'd be more selective
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
    console.error('Error analyzing intelligence data:', error)
    return NextResponse.json(
      { error: 'Failed to analyze intelligence data' },
      { status: 500 }
    )
  }
}