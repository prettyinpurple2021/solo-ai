"use client"

import { useState, useEffect } from "react"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { EnhancedOnboarding } from "@/components/onboarding/enhanced-onboarding"
import { Loading } from "@/components/ui/loading"
import { BossCard, EmpowermentCard, StatsCard } from "@/components/ui/boss-card"
import { BossButton, ZapButton } from "@/components/ui/boss-button"
import { Progress } from "@/components/ui/progress"
import { motion, easeOut } from "framer-motion"
import { 
  CheckCircle, 
  Target, 
  Clock, 
  MessageCircle, 
  Trophy,
  Crown,
  Sparkles,
  Flame,
  ArrowRight,
  BarChart3,
  Plus
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { data, loading, error } = useDashboardData()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Check if onboarding should be shown
  useEffect(() => {
    if (data && !data.user.onboarding_completed) {
      setShowOnboarding(true)
    }
  }, [data])

  const handleOnboardingComplete = async (onboardingData: any) => {
    try {
      // Save onboarding data to user profile
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onboarding_completed: true,
          onboarding_data: onboardingData,
        }),
      })

      if (response.ok) {
        setShowOnboarding(false)
        // Refresh dashboard data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error)
    }
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-background p-6">
        <EnhancedOnboarding 
          open={showOnboarding} 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading 
            variant="boss" 
            size="lg" 
            text="Loading your empire..."
          />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-background p-6">
        <EnhancedOnboarding 
          open={showOnboarding} 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmpowermentCard className="max-w-md">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto w-16 h-16 gradient-danger rounded-full flex items-center justify-center"
              >
                <Flame className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gradient">Error Loading Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
              <BossButton 
                onClick={() => window.location.reload()}
                variant="empowerment"
                crown
              >
                Try Again
              </BossButton>
            </div>
          </EmpowermentCard>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen gradient-background p-6">
        <EnhancedOnboarding 
          open={showOnboarding} 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmpowermentCard className="max-w-md">
            <div className="text-center space-y-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="mx-auto w-20 h-20 gradient-empowerment rounded-full flex items-center justify-center"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-gradient mb-2">Welcome to SoloBoss AI</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first goal or task.</p>
                <div className="space-y-3">
                  <Link href="/dashboard/slaylist">
                    <BossButton 
                      variant="empowerment" 
                      crown 
                      fullWidth
                      icon={<Target className="w-4 h-4" />}
                    >
                      Create Goal
                    </BossButton>
                  </Link>
                  <Link href="/dashboard/agents">
                    <BossButton 
                      variant="primary" 
                      fullWidth
                      icon={<MessageCircle className="w-4 h-4" />}
                    >
                      Chat with AI
                    </BossButton>
                  </Link>
                </div>
              </div>
            </div>
          </EmpowermentCard>
        </div>
      </div>
    )
  }

  const { user, todaysStats, todaysTasks, activeGoals, recentConversations, insights } = data

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut
      }
    }
  }

  return (
    <div className="min-h-screen gradient-background p-6">
      <EnhancedOnboarding 
        open={showOnboarding} 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-12 h-12 gradient-empowerment rounded-full flex items-center justify-center"
              >
                <Crown className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-gradient">
                  Welcome back, {user.full_name || user.email.split('@')[0]}! 👑
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Here's what's happening with your empire today
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="crown-badge"
            >
              Level {user.level}
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 gradient-success rounded-full text-white font-bold"
            >
              {user.total_points} pts
            </motion.div>
          </div>
        </motion.div>

        {/* Today's Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Tasks Completed"
            value={`${todaysStats.tasks_completed}/${todaysStats.total_tasks}`}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            trend={{ value: 15, isPositive: true }}
          />
          
          <StatsCard
            title="Focus Time"
            value={`${todaysStats.focus_minutes}m`}
            icon={<Clock className="w-6 h-6 text-white" />}
            trend={{ value: 8, isPositive: true }}
          />
          
          <StatsCard
            title="AI Interactions"
            value={todaysStats.ai_interactions}
            icon={<MessageCircle className="w-6 h-6 text-white" />}
            trend={{ value: 12, isPositive: true }}
          />
          
          <StatsCard
            title="Productivity Score"
            value={`${todaysStats.productivity_score}%`}
            icon={<BarChart3 className="w-6 h-6 text-white" />}
            trend={{ value: 5, isPositive: true }}
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Tasks */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <EmpowermentCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gradient flex items-center space-x-2">
                  <Target className="w-6 h-6" />
                  <span>Today's Tasks</span>
                </h2>
                <ZapButton size="sm">
                  View All
                </ZapButton>
              </div>
              
              <div className="space-y-4">
                {todaysTasks.length > 0 ? (
                  todaysTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 glass rounded-xl hover-lift"
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className={`w-3 h-3 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                        />
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.goal && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Goal: {task.goal.title}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                        {task.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No tasks for today</p>
                    <BossButton 
                      variant="primary" 
                      size="sm" 
                      className="mt-4"
                      icon={<Plus className="w-4 h-4" />}
                    >
                      Add Task
                    </BossButton>
                  </div>
                )}
              </div>
            </EmpowermentCard>
          </motion.div>

          {/* Active Goals */}
          <motion.div variants={itemVariants}>
            <EmpowermentCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gradient flex items-center space-x-2">
                  <Trophy className="w-6 h-6" />
                  <span>Active Goals</span>
                </h2>
                <BossButton size="sm" variant="primary">
                  View All
                </BossButton>
              </div>
              
              <div className="space-y-4">
                {activeGoals.length > 0 ? (
                  activeGoals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 glass rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{goal.title}</h3>
                        <span className="text-sm font-bold text-gradient">
                          {goal.progress_percentage}%
                        </span>
                      </div>
                      <Progress 
                        value={goal.progress_percentage} 
                        className="h-2 gradient-primary"
                      />
                      {goal.target_date && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                          Due: {new Date(goal.target_date).toLocaleDateString()}
                        </p>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No active goals</p>
                    <BossButton 
                      variant="empowerment" 
                      size="sm" 
                      className="mt-4"
                      crown
                    >
                      Create Goal
                    </BossButton>
                  </div>
                )}
              </div>
            </EmpowermentCard>
          </motion.div>
        </div>

        {/* Recent Conversations & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Conversations */}
          <motion.div variants={itemVariants}>
            <BossCard variant="default">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gradient flex items-center space-x-2">
                  <MessageCircle className="w-6 h-6" />
                  <span>Recent AI Chats</span>
                </h2>
                <BossButton size="sm" variant="primary">
                  View All
                </BossButton>
              </div>
              
              <div className="space-y-3">
                {recentConversations.length > 0 ? (
                  recentConversations.map((conversation, index) => (
                    <motion.div
                      key={conversation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 glass rounded-lg hover-lift cursor-pointer"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ background: conversation.agent.accent_color }}
                      >
                        {conversation.agent.display_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{conversation.agent.display_name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(conversation.last_message_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No recent conversations</p>
                    <BossButton 
                      variant="primary" 
                      size="sm" 
                      className="mt-4"
                    >
                      Start Chat
                    </BossButton>
                  </div>
                )}
              </div>
            </BossCard>
          </motion.div>

          {/* Insights */}
          <motion.div variants={itemVariants}>
            <BossCard variant="success">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gradient flex items-center space-x-2">
                  <Sparkles className="w-6 h-6" />
                  <span>AI Insights</span>
                </h2>
                <BossButton size="sm" variant="success">
                  View All
                </BossButton>
              </div>
              
              <div className="space-y-4">
                {insights.length > 0 ? (
                  insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 glass rounded-xl"
                    >
                      <h3 className="font-semibold mb-2">{insight.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {insight.description}
                      </p>
                      <BossButton size="sm" variant="primary">
                        {insight.action}
                      </BossButton>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No insights yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Complete more tasks to get AI insights
                    </p>
                  </div>
                )}
              </div>
            </BossCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}