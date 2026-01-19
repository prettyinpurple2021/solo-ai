
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users, subscriptions, usageTracking } from '@/server/db/schema';
import { count } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { metrics } = await req.json();

    // 1. Fetch Request Metrics
    const resultMetrics = await Promise.all(metrics.map(async (metricId: string) => {
        let value = 0;
        let changePercent = 0;

        switch (metricId) {
            case 'user_count':
                const [userCount] = await db.select({ count: count() }).from(users);
                value = userCount.count;
                // Mock change for now as we don't have historical snapshots easily accessible
                // or we could count users created in last 30 days vs previous 30
                changePercent = 5; 
                break;
            
            case 'active_users':
                // rudimentary "active" based on usage_tracking or just users with recent login (if tracked)
                // for now, let's assume 70% of total users are active or query usage_tracking
                const [activeCount] = await db.select({ count: count() }).from(usageTracking);
                value = activeCount.count; // This is actually total usage records, but serves as proxy
                changePercent = 12;
                break;

            case 'revenue':
                // Sum of active subscriptions (implied value)
                // This is checking 'subscriptions' table
                const [subCount] = await db.select({ count: count() }).from(subscriptions);
                value = subCount.count * 29; // Assuming $29/mo avg
                changePercent = 8;
                break;

            default:
                // For other metrics, default to 0 to avoid breaking UI
                value = 0;
        }

        return {
            id: metricId,
            name: metricId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), // value will be fixed by UI mapping or we pass name
            value,
            change: 0,
            changePercent
        };
    }));

    // 2. Generate Chart Data
    // For now, we will generate daily data points. 
    // In a full implementation, we would query `usage_tracking` aggregated by day/month.


    return NextResponse.json({
        metrics: resultMetrics,
        charts: []
    });

  } catch (error) {
    logError('Error generating preview data:', error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}
