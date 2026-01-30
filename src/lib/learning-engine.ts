import { db } from "@/lib/database-client";
import { learningPaths, learningModules, userLearningProgress } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

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
  async getAllPaths(): Promise<any[]> {
    return await db.query.learningPaths.findMany({
      with: {
        modules: {
          orderBy: asc(learningModules.order),
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
          orderBy: asc(learningModules.order),
        },
      },
    });

    if (!path) return null;

    // Get progress for these modules
    const modulesWithProgress = await Promise.all(
      path.modules.map(async (module) => {
        const progress = await db.query.userLearningProgress.findFirst({
          where: and(
            eq(userLearningProgress.user_id, this.userId),
            eq(userLearningProgress.module_id, module.id)
          ),
        });

        return {
          id: module.id,
          title: module.title,
          order: module.order,
          duration_minutes: module.duration_minutes,
          status: progress?.status || "not_started",
        };
      })
    );

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
   * Update user progress for a module
   */
  async updateProgress(moduleId: string, status: "in_progress" | "completed") {
    const existing = await db.query.userLearningProgress.findFirst({
      where: and(
        eq(userLearningProgress.user_id, this.userId),
        eq(userLearningProgress.module_id, moduleId)
      ),
    });

    const now = new Date();

    if (existing) {
      await db
        .update(userLearningProgress)
        .set({
          status,
          last_accessed_at: now,
          completed_at: status === "completed" ? now : existing.completed_at,
        })
        .where(eq(userLearningProgress.id, existing.id));
    } else {
      await db.insert(userLearningProgress).values({
        user_id: this.userId,
        module_id: moduleId,
        status,
        last_accessed_at: now,
        completed_at: status === "completed" ? now : null,
      });
    }
  }

  /**
   * Track progress (Alias for updateProgress with checks)
   */
  async trackProgress(moduleId: string, progressData: any) {
     const status = progressData.completed ? "completed" : "in_progress";
     await this.updateProgress(moduleId, status);
  }

  /**
   * Analyze skill gaps
   */
  async analyzeSkillGaps() {
    // Mock implementation for now
    const progress = await this.getUserProgress();
    const completedCount = progress.filter(p => p.status === 'completed').length;
    
    return [
      { skill: "Advanced Market Analysis", gap_level: "high", recommended_modules: ["mod_market_adv_1"] },
      { skill: "Technical SEO", gap_level: completedCount > 2 ? "low" : "medium", recommended_modules: ["mod_seo_tech"] }
    ];
  }

  /**
   * Create skill assessment
   */
  async createSkillAssessment(skillId: string, assessmentData: any) {
    // Mock implementation
    return {
        id: `assess_${Date.now()}`,
        skillId,
        questions: 10,
        estimated_time: 15
    };
  }

  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations() {
    // In a real system, we'd analyze user.goals or user.xp
    // For now, we return beginner paths
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
    // 1. Get all progress
    const progress = await this.getUserProgress();
    
    // 2. Calculate metrics
    const totalModulesCompleted = progress.filter(p => p.status === 'completed' || (parseFloat((p as any).completion_percentage?.toString() || '0') >= 100)).length;
    
    // Calculate total time (mock if field missing or 0)
    const totalTimeSpent = 0; // Placeholder until schema update

    return {
      total_modules_completed: totalModulesCompleted,
      total_time_spent: totalTimeSpent,
      average_quiz_score: 85, // Mock
      skills_improved: totalModulesCompleted * 2, 
      current_streak: 5, 
      learning_velocity: 3, 
      top_categories: [
         { category: 'Marketing', time_spent: 120, modules_completed: 2 },
         { category: 'Finance', time_spent: 60, modules_completed: 1 }
      ],
      certifications_earned: Math.floor(totalModulesCompleted / 5),
      peer_rank: 42,
      weekly_goal_progress: 75
    };
  }

  /**
   * Fetch all modules (for directory/overview)
   */
  static async getAllModules() { // Keep ONE static utility if it doesn't need userId
    return await db.query.learningModules.findMany({
      orderBy: asc(learningModules.order),
      with: {
        path: true
      }
    });
  }
}
