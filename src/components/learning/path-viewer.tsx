"use client";

import { useState } from "react";
import { ModulePlayer } from "@/components/learning/module-player";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PathViewerProps {
  path: {
    id: string;
    title: string;
    modules: any[];
  };
  userId: string;
}

export function PathViewer({ path, userId }: PathViewerProps) {
  const router = useRouter();
  const [activeModuleId, setActiveModuleId] = useState<string>(path.modules[0]?.id || "");
  const [modules, setModules] = useState(path.modules);

  const activeModule = modules.find(m => m.id === activeModuleId);

  const handleComplete = async () => {
    if (!activeModule) return;

    try {
      const res = await fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: activeModule.id,
          status: "completed"
        }),
      });

      if (!res.ok) throw new Error("Failed to update progress");

      toast.success("Module completed!");

      // Update local state
      setModules(prev => prev.map(m => 
        m.id === activeModule.id ? { ...m, status: "completed" } : m
      ));

      // Auto-advance to next module
      const currentIndex = modules.findIndex(m => m.id === activeModule.id);
      const nextModule = modules[currentIndex + 1];
      if (nextModule) {
        setActiveModuleId(nextModule.id);
      } else {
        toast.success("Path completed! Congratulations!");
        router.refresh(); // Refresh server data
      }

    } catch (error) {
      toast.error("Error saving progress");
      console.error(error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-100px)]">
      {/* Sidebar: Module List */}
      <div className="lg:col-span-1 border rounded-lg p-4 space-y-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/dashboard/learning">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h2 className="font-semibold truncate">{path.title}</h2>
        </div>

        <div className="space-y-2">
          {modules.map((module, index) => (
            <button
              key={module.id}
              onClick={() => setActiveModuleId(module.id)}
              className={cn(
                "w-full text-left p-3 rounded-md text-sm flex items-start gap-3 transition-colors",
                activeModuleId === module.id 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "hover:bg-muted"
              )}
            >
              <div className="mt-0.5">
                {module.status === "completed" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 text-xs flex items-center justify-center">
                    {index + 1}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="line-clamp-2">{module.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{module.duration_minutes} min</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Player */}
      <div className="lg:col-span-3">
        {activeModule ? (
          <ModulePlayer 
            module={{
              ...activeModule,
              content: activeModule.content || "Content coming soon..." // Fallback if content missing
            }}
            onComplete={handleComplete}
            isCompleted={activeModule.status === "completed"}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a module to start learning
          </div>
        )}
      </div>
    </div>
  );
}
