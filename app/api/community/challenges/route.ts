import { NextResponse } from 'next/server';
import { db } from '@/db';
import { challenges, userChallenges } from '@/db/extra_schema';
import { desc, eq, sql } from 'drizzle-orm';

import { auth } from '@/lib/auth';
import { logError } from '@/lib/logger';

export async function GET(_req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // Fetch challenges with participant count
    const challengesWithCounts = await db
        .select({
            id: challenges.id,
            title: challenges.title,
            description: challenges.description,
            category: challenges.category,
            difficulty: challenges.difficulty,
            rewardPoints: challenges.rewardPoints,
            rewardBadge: challenges.rewardBadge,
            deadline: challenges.deadline,
            createdAt: challenges.createdAt,
            participantCount: sql<number>`count(${userChallenges.userId})`.mapWith(Number)
        })
        .from(challenges)
        .leftJoin(userChallenges, eq(challenges.id, userChallenges.challengeId))
        .groupBy(challenges.id)
        .orderBy(desc(challenges.createdAt));

    // If userId is provided, fetch their status for each challenge
    let userStatuses: Record<string, string> = {};
    if (userId) {
        const statuses = await db.select({
            challengeId: userChallenges.challengeId,
            status: userChallenges.status
        })
        .from(userChallenges)
        .where(eq(userChallenges.userId, userId));
        
        statuses.forEach(s => {
            userStatuses[s.challengeId] = s.status || 'joined';
        });
    }

    const formattedChallenges = challengesWithCounts.map(c => ({
        id: c.id.toString(),
        title: c.title,
        description: c.description,
        emoji: "🚀", // Default, could be a column
        participants: c.participantCount,
        deadline: c.deadline ? new Date(c.deadline).toLocaleDateString() : 'Indefinite',
        reward: {
            points: c.rewardPoints,
            badge: c.rewardBadge
        },
        difficulty: (c.difficulty || 'Easy').toLowerCase(),
        category: c.category,
        userStatus: userId ? (userStatuses[c.id] || 'not_joined') : undefined
    }));

    return NextResponse.json({ challenges: formattedChallenges });
  } catch (error) {
    logError('Error fetching challenges:', error);
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
        logError('Error creating challenge:', error);
        return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
    }
}
