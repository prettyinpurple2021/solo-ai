"use client"

export const dynamic = 'force-dynamic'
import { logError,} from '@/lib/logger'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect, useMemo, useCallback,} from "react"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useAuth } from "@/hooks/use-auth"
import { useSmartTips, TRIGGER_CONDITIONS } from "@/hooks/use-smart-tips"
import { useAnalytics, usePageTracking, usePerformanceTracking } from "@/hooks/use-analytics"
import { SimpleOnboarding } from "@/components/onboarding/simple-onboarding"
import { WelcomeDashboard } from "@/components/onboarding/welcome-dashboard"
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
  Plus,
  Briefcase,
  Shield
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import MobileDashboardEnhanced from "@/components/mobile/mobile-dashboard-enhanced"
import { HudBorder } from "@/components/cyber/HudBorder"
import { CyberButton } from "@/components/cyber/CyberButton"
import { NeuralNetworkCanvas } from "@/components/cyber/NeuralNetworkCanvas"
import { UIOverlayLines } from "@/components/cyber/UIOverlayLines"

// Note: Metadata cannot be exported from client components
// SEO metadata is handled in the layout.tsx file

export default function DashboardPage() {
  const { loading: authLoading } = useAuth()
  const { data, loading, error } = useDashboardData()
  const { track } = useAnalytics()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showWelcomeDashboard, setShowWelcomeDashboard] = useState(false)

  // Smart tips configuration
  const smartTipsConfig = {
    enabled: true,
    triggers: [
      {
        condition: TRIGGER_CONDITIONS.navigationConfusion,
        tipId: 'navigation-confusion',
        delay: 5000,
        cooldown: 10 * 60 * 1000 // 10 minutes
      },
      {
        condition: TRIGGER_CONDITIONS.featureDiscovery,
        tipId: 'feature-discovery',
        delay: 15000,
        cooldown: 15 * 60 * 1000 // 15 minutes
      }
    ]
  }

  useSmartTips(smartTipsConfig)
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  // Track page views and performance
  usePageTracking()
  usePerformanceTracking()

  // Animation variants - moved to top to avoid hooks order violation
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }), [])

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut
      }
    }
  }), [])

  // Callback functions - moved to top to avoid hooks order violation
  const handleOnboardingComplete = useCallback(async (onboardingData: unknown) => {
    try {
      // Save onboarding data to user profile
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('authToken')
            ? { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
            : {}),
        },
        body: JSON.stringify({
          onboarding_completed: true,
          onboarding_data: onboardingData,
        }),
      })

      if (response.ok) {
        // Track onboarding completion
        track('feature_used', {
          feature: 'onboarding',
          action: 'completed',
          onboardingData
        })

        setShowOnboarding(false)
        // Refresh dashboard data
        window.location.reload()
      } else {
        const errorData = await response.json()
        logError('Onboarding completion failed:', errorData)
        // Still close onboarding to prevent user being stuck
        setShowOnboarding(false)
      }
    } catch (error) {
      logError('Error saving onboarding data:', undefined, error instanceof Error ? error : undefined)
      track('error_occurred', {
        error: 'onboarding_completion_failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }, [track])

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
  }

  const handleStartOnboarding = () => {
    setShowWelcomeDashboard(false)
    setShowOnboarding(true)
  }

  const handleSkipWelcome = () => {
    setShowWelcomeDashboard(false)
  }

  // Check if onboarding should be shown
  useEffect(() => {
    if (data && !data.user.onboarding_completed) {
      // Show welcome dashboard first, then onboarding
      setShowWelcomeDashboard(true)
    }
  }, [data])

  // Support query param trigger (?onboarding=1) for reliability
  useEffect(() => {
    const onboardingFlag = searchParams?.get('onboarding')
    if (onboardingFlag === '1') {
      setShowWelcomeDashboard(false)
      setShowOnboarding(true)
      // Clean the param from URL without full reload
      const url = new URL(window.location.href)
      url.searchParams.delete('onboarding')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  // Track dashboard view
  useEffect(() => {
    if (data) {
      track('dashboard_viewed', {
        userLevel: data.user.level,
        totalPoints: data.user.total_points,
        streak: data.user.current_streak
      })
    }
  }, [data, track])

  // Show welcome dashboard for first-time users
  if (showWelcomeDashboard && data) {
    return (
      <WelcomeDashboard
        userData={data.user}
        onStartOnboarding={handleStartOnboarding}
        onSkipOnboarding={handleSkipWelcome}
      />
    )
  }

  if (authLoading || loading) {
    return (
      <div className="relative min-h-screen bg-cyber-black overflow-hidden">
        <NeuralNetworkCanvas />
        <UIOverlayLines />

        <SimpleOnboarding
          open={showOnboarding}
          onCompleteAction={handleOnboardingComplete}
          onSkipAction={handleOnboardingSkip}
        />

        <div className="relative z-10 flex items-center justify-center min-h-[60vh] px-6">
          <HudBorder className="max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-none flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(11,228,236,0.4)]">
              <Shield className="w-8 h-8 text-black animate-pulse" />
            </div>
            <h2 className="text-xl font-orbitron font-bold text-white mb-2">
              Loading Command Center...
            </h2>
            <p className="text-gray-400 font-mono">
              Preparing your dashboard
            </p>
          </HudBorder>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen bg-dark-bg overflow-hidden">
        <NeuralNetworkCanvas />
        <UIOverlayLines />

        <SimpleOnboarding
          open={showOnboarding}
          onCompleteAction={handleOnboardingComplete}
          onSkipAction={handleOnboardingSkip}
        />

        <div className="relative z-10 flex items-center justify-center min-h-[60vh] p-4">
          <HudBorder className="max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-600 rounded-none flex items-center justify-center mx-auto mb-4">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
              Mission Critical Error
            </h2>
            <p className="text-gray-400 mb-6 font-mono">{error}</p>
            <CyberButton
              onClick={() => window.location.reload()}
              variant="primary"
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              Retry Mission
            </CyberButton>
          </HudBorder>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="relative min-h-screen bg-cyber-black overflow-hidden">
        <NeuralNetworkCanvas />
        <UIOverlayLines />

        <SimpleOnboarding
          open={showOnboarding}
          onCompleteAction={handleOnboardingComplete}
          onSkipAction={handleOnboardingSkip}
        />

        <div className="relative z-10 flex items-center justify-center min-h-[60vh] p-4">
          <HudBorder className="max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-none flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(11,228,236,0.4)]">
              <Sparkles className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
              Welcome to SoloSuccess AI
            </h2>
            <p className="text-gray-400 mb-6 font-mono">Initialize your first mission to unlock insights.</p>
            <div className="space-y-3">
              <Link href="/dashboard/slaylist">
                <CyberButton
                  variant="primary"
                  className="w-full"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Create Mission
                </CyberButton>
              </Link>
              <Link href="/dashboard/agents">
                <CyberButton
                  variant="outline"
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Command
                </CyberButton>
              </Link>
            </div>
          </HudBorder>
        </div>
      </div>
    )
  }

  const { user: any, todaysStats, todaysTasks, activeGoals, recentConversations, recentBriefcases, insights } = data

  // Render mobile PWA dashboard for mobile devices
  if (isMobile) {
    return (
      <MobileDashboardEnhanced
        user={{
          name: data.user.full_name || data.user.email.split('@')[0],
          email: data.user.email,
          avatar: data.user.avatar_url || undefined,
          level: data.user.level,
          points: data.user.total_points
        }}
        dashboardData={{
          todaysStats: {
            tasks_completed: data.todaysStats.tasks_completed,
            total_tasks: data.todaysStats.total_tasks,
            focus_minutes: data.todaysStats.focus_minutes,
            ai_interactions: data.todaysStats.ai_interactions,
            goals_achieved: data.todaysStats.goals_achieved,
            productivity_score: data.todaysStats.productivity_score
          },
          todaysTasks: (data.todaysTasks || []).map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || undefined,
            status: task.status,
            priority: task.priority,
            estimated_minutes: 0,
            due_date: task.due_date || undefined
          })),
          todaysGoals: (data.activeGoals || []).map(goal => ({
            id: goal.id,
            title: goal.title,
            description: goal.description || undefined,
            progress: goal.progress_percentage,
            target: 100,
            deadline: goal.target_date || undefined
          }))
        }}
      />
    )
  }

  return (
    <main className="relative min-h-screen bg-dark-bg text-white overflow-hidden" role="main">
      <NeuralNetworkCanvas />
      <UIOverlayLines />

      <SimpleOnboarding
        open={showOnboarding}
        onCompleteAction={handleOnboardingComplete}
        onSkipAction={handleOnboardingSkip}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-6 py-10 space-y-10"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                rotate: [0, 6, -6, 0],
                scale: [1, 1.06, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-14 h-14 rounded-none border border-neon-cyan/50 bg-neon-cyan/10 flex items-center justify-center shadow-[0_0_20px_rgba(11,228,236,0.4)]"
            >
              <Crown className="w-7 h-7 text-neon-cyan" />
            </motion.div>
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-neon-cyan">Command Center</p>
              <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-white">
                Welcome back, {data.user.full_name || data.user.email.split('@')[0]}!
              </h1>
              <p className="text-sm text-gray-400 font-mono">
                Systems stable. Here is your live productivity intel.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="cyan" className="rounded-none">Level {data.user.level}</Badge>
            <Badge variant="purple" className="rounded-none">{data.user.total_points} pts</Badge>
          </div>
        </motion.div>

        {/* Today's Stats */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Today's Statistics</h2>
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HudBorder variant="hover" className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-none flex items-center justify-center shadow-[0_0_20px_rgba(11,228,236,0.4)]">
                  <CheckCircle className="w-6 h-6 text-black" />
                </div>
                <Badge variant="cyan" className="rounded-none">+15%</Badge>
              </div>
              <h3 className="text-2xl font-orbitron font-bold mb-1">
                {todaysStats.tasks_completed}/{todaysStats.total_tasks}
              </h3>
              <p className="text-gray-400 text-sm font-mono">Tasks Completed</p>
            </HudBorder>

            <HudBorder variant="hover" className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-none flex items-center justify-center shadow-[0_0_20px_rgba(11,228,236,0.4)]">
                  <Clock className="w-6 h-6 text-black" />
                </div>
                <Badge variant="cyan" className="rounded-none">+8%</Badge>
              </div>
              <h3 className="text-2xl font-orbitron font-bold mb-1">
                {todaysStats.focus_minutes}m
              </h3>
              <p className="text-gray-400 text-sm font-mono">Focus Time</p>
            </HudBorder>

            <HudBorder variant="hover" className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-none flex items-center justify-center shadow-[0_0_20px_rgba(11,228,236,0.4)]">
                  <MessageCircle className="w-6 h-6 text-black" />
                </div>
                <Badge variant="cyan" className="rounded-none">+12%</Badge>
              </div>
              <h3 className="text-2xl font-orbitron font-bold mb-1">
                {todaysStats.ai_interactions}
              </h3>
              <p className="text-gray-400 text-sm font-mono">AI Interactions</p>
            </HudBorder>

            <HudBorder variant="hover" className="p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-none flex items-center justify-center shadow-[0_0_20px_rgba(11,228,236,0.4)]">
                  <BarChart3 className="w-6 h-6 text-black" />
                </div>
                <Badge variant="cyan" className="rounded-none">+5%</Badge>
              </div>
              <h3 className="text-2xl font-orbitron font-bold mb-1">
                {todaysStats.productivity_score}%
              </h3>
              <p className="text-gray-400 text-sm font-mono">Productivity Score</p>
            </HudBorder>
          </motion.div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Tasks */}
          <section aria-labelledby="tasks-heading" className="lg:col-span-2">
            <h2 id="tasks-heading" className="sr-only">Today's Tasks</h2>
            <motion.div variants={itemVariants}>
              <HudBorder variant="hover" className="p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-orbitron font-bold flex items-center space-x-2">
                    <Target className="w-6 h-6 text-neon-cyan" />
                    <span>Today's Missions</span>
                  </h2>
                  <CyberButton variant="outline" size="sm">
                    View All
                  </CyberButton>
                </div>

                <div className="space-y-4">
                  {todaysTasks.length > 0 ? (
                    todaysTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-dark-card border border-neon-cyan/20 rounded-none hover:border-neon-cyan/50 transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <motion.div
                            whileHover={{ scale: 1.15 }}
                            className={`w-3 h-3 rounded-none ${task.status === 'completed' ? 'bg-neon-cyan' : 'bg-neon-purple/60'}`}
                            aria-hidden="true"
                          />
                          <div>
                            <p className="font-medium text-white font-mono">{task.title}</p>
                            {task.goal && (
                              <p className="text-sm text-gray-400 font-mono">
                                Goal: {task.goal.title}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={task.priority === 'high' ? 'magenta' : task.priority === 'medium' ? 'orange' : 'lime'}
                            className="rounded-none font-mono"
                          >
                            {task.priority}
                          </Badge>
                          {task.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-neon-cyan" />
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4 font-mono">No missions for today</p>
                      <CyberButton
                        variant="primary"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Mission
                      </CyberButton>
                    </div>
                  )}
                </div>
              </HudBorder>
            </motion.div>
          </section>

          {/* Active Goals */}
          <section aria-labelledby="goals-heading">
            <h2 id="goals-heading" className="sr-only">Active Goals</h2>
            <motion.div variants={itemVariants}>
              <HudBorder variant="hover" className="p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-orbitron font-bold flex items-center space-x-2">
                    <Trophy className="w-6 h-6 text-neon-cyan" />
                    <span>Active Objectives</span>
                  </h2>
                  <CyberButton size="sm" variant="primary">
                    View All
                  </CyberButton>
                </div>

                <div className="space-y-4">
                  {activeGoals.length > 0 ? (
                    activeGoals.map((goal, index) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-dark-card border border-neon-cyan/20 rounded-none"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white font-orbitron">{goal.title}</h3>
                          <Badge variant="purple" className="rounded-none font-mono">
                            {goal.progress_percentage}%
                          </Badge>
                        </div>
                        <div className="w-full bg-dark-bg border border-neon-cyan/10 rounded-none h-2 mb-2">
                          <div
                            className="bg-gradient-to-r from-neon-cyan to-neon-purple h-full rounded-none transition-all duration-300"
                            style={{ width: `${goal.progress_percentage}%` }}
                          />
                        </div>
                        {goal.target_date && (
                          <p className="text-xs text-gray-400 font-mono">
                            Due: {new Date(goal.target_date).toLocaleDateString()}
                          </p>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No active objectives</p>
                      <CyberButton
                        variant="primary"
                        size="sm"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Create Objective
                      </CyberButton>
                    </div>
                  )}
                </div>
              </HudBorder>
            </motion.div>
          </section>
        </div>

        {/* Recent Conversations & Insights */}
        <section aria-labelledby="conversations-heading">
          <h2 id="conversations-heading" className="sr-only">Recent Conversations and Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Conversations */}
            <motion.div variants={itemVariants}>
              <HudBorder variant="hover" className="p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-orbitron font-bold flex items-center space-x-2">
                    <MessageCircle className="w-6 h-6 text-neon-cyan" />
                    <span>Recent Intel</span>
                  </h2>
                  <CyberButton size="sm" variant="primary">
                    View All
                  </CyberButton>
                </div>

                <div className="space-y-3">
                  {recentConversations.length > 0 ? (
                    recentConversations.map((conversation, index) => (
                      <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-3 bg-dark-card border border-neon-cyan/20 rounded-none hover:border-neon-cyan/50 transition-all cursor-pointer"
                      >
                        <div
                          className="w-10 h-10 rounded-none flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: conversation.agent.accent_color }}
                        >
                          {conversation.agent.display_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white font-orbitron">{conversation.agent.display_name}</p>
                          <p className="text-sm text-gray-400 font-mono">
                            {new Date(conversation.last_message_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No recent intel</p>
                      <CyberButton
                        variant="primary"
                        size="sm"
                      >
                        Start Communication
                      </CyberButton>
                    </div>
                  )}
                </div>
              </HudBorder>
            </motion.div>

            {/* Insights */}
            <motion.div variants={itemVariants}>
              <HudBorder variant="hover" className="p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-orbitron font-bold flex items-center space-x-2">
                    <Sparkles className="w-6 h-6 text-neon-cyan" />
                    <span>AI Intelligence</span>
                  </h2>
                  <CyberButton size="sm" variant="primary">
                    View All
                  </CyberButton>
                </div>

                <div className="space-y-4">
                  {insights.length > 0 ? (
                    insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-dark-card border border-neon-cyan/20 rounded-none"
                      >
                        <h3 className="font-semibold text-white mb-2 font-orbitron">{insight.title}</h3>
                        <p className="text-sm text-gray-400 mb-3 font-mono">
                          {insight.description}
                        </p>
                        <CyberButton size="sm" variant="outline">
                          {insight.action}
                        </CyberButton>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">No intelligence yet</p>
                      <p className="text-sm text-gray-400">
                        Complete more missions to get AI insights
                      </p>
                    </div>
                  )}
                </div>
              </HudBorder>
            </motion.div>
          </div>
        </section>

        {/* Briefcase Section */}
        <section aria-labelledby="briefcase-heading">
          <h2 id="briefcase-heading" className="sr-only">Recent Briefcases</h2>
          <motion.div variants={itemVariants}>
            <HudBorder variant="hover" className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-orbitron font-bold flex items-center space-x-2">
                  <Briefcase className="w-6 h-6 text-neon-cyan" />
                  <span>Mission Briefcases</span>
                </h2>
                <Link href="/dashboard/briefcase">
                  <CyberButton size="sm" variant="primary">
                    View All
                  </CyberButton>
                </Link>
              </div>

              <div className="space-y-3">
                {recentBriefcases && recentBriefcases.length > 0 ? (
                  recentBriefcases.map((briefcase: any, index: number) => (
                    <motion.div
                      key={briefcase.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-dark-card border border-neon-cyan/20 rounded-none hover:border-neon-cyan/50 transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-none flex items-center justify-center shadow-[0_0_20px_rgba(11,228,236,0.4)]">
                        <Briefcase className="w-5 h-5 text-black" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white font-orbitron">{briefcase.title}</p>
                        <p className="text-sm text-gray-400 font-mono">
                          {briefcase.goal_count} objectives • {briefcase.task_count} missions
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          Updated {new Date(briefcase.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                        <div className="flex items-center space-x-2">
                        <Badge
                          variant={briefcase.status === 'active' ? 'lime' : briefcase.status === 'completed' ? 'cyan' : 'purple'}
                          className="rounded-none font-mono"
                        >
                          {briefcase.status}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No briefcases yet</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Create your first briefcase to organize your missions and objectives
                    </p>
                    <Link href="/dashboard/briefcase">
                      <CyberButton
                        variant="primary"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Briefcase
                      </CyberButton>
                    </Link>
                  </div>
                )}
              </div>
            </HudBorder>
          </motion.div>
        </section>
      </motion.div>
    </main>
  )
}
