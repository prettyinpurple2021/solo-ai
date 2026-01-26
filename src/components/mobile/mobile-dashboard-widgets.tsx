"use client"

import, { useState, useRef, useEffect } from 'react'
import { motion, PanInfo, useAnimation } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback,} from "@/components/ui/avatar"
import { 
  CheckCircle, 
  Target, 
  Clock, 
  Users,
  ChevronRight,
  Plus,
  Calendar,
  BarChart3,
  RefreshCw,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Widget {
  id: string
  type: 'stats' | 'tasks' | 'goals' | 'agents' | 'insights' | 'focus'
  title: string
  priority: number
  data: any
}

interface MobileDashboardWidgetsProps {
  widgets: Widget[]
  onWidgetAction: (widgetId: string, action: string, data?: any) => void
  onWidgetReorder: (widgets: Widget[]) => void
  className?: string
}

const SWIPE_THRESHOLD = 100
const SPRING_CONFIG = { type: "spring" as const, stiffness: 300, damping: 30 }

export default function MobileDashboardWidgets({ 
  widgets, 
  onWidgetAction,
  className = "" 
}: MobileDashboardWidgetsProps) {
  const [draggedWidget, setDraggedWidget] = useState<string (null)
  const [isReordering, setIsReordering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      onWidgetAction('all', 'refresh')
    }, 30000)
    return () => clearInterval(interval)
  }, [onWidgetAction])

  const handleWidgetSwipe = (
    event: MouseEvent | TouchEvent | PointerEvent, 
    info: PanInfo, 
    widgetId: string
  ) => {
    const { offset, velocity } = info
    
    // Right swipe - quick action
    if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
      onWidgetAction(widgetId, 'quick_action')
    }
    // Left swipe - secondary action or settings
    else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
      onWidgetAction(widgetId, 'secondary_action')
    }
    // Up/down swipe - expand/collapse
    else if (Math.abs(offset.y) > Math.abs(offset.x)) {
      if (offset.y < -SWIPE_THRESHOLD) {
        onWidgetAction(widgetId, 'expand')
      } else if (offset.y > SWIPE_THRESHOLD) {
        onWidgetAction(widgetId, 'collapse')
      }
    }
  }

  const handleLongPress = (widgetId: string) => {
    setIsReordering(true)
    setDraggedWidget(widgetId)
    // Haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50])
    }
  }

  const renderStatsWidget = (widget: Widget) => {
    const stats = widget.data
    return (
      <Card className="touch-friendly-card bg-dark-card border border-neon-purple">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium font-orbitron uppercase tracking-wider text-white">Today's Progress</CardTitle>
            <Badge variant="outline" className="text-xs">
              {stats.completion_rate}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-dark-hover rounded-sm touch-target border border-gray-700">
              <div className="text-2xl font-bold text-neon-purple font-mono">
                {stats.tasks_completed}
              </div>
              <div className="text-xs text-gray-300 font-mono">Tasks Done</div>
            </div>
            <div className="text-center p-3 bg-dark-hover rounded-sm touch-target border border-gray-700">
              <div className="text-2xl font-bold text-neon-cyan font-mono">
                {stats.focus_minutes}
              </div>
              <div className="text-xs text-gray-300 font-mono">Focus Mins</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-mono text-gray-300">Daily Goal</span>
              <span className="font-mono text-gray-300">{stats.tasks_completed}/{stats.total_tasks}</span>
            </div>
            <Progress value={stats.completion_rate} className="h-2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTasksWidget = (widget: Widget) => {
    const tasks = widget.data
    return (
      <Card className="touch-friendly-card bg-dark-card border border-neon-lime">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium font-orbitron uppercase tracking-wider text-white">Quick Tasks</CardTitle>
            <Button 
              size="sm" 
              className="h-6 w-6 p-0 touch-target"
              onClick={() => onWidgetAction(widget.id, 'add_task')}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks.slice(0, 3).map((task: any,: number) => (
            <motion.div
              key={task.id}
              className="flex items-center gap-3 p-2 bg-dark-hover border border-gray-700 rounded-sm touch-target"
              whileTap={{ scale: 0.98 }}
              onTap={() => onWidgetAction(widget.id, 'complete_task', task.id)}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex-shrink-0",
                task.completed ? "bg-neon-lime border-neon-lime" : "border-gray-700"
              )}>
                {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-xs font-medium truncate font-mono text-gray-300",
                  task.completed && "line-through text-gray-500"
                )}>
                  {task.title}
                </div>
                {task.priority === 'high' && (
                  <Badge className="text-xs h-4 bg-dark-card text-neon-magenta border border-neon-magenta font-mono">
                    High
                  </Badge>
                )}
              </div>
            </motion.div>
          ))}
          
          {tasks.length > 3 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs touch-target font-mono text-gray-300"
              onClick={() => onWidgetAction(widget.id, 'view_all')}
            >
              View {tasks.length - 3} more tasks
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderGoalsWidget = (widget: Widget) => {
    const goals = widget.data
    return (
      <Card className="touch-friendly-card bg-dark-card border border-neon-orange">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium font-orbitron uppercase tracking-wider text-white">Active Goals</CardTitle>
            <Button 
              size="sm" 
              className="h-6 w-6 p-0 touch-target"
              onClick={() => onWidgetAction(widget.id, 'add_goal')}
            >
              <Target className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {goals.slice(0, 2).map((goal: any,: number) => (
            <motion.div
              key={goal.id}
              className="p-3 bg-dark-hover border border-gray-700 rounded-sm touch-target"
              whileTap={{ scale: 0.98 }}
              onTap={() => onWidgetAction(widget.id, 'view_goal', goal.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium truncate flex-1 font-mono text-gray-300">
                  {goal.title}
                </div>
                <div className="text-xs text-neon-orange font-bold font-mono">
                  {goal.progress}%
                </div>
              </div>
              <Progress value={goal.progress} className="h-2" />
              {goal.due_date && (
                <div className="flex items-center gap-1 mt-2">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-300 font-mono">
                    Due {new Date(goal.due_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const renderAgentsWidget = (widget: Widget) => {
    const agents = widget.data
    return (
      <Card className="touch-friendly-card bg-dark-card border border-neon-purple">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium font-orbitron uppercase tracking-wider text-white">AI Squad</CardTitle>
            <Badge variant="outline" className="text-xs">
              {agents.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {agents.map((agent: any,: number) => (
              <motion.div
                key={agent.id}
                className="flex-shrink-0 p-3 bg-dark-hover border border-gray-700 rounded-sm touch-target min-w-[80px] text-center"
                whileTap={{ scale: 0.95 }}
                onTap={() => onWidgetAction(widget.id, 'chat_agent', agent.id)}
              >
                <Avatar className="w-8 h-8 mx-auto mb-2">
                  <AvatarFallback 
                    style={{ backgroundColor: `var(--bg-color-${Math.random().toString(36).substr(2, 9)})`}}
                    className="text-white text-xs font-mono"
                  >
                    {agent.display_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs font-medium truncate font-mono text-gray-300">
                  {agent.display_name}
                </div>
                {agent.has_new_messages && (
                  <div className="w-2 h-2 bg-neon-magenta rounded-sm mx-auto mt-1" />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderInsightsWidget = (widget: Widget) => {
    const insights = widget.data
    return (
      <Card className="touch-friendly-card bg-dark-card border border-neon-cyan">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium font-orbitron uppercase tracking-wider text-white">AI Insights</CardTitle>
            <Button 
              size="sm" 
              className="h-6 w-6 p-0 touch-target"
              onClick={() => onWidgetAction(widget.id, 'refresh_insights')}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {insights.slice(0, 2).map((insight: any, index: number) => (
            <motion.div
              key={index}
              className="p-3 bg-dark-hover border border-gray-700 rounded-sm touch-target"
              whileTap={{ scale: 0.98 }}
              onTap={() => onWidgetAction(widget.id, 'view_insight', insight)}
            >
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-sm mt-2 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium mb-1 font-mono text-gray-300">{insight.title}</div>
                  <div className="text-xs text-gray-300 font-mono line-clamp-2">
                    {insight.description}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const renderFocusWidget = (widget: Widget) => {
    const focus = widget.data
    return (
      <Card className="touch-friendly-card bg-dark-card border border-neon-orange">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium font-orbitron uppercase tracking-wider text-white">Focus Session</CardTitle>
            <Badge variant="outline" className="text-xs">
              {focus.is_active ? 'Active' : 'Ready'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <div className="relative w-24 h-24 mx-auto">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="transparent"
                stroke="#30363d"
                strokeWidth="6"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="transparent"
                stroke="#ff8a00"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - focus.progress / 100)}`}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-neon-orange font-mono">
                  {focus.remaining_time}
                </div>
                <div className="text-xs text-gray-300 font-mono">mins</div>
              </div>
            </div>
          </div>
          
          <Button 
            className={cn(
              "w-full touch-target",
              focus.is_active 
                ? "bg-neon-magenta hover:bg-neon-magenta/80" 
                : "bg-neon-orange hover:bg-neon-orange/80",
              "font-mono font-bold uppercase tracking-wider"
            )}
            onClick={() => onWidgetAction(widget.id, focus.is_active ? 'stop_focus' : 'start_focus')}
          >
            <Clock className="w-4 h-4 mr-2" />
            {focus.is_active ? 'Stop Focus' : 'Start Focus'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const renderWidget = (widget: Widget) => {
    const controls = useAnimation()
    
    const baseProps = {
      layout: true,
      drag: isReordering ? ("y" as const) : false,
      dragConstraints: { top: 0, bottom: 0 },
      dragElastic: 0.2,
      onDragStart: () => setDraggedWidget(widget.id),
      onDragEnd: (event: any, info: PanInfo) => {
        if (!isReordering) {
          handleWidgetSwipe(event, info, widget.id)
        }
        setDraggedWidget(null)
      },
      animate: controls,
      whileDrag: { scale: 1.05, rotate: 2 },
      transition: SPRING_CONFIG,
      onLongPress: () => handleLongPress(widget.id),
      className: cn(
        "cursor-pointer select-none",
        draggedWidget === widget.id && "z-10",
        isReordering && "cursor-move"
      )
    }

    return (
      <motion.div key={widget.id} {...baseProps}>
        {widget.type === 'stats' && renderStatsWidget(widget)}
        {widget.type === 'tasks' && renderTasksWidget(widget)}
        {widget.type === 'goals' && renderGoalsWidget(widget)}
        {widget.type === 'agents' && renderAgentsWidget(widget)}
        {widget.type === 'insights' && renderInsightsWidget(widget)}
        {widget.type === 'focus' && renderFocusWidget(widget)}
      </motion.div>
    )
  }

  return (
    <div className={cn("space-y-4 pb-4", className)} ref={containerRef}>
      {/* Reordering mode toggle */}
      {isReordering && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 bg-dark-card rounded-sm border border-neon-cyan"
        >
          <div className="text-sm font-medium text-neon-cyan font-mono">
            Drag widgets to reorder
          </div>
          <Button 
            size="sm" 
            onClick={() => setIsReordering(false)}
            className="touch-target"
          >
            Done
          </Button>
        </motion.div>
      )}

      {/* Widgets */}
      <div className="space-y-4">
        {widgets
          .sort((a, b) => a.priority - b.priority)
          .map(renderWidget)}
      </div>

      {/* Quick Actions Footer */}
      <motion.div
        className="sticky bottom-0 bg-dark-bg/90 backdrop-blur-sm border-t border-gray-800 p-4 -mx-4"
        initial={false}
      >
        <div className="grid grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-col h-12 touch-target"
            onClick={() => onWidgetAction('quick', 'add_task')}
          >
            <Plus className="h-4 w-4 mb-1" />
            <span className="text-xs font-mono">Task</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-col h-12 touch-target"
            onClick={() => onWidgetAction('quick', 'chat_ai')}
          >
            <Users className="h-4 w-4 mb-1" />
            <span className="text-xs font-mono">AI Chat</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-col h-12 touch-target"
            onClick={() => onWidgetAction('quick', 'start_focus')}
          >
            <Clock className="h-4 w-4 mb-1" />
            <span className="text-xs font-mono">Focus</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-col h-12 touch-target"
            onClick={() => onWidgetAction('quick', 'view_analytics')}
          >
            <BarChart3 className="h-4 w-4 mb-1" />
            <span className="text-xs font-mono">Stats</span>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}