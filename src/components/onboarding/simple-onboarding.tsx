"use client"

import { logInfo, logError } from '@/lib/logger'
import { useState } from "react"
import { motion } from "framer-motion"
import { Button} from "@/components/ui/button"
import { Input} from "@/components/ui/input"
import { Label} from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Crown, Target, Rocket, ArrowRight, CheckCircle} from "lucide-react"

interface SimpleOnboardingProps {
  open: boolean
  onCompleteAction: (data: Record<string, unknown>) => void
  onSkipAction: () => void
  userData?: Record<string, unknown>
}

export function SimpleOnboarding({ open, onCompleteAction, onSkipAction, userData }: SimpleOnboardingProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState<string>(
    typeof userData?.full_name === 'string' ? userData.full_name : ""
  )
  const [businessType, setBusinessType] = useState("")
  const [goals, setGoals] = useState<string[]>([])

  const businessTypes = [
    "Freelancer",
    "Consultant",
    "E-commerce Owner",
    "Content Creator",
    "Coach/Trainer",
    "Agency Owner",
    "SaaS Founder",
    "Service Provider",
    "Other",
  ]

  const goalOptions = [
    { id: "productivity", label: "Boost Productivity", emoji: "⚡" },
    { id: "growth", label: "Scale Business", emoji: "📈" },
    { id: "organization", label: "Get Organized", emoji: "📋" },
    { id: "automation", label: "Automate Tasks", emoji: "🤖" },
  ]

  const toggleGoal = (goalId: string) => {
    setGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    )
  }

  const handleNext = () => {
    if (step === 1) {
      if (name && businessType) {
        setStep(2)
      }
    }
  }

  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  
  const loadingMessages = [
    "Analyzing your goals...",
    "Consulting AI Strategy Engine...",
    "Building your Launch Mission...",
    "Finalizing your Empire Roadmap..."
  ]

  // Rotate loading messages
  const startLoadingSequence = () => {
    let current = 0
    return setInterval(() => {
      current = (current + 1) % loadingMessages.length
      setLoadingStep(current)
    }, 1500)
  }

  const handleComplete = async () => {
    if (isLoading) return

    setIsLoading(true)
    const interval = startLoadingSequence()

    const data = {
      personalInfo: { name, businessType },
      goals: { primaryGoals: goals },
      onboardingCompleted: true,
      completionDate: new Date().toISOString()
    }
    
    logInfo('Starting Empire Builder generation...', data)
    
    try {
      // 1. Update basic profile
      // 1. Update basic profile
      const profileResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarding_completed: true, onboarding_data: data })
      })

      if (!profileResponse.ok) {
        throw new Error(`Profile update failed: ${profileResponse.statusText}`)
      }

      // 2. Generate Roadmap
      const response = await fetch('/api/onboarding/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to generate plan')

      logInfo('Empire Roadmap created successfully')
      
      // Artificial delay to let user see "Finalizing..." if it was too fast
      await new Promise(r => setTimeout(r, 1000))
      
      clearInterval(interval)
      onCompleteAction(data)
      
      // Force reload to refresh dashboard data with new tasks
      window.location.href = '/dashboard'
      
    } catch (error) {
      logError('Onboarding failed', error)
      clearInterval(interval)
      setIsLoading(false)
      // Fallback: just close
      onCompleteAction(data)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="bg-dark-card border-2 border-neon-purple/30 rounded-sm p-8 shadow-[0_0_30px_rgba(179,0,255,0.2)]">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-20 h-20 mx-auto bg-gradient-to-br from-neon-purple to-neon-magenta rounded-full flex items-center justify-center border border-neon-purple/50 shadow-[0_0_20px_rgba(179,0,255,0.3)]"
                >
                  <Crown className="h-10 w-10 text-white" />
                </motion.div>
                
                <div>
                  <h2 className="text-3xl font-orbitron font-bold text-white mb-2 uppercase tracking-wider">
                    Welcome to Your Empire! 👑
                  </h2>
                  <p className="text-lg text-gray-400 font-mono">
                    Let&apos;s get you set up in 2 simple steps
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-military-glass-white font-semibold">
                    What should we call you?
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name or business name"
                    value={name || ""}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-military-tactical-black/50 border-military-storm-grey text-military-glass-white placeholder:text-military-storm-grey focus-visible:border-military-hot-pink focus-visible:ring-military-hot-pink/20 focus-visible:ring-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-military-glass-white font-semibold">
                    What type of business do you run?
                  </Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="bg-military-tactical-black/50 border-military-storm-grey text-military-glass-white focus:ring-military-hot-pink/20 focus:border-military-hot-pink hover:border-military-hot-pink/50 transition-colors">
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent className="bg-military-tactical-black/95 backdrop-blur-xl border-military-storm-grey shadow-2xl">
                      {businessTypes.map((type) => (
                        <SelectItem 
                          key={type} 
                          value={type} 
                          className="text-military-glass-white hover:bg-military-hot-pink/20 focus:bg-military-hot-pink/30 focus:text-white cursor-pointer"
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  onClick={onSkipAction}
                  variant="outline"
                  className="border-gray-700 text-gray-400 hover:bg-dark-hover hover:border-gray-600 transition-colors font-mono uppercase tracking-wider"
                >
                  Do it Later
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!name || !businessType}
                  variant="purple"
                  className="shadow-[0_0_15px_rgba(179,0,255,0.3)] hover:shadow-[0_0_25px_rgba(179,0,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-orbitron uppercase tracking-wider"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-military-hot-pink to-military-blush-pink rounded-full flex items-center justify-center border border-white/20">
                  <Target className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-heading font-bold text-military-glass-white mb-2">
                    What are your main goals? 🎯
                  </h2>
                  <p className="text-military-storm-grey">
                    Select all that apply - we&apos;ll customize your experience!
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {goalOptions.map((goal) => (
                  <motion.button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-sm bg-dark-card border-2 transition-all text-left ${
                      goals.includes(goal.id)
                        ? "border-neon-purple/60 ring-2 ring-neon-purple/40 bg-neon-purple/10 shadow-[0_0_15px_rgba(179,0,255,0.3)]"
                        : "border-gray-700 hover:border-neon-purple/40 hover:bg-dark-hover"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{goal.emoji}</span>
                      <div className="flex-1">
                        <h4 className={`font-semibold font-mono ${goals.includes(goal.id) ? "text-white" : "text-gray-300"}`}>
                          {goal.label}
                        </h4>
                      </div>
                      {goals.includes(goal.id) && (
                        <CheckCircle className="h-5 w-5 text-neon-purple animate-in fade-in zoom-in duration-200" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="border-military-storm-grey/50 text-military-glass-white hover:bg-military-tactical-black hover:border-military-storm-grey transition-colors"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-military-hot-pink to-military-blush-pink text-white hover:opacity-90 hover:shadow-lg hover:shadow-military-hot-pink/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Launch Your Empire!
                </Button>
              </div>
            </motion.div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 bg-dark-bg/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 rounded-sm border border-gray-700"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-t-2 border-neon-purple animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-r-2 border-neon-cyan animate-spin" style={{ animationDuration: '2s' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Rocket className="h-8 w-8 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 font-orbitron uppercase tracking-wider">
                Initialize Sequence
              </h3>
              <p className="text-lg text-gray-300 font-mono animate-in fade-in slide-in-from-bottom-2 duration-300">
                {loadingMessages[loadingStep]}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

