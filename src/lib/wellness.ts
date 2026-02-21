import { db } from "@/db/index";
import { logError } from "@/lib/logger";
import { moodEntries, focusSessions } from "@/shared/db/schema";
import { eq, desc, and, gte, count } from "drizzle-orm";
import { GamificationService } from "./services/gamification-service";

export class WellnessEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Log a daily mood/energy check-in
   */
  async logMood(energyLevel: number, moodLabel: string, note?: string) {
    const result = await db.insert(moodEntries).values({
      user_id: this.userId,
      energy_level: energyLevel,
      mood_label: moodLabel,
      note: note,
    }).returning();

    // Check for "First Mood" badge if this is the user's first entry
    const [entryCount] = await db.select({ value: count() })
      .from(moodEntries)
      .where(eq(moodEntries.user_id, this.userId));
    
    if (entryCount.value === 1) {
      await GamificationService.unlockBadge(this.userId, 'first_step');
    }

    return result;
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
    
    // Calculate start time
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

    // Award XP via centralized service
    if (xpEarned > 0) {
        await GamificationService.awardXP(this.userId, xpEarned, `Focus Session: ${durationMinutes}m`);
    }

    // Check for "Focus Novice" badge
    const [sessionsCount] = await db.select({ value: count() })
      .from(focusSessions)
      .where(and(eq(focusSessions.user_id, this.userId), eq(focusSessions.status, 'completed')));
    
    if (sessionsCount.value === 1) {
      await GamificationService.unlockBadge(this.userId, 'focus_novice');
    } else if (sessionsCount.value === 5) {
      await GamificationService.unlockBadge(this.userId, 'deep_worker');
    }
    
    return { xpEarned };
  }

  /**
   * Get wellness stats for dashboard
   */
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

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
    let burnoutRisk = "Low";
    if (recentMoods.length === 0) {
        burnoutRisk = "Insufficient Data";
    } else if (avgEnergy < 2.5) {
        burnoutRisk = "High";
    } else if (avgEnergy < 3.5) {
        burnoutRisk = "Medium";
    }

    // Get today's focus stats
    const todaySessions = await db.select({ duration: focusSessions.duration_minutes })
      .from(focusSessions)
      .where(and(eq(focusSessions.user_id, this.userId), gte(focusSessions.started_at, today)));
    
    const totalFocusMinutes = todaySessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);

    // Fetch user progress from centralized service
    const progress = await GamificationService.getUserProgress(this.userId);

    return {
        avg_energy: avgEnergy.toFixed(1),
        burnout_risk: burnoutRisk,
        recent_moods: recentMoods.slice(0, 5),
        total_focus_sessions: todaySessions.length,
        total_focus_minutes: totalFocusMinutes,
        gamification: {
            xp: progress.xp,
            level: progress.level,
            next_level_progress: progress.progressPercentage
        }
    };
  }
}
