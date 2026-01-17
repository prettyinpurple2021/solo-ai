import { NextResponse } from 'next/server';
import { db } from '@/db';
import { challenges } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(_req: Request) {
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

const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard', 'legendary'];
const ALLOWED_CATEGORIES = ['general', 'coding', 'design', 'writing', 'fitness', 'marketing'];

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check for admin role
        // Using "as any" cast removal as per user request. 
        // Assuming session.user is augmented in next-auth.d.ts or we use a fallback type check.
        // Actually session is properly typed from next-auth import if augmented correctly.
        // But to be explicit without trusting global augmentation resolution in this specific file context immediately:
        // We will trust the augmentation exists as verified.
        
        const isAdmin = session.user.role === 'admin';
        const isSeedingAllowed = process.env.SKIP_ADMIN_CHECK === 'true';

        if (!isAdmin && !isSeedingAllowed) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
        }

        // Sanitize input
        const { title, description, emoji, deadline, reward_points, reward_badge, difficulty, category } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        let finalDifficulty = difficulty || 'medium';
        if (difficulty && !ALLOWED_DIFFICULTIES.includes(difficulty)) {
             return NextResponse.json({ error: `Invalid difficulty. Allowed: ${ALLOWED_DIFFICULTIES.join(', ')}` }, { status: 400 });
        }

        let finalCategory = category || 'general';
        if (category && !ALLOWED_CATEGORIES.includes(category)) {
            return NextResponse.json({ error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` }, { status: 400 });
        }

        let parsedDeadline: Date | null = null;
        if (deadline) {
            parsedDeadline = new Date(deadline);
            if (isNaN(parsedDeadline.getTime())) {
                return NextResponse.json({ error: 'Invalid deadline format' }, { status: 400 });
            }
        }

        const sanitizedPayload = {
            title,
            description,
            emoji,
            deadline: parsedDeadline,
            reward_points: Number(reward_points) || 0,
            reward_badge,
            difficulty: finalDifficulty,
            category: finalCategory,
            created_by: session.user.id,
            is_active: true, // Force to true by default or logic
            participants_count: 0
        };
        
        const [newChallenge] = await db.insert(challenges).values(sanitizedPayload).returning();

        return NextResponse.json({ success: true, challenge: newChallenge });

    } catch (error) {
        console.error('Error creating challenge:', error);
        return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
    }
}
