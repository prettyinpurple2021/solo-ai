"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
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
} from "lucide-react"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-lg font-medium">Loading your SoloBoss empire...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null
  }

  // Mock user data
  const userStats = {
    level: 12,
    totalPoints: 2450,
    currentStreak: 7,
    tasksCompleted: 156,
    goalsAchieved: 23,
    focusMinutes: 1240,
    wellnessScore: 87,
  }

  const todaysTasks = [
    { id: 1, title: "Review Q4 marketing strategy", completed: false, priority: "high" },
    { id: 2, title: "Client call with Sarah", completed: true, priority: "medium" },
    { id: 3, title: "Update website copy", completed: false, priority: "high" },
    { id: 4, title: "Social media content batch", completed: true, priority: "low" },
    { id: 5, title: "Team standup meeting", completed: true, priority: "medium" },
  ]

  const aiAgents = [
    { name: "Roxy", status: "active", mood: "💪", lastActive: "2 min ago" },
    { name: "Blaze", status: "active", mood: "🔥", lastActive: "5 min ago" },
    { name: "Echo", status: "idle", mood: "✨", lastActive: "1 hour ago" },
    { name: "Nova", status: "active", mood: "🎨", lastActive: "Just now" },
  ]

  const recentAchievements = [
    { title: "Week Warrior", description: "7-day streak achieved!", emoji: "🔥", rarity: "rare" },
    { title: "Goal Crusher", description: "Completed 20+ goals", emoji: "🎯", rarity: "epic" },
    { title: "Focus Master", description: "20+ hours focused work", emoji: "🧠", rarity: "legendary" },
  ]

  const completedTasks = todaysTasks.filter((task) => task.completed).length
  const totalTasks = todaysTasks.length
  const completionRate = Math.round((completedTasks / totalTasks) * 100)

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

  return (
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
            <div className="text-sm text-muted-foreground">{userStats.totalPoints} Boss Points</div>
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
              <div className="text-3xl font-bold soloboss-text-gradient">{userStats.currentStreak} days</div>
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
              <div className="text-3xl font-bold soloboss-text-gradient">{userStats.tasksCompleted}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-muted-foreground">Total lifetime</span>
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
                {Math.round(userStats.focusMinutes / 60)}h
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm text-muted-foreground">This month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="boss-card glitter-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold empowering-text">Wellness Score</CardTitle>
              <Heart className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold soloboss-text-gradient">{userStats.wellnessScore}%</div>
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
                        task.completed
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
                        task.completed ? "line-through text-muted-foreground" : "empowering-text"
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.completed && <CheckSquare className="h-4 w-4 text-green-500" />}
                  </div>
                ))}
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
                {aiAgents.map((agent, index) => (
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
                ))}
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
                {recentAchievements.map((achievement, index) => (
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
                ))}
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
  )
}
