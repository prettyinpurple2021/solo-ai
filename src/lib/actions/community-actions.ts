'use server'

import { db } from "@/db";
import { communityPosts, communityComments, communityLikes, communityTopics, users } from "@/db/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { authenticateAction } from "@/lib/auth-server"; // Assuming this exists or similar
import { z } from "zod";
import { revalidatePath } from "next/cache";

// --- Schemas ---

const createPostSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(10),
  topicId: z.string().uuid().or(z.string()), // Accept UUID or topic slug/ID
});

const createCommentSchema = z.object({
  postId: z.string(),
  content: z.string().min(1),
  parentId: z.string().optional(),
});

// --- Actions ---

export async function getTopics() {
    return await db.query.communityTopics.findMany({
        orderBy: (fields, { asc }) => [asc(fields.order)],
        where: (fields, { eq }) => eq(fields.is_active, true)
    });
}

export async function getPosts(topicId?: string) {
    // Basic fetch with author relation
    // In a real app we might want pagination
    return await db.query.communityPosts.findMany({
        where: topicId ? eq(communityPosts.topic_id, topicId) : undefined,
        orderBy: [desc(communityPosts.is_pinned), desc(communityPosts.created_at)],
        with: {
            author: {
                columns: { id: true, name: true, image: true, level: true } // Assuming level exists on user
            },
            topic: true,
            _count: {
                select: {
                   comments: true,
                   likes: true 
                }
            } // Note: Drizzle _count needs helper, simplifying for now executing getting simple list
        },
        limit: 50
    });
}

// Optimized Get Feed with Like Status
export async function getCommunityFeed(topicId?: string) {
    const { user } = await authenticateAction(); // Optional user for "liked" status
    const userId = user?.id;

    const posts = await db.query.communityPosts.findMany({
        where: topicId ? eq(communityPosts.topic_id, topicId) : undefined,
        orderBy: [desc(communityPosts.is_pinned), desc(communityPosts.created_at)],
        limit: 50,
        with: {
            author: true,
            topic: true,
            // We can't easily do "is_liked_by_me" in one relational query without raw SQL or extra fetches
            // For MVP, we'll just return the posts and handle likes client-side or separate check
        }
    });

    // If user is logged in, fetch their likes for these posts
    let likedPostIds = new Set<string>();
    if (userId && posts.length > 0) {
        const likes = await db.query.communityLikes.findMany({
            where: and(
                eq(communityLikes.user_id, userId),
                eq(communityLikes.entity_type, 'post')
            )
        });
        likedPostIds = new Set(likes.map(l => l.entity_id));
    }

    return posts.map(post => ({
        ...post,
        isLiked: likedPostIds.has(post.id)
    }));
}

export async function createPost(data: z.infer<typeof createPostSchema>) {
    const { user, error } = await authenticateAction();
    if (error || !user) throw new Error("Unauthorized");

    const validated = createPostSchema.parse(data);

    // Verify topic exists
    const topic = await db.query.communityTopics.findFirst({
        where: eq(communityTopics.id, validated.topicId)
    });
    if (!topic) throw new Error("Invalid Topic");

    const [newPost] = await db.insert(communityPosts).values({
        user_id: user.id,
        topic_id: validated.topicId,
        title: validated.title,
        content: validated.content,
    }).returning();

    // Award XP
    try {
        const { WellnessEngine } = await import("@/lib/wellness"); // Dynamic import to avoid cycles if any
        const engine = new WellnessEngine(user.id);
        await engine.awardXP(10); // 10 XP for a post
    } catch (e) {
        console.error("Failed to award XP for post", e);
    }

    revalidatePath('/community');
    return { success: true, post: newPost };
}

export async function addComment(data: z.infer<typeof createCommentSchema>) {
    const { user, error } = await authenticateAction();
    if (error || !user) throw new Error("Unauthorized");

    const validated = createCommentSchema.parse(data);

    await db.insert(communityComments).values({
        user_id: user.id,
        post_id: validated.postId,
        parent_id: validated.parentId,
        content: validated.content
    });

    // Increment comment count on post
    await db.execute(sql`
        UPDATE community_posts 
        SET comment_count = comment_count + 1 
        WHERE id = ${validated.postId}
    `);

    // Award XP
    try {
        const { WellnessEngine } = await import("@/lib/wellness");
        const engine = new WellnessEngine(user.id);
        await engine.awardXP(5); // 5 XP for a comment
    } catch (e) {
        console.error("Failed to award XP for comment", e);
    }

    revalidatePath(`/community`); // Ideally stricter path
    return { success: true };
}

export async function toggleLike(entityType: 'post' | 'comment', entityId: string) {
    const { user, error } = await authenticateAction();
    if (error || !user) throw new Error("Unauthorized");

    const existing = await db.query.communityLikes.findFirst({
        where: and(
            eq(communityLikes.user_id, user.id),
            eq(communityLikes.entity_type, entityType),
            eq(communityLikes.entity_id, entityId)
        )
    });

    if (existing) {
        // Unlike
        await db.delete(communityLikes).where(and(
             eq(communityLikes.user_id, user.id),
             eq(communityLikes.entity_type, entityType),
             eq(communityLikes.entity_id, entityId)
        ));
        
        // Decrement count
         if (entityType === 'post') {
            await db.execute(sql`UPDATE community_posts SET like_count = like_count - 1 WHERE id = ${entityId}`);
        } else {
            await db.execute(sql`UPDATE community_comments SET like_count = like_count - 1 WHERE id = ${entityId}`);
        }

    } else {
        // Like
        await db.insert(communityLikes).values({
            user_id: user.id,
            entity_type: entityType,
            entity_id: entityId
        });

        // Increment count
        if (entityType === 'post') {
            await db.execute(sql`UPDATE community_posts SET like_count = like_count + 1 WHERE id = ${entityId}`);
        } else {
            await db.execute(sql`UPDATE community_comments SET like_count = like_count + 1 WHERE id = ${entityId}`);
        }
    }

    revalidatePath('/community');
    return { success: true, liked: !existing };
}
