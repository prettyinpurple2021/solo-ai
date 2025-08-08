"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import {
  Crown,
  Target,
  Users,
  Briefcase,
  Palette,
  Focus,
  Sparkles,
  TrendingUp,
  CheckSquare,
  Clock,
  Award,
  Flame,
  Heart,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

export default function DashboardPage() {
  const { data: dashboardData, loading: dataLoading, error, refetch, lastUpdated } = useDashboardData()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Show loading state while loading data
  if (dataLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-lg font-medium">Loading your SoloBoss empire...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Show error state if data failed to load
  if (error) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Use real data from API
  const userStats = dashboardData?.user || {
    level: 1,
    total_points: 0,
    current_streak: 0,
    wellness_score: 50,
    focus_minutes: 0,
  }

  const todaysStats = dashboardData?.todaysStats || {
    tasks_completed: 0,
    total_tasks: 0,
    focus_minutes: 0,
    ai_interactions: 0,
    goals_achieved: 0,
    productivity_score: 0,
  }

  const todaysTasks = dashboardData?.todaysTasks || []
  const activeGoals = dashboardData?.activeGoals || []
  const recentConversations = dashboardData?.recentConversations || []
  const recentAchievements = dashboardData?.recentAchievements || []
  const weeklyFocus = dashboardData?.weeklyFocus || {
    total_minutes: 0,
    sessions_count: 0,
    average_session: 0,
  }

  // Calculate completion rate
  const completedTasks = todaysTasks.filter((task) => task.status === 'completed').length
  const totalTasks = todaysTasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Format AI agent status for display
  const aiAgents = recentConversations.slice(0, 4).map(conv => ({
    name: conv.agent.display_name,
    status: "active" as const,
    mood: "💪",
    lastActive: formatTimeAgo(conv.last_message_at),
  }))

  // Format achievements for display
  const formattedAchievements = recentAchievements.slice(0, 3).map(userAchiev => ({
    title: userAchiev.achievement.title,
    description: userAchiev.achievement.description,
    emoji: "🏆",
    rarity: "rare" as const,
  }))

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      case "epic":
        return "bg-gradient-to-r from-purple-400 to-blue-500 text-white"
      case "rare":
        return "bg-gradient-to-r from-blue-400 to-teal-500 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Helper function to format time ago
  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`
    return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`
  }

  // Helper function to format last updated time
  function formatLastUpdated(date: Date | null): string {
    if (!date) return "Never"
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    return `${Math.floor(diffInSeconds / 3600)}h ago`
  }

  return (
    <ProtectedRoute>
      <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-gradient-to-r from-purple-50 to-teal-50">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold">Boss Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Updated {formatLastUpdated(lastUpdated)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            disabled={dataLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-4 bg-gradient-to-br from-purple-50/30 via-white to-teal-50/30">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight boss-heading flex items-center gap-3">
              <Crown className="h-10 w-10 text-purple-600" />
              Welcome Back, Boss!
              <span className="text-2xl">👑</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-2 font-medium">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              •{" "}
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold soloboss-text-gradient">Level {userStats.level}</div>
            <div className="text-sm text-muted-foreground">{userStats.total_points} Boss Points</div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="boss-card glitter-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold empowering-text">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold soloboss-text-gradient">{userStats.current_streak} days</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-sm font-medium text-green-600">Keep it up!</span>
              </div>
            </CardContent>
          </Card>

          <Card className="boss-card glitter-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold empowering-text">Tasks Completed</CardTitle>
              <CheckSquare className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold soloboss-text-gradient">{todaysStats.tasks_completed}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-muted-foreground">Today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="boss-card glitter-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold empowering-text">Focus Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold soloboss-text-gradient">
                {Math.round(weeklyFocus.total_minutes / 60)}h
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-muted-foreground">This week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="boss-card glitter-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold empowering-text">Wellness Score</CardTitle>
              <Heart className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold soloboss-text-gradient">{userStats.wellness_score}%</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-sm font-medium text-green-600">Excellent!</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Today's Tasks */}
          <Card className="boss-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Today's Boss Moves
              </CardTitle>
              <CardDescription>
                {completedTasks}/{totalTasks} completed ({completionRate}%)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={completionRate} className="h-2" />
                {todaysTasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.status === 'completed'
                          ? "bg-green-500"
                          : task.priority === "high"
                            ? "bg-red-500"
                            : task.priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm flex-1 ${
                        task.status === 'completed' ? "line-through text-muted-foreground" : "empowering-text"
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.status === 'completed' && <CheckSquare className="h-4 w-4 text-green-500" />}
                  </div>
                ))}
                {todaysTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No tasks scheduled for today. Time to slay some goals! 💪
                  </p>
                )}
                <Button variant="outline" className="w-full mt-3 bg-transparent" asChild>
                  <a href="/dashboard/slaylist">View All Tasks</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Squad Status */}
          <Card className="boss-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" />
                AI Squad Status
              </CardTitle>
              <CardDescription>Your virtual team is ready to dominate! 🤖</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiAgents.length > 0 ? (
                  aiAgents.map((agent, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{agent.mood}</div>
                        <div>
                          <p className="font-semibold empowering-text">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.lastActive}</p>
                        </div>
                      </div>
                      <Badge variant={agent.status === "active" ? "default" : "secondary"} className="text-xs">
                        {agent.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Start chatting with your AI squad to see them here! 💬
                  </p>
                )}
                <Button variant="outline" className="w-full mt-3 bg-transparent" asChild>
                  <a href="/team">Manage Squad</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="boss-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Recent Wins
              </CardTitle>
              <CardDescription>Your legendary achievements! 🏆</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formattedAchievements.length > 0 ? (
                  formattedAchievements.map((achievement, index) => (
                    <div key={index} className="p-3 border rounded-lg boss-card bounce-on-hover">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{achievement.emoji}</span>
                          <div>
                            <h4 className="font-semibold empowering-text text-sm">{achievement.title}</h4>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                        <Badge className={`${getRarityColor(achievement.rarity)} text-xs font-bold`}>
                          {achievement.rarity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Complete tasks and goals to earn achievements! 🎯
                  </p>
                )}
                <Button variant="outline" className="w-full mt-3 bg-transparent">
                  View All Achievements
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button asChild className="punk-button h-16 text-white">
            <a href="/dashboard/slaylist" className="flex flex-col items-center gap-2">
              <Target className="h-6 w-6" />
              <span>SlayList</span>
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-16 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
          >
            <a href="/dashboard/briefcase" className="flex flex-col items-center gap-2">
              <Briefcase className="h-6 w-6 text-purple-600" />
              <span className="empowering-text">Briefcase</span>
            </a>
          </Button>
          <Button asChild variant="outline" className="h-16 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
            <a href="/dashboard/brand" className="flex flex-col items-center gap-2">
              <Palette className="h-6 w-6 text-teal-600" />
              <span className="empowering-text">Brand Studio</span>
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-16 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
          >
            <a href="/dashboard/focus" className="flex flex-col items-center gap-2">
              <Focus className="h-6 w-6 text-green-600" />
              <span className="empowering-text">Focus Mode</span>
            </a>
          </Button>
        </div>

        {/* Motivational Footer */}
        <Card className="boss-card soloboss-gradient text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6" />
              You're Building Something Legendary!
              <Crown className="h-6 w-6" />
            </h3>
            <p className="text-lg opacity-90">
              Every task completed, every goal achieved, every moment of focus - it all adds up to your empire. Keep
              slaying, boss! 💪✨
            </p>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
    </ProtectedRoute>
  )
}
