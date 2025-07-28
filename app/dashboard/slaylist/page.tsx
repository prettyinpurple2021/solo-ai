"use client"

import { useState } from "react"
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
import { Plus, Target, CheckSquare, Calendar, Clock, TrendingUp, Crown, Flame, Star, Zap } from "lucide-react"

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
          const progress = updatedTasks.length > 0 ? (completedTasks / updatedTasks.length) * 100 : 0

          return {
            ...goal,
            tasks: updatedTasks,
            progress: Math.round(progress),
            status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "pending",
          }
        }
        return goal
      }),
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "girlboss-badge bg-gradient-to-r from-pink-500 to-purple-600"
      case "medium":
        return "girlboss-badge bg-gradient-to-r from-purple-500 to-teal-500"
      case "low":
        return "girlboss-badge bg-gradient-to-r from-teal-500 to-purple-400"
      default:
        return "girlboss-badge"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "girlboss-badge bg-gradient-to-r from-green-500 to-teal-500"
      case "in-progress":
        return "girlboss-badge bg-gradient-to-r from-purple-500 to-pink-500"
      case "near-completion":
        return "girlboss-badge bg-gradient-to-r from-teal-500 to-green-500"
      case "pending":
        return "girlboss-badge bg-gradient-to-r from-gray-400 to-gray-500"
      default:
        return "girlboss-badge"
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
                  <BreadcrumbPage className="font-semibold">SlayList Generator</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-4 bg-gradient-to-br from-purple-50/30 via-white to-teal-50/30">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight boss-heading flex items-center gap-3">
                <Target className="h-10 w-10 text-purple-600" />
                SlayList Generator
                <span className="text-2xl">⚡</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-2 font-medium">
                Break down your big goals into boss moves that actually get done! 💪
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="punk-button text-white font-bold px-6 py-3 bounce-on-hover">
                  <Plus className="mr-2 h-5 w-5" />
                  New Boss Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] boss-card border-2 border-purple-200">
                <DialogHeader>
                  <DialogTitle className="boss-heading text-xl flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    Create New Boss Goal
                  </DialogTitle>
                  <DialogDescription className="font-medium">
                    Set up a new goal and break it down into manageable boss moves.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="font-semibold empowering-text">
                      Goal Title
                    </Label>
                    <Input
                      id="title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="Enter your boss goal title"
                      className="border-2 border-purple-200 focus:border-purple-400 font-medium"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="font-semibold empowering-text">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      placeholder="Describe your goal in detail - make it inspiring!"
                      className="border-2 border-purple-200 focus:border-purple-400 font-medium"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority" className="font-semibold empowering-text">
                      Priority Level
                    </Label>
                    <Select
                      value={newGoal.priority}
                      onValueChange={(value) => setNewGoal({ ...newGoal, priority: value })}
                    >
                      <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority 🔥</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline" className="font-semibold empowering-text">
                      Boss Deadline
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      className="border-2 border-purple-200 focus:border-purple-400 font-medium"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={addGoal} className="punk-button text-white font-bold">
                    <Zap className="mr-2 h-4 w-4" />
                    Create Boss Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="boss-card glitter-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold empowering-text">Total Boss Goals</CardTitle>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-purple-600" />
                  <Crown className="h-3 w-3 text-pink-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold soloboss-text-gradient">{goals.length}</div>
                <p className="text-sm text-muted-foreground font-medium">Empire building goals 👑</p>
              </CardContent>
            </Card>

            <Card className="boss-card glitter-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold empowering-text">Goals Slayed</CardTitle>
                <div className="flex items-center gap-1">
                  <CheckSquare className="h-4 w-4 text-teal-600" />
                  <Star className="h-3 w-3 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold soloboss-text-gradient">
                  {goals.filter((g) => g.status === "completed").length}
                </div>
                <p className="text-sm text-muted-foreground font-medium">Crushed like a boss! ⚡</p>
              </CardContent>
            </Card>

            <Card className="boss-card glitter-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold empowering-text">In Progress</CardTitle>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-pink-600" />
                  <Flame className="h-3 w-3 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold soloboss-text-gradient">
                  {goals.filter((g) => g.status === "in-progress").length}
                </div>
                <p className="text-sm text-muted-foreground font-medium">Currently slaying 🔥</p>
              </CardContent>
            </Card>

            <Card className="boss-card glitter-effect">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold empowering-text">Boss Progress</CardTitle>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <Star className="h-3 w-3 text-teal-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold soloboss-text-gradient">
                  {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}%
                </div>
                <p className="text-sm text-muted-foreground font-medium">Average domination 💪</p>
              </CardContent>
            </Card>
          </div>

          {/* Goals List */}
          <div className="space-y-6">
            {goals.map((goal) => (
              <Card key={goal.id} className="boss-card bounce-on-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-3 boss-heading text-xl">
                        <div className="skull-decoration"></div>
                        {goal.title}
                        <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                        <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                      </CardTitle>
                      <CardDescription className="font-medium text-base">{goal.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <Calendar className="h-4 w-4" />
                      {goal.deadline}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold empowering-text">Boss Progress</span>
                      <span className="text-sm text-muted-foreground font-semibold">{goal.progress}% Complete</span>
                    </div>
                    <div className="rebel-progress">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold empowering-text flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Boss Tasks
                    </h4>
                    {goal.tasks.length > 0 ? (
                      <div className="space-y-3">
                        {goal.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center space-x-3 p-3 rounded-lg boss-card hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-teal-50/50 transition-all"
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTask(goal.id, task.id)}
                              className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                            />
                            <span
                              className={`text-sm font-medium ${
                                task.completed ? "line-through text-muted-foreground" : "text-gray-800 empowering-text"
                              }`}
                            >
                              {task.title}
                              {task.completed && <span className="ml-2">✨</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No tasks added yet</p>
                        <p className="text-sm">Break down this goal into actionable boss moves!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Motivational Footer */}
          <Card className="boss-card soloboss-gradient text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-2xl font-bold mb-2">Another move. Another win. 🏆</h3>
              <p className="text-lg opacity-90">Keep breaking down those big dreams into boss moves that get done!</p>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
  )
}
