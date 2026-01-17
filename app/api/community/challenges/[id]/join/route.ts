
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { userChallenges } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = parseInt(session.user.id);
        const challengeId = parseInt(params.id);

        if (isNaN(userId) || isNaN(challengeId)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        // Check if already joined
        const existing = await db.select()
            .from(userChallenges)
            .where(and(
                eq(userChallenges.userId, userId),
                eq(userChallenges.challengeId, challengeId)
            ));

        if (existing.length > 0) {
            return NextResponse.json({ message: 'Already joined' });
        }

        const [entry] = await db.insert(userChallenges).values({
            userId: userId,
            challengeId,
            status: 'joined',
            progress: 0
        }).returning();

        return NextResponse.json(entry);
    } catch (error) {
        console.error('Error joining challenge:', error);
        return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
    }
}
