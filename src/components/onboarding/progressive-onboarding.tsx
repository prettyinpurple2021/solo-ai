"use client"

import { logInfo,} from '@/lib/logger'
import { useState, useEffect,} from "react"
import { motion, AnimatePresence} from "framer-motion"
import { Card, CardContent} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Badge} from "@/components/ui/badge"

import { 
  Sparkles, Crown, ArrowRight, ArrowLeft, Lightbulb, Star, Play, X, SkipForward} from "lucide-react"

interface ProgressiveOnboardingProps {
  open: boolean
  onComplete: () => void
  onSkip: () => void
  userData?: any
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  target: string
  position: "top" | "bottom" | "left" | "right"
  action?: {
    label: string
    onClick: () => void
  }
  optional?: boolean
  estimatedTime?: number
  tips?: string[]
}

export function ProgressiveOnboarding({ open, onComplete, onSkip,}: ProgressiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [userPreferences, setUserPreferences] = useState({
    showAnimations: true,
    autoAdvance: false,
    voiceEnabled: false
  })

  const onboardingSteps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to Your Empire! 👑",
      description: "Let's take a quick tour of your SoloSuccess AI dashboard and get you set up for success!",
      target: ".dashboard-header",
      position: "bottom",
      estimatedTime: 30,
      tips: [
        "This is your command center for everything",
        "Check back daily for motivation and progress",
        "Use the quick actions for fast task creation"
      ]
    },
    {
      id: "create-first-goal",
      title: "Set Your First Goal 🎯",
      description: "Let's create your first goal to get you started on the path to success!",
      target: ".create-goal-button",
      position: "bottom",
      action: {
        label: "Create Goal",
        onClick: () => {
          // This would trigger the goal creation modal
          logInfo("Creating first goal...")
        }
      },
      estimatedTime: 60,
      tips: [
        "Start with 1-3 main goals maximum",
        "Make them specific and measurable",
        "Set realistic timelines"
      ]
    },
    {
      id: "add-first-task",
      title: "Add Your First Task ✨",
      description: "Break down your goal into actionable tasks. This is where the magic happens!",
      target: ".create-task-button",
      position: "bottom",
      action: {
        label: "Add Task",
        onClick: () => {
          // This would trigger the task creation modal
          logInfo("Creating first task...")
        }
      },
      estimatedTime: 45,
      tips: [
        "Break large goals into smaller tasks",
        "Set priorities (high, medium, low)",
        "Add due dates to stay on track"
      ]
    },
    {
      id: "chat-with-ai",
      title: "Meet Your AI Squad 👯‍♀️",
      description: "Start a conversation with one of your AI agents. They're here to help you succeed!",
      target: ".ai-chat-button",
      position: "left",
      action: {
        label: "Start Chat",
        onClick: () => {
          // This would open the AI chat interface
          logInfo("Starting AI chat...")
        }
      },
      estimatedTime: 90,
      tips: [
        "Try asking: 'Help me plan my week'",
        "Each agent has different expertise",
        "They learn from your interactions"
      ]
    },
    {
      id: "explore-analytics",
      title: "Check Your Progress 📊",
      description: "See how you're doing with real-time analytics and insights.",
      target: ".analytics-section",
      position: "top",
      estimatedTime: 30,
      tips: [
        "Check analytics weekly for insights",
        "Look for productivity patterns",
        "Use data to optimize your workflow"
      ]
    },
    {
      id: "upload-file",
      title: "Upload Your First File 📁",
      description: "Add important documents to your briefcase for AI analysis and organization.",
      target: ".upload-file-button",
      position: "bottom",
      action: {
        label: "Upload File",
        onClick: () => {
          // This would trigger the file upload modal
          logInfo("Uploading file...")
        }
      },
      estimatedTime: 60,
      tips: [
        "Upload important business documents",
        "Let AI analyze the content",
        "Use search to find information quickly"
      ]
    },
    {
      id: "complete",
      title: "You're All Set! 🚀",
      description: "Congratulations! You've completed the onboarding and are ready to dominate your industry!",
      target: "body",
      position: "bottom",
      estimatedTime: 30,
      tips: [
        "Keep exploring new features",
        "Set up automations to save time",
        "Join the community for support"
      ]
    }
  ]

  const totalSteps = onboardingSteps.length
  const progress = ((currentStep + 1) / totalSteps) * 100
  const currentStepData = onboardingSteps[currentStep]

  const nextStep = async () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    // Mark current step as complete
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]))
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
    
    // Add small delay for smooth transitions
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipCurrentStep = () => {
    if (currentStep < totalSteps - 1) {
      nextStep()
    }
  }

  const skipAll = () => {
    onSkip()
  }

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
  }, [userPreferences.autoAdvance, isTransitioning, open, currentStep, totalSteps])

  // Keyboard navigation
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
          onSkip()
          break
        case 'h':
        case 'H':
          e.preventDefault()
          setShowTips(prev => !prev)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, currentStep, totalSteps])

  if (!open || !currentStepData) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-dark-card border-2 border-neon-purple/30 shadow-[0_0_30px_rgba(179,0,255,0.2)]">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_15px_rgba(179,0,255,0.3)]">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-orbitron text-white uppercase tracking-wider">Interactive Tour</h2>
                  <p className="text-sm text-gray-400 font-mono">
                    Step {currentStep + 1} of {totalSteps}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowTips(!showTips)} className="text-gray-400 hover:text-neon-cyan">
                  <Lightbulb className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={skipAll} className="text-gray-400 hover:text-neon-orange">
                  <SkipForward className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onSkip} className="text-gray-400 hover:text-neon-magenta">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 font-mono mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-dark-bg rounded-full h-2 border border-gray-700">
                <motion.div
                  className="bg-gradient-to-r from-neon-purple to-neon-magenta h-2 rounded-full shadow-[0_0_10px_rgba(179,0,255,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold font-orbitron text-white mb-2 uppercase tracking-wider">
                    {currentStepData.title}
                  </h3>
                  <p className="text-gray-400 font-mono">
                    {currentStepData.description}
                  </p>
                </div>

                {/* Tips Section */}
                {showTips && currentStepData.tips && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-neon-orange/10 border border-neon-orange/20 rounded-sm p-4"
                  >
                    <h4 className="font-semibold text-neon-orange mb-2 flex items-center gap-2 font-orbitron uppercase tracking-wider">
                      <Star className="h-4 w-4" />
                      Pro Tips
                    </h4>
                    <ul className="space-y-1">
                      {currentStepData.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-300 font-mono flex items-start gap-2">
                          <span className="text-neon-orange mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Time Estimate */}
                {currentStepData.estimatedTime && (
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      ⏱️ {currentStepData.estimatedTime} seconds
                    </Badge>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0 || isTransitioning}
                className="flex items-center gap-2 bg-transparent border-gray-700 text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan font-mono uppercase tracking-wider"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {currentStepData.optional && (
                  <Button variant="ghost" onClick={skipCurrentStep} className="text-sm text-gray-400 hover:text-neon-lime font-mono">
                    Skip This
                  </Button>
                )}
                <Button
                  onClick={currentStepData.action ? currentStepData.action.onClick : nextStep}
                  disabled={isTransitioning}
                  variant="purple"
                  className="flex items-center gap-2 shadow-[0_0_15px_rgba(179,0,255,0.3)] font-orbitron uppercase tracking-wider"
                >
                  {currentStepData.action ? (
                    <>
                      {currentStepData.action.label}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : currentStep === totalSteps - 1 ? (
                    <>
                      <Crown className="h-4 w-4" />
                      Complete Tour
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

            {/* Quick Help */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                <div className="flex items-center gap-4">
                  <span>Press 'H' for tips</span>
                  <span>Use arrow keys to navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUserPreferences(prev => ({ ...prev, showAnimations: !prev.showAnimations }))}
                    className={`flex items-center gap-1 transition-colors ${userPreferences.showAnimations ? 'text-neon-cyan' : 'text-gray-500 hover:text-neon-cyan'}`}
                  >
                    <Sparkles className="h-3 w-3" />
                    Animations
                  </button>
                  <button
                    onClick={() => setUserPreferences(prev => ({ ...prev, autoAdvance: !prev.autoAdvance }))}
                    className={`flex items-center gap-1 transition-colors ${userPreferences.autoAdvance ? 'text-neon-cyan' : 'text-gray-500 hover:text-neon-cyan'}`}
                  >
                    <Play className="h-3 w-3" />
                    Auto-advance
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
