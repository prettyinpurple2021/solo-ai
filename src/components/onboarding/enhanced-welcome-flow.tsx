"use client"

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useState, useEffect} from "react"
import { motion, AnimatePresence} from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Badge} from "@/components/ui/badge"
import { Progress} from "@/components/ui/progress"

import {
  Crown, Sparkles, Target, Users, Rocket, Gift, Star, Zap, TrendingUp, Brain, Heart, CheckCircle, ArrowRight, ArrowLeft, Play, Pause, Volume2, VolumeX, Settings} from "lucide-react"

interface WelcomeFlowProps {
  open: boolean
  onComplete: (data: any) => void
  onSkip: () => void
  userData?: any
}

export function EnhancedWelcomeFlow({ open, onComplete, onSkip, userData }: WelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [selectedPersonality, setSelectedPersonality] = useState<string>("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [userPreferences, setUserPreferences] = useState({
    animations: true,
    sound: true,
    autoAdvance: false,
    voiceGuidance: false
  })

  // Debug state changes
  useEffect(() => {
    logInfo('Current step changed:', currentStep)
  }, [currentStep])

  useEffect(() => {
    logInfo('Selected personality changed:', selectedPersonality)
  }, [selectedPersonality])

  useEffect(() => {
    logInfo('Open prop changed:', open)
    if (!open) {
      logInfo('Modal was closed externally! Current state:', {
        currentStep,
        selectedPersonality,
        selectedGoals,
        selectedAgents
      })
    }
  }, [open, currentStep, selectedPersonality, selectedGoals, selectedAgents])

  const welcomeSteps = [
    {
      id: "welcome",
      title: "Welcome to Your Empire! 👑",
      subtitle: "You're about to become unstoppable",
      icon: Crown,
      color: "from-neon-purple to-neon-magenta",
      content: (
        <div className="space-y-6 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="w-24 h-24 mx-auto bg-neon-purple/20 border border-neon-purple/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(179,0,255,0.4)]"
          >
            <Crown className="h-12 w-12 text-neon-purple" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold font-orbitron text-white uppercase tracking-wider mb-2">
              Ready to Rule? 🚀
            </h2>
            <p className="text-lg text-gray-400 font-mono">
              Your AI-powered productivity empire awaits. Let's get you set up for maximum success!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="grid grid-cols-2 gap-4 font-mono"
          >
            <div className="p-4 bg-neon-purple/10 border border-neon-purple/20 rounded-sm">
              <Sparkles className="h-8 w-8 text-neon-cyan mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-neon-cyan">8 AI Agents</h3>
              <p className="text-xs text-gray-400">Your personal team</p>
            </div>
            <div className="p-4 bg-neon-lime/10 border border-neon-lime/20 rounded-sm">
              <Target className="h-8 w-8 text-neon-lime mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-neon-lime">Smart Goals</h3>
              <p className="text-xs text-gray-400">AI-powered tracking</p>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: "personality",
      title: "What's Your Boss Energy? ⚡",
      subtitle: "Let's match your vibe",
      icon: Brain,
      color: "from-neon-magenta to-neon-purple",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold font-orbitron text-white mb-4">Choose Your Power Style</h3>
            <p className="text-gray-400 font-mono mb-6">
              This helps us customize your AI agents and dashboard experience
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                id: "strategic",
                name: "Strategic Mastermind",
                emoji: "🧠",
                description: "Data-driven, analytical, loves frameworks",
                color: "from-neon-cyan to-neon-blue"
              },
              {
                id: "creative",
                name: "Creative Visionary",
                emoji: "🎨",
                description: "Innovative, artistic, thinks outside the box",
                color: "from-neon-magenta to-neon-purple"
              },
              {
                id: "dynamic",
                name: "Dynamic Leader",
                emoji: "⚡",
                description: "High-energy, action-oriented, gets things done",
                color: "from-neon-yellow to-neon-orange"
              },
              {
                id: "balanced",
                name: "Balanced Boss",
                emoji: "⚖️",
                description: "Well-rounded, adaptable, team-focused",
                color: "from-neon-lime to-neon-green"
              }
            ].map((style, index) => (
              <motion.div
                key={style.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`p-4 border-2 rounded-sm cursor-pointer transition-all duration-200 select-none bg-dark-card ${
                  selectedPersonality === style.id
                    ? "border-neon-cyan bg-neon-cyan/5 shadow-[0_0_15px_rgba(11,228,236,0.2)] scale-[1.02]"
                    : "border-transparent hover:border-neon-cyan/50 hover:shadow-md hover:scale-[1.01]"
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  logInfo('Personality card clicked:', style.id)
                  logInfo('Current step', { currentStep, open })
                  setSelectedPersonality(style.id)
                  logInfo('Personality set to:', style.id)
                }}
                onMouseDown={(e) => {
                  // Prevent any potential focus/blur issues
                  e.preventDefault()
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{style.emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white font-orbitron">{style.name}</h4>
                    <p className="text-sm text-gray-400 font-mono">{style.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${style.color}`} />
                    {selectedPersonality === style.id && <CheckCircle className="h-5 w-5 text-neon-cyan" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "goals",
      title: "What Are You Crushing? 🎯",
      subtitle: "Your empire objectives",
      icon: Target,
      color: "from-neon-cyan to-neon-blue",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold font-orbitron text-white mb-4">Select Your Primary Goals</h3>
            <p className="text-gray-400 font-mono mb-6">
              Choose up to 3 main objectives - we'll customize everything around these!
            </p>
          </div>

          <div className="grid gap-3">
            {[
              { id: "productivity", label: "Boost Productivity", emoji: "⚡", desc: "Get more done in less time" },
              { id: "growth", label: "Scale Business", emoji: "📈", desc: "Grow revenue and reach" },
              { id: "automation", label: "Automate Everything", emoji: "🤖", desc: "Reduce manual work" },
              { id: "wellness", label: "Work-Life Balance", emoji: "🧘‍♀️", desc: "Prevent burnout" },
              { id: "creativity", label: "Boost Creativity", emoji: "🎨", desc: "Generate fresh ideas" },
              { id: "organization", label: "Get Organized", emoji: "📋", desc: "Streamline workflows" }
            ].map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className={`p-4 border-2 rounded-sm cursor-pointer transition-all duration-200 select-none bg-dark-card ${
                  selectedGoals.includes(goal.id)
                    ? "border-neon-lime bg-neon-lime/5 shadow-[0_0_15px_rgba(57,255,20,0.2)] scale-[1.02]"
                    : "border-transparent hover:border-neon-lime/50 hover:shadow-md hover:scale-[1.01]"
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  logInfo('Goal card clicked:', goal.id)
                  toggleGoal(goal.id)
                }}
                onMouseDown={(e) => {
                  // Prevent any potential focus/blur issues
                  e.preventDefault()
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{goal.emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white font-orbitron">{goal.label}</h4>
                    <p className="text-sm text-gray-400 font-mono">{goal.desc}</p>
                  </div>
                  <div className={`w-5 h-5 border-2 rounded-full transition-all duration-200 ${
                    selectedGoals.includes(goal.id)
                      ? "bg-neon-lime border-neon-lime"
                      : "border-gray-600"
                  }`}>
                    {selectedGoals.includes(goal.id) && <CheckCircle className="h-5 w-5 text-black" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "ai-team",
      title: "Meet Your AI Squad! 👯‍♀️",
      subtitle: "Your 24/7 productivity team",
      icon: Users,
      color: "from-neon-orange to-neon-red",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold font-orbitron text-white mb-4">Choose Your Starting Team</h3>
            <p className="text-gray-400 font-mono mb-6">
              Pick 2-3 agents to start with - you can add more later!
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                id: "roxy",
                name: "Roxy",
                role: "Strategic Decision Architect",
                emoji: "👑",
                description: "Helps with big decisions using SPADE framework",
                specialties: ["Strategy", "Decisions", "Planning"]
              },
              {
                id: "blaze",
                name: "Blaze",
                role: "Growth Strategist",
                emoji: "🔥",
                description: "Drives growth and identifies opportunities",
                specialties: ["Growth", "Sales", "Strategy"]
              },
              {
                id: "echo",
                name: "Echo",
                role: "Marketing Maven",
                emoji: "📢",
                description: "Creates content and builds your brand",
                specialties: ["Content", "Branding", "Social Media"]
              },
              {
                id: "lumi",
                name: "Lumi",
                role: "Guardian AI",
                emoji: "🛡️",
                description: "Handles compliance and legal matters",
                specialties: ["Legal", "Compliance", "Security"]
              }
            ].map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className={`p-4 border-2 rounded-sm cursor-pointer transition-all duration-200 select-none bg-dark-card ${
                  selectedAgents.includes(agent.id)
                    ? "border-neon-orange bg-neon-orange/5 shadow-[0_0_15px_rgba(255,102,0,0.2)] scale-[1.02]"
                    : "border-transparent hover:border-neon-orange/50 hover:shadow-md hover:scale-[1.01]"
                }`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  logInfo('Agent card clicked:', agent.id)
                  toggleAgent(agent.id)
                }}
                onMouseDown={(e) => {
                  // Prevent any potential focus/blur issues
                  e.preventDefault()
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{agent.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-white font-orbitron">{agent.name}</h4>
                      <div className={`w-5 h-5 border-2 rounded-full transition-all duration-200 ${
                        selectedAgents.includes(agent.id)
                          ? "bg-neon-orange border-neon-orange"
                          : "border-gray-600"
                      }`}>
                        {selectedAgents.includes(agent.id) && <CheckCircle className="h-5 w-5 text-black" />}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-neon-orange mb-2 font-mono">{agent.role}</p>
                    <p className="text-sm text-gray-400 mb-3 font-mono">{agent.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs bg-dark-bg border-neon-orange/40 text-neon-orange font-mono">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "preferences",
      title: "Customize Your Experience ⚙️",
      subtitle: "Make it uniquely yours",
      icon: Settings,
      color: "from-neon-blue to-neon-purple",
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold font-orbitron text-white mb-4">Personalize Your Setup</h3>
            <p className="text-gray-400 font-mono mb-6">
              Choose your preferences for the best experience
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: "animations",
                label: "Smooth Animations",
                description: "Beautiful transitions and effects",
                icon: Sparkles,
                enabled: userPreferences.animations
              },
              {
                id: "sound",
                label: "Sound Effects",
                description: "Audio feedback for actions",
                icon: soundEnabled ? Volume2 : VolumeX,
                enabled: userPreferences.sound
              },
              {
                id: "autoAdvance",
                label: "Auto-Advance Tutorials",
                description: "Automatically move through steps",
                icon: Play,
                enabled: userPreferences.autoAdvance
              },
              {
                id: "voiceGuidance",
                label: "Voice Guidance",
                description: "Audio instructions and tips",
                icon: Volume2,
                enabled: userPreferences.voiceGuidance
              }
            ].map((pref, index) => (
              <motion.div
                key={pref.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex items-center justify-between p-4 border-2 border-transparent hover:border-neon-cyan/50 rounded-sm cursor-pointer transition-all duration-200 bg-dark-card"
                onClick={() => setUserPreferences(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof typeof prev] }))}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    userPreferences[pref.id as keyof typeof userPreferences] 
                      ? 'bg-neon-cyan/20 border border-neon-cyan' 
                      : 'bg-dark-bg border border-gray-700'
                  }`}>
                    <pref.icon className={`h-5 w-5 ${
                      userPreferences[pref.id as keyof typeof userPreferences] 
                        ? 'text-neon-cyan' 
                        : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white font-orbitron">{pref.label}</h4>
                    <p className="text-sm text-gray-400 font-mono">{pref.description}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                  userPreferences[pref.id as keyof typeof userPreferences]
                    ? 'bg-neon-cyan border-neon-cyan'
                    : 'border-gray-600'
                }`}>
                  {userPreferences[pref.id as keyof typeof userPreferences] && (
                    <CheckCircle className="h-4 w-4 text-black" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "complete",
      title: "You're Ready to Rule! 🚀",
      subtitle: "Your empire awaits",
      icon: Rocket,
      color: "from-neon-lime to-neon-cyan",
      content: (
        <div className="space-y-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="w-24 h-24 mx-auto bg-neon-lime/20 border border-neon-lime/50 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(57,255,20,0.4)]"
          >
            <Rocket className="h-12 w-12 text-neon-lime" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold font-orbitron text-white uppercase tracking-wider mb-2">
              Welcome to Your Empire! 👑
            </h2>
            <p className="text-lg text-gray-400 font-mono mb-6">
              Your SoloSuccess AI platform is ready to help you dominate your industry!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono"
          >
            <Card className="bg-dark-card border-neon-purple/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neon-purple font-orbitron">
                  <Gift className="h-5 w-5" />
                  Welcome Bonus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-neon-purple/10 border border-neon-purple/20 rounded-lg">
                  <p className="text-sm font-medium text-white">🎉 7-Day Premium Trial</p>
                  <p className="text-xs text-gray-400">Access to all features</p>
                </div>
                <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg">
                  <p className="text-sm font-medium text-white">🚀 100 AI Credits</p>
                  <p className="text-xs text-gray-400">Bonus conversations</p>
                </div>
                <div className="p-3 bg-neon-orange/10 border border-neon-orange/20 rounded-lg">
                  <p className="text-sm font-medium text-white">📚 Premium Templates</p>
                  <p className="text-xs text-gray-400">50+ business templates</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-card border-neon-yellow/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neon-yellow font-orbitron">
                  <Star className="h-5 w-5" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-neon-purple/5 rounded">
                  <Users className="h-5 w-5 text-neon-purple" />
                  <div>
                    <p className="text-sm font-medium text-white">Chat with AI</p>
                    <p className="text-xs text-gray-400">Start your first conversation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-neon-cyan/5 rounded">
                  <Target className="h-5 w-5 text-neon-cyan" />
                  <div>
                    <p className="text-sm font-medium text-white">Create Goals</p>
                    <p className="text-xs text-gray-400">Set your first objectives</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-neon-lime/5 rounded">
                  <TrendingUp className="h-5 w-5 text-neon-lime" />
                  <div>
                    <p className="text-sm font-medium text-white">Track Progress</p>
                    <p className="text-xs text-gray-400">Monitor your success</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex items-center justify-center gap-2 text-lg font-bold font-orbitron text-neon-lime uppercase tracking-wide"
          >
            <Sparkles className="h-5 w-5" />
            Ready to dominate!
            <Sparkles className="h-5 w-5" />
          </motion.div>
        </div>
      )
    }
  ]

  const toggleGoal = (goalId: string) => {
    logInfo('Toggling goal', { goalId, currentGoals: selectedGoals })
    if (selectedGoals.length >= 3 && !selectedGoals.includes(goalId)) {
      logInfo('Maximum of 3 goals allowed')
      return // Maximum 3 goals
    }
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter((g) => g !== goalId)
      : [...selectedGoals, goalId]
    logInfo('New goals:', newGoals)
    setSelectedGoals(newGoals)
  }

  const toggleAgent = (agentId: string) => {
    logInfo('Toggling agent', { agentId, currentAgents: selectedAgents })
    if (selectedAgents.length >= 3 && !selectedAgents.includes(agentId)) {
      logInfo('Maximum of 3 agents allowed')
      return // Maximum 3 agents
    }
    const newAgents = selectedAgents.includes(agentId)
      ? selectedAgents.filter((a) => a !== agentId)
      : [...selectedAgents, agentId]
    logInfo('New agents:', newAgents)
    setSelectedAgents(newAgents)
  }

  const totalSteps = welcomeSteps.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  const nextStep = () => {
    logInfo('NextStep called', { currentStep, totalSteps })
    if (currentStep < totalSteps - 1) {
      logInfo('Moving to next step:', currentStep + 1)
      setCurrentStep(currentStep + 1)
    } else {
      logInfo('Ready to complete welcome flow, but let\'s double check...')
      logInfo('Current step check', { currentStep, expectedStep: totalSteps - 1 })
      if (currentStep === totalSteps - 1) {
        logInfo('Completing welcome flow')
        onComplete({
          selectedPersonality,
          selectedGoals,
          selectedAgents,
          userPreferences,
          completedAt: new Date().toISOString(),
          stepsCompleted: totalSteps
        })
      } else {
        logError('Tried to complete welcome flow at wrong step!')
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const currentStepData = welcomeSteps[currentStep]

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
      onClick={(e) => {
        // Only close if clicking the backdrop itself, not child elements
        if (e.target === e.currentTarget) {
          logInfo('Backdrop clicked - preventing close to avoid accidental dismissal')
          // Don't close the modal on backdrop click during onboarding
          return
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => {
          // Prevent any clicks inside the modal from bubbling up
          e.stopPropagation()
        }}
      >
        <Card className="bg-dark-bg border-2 border-neon-cyan/20 shadow-[0_0_50px_rgba(11,228,236,0.1)]">
          <CardHeader className="pb-4 border-b border-neon-cyan/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-orbitron text-2xl flex items-center gap-3 text-white uppercase tracking-wider">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${currentStepData.color} flex items-center justify-center shadow-lg`}>
                    <currentStepData.icon className="h-5 w-5 text-white" />
                  </div>
                  {currentStepData.title}
                </CardTitle>
                <p className="text-gray-400 mt-1 font-mono">{currentStepData.subtitle}</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  logInfo('Skip setup clicked')
                  onSkip()
                }} 
                className="text-sm text-gray-400 hover:text-neon-orange hover:bg-neon-orange/10 font-mono uppercase"
              >
                Skip Setup
              </Button>
            </div>
            <Progress value={progress} className="w-full mt-4 h-1 bg-dark-card" indicatorClassName="bg-gradient-to-r from-neon-purple to-neon-cyan shadow-[0_0_10px_rgba(179,0,255,0.5)]" />
          </CardHeader>

          <CardContent className="py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStepData.content}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <div className="flex justify-between items-center p-6 border-t border-neon-cyan/10">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                logInfo('Back button clicked')
                prevStep()
              }}
              disabled={currentStep === 0}
              className="flex items-center gap-2 bg-transparent border-neon-cyan/20 text-gray-400 hover:text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan transition-colors font-mono uppercase tracking-wider disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < totalSteps - 1 ? (
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    logInfo('Next button clicked on step:', currentStep)
                    nextStep()
                  }}
                  variant="cyan"
                  className="flex items-center gap-2 font-orbitron text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(11,228,236,0.3)] hover:shadow-[0_0_25px_rgba(11,228,236,0.5)] scale-100 hover:scale-[1.02] transition-all"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    logInfo('Launch Empire button clicked')
                    nextStep()
                  }}
                  variant="lime"
                  className="flex items-center gap-2 font-orbitron text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_25px_rgba(57,255,20,0.5)] scale-100 hover:scale-[1.02] transition-all text-black font-bold"
                >
                  <Rocket className="h-4 w-4" />
                  Launch Empire!
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
