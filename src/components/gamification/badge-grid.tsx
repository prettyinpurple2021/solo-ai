"use client";

import { useEffect, useState } from "react";
import { logError } from "@/lib/logger";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Lock } from "lucide-react";

interface Achievement {
  id: number;
  name: string;
  title: string;
  description: string;
  icon: string | null;
  points: number;
  category: string | null;
  unlocked: boolean;
  earnedAt: string | null;
}

export function BadgeGrid() {
  const [badges, setBadges] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch("/api/gamification/badges");
        if (res.ok) {
          const data = await res.json();
          setBadges(data);
        }
      } catch (error) {
        logError("Failed to fetch badges", { error });
      } finally {
        setLoading(false);
      }
    }
    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Achievements</h2>
        <Badge variant="outline" className="text-muted-foreground">
          {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <Card 
            key={badge.id} 
            className={`transition-all duration-300 ${
              badge.unlocked 
                ? "border-yellow-500/50 bg-yellow-500/5 hover:bg-yellow-500/10 dark:bg-yellow-500/10 dark:hover:bg-yellow-500/20" 
                : "opacity-60 grayscale border-dashed"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="text-3xl filter drop-shadow-sm">
                  {badge.icon || "🏆"}
                </div>
                {badge.unlocked ? (
                   <span className="text-xs font-mono text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded">
                     +{badge.points} XP
                   </span>
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-sm font-semibold mb-1 truncate" title={badge.title}>
                {badge.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground line-clamp-2" title={badge.description}>
                {badge.description}
              </p>
              {badge.earnedAt && (
                <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/50">
                  Earned {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
