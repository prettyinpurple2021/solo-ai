import { NextResponse } from 'next/server';
import { db } from '@/db';
import { follows } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const followerId = session.user.id;
    const followingId = params.userId;

    if (followerId === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const existingFollow = await db.query.follows.findFirst({
        where: and(eq(follows.follower_id, followerId), eq(follows.following_id, followingId))
    });

    if (existingFollow) {
        return NextResponse.json({ message: 'Already following' }, { status: 400 });
    }

    await db.insert(follows).values({
      follower_id: followerId,
      following_id: followingId,
    });

    return NextResponse.json({ followed: true });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const followerId = session.user.id;
    const followingId = params.userId;

    await db.delete(follows)
      .where(and(eq(follows.follower_id, followerId), eq(follows.following_id, followingId)));

    return NextResponse.json({ followed: false });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
  }
}
