"use client"

import { useState, useEffect} from "react"
import { motion, AnimatePresence} from "framer-motion"
import { Button} from "@/components/ui/button"
import { Badge} from "@/components/ui/badge"
import { Progress} from "@/components/ui/progress"
import { Card, CardContent,} from "@/components/ui/card"
import { 
  Crown, Sparkles, Target, Rocket, Gift, Star, CheckCircle, ArrowRight, Play, MessageCircle, FileText, Award, Lightbulb} from "lucide-react"
import Link from "next/link"

interface WelcomeDashboardProps {
  userData?: any
  onStartOnboarding?: () => void
  onSkipOnboarding?: () => void
}

export function WelcomeDashboard({ onStartOnboarding, onSkipOnboarding }: WelcomeDashboardProps) {
  const [currentTip, setCurrentTip] = useState(0)
  const [showCelebration, setShowCelebration] = useState(true)

  const quickActions = [
    {
      id: "create-goal",
      title: "Create Your First Goal",
      description: "Set a goal and start your journey",
      icon: Target,
      color: "from-neon-purple to-neon-magenta",
      href: "/dashboard/slaylist"
    },
    {
      id: "chat-ai",
      title: "Chat with AI",
      description: "Meet your AI squad",
      icon: MessageCircle,
      color: "from-neon-magenta to-neon-purple",
      href: "/dashboard/agents"
    },
    {
      id: "upload-file",
      title: "Upload a File",
      description: "Add documents to your briefcase",
      icon: FileText,
      color: "from-neon-cyan to-neon-blue",
      href: "/dashboard/briefcase"
    },
    {
      id: "explore-features",
      title: "Explore Features",
      description: "Discover what's possible",
      icon: Lightbulb,
      color: "from-neon-orange to-neon-magenta",
      href: "/features"
    }
  ]

  const dailyTips = [
    "Check your dashboard daily for motivation and progress updates",
    "Set 3-5 main goals maximum for better focus and achievement",
    "Use AI agents for specific tasks - they each have unique expertise",
    "Break large goals into smaller, actionable tasks",
    "Review your analytics weekly to identify productivity patterns",
    "Upload important documents to let AI analyze and organize them",
    "Use voice commands to create tasks quickly and efficiently"
  ]

  const achievements = [
    {
      id: "first-login",
      title: "Welcome to the Empire!",
      description: "You've successfully joined SoloSuccess AI",
      icon: Crown,
      unlocked: true,
      points: 100
    },
    {
      id: "first-goal",
      title: "Goal Setter",
      description: "Create your first goal",
      icon: Target,
      unlocked: false,
      points: 250
    },
    {
      id: "first-task",
      title: "Task Master",
      description: "Add your first task",
      icon: CheckCircle,
      unlocked: false,
      points: 150
    },
    {
      id: "first-ai-chat",
      title: "AI Collaborator",
      description: "Start your first AI conversation",
      icon: MessageCircle,
      unlocked: false,
      points: 200
    }
  ]

  // Rotate tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % dailyTips.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Hide celebration after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCelebration(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden p-6">
      
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-32 h-32 bg-gradient-to-br from-neon-purple to-neon-magenta rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(179,0,255,0.4)] border-2 border-neon-purple/50"
            >
              <Crown className="h-16 w-16 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Welcome Header */}
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
            className="w-20 h-20 mx-auto bg-gradient-to-br from-military-hot-pink to-military-blush-pink rounded-full flex items-center justify-center border border-white/20"
          >
            <Crown className="h-10 w-10 text-white" />
          </motion.div>
          
          <div>
            <h1 className="text-4xl font-heading font-bold text-military-glass-white mb-2">
              Welcome to Your Empire! 👑
            </h1>
            <p className="text-xl text-military-storm-grey">
              You're ready to dominate your industry with AI-powered productivity tools
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Badge variant="purple" className="text-lg px-3 py-1">
              <Sparkles className="h-4 w-4 mr-2" />
              Level 1 Boss
            </Badge>
            <Badge variant="lime" className="text-lg px-3 py-1">
              <Star className="h-4 w-4 mr-2" />
              100 Points
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="group"
            >
              <Link href={action.href}>
                <div className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg glass-card border border-white/10 rounded-lg">
                  <div className="p-6 text-center space-y-4 relative z-10">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-military-hot-pink to-military-blush-pink flex items-center justify-center group-hover:scale-110 transition-transform duration-200 border border-white/20">
                      <action.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-military-glass-white">{action.title}</h3>
                      <p className="text-sm text-military-storm-grey">{action.description}</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-military-hot-pink to-military-blush-pink text-white hover:opacity-90"
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Getting Started Guide */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="p-6 bg-dark-card border border-gray-700 shadow-[0_0_15px_rgba(179,0,255,0.1)]">
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="h-5 w-5 text-neon-purple" />
                  <h2 className="text-xl font-orbitron font-bold text-white uppercase tracking-wider">Getting Started Guide</h2>
                </div>
                <div className="space-y-6">
                <div className="space-y-4">
                  {[
                    { step: 1, title: "Set Your First Goal", desc: "Define what you want to achieve", completed: false },
                    { step: 2, title: "Create Tasks", desc: "Break down your goal into actionable steps", completed: false },
                    { step: 3, title: "Chat with AI", desc: "Get help from your AI squad", completed: false },
                    { step: 4, title: "Track Progress", desc: "Monitor your success with analytics", completed: false }
                  ].map((item, index) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                      className="flex items-center gap-4 p-4 glass-card rounded-lg border border-white/10"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-military-gunmetal-grey text-military-glass-white'
                      }`}>
                        {item.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-bold">{item.step}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-military-glass-white">{item.title}</h4>
                        <p className="text-sm text-military-storm-grey">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium font-mono text-white">Progress: 0 of 4 steps completed</p>
                      <Progress value={0} className="w-full mt-2 bg-dark-bg" indicatorClassName="bg-gradient-to-r from-neon-purple to-neon-magenta" />
                    </div>
                    <Button 
                      onClick={onStartOnboarding}
                      variant="purple"
                      className="shadow-[0_0_15px_rgba(179,0,255,0.3)] font-orbitron uppercase tracking-wider"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Guide
                    </Button>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Tip */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Card className="p-6 bg-dark-card border border-gray-700 shadow-[0_0_15px_rgba(179,0,255,0.1)]">
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-neon-orange" />
                    <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider">Daily Tip</h3>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentTip}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-gray-400 font-mono"
                    >
                      {dailyTips[currentTip]}
                    </motion.p>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Card className="p-6 bg-dark-card border border-gray-700 shadow-[0_0_15px_rgba(179,0,255,0.1)]">
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-neon-orange" />
                    <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider">Achievements</h3>
                  </div>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                        className={`flex items-center gap-3 p-3 rounded-sm bg-dark-bg border ${
                          achievement.unlocked 
                            ? 'border-neon-lime/30 shadow-[0_0_10px_rgba(57,255,20,0.2)]' 
                            : 'border-gray-700'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          achievement.unlocked 
                            ? 'bg-neon-lime text-white shadow-[0_0_10px_rgba(57,255,20,0.5)]' 
                            : 'bg-dark-card border border-gray-700 text-gray-500'
                        }`}>
                          <achievement.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm font-mono text-white">{achievement.title}</h4>
                          <p className="text-xs text-gray-400 font-mono">{achievement.description}</p>
                        </div>
                        <Badge className={`font-mono text-xs ${
                          achievement.unlocked 
                            ? 'bg-neon-lime/20 text-neon-lime border-neon-lime/40' 
                            : 'bg-dark-card text-gray-500 border-gray-700'
                        }`}>
                          {achievement.points} pts
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Welcome Bonus */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Card className="p-6 border-2 border-neon-purple/30 bg-dark-card shadow-[0_0_20px_rgba(179,0,255,0.2)]">
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="h-5 w-5 text-neon-purple" />
                    <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider">Welcome Bonus</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-dark-bg rounded-sm border border-gray-700">
                      <p className="text-sm font-medium font-mono text-white">🎉 7-Day Premium Trial</p>
                      <p className="text-xs text-gray-400 font-mono">Access to all features</p>
                    </div>
                    <div className="p-3 bg-dark-bg rounded-sm border border-gray-700">
                      <p className="text-sm font-medium font-mono text-white">🚀 100 AI Credits</p>
                      <p className="text-xs text-gray-400 font-mono">Bonus conversations</p>
                    </div>
                    <div className="p-3 bg-dark-bg rounded-sm border border-gray-700">
                      <p className="text-sm font-medium font-mono text-white">📚 Premium Templates</p>
                      <p className="text-xs text-gray-400 font-mono">50+ business templates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-lg font-orbitron font-semibold text-white uppercase tracking-wider">
            <Sparkles className="h-5 w-5 text-neon-purple" />
            Ready to start building your empire!
            <Sparkles className="h-5 w-5 text-neon-purple" />
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Button 
              onClick={onStartOnboarding}
              variant="purple"
              className="text-lg px-8 py-4 shadow-[0_0_20px_rgba(179,0,255,0.3)] font-orbitron uppercase tracking-wider"
              size="lg"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Start Your Journey
            </Button>
            <Button 
              onClick={onSkipOnboarding}
              variant="outline"
              className="text-lg px-8 py-4 border-gray-700 text-gray-400 hover:bg-dark-hover hover:text-neon-cyan font-mono uppercase tracking-wider"
              size="lg"
            >
              Do it Later
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
