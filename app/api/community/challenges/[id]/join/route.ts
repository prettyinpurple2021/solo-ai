import { NextResponse } from 'next/server';
import { db } from '@/db';
import { challengeParticipants } from '@/shared/db/schema';
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
            .from(challengeParticipants)
            .where(and(
                eq(challengeParticipants.user_id, userId),
                eq(challengeParticipants.challenge_id, challengeId)
            ));

        if (existing.length > 0) {
            return NextResponse.json({ message: 'Already joined' });
        }

        const [entry] = await db.insert(challengeParticipants).values({
            user_id: userId,
            challenge_id: challengeId,
            status: 'joined',
            progress: 0
        }).returning();

        return NextResponse.json(entry);
    } catch (error) {
        logError('Error joining challenge:', error);
        return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
    }
}
