
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    // In a real app, 'points' or 'experience' would be a column on the user
    // For now, we'll use 'level' and 'id' as proxies for sorting
    const leaderboard = await db.select({
      id: users.id,
      name: users.name,
      image: users.image,
      level: users.level,
      role: users.role,
    })
    .from(users)
    .orderBy(desc(users.level))
    .limit(10);

    const formattedLeaderboard = leaderboard.map((user, index) => ({
      id: user.id.toString(),
      name: user.name || 'Unknown Agent',
      avatar: user.image || '/default-user.svg',
      level: user.level || 1,
      title: user.role === 'admin' ? 'Prime Overseer' : 'Elite Operative',
      points: (user.level || 1) * 1000 + Math.floor(Math.random() * 500), // Mock calculation for now
      streak: Math.floor(Math.random() * 30), // Mock streak
      rank: index + 1
    }));

    return NextResponse.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    logError('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
