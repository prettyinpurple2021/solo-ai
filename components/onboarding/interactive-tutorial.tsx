"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Crown, 
  Sparkles, 
  Target, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Rocket, 
  Brain,
  HelpCircle,
  X,
  Play,
  SkipForward,
  Lightbulb,
  Zap,
  TrendingUp,
  FileText,
  Settings,
  Bell,
  Search,
  Plus,
  Star
} from "lucide-react"

interface TutorialStep {
  id: string
  title: string
  description: string
  target: string // CSS selector for the element to highlight
  position: "top" | "bottom" | "left" | "right"
  content: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  optional?: boolean
}

interface InteractiveTutorialProps {
  open: boolean
  onComplete: () => void
  onSkip: () => void
  tutorialType: "dashboard" | "ai-agents" | "tasks" | "goals" | "files" | "complete"
}

export function InteractiveTutorial({ open, onComplete, onSkip, tutorialType }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Tutorial steps for different sections
  const tutorialSteps: Record<string, TutorialStep[]> = {
    dashboard: [
      {
        id: "welcome",
        title: "Welcome to Your Empire! 👑",
        description: "Let's take a quick tour of your SoloBoss AI dashboard",
        target: ".dashboard-header",
        position: "bottom",
        content: (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold boss-heading mb-2">Your Command Center</h3>
              <p className="text-muted-foreground">
                This is where you'll manage your entire business empire. Everything you need is just a click away!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>AI Agents</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-pink-500" />
                <span>Goals & Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-500" />
                <span>Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />
                <span>Files & Docs</span>
              </div>
            </div>
          </div>
        )
      },
      {
        id: "sidebar",
        title: "Your Navigation Hub 🧭",
        description: "The sidebar gives you quick access to all features",
        target: ".sidebar",
        position: "right",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Quick Navigation</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">AI Squad</p>
                  <p className="text-xs text-muted-foreground">Chat with your AI agents</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-pink-50 rounded-lg">
                <Target className="h-5 w-5 text-pink-600" />
                <div>
                  <p className="font-medium text-sm">Goals & Tasks</p>
                  <p className="text-xs text-muted-foreground">Manage your objectives</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-teal-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <div>
                  <p className="font-medium text-sm">Analytics</p>
                  <p className="text-xs text-muted-foreground">Track your progress</p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: "quick-actions",
        title: "Quick Actions ⚡",
        description: "Get things done fast with these shortcuts",
        target: ".quick-actions",
        position: "bottom",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Speed Up Your Workflow</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                AI Chat
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Set Goal
              </Button>
              <Button size="sm" variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              These buttons let you create tasks, chat with AI agents, set goals, and upload files instantly!
            </p>
          </div>
        )
      },
      {
        id: "stats-overview",
        title: "Your Progress at a Glance 📊",
        description: "See how you're crushing your goals",
        target: ".stats-overview",
        position: "top",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Real-Time Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div>
                  <p className="font-bold text-2xl text-purple-600">87%</p>
                  <p className="text-sm text-muted-foreground">Task Completion</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg">
                <div>
                  <p className="font-bold text-2xl text-teal-600">12</p>
                  <p className="text-sm text-muted-foreground">Goals Active</p>
                </div>
                <Target className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your dashboard updates in real-time to show your progress and keep you motivated!
            </p>
          </div>
        )
      }
    ],
    "ai-agents": [
      {
        id: "agents-intro",
        title: "Meet Your AI Squad! 👯‍♀️",
        description: "Your personal team of AI agents ready to help",
        target: ".ai-agents-section",
        position: "bottom",
        content: (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold boss-heading mb-2">Your AI Team</h3>
              <p className="text-muted-foreground">
                Each agent has unique skills and personality. They work 24/7 to help you succeed!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Roxy - Executive Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span>Blaze - Growth Strategist</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span>Echo - Marketing Maven</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Lumi - Legal & Docs</span>
              </div>
            </div>
          </div>
        )
      },
      {
        id: "agent-chat",
        title: "Start a Conversation 💬",
        description: "Click on any agent to start chatting",
        target: ".agent-chat-button",
        position: "left",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Chat with Your AI</h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium">Try asking:</p>
                <p className="text-sm text-muted-foreground">"Help me plan my week"</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <p className="text-sm font-medium">Or:</p>
                <p className="text-sm text-muted-foreground">"What should I focus on today?"</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your AI agents remember your preferences and get smarter over time!
            </p>
          </div>
        ),
        action: {
          label: "Start Chat",
          onClick: () => {
            // This would trigger the chat interface
            console.log("Starting AI chat...")
          }
        }
      }
    ],
    tasks: [
      {
        id: "tasks-intro",
        title: "Task Management Made Easy 📋",
        description: "Organize and track your work efficiently",
        target: ".tasks-section",
        position: "bottom",
        content: (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold boss-heading mb-2">Smart Task Management</h3>
              <p className="text-muted-foreground">
                Create, organize, and track tasks with AI-powered insights and automation.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="w-8 h-8 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xs font-medium">Create</p>
              </div>
              <div>
                <div className="w-8 h-8 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Settings className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xs font-medium">Organize</p>
              </div>
              <div>
                <div className="w-8 h-8 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-xs font-medium">Track</p>
              </div>
            </div>
          </div>
        )
      },
      {
        id: "create-task",
        title: "Create Your First Task ✨",
        description: "Let's create a task together",
        target: ".create-task-button",
        position: "bottom",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Quick Task Creation</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <p className="text-sm font-medium">Voice Input</p>
                <p className="text-xs text-muted-foreground">Just speak to create tasks!</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg">
                <p className="text-sm font-medium">AI Suggestions</p>
                <p className="text-xs text-muted-foreground">Get smart task recommendations</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Click the + button to start creating tasks with voice, text, or AI assistance!
            </p>
          </div>
        ),
        action: {
          label: "Create Task",
          onClick: () => {
            // This would open the task creation modal
            console.log("Creating task...")
          }
        }
      }
    ],
    goals: [
      {
        id: "goals-intro",
        title: "Goal Setting & Achievement 🎯",
        description: "Turn your dreams into actionable goals",
        target: ".goals-section",
        position: "bottom",
        content: (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold boss-heading mb-2">Goal Mastery</h3>
              <p className="text-muted-foreground">
                Set ambitious goals and track your progress with AI-powered insights and motivation.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">SMART goal framework</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span className="text-sm">AI-powered insights</span>
              </div>
            </div>
          </div>
        )
      }
    ],
    files: [
      {
        id: "files-intro",
        title: "Your Digital Briefcase 💼",
        description: "Store and organize all your important files",
        target: ".files-section",
        position: "bottom",
        content: (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold boss-heading mb-2">Smart File Management</h3>
              <p className="text-muted-foreground">
                Upload, organize, and analyze documents with AI-powered content extraction.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Document Upload</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-green-500" />
                <span>AI Search</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span>Content Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-orange-500" />
                <span>Smart Organization</span>
              </div>
            </div>
          </div>
        )
      }
    ],
    complete: [
      {
        id: "completion",
        title: "You're All Set! 🚀",
        description: "Your SoloBoss AI platform is ready to help you succeed",
        target: "body",
        position: "bottom",
        content: (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 via-pink-500 to-teal-500 rounded-full flex items-center justify-center">
              <Rocket className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold boss-heading mb-2">Welcome to Your Empire!</h3>
              <p className="text-muted-foreground mb-4">
                You've completed the tutorial and are ready to start building your business empire with AI-powered productivity tools.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium">Next Steps:</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  <li>• Create your first task</li>
                  <li>• Chat with an AI agent</li>
                  <li>• Set a goal</li>
                </ul>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <p className="font-medium">Pro Tips:</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  <li>• Use voice commands</li>
                  <li>• Explore AI features</li>
                  <li>• Check analytics</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-lg font-semibold empowering-text">
              <Sparkles className="h-5 w-5" />
              Ready to dominate your industry!
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        )
      }
    ]
  }

  const currentSteps = tutorialSteps[tutorialType] || []
  const totalSteps = currentSteps.length
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0

  useEffect(() => {
    if (open && currentSteps.length > 0) {
      highlightCurrentElement()
    }
  }, [open, currentStep, currentSteps])

  const highlightCurrentElement = () => {
    const currentStepData = currentSteps[currentStep]
    if (!currentStepData) return

    const element = document.querySelector(currentStepData.target) as HTMLElement
    if (element) {
      setHighlightedElement(element)
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleNext = () => {
    nextStep()
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTutorial = () => {
    onSkip()
  }

  const currentStepData = currentSteps[currentStep]

  if (!currentStepData) {
    return null
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto boss-card border-2 border-purple-200">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="boss-heading text-xl flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  Interactive Tutorial
                </DialogTitle>
                <DialogDescription>
                  Step {currentStep + 1} of {totalSteps} - {currentStepData.title}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={skipTutorial} className="text-sm">
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip
                </Button>
                <Button variant="ghost" size="sm" onClick={onSkip} className="text-sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </DialogHeader>

          <div className="py-4">
            {currentStepData.content}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentStepData.optional && (
                <Button variant="ghost" onClick={nextStep} className="text-sm">
                  Skip This
                </Button>
              )}
              <Button
                onClick={currentStepData.action ? currentStepData.action.onClick : nextStep}
                className="punk-button text-white flex items-center gap-2"
              >
                {currentStepData.action ? (
                  <>
                    {currentStepData.action.label}
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : currentStep === totalSteps - 1 ? (
                  <>
                    <Rocket className="h-4 w-4" />
                    Complete Tutorial
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Highlight overlay */}
      {highlightedElement && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-40 pointer-events-none"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            className="absolute border-2 border-purple-500 rounded-lg shadow-lg"
            style={{
              top: highlightedElement.offsetTop - 4,
              left: highlightedElement.offsetLeft - 4,
              width: highlightedElement.offsetWidth + 8,
              height: highlightedElement.offsetHeight + 8,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            }}
          />
        </div>
      )}
    </TooltipProvider>
  )
}
