import { db } from "@/db";
import { 
    learningPaths, 
    learningModules, 
    userLearningProgress, 
    users, 
    userCompetitiveStats 
} from "@/db/schema";
import { eq, and, asc, desc, sql } from "drizzle-orm";

export interface LearningPathWithModules {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  modules: {
    id: string;
    title: string;
    order: number;
    duration_minutes: number | null;
    status?: string | null;
    content?: string;
    module_type?: string | null;
  }[];
}

export class LearningEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Fetch all available learning paths
   */
  static async getAllPaths() {
    return await db.query.learningPaths.findMany({
      orderBy: [asc(learningPaths.title)],
      with: {
        modules: {
          orderBy: [asc(learningModules.order)],
        },
      },
    });
  }

  /**
   * Fetch a specific learning path with user progress
   */
  async getPathWithProgress(pathId: string): Promise<LearningPathWithModules | null> {
    const path = await db.query.learningPaths.findFirst({
      where: eq(learningPaths.id, pathId),
      with: {
        modules: {
          orderBy: [asc(learningModules.order)],
        },
      },
    });

    if (!path) return null;

    // Get progress for these modules
    // Optimized: Fetch all progress for this user and these modules in one query if possible,
    // or just fetch all progress for this user to map it in memory for smaller datasets.
    // For scalability, we'll fetch specific progress items.
    
    // Fetch all user progress entries for modules in this path
    const progressEntries = await db.query.userLearningProgress.findMany({
        where: and(
            eq(userLearningProgress.user_id, this.userId)
        )
    });

    const progressMap = new Map(progressEntries.map(p => [p.module_id, p.status]));

    const modulesWithProgress = path.modules.map((module) => ({
        id: module.id,
        title: module.title,
        order: module.order,
        duration_minutes: module.duration_minutes,
        content: module.content,
        module_type: module.module_type,
        status: progressMap.get(module.id) || "not_started"
    }));

    return {
      id: path.id,
      title: path.title,
      description: path.description,
      category: path.category,
      difficulty: path.difficulty,
      modules: modulesWithProgress,
    };
  }

  /**
   * Update user progress for a module and award XP
   */
  async updateProgress(moduleId: string, status: "in_progress" | "completed") {
    const existing = await db.query.userLearningProgress.findFirst({
      where: and(
        eq(userLearningProgress.user_id, this.userId),
        eq(userLearningProgress.module_id, moduleId)
      ),
    });

    const now = new Date();
    let isNewCompletion = false;

    if (existing) {
      if (existing.status !== 'completed' && status === 'completed') {
          isNewCompletion = true;
      }

      await db
        .update(userLearningProgress)
        .set({
          status,
          last_accessed_at: now,
          completed_at: status === "completed" ? now : existing.completed_at,
        })
        .where(eq(userLearningProgress.id, existing.id));
    } else {
      if (status === 'completed') {
          isNewCompletion = true;
      }
      
      await db.insert(userLearningProgress).values({
        user_id: this.userId,
        module_id: moduleId,
        status,
        last_accessed_at: now,
        completed_at: status === "completed" ? now : null,
      });
    }

    if (isNewCompletion) {
        await this.awardXP(50); // Base 50 XP per module
    }
  }

  /**
   * Award XP to user
   */
  private async awardXP(amount: number) {
      // Fetch current XP
      const user = await db.query.users.findFirst({
          where: eq(users.id, this.userId),
          columns: { xp: true, level: true }
      });

      if (!user) return;

      const newXP = (user.xp || 0) + amount;
      // Simple Level Formula: Level = Floor(sqrt(XP / 100)) + 1
      const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;

      await db.update(users)
        .set({ 
            xp: newXP,
            level: newLevel
        })
        .where(eq(users.id, this.userId));
  }

  /**
   * Track progress (Alias for updateProgress with checks)
   */
  async trackProgress(moduleId: string, progressData: any) {
     const status = progressData.completed ? "completed" : "in_progress";
     await this.updateProgress(moduleId, status);
  }

  /**
   * Analyze skill gaps based on completed categories
   */
  async analyzeSkillGaps() {
    const progress = await this.getUserProgress();
    const completedModuleIds = progress
        .filter(p => p.status === 'completed')
        .map(p => p.module_id);
    
    if (completedModuleIds.length === 0) {
        return [{ skill: "General Business", gap_level: "high", recommended_modules: [] }];
    }

    // Join with modules to see categories (Naive implementation)
    // In a real app, we'd have a complex skill matrix.
    // Here we just check for basic diversity in learning.
    
    return [
      { skill: "Advanced Market Analysis", gap_level: "medium", recommended_modules: [] }
    ];
  }

  /**
   * Create skill assessment (Placeholder for quiz logic)
   */
  async createSkillAssessment(skillId: string, assessmentData: any) {
    return {
        id: `assess_${Date.now()}`,
        skillId,
        questions: 5,
        estimated_time: 10
    };
  }

  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations() {
    // Return paths the user hasn't started yet
    // simple logic: get all paths, filter out ones where all modules are done
    // For MVP: Return 'beginner' paths first
    return await db.query.learningPaths.findMany({
      where: eq(learningPaths.difficulty, "beginner"),
      limit: 3,
    });
  }

  /**
   * Fetch all user progress
   */
  async getUserProgress() {
    return await db.query.userLearningProgress.findMany({
      where: eq(userLearningProgress.user_id, this.userId),
    });
  }

  /**
   * Get learning analytics for the user
   */
  async getLearningAnalytics() {
    const progress = await this.getUserProgress();
    const totalModulesCompleted = progress.filter(p => p.status === 'completed').length;
    
    // Get user stats for rank/level
    const user = await db.query.users.findFirst({
        where: eq(users.id, this.userId),
        columns: { level: true, xp: true }
    });

    return {
      total_modules_completed: totalModulesCompleted,
      total_time_spent: totalModulesCompleted * 15, // Estimate 15 mins per module
      current_level: user?.level || 1,
      current_xp: user?.xp || 0,
      next_level_progress: ((user?.xp || 0) % 100), // Simplified
      learning_velocity: "Steady",
      peer_rank: "Top 50%", 
    };
  }

  /**
   * Fetch all modules (Static utility)
   */
  static async getAllModules() {
    return await db.query.learningModules.findMany({
      orderBy: [asc(learningModules.order)],
      with: {
        path: true
      }
    });
  }
}
