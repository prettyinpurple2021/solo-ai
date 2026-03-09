import { db } from '@/db';
import { 
  communityPosts, 
  communityComments, 
  postLikes, 
  users, 
  challenges, 
  challengeParticipants,
  communityTopics
} from '@/shared/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { PostProps, CommentProps, Author, Topic } from '@/types/community';

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  participants: number;
  deadline: string;
  reward: {
    points: number;
    badge: string;
  };
  difficulty: "easy" | "medium" | "hard" | "legendary";
  category: string;
  userStatus?: 'not_joined' | 'joined' | 'completed' | 'failed';
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  level: number;
  title: string;
  points: number;
  streak: number;
}

export class CommunityService {
  static async getPosts(userId?: string): Promise<PostProps[]> {
    const posts = await db.select({
      id: communityPosts.id,
      title: communityPosts.title,
      content: communityPosts.content,
      image: communityPosts.image,
      created_at: communityPosts.created_at,
      like_count: communityPosts.like_count,
      comment_count: communityPosts.comment_count,
      tags: communityPosts.tags,
      author: {
        id: users.id,
        name: users.full_name,
        image: users.image,
        level: users.level,
      },
      topic: {
        id: communityTopics.id,
        name: communityTopics.name,
        slug: communityTopics.slug,
        icon: communityTopics.icon
      }
    })
    .from(communityPosts)
    .innerJoin(users, eq(communityPosts.user_id, users.id))
    .innerJoin(communityTopics, eq(communityPosts.topic_id, communityTopics.id))
    .orderBy(desc(communityPosts.created_at))
    .limit(50);

    // If userId provided, check if liked
    let userLikes: Set<string> = new Set();
    if (userId) {
      const likes = await db.select({ postId: postLikes.post_id })
        .from(postLikes)
        .where(eq(postLikes.user_id, userId));
      userLikes = new Set(likes.map(l => l.postId));
    }

    return posts.map(p => ({
      ...p,
      tags: p.tags as string[],
      isLiked: userLikes.has(p.id),
      author: {
        ...p.author,
        name: p.author.name || 'Unknown',
        image: p.author.image || '/default-user.svg'
      }
    }));
  }

  static async getChallenges(userId?: string): Promise<CommunityChallenge[]> {
    const allChallenges = await db.select().from(challenges).where(eq(challenges.is_active, true));
    
    let userParticipations: Record<string, string> = {};
    if (userId) {
      const participations = await db.select({ 
        challengeId: challengeParticipants.challenge_id, 
        status: challengeParticipants.status 
      })
      .from(challengeParticipants)
      .where(eq(challengeParticipants.user_id, userId));
      
      userParticipations = Object.fromEntries(participations.map(p => [p.challengeId, p.status]));
    }

    return allChallenges.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      emoji: c.emoji,
      participants: c.participants_count,
      deadline: c.deadline ? c.deadline.toLocaleDateString() : 'No deadline',
      reward: {
        points: c.reward_points,
        badge: c.reward_badge || 'None'
      },
      difficulty: c.difficulty as any,
      category: c.category,
      userStatus: (userParticipations[c.id] as any) || 'not_joined'
    }));
  }

  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const topUsers = await db.select({
      id: users.id,
      name: users.full_name,
      avatar: users.image,
      level: users.level,
      title: users.role,
      points: users.xp,
    })
    .from(users)
    .orderBy(desc(users.xp))
    .limit(10);

    return await Promise.all(topUsers.map(async (u) => ({
      id: u.id,
      name: u.name || 'Anonymous',
      avatar: u.avatar || '/default-user.svg',
      level: u.level || 1,
      title: u.title || 'Operative',
      points: u.points || 0,
      streak: await this.calculateUserStreak(u.id)
    })));
  }

  private static async calculateUserStreak(userId: string): Promise<number> {
    try {
      const activityDates = await db.execute(sql`
        SELECT DISTINCT DATE(timestamp) as activity_date
        FROM analytics_events
        WHERE user_id = ${userId}
        ORDER BY activity_date DESC
        LIMIT 30
      `);

      if (!activityDates.rows.length) return 0;

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastActivity = new Date(activityDates.rows[0].activity_date as string);
      lastActivity.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) return 0;

      streak = 1;
      for (let i = 0; i < activityDates.rows.length - 1; i++) {
        const current = new Date(activityDates.rows[i].activity_date as string);
        const next = new Date(activityDates.rows[i + 1].activity_date as string);
        
        current.setHours(0, 0, 0, 0);
        next.setHours(0, 0, 0, 0);

        const diff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      return 0;
    }
  }

  static async getComments(postId: string, userId?: string): Promise<CommentProps[]> {
    const comments = await db.select({
      id: communityComments.id,
      content: communityComments.content,
      created_at: communityComments.created_at,
      like_count: communityComments.like_count,
      is_solution: communityComments.is_solution,
      parent_id: communityComments.parent_id,
      author: {
        id: users.id,
        name: users.full_name,
        image: users.image,
        level: users.level
      }
    })
    .from(communityComments)
    .innerJoin(users, eq(communityComments.user_id, users.id))
    .where(eq(communityComments.post_id, postId))
    .orderBy(desc(communityComments.created_at));

    return comments.map(c => ({
      ...c,
      author: {
        ...c.author,
        name: c.author.name || 'Unknown',
        image: c.author.image || '/default-user.svg'
      }
    }));
  }
}
