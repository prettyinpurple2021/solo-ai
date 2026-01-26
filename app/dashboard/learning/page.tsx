"use client"

export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loading } from '@/components/ui/loading'
import {
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Clock,
  Brain,
  CheckCircle,
  Star,
  Zap,
  Play,
  Download,
  RefreshCw,
  Sparkles,
  Crown,
  ArrowRight,
  BarChart3,
  Trophy,
  Flame,
  GraduationCap
} from 'lucide-react'
import { toast } from 'sonner'
import { logInfo, logError } from '@/lib/logger'

interface Skill {
  id: string
  name: string
  description: string
  category: string
  level: number
  experience_points: number
}

interface LearningModule {
  id: string
  title: string
  description: string
  duration_minutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  skills_covered: string[]
  prerequisites: string[]
  completion_rate: number
  rating: number
}

interface UserProgress {
  module_id: string
  completion_percentage: number
  time_spent: number
  quiz_scores: { quiz_id: string; score: number }[]
  exercises_completed: string[]
  last_accessed: string
  started_at: string
}

interface LearningRecommendation {
  module_id: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  estimated_impact: number
  prerequisites_met: boolean
  estimated_completion_time: number
}

interface SkillGap {
  skill: Skill
  gap_score: number
  priority: 'high' | 'medium' | 'low'
  recommended_modules: LearningModule[]
}

interface LearningAnalytics {
  total_modules_completed: number
  total_time_spent: number
  average_quiz_score: number
  skills_improved: number
  current_streak: number
  learning_velocity: number
  top_categories: Array<{ category: string; time_spent: number; modules_completed: number }>
  certifications_earned: number
  peer_rank: number
  weekly_goal_progress: number
}

export default function LearningDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'skill-gaps' | 'recommendations' | 'progress' | 'analytics' | 'achievements'>('overview')
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([])
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadLearningData = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const headers = { 'Authorization': `Bearer ${token}` }

      // Fetch modules
      const modulesRes = await fetch('/api/learning/modules', { headers })
      const modules = await modulesRes.json()

      // Fetch progress
      const progressRes = await fetch('/api/learning/progress', { headers })
      const userProgress = await progressRes.json()

      // Fetch analytics
      const analyticsRes = await fetch('/api/learning/analytics', { headers })
      const realAnalytics = await analyticsRes.json()

      // Map progress to UI model
      const mappedProgress: UserProgress[] = userProgress.map((p: any) => ({
        module_id: p.module_id.toString(),
        completion_percentage: p.completion_percentage,
        time_spent: p.time_spent,
        quiz_scores: [], // Placeholder
        exercises_completed: [], // Placeholder
        last_accessed: p.last_accessed,
        started_at: p.started_at
      }))

      setAnalytics(realAnalytics)
      setSkillGaps([]) // Placeholder until skill gap analysis is implemented
      setRecommendations([]) // Placeholder until recommendation engine is implemented
      setProgress(mappedProgress)

      logInfo('Learning data loaded successfully')
    } catch (error) {
      logError('Error loading learning data:', error)
      toast.error('Failed to load learning data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLearningData()
  }, [loadLearningData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadLearningData()
    setRefreshing(false)
    toast.success('Learning data refreshed!')
  }

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
        duration: 0.5
      }
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <Loading 
            variant="pulse" 
            size="lg" 
          />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{
                  boxShadow: ["0 0 10px #0ea5e9", "0 0 20px #a855f7", "0 0 10px #0ea5e9"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-14 h-14 bg-dark-card border border-neon-cyan/50 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <GraduationCap className="w-7 h-7 text-neon-cyan" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Learning Center</h1>
                <p className="text-lg text-gray-400">
                  Personalized learning paths to accelerate your entrepreneurial journey
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-neon-cyan text-black font-bold hover:bg-neon-cyan/80">
              <Download className="w-4 h-4 mr-2" />
              Export Progress
            </Button>
          </div>
        </motion.div>

        {/* Learning Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-dark-card border border-neon-cyan/30 p-1">
              <TabsTrigger value="overview" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                <BookOpen className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="skill-gaps" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                <Target className="w-4 h-4 mr-2" />
                Skill Gaps
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                <TrendingUp className="w-4 h-4 mr-2" />
                Recs
              </TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                <Award className="w-4 h-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
                <Trophy className="w-4 h-4 mr-2" />
                Rewards
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              {analytics && <OverviewTab analytics={analytics} formatTime={formatTime} />}
            </TabsContent>

            {/* Skill Gaps Tab */}
            <TabsContent value="skill-gaps" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <SkillGapsTab skillGaps={skillGaps} getPriorityColor={getPriorityColor} />
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <RecommendationsTab recommendations={recommendations} getPriorityColor={getPriorityColor} />
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <ProgressTab progress={progress} formatTime={formatTime} />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              {analytics && <AnalyticsTab analytics={analytics} formatTime={formatTime} />}
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <AchievementsTab analytics={analytics} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}

function OverviewTab({ analytics, formatTime }: { analytics: LearningAnalytics, formatTime: (m: number) => string }) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-dark-card border-neon-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 font-orbitron">Modules Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.total_modules_completed}</div>
            <p className="text-xs text-green-400 font-mono mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +3 this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-neon-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 font-orbitron">Learning Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.current_streak} days</div>
            <p className="text-xs text-orange-400 font-mono mt-1 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Keep it going!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-neon-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 font-orbitron">Skills Improved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.skills_improved}</div>
            <p className="text-xs text-blue-400 font-mono mt-1 flex items-center">
              <ArrowRight className="w-3 h-3 mr-1" />
              Leveling up!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-neon-cyan/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 font-orbitron">Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.certifications_earned}</div>
            <p className="text-xs text-purple-400 font-mono mt-1 flex items-center">
              <Award className="w-3 h-3 mr-1" />
              Achievements unlocked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-dark-card border-neon-cyan/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-orbitron">
              <Target className="w-5 h-5 text-green-400" />
              Weekly Learning Goal
            </CardTitle>
            <CardDescription className="text-gray-400 font-mono">
              Track your progress towards weekly learning objectives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between font-mono">
              <span className="text-gray-400">Progress</span>
              <span className="text-neon-cyan font-bold">{analytics.weekly_goal_progress}%</span>
            </div>
            <Progress value={analytics.weekly_goal_progress} className="h-3 bg-dark-bg border border-neon-cyan/20" indicatorClassName="bg-neon-cyan" />
            <div className="flex items-center justify-between text-sm font-mono text-gray-400">
              <span className="text-green-400">3 modules completed</span>
              <span>4 modules target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-neon-cyan/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-orbitron">
              <Crown className="w-5 h-5 text-yellow-400" />
              Peer Ranking
            </CardTitle>
            <CardDescription className="text-gray-400 font-mono">
              Your position among other learners
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2 font-orbitron">#{analytics.peer_rank}</div>
              <p className="text-gray-400 font-mono">Out of 150 learners</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-500 text-sm font-bold font-mono">Top 5% performer</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Learning Categories */}
      <Card className="bg-dark-card border-neon-cyan/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-orbitron">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Top Learning Categories
          </CardTitle>
          <CardDescription className="text-gray-400 font-mono">
            Your most focused learning areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.top_categories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-neon-cyan/20 hover:border-neon-cyan/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan rounded-full flex items-center justify-center font-bold text-sm font-mono shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white font-orbitron text-sm">{category.category}</h4>
                    <p className="text-xs text-gray-400 font-mono">{category.modules_completed} modules</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neon-cyan font-bold font-mono">{formatTime(category.time_spent)}</div>
                  <div className="text-xs text-gray-500 font-mono">Total time</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SkillGapsTab({ skillGaps, getPriorityColor }: { skillGaps: SkillGap[], getPriorityColor: (p: string) => string }) {
  if (skillGaps.length === 0) {
    return (
      <Card className="bg-dark-card border-neon-cyan/30">
        <CardContent className="text-center py-16">
          <Target className="w-20 h-20 text-green-500 mx-auto mb-6 opacity-80" />
          <h3 className="text-2xl font-bold text-white mb-3 font-orbitron">No Skill Gaps Detected!</h3>
          <p className="text-gray-400 font-mono max-w-md mx-auto">You're doing great! Keep up the excellent work and continue monitoring your progress.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {skillGaps.map((gap, index) => (
        <motion.div
          key={gap.skill.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-dark-card border-neon-cyan/30">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white font-orbitron text-lg">{gap.skill.name}</CardTitle>
                  <CardDescription className="text-gray-400 font-mono">{gap.skill.description}</CardDescription>
                </div>
                <Badge variant="orange" className={`${getPriorityColor(gap.priority)} font-bold`}>
                  {gap.gap_score}% gap
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-gray-400">Skill Gap Score</span>
                  <span className="text-white">{gap.gap_score}%</span>
                </div>
                <Progress value={gap.gap_score} className="h-2 bg-dark-bg" indicatorClassName="bg-gradient-to-r from-red-500 to-yellow-500" />
              </div>

              {gap.recommended_modules.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h4 className="font-semibold text-neon-cyan font-orbitron text-sm uppercase tracking-wider">Recommended Modules:</h4>
                  {gap.recommended_modules.map((module) => (
                    <div key={module.id} className="p-3 bg-dark-bg/60 rounded-lg border border-neon-cyan/20 hover:border-neon-cyan/40 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-white font-orbitron text-sm">{module.title}</h5>
                        <Badge variant="purple" className="flex items-center gap-1">
                          {module.duration_minutes}m
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-3 font-mono line-clamp-2">{module.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                             <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                             <span className="text-sm text-white font-mono">{module.rating}</span>
                          </div>
                          <Badge variant="purple" className="border-purple-500/50 text-purple-400 text-xs">
                            {module.difficulty}
                          </Badge>
                        </div>
                        <Button size="sm" className="h-7 text-xs bg-neon-cyan text-black font-bold hover:bg-neon-cyan/80">
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function RecommendationsTab({ recommendations, getPriorityColor }: { recommendations: LearningRecommendation[], getPriorityColor: (p: string) => string }) {
  if (recommendations.length === 0) {
    return (
      <Card className="bg-dark-card border-neon-cyan/30">
        <CardContent className="text-center py-16">
          <TrendingUp className="w-20 h-20 text-blue-500 mx-auto mb-6 opacity-80" />
          <h3 className="text-2xl font-bold text-white mb-3 font-orbitron">No Recommendations Yet</h3>
          <p className="text-gray-400 font-mono max-w-md mx-auto">Complete a skill assessment to get personalized recommendations tailored to your goals.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {recommendations.map((rec, index) => (
        <motion.div
          key={rec.module_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-dark-card border-neon-cyan/30 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-neon-cyan to-purple-600 opacity-80"></div>
            <CardHeader className="pl-6">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white font-orbitron">Learning Module #{index + 1}</CardTitle>
                  <CardDescription className="text-gray-400 font-mono mt-1">{rec.reason}</CardDescription>
                </div>
                <Badge variant="orange" className={`${getPriorityColor(rec.priority)} font-bold`}>
                  {rec.priority} priority
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pl-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-gray-400">Estimated Impact</span>
                  <span className="text-neon-cyan font-bold">{rec.estimated_impact}%</span>
                </div>
                <Progress value={rec.estimated_impact} className="h-2 bg-dark-bg" indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500" />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {rec.prerequisites_met ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-yellow-500 rounded-full" />
                  )}
                  <span className={`text-sm font-mono ${rec.prerequisites_met ? 'text-green-400' : 'text-yellow-500'}`}>
                    {rec.prerequisites_met ? 'Prerequisites met' : 'Prerequisites required'}
                  </span>
                </div>
                <div className="text-sm text-gray-400 font-mono flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  ~{rec.estimated_completion_time}m to complete
                </div>
              </div>

              <Button className="w-full mt-4 bg-neon-cyan text-black font-bold hover:bg-neon-cyan/80 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
                <Play className="w-4 h-4 mr-2" />
                Start Learning Module
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function ProgressTab({ progress, formatTime }: { progress: UserProgress[], formatTime: (m: number) => string }) {
  if (progress.length === 0) {
    return (
      <Card className="bg-dark-card border-neon-cyan/30">
        <CardContent className="text-center py-16">
          <Award className="w-20 h-20 text-purple-500 mx-auto mb-6 opacity-80" />
          <h3 className="text-2xl font-bold text-white mb-3 font-orbitron">No Learning Progress Yet</h3>
          <p className="text-gray-400 font-mono max-w-md mx-auto">Start your first learning module to track your progress and earn achievements.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {progress.map((prog, index) => (
        <motion.div
          key={prog.module_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-dark-card border-neon-cyan/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-orbitron">Module: {prog.module_id}</CardTitle>
                <Badge variant="lime" className="font-mono">
                  {prog.completion_percentage}% Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">{prog.completion_percentage}%</span>
                </div>
                <Progress value={prog.completion_percentage} className="h-3 bg-dark-bg" indicatorClassName="bg-gradient-to-r from-green-500 to-blue-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
                <div className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg border border-neon-cyan/10">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium font-mono">{formatTime(prog.time_spent)}</div>
                    <div className="text-gray-500 text-xs uppercase tracking-wider">Time Spent</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg border border-neon-cyan/10">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-white font-medium font-mono">{prog.quiz_scores.length}</div>
                    <div className="text-gray-500 text-xs uppercase tracking-wider">Quizzes Taken</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-dark-bg rounded-lg border border-neon-cyan/10">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-white font-medium font-mono">{prog.exercises_completed.length}</div>
                    <div className="text-gray-500 text-xs uppercase tracking-wider">Exercises Done</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neon-cyan/10 mt-2">
                <div className="text-sm text-gray-500 font-mono">
                  Last accessed: {new Date(prog.last_accessed).toLocaleDateString()}
                </div>
                <Button size="sm" className="bg-transparent border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function AnalyticsTab({ analytics, formatTime }: { analytics: LearningAnalytics, formatTime: (m: number) => string }) {
  return (
    <div className="space-y-8">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-dark-card border-neon-cyan/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-orbitron text-base">
              <Brain className="w-5 h-5 text-blue-400" />
              Quiz Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400 mb-2 font-mono">{analytics.average_quiz_score}%</div>
            <p className="text-gray-400 text-sm">Average Score</p>
            <div className="mt-3">
              <Progress value={analytics.average_quiz_score} className="h-2 bg-dark-bg" indicatorClassName="bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-neon-cyan/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-orbitron text-base">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Learning Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400 mb-2 font-mono">{analytics.learning_velocity}</div>
            <p className="text-gray-400 text-sm">Modules/Week</p>
            <div className="mt-3">
              <Badge variant="lime">
                Above Average
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-card border-neon-cyan/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-orbitron text-base">
              <Award className="w-5 h-5 text-purple-400" />
              Skills Improved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400 mb-2 font-mono">{analytics.skills_improved}</div>
            <p className="text-gray-400 text-sm">Total Skills</p>
            <div className="mt-3">
              <Badge variant="purple">
                Excellent Progress
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Distribution */}
      <Card className="bg-dark-card border-neon-cyan/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white font-orbitron">
            <BarChart3 className="w-5 h-5 text-neon-cyan" />
            Learning Distribution
          </CardTitle>
          <CardDescription className="text-gray-400">
            Time spent across different learning categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {analytics.top_categories.map((category,) => {
              const totalTime = analytics.top_categories.reduce((sum, c) => sum + c.time_spent, 0)
              const percentage = totalTime > 0 ? (category.time_spent / totalTime) * 100 : 0

              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium font-mono">{category.category}</span>
                    <span className="text-white text-sm font-mono">{formatTime(category.time_spent)}</span>
                  </div>
                  <Progress value={percentage} className="h-2 bg-dark-bg" indicatorClassName="bg-gradient-to-r from-neon-cyan to-purple-600" />
                  <div className="flex justify-between text-xs text-gray-500 font-mono">
                    <span>{category.modules_completed} modules</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AchievementsTab({ analytics }: { analytics: LearningAnalytics | null }) {
  const achievements = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first learning module',
      icon: Star,
      unlocked: true,
      progress: 100,
      color: 'text-yellow-400'
    },
    {
      id: '2',
      title: 'Streak Master',
      description: 'Maintain a 10-day learning streak',
      icon: Flame,
      unlocked: analytics ? analytics.current_streak >= 10 : false,
      progress: analytics ? Math.min((analytics.current_streak / 10) * 100, 100) : 0,
      color: 'text-orange-400'
    },
    {
      id: '3',
      title: 'Knowledge Seeker',
      description: 'Complete 20 learning modules',
      icon: BookOpen,
      unlocked: analytics ? analytics.total_modules_completed >= 20 : false,
      progress: analytics ? Math.min((analytics.total_modules_completed / 20) * 100, 100) : 0,
      color: 'text-blue-400'
    },
    {
      id: '4',
      title: 'Certification Collector',
      description: 'Earn 5 certifications',
      icon: Award,
      unlocked: analytics ? analytics.certifications_earned >= 5 : false,
      progress: analytics ? Math.min((analytics.certifications_earned / 5) * 100, 100) : 0,
      color: 'text-purple-400'
    },
    {
      id: '5',
      title: 'Top Performer',
      description: 'Achieve top 10% ranking',
      icon: Trophy,
      unlocked: analytics ? analytics.peer_rank <= 15 : false,
      progress: analytics ? Math.min((15 / analytics.peer_rank) * 100, 100) : 0,
      color: 'text-green-400'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-dark-card border  ${achievement.unlocked ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-neon-cyan/20'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${achievement.unlocked ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 animate-pulse ring-1 ring-white/20' : 'bg-dark-bg'}`}>
                    <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? achievement.color : 'text-gray-600'}`} />
                  </div>
                  {achievement.unlocked && (
                    <Badge variant="orange">
                      Unlocked
                    </Badge>
                  )}
                </div>
                <CardTitle className={`mt-4 font-orbitron ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>{achievement.title}</CardTitle>
                <CardDescription className="text-gray-400 font-mono text-sm">{achievement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-mono">
                    <span className="text-gray-500">Progress</span>
                    <span className={achievement.unlocked ? 'text-white' : 'text-gray-500'}>{Math.round(achievement.progress)}%</span>
                  </div>
                  <Progress value={achievement.progress} className="h-2 bg-dark-bg" indicatorClassName={`bg-gradient-to-r ${achievement.unlocked ? 'from-green-500 to-emerald-500' : 'from-gray-700 to-gray-600'}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}