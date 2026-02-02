import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userChallenges } from '@/db/extra_schema';
import { logError } from '@/lib/logger';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(_req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const challengeId = params.id;

        if (!userId || !challengeId) {
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
        logError('Error joining challenge:', error);
        return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
    }
}
