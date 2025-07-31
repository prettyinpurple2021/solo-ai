import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TaskIntelligenceEngine, TaskIntelligenceData } from '@/lib/ai-task-intelligence'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, taskIds, userContext } = body

    // Fetch user's tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['todo', 'in_progress'])

    if (tasksError) {
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    // Initialize AI engine with user context
    const engine = new TaskIntelligenceEngine(userContext)

    switch (action) {
      case 'optimize':
        // Optimize all tasks
        const optimizationResult = await engine.optimizeTaskList(tasks as TaskIntelligenceData[])
        return NextResponse.json(optimizationResult)

      case 'suggest':
        // Get suggestions for specific tasks
        if (!taskIds || !Array.isArray(taskIds)) {
          return NextResponse.json({ error: 'Task IDs required' }, { status: 400 })
        }

        const filteredTasks = tasks.filter(task => taskIds.includes(task.id))
        const suggestions = await Promise.all(
          filteredTasks.map(task => engine.generateTaskSuggestion(task as TaskIntelligenceData, tasks as TaskIntelligenceData[]))
        )

        return NextResponse.json({ suggestions })

      case 'analyze_workload':
        // Analyze workload without full optimization
        const activeTasks = tasks.filter(task => task.status !== 'completed')
        const workloadAnalysis = engine['analyzeWorkload'](activeTasks as TaskIntelligenceData[], [])
        return NextResponse.json({ workloadAnalysis })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Task intelligence API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Fetch user's tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['todo', 'in_progress'])

    if (tasksError) {
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    const engine = new TaskIntelligenceEngine()

    switch (action) {
      case 'quick_analysis':
        // Quick workload analysis without AI
        const activeTasks = tasks.filter(task => task.status !== 'completed')
        const totalTasks = activeTasks.length
        const estimatedTime = activeTasks.reduce((sum, task) => sum + (task.estimated_minutes || 0), 0)
        const highPriorityTasks = activeTasks.filter(task => task.priority === 'high' || task.priority === 'urgent').length
        const overdueTasks = activeTasks.filter(task => {
          if (!task.due_date) return false
          return new Date(task.due_date) < new Date()
        }).length

        const workloadScore = Math.min(100, Math.max(0, 
          (totalTasks * 5) + 
          (estimatedTime / 60 * 2) + 
          (highPriorityTasks * 10) + 
          (overdueTasks * 15)
        ))

        return NextResponse.json({
          totalTasks,
          estimatedTime,
          highPriorityTasks,
          overdueTasks,
          workloadScore,
          recommendations: generateQuickRecommendations(totalTasks, estimatedTime, highPriorityTasks, overdueTasks, workloadScore)
        })

      case 'suggested_order':
        // Get suggested task order based on priority and due dates
        const sortedTasks = tasks.sort((a, b) => {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 2
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 2

          if (aPriority !== bPriority) return bPriority - aPriority

          // If same priority, sort by due date
          if (a.due_date && b.due_date) {
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          }

          return 0
        })

        return NextResponse.json({
          suggestedOrder: sortedTasks.map(task => task.id)
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Task intelligence API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateQuickRecommendations(
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