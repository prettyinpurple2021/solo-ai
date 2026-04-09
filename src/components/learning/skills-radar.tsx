"use client";

import { useMemo } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const FULL_MARK = 10;
const MAX_SKILLS = 8;

export type UserSkillRow = {
  skill_name: string;
  current_level: number;
  current_xp?: number;
};

function toRadarData(skills: UserSkillRow[]) {
  const sorted = [...skills].sort((a, b) => {
    const xpDiff = (b.current_xp ?? 0) - (a.current_xp ?? 0);
    if (xpDiff !== 0) return xpDiff;
    return b.current_level - a.current_level;
  });

  return sorted.slice(0, MAX_SKILLS).map((s) => ({
    skill: s.skill_name,
    level: Math.min(FULL_MARK, Math.max(1, s.current_level)),
    fullMark: FULL_MARK,
  }));
}

interface SkillsRadarProps {
  /** Rows from `user_skills` / `LearningEngineService.getUserSkillProfile` */
  skillProfile?: UserSkillRow[] | null;
}

export function SkillsRadar({ skillProfile }: SkillsRadarProps) {
  const data = useMemo(() => {
    if (!skillProfile?.length) return [];
    return toRadarData(skillProfile);
  }, [skillProfile]);

  if (data.length === 0) {
    return (
      <div
        className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed border-border px-4 text-center text-sm text-muted-foreground"
        role="status"
      >
        Complete lessons and assessments to build your skill profile. Progress updates appear here automatically.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" tick={{ fill: "currentColor", fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, FULL_MARK]} axisLine={false} tick={false} />
          <Radar
            name="Skill level"
            dataKey="level"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
            }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value) => [`${value ?? 0} / ${FULL_MARK}`, "Level"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
