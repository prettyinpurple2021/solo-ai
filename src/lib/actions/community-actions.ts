'use server'

import { db } from "@/db/index";
import { communityPosts, communityComments, communityTopics, users, postLikes, commentLikes } from "@/shared/db/schema";
import { eq, desc, and, sql, count, inArray } from "drizzle-orm";
import { authenticateAction } from "@/lib/auth-server"; 
import { logError } from "@/lib/logger";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// --- Schemas ---

const createPostSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(10),
  topicId: z.string().uuid().or(z.string()), 
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
    // Basic fetch matching getCommunityFeed structure but simpler
    return getCommunityFeed(topicId);
}

// Optimized Get Feed with Like Status
export async function getCommunityFeed(topicId?: string) {
    const { user } = await authenticateAction(); 
    const userId = user?.id;

    // 1. Fetch posts
    const posts = await db.query.communityPosts.findMany({
        where: topicId ? eq(communityPosts.topic_id, topicId) : undefined,
        orderBy: [desc(communityPosts.is_pinned), desc(communityPosts.created_at)],
        limit: 50,
        with: {
            author: {
                columns: { id: true, name: true, image: true, level: true }
            },
            topic: true,
        }
    });

    if (posts.length === 0) return [];

    // 2. Fetch User Likes (if logged in)
    let likedPostIds = new Set<string>();
    if (userId) {
        const likes = await db.query.postLikes.findMany({
            where: and(
                eq(postLikes.user_id, userId),
                inArray(postLikes.post_id, posts.map(p => p.id))
            )
        });
        likedPostIds = new Set(likes.map(l => l.post_id));
    }

    // 3. Map & Return
    // Note: Counts are assumed to be reliable on the post object via triggers/app logic.
    // If not, we'd do a group-by count query here. For MVP, we trust the `like_count` / `comment_count` columns.
    
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
        const { WellnessEngine } = await import("@/lib/wellness");
        const engine = new WellnessEngine(user.id);
        await engine.awardXP(10); 
    } catch (e) {
        logError("Failed to award XP for post", { error: e });
    }

    revalidatePath('/community');
    return { success: true, post: newPost };
}

export async function addComment(data: z.infer<typeof createCommentSchema>) {
    const { user, error } = await authenticateAction();
    if (error || !user) throw new Error("Unauthorized");

    const validated = createCommentSchema.parse(data);

    // Transactional Insert & Update
    try {
        await db.transaction(async (tx) => {
            // 1. Verify Post Exists
            const post = await tx.query.communityPosts.findFirst({
                where: eq(communityPosts.id, validated.postId),
                columns: { id: true }
            });
            if (!post) throw new Error("Post not found");

            // 2. Insert Comment
            await tx.insert(communityComments).values({
                user_id: user.id,
                post_id: validated.postId,
                parent_id: validated.parentId || null,
                content: validated.content
            });

            // 3. Increment Counter & Update Timestamp
            await tx.execute(sql`
                UPDATE community_posts 
                SET comment_count = comment_count + 1,
                    updated_at = NOW()
                WHERE id = ${validated.postId}
            `);
        });

        // XP Reward (outside transaction to not block it, fast enough)
        try {
            const { WellnessEngine } = await import("@/lib/wellness");
            const engine = new WellnessEngine(user.id);
            await engine.awardXP(5);
        } catch (e) {
            logError("XP Award Failed", { error: e });
        }

        revalidatePath(`/community`);
        return { success: true };

    } catch (e) {
        logError("Comment failed", { error: e });
        return { success: false, error: "Failed to post comment" };
    }
}

export async function toggleLike(entityType: 'post' | 'comment', entityId: string) {
    const { user, error } = await authenticateAction();
    if (error || !user) throw new Error("Unauthorized");

    try {
        const isLiked = await db.transaction(async (tx) => {
            if (entityType === 'post') {
                // Check existence
                const existing = await tx.query.postLikes.findFirst({
                    where: and(
                         eq(postLikes.user_id, user.id),
                         eq(postLikes.post_id, entityId)
                    )
                });

                if (existing) {
                    // Unlike
                    await tx.delete(postLikes).where(and(
                        eq(postLikes.user_id, user.id),
                        eq(postLikes.post_id, entityId)
                    ));
                    await tx.execute(sql`
                        UPDATE community_posts 
                        SET like_count = GREATEST(0, like_count - 1)
                        WHERE id = ${entityId}
                    `);
                    return false;
                } else {
                    // Like
                    await tx.insert(postLikes).values({
                        user_id: user.id,
                        post_id: entityId
                    });
                    await tx.execute(sql`
                        UPDATE community_posts 
                        SET like_count = like_count + 1 
                        WHERE id = ${entityId}
                    `);
                    return true;
                }
            } else {
                 // Comment Logic (similar)
                 const existing = await tx.query.commentLikes.findFirst({
                    where: and(
                         eq(commentLikes.user_id, user.id),
                         eq(commentLikes.comment_id, entityId)
                    )
                });

                if (existing) {
                    await tx.delete(commentLikes).where(and(
                        eq(commentLikes.user_id, user.id),
                        eq(commentLikes.comment_id, entityId)
                    ));
                    await tx.execute(sql`
                        UPDATE community_comments 
                        SET like_count = GREATEST(0, like_count - 1),
                            updated_at = NOW()
                        WHERE id = ${entityId}
                    `);
                    return false;
                } else {
                    await tx.insert(commentLikes).values({
                        user_id: user.id,
                        comment_id: entityId
                    });
                    await tx.execute(sql`
                        UPDATE community_comments 
                        SET like_count = like_count + 1,
                            updated_at = NOW()
                        WHERE id = ${entityId}
                    `);
                    return true;
                }
            }
        });

        revalidatePath('/community');
        return { success: true, liked: isLiked };

    } catch (e) {
        logError("Toggle Like Failed", { error: e });
        return { success: false, error: "Action failed" };
    }
}
