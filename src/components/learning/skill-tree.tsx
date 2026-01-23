"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Lock } from "lucide-react";

interface SkillNode {
  id: string;
  title: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  level: number; // For vertical positioning
}

interface SkillTreeProps {
  skills: SkillNode[];
}

export function SkillTree({ skills }: SkillTreeProps) {
  // Simple vertical tree visualization
  return (
    <div className="py-8 relative">
      {/* Central Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border -z-10" />

      <div className="space-y-8">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 group"
          >
            {/* Node Icon */}
            <div className={cn(
              "w-16 h-16 rounded-full border-4 flex items-center justify-center bg-background transition-colors sticky left-0 shrink-0",
              skill.status === 'completed' && "border-green-500 text-green-500",
              skill.status === 'in_progress' && "border-blue-500 text-blue-500",
              skill.status === 'available' && "border-gray-300 text-gray-400 group-hover:border-gray-400",
              skill.status === 'locked' && "border-gray-100 text-gray-200 bg-gray-50"
            )}>
              {skill.status === 'completed' && <CheckCircle2 className="w-8 h-8" />}
              {skill.status === 'in_progress' && <div className="w-4 h-4 bg-blue-500 rounded-full" />}
              {skill.status === 'available' && <Circle className="w-8 h-8" />}
              {skill.status === 'locked' && <Lock className="w-6 h-6" />}
            </div>

            {/* Info */}
            <div className={cn(
              "p-4 rounded-lg border bg-card/50 backdrop-blur-sm flex-1",
              skill.status === 'locked' && "opacity-50 grayscale"
            )}>
              <h3 className="font-semibold text-lg">{skill.title}</h3>
              <p className="text-sm text-muted-foreground capitalize">{skill.status.replace('_', ' ')}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
