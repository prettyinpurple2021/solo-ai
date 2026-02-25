"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PlayCircle, BookOpen, Calculator } from "lucide-react";
import { AssessmentDialog } from "./assessment-dialog";

export function ModuleCard({ module, isCompleted }: { module: any; isCompleted: boolean }) {
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${isCompleted ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30'}`}>
       <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
         <div className="flex gap-4">
           <div className={`mt-1 flex items-center justify-center h-8 w-8 rounded-full ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {isCompleted ? <CheckCircle2 size={18} /> : <BookOpen size={16} />}
           </div>
           <div>
             <h3 className="font-semibold text-lg">{module.title}</h3>
             <p className="text-sm text-muted-foreground mt-1 line-clamp-2 md:line-clamp-none">{module.description}</p>
             <div className="flex gap-2 mt-3 text-xs text-muted-foreground font-medium flex-wrap">
               <span className="bg-secondary px-2 py-0.5 rounded-full">{module.duration_minutes} min</span>
               {module.skills_covered?.map((skill: string) => (
                  <span key={skill} className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{skill}</span>
               ))}
             </div>
           </div>
         </div>
         <div className="w-full md:w-auto flex flex-col gap-2 shrink-0">
            <Button variant={isCompleted ? "outline" : "default"} onClick={() => { /* open module content or lesson */ }}>
              {isCompleted ? 'Review Lesson' : 'Start Lesson'}
            </Button>
            {!isCompleted && <Button variant="secondary" onClick={() => setAssessmentOpen(true)}>Take Assessment</Button>}
         </div>
       </div>

       <AssessmentDialog open={assessmentOpen} onOpenChange={setAssessmentOpen} moduleId={module.id} moduleTitle={module.title} />
    </Card>
  );
}
