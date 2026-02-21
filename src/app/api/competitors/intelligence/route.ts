import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import {
    competitiveOpportunities,
    competitorAlerts,
    competitorProfiles,
    intelligenceData
} from '@/shared/db/schema'
import { eq, desc, sql,} from 'drizzle-orm'
import { verifyAuth } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'


export const dynamic = 'force-dynamic'

interface OpportunityResult {
    id: string
    title: string
    description: string
    confidence: string | null
    priority_score: string | null
    recommendations: unknown
    created_at: Date | null
    competitor_name: string | null
    source: string
}

interface AlertResult {
    id: string
    title: string
    description: string | null
    severity: string
    alert_type: string
    recommended_actions: unknown
    created_at: Date | null
    competitor_name: string | null
    source: string
}


export async function GET(req: NextRequest) {
    try {
        const authResult = await verifyAuth()
        if (!authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = authResult.user.id

        // Fetch Opportunities
        const opportunities = await db
            .select({
                id: competitiveOpportunities.id,
                title: competitiveOpportunities.title,
                description: competitiveOpportunities.description,
                confidence: competitiveOpportunities.confidence,
                priority_score: competitiveOpportunities.priority_score,
                recommendations: competitiveOpportunities.recommendations,
                created_at: competitiveOpportunities.created_at,
                competitor_name: competitorProfiles.name,
                source: sql<string>`'Competitive Analysis'`,
            })
            .from(competitiveOpportunities)
            .leftJoin(competitorProfiles, eq(competitiveOpportunities.competitor_id, competitorProfiles.id))
            .where(eq(competitiveOpportunities.user_id, userId))
            .orderBy(desc(competitiveOpportunities.created_at))

        // Fetch Alerts (Threats, Moves, Trends)
        const alerts = await db
            .select({
                id: competitorAlerts.id,
                title: competitorAlerts.title,
                description: competitorAlerts.description,
                severity: competitorAlerts.severity,
                alert_type: competitorAlerts.alert_type,
                recommended_actions: competitorAlerts.recommended_actions,
                created_at: competitorAlerts.created_at,
                competitor_name: competitorProfiles.name,
                source: sql<string>`'Market Intelligence'`,
            })
            .from(competitorAlerts)
            .leftJoin(competitorProfiles, eq(competitorAlerts.competitor_id, competitorProfiles.id))
            .where(eq(competitorAlerts.user_id, userId))
            .orderBy(desc(competitorAlerts.created_at))

        // Map to IntelligenceInsight interface
        const mappedOpportunities = opportunities.map((op: OpportunityResult) => ({
            id: op.id,
            type: 'opportunity',
            title: op.title,
            description: op.description,
            importance: Number(op.priority_score) > 8 ? 'high' : 'medium', // Simple mapping
            confidence: Number(op.confidence) * 100, // Assuming confidence is 0-1 decimal
            source: op.source,
            timestamp: op.created_at?.toISOString(),
            competitor: op.competitor_name,
            impact_score: Number(op.priority_score), // Using priority score as impact
            action_required: true,
            recommendations: op.recommendations as string[] || []
        }))

        const mappedAlerts = alerts.map((alert: AlertResult) => {
            let type = 'threat'
            if (alert.alert_type === 'move') type = 'competitive_move'
            if (alert.alert_type === 'trend') type = 'trend'

            return {
                id: alert.id,
                type,
                title: alert.title,
                description: alert.description,
                importance: alert.severity === 'critical' ? 'critical' :
                    alert.severity === 'high' ? 'high' :
                        alert.severity === 'medium' ? 'medium' : 'low',
                confidence: 90, // Default confidence for alerts
                source: alert.source,
                timestamp: alert.created_at?.toISOString(),
                competitor: alert.competitor_name,
                impact_score: alert.severity === 'critical' ? 9 :
                    alert.severity === 'high' ? 7 :
                        alert.severity === 'medium' ? 5 : 3,
                action_required: alert.severity === 'critical' || alert.severity === 'high',
                recommendations: alert.recommended_actions as string[] || []
            }
        })

        const allInsights = [...mappedOpportunities, ...mappedAlerts].sort((a, b) =>
            new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
        )

        // Calculate Stats
        const stats = {
            total_insights: allInsights.length,
            critical_alerts: allInsights.filter(i => i.importance === 'critical').length,
            opportunities_identified: mappedOpportunities.length,
            threats_monitored: mappedAlerts.filter(i => i.type === 'threat').length,
            market_trends_tracked: mappedAlerts.filter(i => i.type === 'trend').length,
            competitive_moves_detected: mappedAlerts.filter(i => i.type === 'competitive_move').length
        }

        // Calculate market position metrics from real data
        const totalCompetitors = await db
            .select({ count: sql<number>`count(*)` })
            .from(competitorProfiles)
            .where(eq(competitorProfiles.user_id, userId))

        const competitorCount = Number(totalCompetitors[0]?.count || 0)
        
        // Calculate market share estimate based on intelligence data volume
        const intelligenceVolume = await db
            .select({ count: sql<number>`count(*)` })
            .from(intelligenceData)
            .where(eq(intelligenceData.user_id, userId))

        const userIntelligenceCount = Number(intelligenceVolume[0]?.count || 0)
        
        // Estimate market position based on intelligence coverage
        // High intelligence coverage suggests stronger market position
        const marketShareEstimate = Math.min(100, Math.max(0, 
            competitorCount > 0 ? (userIntelligenceCount / (competitorCount * 10)) * 100 : 0
        ))

        // Calculate competitive advantage based on opportunities vs threats ratio
        const opportunitiesCount = mappedOpportunities.length
        const threatsCount = mappedAlerts.filter(a => a.type === 'threat').length
        const advantageRatio = threatsCount > 0 ? opportunitiesCount / threatsCount : opportunitiesCount
        const competitiveAdvantage = advantageRatio > 1.5 ? 'strong' : 
                                     advantageRatio > 1 ? 'moderate' : 'developing'

        // Calculate innovation index based on trend insights
        const trendsCount = mappedAlerts.filter(a => a.type === 'trend').length
        const innovationIndex = trendsCount > 10 ? 'high' : 
                                trendsCount > 5 ? 'moderate' : 'developing'

        // Generate strategic recommendations from real opportunities and threats
        const strategicRecommendations: string[] = []
        const topOpportunities = mappedOpportunities
            .sort((a, b) => b.impact_score - a.impact_score)
            .slice(0, 3)
        
        topOpportunities.forEach((op, idx) => {
            if (op.title && op.description) {
                strategicRecommendations.push(`${idx + 1}. ${op.title}: ${op.description.substring(0, 100)}...`)
            }
        })

        const criticalThreats = mappedAlerts
            .filter(a => a.type === 'threat' && (a.importance === 'critical' || a.importance === 'high'))
            .slice(0, 2)

        criticalThreats.forEach((threat, idx) => {
            if (threat.title && threat.description) {
                strategicRecommendations.push(`Threat ${idx + 1}: ${threat.title} - ${threat.description.substring(0, 80)}...`)
            }
        })

        // Calculate SWOT-like analysis from real data
        const strengths = mappedOpportunities
            .filter(op => op.impact_score > 7)
            .map(op => op.title)
            .slice(0, 3)

        const weaknesses = mappedAlerts
            .filter(a => a.type === 'threat' && a.importance === 'high')
            .map(a => a.title)
            .slice(0, 3)

        const opportunityTitles = mappedOpportunities
            .map(op => op.title)
            .slice(0, 3)

        const threats = mappedAlerts
            .filter(a => a.type === 'threat')
            .map(a => a.title)
            .slice(0, 3)

        const marketPosition = {
            market_share: Math.round(marketShareEstimate),
            competitive_advantage: competitiveAdvantage,
            innovation_index: innovationIndex,
            customer_satisfaction: 'excellent' // This would come from customer data in production
        }

        const strategicAnalysis = {
            strengths,
            weaknesses,
            opportunities: opportunityTitles,
            threats,
            recommendations: strategicRecommendations.slice(0, 5)
        }

        logInfo('Intelligence data fetched successfully', { 
            userId, 
            insightsCount: allInsights.length,
            stats 
        })

        return NextResponse.json({
            insights: allInsights,
            stats,
            market_position: marketPosition,
            strategic_analysis: strategicAnalysis
        })

    } catch (error) {
        logError('Error fetching intelligence data:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
