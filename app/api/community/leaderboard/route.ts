
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, analyticsEvents } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    const leaderboard = await db.select({
      id: users.id,
      name: users.name,
      image: users.image,
      level: users.level,
      role: users.role,
      xp: users.xp,
    })
    .from(users)
    .orderBy(desc(users.xp))
    .limit(10);

    const formattedLeaderboard = await Promise.all(leaderboard.map(async (user, index) => ({
      id: user.id.toString(),
      name: user.name || 'Unknown Agent',
      avatar: user.image || '/default-user.svg',
      level: user.level || 1,
      title: user.role === 'admin' ? 'Prime Overseer' : 'Elite Operative',
      points: user.xp || 0,
      streak: await calculateUserStreak(user.id),
      rank: index + 1
    })));

    return NextResponse.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    logError('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

async function calculateUserStreak(userId: string): Promise<number> {
  try {
    // Get distinct dates of user activity from analytics events
    const activityDates = await db.execute(sql`
      SELECT DISTINCT DATE(timestamp) as activity_date
      FROM ${analyticsEvents}
      WHERE user_id = ${userId}
      ORDER BY activity_date DESC
      LIMIT 30
    `);

    if (!activityDates.rows.length) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if there's activity today or yesterday to keep streak alive
    const lastActivity = new Date(activityDates.rows[0].activity_date as string);
    lastActivity.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return 0; // Streak broken if no activity yesterday or today

    streak = 1;
    for (let i = 0; i < activityDates.rows.length - 1; i++) {
      const current = new Date(activityDates.rows[i].activity_date as string);
      const next = new Date(activityDates.rows[i + 1].activity_date as string);
      
      current.setHours(0, 0, 0, 0);
      next.setHours(0, 0, 0, 0);

      const diff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error(`Error calculating streak for user ${userId}:`, error);
    return 0;
  }
}
