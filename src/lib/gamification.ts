import { db } from "@/db/index";
import { achievements, userAchievements } from "@/shared/db/schema";
import { eq } from "drizzle-orm";
import { GamificationService } from "./services/gamification-service";

export class GamificationEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Seed default system achievements.
   */
  static async seedDefaults() {
    const defaultBadges = [
      {
        name: "first_step",
        title: "First Step",
        description: "Completed your first action in SoloSuccess.",
        icon: "👣",
        points: 50,
        category: "general"
      },
      {
        name: "focus_novice",
        title: "Focus Novice",
        description: "Completed your first Focus Session.",
        icon: "🧘",
        points: 100,
        category: "wellness"
      },
      {
        name: "deep_worker",
        title: "Deep Worker",
        description: "Completed 5 Focus Sessions.",
        icon: "🧠",
        points: 250,
        category: "wellness"
      },
      {
        name: "scholar",
        title: "Scholar",
        description: "Completed a Learning Module.",
        icon: "🎓",
        points: 100,
        category: "academy"
      },
      {
        name: "burnout_survivor",
        title: "Burnout Survivor",
        description: "Logged energy level < 2 but kept going.",
        icon: "❤️‍🩹",
        points: 150,
        category: "wellness"
      }
    ];

    for (const badge of defaultBadges) {
        await db.insert(achievements)
            .values(badge)
            .onConflictDoNothing({ target: achievements.name });
    }
  }

  /**
   * Unlock a badge for the current user
   */
  async unlock(badgeName: string) {
    return await GamificationService.unlockBadge(this.userId, badgeName);
  }

  /**
   * Get all badges for the user with unlock status
   */
  async getBadges() {
    const allBadges = await db.query.achievements.findMany({
        orderBy: achievements.points 
    });

    const myBadges = await db.query.userAchievements.findMany({
        where: eq(userAchievements.user_id, this.userId)
    });

    const unlockedIds = new Set(myBadges.map(b => b.achievement_id));

    return allBadges.map(badge => ({
        ...badge,
        unlocked: unlockedIds.has(badge.id),
        earnedAt: myBadges.find(b => b.achievement_id === badge.id)?.earned_at || null
    }));
  }

  /**
   * Get current user progress
   */
  async getProgress() {
    return await GamificationService.getUserProgress(this.userId);
  }
}
