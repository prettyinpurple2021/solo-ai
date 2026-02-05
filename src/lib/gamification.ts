import { db } from "@/db";
import { achievements, userAchievements } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export class GamificationEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Seed default system achievements.
   *Ideally run by an admin or as a migration, but safe to run on startup/demand.
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
        description: "Logged energy level < 2 but kept going (Careful!).",
        icon: "❤️‍🩹",
        points: 150,
        category: "wellness"
      }
    ];

    for (const badge of defaultBadges) {
        // Upsert logic or check-then-insert
        // Drizzle's onConflictDoNothing with PG can be used if constraints exist
        await db.insert(achievements)
            .values(badge)
            .onConflictDoNothing({ target: achievements.name });
    }
  }

  /**
   * Unlock a badge for the current user
   */
  async unlock(badgeName: string) {
    // 1. Get the achievement ID
    const badge = await db.query.achievements.findFirst({
        where: eq(achievements.name, badgeName)
    });

    if (!badge) {
        console.warn(`Gamification: Tried to unlock unknown badge '${badgeName}'`);
        return false;
    }

    // 2. Check if already unlocked
    const existing = await db.query.userAchievements.findFirst({
        where: and(
            eq(userAchievements.user_id, this.userId),
            eq(userAchievements.achievement_id, badge.id)
        )
    });

    if (existing) return false; // Already unlocked

    // 3. Award Badge
    await db.insert(userAchievements).values({
        user_id: this.userId,
        achievement_id: badge.id,
        earned_at: new Date()
    });

    // TODO: We could also re-trigger XP award if the badge carries bonus points that aren't duplicative
    // For now, badges are just prestige.

    return true; // Newly unlocked
  }

  /**
   * Get all badges for the user (unlocked and locked if you want to show grid)
   * For now, returning list of all achievements with an 'unlocked' status
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
}
