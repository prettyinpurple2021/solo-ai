
import { db } from '@/db';
import { competitorProfiles, intelligenceData } from '@/shared/db/schema';
import { eq, desc, and, count, gte } from 'drizzle-orm';

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
