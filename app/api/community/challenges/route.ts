import { NextResponse } from 'next/server';
import { db } from '@/db';
import { challenges, challengeParticipants, users } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    // Fetch active challenges
    const activeChallenges = await db.query.challenges.findMany({
      where: eq(challenges.is_active, true),
      orderBy: [desc(challenges.created_at)],
      with: {
        participants: true,
      }
    });

    const formattedChallenges = activeChallenges.map(challenge => {
      // Check if current user is participating
      const userParticipant = currentUserId 
        ? challenge.participants.find(p => p.user_id === currentUserId)
        : null;

      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        emoji: challenge.emoji,
        participants: challenge.participants_count || 0,
        deadline: challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : 'No deadline',
        reward: {
          points: challenge.reward_points || 0,
          badge: challenge.reward_badge || 'None',
        },
        difficulty: challenge.difficulty,
        category: challenge.category,
        userStatus: userParticipant ? userParticipant.status : 'not_joined',
      };
    });

    return NextResponse.json({ challenges: formattedChallenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Check for admin role ideally, for now allowing authenticated users for demo purposes or stick to manual seeding?
        // Let's assume only admins or system can create challenges, but for now we might need a way to seed them.
        if (!session?.user?.id) { // Add role check here
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        
        const [newChallenge] = await db.insert(challenges).values({
            ...body,
            created_by: session.user.id
        }).returning();

        return NextResponse.json({ success: true, challenge: newChallenge });

    } catch (error) {
        console.error('Error creating challenge:', error);
        return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
    }
}
