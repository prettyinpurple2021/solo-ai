import { NextResponse } from 'next/server';
import { db } from '@/db';
import { feedback } from '@/shared/db/schema';
import { auth } from '@/lib/auth';
import { logError } from '@/lib/logger';
import { randomUUID } from 'crypto';

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
    const { reason } = await req.json();

    if (!reason) {
        return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    // Use feedback table to store the report
    await db.insert(feedback).values({
        user_id: session.user.id,
        type: 'post_report',
        title: `Report for Post ${postId}`,
        message: reason,
        priority: 'high',
        status: 'pending',
        browser_info: { postId } // Store postId in metadata
    });

    return NextResponse.json({ success: true, message: 'Post reported successfully' });
  } catch (error) {
    logError('Error reporting post:', error);
    return NextResponse.json({ error: 'Failed to report post' }, { status: 500 });
  }
}
