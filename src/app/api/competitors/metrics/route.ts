import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database-client';
import { competitorMetrics } from '@/shared/db/schema';
import { eq, and, gte, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { logError } from '@/lib/logger';

function toDayKey(d: Date): string {
  // Stable key (timezone-agnostic) for grouping + ordering.
  return d.toISOString().slice(0, 10);
}

function formatDay(dayKey: string): string {
  const d = new Date(`${dayKey}T00:00:00.000Z`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatSignedPercent(delta: number): string {
  const abs = Math.abs(delta);
  const sign = delta >= 0 ? '+' : '-';
  return `${sign}${abs.toFixed(1)}%`;
}

function getFirstAndLastFinite(values: Array<number | null | undefined>): { first: number; last: number } | null {
  let first: number | null = null;
  let last: number | null = null;

  for (const v of values) {
    if (typeof v !== 'number' || !Number.isFinite(v)) continue;
    if (first === null) first = v;
    last = v;
  }

  if (first === null || last === null) return null;
  return { first, last };
}

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

    // Group metrics by day for the chart. If multiple snapshots exist for the same day,
    // we average values (instead of overwriting).
    const dayMap = new Map<
      string,
      { dayKey: string; values: Record<string, { sum: number; count: number }> }
    >();

    for (const row of metrics) {
      const snapshotDate = row.snapshotDate instanceof Date ? row.snapshotDate : new Date(row.snapshotDate);
      if (!Number.isFinite(snapshotDate.getTime())) continue;

      const dayKey = toDayKey(snapshotDate);
      const metricName = row.metricName;
      const metricValueNum = Number(row.metricValue);

      if (!Number.isFinite(metricValueNum)) continue;

      const dayEntry =
        dayMap.get(dayKey) ?? { dayKey, values: {} };
      const metricBucket = dayEntry.values[metricName] ?? { sum: 0, count: 0 };
      metricBucket.sum += metricValueNum;
      metricBucket.count += 1;
      dayEntry.values[metricName] = metricBucket;

      dayMap.set(dayKey, dayEntry);
    }

    const dayKeys = Array.from(dayMap.keys()).sort();

    const series = dayKeys.map((dayKey) => {
      const dayEntry = dayMap.get(dayKey);
      const date = formatDay(dayKey);
      const row: Record<string, unknown> = { date };

      if (dayEntry) {
        for (const [metricName, bucket] of Object.entries(dayEntry.values)) {
          row[metricName] = bucket.count > 0 ? bucket.sum / bucket.count : null;
        }
      }

      return row;
    });

    // Compute stats from real metric series (no placeholder numbers).
    const metricNames = new Set<string>();
    for (const r of series) {
      for (const key of Object.keys(r)) {
        if (key === 'date') continue;
        metricNames.add(key);
      }
    }

    const marketKey = Array.from(metricNames).find((k) => k.toLowerCase() === 'market share' || k.toLowerCase().includes('market share')) ?? null;
    const sentimentKey = Array.from(metricNames).find((k) => k.toLowerCase() === 'sentiment' || k.toLowerCase().includes('sentiment')) ?? null;
    const threatKey = Array.from(metricNames).find((k) => k.toLowerCase().includes('threat')) ?? null;

    const marketSeriesValues = marketKey ? series.map((r) => (typeof (r as any)[marketKey] === 'number' ? (r as any)[marketKey] : Number((r as any)[marketKey]))) : [];
    const sentimentSeriesValues = sentimentKey ? series.map((r) => (typeof (r as any)[sentimentKey] === 'number' ? (r as any)[sentimentKey] : Number((r as any)[sentimentKey]))) : [];
    const threatSeriesValues = threatKey ? series.map((r) => (typeof (r as any)[threatKey] === 'number' ? (r as any)[threatKey] : Number((r as any)[threatKey]))) : [];

    // Avoid async inside stats; keep everything synchronous.
    const marketFirstLast = marketKey ? getFirstAndLastFinite(marketSeriesValues as any) : null;
    const sentimentFirstLast = sentimentKey ? getFirstAndLastFinite(sentimentSeriesValues as any) : null;
    const threatFirstLast = threatKey ? getFirstAndLastFinite(threatSeriesValues as any) : null;

    const market_shift =
      marketFirstLast ? formatSignedPercent(marketFirstLast.last - marketFirstLast.first) : 'N/A';
    const sentiment_delta =
      sentimentFirstLast ? formatSignedPercent(sentimentFirstLast.last - sentimentFirstLast.first) : 'N/A';

    let threat_velocity = 'N/A';
    if (threatFirstLast) {
      const delta = threatFirstLast.last - threatFirstLast.first;
      const abs = Math.abs(delta);
      if (abs < 0.5) threat_velocity = 'STABLE';
      else threat_velocity = delta > 0 ? 'RISING' : 'FALLING';
    }

    return NextResponse.json({
      metrics: series,
      stats: { market_shift, sentiment_delta, threat_velocity }
    });

  } catch (error) {
    logError('Failed to fetch competitor metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
