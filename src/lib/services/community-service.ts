
import { db } from '@/db';
import { 
  communityPosts, 
  communityComments, 
  postLikes, 
  users, 
  challenges, 
  challengeParticipants 
} from '@/shared/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';

export interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    level: number;
    title: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  userReaction?: string;
  tags: string[];
}

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
  static async getPosts(userId?: string): Promise<CommunityPost[]> {
    const posts = await db.select({
      id: communityPosts.id,
      content: communityPosts.content,
      image: communityPosts.image,
      createdAt: communityPosts.created_at,
      likes: communityPosts.like_count,
      comments: communityPosts.comment_count,
      shares: communityPosts.shares_count,
      tags: communityPosts.tags,
      author: {
        id: users.id,
        name: users.full_name,
        avatar: users.image,
        level: users.level,
        title: users.role,
        verified: users.onboarding_completed // Approximation
      }
    })
    .from(communityPosts)
    .innerJoin(users, eq(communityPosts.user_id, users.id))
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
      id: p.id,
      content: p.content,
      image: p.image || undefined,
      timestamp: p.createdAt.toLocaleDateString(),
      likes: p.likes,
      comments: p.comments,
      shares: p.shares,
      tags: p.tags as string[],
      isLiked: userLikes.has(p.id),
      userReaction: userLikes.has(p.id) ? 'like' : undefined,
      author: {
        id: p.author.id,
        name: p.author.name || 'Unknown',
        avatar: p.author.avatar || '/default-user.svg',
        level: p.author.level || 1,
        title: p.author.title || 'Operative',
        verified: p.author.verified || false
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
      streak: sql<number>`0` // Placeholder for now
    })
    .from(users)
    .orderBy(desc(users.xp))
    .limit(10);

    return topUsers.map(u => ({
      id: u.id,
      name: u.name || 'Anonymous',
      avatar: u.avatar || '/default-user.svg',
      level: u.level || 1,
      title: u.title || 'Operative',
      points: u.points || 0,
      streak: u.streak
    }));
  }
}
