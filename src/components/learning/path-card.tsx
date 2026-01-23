"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Trophy, PlayCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PathCardProps {
  path: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    modules: any[]; // type this better if possible
  };
  progress?: number; // 0-100
  isRecommended?: boolean;
}

export function PathCard({ path, progress = 0, isRecommended = false }: PathCardProps) {
  const difficultyColor = {
    beginner: "text-green-500",
    intermediate: "text-yellow-500",
    advanced: "text-red-500"
  }[path.difficulty.toLowerCase()] || "text-gray-500";

  return (
    <Card className={cn("flex flex-col h-full hover:shadow-lg transition-shadow", isRecommended && "border-primary/50 bg-primary/5")}>
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="capitalize">
            {path.category}
          </Badge>
          {isRecommended && (
            <Badge className="bg-primary text-primary-foreground">
              Recommended
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl line-clamp-2">{path.title}</CardTitle>
        <CardDescription className="line-clamp-2">{path.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{path.modules.length} Modules</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className={cn("w-4 h-4", difficultyColor)} />
              <span className="capitalize">{path.difficulty}</span>
            </div>
          </div>
          
          {progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/learning/path/${path.id}`}>
            {progress === 0 ? (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Learning
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Continue
              </>
            )}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
