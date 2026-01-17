import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(_req: Request) {
  try {
    const session = await auth(); 
    
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch top users by XP/Points
    // Limit to top 10 or 20
    const topUsers = await db.query.users.findMany({
      columns: {
        full_name: true,
        username: true,
        name: true,
        image: true,
        level: true,
        xp: true,
        role: true,
      },
      orderBy: [desc(users.xp)],
      limit: 10,
    });
    const formattedLeaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      name: user.full_name || user.username || user.name || "Unknown Agent", // Handle various name fields
      avatar: user.image || "/default-user.svg",
      level: user.level || 1,
      points: user.xp || 0,
      title: user.role === 'admin' ? 'System Administrator' : 'Operative',
      streak: 0, // Placeholder, would need a 'streaks' table or column
    }));

    return NextResponse.json({ leaderboard: formattedLeaderboard }, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
