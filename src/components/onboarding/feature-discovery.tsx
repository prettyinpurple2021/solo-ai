"use client"

import { useState, useEffect, useRef} from "react"
import { motion, AnimatePresence} from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Badge} from "@/components/ui/badge"
import { Progress} from "@/components/ui/progress"
import { 
  Sparkles, Target, Users, Brain, FileText, TrendingUp, Zap, Crown, CheckCircle, ArrowRight, ArrowLeft, Lightbulb, Star, Gift, Play, Pause, Volume2, VolumeX} from "lucide-react"

interface FeatureDiscoveryProps {
  open: boolean
  onComplete: () => void
  onSkip: () => void
  userPreferences?: any
}

export function FeatureDiscovery({ open, onComplete, onSkip, userPreferences }: FeatureDiscoveryProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [completedFeatures, setCompletedFeatures] = useState<Set<string>>(new Set())
  const [showTips, setShowTips] = useState(false)

  const features = [
    {
      id: "dashboard",
      title: "Your Command Center",
      subtitle: "Everything you need in one place",
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      description: "Your personalized dashboard shows real-time stats, today's tasks, active goals, and AI insights.",
      highlights: [
        "Real-time productivity metrics",
        "Today's priority tasks",
        "Active goal progress",
        "AI-powered insights"
      ],
      tips: [
        "Check your dashboard daily for motivation",
        "Use the quick actions for fast task creation",
        "Monitor your streak to stay consistent"
      ],
      demo: {
        type: "interactive",
        steps: [
          "Click on any stat card to see detailed analytics",
          "Use the quick action buttons to create tasks instantly",
          "Scroll down to see your recent AI conversations"
        ]
      }
    },
    {
      id: "ai-agents",
      title: "Your AI Squad",
      subtitle: "8 specialized agents ready to help",
      icon: Users,
      color: "from-pink-500 to-purple-500",
      description: "Meet your personal AI team - each with unique skills and personality to help you succeed.",
      highlights: [
        "Roxy - Strategic Decision Architect",
        "Blaze - Growth Strategist", 
        "Echo - Marketing Maven",
        "Lumi - Guardian AI & Compliance"
      ],
      tips: [
        "Start conversations with specific questions",
        "Each agent has different expertise areas",
        "They learn from your interactions over time"
      ],
      demo: {
        type: "conversation",
        steps: [
          "Click on any agent to start a conversation",
          "Try asking: 'Help me plan my week'",
          "Ask follow-up questions for deeper insights"
        ]
      }
    },
    {
      id: "goals-tasks",
      title: "Goal & Task Mastery",
      subtitle: "Turn dreams into achievements",
      icon: Target,
      color: "from-teal-500 to-blue-500",
      description: "Set ambitious goals and break them down into actionable tasks with AI-powered insights.",
      highlights: [
        "SMART goal framework",
        "AI task suggestions",
        "Progress tracking",
        "Priority management"
      ],
      tips: [
        "Set 3-5 main goals maximum",
        "Break large goals into smaller tasks",
        "Review and adjust weekly"
      ],
      demo: {
        type: "creation",
        steps: [
          "Click 'Create Goal' to set your first objective",
          "Add tasks to break down your goal",
          "Set due dates and priorities"
        ]
      }
    },
    {
      id: "analytics",
      title: "Performance Insights",
      subtitle: "Data-driven success tracking",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      description: "Get detailed analytics on your productivity patterns, goal progress, and AI usage.",
      highlights: [
        "Productivity trends",
        "Goal completion rates",
        "AI interaction patterns",
        "Wellness insights"
      ],
      tips: [
        "Check analytics weekly for insights",
        "Look for patterns in your productivity",
        "Use data to optimize your workflow"
      ],
      demo: {
        type: "exploration",
        steps: [
          "Navigate to the Analytics section",
          "Explore different time periods",
          "Look for productivity patterns"
        ]
      }
    },
    {
      id: "briefcase",
      title: "Smart File Management",
      subtitle: "Your digital workspace",
      icon: FileText,
      color: "from-indigo-500 to-purple-500",
      description: "Upload, organize, and analyze documents with AI-powered content extraction and search.",
      highlights: [
        "AI content analysis",
        "Smart organization",
        "Quick search",
        "Template generation"
      ],
      tips: [
        "Upload important documents for AI analysis",
        "Use the search feature to find content quickly",
        "Create templates from your best documents"
      ],
      demo: {
        type: "upload",
        steps: [
          "Click 'Upload File' to add documents",
          "Let AI analyze the content",
          "Use search to find specific information"
        ]
      }
    },
    {
      id: "automation",
      title: "Smart Automation",
      subtitle: "Work smarter, not harder",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      description: "Automate repetitive tasks and workflows with AI-powered automation tools.",
      highlights: [
        "Task automation",
        "Workflow optimization",
        "Smart scheduling",
        "AI suggestions"
      ],
      tips: [
        "Start with simple automations",
        "Let AI suggest optimization opportunities",
        "Review and refine regularly"
      ],
      demo: {
        type: "setup",
        steps: [
          "Explore automation options in settings",
          "Set up your first automation rule",
          "Test and refine the automation"
        ]
      }
    }
  ]

  const totalFeatures = features.length
  const progress = ((currentFeature + 1) / totalFeatures) * 100

  const nextFeature = () => {
    if (currentFeature < totalFeatures - 1) {
      setCurrentFeature(currentFeature + 1)
    } else {
      onComplete()
    }
  }

  const prevFeature = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1)
    }
  }

  const markFeatureComplete = (featureId: string) => {
    setCompletedFeatures(prev => new Set([...prev, featureId]))
  }

  const currentFeatureData = features[currentFeature]

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-dark-card border-2 border-neon-purple/30 shadow-[0_0_30px_rgba(179,0,255,0.2)]">
          <CardHeader className="pb-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-orbitron text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${currentFeatureData.color} flex items-center justify-center shadow-[0_0_15px_rgba(179,0,255,0.3)]`}>
                    <currentFeatureData.icon className="h-5 w-5 text-white" />
                  </div>
                  {currentFeatureData.title}
                </CardTitle>
                <p className="text-gray-400 font-mono mt-1">{currentFeatureData.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowTips(!showTips)} className="text-gray-400 hover:text-neon-cyan">
                  <Lightbulb className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={onSkip} className="text-sm text-gray-400 hover:text-neon-magenta font-mono">
                  Skip Tour
                </Button>
              </div>
            </div>
            <Progress value={progress} className="w-full mt-4 bg-dark-bg" indicatorClassName="bg-gradient-to-r from-neon-purple to-neon-magenta shadow-[0_0_10px_rgba(179,0,255,0.5)]" />
          </CardHeader>

          <CardContent className="py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Feature Description */}
              <div className="space-y-6">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-lg text-gray-400 font-mono mb-6">
                    {currentFeatureData.description}
                  </p>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold font-orbitron text-white uppercase tracking-wider">Key Features:</h3>
                    {currentFeatureData.highlights.map((highlight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="flex items-center gap-3 p-3 bg-neon-purple/10 border border-neon-purple/20 rounded-sm"
                      >
                        <CheckCircle className="h-5 w-5 text-neon-purple flex-shrink-0" />
                        <span className="text-sm text-gray-300 font-mono">{highlight}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Interactive Guide */}
              <div className="space-y-6">
                <motion.div
                  key={`guide-${currentFeature}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-dark-card border-2 border-dashed border-gray-700 rounded-sm p-6"
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold font-orbitron text-white mb-2 uppercase tracking-wider">Quick Start Guide</h3>
                    <p className="text-sm text-gray-400 font-mono">
                      {currentFeatureData.demo.type === "interactive" && "Click around to explore"}
                      {currentFeatureData.demo.type === "conversation" && "Start a conversation"}
                      {currentFeatureData.demo.type === "creation" && "Create something new"}
                      {currentFeatureData.demo.type === "exploration" && "Explore the features"}
                      {currentFeatureData.demo.type === "upload" && "Upload a file"}
                      {currentFeatureData.demo.type === "setup" && "Set up automation"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {currentFeatureData.demo.steps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.3 }}
                        className="flex items-center gap-3 p-3 bg-dark-bg border border-gray-700 rounded-sm"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-neon-purple to-neon-magenta flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(179,0,255,0.5)]">
                          {index + 1}
                        </div>
                        <span className="text-sm text-gray-300 font-mono">{step}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Button
                      onClick={() => markFeatureComplete(currentFeatureData.id)}
                      variant="purple"
                      className="shadow-[0_0_15px_rgba(179,0,255,0.3)]"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      I've Completed This Step
                    </Button>
                  </div>
                </motion.div>

                {/* Pro Tips */}
                {showTips && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-neon-orange/10 border border-neon-orange/20 rounded-sm p-4"
                  >
                    <h4 className="font-semibold text-neon-orange mb-3 flex items-center gap-2 font-orbitron uppercase tracking-wider">
                      <Star className="h-4 w-4" />
                      Pro Tips
                    </h4>
                    <ul className="space-y-2">
                      {currentFeatureData.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-300 font-mono flex items-start gap-2">
                          <span className="text-neon-orange mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>
          </CardContent>

          <div className="flex justify-between items-center p-6 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={prevFeature}
              disabled={currentFeature === 0}
              className="flex items-center gap-2 bg-transparent border-gray-700 text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan font-mono uppercase tracking-wider"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 font-mono">
                {completedFeatures.size} of {totalFeatures} features explored
              </div>
              <Button
                onClick={nextFeature}
                variant="purple"
                className="flex items-center gap-2 shadow-[0_0_15px_rgba(179,0,255,0.3)] font-orbitron uppercase tracking-wider"
              >
                {currentFeature === totalFeatures - 1 ? (
                  <>
                    <Crown className="h-4 w-4" />
                    Complete Tour
                  </>
                ) : (
                  <>
                    Next Feature
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
