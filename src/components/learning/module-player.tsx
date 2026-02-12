"use client";

import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Circle, Play } from "lucide-react";


interface Module {
  id: string;
  title: string;
  content: string;
  type?: string;
}

interface ModulePlayerProps {
  module: Module;
  onComplete: () => void;
  isCompleted?: boolean;
}

export function ModulePlayer({ module, onComplete, isCompleted = false }: ModulePlayerProps) {
  const [] = useState(false);

  // In a real app, we'd render Markdown or Video here
  // For now, simple text display
  
  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>{module.title}</CardTitle>
          {isCompleted ? (
            <div className="flex items-center text-green-500 text-sm font-medium">
              <CheckCircle className="w-5 h-5 mr-2" />
              Completed
            </div>
          ) : (
            <div className="flex items-center text-muted-foreground text-sm">
              <Circle className="w-5 h-5 mr-2" />
              In Progress
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea className="h-full p-6">
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{module.content}</ReactMarkdown>
            
            {/* Video content support */}
            {module.type === 'video' && (
               <div className="aspect-video bg-muted flex items-center justify-center rounded-lg mt-4 border border-border">
                 <div className="text-center">
                    <Play className="w-12 h-12 opacity-50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Video playback not available in offline mode</p>
                 </div>
               </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t p-4 flex justify-between bg-muted/20">
        <Button variant="ghost" disabled>
          Previous
        </Button>
        <Button onClick={onComplete} disabled={isCompleted}>
          {isCompleted ? "Completed" : "Mark as Complete"}
        </Button>
      </CardFooter>
    </Card>
  );
}
