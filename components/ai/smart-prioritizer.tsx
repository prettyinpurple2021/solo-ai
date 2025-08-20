"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Clock, 
  TrendingUp, 
  Target, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  ArrowUpDown,
  Sparkles
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  estimated_hours?: number
  category?: string
  status: 'pending' | 'in_progress' | 'completed'
  created_at: string
}

interface PrioritizedTask extends Task {
  ai_score: number
  ai_reason: string
  suggested_order: number
}

interface SmartPrioritizerProps {
  tasks: Task[]
  onPrioritize: (prioritizedTasks: PrioritizedTask[]) => void
  className?: string
}

export function SmartPrioritizer({ tasks, onPrioritize, className = "" }: SmartPrioritizerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [prioritizedTasks, setPrioritizedTasks] = useState<PrioritizedTask[]>([])
  const [showResults, setShowResults] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const { toast } = useToast()

  const analyzeTasks = async () => {
    if (tasks.length === 0) {
      toast({
        title: "No tasks to analyze",
        description: "Add some tasks first to get AI prioritization",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setShowResults(false)

    try {
      // Simulate AI analysis with progress updates
      const steps = [
        "Analyzing task complexity...",
        "Evaluating deadlines and urgency...",
        "Calculating impact scores...",
        "Optimizing task order...",
        "Generating recommendations..."
      ]

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setAnalysisProgress(((i + 1) / steps.length) * 100)
      }

      // AI prioritization algorithm
      const prioritized = tasks.map(task => {
        const score = calculateAIScore(task)
        return {
          ...task,
          ai_score: score,
          ai_reason: generateAIReason(task, score),
          suggested_order: 0
        }
      }).sort((a, b) => b.ai_score - a.ai_score)

      // Assign suggested order
      prioritized.forEach((task, index) => {
        task.suggested_order = index + 1
      })

      setPrioritizedTasks(prioritized)
      setShowResults(true)
      
      toast({
        title: "🎯 AI Prioritization Complete!",
        description: `Optimized ${tasks.length} tasks for maximum productivity`,
      })

    } catch (error) {
      console.error('AI analysis failed:', error)
      toast({
        title: "❌ Analysis failed",
        description: "Please try again or prioritize manually",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const calculateAIScore = (task: Task): number => {
    let score = 0

    // Base priority score
    const priorityScores = { low: 1, medium: 2, high: 3, urgent: 4 }
    score += priorityScores[task.priority] * 25

    // Deadline urgency (closer = higher score)
    if (task.due_date) {
      const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysUntilDue <= 0) score += 30 // Overdue
      else if (daysUntilDue <= 1) score += 25 // Due today/tomorrow
      else if (daysUntilDue <= 3) score += 20 // Due this week
      else if (daysUntilDue <= 7) score += 15 // Due next week
      else score += 5 // Due later
    }

    // Task complexity (shorter = higher score for quick wins)
    if (task.estimated_hours) {
      if (task.estimated_hours <= 1) score += 15 // Quick wins
      else if (task.estimated_hours <= 4) score += 10 // Medium tasks
      else score += 5 // Complex tasks
    }

    // Category importance (business impact)
    if (task.category) {
      const categoryScores: Record<string, number> = {
        'revenue': 20,
        'marketing': 15,
        'product': 15,
        'operations': 10,
        'admin': 5
      }
      score += categoryScores[task.category.toLowerCase()] || 5
    }

    // Recency bonus (newer tasks get slight boost)
    const daysSinceCreated = Math.ceil((Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceCreated <= 1) score += 5

    return Math.min(score, 100) // Cap at 100
  }

  const generateAIReason = (task: Task, score: number): string => {
    const reasons = []

    if (task.due_date) {
      const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysUntilDue <= 0) reasons.push("Overdue - immediate attention needed")
      else if (daysUntilDue <= 1) reasons.push("Due very soon")
      else if (daysUntilDue <= 3) reasons.push("Due this week")
    }

    if (task.priority === 'urgent' || task.priority === 'high') {
      reasons.push("High priority task")
    }

    if (task.estimated_hours && task.estimated_hours <= 1) {
      reasons.push("Quick win opportunity")
    }

    if (task.category === 'revenue') {
      reasons.push("Direct revenue impact")
    }

    if (score >= 80) reasons.push("High strategic value")
    else if (score >= 60) reasons.push("Good balance of urgency and impact")
    else if (score >= 40) reasons.push("Moderate priority")
    else reasons.push("Lower priority - consider delegating")

    return reasons.join(", ")
  }

  const applyPrioritization = () => {
    onPrioritize(prioritizedTasks)
    toast({
      title: "✅ Prioritization Applied!",
      description: "Your tasks have been reordered for optimal productivity",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800'
    if (score >= 60) return 'bg-orange-100 text-orange-800'
    if (score >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'high': return <TrendingUp className="w-4 h-4 text-orange-600" />
      case 'medium': return <Target className="w-4 h-4 text-yellow-600" />
      case 'low': return <CheckCircle className="w-4 h-4 text-green-600" />
      default: return <Target className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Task Prioritizer
        </CardTitle>
        <CardDescription>
          Let AI analyze your tasks and suggest the optimal order for maximum productivity
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
              <span className="text-sm font-medium">AI is analyzing your tasks...</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
            <p className="text-xs text-gray-500">
              {analysisProgress < 20 && "Analyzing task complexity..."}
              {analysisProgress >= 20 && analysisProgress < 40 && "Evaluating deadlines and urgency..."}
              {analysisProgress >= 40 && analysisProgress < 60 && "Calculating impact scores..."}
              {analysisProgress >= 60 && analysisProgress < 80 && "Optimizing task order..."}
              {analysisProgress >= 80 && "Generating recommendations..."}
            </p>
          </div>
        )}

        {/* Action Button */}
        {!isAnalyzing && !showResults && (
          <Button 
            onClick={analyzeTasks} 
            className="w-full"
            disabled={tasks.length === 0}
          >
            <Brain className="w-4 h-4 mr-2" />
            Analyze & Prioritize Tasks
          </Button>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">AI Recommendations</h4>
              <Badge variant="secondary" className="text-xs">
                {prioritizedTasks.length} tasks analyzed
              </Badge>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {prioritizedTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className="border rounded-lg p-3 bg-white/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          #{task.suggested_order}
                        </Badge>
                        {getPriorityIcon(task.priority)}
                        <span className="text-sm font-medium truncate">
                          {task.title}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs ${getScoreColor(task.ai_score)}`}>
                          AI Score: {task.ai_score}
                        </Badge>
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600">
                        {task.ai_reason}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={applyPrioritization} className="flex-1">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Apply Prioritization
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowResults(false)}
              >
                Analyze Again
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        {!isAnalyzing && !showResults && (
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <p className="font-medium mb-1">💡 AI Analysis Factors:</p>
            <ul className="space-y-1">
              <li>• Deadline urgency and overdue status</li>
              <li>• Task priority and complexity</li>
              <li>• Business impact and category</li>
              <li>• Quick win opportunities</li>
              <li>• Strategic value assessment</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
