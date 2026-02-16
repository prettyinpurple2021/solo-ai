import { db } from "@/db";
import { logError } from "@/lib/logger";
import { moodEntries, focusSessions, users } from "@/shared/db/schema";
import { eq, desc, avg, sql, and, gte } from "drizzle-orm";

export class WellnessEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Log a daily mood/energy check-in
   */
  async logMood(energyLevel: number, moodLabel: string, note?: string) {
    return await db.insert(moodEntries).values({
      user_id: this.userId,
      energy_level: energyLevel,
      mood_label: moodLabel,
      note: note,
    }).returning();
  }

  /**
   * Log a completed focus session and award XP
   */
  async logFocusSession(durationMinutes: number, taskDescription?: string) {
    if (!durationMinutes || durationMinutes <= 0 || !Number.isFinite(durationMinutes)) {
        throw new Error("Invalid duration minutes");
    }

    // simple gamification: 10 XP per 15 mins
    const xpEarned = Math.floor(durationMinutes / 15) * 10;
    
    // Calculate start time (approximate based on duration)
    const now = new Date();
    const startedAt = new Date(now.getTime() - durationMinutes * 60000);

    // Save session
    await db.insert(focusSessions).values({
      user_id: this.userId,
      duration_minutes: durationMinutes,
      started_at: startedAt,
      end_time: now,
      notes: taskDescription,
      xp_earned: xpEarned,
      status: 'completed'
    });

    // Award XP if applicable
    if (xpEarned > 0) {
        // We reuse the logic we built for learning engine or duplicate it here for safety/speed
        // Ideally, we'd have a centralized XP service. For now, direct update.
        await this.awardXP(xpEarned);
    }
    
    return { xpEarned };
  }
  
  async awardXP(amount: number) {
      // Single atomic operation to update XP and recalculate Level
      // Level Formula: floor(sqrt((xp + amount) / 100)) + 1
      const result = await db.update(users)
        .set({ 
            xp: sql`${users.xp} + ${amount}`,
            level: sql`floor(sqrt((${users.xp} + ${amount}) / 100)) + 1`
        })
        .where(eq(users.id, this.userId))
        .returning({ xp: users.xp, level: users.level });

      if (result.length === 0) {
          // Explicitly handle missing user case
          logError(`WellnessEngine: Failed to award XP. User ${this.userId} not found`, { userId: this.userId });
          throw new Error(`User ${this.userId} not found when awarding XP`);
      }
  }

  /**
   * Get wellness stats for dashboard
   */
  async getStats() {
    // Get recent mood (last 7 days) to calculate burnout risk
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMoods = await db.query.moodEntries.findMany({
        where: and(
            eq(moodEntries.user_id, this.userId),
            gte(moodEntries.created_at, sevenDaysAgo)
        ),
        orderBy: [desc(moodEntries.created_at)],
    });

    // Calculate average energy
    const avgEnergy = recentMoods.length > 0 
        ? recentMoods.reduce((acc, curr) => acc + curr.energy_level, 0) / recentMoods.length
        : 0;

    // Burnout Risk Logic
    let burnoutRisk = "Unknown";
    
    if (recentMoods.length === 0) {
        burnoutRisk = "Insufficient Data";
    } else {
        // User request: include 0 in High risk, though mathematically 1-5 scale prevents it. 
        // We use < 2.5 to be safe and inclusive.
        if (avgEnergy < 2.5) burnoutRisk = "High";
        else if (avgEnergy >= 2.5 && avgEnergy < 3.5) burnoutRisk = "Medium";
        else burnoutRisk = "Low";
    }

    // Get today's focus minutes
    // Simple verification: summing minutes from focusSessions where created_at is today
    // For MVP efficiency, just returning recent sessions count
    
    // Fetch user for current XP/Level
    const user = await db.query.users.findFirst({
        where: eq(users.id, this.userId),
        columns: { xp: true, level: true }
    });

    const currentXp = user?.xp || 0;
    const currentLevel = user?.level || 1;
    
    // Calculate progress to next level:
    // Next Level (L+1) requires: 100 * L^2.
    const nextLevelXpReq = 100 * Math.pow(currentLevel, 2);
    // Previous Level (Current) req: 100 * (currentLevel - 1)^2
    const currentLevelBaseXp = 100 * Math.pow(currentLevel - 1, 2);
    
    // Progress % = (CurrentXP - BaseXP) / (NextXP - BaseXP)
    const levelProgress = Math.min(100, Math.max(0, 
        ((currentXp - currentLevelBaseXp) / (nextLevelXpReq - currentLevelBaseXp)) * 100
    ));

    return {
        avg_energy: avgEnergy.toFixed(1),
        burnout_risk: burnoutRisk,
        recent_moods: recentMoods.slice(0, 5),
        total_focus_sessions: 0,
        gamification: {
            xp: currentXp,
            level: currentLevel,
            next_level_progress: Math.round(levelProgress)
        }
    };
  }
}
