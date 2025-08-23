"use client"

import { useState, useEffect } from "react"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  Target, 
  TrendingUp, 
  Clock, 
  MessageCircle, 
  Trophy,
  Calendar,
  Zap
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
    <>
      <OnboardingWizard 
        open={showOnboarding} 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
      
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
              </div>
    </div>
    </>
  )
}

  if (error) {
    return (
      <>
        <OnboardingWizard 
          open={showOnboarding} 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
        
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <OnboardingWizard 
          open={showOnboarding} 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
        
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Welcome to SoloBoss AI</h2>
                <p className="text-gray-600 mb-4">Get started by creating your first goal or task.</p>
                <div className="space-x-4">
                  <Link href="/dashboard/slaylist">
                    <Button>Create Goal</Button>
                  </Link>
                  <Link href="/dashboard/agents">
                    <Button variant="outline">Chat with AI</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const { user, todaysStats, todaysTasks, activeGoals, recentConversations, insights: _insights } = data

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.full_name || user.email.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your empire today</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-800">
            Level {user.level}
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            {user.total_points} pts
          </Badge>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold">{todaysStats.tasks_completed}/{todaysStats.total_tasks}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Focus Time</p>
                <p className="text-2xl font-bold">{todaysStats.focus_minutes}m</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Interactions</p>
                <p className="text-2xl font-bold">{todaysStats.ai_interactions}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productivity</p>
                <p className="text-2xl font-bold">{todaysStats.productivity_score}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Tasks
              </CardTitle>
              <CardDescription>
                {todaysTasks.length} tasks for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaysTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks for today</p>
                  <Link href="/dashboard/slaylist">
                    <Button className="mt-4" variant="outline">
                      Create Task
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.goal && (
                            <p className="text-sm text-gray-500">Goal: {task.goal.title}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                  {todaysTasks.length > 5 && (
                    <div className="text-center pt-2">
                      <Link href="/dashboard/slaylist">
                        <Button variant="outline" size="sm">
                          View All Tasks
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Active Goals */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Active Goals
              </CardTitle>
              <CardDescription>
                {activeGoals.length} goals in progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeGoals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No active goals</p>
                  <Link href="/dashboard/slaylist">
                    <Button className="mt-4" variant="outline" size="sm">
                      Create Goal
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeGoals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{goal.title}</p>
                        <span className="text-sm text-gray-500">{goal.progress_percentage}%</span>
                      </div>
                      <Progress value={goal.progress_percentage} className="h-2" />
                      <p className="text-xs text-gray-500">
                        {goal.tasks_completed}/{goal.tasks_total} tasks completed
                      </p>
                    </div>
                  ))}
                  {activeGoals.length > 3 && (
                    <div className="text-center pt-2">
                      <Link href="/dashboard/slaylist">
                        <Button variant="outline" size="sm">
                          View All Goals
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent AI Conversations */}
      {recentConversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Recent AI Conversations
            </CardTitle>
            <CardDescription>
              Continue your conversations with your AI squad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentConversations.slice(0, 6).map((conversation) => (
                <Link key={conversation.id} href={`/dashboard/agents?conversation=${conversation.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: conversation.agent.accent_color }}
                        >
                          {conversation.agent.display_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {conversation.title || conversation.agent.display_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(conversation.last_message_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Jump into your most important workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/slaylist">
              <Button className="w-full h-20 flex-col gap-2" variant="outline">
                <Target className="w-6 h-6" />
                <span className="text-sm">Goals & Tasks</span>
              </Button>
            </Link>
            <Link href="/dashboard/agents">
              <Button className="w-full h-20 flex-col gap-2" variant="outline">
                <MessageCircle className="w-6 h-6" />
                <span className="text-sm">AI Squad</span>
              </Button>
            </Link>
            <Link href="/dashboard/focus">
              <Button className="w-full h-20 flex-col gap-2" variant="outline">
                <Clock className="w-6 h-6" />
                <span className="text-sm">Focus Mode</span>
              </Button>
            </Link>
            <Link href="/dashboard/brand">
              <Button className="w-full h-20 flex-col gap-2" variant="outline">
                <Trophy className="w-6 h-6" />
                <span className="text-sm">Brand Studio</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}