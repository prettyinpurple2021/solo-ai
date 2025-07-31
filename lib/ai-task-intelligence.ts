import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export interface TaskIntelligenceData {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  estimated_minutes?: number
  goal_id?: string
  category?: string
  tags?: string[]
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface TaskSuggestion {
  taskId: string
  suggestedPriority: 'low' | 'medium' | 'high' | 'urgent'
  suggestedDeadline?: string
  suggestedCategory?: string
  suggestedTags?: string[]
  confidence: number
  reasoning: string
  estimatedCompletionTime?: number
  dependencies?: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  impact: 'low' | 'medium' | 'high'
  urgency: 'low' | 'medium' | 'high'
}

export interface WorkloadAnalysis {
  totalTasks: number
  estimatedTotalTime: number
  highPriorityTasks: number
  overdueTasks: number
  workloadScore: number // 0-100
  recommendations: string[]
  suggestedSchedule: {
    morning: string[]
    afternoon: string[]
    evening: string[]
  }
}

export interface TaskOptimizationResult {
  optimizedOrder: string[]
  workloadAnalysis: WorkloadAnalysis
  suggestions: TaskSuggestion[]
  productivityTips: string[]
}

export class TaskIntelligenceEngine {
  private userContext: {
    workStyle: 'focused' | 'collaborative' | 'flexible'
    preferredWorkHours: { start: string; end: string }
    energyPatterns: { morning: number; afternoon: number; evening: number }
    currentWorkload: number
    goals: string[]
  }

  constructor(userContext?: Partial<TaskIntelligenceEngine['userContext']>) {
    this.userContext = {
      workStyle: 'focused',
      preferredWorkHours: { start: '09:00', end: '17:00' },
      energyPatterns: { morning: 0.8, afternoon: 0.6, evening: 0.4 },
      currentWorkload: 0,
      goals: [],
      ...userContext
    }
  }

  /**
   * Analyze and optimize task list using AI
   */
  async optimizeTaskList(tasks: TaskIntelligenceData[]): Promise<TaskOptimizationResult> {
    try {
      // Filter out completed tasks
      const activeTasks = tasks.filter(task => task.status !== 'completed')
      
      if (activeTasks.length === 0) {
        return {
          optimizedOrder: [],
          workloadAnalysis: this.createEmptyWorkloadAnalysis(),
          suggestions: [],
          productivityTips: ['No active tasks to optimize!']
        }
      }

      // Generate AI suggestions for each task
      const suggestions = await Promise.all(
        activeTasks.map(task => this.generateTaskSuggestion(task, activeTasks))
      )

      // Create optimized task order
      const optimizedOrder = this.createOptimizedOrder(activeTasks, suggestions)

      // Analyze workload
      const workloadAnalysis = this.analyzeWorkload(activeTasks, suggestions)

      // Generate productivity tips
      const productivityTips = await this.generateProductivityTips(activeTasks, workloadAnalysis)

      return {
        optimizedOrder,
        workloadAnalysis,
        suggestions,
        productivityTips
      }
    } catch (error) {
      console.error('Error optimizing task list:', error)
      throw new Error('Failed to optimize task list')
    }
  }

  /**
   * Generate AI-powered suggestions for a single task
   */
  async generateTaskSuggestion(
    task: TaskIntelligenceData, 
    allTasks: TaskIntelligenceData[]
  ): Promise<TaskSuggestion> {
    try {
      const prompt = this.buildTaskAnalysisPrompt(task, allTasks)
      
      const result = await generateText({
        model: openai('gpt-4-turbo'),
        prompt,
        temperature: 0.3,
        maxTokens: 500,
      })

      return this.parseTaskSuggestion(result.text, task.id)
    } catch (error) {
      console.error('Error generating task suggestion:', error)
      return this.createDefaultSuggestion(task)
    }
  }

  /**
   * Create optimized task order based on priority, urgency, and dependencies
   */
  private createOptimizedOrder(
    tasks: TaskIntelligenceData[], 
    suggestions: TaskSuggestion[]
  ): string[] {
    // Create a map of task suggestions for quick lookup
    const suggestionMap = new Map(suggestions.map(s => [s.taskId, s]))

    // Score each task based on multiple factors
    const scoredTasks = tasks.map(task => {
      const suggestion = suggestionMap.get(task.id)
      const score = this.calculateTaskScore(task, suggestion)
      return { taskId: task.id, score }
    })

    // Sort by score (highest first)
    scoredTasks.sort((a, b) => b.score - a.score)

    return scoredTasks.map(t => t.taskId)
  }

  /**
   * Calculate a comprehensive score for task prioritization
   */
  private calculateTaskScore(task: TaskIntelligenceData, suggestion?: TaskSuggestion): number {
    let score = 0

    // Base priority score
    const priorityScores = { low: 1, medium: 2, high: 3, urgent: 4 }
    score += priorityScores[task.priority] * 10

    // Urgency score (based on due date)
    if (task.due_date) {
      const dueDate = new Date(task.due_date)
      const now = new Date()
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDue < 0) score += 50 // Overdue
      else if (daysUntilDue === 0) score += 40 // Due today
      else if (daysUntilDue === 1) score += 30 // Due tomorrow
      else if (daysUntilDue <= 3) score += 20 // Due this week
      else if (daysUntilDue <= 7) score += 10 // Due next week
    }

    // AI suggestion confidence
    if (suggestion) {
      score += suggestion.confidence * 5
      
      // Impact and urgency from AI
      const impactScores = { low: 1, medium: 2, high: 3 }
      const urgencyScores = { low: 1, medium: 2, high: 3 }
      
      score += impactScores[suggestion.impact] * 3
      score += urgencyScores[suggestion.urgency] * 3
    }

    // Time-based scoring (shorter tasks get slight boost for quick wins)
    if (task.estimated_minutes) {
      if (task.estimated_minutes <= 30) score += 5 // Quick wins
      else if (task.estimated_minutes <= 120) score += 2 // Medium tasks
    }

    return score
  }

  /**
   * Analyze overall workload and provide insights
   */
  private analyzeWorkload(
    tasks: TaskIntelligenceData[], 
    suggestions: TaskSuggestion[]
  ): WorkloadAnalysis {
    const totalTasks = tasks.length
    const estimatedTotalTime = tasks.reduce((sum, task) => sum + (task.estimated_minutes || 0), 0)
    const highPriorityTasks = tasks.filter(task => task.priority === 'high' || task.priority === 'urgent').length
    
    const overdueTasks = tasks.filter(task => {
      if (!task.due_date) return false
      return new Date(task.due_date) < new Date()
    }).length

    // Calculate workload score (0-100)
    const workloadScore = Math.min(100, Math.max(0, 
      (totalTasks * 5) + 
      (estimatedTotalTime / 60 * 2) + 
      (highPriorityTasks * 10) + 
      (overdueTasks * 15)
    ))

    // Generate recommendations
    const recommendations = this.generateWorkloadRecommendations(
      totalTasks, 
      estimatedTotalTime, 
      highPriorityTasks, 
      overdueTasks, 
      workloadScore
    )

    // Create suggested schedule
    const suggestedSchedule = this.createSuggestedSchedule(tasks, suggestions)

    return {
      totalTasks,
      estimatedTotalTime,
      highPriorityTasks,
      overdueTasks,
      workloadScore,
      recommendations,
      suggestedSchedule
    }
  }

  /**
   * Generate workload recommendations
   */
  private generateWorkloadRecommendations(
    totalTasks: number,
    estimatedTime: number,
    highPriorityTasks: number,
    overdueTasks: number,
    workloadScore: number
  ): string[] {
    const recommendations: string[] = []

    if (workloadScore > 80) {
      recommendations.push('🚨 High workload detected! Consider delegating or postponing non-urgent tasks.')
    } else if (workloadScore > 60) {
      recommendations.push('⚠️ Moderate workload. Focus on high-priority items first.')
    } else {
      recommendations.push('✅ Manageable workload. You can take on additional tasks if needed.')
    }

    if (overdueTasks > 0) {
      recommendations.push(`⏰ You have ${overdueTasks} overdue task(s). Address these immediately.`)
    }

    if (highPriorityTasks > 5) {
      recommendations.push(`🎯 You have ${highPriorityTasks} high-priority tasks. Consider breaking them down.`)
    }

    if (estimatedTime > 480) { // More than 8 hours
      recommendations.push('⏱️ Estimated work time exceeds 8 hours. Consider spreading tasks across multiple days.')
    }

    return recommendations
  }

  /**
   * Create suggested daily schedule
   */
  private createSuggestedSchedule(
    tasks: TaskIntelligenceData[], 
    suggestions: TaskSuggestion[]
  ): WorkloadAnalysis['suggestedSchedule'] {
    const morning: string[] = []
    const afternoon: string[] = []
    const evening: string[] = []

    // Sort tasks by optimized order
    const optimizedOrder = this.createOptimizedOrder(tasks, suggestions)
    const sortedTasks = optimizedOrder.map(id => tasks.find(t => t.id === id)!).filter(Boolean)

    // Distribute tasks based on energy patterns and task characteristics
    sortedTasks.forEach(task => {
      const suggestion = suggestions.find(s => s.taskId === task.id)
      const isHighEnergy = suggestion?.difficulty === 'easy' || task.estimated_minutes! <= 60
      const isMediumEnergy = suggestion?.difficulty === 'medium' || (task.estimated_minutes! > 60 && task.estimated_minutes! <= 180)
      const isLowEnergy = suggestion?.difficulty === 'hard' || task.estimated_minutes! > 180

      if (isHighEnergy && morning.length < 3) {
        morning.push(task.id)
      } else if (isMediumEnergy && afternoon.length < 4) {
        afternoon.push(task.id)
      } else if (isLowEnergy && evening.length < 2) {
        evening.push(task.id)
      } else {
        // Fallback distribution
        if (morning.length < 3) morning.push(task.id)
        else if (afternoon.length < 4) afternoon.push(task.id)
        else if (evening.length < 2) evening.push(task.id)
      }
    })

    return { morning, afternoon, evening }
  }

  /**
   * Generate productivity tips using AI
   */
  async generateProductivityTips(
    tasks: TaskIntelligenceData[], 
    workloadAnalysis: WorkloadAnalysis
  ): Promise<string[]> {
    try {
      const prompt = `Based on this workload analysis, provide 3-5 actionable productivity tips:

Workload Score: ${workloadAnalysis.workloadScore}/100
Total Tasks: ${workloadAnalysis.totalTasks}
Estimated Time: ${Math.round(workloadAnalysis.estimatedTotalTime / 60)} hours
High Priority Tasks: ${workloadAnalysis.highPriorityTasks}
Overdue Tasks: ${workloadAnalysis.overdueTasks}

Provide specific, actionable tips that would help improve productivity and task management. Keep each tip under 100 characters.`

      const result = await generateText({
        model: openai('gpt-4-turbo'),
        prompt,
        temperature: 0.7,
        maxTokens: 300,
      })

      return result.text.split('\n').filter(line => line.trim().length > 0).slice(0, 5)
    } catch (error) {
      console.error('Error generating productivity tips:', error)
      return [
        '🎯 Focus on one task at a time for better results',
        '⏰ Use time blocking to structure your day',
        '✅ Celebrate small wins to maintain momentum'
      ]
    }
  }

  /**
   * Build prompt for task analysis
   */
  private buildTaskAnalysisPrompt(task: TaskIntelligenceData, allTasks: TaskIntelligenceData[]): string {
    return `Analyze this task and provide intelligent suggestions:

TASK: ${task.title}
DESCRIPTION: ${task.description || 'No description'}
PRIORITY: ${task.priority}
DUE DATE: ${task.due_date || 'No due date'}
ESTIMATED TIME: ${task.estimated_minutes || 'Unknown'} minutes
CATEGORY: ${task.category || 'Uncategorized'}
TAGS: ${task.tags?.join(', ') || 'None'}

CONTEXT:
- Total active tasks: ${allTasks.length}
- User work style: ${this.userContext.workStyle}
- Preferred hours: ${this.userContext.preferredWorkHours.start} - ${this.userContext.preferredWorkHours.end}

Provide a JSON response with:
{
  "suggestedPriority": "low|medium|high|urgent",
  "suggestedDeadline": "YYYY-MM-DD or null",
  "suggestedCategory": "category name",
  "suggestedTags": ["tag1", "tag2"],
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "estimatedCompletionTime": minutes,
  "dependencies": ["task_id1", "task_id2"],
  "difficulty": "easy|medium|hard",
  "impact": "low|medium|high",
  "urgency": "low|medium|high"
}`
  }

  /**
   * Parse AI response into TaskSuggestion
   */
  private parseTaskSuggestion(aiResponse: string, taskId: string): TaskSuggestion {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      
      const parsed = JSON.parse(jsonMatch[0])
      
      return {
        taskId,
        suggestedPriority: parsed.suggestedPriority || 'medium',
        suggestedDeadline: parsed.suggestedDeadline,
        suggestedCategory: parsed.suggestedCategory,
        suggestedTags: parsed.suggestedTags || [],
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || 'AI analysis completed',
        estimatedCompletionTime: parsed.estimatedCompletionTime,
        dependencies: parsed.dependencies || [],
        difficulty: parsed.difficulty || 'medium',
        impact: parsed.impact || 'medium',
        urgency: parsed.urgency || 'medium'
      }
    } catch (error) {
      console.error('Error parsing task suggestion:', error)
      return this.createDefaultSuggestion({ id: taskId } as TaskIntelligenceData)
    }
  }

  /**
   * Create default suggestion when AI fails
   */
  private createDefaultSuggestion(task: TaskIntelligenceData): TaskSuggestion {
    return {
      taskId: task.id,
      suggestedPriority: task.priority,
      suggestedDeadline: task.due_date,
      suggestedCategory: task.category,
      suggestedTags: task.tags || [],
      confidence: 0.5,
      reasoning: 'Default suggestion - AI analysis unavailable',
      estimatedCompletionTime: task.estimated_minutes,
      dependencies: [],
      difficulty: 'medium',
      impact: 'medium',
      urgency: 'medium'
    }
  }

  /**
   * Create empty workload analysis
   */
  private createEmptyWorkloadAnalysis(): WorkloadAnalysis {
    return {
      totalTasks: 0,
      estimatedTotalTime: 0,
      highPriorityTasks: 0,
      overdueTasks: 0,
      workloadScore: 0,
      recommendations: ['No tasks to analyze'],
      suggestedSchedule: { morning: [], afternoon: [], evening: [] }
    }
  }

  /**
   * Update user context
   */
  updateUserContext(updates: Partial<TaskIntelligenceEngine['userContext']>) {
    this.userContext = { ...this.userContext, ...updates }
  }
} 