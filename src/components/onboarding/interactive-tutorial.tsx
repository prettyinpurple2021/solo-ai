"use client"
import { logWarn, logInfo,} from '@/lib/logger'
import { useState, useEffect, useRef, useMemo} from "react"
import { useUserPreferences } from "@/hooks/use-user-preferences"
import { Button} from "@/components/ui/button"
import { Progress} from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import { TooltipProvider} from "@/components/ui/tooltip"

import { 
  Crown, Sparkles, Target, Users, ArrowRight, ArrowLeft, CheckCircle, Rocket, Brain, X, Lightbulb, Zap, TrendingUp, FileText, Settings, Search, Plus, Star, SkipForward} from "lucide-react"

interface TutorialStep {
  id: string
  title: string
  description: string
  target: string // CSS selector for the element to highlight
  position: "top" | "bottom" | "left" | "right"
  content: any
  action?: {
    label: string
    onClick: () => void
  }
  optional?: boolean
  estimatedTime?: number // Estimated time to complete this step
  difficulty?: "easy" | "medium" | "hard" // Step difficulty level
  tags?: string[] // Tags for categorization
}

interface InteractiveTutorialProps {
  open: boolean
  onCompleteAction: () => void
  onSkipAction: () => void
  tutorialType: "dashboard" | "ai-agents" | "tasks" | "goals" | "files" | "complete"
  customSteps?: TutorialStep[] // Allow custom tutorial steps
  showProgressBar?: boolean // Toggle progress bar visibility
  allowSkipping?: boolean // Allow users to skip steps
  showTimeEstimates?: boolean // Show estimated completion times
  onStepChange?: (stepIndex: number, stepData: TutorialStep) => void // Callback for step changes
}

export function InteractiveTutorial({ 
  open, 
  onCompleteAction, 
  onSkipAction, 
  tutorialType,
  customSteps,
  showProgressBar = true,
  allowSkipping = true,
  showTimeEstimates = false,
  onStepChange
}: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [showTips, setShowTips] = useState(false)
  const [userPreferences, setUserPreferences] = useState({
    showAnimations: true,
    autoAdvance: false,
    voiceEnabled: false
  })
  const overlayRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Tutorial steps for different sections
  const tutorialSteps: Record<string, TutorialStep[]> = {
    dashboard: [
      {
        id: "welcome",
        title: "Welcome to Your Empire! 👑",
        description: "Let's take a quick tour of your SoloSuccess AI dashboard",
        target: ".dashboard-header",
        position: "bottom",
        estimatedTime: 30,
        difficulty: "easy",
        tags: ["welcome", "overview"],
        content: (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-neon-purple/20 border border-neon-purple/50 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(179,0,255,0.3)]">
                <Crown className="h-8 w-8 text-neon-purple" />
              </div>
              <h3 className="text-xl font-bold font-orbitron text-white uppercase tracking-wider mb-2">Your Command Center</h3>
              <p className="text-gray-400 font-mono text-sm">
                This is where you&apos;ll manage your entire business empire. Everything you need is just a click away!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm font-mono">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-neon-cyan" />
                <span>AI Agents</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-neon-lime" />
                <span>Goals & Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-neon-purple" />
                <span>Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-neon-orange" />
                <span>Files & Docs</span>
              </div>
            </div>
            {showTimeEstimates && (
              <div className="text-center p-2 bg-neon-purple/10 rounded-sm border border-neon-purple/20">
                <p className="text-xs text-neon-purple font-mono">⏱️ Estimated time: 30 seconds</p>
              </div>
            )}
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
            <h3 className="text-lg font-bold font-orbitron text-white">Quick Navigation</h3>
            <div className="space-y-3 font-mono">
              <div className="flex items-center gap-3 p-2 bg-neon-purple/10 border border-neon-purple/20 rounded-sm">
                <Users className="h-5 w-5 text-neon-purple" />
                <div>
                  <p className="font-medium text-sm text-neon-purple">AI Squad</p>
                  <p className="text-xs text-gray-400">Chat with your AI agents</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-sm">
                <Target className="h-5 w-5 text-neon-cyan" />
                <div>
                  <p className="font-medium text-sm text-neon-cyan">Goals & Tasks</p>
                  <p className="text-xs text-gray-400">Manage your objectives</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-neon-lime/10 border border-neon-lime/20 rounded-sm">
                <TrendingUp className="h-5 w-5 text-neon-lime" />
                <div>
                  <p className="font-medium text-sm text-neon-lime">Analytics</p>
                  <p className="text-xs text-gray-400">Track your progress</p>
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
            <h3 className="text-lg font-bold font-orbitron text-white">Speed Up Your Workflow</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button size="sm" className="w-full" variant="lime">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
              <Button size="sm" variant="outline" className="w-full border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10">
                <Users className="h-4 w-4 mr-2" />
                AI Chat
              </Button>
              <Button size="sm" variant="outline" className="w-full border-neon-purple text-neon-purple hover:bg-neon-purple/10">
                <Target className="h-4 w-4 mr-2" />
                Set Goal
              </Button>
              <Button size="sm" variant="outline" className="w-full border-neon-orange text-neon-orange hover:bg-neon-orange/10">
                <FileText className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
            <p className="text-sm text-gray-400 font-mono">
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
            <h3 className="text-lg font-bold font-orbitron text-white">Real-Time Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-neon-purple/10 border border-neon-purple/20 rounded-sm">
                <div>
                  <p className="font-bold text-2xl text-neon-purple font-orbitron">87%</p>
                  <p className="text-sm text-gray-400 font-mono">Task Completion</p>
                </div>
                <CheckCircle className="h-8 w-8 text-neon-purple" />
              </div>
              <div className="flex items-center justify-between p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-sm">
                <div>
                  <p className="font-bold text-2xl text-neon-cyan font-orbitron">12</p>
                  <p className="text-sm text-gray-400 font-mono">Goals Active</p>
                </div>
                <Target className="h-8 w-8 text-neon-cyan" />
              </div>
            </div>
            <p className="text-sm text-gray-400 font-mono">
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
              <div className="w-16 h-16 mx-auto bg-neon-magenta/20 border border-neon-magenta/50 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,0,110,0.3)]">
                <Users className="h-8 w-8 text-neon-magenta" />
              </div>
              <h3 className="text-xl font-bold font-orbitron text-white uppercase tracking-wider mb-2">Your AI Team</h3>
              <p className="text-gray-400 font-mono text-sm">
                Each agent has unique skills and personality. They work 24/7 to help you succeed!
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-neon-purple rounded-full shadow-[0_0_5px_rgba(179,0,255,0.8)]"></div>
                <span>Roxy - Executive Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-neon-magenta rounded-full shadow-[0_0_5px_rgba(255,0,110,0.8)]"></div>
                <span>Blaze - Growth Strategist</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-neon-cyan rounded-full shadow-[0_0_5px_rgba(11,228,236,0.8)]"></div>
                <span>Echo - Marketing Maven</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-neon-orange rounded-full shadow-[0_0_5px_rgba(255,102,0,0.8)]"></div>
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
            <h3 className="text-lg font-bold font-orbitron text-white">Chat with Your AI</h3>
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-neon-purple/10 border border-neon-purple/20 rounded-sm">
                <p className="text-sm font-medium text-neon-purple">Try asking:</p>
                <p className="text-sm text-gray-400">&quot;Help me plan my week&quot;</p>
              </div>
              <div className="p-3 bg-neon-magenta/10 border border-neon-magenta/20 rounded-sm">
                <p className="text-sm font-medium text-neon-magenta">Or:</p>
                <p className="text-sm text-gray-400">&quot;What should I focus on today?&quot;</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 font-mono">
              Your AI agents remember your preferences and get smarter over time!
            </p>
          </div>
        ),
        action: {
          label: "Start Chat",
          onClick: () => {
            // This would trigger the chat interface
            logInfo("Starting AI chat...")
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
              <div className="w-16 h-16 mx-auto bg-neon-cyan/20 border border-neon-cyan/50 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(11,228,236,0.3)]">
                <Target className="h-8 w-8 text-neon-cyan" />
              </div>
              <h3 className="text-xl font-bold font-orbitron text-white uppercase tracking-wider mb-2">Smart Task Management</h3>
              <p className="text-gray-400 font-mono text-sm">
                Create, organize, and track tasks with AI-powered insights and automation.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div>
                <div className="w-8 h-8 mx-auto bg-neon-lime/10 border border-neon-lime/50 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="h-4 w-4 text-neon-lime" />
                </div>
                <p className="text-xs font-medium text-gray-400">Create</p>
              </div>
              <div>
                <div className="w-8 h-8 mx-auto bg-neon-cyan/10 border border-neon-cyan/50 rounded-full flex items-center justify-center mb-2">
                  <Settings className="h-4 w-4 text-neon-cyan" />
                </div>
                <p className="text-xs font-medium text-gray-400">Organize</p>
              </div>
              <div>
                <div className="w-8 h-8 mx-auto bg-neon-purple/10 border border-neon-purple/50 rounded-full flex items-center justify-center mb-2">
                  <TrendingUp className="h-4 w-4 text-neon-purple" />
                </div>
                <p className="text-xs font-medium text-gray-400">Track</p>
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
            <h3 className="text-lg font-bold font-orbitron text-white">Quick Task Creation</h3>
            <div className="space-y-3 font-mono">
              <div className="p-3 bg-neon-purple/10 border border-neon-purple/20 rounded-sm">
                <p className="text-sm font-medium text-neon-purple">Voice Input</p>
                <p className="text-xs text-gray-400">Just speak to create tasks!</p>
              </div>
              <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-sm">
                <p className="text-sm font-medium text-neon-cyan">AI Suggestions</p>
                <p className="text-xs text-gray-400">Get smart task recommendations</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 font-mono">
              Click the + button to start creating tasks with voice, text, or AI assistance!
            </p>
          </div>
        ),
        action: {
          label: "Create Task",
          onClick: () => {
            // This would open the task creation modal
            logInfo("Creating task...")
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
              <div className="w-16 h-16 mx-auto bg-neon-orange/20 border border-neon-orange/50 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,102,0,0.3)]">
                <Target className="h-8 w-8 text-neon-orange" />
              </div>
              <h3 className="text-xl font-bold font-orbitron text-white uppercase tracking-wider mb-2">Goal Mastery</h3>
              <p className="text-gray-400 font-mono text-sm">
                Set ambitious goals and track your progress with AI-powered insights and motivation.
              </p>
            </div>
            <div className="space-y-2 font-mono">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-neon-yellow" />
                <span className="text-sm">SMART goal framework</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-neon-lime" />
                <span className="text-sm">Progress tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-neon-purple" />
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
              <div className="w-16 h-16 mx-auto bg-neon-purple/20 border border-neon-purple/50 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(179,0,255,0.3)]">
                <FileText className="h-8 w-8 text-neon-purple" />
              </div>
              <h3 className="text-xl font-bold font-orbitron text-white uppercase tracking-wider mb-2">Smart File Management</h3>
              <p className="text-gray-400 font-mono text-sm">
                Upload, organize, and analyze documents with AI-powered content extraction.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm font-mono">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-neon-cyan" />
                <span>Document Upload</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-neon-lime" />
                <span>AI Search</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-neon-purple" />
                <span>Content Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-neon-orange" />
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
        description: "Your SoloSuccess AI platform is ready to help you succeed",
        target: "body",
        position: "bottom",
        content: (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 mx-auto bg-neon-cyan/20 border border-neon-cyan/50 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(11,228,236,0.3)]">
              <Rocket className="h-10 w-10 text-neon-cyan" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-orbitron text-white uppercase tracking-wider mb-2">Welcome to Your Empire!</h3>
              <p className="text-gray-400 font-mono mb-4 text-sm">
                You&apos;ve completed the tutorial and are ready to start building your business empire with AI-powered productivity tools.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm font-mono">
              <div className="p-3 bg-neon-purple/10 border border-neon-purple/20 rounded-sm">
                <p className="font-medium text-neon-purple">Next Steps:</p>
                <ul className="text-xs text-gray-400 mt-1 space-y-1 text-left pl-2">
                  <li>• Create your first task</li>
                  <li>• Chat with an AI agent</li>
                  <li>• Set a goal</li>
                </ul>
              </div>
              <div className="p-3 bg-neon-magenta/10 border border-neon-magenta/20 rounded-sm">
                <p className="font-medium text-neon-magenta">Pro Tips:</p>
                <ul className="text-xs text-gray-400 mt-1 space-y-1 text-left pl-2">
                  <li>• Use voice commands</li>
                  <li>• Explore AI features</li>
                  <li>• Check analytics</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-lg font-bold font-orbitron text-neon-lime uppercase tracking-wide">
              <Sparkles className="h-5 w-5" />
              Ready to dominate!
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        )
      }
    ]
  }

  // Use custom steps if provided, otherwise use default steps
  const finalSteps = useMemo(() => customSteps || tutorialSteps[tutorialType] || [], [customSteps, tutorialType])
  
  // Performance optimizations with useMemo
  const currentSteps = useMemo(() => finalSteps, [finalSteps])
  const totalSteps = useMemo(() => currentSteps.length, [currentSteps])
  const progress = useMemo(() => totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0, [currentStep, totalSteps])

  // Calculate estimated completion time
  const estimatedTotalTime = useMemo(() => {
    return currentSteps.reduce((total, step) => total + (step.estimatedTime || 0), 0)
  }, [currentSteps])

  // Use database preferences for tutorial progress
  const { preferences, setPreference } = useUserPreferences({
    defaultValues: {
      tutorialProgress: {},
      tutorialPreferences: {
        showAnimations: true,
        autoAdvance: false,
        voiceEnabled: false
      }
    },
    fallbackToLocalStorage: true
  })
  
  const tutorialKey = `tutorial-${tutorialType}`
  const currentTutorialProgress = preferences.tutorialProgress?.[tutorialKey] || {}
  
  // Load saved progress on mount
  useEffect(() => {
    if (open) {
      try {
        const { step, completed, startTime: savedStartTime } = currentTutorialProgress
        setCurrentStep(step || 0)
        setCompletedSteps(new Set(completed || []))
        if (savedStartTime) {
          setStartTime(new Date(savedStartTime))
        } else {
          setStartTime(new Date())
        }
        
        // Load user preferences
        const savedPreferences = preferences.tutorialPreferences || {}
        setUserPreferences(prev => ({ ...prev, ...savedPreferences }))
      } catch (error) {
        logWarn('Failed to load tutorial progress:', error)
        setStartTime(new Date())
      }
    }
  }, [open, currentTutorialProgress, preferences.tutorialPreferences])

  // Save progress on step change
  useEffect(() => {
    if (open && startTime) {
      try {
        const progressData = {
          step: currentStep,
          completed: Array.from(completedSteps),
          startTime: startTime.toISOString(),
          lastUpdated: new Date().toISOString()
        }
        
        // Update tutorial progress
        const newProgress = {
          ...preferences.tutorialProgress,
          [tutorialKey]: progressData
        }
        
        setPreference('tutorialProgress', newProgress).catch(error => {
          logWarn('Failed to save tutorial progress:', error)
        })
        
        // Save user preferences
        setPreference('tutorialPreferences', userPreferences).catch(error => {
          logWarn('Failed to save tutorial preferences:', error)
        })
      } catch (error) {
        logWarn('Failed to save tutorial progress:', error)
      }
    }
  }, [open, currentStep, completedSteps, startTime, tutorialKey, userPreferences, preferences.tutorialProgress, setPreference])

  // Tutorial analytics tracking
  const trackTutorialEvent = (event: string, data?: any) => {
    try {
      // You can integrate this with your analytics service
      logInfo('Tutorial Event:', { event, tutorialType, step: currentStep, data })
      
      // Example: Send to analytics service
      // analytics.track('tutorial_event', { event, tutorialType, step: currentStep, data })
      
      // Example: Send to Google Analytics 4
      // if (typeof gtag !== 'undefined') {
      //   gtag('event', 'tutorial_event', {
      //     event_category: 'tutorial',
      //     event_label: tutorialType,
      //     value: currentStep,
      //     custom_parameters: data
      //   })
      // }
    } catch (error) {
      logWarn('Failed to track tutorial event:', error)
    }
  }

  // Voice command integration hints
  const voiceCommands = useMemo(() => [
    { command: "next", action: "Go to next step" },
    { command: "previous", action: "Go to previous step" },
    { command: "skip", action: "Skip current step" },
    { command: "close", action: "Close tutorial" },
    { command: "tips", action: "Show/hide tips" },
    { command: "help", action: "Show help" }
  ], [])

  // Enhanced error handling and element highlighting
  useEffect(() => {
    if (open && currentSteps.length > 0) {
      const currentStepData = currentSteps[currentStep]
      if (!currentStepData) return

      // Add error handling for missing elements
      const element = document.querySelector(currentStepData.target) as HTMLElement
      if (!element) {
        logWarn(`Tutorial target element not found: ${currentStepData.target}`)
        trackTutorialEvent('element_not_found', { target: currentStepData.target })
        
        // Try to find alternative elements or show helpful message
        const alternativeElements = document.querySelectorAll('[data-tutorial-target]')
        if (alternativeElements.length > 0) {
          logInfo('Found alternative tutorial targets:', alternativeElements)
        }
        return
      }
      
      if (highlightRef.current) {
        setHighlightedElement(element)
        
        // Add try-catch for scroll behavior
        try {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        } catch (error) {
          logWarn('Smooth scroll not supported, using fallback')
          element.scrollIntoView()
        }
        
        // Set position with error handling using getBoundingClientRect
        const rect = element.getBoundingClientRect()
        if (highlightRef.current) {
          highlightRef.current.style.setProperty('--highlight-top', `${rect.top - 4}px`)
          highlightRef.current.style.setProperty('--highlight-left', `${rect.left - 4}px`)
          highlightRef.current.style.setProperty('--highlight-width', `${rect.width + 8}px`)
          highlightRef.current.style.setProperty('--highlight-height', `${rect.height + 8}px`)
        }
        
        // Track step view
        trackTutorialEvent('step_viewed', { stepId: currentStepData.id, stepTitle: currentStepData.title })
        
        // Call step change callback
        onStepChange?.(currentStep, currentStepData)
      }
    }
  }, [open, currentStep, currentSteps, onStepChange])

  // Keyboard navigation for better accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          nextStep()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prevStep()
          break
        case 'Escape':
          e.preventDefault()
          onSkipAction()
          break
        case 'h':
        case 'H':
          e.preventDefault()
          setShowTips(prev => !prev)
          break
        case '?':
          e.preventDefault()
          setShowTips(true)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, currentStep, totalSteps])

  // Auto-advance functionality
  useEffect(() => {
    if (userPreferences.autoAdvance && !isTransitioning && open) {
      const timer = setTimeout(() => {
        if (currentStep < totalSteps - 1) {
          nextStep()
        }
      }, 5000) // Auto-advance after 5 seconds

      return () => clearTimeout(timer)
    }
    return undefined
  }, [userPreferences.autoAdvance, isTransitioning, open, currentStep, totalSteps])

  // Cleanup effect
  useEffect(() => {
    return () => {
      setHighlightedElement(null)
      setCompletedSteps(new Set())
    }
  }, [])

  // Enhanced step management with completion tracking
  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
    trackTutorialEvent('step_completed', { stepId })
  }
  
  const nextStep = async () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    // Mark current step as complete
    const currentStepData = currentSteps[currentStep]
    if (currentStepData) {
      markStepComplete(currentStepData.id)
    }
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Track tutorial completion
      const completionTime = startTime ? new Date().getTime() - startTime.getTime() : 0
      trackTutorialEvent('tutorial_completed', { 
        duration: completionTime,
        totalSteps,
        completedSteps: Array.from(completedSteps)
      })
      onCompleteAction()
    }
    
    // Add small delay for smooth transitions
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      trackTutorialEvent('step_previous', { stepId: currentSteps[currentStep]?.id })
    }
  }

  const skipTutorial = () => {
    trackTutorialEvent('tutorial_skipped', { 
      currentStep, 
      completedSteps: Array.from(completedSteps),
      startTime: startTime?.toISOString()
    })
    onSkipAction()
  }

  const skipCurrentStep = () => {
    if (currentStep < totalSteps - 1) {
      nextStep()
    }
  }

  const toggleUserPreference = (key: keyof typeof userPreferences) => {
    setUserPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const resetTutorial = () => {
    setCurrentStep(0)
    setCompletedSteps(new Set())
    setStartTime(new Date())
    trackTutorialEvent('tutorial_reset')
  }

  const currentStepData = currentSteps[currentStep]

  if (!currentStepData) {
    return null
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-dark-bg border-2 border-neon-cyan/20 mx-4 sm:mx-auto shadow-[0_0_50px_rgba(11,228,236,0.1)]">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="font-orbitron text-xl flex items-center gap-2 text-white uppercase tracking-wider">
                  <Lightbulb className="h-5 w-5 text-neon-yellow" />
                  Interactive Tutorial
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-gray-400 font-mono mt-2">
                  Step {currentStep + 1} of {totalSteps} - <span className="text-neon-cyan">{currentStepData.title}</span>
                </DialogDescription>
                {showTimeEstimates && (
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    ⏱️ {currentStepData.estimatedTime || 0}s • Total: ~{Math.round(estimatedTotalTime / 60)}m
                  </p>
                )}
                {currentStepData.difficulty && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 font-mono">Difficulty:</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-mono ${
                      currentStepData.difficulty === 'easy' ? 'bg-neon-lime/10 text-neon-lime border border-neon-lime/20' :
                      currentStepData.difficulty === 'medium' ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20' :
                      'bg-neon-orange/10 text-neon-orange border border-neon-orange/20'
                    }`}>
                      {currentStepData.difficulty}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {allowSkipping && (
                  <Button variant="ghost" size="sm" onClick={skipTutorial} className="text-sm hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors text-gray-400 font-mono">
                    <SkipForward className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Skip</span>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={onSkipAction} className="text-sm hover:bg-neon-orange/10 hover:text-neon-orange transition-colors text-gray-400">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {showProgressBar && <Progress value={progress} className="w-full h-1 bg-dark-card" indicatorClassName="bg-neon-cyan shadow-[0_0_10px_rgba(11,228,236,0.5)]" />}
          </DialogHeader>

          {/* Quick Tips Section */}
          {showTips && (
            <div className="p-3 bg-neon-purple/5 border border-neon-purple/20 rounded-sm mb-4">
              <h4 className="font-medium text-sm text-neon-purple mb-2 font-orbitron">💡 Quick Tips:</h4>
              <ul className="text-xs text-gray-400 space-y-1 font-mono pl-2">
                <li>• Use arrow keys or spacebar to navigate</li>
                <li>• Press 'H' to toggle this tips panel</li>
                <li>• Press 'Escape' to close tutorial</li>
                <li>• Press '?' for help</li>
                <li>• Voice commands coming soon! 🎤</li>
              </ul>
              
              {/* Voice Commands Preview */}
              <div className="mt-3 pt-3 border-t border-neon-purple/20">
                <h5 className="font-medium text-xs text-neon-purple mb-2 font-orbitron">🎤 Voice Commands (Coming Soon):</h5>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {voiceCommands.map((cmd, index) => (
                    <div key={index} className="flex justify-between hover:bg-neon-purple/5 p-1 rounded transition-colors">
                      <span className="text-gray-300">"{cmd.command}"</span>
                      <span className="text-gray-500">{cmd.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="py-4">
            {currentStepData.content}
          </div>

          <div className="flex flex-col sm:flex-row justify-between pt-4 border-t border-neon-cyan/20 gap-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || isTransitioning}
              className="flex items-center gap-2 bg-transparent border-neon-cyan/20 text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan transition-colors order-2 sm:order-1 font-mono text-xs uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              {currentStepData.optional && allowSkipping && (
                <Button variant="ghost" onClick={skipCurrentStep} className="hover:bg-neon-lime/10 hover:text-neon-lime transition-colors text-gray-400 font-mono text-xs uppercase tracking-wider">
                  Skip This
                </Button>
              )}
              <Button
                onClick={currentStepData.action ? currentStepData.action.onClick : nextStep}
                disabled={isTransitioning}
                variant="cyan"
                className="flex items-center gap-2 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-orbitron text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(11,228,236,0.3)] hover:shadow-[0_0_25px_rgba(11,228,236,0.5)]"
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

          {/* User Preferences Footer */}
          <div className="pt-3 border-t border-neon-cyan/10 mt-2">
            <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleUserPreference('showAnimations')}
                  className={`flex items-center gap-1 transition-colors hover:text-neon-cyan ${userPreferences.showAnimations ? 'text-neon-cyan' : ''}`}
                >
                  <Sparkles className="h-3 w-3" />
                  Animations
                </button>
                <button
                  onClick={() => toggleUserPreference('autoAdvance')}
                  className={`flex items-center gap-1 transition-colors hover:text-neon-cyan ${userPreferences.autoAdvance ? 'text-neon-cyan' : ''}`}
                >
                  <ArrowRight className="h-3 w-3" />
                  Auto-advance
                </button>
                <button
                  onClick={resetTutorial}
                  className="hover:text-neon-purple transition-colors"
                  title="Reset tutorial progress"
                >
                  🔄 Reset
                </button>
              </div>
              <button
                onClick={() => setShowTips(prev => !prev)}
                className="text-neon-purple hover:text-neon-magenta transition-colors"
              >
                Press 'H' for tips
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Highlight overlay */}
      {highlightedElement && userPreferences.showAnimations && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-40 pointer-events-none tutorial-overlay backdrop-blur-[1px]"
        >
          <div
            ref={highlightRef}
            className="absolute border-2 border-neon-cyan rounded-lg shadow-[0_0_30px_rgba(11,228,236,0.5)] tutorial-highlight tutorial-highlight-position animate-pulse bg-neon-cyan/5"
          />
        </div>
      )}
    </TooltipProvider>
  )
}
