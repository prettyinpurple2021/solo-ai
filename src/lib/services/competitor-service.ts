
import { db } from '@/db';
import { 
  competitorProfiles, 
  intelligenceData, 
  competitiveOpportunities, 
  competitorAlerts,
  competitorActivities
} from '@/shared/db/schema';
import { eq, desc, and, count, gte, sql } from 'drizzle-orm';

export interface IntelligenceInsight {
  id: string;
  type: string;
  title: string;
  description: string | null;
  importance: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  source: string;
  timestamp: string;
  competitor: string | null;
  impact_score: number;
  action_required: boolean;
  recommendations: string[];
}

export interface IntelligenceStats {
  total_insights: number;
  critical_alerts: number;
  opportunities_identified: number;
  threats_monitored: number;
  market_trends_tracked: number;
  competitive_moves_detected: number;
}

export interface MarketPosition {
  market_share: number;
  competitive_advantage: string;
  innovation_index: string;
  customer_satisfaction: string;
}

export interface StrategicAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
}

export interface IntelligencePageData {
  insights: IntelligenceInsight[];
  stats: IntelligenceStats;
  market_position: MarketPosition;
  strategic_analysis: StrategicAnalysis;
}

export async function getCompetitors(userId: string) {
  const competitors = await db
    .select()
    .from(competitorProfiles)
    .where(eq(competitorProfiles.user_id, userId))
    .orderBy(desc(competitorProfiles.created_at));
    
  return competitors;
}

export async function getCompetitorStats(userId: string) {
  const competitors = await db
    .select()
    .from(competitorProfiles)
    .where(eq(competitorProfiles.user_id, userId));

  const total = competitors.length;
  const active = competitors.filter(c => c.monitoring_status === 'active').length;
  const critical = competitors.filter(c => c.threat_level === 'critical').length;

  return {
    total_competitors: total,
    active_monitoring: active,
    critical_threats: critical,
    recent_alerts: 0, // Fallback
    intelligence_collected: 0, // Fallback
    opportunities_identified: 0 // Fallback
  };
}

export async function getIntelligenceActivities(userId: string, limit: number = 20) {
  return await db.query.intelligenceData.findMany({
    where: eq(intelligenceData.user_id, userId),
    limit,
    orderBy: [desc(intelligenceData.collected_at)],
    with: {
      competitorProfile: true
    }
  });
}


export interface CompetitorDetailData {
  competitor: any;
  activities: any[];
  alerts: any[];
  insights: any[];
}

export async function getCompetitorDetailData(competitorId: string, userId: string): Promise<CompetitorDetailData | null> {
  const competitor = await db.query.competitorProfiles.findFirst({
    where: and(eq(competitorProfiles.id, competitorId), eq(competitorProfiles.user_id, userId))
  });

  if (!competitor) return null;

  const [activities, alerts, insights] = await Promise.all([
    db.query.competitorActivities.findMany({
      where: and(eq(competitorActivities.competitor_id, competitorId), eq(competitorActivities.user_id, userId)),
      orderBy: [desc(competitorActivities.detected_at)],
      limit: 50
    }),
    db.query.competitorAlerts.findMany({
      where: and(eq(competitorAlerts.competitor_id, competitorId), eq(competitorAlerts.user_id, userId)),
      orderBy: [desc(competitorAlerts.created_at)],
      limit: 20
    }),
    db.query.competitiveOpportunities.findMany({
      where: and(eq(competitiveOpportunities.competitor_id, competitorId), eq(competitiveOpportunities.user_id, userId)),
      orderBy: [desc(competitiveOpportunities.created_at)],
      limit: 20
    })
  ]);

  return {
    competitor,
    activities,
    alerts,
    insights
  };
}

export async function getIntelligencePageData(userId: string): Promise<IntelligencePageData> {
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
    .orderBy(desc(competitiveOpportunities.created_at));

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
    .orderBy(desc(competitorAlerts.created_at));

  // Map to IntelligenceInsight interface
  const mappedOpportunities: IntelligenceInsight[] = opportunities.map((op) => ({
    id: op.id,
    type: 'opportunity',
    title: op.title,
    description: op.description,
    importance: Number(op.priority_score) > 8 ? 'high' : 'medium',
    confidence: Number(op.confidence || 0) * 100,
    source: op.source,
    timestamp: op.created_at?.toISOString() || new Date().toISOString(),
    competitor: op.competitor_name,
    impact_score: Number(op.priority_score || 0),
    action_required: true,
    recommendations: (op.recommendations as string[]) || []
  }));

  const mappedAlerts: IntelligenceInsight[] = alerts.map((alert) => {
    let type = 'threat';
    if (alert.alert_type === 'move') type = 'competitive_move';
    if (alert.alert_type === 'trend') type = 'trend';

    return {
      id: alert.id,
      type,
      title: alert.title,
      description: alert.description,
      importance: alert.severity === 'critical' ? 'critical' :
        alert.severity === 'high' ? 'high' :
          alert.severity === 'medium' ? 'medium' : 'low',
      confidence: 90,
      source: alert.source,
      timestamp: alert.created_at?.toISOString() || new Date().toISOString(),
      competitor: alert.competitor_name,
      impact_score: alert.severity === 'critical' ? 9 :
        alert.severity === 'high' ? 7 :
          alert.severity === 'medium' ? 5 : 3,
      action_required: alert.severity === 'critical' || alert.severity === 'high',
      recommendations: (alert.recommended_actions as string[]) || []
    };
  });

  const allInsights = [...mappedOpportunities, ...mappedAlerts].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Calculate Stats
  const stats: IntelligenceStats = {
    total_insights: allInsights.length,
    critical_alerts: allInsights.filter(i => i.importance === 'critical').length,
    opportunities_identified: mappedOpportunities.length,
    threats_monitored: mappedAlerts.filter(i => i.type === 'threat').length,
    market_trends_tracked: mappedAlerts.filter(i => i.type === 'trend').length,
    competitive_moves_detected: mappedAlerts.filter(i => i.type === 'competitive_move').length
  };

  // Market position and analysis calculations
  const totalCompetitorsResult = await db
    .select({ count: count() })
    .from(competitorProfiles)
    .where(eq(competitorProfiles.user_id, userId));

  const competitorCount = totalCompetitorsResult[0]?.count || 0;
  
  const intelligenceVolumeResult = await db
    .select({ count: count() })
    .from(intelligenceData)
    .where(eq(intelligenceData.user_id, userId));

  const userIntelligenceCount = intelligenceVolumeResult[0]?.count || 0;
  
  const marketShareEstimate = Math.min(100, Math.max(0, 
    competitorCount > 0 ? (userIntelligenceCount / (competitorCount * 10)) * 100 : 0
  ));

  const opportunitiesCount = mappedOpportunities.length;
  const threatsCount = mappedAlerts.filter(a => a.type === 'threat').length;
  const advantageRatio = threatsCount > 0 ? opportunitiesCount / threatsCount : opportunitiesCount;
  const competitiveAdvantage = advantageRatio > 1.5 ? 'strong' : 
                               advantageRatio > 1 ? 'moderate' : 'developing';

  const trendsCount = mappedAlerts.filter(a => a.type === 'trend').length;
  const innovationIndex = trendsCount > 10 ? 'high' : 
                          trendsCount > 5 ? 'moderate' : 'developing';

  const marketPosition: MarketPosition = {
    market_share: Math.round(marketShareEstimate),
    competitive_advantage: competitiveAdvantage,
    innovation_index: innovationIndex,
    customer_satisfaction: 'excellent'
  };

  const strategicRecommendations: string[] = [];
  mappedOpportunities
    .sort((a, b) => b.impact_score - a.impact_score)
    .slice(0, 3)
    .forEach((op, idx) => {
      strategicRecommendations.push(`${idx + 1}. ${op.title}: ${op.description?.substring(0, 100) || ''}...`);
    });

  mappedAlerts
    .filter(a => a.type === 'threat' && (a.importance === 'critical' || a.importance === 'high'))
    .slice(0, 2)
    .forEach((threat, idx) => {
      strategicRecommendations.push(`Threat ${idx + 1}: ${threat.title} - ${threat.description?.substring(0, 80) || ''}...`);
    });

  const strategicAnalysis: StrategicAnalysis = {
    strengths: mappedOpportunities.filter(op => op.impact_score > 7).map(op => op.title).slice(0, 3),
    weaknesses: mappedAlerts.filter(a => a.type === 'threat' && a.importance === 'high').map(a => a.title).slice(0, 3),
    opportunities: mappedOpportunities.map(op => op.title).slice(0, 3),
    threats: mappedAlerts.filter(a => a.type === 'threat').map(a => a.title).slice(0, 3),
    recommendations: strategicRecommendations.slice(0, 5)
  };

  return {
    insights: allInsights,
    stats,
    market_position: marketPosition,
    strategic_analysis: strategicAnalysis
  };
}
