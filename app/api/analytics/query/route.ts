
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { logError } from '@/lib/logger';
import { tasks, goals } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, sql, count, and, gte, desc } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { metric } = body;

    let result = 0;
    let historyData: { name: string; value: number }[] = [];

    // Define query filtering logic
    const applyHistoryQuery = async (table: any, filterCondition: any) => {
        // Get last 7 days of activity
        const data = await db.select({
            date: sql<string>`to_char(${table.created_at}, 'Tue')`, // Use Day Name strictly for the chart format requested (Mon, Tue...) or usually date
            rawDate: sql<string>`date_trunc('day', ${table.created_at})`,
            count: count()
        })
        .from(table)
        .where(and(
            filterCondition,
            gte(table.created_at, sql`now() - interval '7 days'`)
        ))
        .groupBy(sql`to_char(${table.created_at}, 'Tue')`, sql`date_trunc('day', ${table.created_at})`)
        .orderBy(desc(sql`date_trunc('day', ${table.created_at})`)); // Most recent first
        
        // Map to chart format. Note: The chart seems to expect weekday names. 
        // For production, usually full dates are better, but we stick to the implied "Mon, Tue" format.
        return data.reverse().map(item => ({
            name: item.date,
            value: Number(item.count)
        }));
    };
    
    if (metric === 'tasks_completed') {
       const userFilter = and(eq(tasks.user_id, session.user.id), eq(tasks.status, 'completed'));
       
       const res = await db.select({ count: count() })
        .from(tasks)
        .where(userFilter);
       result = res[0].count;
       
       historyData = await applyHistoryQuery(tasks, userFilter);

    } else if (metric === 'goals_created') {
        const userFilter = eq(goals.user_id, session.user.id);

        const res = await db.select({ count: count() })
        .from(goals)
        .where(userFilter);
        result = res[0].count;

        historyData = await applyHistoryQuery(goals, userFilter);

    } else if (metric === 'total_actions') {
        // Proxy for actions using tasks for now
        const userFilter = eq(tasks.user_id, session.user.id);

        const res = await db.select({ count: count() })
        .from(tasks)
        .where(userFilter);
        result = res[0].count;

        historyData = await applyHistoryQuery(tasks, userFilter);
    }
    
    // Fill in gaps if necessary (optional improvement: usually charts want zero-fill)
    if (historyData.length === 0) {
        // Fallback for empty state - show at least today
        const today = new Date();
        historyData = [{ name: today.toLocaleDateString('en-US', { weekday: 'short' }), value: 0 }];
    }

    return NextResponse.json({
      value: result,
      history: historyData
    });

  } catch (error) {
    logError('Error executing analytics query:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
