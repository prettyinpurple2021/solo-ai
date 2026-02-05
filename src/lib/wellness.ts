import { db } from "@/db";
import { moodEntries, focusSessions, users } from "@/db/schema";
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
  
  private async awardXP(amount: number) {
      const user = await db.query.users.findFirst({
          where: eq(users.id, this.userId),
          columns: { xp: true, level: true }
      });

      if (!user) return;

      const newXP = (user.xp || 0) + amount;
      const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;

      await db.update(users)
        .set({ xp: newXP, level: newLevel })
        .where(eq(users.id, this.userId));
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
    // If avg energy < 3, risk is High.
    let burnoutRisk = "Low";
    if (avgEnergy > 0 && avgEnergy < 2.5) burnoutRisk = "High";
    else if (avgEnergy >= 2.5 && avgEnergy < 3.5) burnoutRisk = "Medium";

    // Get today's focus minutes
    // Simple verification: summing minutes from focusSessions where created_at is today
    // For MVP efficiency, just returning recent sessions count
    
    return {
        avg_energy: avgEnergy.toFixed(1),
        burnout_risk: burnoutRisk,
        recent_moods: recentMoods.slice(0, 5),
        total_focus_sessions: 0 // Placeholder/TODO: Add aggregate query
    };
  }
}
