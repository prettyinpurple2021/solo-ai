import { db } from "@/db/index"
import { achievements, userAchievements, users } from "@/shared/db/schema"
import { eq, and, sql } from "drizzle-orm"
import { logError, logInfo } from "@/lib/logger"

/**
 * Centralized Gamification Service
 * Handles all XP, Leveling, and Badge logic across the application.
 */
export class GamificationService {
  /**
   * Award XP to a user and handle leveling atomically.
   * Level Formula: floor(sqrt(xp / 100)) + 1
   */
  static async awardXP(userId: string, amount: number, reason?: string) {
    if (amount <= 0) return null

    try {
      const result = await db.update(users)
        .set({ 
            xp: sql`${users.xp} + ${amount}`,
            level: sql`floor(sqrt((${users.xp} + ${amount}) / 100)) + 1`,
            updated_at: new Date()
        })
        .where(eq(users.id, userId))
        .returning({ 
          newXp: users.xp, 
          newLevel: users.level,
          email: users.email 
        })

      if (result.length > 0) {
        logInfo(`XP Awarded to ${result[0].email}`, { 
          userId, 
          amount, 
          reason, 
          newLevel: result[0].newLevel 
        })
        return result[0]
      }
      return null
    } catch (error) {
      logError(`GamificationService.awardXP failed for user ${userId}`, error)
      throw error
    }
  }

  /**
   * Unlock a badge for a user.
   * If the badge has points, they are automatically awarded.
   */
  static async unlockBadge(userId: string, badgeName: string) {
    try {
      // 1. Get the badge definition
      const badge = await db.query.achievements.findFirst({
        where: eq(achievements.name, badgeName)
      })

      if (!badge) {
        logError(`GamificationService.unlockBadge: Unknown badge '${badgeName}'`)
        return { success: false, error: 'Unknown badge' }
      }

      // 2. Check for existing unlock in a transaction to prevent double-awarding
      return await db.transaction(async (tx) => {
        const existing = await tx.query.userAchievements.findFirst({
          where: and(
            eq(userAchievements.user_id, userId),
            eq(userAchievements.achievement_id, badge.id)
          )
        })

        if (existing) {
          return { success: false, alreadyUnlocked: true }
        }

        // 3. Create the unlock record
        await tx.insert(userAchievements).values({
          user_id: userId,
          achievement_id: badge.id,
          earned_at: new Date()
        })

        // 4. Award bonus points if the badge has them
        if (badge.points > 0) {
          await this.awardXP(userId, badge.points, `Badge Unlocked: ${badge.title}`)
        }

        return { success: true, badge }
      })
    } catch (error) {
      logError(`GamificationService.unlockBadge failed`, error)
      throw error
    }
  }

  /**
   * Get comprehensive user progress
   */
  static async getUserProgress(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { xp: true, level: true }
    })

    if (!user) throw new Error("User not found")

    const currentXp = user.xp || 0
    const currentLevel = user.level || 1
    
    // Progress calculation
    const nextLevelXpReq = 100 * Math.pow(currentLevel, 2)
    const currentLevelBaseXp = 100 * Math.pow(currentLevel - 1, 2)
    
    const levelProgress = Math.min(100, Math.max(0, 
        ((currentXp - currentLevelBaseXp) / (nextLevelXpReq - currentLevelBaseXp)) * 100
    ))

    return {
      xp: currentXp,
      level: currentLevel,
      nextLevelXp: nextLevelXpReq,
      progressPercentage: Math.round(levelProgress)
    }
  }
}
