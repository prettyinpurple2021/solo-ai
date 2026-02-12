"use client"

import { useEffect, useState } from "react"
import { logError } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, PlayCircle, ChevronLeft, ChevronRight, Menu, PartyPopper } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ReactMarkdown from 'react-markdown' // Assuming you have markdown support, if not just render text
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface Module {
  id: string
  title: string
  content?: string // In real app, content might be fetched separately
  order: number
  duration_minutes: number
  status: 'not_started' | 'in_progress' | 'completed'
  module_type: 'article' | 'video' | 'quiz'
}

interface LearningPath {
  id: string
  title: string
  description: string
  modules: Module[]
}

interface CoursePlayerProps {
  pathId: string
}

export function CoursePlayer({ pathId }: CoursePlayerProps) {
  const [path, setPath] = useState<LearningPath | null>(null)
  const [activeModule, setActiveModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [celebrating, setCelebrating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchPath() {
      try {
        const res = await fetch(`/api/academy/paths/${pathId}`)
        if (res.ok) {
          const data = await res.json()
          setPath(data)
          // Find first uncompleted module or just the first one
          const firstUncompleted = data.modules.find((m: Module) => m.status !== 'completed')
          setActiveModule(firstUncompleted || data.modules[0])
        }
      } catch (error) {
        logError("Error fetching path", { error })
      } finally {
        setLoading(false)
      }
    }
    fetchPath()
  }, [pathId])

  const handleCompleteModule = async () => {
    if (!activeModule) return

    try {
        const res = await fetch('/api/academy/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moduleId: activeModule.id, completed: true })
        })

        if (res.ok) {
            // Update local state
            setPath(prev => {
                if (!prev) return null
                return {
                    ...prev,
                    modules: prev.modules.map(m => 
                        m.id === activeModule.id ? { ...m, status: 'completed' } : m
                    )
                }
            })
            setCelebrating(true)
            setTimeout(() => setCelebrating(false), 3000)

            // Auto-advance
            const currentIndex = path?.modules.findIndex(m => m.id === activeModule.id) ?? -1
            if (path && currentIndex < path.modules.length - 1) {
                setActiveModule(path.modules[currentIndex + 1])
            }
        }
    } catch (error) {
        logError("Failed to update progress", { error })
    }
  }

  if (loading) return <div className="p-8 text-center">Loading course content...</div>
  if (!path) return <div className="p-8 text-center">Course not found</div>

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background z-10">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
                <h1 className="text-lg font-bold">{path.title}</h1>
                <p className="text-xs text-muted-foreground">{activeModule?.title}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
             {/* Mobile Menu Trigger */}
             <div className="lg:hidden">
                 <Sheet>
                     <SheetTrigger asChild>
                         <Button variant="outline" size="icon"><Menu className="w-4 h-4" /></Button>
                     </SheetTrigger>
                     <SheetContent side="left">
                         <ModuleList path={path} activeModule={activeModule} onSelect={setActiveModule} />
                     </SheetContent>
                 </Sheet>
             </div>
             <div className="hidden lg:block w-48">
                 <div className="flex justify-between text-xs mb-1">
                     <span>Progress</span>
                     <span>{Math.round((path.modules.filter(m => m.status === 'completed').length / path.modules.length) * 100)}%</span>
                 </div>
                 <Progress value={(path.modules.filter(m => m.status === 'completed').length / path.modules.length) * 100} className="h-2" />
             </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="hidden lg:block w-80 border-r bg-gray-50/50">
            <ScrollArea className="h-full">
                <ModuleList path={path} activeModule={activeModule} onSelect={setActiveModule} />
            </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
            {celebrating && (
                <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-4">
                    <Badge variant="default" className="bg-green-500 text-white px-4 py-2 text-sm shadow-xl">
                        <PartyPopper className="w-4 h-4 mr-2" /> Module Completed! +50 XP
                    </Badge>
                </div>
            )}
            
            <div className="max-w-3xl mx-auto space-y-8">
                {activeModule ? (
                    <>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">{activeModule.title}</h2>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">{activeModule.module_type}</Badge>
                                <span className="text-sm text-muted-foreground">{activeModule.duration_minutes} mins</span>
                            </div>
                        </div>

                        <Card className="p-8 prose prose-indigo max-w-none dark:prose-invert">
                           {/* Content Renderer */}
                           {activeModule.module_type === 'video' ? (
                               <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                                   <PlayCircle className="w-16 h-16 text-white opacity-50" />
                               </div>
                           ) : activeModule.module_type === 'quiz' ? (
                               <QuizRunner 
                                   title={activeModule.title}
                                   questions={parseQuizContent(activeModule.content)}
                                   onComplete={(score, passed) => {
                                       if (passed) {
                                           // Only complete if passed
                                           handleCompleteModule();
                                       } else {
                                           // Optional: Show "Try Again" feedback
                                       }
                                   }}
                               />
                           ) : (
                               <div>
                                   <p>This is a placeholder for the module content. Imagine rich text, images, and interactive elements here.</p>
                                   <p>Learning content for <strong>{activeModule.title}</strong> would appear here.</p>
                                   <div className="mt-8 p-4 bg-muted rounded-md text-sm">
                                       <strong>Module Type:</strong> {activeModule.module_type}
                                   </div>
                               </div>
                           )}
                        </Card>

                        <div className="flex justify-between items-center pt-8 border-t">
                            <Button variant="ghost" disabled={path.modules.indexOf(activeModule) === 0}
                                onClick={() => setActiveModule(path.modules[path.modules.indexOf(activeModule) - 1])}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                            </Button>
                            
                            <Button onClick={handleCompleteModule} className="min-w-[150px]">
                                {activeModule.status === 'completed' ? 'Next Module' : 'Mark as Complete'} <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-muted-foreground mt-20">Select a module to start learning</div>
                )}
            </div>
        </main>
      </div>
    </div>
  )
}

// Importing locally since it's used in the same feature scope
import { QuizRunner, Question } from "./quiz-runner"

// Helper to safely parse quiz content
const parseQuizContent = (content?: string): Question[] => {
    if (!content) return [];
    try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        logError("Failed to parse quiz content", { error: e });
        return [];
    }
};

function ModuleList({ path, activeModule, onSelect }: { path: LearningPath, activeModule: Module | null, onSelect: (m: Module) => void }) {
    return (
        <div className="p-4 space-y-1">
            {path.modules.map((module, index) => {
                const isActive = activeModule?.id === module.id
                const isCompleted = module.status === 'completed'
                
                return (
                    <button
                        key={module.id}
                        onClick={() => onSelect(module)}
                        className={`w-full flex items-start text-left p-3 rounded-lg transition-colors text-sm ${
                            isActive ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-100'
                        }`}
                    >
                        <div className="mt-0.5 mr-3 flex-shrink-0">
                            {isCompleted ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : isActive ? (
                                <PlayCircle className="w-4 h-4 text-indigo-500" />
                            ) : (
                                <Circle className="w-4 h-4 text-gray-300" />
                            )}
                        </div>
                        <div>
                            <span className="block">{module.title}</span>
                            <span className="text-xs text-muted-foreground">{module.duration_minutes} mins</span>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
