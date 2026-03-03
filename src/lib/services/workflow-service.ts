
import { db } from '@/db';
import { workflows, workflowExecutions, templates } from '@/shared/db/schema';
import { sql, desc, eq, and } from 'drizzle-orm';

export interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  runningExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  popularTemplates: any[];
  recentActivity: any[];
}

export interface WorkflowDashboardData {
  stats: WorkflowStats;
  workflows: any[];
}

export async function getWorkflowDashboardData(userId: string): Promise<WorkflowDashboardData> {
  // Parallelize queries for performance
  const [counts, executions, popularTemplates, recentActivity, userWorkflows] = await Promise.all([
    // 1. Basic counts
    db.select({
      totalWorkflows: sql<number>`count(${workflows.id})`,
      activeWorkflows: sql<number>`sum(case when ${workflows.status} = 'active' then 1 else 0 end)`
    }).from(workflows).where(eq(workflows.userId, userId)),

    // 2. Execution stats
    db.select({
      total: sql<number>`count(*)`,
      successful: sql<number>`sum(case when ${workflowExecutions.status} = 'completed' then 1 else 0 end)`,
      failed: sql<number>`sum(case when ${workflowExecutions.status} = 'failed' then 1 else 0 end)`,
      running: sql<number>`sum(case when ${workflowExecutions.status} = 'running' then 1 else 0 end)`,
      avgDuration: sql<number>`avg(${workflowExecutions.duration})`
    }).from(workflowExecutions).where(eq(workflowExecutions.userId, userId)),

    // 3. Popular templates
    db.select()
      .from(templates)
      .orderBy(desc(templates.usage_count))
      .limit(5),
      
    // 4. Recent activity
    db.select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.userId, userId))
      .orderBy(desc(workflowExecutions.started_at))
      .limit(10),

    // 5. User workflows
    db.select()
      .from(workflows)
      .where(eq(workflows.userId, userId))
      .orderBy(desc(workflows.updatedAt))
  ]);

  const stats: WorkflowStats = {
    totalWorkflows: Number(counts[0]?.totalWorkflows || 0),
    activeWorkflows: Number(counts[0]?.activeWorkflows || 0),
    totalExecutions: Number(executions[0]?.total || 0),
    successfulExecutions: Number(executions[0]?.successful || 0),
    failedExecutions: Number(executions[0]?.failed || 0),
    runningExecutions: Number(executions[0]?.running || 0),
    averageExecutionTime: Number(executions[0]?.avgDuration || 0),
    successRate: Number(executions[0]?.total || 0) > 0 
      ? (Number(executions[0]?.successful || 0) / Number(executions[0]?.total || 0)) * 100 
      : 0,
    popularTemplates: popularTemplates.map(t => ({
      id: t.id,
      name: t.title,
      downloads: t.usage_count || 0,
      rating: Number(t.rating || 0)
    })),
    recentActivity: recentActivity.map(a => ({
      id: a.id,
      type: 'execution',
      description: `Workflow execution ${a.status}`,
      timestamp: a.started_at,
      status: a.status === 'completed' ? 'success' : a.status === 'failed' ? 'error' : 'warning'
    }))
  };

  return {
    stats,
    workflows: userWorkflows
  };
}
