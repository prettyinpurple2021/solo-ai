import { NextResponse } from 'next/server';
import { db } from '@/db';
import { challengeParticipants, challenges } from '@/db/schema';
import { auth } from '@/lib/auth'; // Adjust import based on actual auth helper location
import { eq, sql } from 'drizzle-orm';

class ChallengeNotFoundError extends Error {
    constructor() {
        super('Challenge not found');
        this.name = 'ChallengeNotFoundError';
    }
}

function isPgError(x: unknown): x is { code: string } {
    return typeof x === 'object' && x !== null && 'code' in x && typeof (x as any).code === 'string';
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: challengeId } = await params;
    const userId = session.user.id;

    await db.transaction(async (tx) => {
        // Verify challenge exists - Minimal select
        const challenge = await tx.select({ id: challenges.id }).from(challenges).where(eq(challenges.id, challengeId)).limit(1);
        
        if (challenge.length === 0) {
            throw new ChallengeNotFoundError();
        }

        await tx.insert(challengeParticipants).values({
            challenge_id: challengeId,
            user_id: userId,
            status: 'joined',
            progress: 0,
        });

        await tx.update(challenges)
            .set({ participants_count: sql`COALESCE(${challenges.participants_count}, 0) + 1` })
            .where(eq(challenges.id, challengeId));
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof ChallengeNotFoundError) {
        return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }
    
    // Postgres unique constraint violation code
    if (isPgError(error) && error.code === '23505') {
        return NextResponse.json({ error: 'Already participating in this challenge' }, { status: 400 });
    }
    
    console.error('Error joining challenge:', error);
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
  }
}
