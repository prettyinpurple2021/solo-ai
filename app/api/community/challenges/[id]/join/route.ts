import { NextResponse } from 'next/server';
import { db } from '@/db';
import { challengeParticipants, challenges } from '@/db/schema';
import { auth } from '@/lib/auth'; // Adjust import based on actual auth helper location
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const challengeId = params.id;
    const userId = session.user.id;

    // Check if already joined
    const existing = await db.query.challengeParticipants.findFirst({
        where: and(
            eq(challengeParticipants.challenge_id, challengeId),
            eq(challengeParticipants.user_id, userId)
        )
    });

    if (existing) {
        return NextResponse.json({ error: 'Already participating in this challenge' }, { status: 400 });
    }

    // Join challenge
    await db.insert(challengeParticipants).values({
      challenge_id: challengeId,
      user_id: userId,
      status: 'joined',
      progress: 0,
    });

    // Update participant count in challenges table (optional, but good for performance)
    // We can run a raw sql or fetch-update but here let's stick to simple logic or trigger.
    // Ideally we should increment the counter.
    // For simplicity now, let's just insert. The GET route counts via the relation or the stored count.
    // Let's assume we rely on the realtime count or update it here.
    const currentChallenge = await db.query.challenges.findFirst({ where: eq(challenges.id, challengeId) });
    if (currentChallenge) {
        await db.update(challenges)
            .set({ participants_count: (currentChallenge.participants_count || 0) + 1 })
            .where(eq(challenges.id, challengeId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error joining challenge:', error);
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 });
  }
}
