"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Activity,
  Zap,
  Award,
  Users,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface AnalyticsData {
  tasks: {
    total: number
    completed: number
    pending: number
    overdue: number
    completionRate: number
    weeklyTrend: number
  }
  goals: {
    total: number
    achieved: number
    inProgress: number
    achievementRate: number
    weeklyProgress: number
  }
  focus: {
    totalSessions: number
    totalHours: number
    averageSessionLength: number
    weeklyHours: number
    weeklyTrend: number
  }
  productivity: {
    overallScore: number
    weeklyScore: number
    monthlyScore: number
    improvement: number
  }
  insights: {
    topPerformingDay: string
    mostProductiveTime: string
    commonDistractions: string[]
    recommendations: string[]
  }
}

interface ProductivityDashboardProps {
  className?: string
}

export function ProductivityDashboard({ className = "" }: ProductivityDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week')

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = async () => {
      setIsLoading(true)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock data - in real app, this would come from API
      const mockData: AnalyticsData = {
        tasks: {
          total: 47,
          completed: 32,
          pending: 12,
          overdue: 3,
          completionRate: 68,
          weeklyTrend: 12
        },
        goals: {
          total: 8,
          achieved: 3,
          inProgress: 5,
          achievementRate: 37.5,
          weeklyProgress: 8
        },
        focus: {
          totalSessions: 24,
          totalHours: 18.5,
          averageSessionLength: 46,
          weeklyHours: 6.2,
          weeklyTrend: -5
        },
        productivity: {
          overallScore: 78,
          weeklyScore: 82,
          monthlyScore: 75,
          improvement: 9
        },
        insights: {
          topPerformingDay: "Tuesday",
          mostProductiveTime: "9:00 AM - 11:00 AM",
          commonDistractions: ["Social media", "Email checking", "Meetings"],
          recommendations: [
            "Schedule deep work blocks in your most productive hours",
            "Reduce meeting frequency to increase focus time",
            "Set specific time limits for email and social media"
          ]
        }
      }
      
      setData(mockData)
      setIsLoading(false)
    }
    
    loadAnalytics()
  }, [timeRange])

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight className="w-4 h-4 text-green-600" />
    if (trend < 0) return <ArrowDownRight className="w-4 h-4 text-red-600" />
    return <TrendingUp className="w-4 h-4 text-gray-600" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Productivity Analytics</h2>
          <p className="text-gray-600">Track your performance and get insights</p>
        </div>
        
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Task Completion</p>
                <p className="text-2xl font-bold">{data.tasks.completionRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(data.tasks.weeklyTrend)}
                  <span className={`text-xs ${getTrendColor(data.tasks.weeklyTrend)}`}>
                    {Math.abs(data.tasks.weeklyTrend)}% from last week
                  </span>
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <Progress value={data.tasks.completionRate} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Goal Achievement</p>
                <p className="text-2xl font-bold">{data.goals.achievementRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(data.goals.weeklyProgress)}
                  <span className={`text-xs ${getTrendColor(data.goals.weeklyProgress)}`}>
                    {Math.abs(data.goals.weeklyProgress)}% progress this week
                  </span>
                </div>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <Progress value={data.goals.achievementRate} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Focus Hours</p>
                <p className="text-2xl font-bold">{data.focus.weeklyHours}h</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(data.focus.weeklyTrend)}
                  <span className={`text-xs ${getTrendColor(data.focus.weeklyTrend)}`}>
                    {Math.abs(data.focus.weeklyTrend)}% from last week
                  </span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Avg session: {data.focus.averageSessionLength}min
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productivity Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(data.productivity.weeklyScore)}`}>
                  {data.productivity.weeklyScore}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(data.productivity.improvement)}
                  <span className={`text-xs ${getTrendColor(data.productivity.improvement)}`}>
                    {Math.abs(data.productivity.improvement)}% improvement
                  </span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
            <Progress value={data.productivity.weeklyScore} className="mt-4" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Task Overview
            </CardTitle>
            <CardDescription>Your task completion breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{data.tasks.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{data.tasks.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{data.tasks.overdue}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Completion Rate</span>
                <span className="text-sm font-medium">{data.tasks.completionRate}%</span>
              </div>
              <Progress value={data.tasks.completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Goal Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Goal Progress
            </CardTitle>
            <CardDescription>Track your goal achievements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{data.goals.achieved}</div>
                <div className="text-sm text-gray-600">Achieved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{data.goals.inProgress}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{data.goals.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Achievement Rate</span>
                <span className="text-sm font-medium">{data.goals.achievementRate}%</span>
              </div>
              <Progress value={data.goals.achievementRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            AI Insights & Recommendations
          </CardTitle>
          <CardDescription>Personalized insights to boost your productivity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Insights */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-600" />
                Performance Insights
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm">Best performing day</span>
                  <Badge variant="secondary">{data.insights.topPerformingDay}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm">Most productive time</span>
                  <Badge variant="secondary">{data.insights.mostProductiveTime}</Badge>
                </div>
              </div>
            </div>

            {/* Distractions */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600" />
                Common Distractions
              </h4>
              <div className="space-y-2">
                {data.insights.commonDistractions.map((distraction, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">{distraction}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              AI Recommendations
            </h4>
            <div className="space-y-2">
              {data.insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
