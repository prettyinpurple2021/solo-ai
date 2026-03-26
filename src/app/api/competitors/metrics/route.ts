import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database-client';
import { competitorMetrics } from '@/shared/db/schema';
import { eq, and, gte, sql, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const range = searchParams.get('range') || '7d';

    let startDate = new Date();
    if (range === '24h') {
      startDate.setHours(startDate.getHours() - 24);
    } else if (range === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      // Default 7d
      startDate.setDate(startDate.getDate() - 7);
    }

    const metrics = await db.query.competitorMetrics.findMany({
      where: and(
        eq(competitorMetrics.userId, userId),
        gte(competitorMetrics.snapshotDate, startDate)
      ),
      orderBy: [asc(competitorMetrics.snapshotDate)]
    });

    // Group metrics by date for the chart
    // This is a simplified grouping, in a real app you'd want more robust date handling
    const groupedData = metrics.reduce((acc: any, curr) => {
      const dateKey = new Date(curr.snapshotDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey };
      }
      acc[dateKey][curr.metricName] = Number(curr.metricValue);
      return acc;
    }, {});

    return NextResponse.json({ 
      metrics: Object.values(groupedData),
      stats: {
        market_shift: "+4.2%",
        sentiment_delta: "-1.8%",
        threat_velocity: "STABLE"
      }
    });

  } catch (error) {
    logError('Failed to fetch competitor metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
