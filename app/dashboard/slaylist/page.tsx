"use client"

export const dynamic = 'force-dynamic'
import { logError,} from '@/lib/logger'
import { useState, useEffect } from "react"
import { motion, easeOut } from "framer-motion"
import { HudBorder } from "@/components/cyber/HudBorder"
import { CyberButton } from "@/components/cyber/CyberButton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Target,
,
  Plus,
  Calendar,
  Flag,
  Clock,
,
  Brain,
  Mic,
  Zap,
  Shield,
  Activity,
  Award,
  Terminal as TerminalIcon
} from "lucide-react"
import TaskIntelligencePanel from "@/components/ai/task-intelligence-panel"
import { useOffline } from "@/components/providers/offline-provider"
import { toast } from "sonner"
import { VoiceTaskCreator } from "@/components/voice/voice-task-creator"
import { TaskSuggestion, TaskIntelligenceData } from "@/lib/ai-task-intelligence"

// Define interfaces locally to match usage
interface Goal {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  target_date?: string
  category: string
  status: 'active' | 'completed' | 'archived'
  progress_percentage: number
  created_at: string
}

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'completed'
  due_date?: string
  estimated_minutes: number
  goal_id?: string
  created_at: string
}

export default function SlaylistPage() {
  const { isOnline, addPendingAction } = useOffline()

  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showVoiceTaskDialog, setShowVoiceTaskDialog] = useState(false)

  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    target_date: "",
    category: "general"
  })

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    goal_id: "",
    estimated_minutes: 30
  })

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      logError('Error fetching goals:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      logError('Error fetching tasks:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchGoals(), fetchTasks()])
      setLoading(false)
    }
    loadData()
  }, [])

  const createGoal = async () => {
    if (!isOnline) {
      await addPendingAction('create', 'goals', goalForm)
      toast.success("Goal queued for offline sync")
      setShowGoalDialog(false)
      setGoalForm({
        title: "",
        description: "",
        priority: "medium",
        target_date: "",
        category: "general"
      })
      return
    }

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalForm)
      })

      if (response.ok) {
        await fetchGoals()
        setShowGoalDialog(false)
        setGoalForm({
          title: "",
          description: "",
          priority: "medium",
          target_date: "",
          category: "general"
        })
        toast.success("Goal created successfully")
      }
    } catch (error) {
      logError('Error creating goal:', error)
      toast.error("Failed to create goal")
    }
  }

  const createTask = async () => {
    if (!isOnline) {
      await addPendingAction('create', 'tasks', taskForm)
      toast.success("Task queued for offline sync")
      setShowTaskDialog(false)
      setTaskForm({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        goal_id: "",
        estimated_minutes: 30
      })
      return
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm)
      })

      if (response.ok) {
        await fetchTasks()
        setShowTaskDialog(false)
        setTaskForm({
          title: "",
          description: "",
          priority: "medium",
          due_date: "",
          goal_id: "",
          estimated_minutes: 30
        })
        toast.success("Task created successfully")
      }
    } catch (error) {
      logError('Error creating task:', error)
      toast.error("Failed to create task")
    }
  }

  const createVoiceTask = async (taskData: {
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    estimatedMinutes?: number
  }) => {
    const payload = {
      ...taskData,
      priority: taskData.priority,
      estimated_minutes: taskData.estimatedMinutes || 30,
      due_date: new Date().toISOString(), // Default to today
      goal_id: "" // Default to no goal
    }

    if (!isOnline) {
      await addPendingAction('create', 'tasks', payload)
      toast.success("Voice task queued for offline sync")
      return
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await fetchTasks()
      } else {
        throw new Error('Failed to create task')
      }
    } catch (error) {
      logError('Error creating voice task:', error)
      throw error
    }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await fetchTasks()
        await fetchGoals() // Refresh goals to update progress
      }
    } catch (error) {
      logError('Error updating task:', error)
    }
  }

  const handleApplySuggestion = async (taskId: string, suggestion: TaskSuggestion) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority: suggestion.suggestedPriority,
          due_date: suggestion.suggestedDeadline,
          category: suggestion.suggestedCategory,
          estimated_minutes: suggestion.estimatedCompletionTime
        })
      })

      if (response.ok) {
        await fetchTasks()
        toast.success("AI suggestion applied")
      }
    } catch (error) {
      logError('Error applying AI suggestion:', error)
      toast.error("Failed to apply suggestion")
    }
  }

  const handleReorderTasks = async (optimizedOrder: string[]) => {
    try {
      // Update task order in bulk
      const updates = optimizedOrder.map((taskId, index) => ({
        id: taskId,
        sort_order: index
      }))

      const response = await fetch('/api/tasks/bulk-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })

      if (response.ok) {
        await fetchTasks()
        toast.success("Tasks reordered")
      }
    } catch (error) {
      logError('Error reordering tasks:', error)
      toast.error("Failed to reorder tasks")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high': return 'bg-neon-magenta/10 text-neon-magenta border-neon-magenta/30'
      case 'medium': return 'bg-neon-orange/10 text-neon-orange border-neon-orange/30'
      case 'low': return 'bg-neon-lime/10 text-neon-lime border-neon-lime/30'
      default: return 'bg-white/5 text-gray-400 border-white/10'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-neon-lime/10 text-neon-lime border-neon-lime/30'
      case 'in_progress': return 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30'
      case 'todo': return 'bg-white/5 text-gray-300 border-white/10'
      default: return 'bg-white/5 text-gray-400 border-white/10'
    }
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: easeOut
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg p-6 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-t-2 border-r-2 border-neon-cyan rounded-full shadow-[0_0_15px_rgba(11,228,236,0.4)]"
          />
          <p className="font-orbitron font-bold text-neon-cyan animate-pulse uppercase tracking-[0.2em]">Initializing System Data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-neon-purple/5 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-neon-magenta/5 blur-[100px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neon-cyan/20 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-neon-purple/10 border border-neon-purple/30 rounded-none shadow-[0_0_15px_rgba(179,0,255,0.2)]">
                <Target className="w-8 h-8 text-neon-purple" />
              </div>
              <div>
                <h1 className="text-5xl font-orbitron font-black tracking-tighter text-white uppercase italic">
                  Slay<span className="text-neon-cyan">List</span>
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-lime animate-pulse rounded-none" />
                  <p className="text-gray-400 font-mono uppercase text-xs tracking-[0.2em] font-bold">Strategic Objective Management System // v2.4.0</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CyberButton
              variant="purple"
              onClick={() => setShowVoiceTaskDialog(true)}
              className="group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <Mic className="w-4 h-4 mr-2" />
              Voice Command
            </CyberButton>

            <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
              <DialogTrigger asChild>
                <CyberButton variant="cyan">
                  <Plus className="w-4 h-4 mr-2" />
                  New Objective
                </CyberButton>
              </DialogTrigger>
              <DialogContent className="bg-dark-card border-neon-cyan/50 text-white rounded-none">
                <DialogHeader>
                  <DialogTitle className="font-orbitron text-2xl text-neon-cyan uppercase">Define Alpha Goal</DialogTitle>
                  <DialogDescription className="text-gray-400 font-mono">Establish a high-level strategic target for your empire.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-title" className="font-orbitron text-xs uppercase text-neon-purple">Identifier</Label>
                    <Input
                      id="goal-title"
                      className="bg-black/50 border-neon-purple/30 text-white focus:border-neon-purple rounded-none font-mono"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-description" className="font-orbitron text-xs uppercase text-neon-purple">Mission Parameters</Label>
                    <Textarea
                      id="goal-description"
                      className="bg-black/50 border-neon-purple/30 text-white focus:border-neon-purple rounded-none font-mono"
                      value={goalForm.description}
                      onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-orbitron text-xs uppercase text-neon-purple">Threat Priority</Label>
                      <Select value={goalForm.priority} onValueChange={(value) => setGoalForm({ ...goalForm, priority: value })}>
                        <SelectTrigger className="bg-black/50 border-neon-purple/30 rounded-none font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-neon-purple/30 text-white font-mono">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-orbitron text-xs uppercase text-neon-purple">Classification</Label>
                      <Select value={goalForm.category} onValueChange={(value) => setGoalForm({ ...goalForm, category: value })}>
                        <SelectTrigger className="bg-black/50 border-neon-purple/30 rounded-none font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-neon-purple/30 text-white font-mono">
                          <SelectItem value="general">Standard</SelectItem>
                          <SelectItem value="business">Empire</SelectItem>
                          <SelectItem value="personal">Bio-Sync</SelectItem>
                          <SelectItem value="health">Combat-Ready</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-date" className="font-orbitron text-xs uppercase text-neon-purple">Termination Date</Label>
                    <Input
                      id="goal-date"
                      type="date"
                      className="bg-black/50 border-neon-purple/30 text-white focus:border-neon-purple rounded-none font-mono"
                      value={goalForm.target_date}
                      onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                    />
                  </div>
                  <CyberButton onClick={createGoal} variant="purple" className="w-full">Initialize Objective</CyberButton>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
              <DialogTrigger asChild>
                <CyberButton variant="magenta" className="border-neon-magenta text-neon-magenta hover:bg-neon-magenta/10">
                  <Plus className="w-4 h-4 mr-2" />
                  New Tactical
                </CyberButton>
              </DialogTrigger>
              <DialogContent className="bg-dark-card border-neon-magenta/50 text-white rounded-none">
                <DialogHeader>
                  <DialogTitle className="font-orbitron text-2xl text-neon-magenta uppercase">Deploy Tactical Item</DialogTitle>
                  <DialogDescription className="text-gray-400 font-mono">Define actionable procedures for immediate execution.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title" className="font-orbitron text-xs uppercase text-neon-magenta">Task Vector</Label>
                    <Input
                      id="task-title"
                      className="bg-black/50 border-neon-magenta/30 text-white rounded-none font-mono"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-orbitron text-xs uppercase text-neon-magenta">Execution Detail</Label>
                    <Textarea
                      id="task-description"
                      className="bg-black/50 border-neon-magenta/30 text-white rounded-none font-mono"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-orbitron text-xs uppercase text-neon-magenta">Priority</Label>
                      <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}>
                        <SelectTrigger className="bg-black/50 border-neon-magenta/30 rounded-none font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-neon-magenta/30 text-white font-mono">
                          <SelectItem value="low">Delta</SelectItem>
                          <SelectItem value="medium">Gamma</SelectItem>
                          <SelectItem value="high">Beta</SelectItem>
                          <SelectItem value="urgent">Alpha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-orbitron text-xs uppercase text-neon-magenta">Parent Objective</Label>
                      <Select value={taskForm.goal_id} onValueChange={(value) => setTaskForm({ ...taskForm, goal_id: value })}>
                        <SelectTrigger className="bg-black/50 border-neon-magenta/30 rounded-none font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-neon-magenta/30 text-white font-mono">
                          {goals.map((goal) => (
                            <SelectItem key={goal.id} value={goal.id}>{goal.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-orbitron text-xs uppercase text-neon-magenta">Due Time</Label>
                      <Input
                        type="date"
                        className="bg-black/50 border-neon-magenta/30 rounded-none font-mono"
                        value={taskForm.due_date}
                        onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-orbitron text-xs uppercase text-neon-magenta">Est. Runtime (m)</Label>
                      <Input
                        type="number"
                        className="bg-black/50 border-neon-magenta/30 rounded-none font-mono"
                        value={taskForm.estimated_minutes}
                        onChange={(e) => setTaskForm({ ...taskForm, estimated_minutes: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <CyberButton onClick={createTask} variant="magenta" className="w-full">Execute Deployment</CyberButton>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Objectives", val: goals.length, icon: Target, color: "text-neon-purple", bg: "bg-neon-purple/5" },
            { label: "Tactical Items", val: tasks.length, icon: Activity, color: "text-neon-cyan", bg: "bg-neon-cyan/5" },
            { label: "Completed Today", val: tasks.filter(t => t.status === 'completed' && new Date(t.created_at).toDateString() === new Date().toDateString()).length, icon: Zap, color: "text-neon-lime", bg: "bg-neon-lime/5" },
            { label: "Mission Status", val: "OPERATIONAL", icon: Shield, color: "text-neon-orange", bg: "bg-neon-orange/5" },
          ].map((stat, i) => (stat.label !== "Mission Status" ? (
            <HudBorder key={i} variant="hover" className="group">
              <div className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className={`text-4xl font-orbitron font-black ${stat.color} tracking-tight`}>{stat.val}</p>
                </div>
                <div className={`p-3 ${stat.bg} border border-white/5 rounded-none group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </HudBorder>
          ) : (
            <HudBorder key={i} variant="hover" className="group border-neon-orange/20">
              <div className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  <p className={`text-2xl font-orbitron font-black ${stat.color} tracking-tight`}>{stat.val}</p>
                </div>
                <div className={`p-3 ${stat.bg} border border-white/5 rounded-none group-hover:animate-pulse`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </HudBorder>
          )))}
        </motion.div>

        {/* AI Analysis Integration */}
        {tasks.length > 0 && (
          <motion.div variants={itemVariants}>
            <HudBorder className="border-neon-purple/30 bg-neon-purple/5 overflow-hidden">
               <div className="relative p-6">
                  <div className="absolute top-0 right-0 p-2 opacity-20">
                    <Brain className="w-24 h-24 text-neon-purple" />
                  </div>
                  <TaskIntelligencePanel
                    tasks={tasks as TaskIntelligenceData[]}
                    onApplySuggestion={handleApplySuggestion}
                    onReorderTasks={handleReorderTasks}
                  />
               </div>
            </HudBorder>
          </motion.div>
        )}

        {/* Main Content: Objectives & Tacticals */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Objectives Column (Left) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-orbitron font-bold text-xl uppercase tracking-wider text-neon-purple flex items-center gap-2">
                <Shield className="w-5 h-5" /> High-Level Goals
              </h2>
              <Badge variant="purple" className="rounded-none font-mono">{goals.length}</Badge>
            </div>

            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {goals.length === 0 ? (
                <HudBorder className="p-12 text-center bg-white/5 opacity-50">
                   <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                   <p className="font-mono text-gray-400">NO ACTIVE OBJECTIVES LOGGED</p>
                </HudBorder>
              ) : (
                goals.map((goal) => (
                  <HudBorder key={goal.id} variant="hover" className="relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-neon-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-orbitron font-bold text-lg text-white uppercase tracking-tight group-hover:text-neon-purple transition-colors">{goal.title}</h3>
                          <p className="text-sm text-gray-400 font-mono line-clamp-2">{goal.description}</p>
                        </div>
                        <Badge className={getPriorityColor(goal.priority)}>{goal.priority.toUpperCase()}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-widest">
                          <span className="text-gray-500">Sync Progress</span>
                          <span className="text-neon-cyan">{goal.progress_percentage}%</span>
                        </div>
                        <Progress value={goal.progress_percentage} className="h-1 bg-white/5 rounded-none" />
                      </div>

                      <div className="flex items-center gap-6 pt-2 border-t border-white/5 text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-neon-cyan" />
                          {goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'NO-DEADLINE'}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Flag className="w-3 h-3 text-neon-purple" />
                          {goal.category}
                        </div>
                      </div>
                    </div>
                  </HudBorder>
                ))
              )}
            </div>
          </motion.div>

          {/* Tactical List (Right) */}
          <motion.div variants={itemVariants} className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-orbitron font-bold text-xl uppercase tracking-wider text-neon-cyan flex items-center gap-2">
                <Zap className="w-5 h-5 animate-pulse" /> Active Tacticals
              </h2>
              <div className="flex items-center gap-2">
                 <Badge variant="cyan" className="rounded-none font-mono">{tasks.filter(t => t.status !== 'completed').length} PENDING</Badge>
                 <Badge className="bg-white/5 text-gray-500 border-white/10 rounded-none font-mono">{tasks.filter(t => t.status === 'completed').length} ARCHIVED</Badge>
              </div>
            </div>

            <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.length === 0 ? (
                <HudBorder className="p-12 text-center bg-white/5 opacity-50">
                   <Activity className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                   <p className="font-mono text-gray-400">NO TACTICAL DEPLOYMENTS PENDING</p>
                </HudBorder>
              ) : (
                tasks.map((task) => (
                  <HudBorder key={task.id} variant="hover" className={`relative group transition-all duration-300 ${task.status === 'completed' ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                    <div className="p-4 flex items-center gap-4">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={(e) => updateTaskStatus(task.id, e.target.checked ? 'completed' : 'todo')}
                          className="w-5 h-5 border-2 border-neon-cyan bg-transparent checked:bg-neon-cyan appearance-none rounded-none cursor-pointer transition-colors"
                          aria-label={`Mark tactical "${task.title}" as ${task.status === 'completed' ? 'incomplete' : 'completed'}`}
                        />
                        {task.status === 'completed' && <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-black font-bold">✓</div>}
                      </div>

                      <div className="flex-1 space-y-1">
                        <h4 className={`font-orbitron font-bold text-white uppercase tracking-tight group-hover:text-neon-cyan transition-colors ${task.status === 'completed' ? 'line-through decoration-neon-cyan/50 text-gray-500' : ''}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">
                           <span className="flex items-center gap-1.5">
                             <Clock className="w-3 h-3 text-neon-magenta" /> {task.estimated_minutes}M Runtime
                           </span>
                           <span className="flex items-center gap-1.5">
                             <Calendar className="w-3 h-3 text-neon-cyan" /> {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'NO-WINDOW'}
                           </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`text-[9px] font-mono font-bold uppercase tracking-tighter ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        <Badge className={`text-[9px] font-mono font-bold uppercase tracking-tighter ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Hover Interaction Overlay */}
                      <div className="absolute right-0 bottom-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Award className="w-4 h-4 text-neon-lime/20" />
                      </div>
                    </div>
                  </HudBorder>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Voice System Overlay */}
        {showVoiceTaskDialog && (
          <VoiceTaskCreator
            isOpen={showVoiceTaskDialog}
            onClose={() => setShowVoiceTaskDialog(false)}
            onTaskCreate={createVoiceTask}
          />
        )}
      </motion.div>

      {/* Styles Injection */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(11, 228, 236, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(11, 228, 236, 0.5);
        }
      `}</style>
    </div>
  )
}
