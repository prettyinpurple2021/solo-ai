"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Shield,
  Heart,
  Brain,
  Activity,
  AlertTriangle,
  CheckCircle,
  Coffee,
  Moon,
  Dumbbell,
  Smile,
  Crown,
  Star,
  Sparkles,
} from "lucide-react"

export default function BurnoutShield() {
  const [wellnessScore] = useState(72)
  const [stressLevel] = useState(65)
  const [energyLevel] = useState(45)
  const [sleepQuality] = useState(80)

  const wellnessMetrics = [
    {
      title: "Boss Wellness",
      value: wellnessScore,
      icon: Heart,
      color: wellnessScore >= 70 ? "text-green-500" : wellnessScore >= 50 ? "text-yellow-500" : "text-red-500",
      status: wellnessScore >= 70 ? "Slaying" : wellnessScore >= 50 ? "Good" : "Needs TLC",
      emoji: wellnessScore >= 70 ? "💪" : wellnessScore >= 50 ? "👍" : "🤗",
    },
    {
      title: "Stress Level",
      value: stressLevel,
      icon: Brain,
      color: stressLevel <= 30 ? "text-green-500" : stressLevel <= 60 ? "text-yellow-500" : "text-red-500",
      status: stressLevel <= 30 ? "Zen Queen" : stressLevel <= 60 ? "Manageable" : "Time to Chill",
      emoji: stressLevel <= 30 ? "🧘‍♀️" : stressLevel <= 60 ? "😌" : "😰",
    },
    {
      title: "Energy Level",
      value: energyLevel,
      icon: Activity,
      color: energyLevel >= 70 ? "text-green-500" : energyLevel >= 50 ? "text-yellow-500" : "text-red-500",
      status: energyLevel >= 70 ? "Energized" : energyLevel >= 50 ? "Steady" : "Need Boost",
      emoji: energyLevel >= 70 ? "⚡" : energyLevel >= 50 ? "🔋" : "🪫",
    },
    {
      title: "Sleep Quality",
      value: sleepQuality,
      icon: Moon,
      color: sleepQuality >= 70 ? "text-green-500" : sleepQuality >= 50 ? "text-yellow-500" : "text-red-500",
      status: sleepQuality >= 70 ? "Beauty Sleep" : sleepQuality >= 50 ? "Decent" : "Needs Work",
      emoji: sleepQuality >= 70 ? "😴" : sleepQuality >= 50 ? "💤" : "😵‍💫",
    },
  ]

  const recommendations = [
    {
      id: 1,
      title: "Take a 10-minute boss break",
      description: "Step away from work and do some light stretching like the queen you are",
      priority: "high",
      action: "Start Break",
      icon: Coffee,
      emoji: "☕",
    },
    {
      id: 2,
      title: "Practice boss breathing",
      description: "5 minutes of focused breathing to reduce stress and center yourself",
      priority: "medium",
      action: "Start Exercise",
      icon: Brain,
      emoji: "🧘‍♀️",
    },
    {
      id: 3,
      title: "Schedule queen time",
      description: "Block 30 minutes for relaxation this evening - you deserve it!",
      priority: "medium",
      action: "Schedule",
      icon: Moon,
      emoji: "🌙",
    },
    {
      id: 4,
      title: "Boss body movement",
      description: "Take a short walk or do light exercises to energize your empire",
      priority: "low",
      action: "Start Activity",
      icon: Dumbbell,
      emoji: "💪",
    },
  ]

  const weeklyPattern = [
    { day: "Mon", wellness: 85, stress: 30, emoji: "💪" },
    { day: "Tue", wellness: 78, stress: 45, emoji: "👍" },
    { day: "Wed", wellness: 65, stress: 60, emoji: "😌" },
    { day: "Thu", wellness: 72, stress: 55, emoji: "🔋" },
    { day: "Fri", wellness: 68, stress: 70, emoji: "😰" },
    { day: "Sat", wellness: 90, stress: 20, emoji: "✨" },
    { day: "Sun", wellness: 88, stress: 25, emoji: "👑" },
  ]

  const quickActions = [
    { name: "5-Min Boss Meditation", icon: Brain, color: "bg-purple-500", emoji: "🧘‍♀️" },
    { name: "Power Breathing", icon: Heart, color: "bg-blue-500", emoji: "💨" },
    { name: "Gratitude Journaling", icon: Smile, color: "bg-green-500", emoji: "📝" },
    { name: "Queen Walk", icon: Dumbbell, color: "bg-orange-500", emoji: "👑" },
  ]

  return (
    <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-gradient-to-r from-purple-50 to-teal-50">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold">Burnout Shield</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-4 bg-gradient-to-br from-purple-50/30 via-white to-teal-50/30">
          {/* Header Section */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight boss-heading flex items-center justify-center gap-3">
              <Shield className="h-10 w-10 text-purple-600" />
              Burnout Shield
              <span className="text-2xl">🛡️</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Monitor your wellness and prevent burnout with AI-powered insights
              <br />
              <span className="empowering-text font-semibold">Because even boss babes need to recharge! 💪✨</span>
            </p>
          </div>

          {/* Alert Section */}
          {stressLevel > 60 && (
            <Alert className="border-yellow-200 bg-yellow-50 boss-card">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-bold empowering-text">Boss Alert: Stress Level High! 🚨</AlertTitle>
              <AlertDescription className="font-medium">
                Your stress levels are elevated, queen. Time to take a step back and try some of our wellness
                activities. Remember: you can't pour from an empty cup! 💖
              </AlertDescription>
            </Alert>
          )}

          {/* Wellness Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {wellnessMetrics.map((metric) => (
              <Card key={metric.title} className="boss-card glitter-effect">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold empowering-text">{metric.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    <span className="text-lg">{metric.emoji}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold soloboss-text-gradient">{metric.value}%</div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex-1 mr-3 rebel-progress">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                    <Badge className={`girlboss-badge ${metric.color}`}>{metric.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* AI Recommendations */}
            <Card className="md:col-span-2 boss-card">
              <CardHeader>
                <CardTitle className="boss-heading text-xl flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  AI Wellness Recommendations
                </CardTitle>
                <CardDescription className="font-medium">
                  Personalized suggestions based on your current wellness metrics - because you deserve the best care!
                  💖
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between p-4 border rounded-lg boss-card bounce-on-hover"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-3 rounded-full ${
                            rec.priority === "high"
                              ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-600"
                              : rec.priority === "medium"
                                ? "bg-gradient-to-r from-purple-100 to-teal-100 text-purple-600"
                                : "bg-gradient-to-r from-teal-100 to-green-100 text-teal-600"
                          }`}
                        >
                          <rec.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold empowering-text flex items-center gap-2">
                            {rec.title}
                            <span>{rec.emoji}</span>
                          </h4>
                          <p className="text-sm text-muted-foreground font-medium">{rec.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            rec.priority === "high"
                              ? "girlboss-badge bg-gradient-to-r from-pink-500 to-purple-600"
                              : rec.priority === "medium"
                                ? "girlboss-badge bg-gradient-to-r from-purple-500 to-teal-500"
                                : "girlboss-badge bg-gradient-to-r from-teal-500 to-green-500"
                          }
                        >
                          {rec.priority}
                        </Badge>
                        <Button size="sm" className="punk-button text-white font-semibold">
                          {rec.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="boss-card">
              <CardHeader>
                <CardTitle className="boss-heading flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-600" />
                  Quick Boss Actions
                </CardTitle>
                <CardDescription className="font-medium">
                  Instant stress relief and wellness boosters for busy queens 👑
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start bg-transparent border-2 border-purple-200 hover:border-purple-400 bounce-on-hover font-semibold"
                    >
                      <div className={`p-2 rounded-full ${action.color} text-white mr-3`}>
                        <action.icon className="h-4 w-4" />
                      </div>
                      <span>{action.name}</span>
                      <span className="ml-auto">{action.emoji}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Wellness Pattern */}
          <Card className="boss-card">
            <CardHeader>
              <CardTitle className="boss-heading flex items-center gap-2">
                <Activity className="h-6 w-6 text-purple-600" />
                Weekly Boss Wellness Pattern
              </CardTitle>
              <CardDescription className="font-medium">
                Track your wellness trends over the past week - knowledge is power! 📊
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {weeklyPattern.map((day) => (
                  <div key={day.day} className="text-center space-y-3 boss-card p-3 rounded-lg">
                    <div className="text-sm font-bold empowering-text flex items-center justify-center gap-1">
                      {day.day}
                      <span>{day.emoji}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground font-medium">Wellness</div>
                      <div className="rebel-progress h-3">
                        <div
                          className="h-full transition-all duration-500 ease-out"
                          style={{ width: `${day.wellness}%` }}
                        />
                      </div>
                      <div className="text-xs font-bold soloboss-text-gradient">{day.wellness}%</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground font-medium">Stress</div>
                      <Progress value={day.stress} className="h-3" />
                      <div className="text-xs font-bold soloboss-text-gradient">{day.stress}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Wellness Insights */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="boss-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 boss-heading">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Boss Wins This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3 font-medium">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-teal-500 rounded-full"></div>
                    Sleep quality improved by 15% - beauty sleep is working! ✨
                  </li>
                  <li className="flex items-center gap-3 font-medium">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-teal-500 rounded-full"></div>
                    Consistent meditation practice for 5 days - zen queen status! 🧘‍♀️
                  </li>
                  <li className="flex items-center gap-3 font-medium">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-teal-500 rounded-full"></div>
                    Stress levels decreased on weekends - work-life balance boss! 👑
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="boss-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 boss-heading">
                  <Star className="h-5 w-5 text-purple-500" />
                  Areas to Boss Up
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3 font-medium">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                    Energy levels dip mid-week - time for power snacks! 🍎
                  </li>
                  <li className="flex items-center gap-3 font-medium">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                    Stress peaks on Friday afternoons - end-of-week wind down needed! 🌙
                  </li>
                  <li className="flex items-center gap-3 font-medium">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                    Need more movement during workdays - boss walks incoming! 🚶‍♀️
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Motivational Footer */}
          <Card className="boss-card soloboss-gradient text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                Self-care isn't selfish - it's strategic.
                <Crown className="h-6 w-6" />
              </h3>
              <p className="text-lg opacity-90">
                You can't build an empire on an empty tank. Take care of yourself like the queen you are! 💖✨
              </p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
  )
}
