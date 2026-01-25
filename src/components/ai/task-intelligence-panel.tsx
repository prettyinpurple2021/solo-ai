"use client"

import { logError,} from '@/lib/logger'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Brain, 
  Target, 
  Clock, 
,
  AlertCircle,
  CheckCircle,
  Lightbulb,
,
  BarChart3,
  ArrowRight,
  RefreshCw
} from "lucide-react"
import { useTaskIntelligence } from '@/hooks/use-task-intelligence'
import { TaskIntelligenceData, TaskSuggestion,} from '@/lib/ai-task-intelligence'


interface TaskIntelligencePanelProps {
  tasks: TaskIntelligenceData[]
  onApplySuggestion: (taskId: string, suggestion: TaskSuggestion) => Promise<void>
  onReorderTasks: (optimizedOrder: string[]) => Promise<void>
  className?: string
}

export default function TaskIntelligencePanel({
  tasks,
  onApplySuggestion,
  onReorderTasks,
  className = ""
}: TaskIntelligencePanelProps) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set())
  
  const {
    optimizeTasks,
    getOptimizedOrder,
    getWorkloadAnalysis,
    getProductivityTips,
    getTaskSuggestions,
    getSuggestionForTask,
    loading,
    error,
    lastOptimized,
    optimizationResult
  } = useTaskIntelligence({
    autoOptimize: false,
    enableAI: true
  })

  // Auto-optimize when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      handleOptimize()
    }
  }, [tasks.length])

  const handleOptimize = async () => {
    setIsOptimizing(true)
    try {
      await optimizeTasks(tasks)
    } catch (err) {
      logError('Failed to optimize tasks:', err)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleApplySuggestion = async (taskId: string) => {
    const suggestion = getSuggestionForTask(taskId)
    if (!suggestion) return

    try {
      await onApplySuggestion(taskId, suggestion)
      setAppliedSuggestions(prev => new Set([...prev, taskId]))
    } catch (err) {
      logError('Failed to apply suggestion:', err)
    }
  }

  const handleApplyOptimizedOrder = async () => {
    const optimizedOrder = getOptimizedOrder()
    if (optimizedOrder.length === 0) return

    try {
      await onReorderTasks(optimizedOrder)
    } catch (err) {
      logError('Failed to apply optimized order:', err)
    }
  }

  const workloadAnalysis = getWorkloadAnalysis()
  const suggestions = getTaskSuggestions()
  const productivityTips = getProductivityTips()
  const optimizedOrder = getOptimizedOrder()

  if (tasks.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Add tasks to see AI-powered insights</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <div>
              <CardTitle>AI Task Intelligence</CardTitle>
              <CardDescription>
                {lastOptimized ? `Last optimized ${lastOptimized.toLocaleTimeString()}` : 'Click optimize for AI insights'}
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleOptimize}
            disabled={loading || isOptimizing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(loading || isOptimizing) ? 'animate-spin' : ''}`} />
            Optimize
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>AI Analysis Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {optimizationResult && (
          <Tabs defaultValue="workload" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="workload">Workload</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
            </TabsList>

            {/* Workload Analysis Tab */}
            <TabsContent value="workload" className="space-y-4">
              {workloadAnalysis && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Workload Score</h3>
                    <Badge 
                      variant={workloadAnalysis.workloadScore > 80 ? "destructive" : 
                              workloadAnalysis.workloadScore > 60 ? "default" : "secondary"}
                    >
                      {workloadAnalysis.workloadScore}/100
                    </Badge>
                  </div>
                  
                  <Progress value={workloadAnalysis.workloadScore} className="h-3 mb-4" />
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{workloadAnalysis.totalTasks}</div>
                      <div className="text-xs text-gray-600">Total Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{Math.round(workloadAnalysis.estimatedTotalTime / 60)}h</div>
                      <div className="text-xs text-gray-600">Est. Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{workloadAnalysis.highPriorityTasks}</div>
                      <div className="text-xs text-gray-600">High Priority</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{workloadAnalysis.overdueTasks}</div>
                      <div className="text-xs text-gray-600">Overdue</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {workloadAnalysis.recommendations.map((rec, index) => (
                      <Alert key={index} className="py-2">
                        <AlertDescription className="text-sm">{rec}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Task Suggestions Tab */}
            <TabsContent value="suggestions" className="space-y-3">
              {suggestions.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{suggestions.length} AI Suggestions</span>
                    {optimizedOrder.length > 0 && (
                      <Button onClick={handleApplyOptimizedOrder} size="sm">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Apply Order
                      </Button>
                    )}
                  </div>
                  
                  {suggestions.slice(0, 5).map((suggestion) => {
                    const task = tasks.find(t => t.id === suggestion.taskId)
                    const isApplied = appliedSuggestions.has(suggestion.taskId)
                    
                    if (!task) return null
                    
                    return (
                      <Card key={suggestion.taskId} className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm mb-1">{task.title}</div>
                            <div className="text-xs text-gray-600 mb-2">{suggestion.reasoning}</div>
                            
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="outline" className="text-xs py-0">
                                {suggestion.suggestedPriority}
                              </Badge>
                              <Badge variant="outline" className="text-xs py-0">
                                {suggestion.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs py-0">
                                {suggestion.impact} impact
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-2">
                            <div className="text-xs text-gray-500">
                              {Math.round(suggestion.confidence * 100)}%
                            </div>
                            {isApplied ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Button
                                onClick={() => handleApplySuggestion(suggestion.taskId)}
                                size="sm"
                                variant="outline"
                              >
                                Apply
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No suggestions available</p>
                </div>
              )}
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4">
              {workloadAnalysis?.suggestedSchedule && (
                <div>
                  {Object.entries(workloadAnalysis.suggestedSchedule).map(([timeSlot, taskIds]) => (
                    <div key={timeSlot} className="mb-4">
                      <h4 className="font-medium text-sm mb-2 capitalize flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {timeSlot} ({taskIds.length} tasks)
                      </h4>
                      <div className="space-y-1">
                        {taskIds.map((taskId) => {
                          const task = tasks.find(t => t.id === taskId)
                          return task ? (
                            <div key={taskId} className="text-xs p-2 bg-gray-50 rounded flex items-center justify-between">
                              <span>{task.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {task.estimated_minutes || 30}m
                              </Badge>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Productivity Tips Tab */}
            <TabsContent value="tips" className="space-y-3">
              {productivityTips.length > 0 ? (
                productivityTips.map((tip, index) => (
                  <Alert key={index}>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>{tip}</AlertDescription>
                  </Alert>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No tips available yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!optimizationResult && !loading && (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Click "Optimize" to get AI-powered insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}