'use server'

import { db } from '@/db';
import { 
  communityPosts, 
  communityComments, 
  postLikes, 
  challengeParticipants,
  challenges,
  communityTopics
} from '@/shared/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { authenticateAction } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logError } from '@/lib/logger';
import { CommunityService } from '@/lib/services/community-service';

const postSchema = z.object({
  content: z.string().min(1),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  title: z.string().optional(),
  topicId: z.string().optional(),
});

export async function createPost(data: z.infer<typeof postSchema>) {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  const validated = postSchema.parse(data);

  // Use provided topicId or find/create a default "general" topic
  let topic_id = validated.topicId;
  
  if (!topic_id) {
    let [topic] = await db.select().from(communityTopics).where(eq(communityTopics.slug, 'general')).limit(1);
    if (!topic) {
      [topic] = await db.insert(communityTopics).values({
        name: 'General',
        slug: 'general',
        description: 'General discussion'
      }).returning();
    }
    topic_id = topic.id;
  }

  const [newPost] = await db.insert(communityPosts).values({
    user_id: user.id,
    topic_id: topic_id,
    title: validated.title || 'Untitled Transmission',
    content: validated.content,
    image: validated.image,
    tags: validated.tags,
    created_at: new Date(),
    updated_at: new Date()
  }).returning();

  revalidatePath('/dashboard/nexus');
  revalidatePath('/community');
  return { success: true, post: newPost };
}

export async function reactToPost(postId: string, type: string = 'like') {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  const existing = await db.select().from(postLikes).where(
    and(eq(postLikes.post_id, postId), eq(postLikes.user_id, user.id))
  ).limit(1);

  if (existing.length > 0) {
    // Remove like
    await db.delete(postLikes).where(
      and(eq(postLikes.post_id, postId), eq(postLikes.user_id, user.id))
    );
    await db.update(communityPosts)
      .set({ like_count: sql`${communityPosts.like_count} - 1` })
      .where(eq(communityPosts.id, postId));
  } else {
    // Add like
    await db.insert(postLikes).values({
      post_id: postId,
      user_id: user.id
    });
    await db.update(communityPosts)
      .set({ like_count: sql`${communityPosts.like_count} + 1` })
      .where(eq(communityPosts.id, postId));
  }

  revalidatePath('/dashboard/nexus');
  revalidatePath('/community');
  return { success: true };
}

export async function joinChallenge(challengeId: string) {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  await db.insert(challengeParticipants).values({
    challenge_id: challengeId,
    user_id: user.id,
    status: 'joined',
    joined_at: new Date()
  }).onConflictDoNothing();

  await db.update(challenges)
    .set({ participants_count: sql`${challenges.participants_count} + 1` })
    .where(eq(challenges.id, challengeId));

  revalidatePath('/dashboard/nexus');
  revalidatePath('/community');
  return { success: true };
}

export async function deletePost(postId: string) {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  await db.delete(communityPosts).where(
    and(eq(communityPosts.id, postId), eq(communityPosts.user_id, user.id))
  );

  revalidatePath('/dashboard/nexus');
  revalidatePath('/community');
  return { success: true };
}

export async function addComment(postIdOrData: any, contentParam?: string) {
  try {
    const { user } = await authenticateAction();
    if (!user) throw new Error('Unauthorized');

    let postId: string;
    let content: string;

    if (typeof postIdOrData === 'object') {
        postId = postIdOrData.postId;
        content = postIdOrData.content;
    } else {
        postId = postIdOrData;
        content = contentParam!;
    }

    if (!content?.trim()) throw new Error('Content is required');

    // Insert comment
    await db.insert(communityComments).values({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
    });

    // Increment comment count on post
    await db.update(communityPosts)
      .set({ 
        comment_count: sql`${communityPosts.comment_count} + 1`,
        updated_at: new Date()
      })
      .where(eq(communityPosts.id, postId));

    revalidatePath('/dashboard/nexus');
    revalidatePath('/community');
    return { success: true };
  } catch (error: any) {
    logError('Failed to add comment', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add comment' };
  }
}

export async function toggleLike(targetTypeOrId: string, targetIdParam?: string) {
    // Handle both ('post', id) and (id)
    const id = targetIdParam || targetTypeOrId;
    return reactToPost(id, 'like');
}

export async function fetchComments(postId: string) {
    const { user } = await authenticateAction();
    return CommunityService.getComments(postId, user?.id);
}

export async function getCommunityFeed(topicId?: string | null) {
    const { user } = await authenticateAction();
    // In a real implementation, CommunityService.getPosts would handle filtering by topicId
    // For now, we'll just return all posts as before, but with the correct signature.
    return CommunityService.getPosts(user?.id);
}

export async function getTopics() {
    return db.select().from(communityTopics);
}
