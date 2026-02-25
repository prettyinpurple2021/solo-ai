"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

export function SkillsRadar() {
  // In a real implementation, you'd fetch this from the user's skill profile
  const data = [
    { skill: "Self-Awareness", level: 6, fullMark: 10 },
    { skill: "Strategic Planning", level: 8, fullMark: 10 },
    { skill: "Decision Making", level: 7, fullMark: 10 },
    { skill: "Boundary Setting", level: 4, fullMark: 10 },
    { skill: "Time Management", level: 7, fullMark: 10 },
    { skill: "Goal Setting", level: 9, fullMark: 10 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" tick={{ fill: 'currentColor', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} axisLine={false} tick={false} />
          <Radar
            name="Skill Level"
            dataKey="level"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.6}
          />
          <Tooltip 
             contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
             itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
