"use client";

import { useEffect, useState } from "react";
import { ModuleCard } from "@/components/learning/module-card";
import { SkillsRadar } from "@/components/learning/skills-radar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/logger";

export default function LearningDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/learning");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        logError(
          "Failed to load learning data",
          err instanceof Error ? err : new Error(String(err))
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading learning pathways...</div>;
  }

  if (!data?.paths || data.paths.length === 0) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        <h1 className="text-3xl font-bold tracking-tight">Growth & Learning</h1>
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Learning Hub</CardTitle>
            <CardDescription>No courses available at the moment. Check back later!</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { paths, progress } = data;
  const course1 = paths.find((p: any) => p.category === 'productivity') || paths[0];
  
  if (!course1) return null;

  const totalModules = course1.modules.length;
  const completedIds = new Set(progress.filter((p: any) => p.status === 'completed').map((p: any) => p.module_id));
  const completedCount = course1.modules.filter((m: any) => completedIds.has(m.id)).length;
  const percentage = Math.round((completedCount / totalModules) * 100) || 0;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in mt-14 fade-in zoom-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Focus & Systems</h1>
          <p className="text-muted-foreground mt-1">Master ruthless prioritization and build freedom-driven systems.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Course Paths */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>{course1.title}</CardTitle>
              <CardDescription>{course1.description}</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="mb-6 space-y-2">
                 <div className="flex justify-between text-sm">
                    <span className="font-medium text-muted-foreground">Course Progress</span>
                    <span className="font-medium">{percentage}%</span>
                 </div>
                 <Progress value={percentage} className="h-2" />
                 <p className="text-xs text-muted-foreground">{completedCount} of {totalModules} modules completed</p>
               </div>

               <div className="space-y-4">
                 {course1.modules.map((mod: any) => (
                    <ModuleCard 
                      key={mod.id} 
                      module={mod} 
                      isCompleted={completedIds.has(mod.id)} 
                    />
                 ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Skills & Academy */}
        <div className="space-y-6">
           <Card className="border shadow-sm">
             <CardHeader>
               <CardTitle>Skill Profile</CardTitle>
               <CardDescription>Your acquired leadership skills.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="w-full flex justify-center py-4">
                  <SkillsRadar />
                </div>
             </CardContent>
           </Card>

           <Card className="border shadow-sm bg-gradient-to-br from-primary/10 to-primary/5">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <span>The Academy</span>
               </CardTitle>
               <CardDescription>Practice your skills against AI personas in challenging roleplay scenarios.</CardDescription>
             </CardHeader>
             <CardContent>
                <Button className="w-full" asChild>
                  <a href="/academy">Enter The Academy</a>
                </Button>
             </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
}
