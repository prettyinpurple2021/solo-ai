"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Target, CheckSquare, Calendar, Clock, TrendingUp, Crown, Flame, Star, Zap, Brain, Lightbulb, AlertTriangle } from "lucide-react"
import { useTaskIntelligence } from "@/hooks/use-task-intelligence"
import { TaskIntelligenceData } from "@/lib/ai-task-intelligence"

export default function SlayList() {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: "Launch New Product Line Like a Boss",
      description: "Develop and launch premium product series that'll blow minds",
      progress: 65,
      priority: "high",
      deadline: "2024-03-15",
      status: "in-progress",
      tasks: [
        { id: 1, title: "Crush market research", completed: true },
        { id: 2, title: "Slay product design", completed: true },
        { id: 3, title: "Boss up manufacturing setup", completed: false },
        { id: 4, title: "Launch killer marketing campaign", completed: false },
      ],
    },
    {
      id: 2,
      title: "Expand Social Media Empire",
      description: "Grow followers and engagement like the boss babe you are",
      progress: 40,
      priority: "medium",
      deadline: "2024-02-28",
      status: "in-progress",
      tasks: [
        { id: 5, title: "Create fire content calendar", completed: true },
        { id: 6, title: "Daily posting domination", completed: false },
        { id: 7, title: "Influencer partnerships", completed: false },
      ],
    },
    {
      id: 3,
      title: "Optimize Business Operations",
      description: "Streamline processes and reduce costs like a strategic queen",
      progress: 85,
      priority: "high",
      deadline: "2024-02-20",
      status: "near-completion",
      tasks: [
        { id: 8, title: "Process audit complete", completed: true },
        { id: 9, title: "Automation implementation slayed", completed: true },
        { id: 10, title: "Cost analysis final boss", completed: false },
      ],
    },
  ])

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
  })

  // AI Task Intelligence Integration
  const {
    optimizeTasks,
    getWorkloadAnalysis,
    getProductivityTips,
    getOptimizedOrder,
    getUrgentTasks,
    getQuickWins,
    getHighImpactTasks,
    getOptimizationStatus,
    loading: aiLoading,
    error: aiError
  } = useTaskIntelligence({
    autoOptimize: true,
    refreshInterval: 300000, // 5 minutes
    enableAI: true
  })

  // Convert goals to task intelligence format for AI analysis
  const convertGoalsToTasks = (): TaskIntelligenceData[] => {
    const tasks: TaskIntelligenceData[] = []
    goals.forEach(goal => {
      goal.tasks.forEach(task => {
        tasks.push({
          id: task.id.toString(),
          title: task.title,
          description: goal.description,
          priority: goal.priority as 'low' | 'medium' | 'high' | 'urgent',
          due_date: goal.deadline,
          estimated_minutes: 60, // Default estimate
          goal_id: goal.id.toString(),
          category: goal.title,
          tags: [goal.status],
          status: task.completed ? 'completed' : 'todo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      })
    })
    return tasks
  }

  // Optimize tasks when goals change
  useEffect(() => {
    const tasks = convertGoalsToTasks()
    if (tasks.length > 0) {
      optimizeTasks(tasks)
    }
  }, [goals, optimizeTasks])

  const addGoal = () => {
    if (newGoal.title) {
      const goal = {
        id: goals.length + 1,
        ...newGoal,
        progress: 0,
        status: "pending",
        tasks: [],
      }
      setGoals([...goals, goal])
      setNewGoal({ title: "", description: "", priority: "medium", deadline: "" })
    }
  }

  const toggleTask = (goalId: number, taskId: number) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === goalId) {
          const updatedTasks = goal.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task,
          )
          const completedTasks = updatedTasks.filter((task) => task.completed).length
          const totalTasks = updatedTasks.length
          const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

          return {
            ...goal,
            tasks: updatedTasks,
            progress,
            status: progress === 100 ? "completed" : progress > 80 ? "near-completion" : "in-progress",
          }
        }
        return goal
      }),
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "near-completion":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Get AI insights
  const workloadAnalysis = getWorkloadAnalysis()
  const productivityTips = getProductivityTips()
  const optimizedOrder = getOptimizedOrder()
  const optimizationStatus = getOptimizationStatus()

  // Get filtered task lists
  const tasks = convertGoalsToTasks()
  const urgentTasks = getUrgentTasks(tasks)
  const quickWins = getQuickWins(tasks)
  const highImpactTasks = getHighImpactTasks(tasks)

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-gradient-to-r from-purple-50 to-teal-50">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold">SlayList</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-4 bg-gradient-to-br from-purple-50/30 via-white to-teal-50/30">
        {/* AI Intelligence Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight boss-heading flex items-center gap-3">
              <Target className="h-10 w-10 text-purple-600" />
              SlayList
              <Brain className="h-8 w-8 text-teal-600" />
            </h1>
            <p className="text-lg text-muted-foreground mt-2 font-medium">
              AI-powered goal and task management for maximum productivity
            </p>
          </div>
          <div className="flex items-center gap-2">
            {aiLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span>AI optimizing...</span>
              </div>
            )}
            {optimizationStatus.hasResults && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Brain className="h-3 w-3 mr-1" />
                AI Optimized
              </Badge>
            )}
          </div>
        </div>

        {/* AI Insights Section */}
        {optimizationStatus.hasResults && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Workload Analysis */}
            {workloadAnalysis && (
              <Card className="boss-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold empowering-text flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Workload Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold soloboss-text-gradient">
                    {workloadAnalysis.workloadScore}/100
                  </div>
                  <Progress value={workloadAnalysis.workloadScore} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {workloadAnalysis.totalTasks} tasks • {Math.round(workloadAnalysis.estimatedTotalTime / 60)}h estimated
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Urgent Tasks */}
            <Card className="boss-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold empowering-text flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Urgent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold soloboss-text-gradient">
                  {urgentTasks.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Need immediate attention
                </p>
              </CardContent>
            </Card>

            {/* Quick Wins */}
            <Card className="boss-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold empowering-text flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  Quick Wins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold soloboss-text-gradient">
                  {quickWins.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Easy tasks to boost momentum
                </p>
              </CardContent>
            </Card>

            {/* High Impact */}
            <Card className="boss-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold empowering-text flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  High Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold soloboss-text-gradient">
                  {highImpactTasks.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum value tasks
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Recommendations */}
        {workloadAnalysis && workloadAnalysis.recommendations.length > 0 && (
          <Alert className="border-purple-200 bg-purple-50">
            <Lightbulb className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>AI Recommendations:</strong> {workloadAnalysis.recommendations[0]}
            </AlertDescription>
          </Alert>
        )}

        {/* Productivity Tips */}
        {productivityTips.length > 0 && (
          <Card className="boss-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-teal-600" />
                AI Productivity Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {productivityTips.slice(0, 3).map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg">
                    <Lightbulb className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold empowering-text">Your Goals</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="punk-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                  <DialogDescription>
                    Set a new goal and let AI help you break it down into actionable tasks.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="e.g., Launch New Product Line"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      placeholder="Describe your goal..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newGoal.priority} onValueChange={(value) => setNewGoal({ ...newGoal, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newGoal.deadline}
                        onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addGoal} disabled={!newGoal.title}>
                    Create Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Goals List */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <Card key={goal.id} className="boss-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg empowering-text">{goal.title}</CardTitle>
                      <CardDescription className="mt-2">{goal.description}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getPriorityColor(goal.priority)} text-xs`}>
                        {goal.priority}
                      </Badge>
                      <Badge className={`${getStatusColor(goal.status)} text-xs`}>
                        {goal.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {goal.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => toggleTask(goal.id, task.id)}
                      >
                        <CheckSquare
                          className={`h-4 w-4 ${
                            task.completed ? "text-green-600" : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`flex-1 text-sm ${
                            task.completed ? "line-through text-muted-foreground" : "empowering-text"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  {goal.deadline && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* AI Error Display */}
        {aiError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              AI optimization error: {aiError}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </SidebarInset>
  )
}
