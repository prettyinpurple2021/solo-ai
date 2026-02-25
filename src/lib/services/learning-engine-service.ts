import { db } from "@/db/index"
import { userLearningProgress, learningModules } from "@/shared/db/schema/content"
import { userSkills, assessments, assessmentSubmissions } from "@/shared/db/schema/learning"
import { eq, and, sql } from "drizzle-orm"
import { logError, logInfo } from "@/lib/logger"
import { GamificationService } from "./gamification-service"
import { v4 as uuidv4 } from "uuid"

export class LearningEngineService {
  /**
   * Evaluates an assessment submission, calculates the score, saves the result, 
   * and awards XP/Skill progress if passed.
   */
  static async submitAssessment(userId: string, assessmentId: string, answers: Record<string, string>) {
    try {
      const assessment = await db.query.assessments.findFirst({
        where: eq(assessments.id, assessmentId),
        with: {
          module: true
        }
      });

      if (!assessment) {
        throw new Error("Assessment not found");
      }

      const questionsData = assessment.questions_data as any[];
      let totalPointsAvailable = 0;
      let earnedPoints = 0;
      let xpEarned = 0;

      questionsData.forEach((q) => {
        const reward = q.xp_reward || 10;
        totalPointsAvailable += reward;
        if (answers[q.id] === q.correct_answer) {
          earnedPoints += reward;
        }
      });

      const scorePercentage = totalPointsAvailable > 0 ? Math.round((earnedPoints / totalPointsAvailable) * 100) : 0;
      const passed = scorePercentage >= assessment.passing_score;

      if (passed) {
        xpEarned = earnedPoints; // Or adjust based on your XP formula
      }

      // Check if they already passed it so we don't award duplicate XP for retakes
      const priorSubmissions = await db.query.assessmentSubmissions.findMany({
        where: and(
            eq(assessmentSubmissions.user_id, userId),
            eq(assessmentSubmissions.assessment_id, assessmentId),
            eq(assessmentSubmissions.passed, true)
        )
      });

      const isFirstTimePass = passed && priorSubmissions.length === 0;

      const submission = await db.insert(assessmentSubmissions).values({
        id: uuidv4(),
        user_id: userId,
        assessment_id: assessmentId,
        score: scorePercentage,
        passed,
        answers_data: Object.entries(answers).map(([qId, val]) => ({ questionId: qId, answer: val })),
        xp_earned: isFirstTimePass ? xpEarned : 0
      }).returning();


      if (isFirstTimePass) {
         // Award general XP
         await GamificationService.awardXP(userId, xpEarned, `Passed Assessment: ${assessment.title}`);
         
         // Update specific skills
         const skillsCovered = (assessment.module?.skills_covered as string[]) || [];
         for (const skill of skillsCovered) {
            await this.addSkillXP(userId, skill, Math.ceil(xpEarned / skillsCovered.length));
         }

         // Mark module as completed automatically
         await this.updateModuleProgress(userId, assessment.module_id, 'completed');
      }

      return {
        success: true,
        submission: submission[0],
        passed,
        score: scorePercentage,
        xpAwarded: isFirstTimePass ? xpEarned : 0
      };

    } catch (error) {
      logError(`LearningEngineService.submitAssessment failed for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Adds XP to a specific skill for a user, leveling up the skill if necessary.
   */
  static async addSkillXP(userId: string, skillName: string, amount: number) {
    if (amount <= 0) return;

    try {
      const existingSkill = await db.query.userSkills.findFirst({
        where: and(
            eq(userSkills.user_id, userId),
            eq(userSkills.skill_name, skillName)
        )
      });

      if (existingSkill) {
        // Simple skill level formula: level = floor(sqrt(xp / 50)) + 1
        await db.update(userSkills)
          .set({
            current_xp: sql`${userSkills.current_xp} + ${amount}`,
            current_level: sql`floor(sqrt((${userSkills.current_xp} + ${amount}) / 50)) + 1`,
            updated_at: new Date()
          })
          .where(eq(userSkills.id, existingSkill.id));
      } else {
        await db.insert(userSkills).values({
          id: uuidv4(),
          user_id: userId,
          skill_name: skillName,
          current_xp: amount,
          current_level: Math.floor(Math.sqrt(amount / 50)) + 1
        });
      }
    } catch (error) {
      logError(`LearningEngineService.addSkillXP failed for user ${userId} skill ${skillName}`, error);
    }
  }

  /**
   * Updates progress for a learning module.
   */
  static async updateModuleProgress(userId: string, moduleId: string, status: 'not_started' | 'in_progress' | 'completed', lastPosition?: number) {
     try {
       const existing = await db.query.userLearningProgress.findFirst({
           where: and(
               eq(userLearningProgress.user_id, userId),
               eq(userLearningProgress.module_id, moduleId)
           )
       });

       const isNewlyCompleted = status === 'completed' && existing?.status !== 'completed';

       if (existing) {
           await db.update(userLearningProgress)
             .set({
                 status,
                 last_position: lastPosition ?? existing.last_position,
                 completed_at: status === 'completed' ? (existing.completed_at || new Date()) : existing.completed_at,
                 last_accessed_at: new Date()
             })
             .where(eq(userLearningProgress.id, existing.id));
       } else {
           await db.insert(userLearningProgress).values({
               id: uuidv4(),
               user_id: userId,
               module_id: moduleId,
               status,
               last_position: lastPosition || 0,
               completed_at: status === 'completed' ? new Date() : null,
               last_accessed_at: new Date()
           });
       }

       if (isNewlyCompleted) {
           // Award some base XP for completing a module (e.g. 20 XP)
           await GamificationService.awardXP(userId, 20, 'Module Completed');
       }

       return { success: true, status };
     } catch (error) {
       logError(`LearningEngineService.updateModuleProgress failed`, error);
       throw error;
     }
  }

  /**
   * Gets the overall skill profile for a user.
   */
  static async getUserSkillProfile(userId: string) {
      return await db.query.userSkills.findMany({
          where: eq(userSkills.user_id, userId),
          orderBy: (skills, { desc }) => [desc(skills.current_level), desc(skills.current_xp)]
      });
  }
}
