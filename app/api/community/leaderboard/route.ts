import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth(); // Optional: limit visibility?

    // Fetch top users by XP/Points
    // Limit to top 10 or 20
    const topUsers = await db.query.users.findMany({
      orderBy: [desc(users.xp)], // Assuming 'xp' exists on users table from previous schema check
      limit: 10,
    });

    const formattedLeaderboard = topUsers.map((user, index) => ({
      name: user.full_name || user.username || user.name || "Unknown Agent", // Handle various name fields
      avatar: user.image || "/default-user.svg",
      level: user.level || 1,
      points: user.xp || 0,
      title: user.role === 'admin' ? 'System Administrator' : 'Operative',
      streak: 0, // Placeholder, would need a 'streaks' table or column
    }));

    return NextResponse.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
