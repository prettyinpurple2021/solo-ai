import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users, usageTracking } from '@/shared/db/schema';
import { sql, eq, gte, and, count, lt } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { metrics } = await req.json();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Fetch Real Metrics
    const resultMetrics = await Promise.all(metrics.map(async (metricId: string) => {
        let value = 0;
        let changePercent = 0;

        switch (metricId) {
            case 'user_count': {
                const [currentCount] = await db.select({ value: count() }).from(users);
                const [previousCount] = await db.select({ value: count() })
                  .from(users)
                  .where(lt(users.created_at, thirtyDaysAgo));
                
                value = currentCount.value;
                const prev = previousCount.value || 1;
                changePercent = Math.round(((value - prev) / prev) * 100);
                break;
            }
            
            case 'active_users': {
                // Active = users with usage in last 7 days
                const [activeCount] = await db.select({ value: count(sql`DISTINCT ${usageTracking.userId}`) })
                  .from(usageTracking)
                  .where(gte(usageTracking.createdAt, sevenDaysAgo));
                
                const [prevActiveCount] = await db.select({ value: count(sql`DISTINCT ${usageTracking.userId}`) })
                  .from(usageTracking)
                  .where(and(
                    gte(usageTracking.createdAt, thirtyDaysAgo),
                    lt(usageTracking.createdAt, sevenDaysAgo)
                  ));

                value = activeCount.value;
                const prev = prevActiveCount.value || 1;
                changePercent = Math.round(((value - prev) / prev) * 100);
                break;
            }

            case 'revenue': {
                // Approximate revenue from tiers
                const acceleratorUsers = await db.select({ value: count() })
                  .from(users)
                  .where(and(eq(users.subscription_tier, 'accelerator'), eq(users.subscription_status, 'active')));
                
                const dominatorUsers = await db.select({ value: count() })
                  .from(users)
                  .where(and(eq(users.subscription_tier, 'dominator'), eq(users.subscription_status, 'active')));
                
                value = (acceleratorUsers[0].value * 29) + (dominatorUsers[0].value * 99);
                
                const prevAccelerator = await db.select({ value: count() })
                  .from(users)
                  .where(and(
                    eq(users.subscription_tier, 'accelerator'), 
                    eq(users.subscription_status, 'active'),
                    lt(users.created_at, thirtyDaysAgo)
                  ));
                
                const prevDominator = await db.select({ value: count() })
                  .from(users)
                  .where(and(
                    eq(users.subscription_tier, 'dominator'), 
                    eq(users.subscription_status, 'active'),
                    lt(users.created_at, thirtyDaysAgo)
                  ));

                const prev = (prevAccelerator[0].value * 29) + (prevDominator[0].value * 99) || 1;
                changePercent = Math.round(((value - prev) / prev) * 100);
                break;
            }

            default:
                value = 0;
        }

        return {
            id: metricId,
            name: metricId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value,
            change: 0,
            changePercent
        };
    }));

    // 2. Generate Real Chart Data (Daily User Growth)
    const chartData = await db.select({
      date: sql`DATE(${users.created_at})`.as('date'),
      count: count()
    })
    .from(users)
    .where(gte(users.created_at, thirtyDaysAgo))
    .groupBy(sql`DATE(${users.created_at})`)
    .orderBy(sql`DATE(${users.created_at})`);


    return NextResponse.json({
        metrics: resultMetrics,
        charts: chartData.map(d => ({
          name: d.date as string,
          value: d.count
        }))
    });

  } catch (error) {
    logError('Error generating preview data:', error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}
