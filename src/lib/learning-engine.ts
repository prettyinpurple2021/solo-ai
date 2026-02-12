import { db } from "@/lib/database-client";
import { 
    learningPaths, 
    learningModules, 
    userLearningProgress, 
    users, 
    userCompetitiveStats 
} from "@/db/schema";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import { logError, logWarn, logInfo } from "@/lib/logger";
import { generateObject } from "ai";
import { openai } from "@/lib/ai-config";
import { z } from "zod";



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
    
    // Fetch full module details for context
    const allModules = await db.query.learningModules.findMany();
    const modulesMap = new Map(allModules.map(m => [m.id, m]));
    
    const completedModules = progress
        .filter(p => p.status === 'completed')
        .map(p => modulesMap.get(p.module_id))
        .filter((m): m is typeof allModules[0] => !!m);
        
    // If no progress, return fundamental gaps
    if (completedModules.length === 0) {
        return [{ 
            skill: "Business Foundations", 
            gap_level: "critical", 
            recommended_modules: allModules.slice(0, 3).map(m => m.title)
        }];
    }

    // Prepare data for AI analysis
    const completedTitles = completedModules.map(m => `- ${m.title} (${m.module_type})`).join('\n');
    const availableTitles = allModules.map(m => `- ${m.title} (${m.module_type})`).join('\n');

    const prompt = `
      Analyze this user's learning progress and identify skill gaps.
      
      Completed Modules:
      ${completedTitles}
      
      Available Curriculum:
      ${availableTitles}
      
      Return a JSON array of objects with these fields:
      - skill: string (The missing skill area)
      - gap_level: "low" | "medium" | "high" | "critical"
      - recommended_modules: string[] (Titles of modules from the available curriculum that would fill this gap)
      - reasoning: string (Brief explanation)
      
      Limit to top 3 gaps.
    `;

    try {
        const result = (await generateObject({
            model: openai("gpt-4o"),
            schema: z.object({
                gaps: z.array(z.object({
                    skill: z.string(),
                    gap_level: z.enum(["low", "medium", "high", "critical"]),
                    recommended_modules: z.array(z.string()),
                    reasoning: z.string()
                }))
            }) as any,
            prompt: `
              Analyze this user's learning progress and identify skill gaps.
              
              Completed Modules:
              ${completedTitles}
              
              Available Curriculum:
              ${availableTitles}
              
              Return a JSON array of up to 3 skill gaps.
            `
        })) as any;

        return result.object.gaps;
    } catch (e) {
        logError('AI Skill Gap Analysis failed', e as Error);
        // Fallthrough to fallback
    }


    // Fallback if AI fails or no keys
    // Simple fallback: Recommend next incomplete modules in order.

    const incompleteModules = allModules.filter(m => !completedModules.find(cm => cm.id === m.id));
    
    return [
      { 
          skill: "Next Logical Step", 
          gap_level: "medium", 
          recommended_modules: incompleteModules.slice(0, 2).map(m => m.title),
          reasoning: "Based on standard curriculum progression."
      }
    ];
  }

  /**
   * Create skill assessment with AI-generated questions
   */
  async createSkillAssessment(skillId: string, assessmentData: { skillName: string, difficulty?: string }) {
    try {
      const { skillName, difficulty = 'intermediate' } = assessmentData;
      
      const result = (await generateObject({
        model: openai("gpt-4o"),
        schema: z.object({
          title: z.string(),
          questions: z.array(z.object({
            question: z.string(),
            options: z.array(z.string()).length(4),
            correctAnswerIndex: z.number().min(0).max(3),
            explanation: z.string(),
            difficulty: z.enum(['beginner', 'intermediate', 'advanced'])
          }))
        }) as any,
        prompt: `Generate a skill assessment quiz for "${skillName}" at ${difficulty} level.
        The quiz should have 5 challenging questions that test practical knowledge and theoretical understanding.
        Ensure each question has exactly 4 options and a clear explanation for why the correct answer is right.`
      })) as any;

      return {
        id: `assess_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
        skillId,
        ...result.object,
        estimated_time_minutes: 10
      };
    } catch (error) {
      logError('Failed to create skill assessment:', error);
      throw new Error('Assessment generation failed');
    }
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
