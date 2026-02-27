"use client"

import { logError } from '@/lib/logger'
import { useState } from "react"
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
  Plus,
  Calendar,
  Flag,
  Clock,
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

import { createTask as createTaskAction, updateTask as updateTaskAction } from '@/lib/actions/task-actions'

interface Goal {
  id: string
  title: string
  description?: string
  priority: string
  target_date?: string
  category: string
  status: string
  progress_percentage: number
  created_at: string
}

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  status: string
  due_date?: string
  estimated_minutes: number
  goal_id?: string
  created_at: string
}

interface SlaylistClientProps {
  initialGoals: any[]
  initialTasks: any[]
}

export default function SlaylistClient({ initialGoals, initialTasks }: SlaylistClientProps) {
  const { isOnline, addPendingAction } = useOffline()

  const [goals, setGoals] = useState<Goal[]>(initialGoals.map(g => ({
    ...g,
    id: String(g.id),
    priority: g.priority || 'medium',
    status: g.status || 'active',
    progress_percentage: g.progress_percentage || 0,
    created_at: g.created_at || new Date().toISOString()
  })))
  
  const [tasks, setTasks] = useState<Task[]>(initialTasks.map(t => ({
    ...t,
    id: String(t.id),
    priority: t.priority || 'medium',
    status: t.status || 'todo',
    estimated_minutes: t.estimated_minutes || 30,
    created_at: t.created_at || new Date().toISOString()
  })))

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

  const createGoal = async () => {
    if (!isOnline) {
      await addPendingAction('create', 'goals', goalForm)
      toast.success("Goal queued for offline sync")
      setShowGoalDialog(false)
      return
    }
    toast.info("Goal creation hardening in progress.")
  }

  const createTask = async () => {
    if (!isOnline) {
      await addPendingAction('create', 'tasks', taskForm)
      toast.success("Task queued for offline sync")
      setShowTaskDialog(false)
      return
    }
    
    try {
      const result = await createTaskAction(taskForm)
      if (result.success) {
        setTasks(prev => [...prev, {
          ...result.task,
          id: String(result.task.id),
          created_at: result.task.created_at.toISOString()
        } as any])
        setShowTaskDialog(false)
        toast.success("Task created successfully")
      }
    } catch (e) {
      logError("Failed to create task", e)
      toast.error("Failed to create task")
    }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const result = await updateTaskAction(taskId, { status })
      if (result.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
        toast.success(`Task marked as ${status}`)
      }
    } catch (e) {
      logError("Failed to update task", e)
      toast.error("Failed to update task")
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
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOut } }
  }

  return (
    <div className="min-h-screen bg-dark-bg p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neon-cyan/20 pb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-neon-purple/10 border border-neon-purple/30 rounded-none shadow-[0_0_15px_rgba(179,0,255,0.2)]">
              <Target className="w-8 h-8 text-neon-purple" />
            </div>
            <div>
              <h1 className="text-5xl font-orbitron font-black tracking-tighter text-white uppercase italic">
                Slay<span className="text-neon-cyan">List</span>
              </h1>
              <p className="text-gray-400 font-mono uppercase text-xs tracking-[0.2em] font-bold">Objective System // v2.4.0</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <CyberButton variant="purple" onClick={() => setShowVoiceTaskDialog(true)}>
              <Mic className="w-4 h-4 mr-2" /> Voice
            </CyberButton>
            <CyberButton variant="cyan" onClick={() => setShowGoalDialog(true)}>
              <Plus className="w-4 h-4 mr-2" /> Goal
            </CyberButton>
            <CyberButton variant="magenta" onClick={() => setShowTaskDialog(true)}>
              <Plus className="w-4 h-4 mr-2" /> Tactical
            </CyberButton>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <HudBorder className="p-4">
            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Active Objectives</p>
            <p className="text-4xl font-orbitron font-black text-neon-purple tracking-tight">{goals.length}</p>
          </HudBorder>
          <HudBorder className="p-4">
            <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Tactical Items</p>
            <p className="text-4xl font-orbitron font-black text-neon-cyan tracking-tight">{tasks.length}</p>
          </HudBorder>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Goals */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-orbitron font-bold text-xl uppercase text-neon-purple">Objectives</h2>
            {goals.map(goal => (
              <HudBorder key={goal.id} variant="hover" className="p-5">
                <h3 className="font-orbitron font-bold text-white uppercase">{goal.title}</h3>
                <Progress value={goal.progress_percentage} className="h-1 mt-4" />
              </HudBorder>
            ))}
          </div>

          {/* Tasks */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-orbitron font-bold text-xl uppercase text-neon-cyan">Tacticals</h2>
            {tasks.map(task => (
              <HudBorder key={task.id} variant="hover" className={`p-4 flex items-center gap-4 ${task.status === 'completed' ? 'opacity-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={(e) => updateTaskStatus(task.id, e.target.checked ? 'completed' : 'todo')}
                  className="w-5 h-5 border-2 border-neon-cyan bg-transparent appearance-none cursor-pointer"
                />
                <div className="flex-1">
                  <h4 className={`font-orbitron font-bold text-white uppercase ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </h4>
                </div>
                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              </HudBorder>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent className="bg-dark-card border-neon-cyan/30 rounded-none sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-white font-orbitron">Create New Objective</DialogTitle>
            <DialogDescription className="text-gray-400 font-mono">
              Define a high-level goal for your system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-neon-cyan font-mono uppercase">Title</Label>
              <Input
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                className="bg-dark-bg border-neon-cyan/30 text-white font-mono rounded-none"
                placeholder="Enter objective title"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neon-cyan font-mono uppercase">Description</Label>
              <Textarea
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                className="bg-dark-bg border-neon-cyan/30 text-white font-mono rounded-none"
                placeholder="Detailed description"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neon-cyan font-mono uppercase">Priority</Label>
              <Select value={goalForm.priority} onValueChange={(v) => setGoalForm({ ...goalForm, priority: v })}>
                <SelectTrigger className="bg-dark-bg border-neon-cyan/30 text-white font-mono rounded-none">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-neon-cyan/30">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CyberButton onClick={createGoal} className="w-full mt-4" variant="cyan">
              Deploy Objective
            </CyberButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="bg-dark-card border-neon-cyan/30 rounded-none sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-white font-orbitron">Create Tactical Item</DialogTitle>
            <DialogDescription className="text-gray-400 font-mono">
              Add a new actionable task.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-neon-cyan font-mono uppercase">Title</Label>
              <Input
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="bg-dark-bg border-neon-cyan/30 text-white font-mono rounded-none"
                placeholder="Enter tactical task"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neon-cyan font-mono uppercase">Description</Label>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="bg-dark-bg border-neon-cyan/30 text-white font-mono rounded-none"
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-neon-cyan font-mono uppercase">Priority</Label>
              <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}>
                <SelectTrigger className="bg-dark-bg border-neon-cyan/30 text-white font-mono rounded-none">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-neon-cyan/30">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CyberButton onClick={createTask} className="w-full mt-4" variant="magenta">
              Deploy Tactical
            </CyberButton>
          </div>
        </DialogContent>
      </Dialog>

      <VoiceTaskCreator
        isOpen={showVoiceTaskDialog}
        onClose={() => setShowVoiceTaskDialog(false)}
        onTaskCreate={async (taskData: { title: string; description?: string; priority: 'low' | 'medium' | 'high' | 'urgent'; estimatedMinutes?: number }) => {
          setTaskForm({
            ...taskForm,
            title: taskData.title,
            description: taskData.description ?? '',
            priority: taskData.priority,
            estimated_minutes: taskData.estimatedMinutes ?? 30,
          })
          setShowVoiceTaskDialog(false)
          setShowTaskDialog(true)
        }}
      />
    </div>
  )
}
