import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import {
    competitiveOpportunities,
    competitorAlerts,
    competitorProfiles
} from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { verifyAuth } from '@/lib/auth-server'


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
    id: number
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
        const authResult = await verifyAuth(req)
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
                id: alert.id.toString(),
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

        return NextResponse.json({
            insights: allInsights,
            stats
        })

    } catch (error) {
        logError('Error fetching intelligence data:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
