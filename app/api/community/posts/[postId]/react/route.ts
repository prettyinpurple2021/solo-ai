import { NextResponse } from 'next/server';
import { db } from '@/db';
import { posts, postReactions } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const { type } = await req.json().catch(() => ({ type: 'like' })); // Default to like
    const reactionType = type || 'like';
    const userId = session.user.id;

    // Check if reaction exists
    const existingReaction = await db.query.postReactions.findFirst({
      where: and(eq(postReactions.post_id, postId), eq(postReactions.user_id, userId))
    });

    if (existingReaction) {
      if (existingReaction.type === reactionType) {
        // Toggle off if same type
        await db.delete(postReactions)
          .where(and(eq(postReactions.post_id, postId), eq(postReactions.user_id, userId)));
        
        // Only decrement likes count if it was a like
        if (reactionType === 'like') {
            await db.update(posts)
            .set({ likes_count: sql`${posts.likes_count} - 1` })
            .where(eq(posts.id, postId));
        }
        
        return NextResponse.json({ reacted: false, message: 'Reaction removed' });
      } else {
        // Change type
        await db.update(postReactions)
          .set({ type: reactionType })
          .where(and(eq(postReactions.post_id, postId), eq(postReactions.user_id, userId)));
        
        // Handle counts if switching between like and non-like
        // This is complex for a simple count column. For now let's just update count if switching TO like.
        // Ideally we shouldn't rely on 'likes_count' column if we have complex reactions, 
        // but for backward compatibility/simplicity:
        if (reactionType === 'like' && existingReaction.type !== 'like') {
            await db.update(posts).set({ likes_count: sql`${posts.likes_count} + 1` }).where(eq(posts.id, postId));
        } else if (reactionType !== 'like' && existingReaction.type === 'like') {
            await db.update(posts).set({ likes_count: sql`${posts.likes_count} - 1` }).where(eq(posts.id, postId));
        }

        return NextResponse.json({ reacted: true, type: reactionType, message: 'Reaction updated' });
      }
    } else {
      // New reaction
      await db.insert(postReactions).values({
        post_id: postId,
        user_id: userId,
        type: reactionType,
      });

      if (reactionType === 'like') {
        await db.update(posts)
            .set({ likes_count: sql`${posts.likes_count} + 1` })
            .where(eq(posts.id, postId));
      }

      return NextResponse.json({ reacted: true, type: reactionType });
    }

  } catch (error) {
    console.error('Error toggling reaction:', error);
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 });
  }
}
