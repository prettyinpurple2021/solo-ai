"use client"

import, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  Flag, 
  Trash2, 
  Edit,
  GripVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'

interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  due_date: string | null
  estimated_minutes: number
  goal?: {
    id: string
    title: string
    category: string | null
  } | null
}

interface GestureTaskCardProps {
  task: Task
  onToggleComplete: (taskId: string, completed: boolean) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  className?: string
}

export default function GestureTaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  className = ""
}: GestureTaskCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [longPressTimeout, setLongPressTimeout] = useState<NodeJS.Timeout (null)
  const [isLongPress, setIsLongPress] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5])
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95])

  // Swipe action indicators
  const leftActionOpacity = useTransform(x, [0, -50, -100], [0, 0.5, 1])
  const rightActionOpacity = useTransform(x, [0, 50, 100], [0, 0.5, 1])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'  
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'todo': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handlePanStart = () => {
    setIsDragging(true)
    setIsLongPress(false)
    if (longPressTimeout) {
      clearTimeout(longPressTimeout)
      setLongPressTimeout(null)
    }
  }

  const handlePan = (event: any, info: PanInfo) => {
    x.set(info.offset.x)
  }

  const handlePanEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    const offset = info.offset.x
    const velocity = info.velocity.x

    // Swipe to complete (left swipe)
    if (offset < -100 || velocity < -500) {
      onToggleComplete(task.id, true)
      x.set(0) // Reset position
      return
    }

    // Swipe to delete (right swipe)
    if (offset > 100 || velocity > 500) {
      onDelete(task.id)
      return
    }

    // Return to center if swipe wasn't strong enough
    x.set(0)
  }

  const handleTouchStart = () => {
    if (isDragging || isLongPress) return
    
    const timeout = setTimeout(() => {
      setIsLongPress(true)
      setShowActions(true)
      
      // Haptic feedback if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }, 500) // 500ms long press
    
    setLongPressTimeout(timeout)
  }

  const handleTouchEnd = () => {
    if (longPressTimeout) {
      clearTimeout(longPressTimeout)
      setLongPressTimeout(null)
    }
    
    if (isLongPress) {
      setIsLongPress(false)
    }
  }

  const handleQuickAction = (action: 'complete' | 'edit' | 'delete') => {
    setShowActions(false)
    
    switch (action) {
      case 'complete':
        onToggleComplete(task.id, task.status !== 'completed')
        break
      case 'edit':
        onEdit(task)
        break
      case 'delete':
        onDelete(task.id)
        break
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout)
      }
    }
  }, [longPressTimeout])

  return (
    <div className={cn("relative select-none", className)}>
      {/* Swipe Action Backgrounds */}
      <motion.div 
        className="absolute inset-0 bg-green-500 rounded-lg flex items-center justify-start pl-6"
        style={{ opacity: leftActionOpacity }}
      >
        <CheckSquare className="w-6 h-6 text-white" />
        <span className="ml-2 text-white font-medium">Complete</span>
      </motion.div>
      
      <motion.div 
        className="absolute inset-0 bg-red-500 rounded-lg flex items-center justify-end pr-6"
        style={{ opacity: rightActionOpacity }}
      >
        <span className="mr-2 text-white font-medium">Delete</span>
        <Trash2 className="w-6 h-6 text-white" />
      </motion.div>

      {/* Main Task Card */}
      <motion.div
        ref={cardRef}
        style={{ x, opacity, scale }}
        drag="x"
        dragConstraints={{ left: -250, right: 250 }}
        dragElastic={0.2}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        whileTap={{ scale: 0.98 }}
        className="relative z-10"
      >
        <Card className={cn(
          "transition-all duration-200 cursor-pointer touch-manipulation",
          task.status === 'completed' && "opacity-75",
          showActions && "ring-2 ring-purple-400 ring-opacity-50",
          isDragging && "shadow-lg"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              {/* Task Content */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Large Checkbox - Touch Friendly */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleComplete(task.id, task.status !== 'completed')
                  }}
                  className={cn(
                    "mt-1 w-6 h-6 rounded border-2 flex items-center justify-center",
                    "transition-colors duration-200 touch-manipulation",
                    "focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50",
                    task.status === 'completed' 
                      ? "bg-green-500 border-green-500 text-white" 
                      : "border-gray-300 hover:border-purple-400"
                  )}
                  aria-label={`Mark task "${task.title}" as ${task.status === 'completed' ? 'incomplete' : 'completed'}`}
                >
                  {task.status === 'completed' && (
                    <CheckSquare className="w-4 h-4" />
                  )}
                </button>
                
                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-medium text-sm mb-1 leading-tight",
                    task.status === 'completed' && "line-through text-gray-500"
                  )}>
                    {task.title}
                  </h4>
                  
                  {task.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  {/* Task Meta - Touch Friendly Layout */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.estimated_minutes}m</span>
                    </div>
                    
                    {task.goal && (
                      <div className="flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">{task.goal.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Priority & Status Badges */}
              <div className="flex flex-col items-end gap-1 ml-2">
                <Badge className={getPriorityColor(task.priority)} variant="outline">
                  {task.priority}
                </Badge>
                <Badge className={getStatusColor(task.status)} variant="outline">
                  {task.status}
                </Badge>
                
                {/* Drag Handle */}
                <button 
                  className="mt-1 p-1 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Quick Actions Menu - Appears on Long Press */}
            {showActions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2"
              >
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAction('complete')}
                    className="flex-1 h-12 text-xs"
                  >
                    <CheckSquare className="w-4 h-4 mr-1" />
                    {task.status === 'completed' ? 'Undo' : 'Complete'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAction('edit')}
                    className="flex-1 h-12 text-xs"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickAction('delete')}
                    className="flex-1 h-12 text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
                
                <div className="text-center mt-2">
                  <button
                    onClick={() => setShowActions(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Swipe Hint - Show on first render */}
      <div className="text-xs text-center text-gray-400 mt-1">
        <span className="inline-flex items-center gap-1">
          ← Swipe to complete • Long press for menu • Swipe to delete →
        </span>
      </div>
    </div>
  )
}