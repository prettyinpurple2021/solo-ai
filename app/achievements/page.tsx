import { Metadata } from "next";
import { BadgeGrid } from "@/components/gamification/badge-grid";

export const metadata: Metadata = {
  title: "Achievements | SoloSuccess AI",
  description: "Track your progress and earned badges.",
};

export default function AchievementsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Achievements</h1>
        <p className="text-muted-foreground">
          A record of your journey, milestones, and victories as a solo founder.
        </p>
      </div>
      <BadgeGrid />
    </div>
  );
}
