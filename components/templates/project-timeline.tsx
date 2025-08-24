"use client"

import { useState, useEffect, useMemo } from "react"
import BaseTemplate, { TemplateData } from "./base-template"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { BossButton } from "@/components/ui/boss-button"
import { BossCard } from "@/components/ui/boss-card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  Users, 
  Target, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2,
  Plus,
  Minus,
  ArrowRight,
  ArrowDown,
  BarChart3,
  Flag,
  User,
  Settings,
  Crown,
  Brain,
  Lightbulb,
  TrendingUp,
  Filter,
  Search,
  Edit3,
  Trash2,
  Move,
  Link,
  Unlink,
  Zap,
  FileText,
  Star,
  Timer,
  ChevronRight,
  ChevronDown,
  DollarSign,
  GitBranch,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Circle,
  CheckCircle,
  CalendarDays,
  Clock as ClockIcon,
  Briefcase
}

interface ProjectTask {
  id: string
  name: string
  description: string
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  startDate: Date
  endDate: Date
  estimatedHours: number
  actualHours: number
  progress: number // 0-100%
  assignees: string[] // resource IDs
  dependencies: string[] // task IDs that must complete before this task
  tags: string[]
  attachments: string[]
  notes: string
  subtasks: ProjectTask[]
  parentId?: string
  isExpanded?: boolean
}

interface ProjectMilestone {
  id: string
  name: string
  description: string
  date: Date
  status: 'upcoming' | 'achieved' | 'missed'
  color: string
  tasks: string[] // related task IDs
  deliverables: string[]
  stakeholders: string[]
}

interface ProjectResource {
  id: string
  name: string
  role: string
  email: string
  avatar?: string
  hourlyRate: number
  capacity: number // hours per week
  skills: string[]
  availability: {
    startDate: Date
    endDate: Date
  }
}

interface ProjectRisk {
  id: string
  title: string
  description: string
  probability: number // 1-5 scale
  impact: number // 1-5 scale
  category: 'technical' | 'resource' | 'timeline' | 'budget' | 'external'
  status: 'active' | 'mitigated' | 'resolved'
  mitigation: string
  owner: string // resource ID
}

interface ProjectTimelineData {
  // Project Overview
  projectName: string
  projectDescription: string
  startDate: Date
  endDate: Date
  budget: number
  currency: string
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled'
  
  // Project Details
  objectives: string[]
  deliverables: string[]
  stakeholders: string[]
  
  // Resources & Team
  resources: ProjectResource[]
  
  // Timeline
  tasks: ProjectTask[]
  milestones: ProjectMilestone[]
  
  // Risk Management
  risks: ProjectRisk[]
  
  // Settings
  workingHoursPerDay: number
  workingDaysPerWeek: number
  holidays: Date[]
  
  // Analytics
  totalProgress: number
  budgetUsed: number
  timeSpent: number
  efficiency: number
}

interface ProjectTimelineProps {
  template: TemplateData
  onSave?: (data: ProjectTimelineData) => Promise<void>
  onExport?: (format: 'json' | 'pdf' | 'csv' | 'mpp') => void
}

export default function ProjectTimeline({ template, onSave, onExport }: ProjectTimelineProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [viewMode, setViewMode] = useState<'gantt' | 'kanban' | 'calendar' | 'list'>('gantt')
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null)
  const [timelineZoom, setTimelineZoom] = useState<'days' | 'weeks' | 'months'>('weeks')
  const [showCriticalPath, setShowCriticalPath] = useState(false)
  const [data, setData] = useState<ProjectTimelineData>({
    projectName: "",
    projectDescription: "",
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    budget: 0,
    currency: "USD",
    status: 'planning',
    objectives: [],
    deliverables: [],
    stakeholders: [],
    resources: [],
    tasks: [],
    milestones: [],
    risks: [],
    workingHoursPerDay: 8,
    workingDaysPerWeek: 5,
    holidays: [],
    totalProgress: 0,
    budgetUsed: 0,
    timeSpent: 0,
    efficiency: 0
  })

  const totalSteps = 6

  // Add new task
  const addTask = (parentId?: string) => {
    const newTask: ProjectTask = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      status: 'not-started',
      priority: 'medium',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedHours: 8,
      actualHours: 0,
      progress: 0,
      assignees: [],
      dependencies: [],
      tags: [],
      attachments: [],
      notes: "",
      subtasks: [],
      parentId: parentId,
      isExpanded: true
    }

    setData(prev => ({
      ...prev,
      tasks: parentId 
        ? prev.tasks.map(task => 
            task.id === parentId 
              ? { ...task, subtasks: [...task.subtasks, newTask] }
              : task
          )
        : [...prev.tasks, newTask]
    }))
  }

  // Update task
  const updateTask = (id: string, updates: Partial<ProjectTask>, parentId?: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => {
        if (parentId) {
          if (task.id === parentId) {
            return {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === id ? { ...subtask, ...updates } : subtask
              )
            }
          }
          return task
        } else {
          return task.id === id ? { ...task, ...updates } : task
        }
      })
    }))
  }

  // Remove task
  const removeTask = (id: string, parentId?: string) => {
    setData(prev => ({
      ...prev,
      tasks: parentId
        ? prev.tasks.map(task =>
            task.id === parentId
              ? { ...task, subtasks: task.subtasks.filter(subtask => subtask.id !== id) }
              : task
          )
        : prev.tasks.filter(task => task.id !== id)
    }))
  }

  // Add milestone
  const addMilestone = () => {
    const newMilestone: ProjectMilestone = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      date: new Date(),
      status: 'upcoming',
      color: '#8B5CF6',
      tasks: [],
      deliverables: [],
      stakeholders: []
    }
    setData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }))
  }

  // Update milestone
  const updateMilestone = (id: string, updates: Partial<ProjectMilestone>) => {
    setData(prev => ({
      ...prev,
      milestones: prev.milestones.map(milestone =>
        milestone.id === id ? { ...milestone, ...updates } : milestone
      )
    }))
  }

  // Remove milestone
  const removeMilestone = (id: string) => {
    setData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(milestone => milestone.id !== id)
    }))
  }

  // Add resource
  const addResource = () => {
    const newResource: ProjectResource = {
      id: crypto.randomUUID(),
      name: "",
      role: "",
      email: "",
      hourlyRate: 50,
      capacity: 40,
      skills: [],
      availability: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      }
    }
    setData(prev => ({
      ...prev,
      resources: [...prev.resources, newResource]
    }))
  }

  // Update resource
  const updateResource = (id: string, updates: Partial<ProjectResource>) => {
    setData(prev => ({
      ...prev,
      resources: prev.resources.map(resource =>
        resource.id === id ? { ...resource, ...updates } : resource
      )
    }))
  }

  // Remove resource
  const removeResource = (id: string) => {
    setData(prev => ({
      ...prev,
      resources: prev.resources.filter(resource => resource.id !== id)
    }))
  }

  // Add risk
  const addRisk = () => {
    const newRisk: ProjectRisk = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      probability: 3,
      impact: 3,
      category: 'technical',
      status: 'active',
      mitigation: "",
      owner: ""
    }
    setData(prev => ({
      ...prev,
      risks: [...prev.risks, newRisk]
    }))
  }

  // Calculate project analytics
  const analytics = useMemo(() => {
    const totalTasks = data.tasks.length + data.tasks.reduce((sum, task) => sum + task.subtasks.length, 0)
    const completedTasks = data.tasks.filter(task => task.status === 'completed').length +
      data.tasks.reduce((sum, task) => sum + task.subtasks.filter(st => st.status === 'completed').length, 0)
    
    const totalProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    const totalEstimatedHours = data.tasks.reduce((sum, task) => 
      sum + task.estimatedHours + task.subtasks.reduce((subSum, subtask) => subSum + subtask.estimatedHours, 0), 0)
    
    const totalActualHours = data.tasks.reduce((sum, task) =>
      sum + task.actualHours + task.subtasks.reduce((subSum, subtask) => subSum + subtask.actualHours, 0), 0)
    
    const efficiency = totalEstimatedHours > 0 ? Math.round((totalEstimatedHours / Math.max(totalActualHours, 1)) * 100) : 100
    
    const budgetUsed = data.resources.reduce((sum, resource) => {
      const resourceTasks = data.tasks.filter(task => task.assignees.includes(resource.id))
      const resourceHours = resourceTasks.reduce((hours, task) => hours + task.actualHours, 0)
      return sum + (resourceHours * resource.hourlyRate)
    }, 0)

    const overdueTasks = data.tasks.filter(task => 
      task.status !== 'completed' && new Date(task.endDate) < new Date()
    ).length

    const upcomingMilestones = data.milestones.filter(milestone => 
      milestone.status === 'upcoming' && 
      new Date(milestone.date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )

    return {
      totalProgress,
      totalTasks,
      completedTasks,
      totalEstimatedHours,
      totalActualHours,
      efficiency,
      budgetUsed,
      overdueTasks,
      upcomingMilestones: upcomingMilestones.length,
      criticalRisks: data.risks.filter(risk => risk.probability >= 4 && risk.impact >= 4).length
    }
  }, [data])

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = {
      'not-started': 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'blocked': 'bg-red-100 text-red-700',
      'cancelled': 'bg-gray-100 text-gray-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'border-l-green-500',
      'medium': 'border-l-yellow-500',
      'high': 'border-l-orange-500',
      'critical': 'border-l-red-500'
    }
    return colors[priority as keyof typeof colors] || 'border-l-gray-500'
  }

  // Calculate task width for Gantt chart
  const getTaskWidth = (startDate: Date, endDate: Date) => {
    const duration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    return Math.max(20, duration * 30) // minimum 20px, 30px per day
  }

  // Calculate task position for Gantt chart
  const getTaskPosition = (startDate: Date) => {
    const projectStart = data.startDate.getTime()
    const taskStart = startDate.getTime()
    const daysDiff = Math.max(0, Math.ceil((taskStart - projectStart) / (1000 * 60 * 60 * 24)))
    return daysDiff * 30 // 30px per day
  }

  // Render Gantt Chart
  const renderGanttChart = () => {
    const projectDuration = Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24))
    const chartWidth = Math.max(800, projectDuration * 30)

    return (
      <div className="overflow-x-auto">
        <div className="min-w-full" style={{ width: chartWidth }}>
          {/* Timeline Header */}
          <div className="flex bg-gray-50 p-2 border-b sticky top-0 z-10">
            <div className="w-64 font-semibold">Task</div>
            <div className="flex-1 relative">
              <div className="flex">
                {Array.from({ length: projectDuration }, (_, i) => {
                  const date = new Date(data.startDate)
                  date.setDate(date.getDate() + i)
                  return (
                    <div key={i} className="w-8 text-xs text-center border-r">
                      {date.getDate()}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-1">
            {data.tasks.map((task, index) => (
              <div key={task.id} className="flex items-center hover:bg-gray-50">
                <div className="w-64 p-2 border-r">
                  <div className="flex items-center gap-2">
                    {task.subtasks.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateTask(task.id, { isExpanded: !task.isExpanded })}
                      >
                        {task.isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </Button>
                    )}
                    <div>
                      <div className="text-sm font-medium">{task.name || `Task ${index + 1}`}</div>
                      <div className="text-xs text-gray-500">{task.assignees.length} assignees</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative" style={{ height: '40px' }}>
                  <div
                    className={`absolute top-2 h-6 rounded ${getStatusColor(task.status)} border-l-4 ${getPriorityColor(task.priority)} flex items-center justify-center text-xs`}
                    style={{
                      left: `${getTaskPosition(task.startDate)}px`,
                      width: `${getTaskWidth(task.startDate, task.endDate)}px`
                    }}
                  >
                    {task.progress}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div className="relative mt-4">
            {data.milestones.map(milestone => (
              <div
                key={milestone.id}
                className="absolute top-0"
                style={{ left: `${getTaskPosition(milestone.date)}px` }}
              >
                <div className="w-4 h-4 rotate-45 border-2" style={{ borderColor: milestone.color, backgroundColor: milestone.color }}></div>
                <div className="text-xs mt-1 whitespace-nowrap">{milestone.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (onSave) {
      await onSave(data)
    }
  }

  const handleExport = (format: 'json' | 'pdf' | 'csv' | 'mpp') => {
    if (onExport) {
      onExport(format)
    }
  }

  const handleReset = () => {
    setData({
      projectName: "",
      projectDescription: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      budget: 0,
      currency: "USD",
      status: 'planning',
      objectives: [],
      deliverables: [],
      stakeholders: [],
      resources: [],
      tasks: [],
      milestones: [],
      risks: [],
      workingHoursPerDay: 8,
      workingDaysPerWeek: 5,
      holidays: [],
      totalProgress: 0,
      budgetUsed: 0,
      timeSpent: 0,
      efficiency: 0
    })
    setCurrentStep(1)
    setSelectedTask(null)
  }

  return (
    <BaseTemplate
      template={template}
      currentStep={currentStep}
      totalSteps={totalSteps}
      showProgress={true}
      onSave={handleSave}
      onExport={handleExport}
      onReset={handleReset}
    >
      <Tabs value={`step-${currentStep}`} onValueChange={(value) => setCurrentStep(parseInt(value.split('-')[1]))}>
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="step-1" className="flex items-center gap-1 text-xs">
            <Target className="w-3 h-3" />
            <span className="hidden md:inline">Setup</span>
          </TabsTrigger>
          <TabsTrigger value="step-2" className="flex items-center gap-1 text-xs">
            <Users className="w-3 h-3" />
            <span className="hidden md:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="step-3" className="flex items-center gap-1 text-xs">
            <Calendar className="w-3 h-3" />
            <span className="hidden md:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="step-4" className="flex items-center gap-1 text-xs">
            <Flag className="w-3 h-3" />
            <span className="hidden md:inline">Milestones</span>
          </TabsTrigger>
          <TabsTrigger value="step-5" className="flex items-center gap-1 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span className="hidden md:inline">Risks</span>
          </TabsTrigger>
          <TabsTrigger value="step-6" className="flex items-center gap-1 text-xs">
            <BarChart3 className="w-3 h-3" />
            <span className="hidden md:inline">Timeline</span>
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Project Setup */}
        <TabsContent value="step-1" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Project Setup
              </CardTitle>
              <CardDescription>
                Define your project's basic information and constraints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    placeholder="e.g., Website Redesign Project"
                    value={data.projectName}
                    onChange={(e) => setData(prev => ({ ...prev, projectName: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="project-status">Project Status</Label>
                  <Select onValueChange={(value: any) => setData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="project-description">Project Description</Label>
                <Textarea
                  id="project-description"
                  placeholder="Describe your project objectives, scope, and key deliverables..."
                  value={data.projectDescription}
                  onChange={(e) => setData(prev => ({ ...prev, projectDescription: e.target.value }))}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Project Start Date *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={data.startDate.toISOString().split('T')[0]}
                    onChange={(e) => setData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Target End Date *</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={data.endDate.toISOString().split('T')[0]}
                    onChange={(e) => setData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budget">Project Budget</Label>
                  <div className="flex gap-2 mt-2">
                    <Select onValueChange={(value) => setData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="USD" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0"
                      value={data.budget || ''}
                      onChange={(e) => setData(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm">Working Hours/Day</Label>
                    <Input
                      type="number"
                      value={data.workingHoursPerDay}
                      onChange={(e) => setData(prev => ({ ...prev, workingHoursPerDay: parseInt(e.target.value) || 8 }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Working Days/Week</Label>
                    <Input
                      type="number"
                      value={data.workingDaysPerWeek}
                      onChange={(e) => setData(prev => ({ ...prev, workingDaysPerWeek: parseInt(e.target.value) || 5 }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Project Objectives (comma-separated)</Label>
                <Textarea
                  placeholder="e.g., Improve user experience, Increase conversion rate, Reduce loading time"
                  value={data.objectives.join(", ")}
                  onChange={(e) => setData(prev => ({ 
                    ...prev, 
                    objectives: e.target.value.split(",").map(obj => obj.trim()).filter(Boolean) 
                  }))}
                  className="mt-2"
                  rows={2}
                />
              </div>

              <div>
                <Label>Key Deliverables (comma-separated)</Label>
                <Textarea
                  placeholder="e.g., New website design, Mobile app, User documentation, Training materials"
                  value={data.deliverables.join(", ")}
                  onChange={(e) => setData(prev => ({ 
                    ...prev, 
                    deliverables: e.target.value.split(",").map(del => del.trim()).filter(Boolean) 
                  }))}
                  className="mt-2"
                  rows={2}
                />
              </div>

              <div>
                <Label>Key Stakeholders (comma-separated)</Label>
                <Textarea
                  placeholder="e.g., John Smith (CEO), Sarah Johnson (Marketing Director), Development Team"
                  value={data.stakeholders.join(", ")}
                  onChange={(e) => setData(prev => ({ 
                    ...prev, 
                    stakeholders: e.target.value.split(",").map(sh => sh.trim()).filter(Boolean) 
                  }))}
                  className="mt-2"
                  rows={2}
                />
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">Project Planning Tips</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
                  <li>Define clear, measurable objectives and success criteria</li>
                  <li>Identify all stakeholders and their responsibilities early</li>
                  <li>Build buffer time into your timeline for unexpected delays</li>
                  <li>Consider dependencies between tasks when planning</li>
                </ul>
              </div>
            </CardContent>
          </BossCard>

          <div className="flex justify-end">
            <BossButton 
              onClick={() => setCurrentStep(2)}
              disabled={!data.projectName}
              crown
            >
              Next: Team & Resources
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 2: Team Management */}
        <TabsContent value="step-2" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Team & Resources
              </CardTitle>
              <CardDescription>
                Add team members and define their roles and availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Team Members</h4>
                  <p className="text-sm text-gray-600">Manage your project team and their capabilities</p>
                </div>
                  <BossButton onClick={addResource} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Team Member
                  </BossButton>
              </div>

              <div className="space-y-4">
                {data.resources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                          {resource.name ? resource.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Full Name"
                            value={resource.name}
                            onChange={(e) => updateResource(resource.id, { name: e.target.value })}
                          />
                          <Input
                            placeholder="Role (e.g., Frontend Developer)"
                            value={resource.role}
                            onChange={(e) => updateResource(resource.id, { role: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeResource(resource.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label className="text-sm">Email</Label>
                        <Input
                          type="email"
                          placeholder="email@company.com"
                          value={resource.email}
                          onChange={(e) => updateResource(resource.id, { email: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Hourly Rate ({data.currency})</Label>
                        <Input
                          type="number"
                          value={resource.hourlyRate}
                          onChange={(e) => updateResource(resource.id, { hourlyRate: parseFloat(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Capacity (hours/week)</Label>
                        <Input
                          type="number"
                          value={resource.capacity}
                          onChange={(e) => updateResource(resource.id, { capacity: parseFloat(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-sm">Available From</Label>
                        <Input
                          type="date"
                          value={resource.availability.startDate.toISOString().split('T')[0]}
                          onChange={(e) => updateResource(resource.id, { 
                            availability: { ...resource.availability, startDate: new Date(e.target.value) } 
                          })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Available Until</Label>
                        <Input
                          type="date"
                          value={resource.availability.endDate.toISOString().split('T')[0]}
                          onChange={(e) => updateResource(resource.id, { 
                            availability: { ...resource.availability, endDate: new Date(e.target.value) } 
                          })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Skills & Expertise (comma-separated)</Label>
                      <Textarea
                        placeholder="e.g., React, TypeScript, UI Design, Project Management"
                        value={resource.skills.join(", ")}
                        onChange={(e) => updateResource(resource.id, { 
                          skills: e.target.value.split(",").map(skill => skill.trim()).filter(Boolean) 
                        })}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {data.resources.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No team members added yet</p>
                  <p className="text-sm">Add team members to manage resources and assignments</p>
                </div>
              )}

              {data.resources.length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Team Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-bold text-lg">{data.resources.length}</div>
                      <div className="text-gray-600">Team Members</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">
                        {data.resources.reduce((sum, r) => sum + r.capacity, 0)}h
                      </div>
                      <div className="text-gray-600">Total Capacity/Week</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">
                        {data.currency} {Math.round(data.resources.reduce((sum, r) => sum + r.hourlyRate, 0) / Math.max(data.resources.length, 1))}
                      </div>
                      <div className="text-gray-600">Avg Hourly Rate</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">
                        {new Set(data.resources.flatMap(r => r.skills)).size}
                      </div>
                      <div className="text-gray-600">Unique Skills</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </BossCard>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(1)}
              variant="outline"
            >
              Previous
            </BossButton>
            <BossButton 
              onClick={() => setCurrentStep(3)}
              crown
            >
              Next: Tasks & Timeline
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 3: Timeline & Tasks */}
        <TabsContent value="step-3" className="space-y-6">
          <div className="grid gap-6">
            {/* Tasks */}
            <BossCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Tasks & Timeline
                </CardTitle>
                <CardDescription>
                  Create and organize your project tasks and dependencies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Project Tasks</h4>
                    <p className="text-sm text-gray-600">Break down your project into manageable tasks</p>
                  </div>
                  <BossButton onClick={addTask} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </BossButton>
                </div>

                <div className="space-y-4">

                  {data.tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <Input
                          placeholder="Task name"
                          value={task.name}
                          onChange={(e) => updateTask(task.id, { name: e.target.value })}
                          className="font-medium flex-1 mr-4"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTask(task.id)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Textarea
                        placeholder="Task description and requirements..."
                        value={task.description}
                        onChange={(e) => updateTask(task.id, { description: e.target.value })}
                        className="mb-3"
                        rows={2}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <Label className="text-sm">Start Date</Label>
                          <Input
                            type="date"
                            value={task.startDate.toISOString().split('T')[0]}
                            onChange={(e) => updateTask(task.id, { startDate: new Date(e.target.value) })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">End Date</Label>
                          <Input
                            type="date"
                            value={task.endDate.toISOString().split('T')[0]}
                            onChange={(e) => updateTask(task.id, { endDate: new Date(e.target.value) })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Priority</Label>
                          <Select onValueChange={(value: any) => updateTask(task.id, { priority: value })}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={task.priority} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Status</Label>
                          <Select onValueChange={(value: any) => updateTask(task.id, { status: value })}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={task.status} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not-started">Not Started</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="blocked">Blocked</SelectItem>
                              <SelectItem value="on-hold">On Hold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <Label className="text-sm">Estimated Hours</Label>
                          <Input
                            type="number"
                            value={task.estimatedHours}
                            onChange={(e) => updateTask(task.id, { estimatedHours: parseInt(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Actual Hours</Label>
                          <Input
                            type="number"
                            value={task.actualHours}
                            onChange={(e) => updateTask(task.id, { actualHours: parseInt(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Category</Label>
                          <Input
                            placeholder="e.g., Development, Design"
                            value={task.category}
                            onChange={(e) => updateTask(task.id, { category: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <Label className="text-sm">Assignees</Label>
                        <Select onValueChange={(value) => {
                          if (!task.assignees.includes(value)) {
                            updateTask(task.id, { assignees: [...task.assignees, value] })
                          }
                        }}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Assign team member" />
                          </SelectTrigger>
                          <SelectContent>
                            {data.resources.map(resource => (
                              <SelectItem key={resource.id} value={resource.id}>
                                {resource.name} - {resource.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.assignees.map(assigneeId => {
                            const assignee = data.resources.find(r => r.id === assigneeId)
                            if (!assignee) return null
                            return (
                              <Badge key={assigneeId} variant="outline" className="text-xs">
                                {assignee.name}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-1 p-0 h-auto"
                                  onClick={() => updateTask(task.id, { 
                                    assignees: task.assignees.filter(id => id !== assigneeId) 
                                  })}
                                >
                                  ×
                                </Button>
                              </Badge>
                            )
                          })}
                        </div>
                      </div>

                      <div className="mb-3">
                        <Label className="text-sm">Progress: {task.progress}%</Label>
                        <Slider
                          value={[task.progress]}
                          onValueChange={([value]) => updateTask(task.id, { progress: value })}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                        <Progress value={task.progress} className="mt-2" />
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Badge className={
                            task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {task.priority}
                          </Badge>
                          <Badge className={
                            task.status === 'completed' ? 'bg-green-100 text-green-700' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'blocked' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.estimatedHours}h estimated • {task.assignees.length} assigned
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {data.tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks created yet</p>
                    <p className="text-sm">Add tasks to build your project timeline</p>
                  </div>
                )}
              </CardContent>
            </BossCard>

            {/* Milestones */}
            <BossCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-purple-600" />
                  Project Milestones
                </CardTitle>
                <CardDescription>
                  Define key project milestones and deliverables
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Milestones</h4>
                    <p className="text-sm text-gray-600">Mark important checkpoints in your project</p>
                  </div>
                  <BossButton onClick={addMilestone} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Milestone
                  </BossButton>
                </div>

                <div className="space-y-4">
                  {data.milestones.map((milestone) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <Input
                          placeholder="Milestone title"
                          value={milestone.name}
                          onChange={(e) => updateMilestone(milestone.id, { name: e.target.value })}
                          className="font-medium flex-1 mr-4"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(milestone.id)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Textarea
                        placeholder="Milestone description and success criteria..."
                        value={milestone.description}
                        onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                        className="mb-3"
                        rows={2}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-sm">Target Date</Label>
                          <Input
                            type="date"
                            value={milestone.date.toISOString().split('T')[0]}
                            onChange={(e) => updateMilestone(milestone.id, { date: new Date(e.target.value) })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Status</Label>
                          <Select 
                            value={milestone.status} 
                            onValueChange={(value: any) => updateMilestone(milestone.id, { status: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="upcoming">Upcoming</SelectItem>
                              <SelectItem value="achieved">Achieved</SelectItem>
                              <SelectItem value="missed">Missed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2 mt-6">
                          <Label className="text-sm">Color</Label>
                          <div className="flex gap-2 mt-1">
                            {['#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'].map(color => (
                              <button
                                key={color}
                                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                                style={{ backgroundColor: color }}
                                onClick={() => updateMilestone(milestone.id, { color })}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                        <div>
                          <Label className="text-sm">Key Deliverables (comma-separated)</Label>
                          <Textarea
                            placeholder="e.g., Design mockups, User testing report, Final presentation"
                            value={milestone.deliverables.join(", ")}
                            onChange={(e) => updateMilestone(milestone.id, { 
                              deliverables: e.target.value.split(",").map(d => d.trim()).filter(Boolean) 
                            })}
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {data.milestones.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No milestones defined yet</p>
                    <p className="text-sm">Add key milestones to track progress</p>
                  </div>
                )}
              </CardContent>
            </BossCard>
          </div>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(2)}
              variant="outline"
            >
              Previous
            </BossButton>
            <BossButton 
              onClick={() => setCurrentStep(4)}
              crown
            >
              Next: Milestones
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 4: Milestones */}
        <TabsContent value="step-4" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-purple-600" />
                Project Milestones
              </CardTitle>
              <CardDescription>
                Define key project milestones and deliverable checkpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Milestones</h4>
                  <p className="text-sm text-gray-600">Track important project checkpoints and deliverables</p>
                </div>
                <BossButton onClick={addMilestone} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </BossButton>
              </div>

              <div className="space-y-4">
                {data.milestones.map((milestone) => (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rotate-45 border-2" 
                          style={{ borderColor: milestone.color, backgroundColor: milestone.color }}
                        ></div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Milestone name"
                            value={milestone.name}
                            onChange={(e) => updateMilestone(milestone.id, { name: e.target.value })}
                          />
                          <Input
                            type="date"
                            value={milestone.date.toISOString().split('T')[0]}
                            onChange={(e) => updateMilestone(milestone.id, { date: new Date(e.target.value) })}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(milestone.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="mb-4">
                      <Label className="text-sm">Description</Label>
                      <Textarea
                        placeholder="Milestone description and success criteria..."
                        value={milestone.description}
                        onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-sm">Status</Label>
                        <Select 
                          value={milestone.status} 
                          onValueChange={(value: any) => updateMilestone(milestone.id, { status: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="achieved">Achieved</SelectItem>
                            <SelectItem value="missed">Missed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Color</Label>
                        <div className="flex gap-2 mt-1">
                          {['#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'].map(color => (
                            <button
                              key={color}
                              className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                              style={{ backgroundColor: color }}
                              onClick={() => updateMilestone(milestone.id, { color })}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Key Deliverables (comma-separated)</Label>
                      <Textarea
                        placeholder="e.g., Design mockups, User testing report, Final presentation"
                        value={milestone.deliverables.join(", ")}
                        onChange={(e) => updateMilestone(milestone.id, { 
                          deliverables: e.target.value.split(",").map(d => d.trim()).filter(Boolean) 
                        })}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {data.milestones.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No milestones defined yet</p>
                  <p className="text-sm">Add milestones to track key project checkpoints</p>
                </div>
              )}
            </CardContent>
          </BossCard>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(3)}
              variant="outline"
            >
              Previous
            </BossButton>
            <BossButton 
              onClick={() => setCurrentStep(5)}
              crown
            >
              Next: Risk Management
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 5: Risk Management */}
        <TabsContent value="step-5" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-purple-600" />
                Risk Management
              </CardTitle>
              <CardDescription>
                Identify and manage potential project risks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Project Risks</h4>
                  <p className="text-sm text-gray-600">Identify potential issues and mitigation strategies</p>
                </div>
                <BossButton onClick={addRisk} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Risk
                </BossButton>
              </div>

              <div className="space-y-4">
                {data.risks.map((risk) => {
                  const riskScore = risk.probability * risk.impact
                  const riskLevel = riskScore >= 20 ? 'Critical' : riskScore >= 12 ? 'High' : riskScore >= 6 ? 'Medium' : 'Low'
                  const riskColor = riskScore >= 20 ? 'border-red-500' : riskScore >= 12 ? 'border-orange-500' : riskScore >= 6 ? 'border-yellow-500' : 'border-green-500'
                  
                  return (
                    <motion.div
                      key={risk.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 border rounded-lg ${riskColor} border-l-4`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <Input
                          placeholder="Risk title"
                          value={risk.title}
                          onChange={(e) => setData(prev => ({
                            ...prev,
                            risks: prev.risks.map(r => r.id === risk.id ? { ...r, title: e.target.value } : r)
                          }))}
                          className="flex-1 mr-4"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setData(prev => ({
                            ...prev,
                            risks: prev.risks.filter(r => r.id !== risk.id)
                          }))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="mb-4">
                        <Label className="text-sm">Risk Description</Label>
                        <Textarea
                          placeholder="Describe the risk and its potential impact..."
                          value={risk.description}
                          onChange={(e) => setData(prev => ({
                            ...prev,
                            risks: prev.risks.map(r => r.id === risk.id ? { ...r, description: e.target.value } : r)
                          }))}
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <Label className="text-sm">Category</Label>
                          <Select 
                            value={risk.category} 
                            onValueChange={(value: any) => setData(prev => ({
                              ...prev,
                              risks: prev.risks.map(r => r.id === risk.id ? { ...r, category: value } : r)
                            }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="resource">Resource</SelectItem>
                              <SelectItem value="timeline">Timeline</SelectItem>
                              <SelectItem value="budget">Budget</SelectItem>
                              <SelectItem value="external">External</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Probability: {risk.probability}/5</Label>
                          <Slider
                            value={[risk.probability]}
                            onValueChange={([value]) => setData(prev => ({
                              ...prev,
                              risks: prev.risks.map(r => r.id === risk.id ? { ...r, probability: value } : r)
                            }))}
                            max={5}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Impact: {risk.impact}/5</Label>
                          <Slider
                            value={[risk.impact]}
                            onValueChange={([value]) => setData(prev => ({
                              ...prev,
                              risks: prev.risks.map(r => r.id === risk.id ? { ...r, impact: value } : r)
                            }))}
                            max={5}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Status</Label>
                          <Select 
                            value={risk.status} 
                            onValueChange={(value: any) => setData(prev => ({
                              ...prev,
                              risks: prev.risks.map(r => r.id === risk.id ? { ...r, status: value } : r)
                            }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="mitigated">Mitigated</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mb-4">
                        <Label className="text-sm">Mitigation Strategy</Label>
                        <Textarea
                          placeholder="How will you prevent or minimize this risk?"
                          value={risk.mitigation}
                          onChange={(e) => setData(prev => ({
                            ...prev,
                            risks: prev.risks.map(r => r.id === risk.id ? { ...r, mitigation: e.target.value } : r)
                          }))}
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${riskScore >= 20 ? 'text-red-600 border-red-200' : riskScore >= 12 ? 'text-orange-600 border-orange-200' : riskScore >= 6 ? 'text-yellow-600 border-yellow-200' : 'text-green-600 border-green-200'}`}>
                            {riskLevel} Risk
                          </Badge>
                          <span className="text-sm text-gray-500">Score: {riskScore}/25</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {data.risks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No risks identified yet</p>
                  <p className="text-sm">Add potential risks to better manage your project</p>
                </div>
              )}

              {data.risks.length > 0 && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Risk Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-bold text-lg">{data.risks.filter(r => r.probability * r.impact >= 20).length}</div>
                      <div className="text-gray-600">Critical Risks</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{data.risks.filter(r => r.probability * r.impact >= 12 && r.probability * r.impact < 20).length}</div>
                      <div className="text-gray-600">High Risks</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{data.risks.filter(r => r.status === 'mitigated').length}</div>
                      <div className="text-gray-600">Mitigated</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{data.risks.filter(r => r.status === 'resolved').length}</div>
                      <div className="text-gray-600">Resolved</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </BossCard>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(4)}
              variant="outline"
            >
              Previous
            </BossButton>
            <BossButton 
              onClick={() => setCurrentStep(6)}
              crown
            >
              Next: Timeline View
            </BossButton>
          </div>
        </TabsContent>
        
        {/* Step 6: Timeline View */}
        <TabsContent value="step-6" className="space-y-6">
          <div className="grid gap-6">
            {/* Project Overview */}
            <BossCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Project Timeline & Analytics
                </CardTitle>
                <CardDescription>
                Visualize your project timeline and track progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{analytics.totalProgress}%</div>
                    <div className="text-sm text-purple-700">Overall Progress</div>
                    <Progress value={analytics.totalProgress} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{analytics.completedTasks}/{analytics.totalTasks}</div>
                    <div className="text-sm text-purple-700">Tasks Completed</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{data.currency} {Math.round(analytics.budgetUsed)}</div>
                    <div className="text-sm text-purple-700">Budget Used</div>
                    {data.budget > 0 && (
                      <Progress value={(analytics.budgetUsed / data.budget) * 100} className="mt-2 h-2" />
                    )}
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{analytics.efficiency}%</div>
                    <div className="text-sm text-purple-700">Efficiency</div>
                  </div>
                </div>

                {/* View Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">View:</Label>
                      <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gantt">Gantt Chart</SelectItem>
                          <SelectItem value="list">Task List</SelectItem>
                          <SelectItem value="kanban">Kanban Board</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={showCriticalPath}
                        onCheckedChange={setShowCriticalPath}
                      />
                      <Label className="text-sm">Critical Path</Label>
                    </div>
                  </div>
                </div>

                {/* Timeline Visualization */}
                {viewMode === 'gantt' && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-4">Gantt Chart</h4>
                    {data.tasks.length > 0 ? renderGanttChart() : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No tasks to display</p>
                        <p className="text-sm">Add tasks in Step 3 to see the timeline</p>
                      </div>
                    )}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-4">Task List</h4>
                    <div className="space-y-2">
                      {data.tasks.map((task, index) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-green-500' : task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                            <div>
                              <div className="font-medium">{task.name || `Task ${index + 1}`}</div>
                              <div className="text-sm text-gray-500">
                                {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getStatusColor(task.status)}>
                              {task.status}
                            </Badge>
                            <div className="w-16 text-right text-sm">{task.progress}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Alerts */}
                {(analytics.overdueTasks > 0 || analytics.upcomingMilestones > 0 || analytics.criticalRisks > 0) && (
                  <div className="space-y-3">
                    {analytics.overdueTasks > 0 && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <AlertDescription>
                          <strong>{analytics.overdueTasks} overdue tasks</strong> need attention
                        </AlertDescription>
                      </Alert>
                    )}
                    {analytics.upcomingMilestones > 0 && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <Flag className="w-4 h-4 text-yellow-600" />
                        <AlertDescription>
                          <strong>{analytics.upcomingMilestones} milestones</strong> due within 7 days
                        </AlertDescription>
                      </Alert>
                    )}
                    {analytics.criticalRisks > 0 && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <AlertDescription>
                          <strong>{analytics.criticalRisks} critical risks</strong> require immediate attention
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Project Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                  <h4 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Project Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="space-y-2">
                        <div><strong>Project:</strong> {data.projectName}</div>
                        <div><strong>Duration:</strong> {Math.ceil((data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24))} days</div>
                        <div><strong>Team Size:</strong> {data.resources.length} members</div>
                        <div><strong>Budget:</strong> {data.currency} {data.budget.toLocaleString()}</div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-2">
                        <div><strong>Status:</strong> {data.status}</div>
                        <div><strong>Tasks:</strong> {analytics.totalTasks}</div>
                        <div><strong>Milestones:</strong> {data.milestones.length}</div>
                        <div><strong>Risks:</strong> {data.risks.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </BossCard>
          </div>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(5)}
              variant="outline"
            >
              Previous
            </BossButton>
            <div className="flex gap-2">
              <BossButton 
                onClick={handleSave}
                variant="empowerment"
                crown
              >
                Save Project
              </BossButton>
              <BossButton 
                onClick={() => handleExport('pdf')}
                variant="accent"
              >
                Export Timeline
              </BossButton>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </BaseTemplate>
  )
}
