
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { postComments, posts } from '@/db/schema';
import { auth } from '@/lib/auth';
import { desc, eq, sql } from 'drizzle-orm';
import { logError } from '@/lib/logger';

export async function GET(
  _req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  try {
    const { postId } = params;

    const comments = await db.query.postComments.findMany({
      where: eq(postComments.post_id, postId),
      orderBy: [desc(postComments.created_at)],
      with: {
        author: true
      }
    });

    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      author: {
        name: comment.author.full_name || comment.author.name || "Unknown Agent",
        avatar: comment.author.image,
        level: comment.author.level || 1,
        title: comment.author.role === 'admin' ? 'System Administrator' : 'Operative',
      }
    }));

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    logError('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const newComment = await db.transaction(async (tx) => {
      const [comment] = await tx.insert(postComments).values({
        post_id: postId,
        author_id: session.user.id,
        content,
      }).returning();

      // Increment comment count
      await tx.update(posts)
        .set({ comments_count: sql`${posts.comments_count} + 1` })
        .where(eq(posts.id, postId));
      
      return comment;
    });

    return NextResponse.json({
        id: newComment.id,
        content: newComment.content,
        createdAt: newComment.created_at,
        // We return minimal author info here as the client likely has current user info, 
        // but robustly we might want to fetch it or let client handle optimistically.
        // For now, simpler response.
    });
  } catch (error) {
    logError('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
