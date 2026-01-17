import { NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ postId: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = params;
    const userId = session.user.id;

    // Verify ownership
    const post = await db.query.posts.findFirst({
        where: and(eq(posts.id, postId), eq(posts.author_id, userId))
    });

    if (!post) {
        return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
    }

    await db.delete(posts).where(eq(posts.id, postId));

    return NextResponse.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

export async function PATCH(
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
    const userId = session.user.id;
    const { content } = await req.json();

    if (!content) {
        return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Verify ownership
    const post = await db.query.posts.findFirst({
        where: and(eq(posts.id, postId), eq(posts.author_id, userId))
    });

    if (!post) {
        return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
    }

    const [updatedPost] = await db.update(posts)
        .set({ content, updated_at: new Date() })
        .where(eq(posts.id, postId))
        .returning();

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
