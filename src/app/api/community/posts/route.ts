import { NextResponse } from 'next/server';
import { db } from '@/db';
import { communityPosts } from '@/shared/db/schema';
import { auth } from '@/lib/auth';
import { desc } from 'drizzle-orm';
import { logError } from '@/lib/logger';

export async function GET(_req: Request) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    // Fetch posts with author details
    const allPosts = await db.query.communityPosts.findMany({
      orderBy: (posts, { desc }) => [desc(posts.created_at)],
      with: {
        author: true, // Relation name is 'author' in communityPostsRelations
        postLikes: true, // Relation name is 'postLikes'
      }
    });

    const formattedPosts = allPosts.map(post => {
      const isLiked = currentUserId ? post.postLikes.some(l => l.user_id === currentUserId) : false;
      
      // Access author via the relation 'author'
      const author = post.author;

      return {
        id: post.id,
        author: {
          name: author?.full_name || author?.name || "Unknown Agent",
          avatar: author?.image,
          level: author?.level || 1,
          title: author?.role === 'admin' ? 'System Administrator' : 'Operative',
          verified: author?.is_verified || false,
        },
        content: post.content,
        image: post.image,
        timestamp: post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Unknown',
        likes: post.like_count || 0,
        comments: post.comment_count || 0,
        shares: post.shares_count || 0,
        achievement: (post.metadata as any)?.achievement_context,
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

    const { content, image, tags, achievement_context } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Insert into communityPosts
    // Note: topic_id is required by schema but not provided in request?
    // We strictly need a topic_id. For now, we might default to a 'General' topic or fail if not provided.
    // However, the original code didn't provide topic_id. 
    // IF the schema enforces topic_id NOT NULL (it does), we must provide it.
    // I will fetch the 'General' topic or create it if missing.
    
    // Quick fix: allow topic_id to be nullable in schema? No, that breaks integrity.
    // I will try to find a default topic.
    const defaultTopic = await db.query.communityTopics.findFirst();
    const topicId = defaultTopic?.id;

    if (!topicId) {
        // Fallback or error? 
        // We'll throw for now as system should have topics.
        return NextResponse.json({ error: 'No community topics found' }, { status: 500 });
    }

    const [newPost] = await db.insert(communityPosts).values({
      user_id: session.user.id,
      topic_id: topicId,
      title: 'Untitled', // Schema requires title
      content,
      image,
      tags: tags || [],
      metadata: achievement_context ? { achievement_context } : {},
    }).returning();

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    logError('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
