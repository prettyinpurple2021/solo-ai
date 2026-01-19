import { NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schema'; // 'users' and 'postReactions' removed, 'comments' added as per instruction
import { auth } from '@/lib/auth';
import { desc } from 'drizzle-orm';
import { logError } from '@/lib/logger';

export async function GET(_req: Request) { // req prefixed with underscore
  try {
    const session = await auth(); // Or however auth is handled
    const currentUserId = session?.user?.id;

    // Fetch posts with author details
    // Note: Drizzle's query builder or relational query is cleaner
    const allPosts = await db.query.posts.findMany({
      orderBy: [desc(posts.created_at)],
      with: {
        author: true,
        reactions: true, 
      }
    });

    const formattedPosts = allPosts.map(post => {
      // Check for 'like' specifically or just any reaction. 
      // For the UI's simple heart, we check for 'like'.
      const isLiked = currentUserId ? post.reactions.some(r => r.user_id === currentUserId && r.type === 'like') : false;
      return {
        id: post.id,
        author: {
          name: post.author.full_name || post.author.name || "Unknown Agent",
          avatar: post.author.image,
          level: post.author.level || 1,
          title: post.author.role === 'admin' ? 'System Administrator' : 'Operative',
          verified: post.author.is_verified || false,
        },
        content: post.content,
        image: post.image,
        timestamp: post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Unknown',
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        shares: post.shares_count || 0,
        achievement: post.achievement_context as any,
        isLiked,
        tags: post.tags as string[] || [],
      };
    });

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    logError('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, image, tags } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const [newPost] = await db.insert(posts).values({
      author_id: session.user.id,
      content,
      image,
      tags: tags || [],
    }).returning();

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    logError('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
