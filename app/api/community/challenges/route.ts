
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { challenges, userChallenges } from '@/server/db/schema';
import { desc, eq } from 'drizzle-orm';

import { auth } from '@/lib/auth';

export async function GET(_req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ? parseInt(session.user.id) : undefined;

    const allChallenges = await db.select().from(challenges).orderBy(desc(challenges.createdAt));

    // If userId is provided, fetch their status for each challenge
    let userStatuses: Record<number, string> = {};
    if (userId) {
        const statuses = await db.select({
            challengeId: userChallenges.challengeId,
            status: userChallenges.status
        })
        .from(userChallenges)
        .where(eq(userChallenges.userId, userId));
        
        statuses.forEach(s => {
            userStatuses[s.challengeId] = s.status;
        });
    }

    const formattedChallenges = allChallenges.map(c => ({
        id: c.id.toString(),
        title: c.title,
        description: c.description,
        emoji: "🚀", // Default, could be a column
        participants: Math.floor(Math.random() * 50) + 1, // Mock count for now
        deadline: c.deadline ? new Date(c.deadline).toLocaleDateString() : 'Indefinite',
        reward: {
            points: c.rewardPoints,
            badge: c.rewardBadge
        },
        difficulty: c.difficulty.toLowerCase(),
        category: c.category,
        userStatus: userId ? (userStatuses[c.id] || 'not_joined') : undefined
    }));

    return NextResponse.json({ challenges: formattedChallenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, category, difficulty, rewardPoints, deadline } = body;

        if (!title || !description || !category || !difficulty) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const [newChallenge] = await db.insert(challenges).values({
            title,
            description,
            category,
            difficulty,
            rewardPoints: rewardPoints || 100,
            deadline: deadline ? new Date(deadline) : null,
        }).returning();

        return NextResponse.json(newChallenge);
    } catch (error) {
        console.error('Error creating challenge:', error);
        return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
    }
}
