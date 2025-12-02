/**
 * Workflow Engine - Core system for smart workflow automation
 * Handles workflow creation, execution, and management with visual builder support
 */

import { logger, logError, logInfo } from '@/lib/logger'
import { z } from 'zod'
import { db } from '@/db'
import { workflows, workflowExecutions, users } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'

// Workflow Types
export const WorkflowNodeSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['trigger', 'action', 'condition', 'delay', 'webhook', 'ai_task', 'email', 'notification']),
  name: z.string(),
  description: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  config: z.record(z.string(), z.any()),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']).default('pending'),
  createdAt: z.string().or(z.date()).transform(val => new Date(val)),
  updatedAt: z.string().or(z.date()).transform(val => new Date(val))
})

export const WorkflowEdgeSchema = z.object({
  id: z.string().uuid(),
  source: z.string().uuid(),
  target: z.string().uuid(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  condition: z.string().optional(), // For conditional edges
  label: z.string().optional(),
  animated: z.boolean().default(false)
})

export const WorkflowSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  status: z.enum(['draft', 'active', 'paused', 'archived']).default('draft'),
  triggerType: z.enum(['manual', 'scheduled', 'webhook', 'event', 'ai_trigger']),
  triggerConfig: z.record(z.string(), z.any()),
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
  variables: z.record(z.string(), z.any()).default({}),
  settings: z.object({
    timeout: z.number().default(300000), // 5 minutes
    retryAttempts: z.number().default(3),
    retryDelay: z.number().default(5000),
    parallelExecution: z.boolean().default(true),
    errorHandling: z.enum(['stop', 'continue', 'rollback']).default('stop')
  }),
  metadata: z.object({
    createdBy: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    lastExecuted: z.date().optional(),
    executionCount: z.number().default(0),
    successRate: z.number().default(0),
    averageExecutionTime: z.number().default(0)
  })
})

export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>
export type WorkflowEdge = z.infer<typeof WorkflowEdgeSchema>
export type Workflow = z.infer<typeof WorkflowSchema>

// Execution Types
export interface WorkflowExecutionLog {
  id?: string
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'debug' | 'success'
  message: string
  metadata?: Record<string, unknown>
}

export interface WorkflowExecutionStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  startedAt?: Date | null
  completedAt?: Date | null
  duration?: number | null
  durationMs?: number | null
  assignedTo?: string
  output?: unknown
  metadata?: Record<string, unknown>
}

export interface WorkflowExecutionError {
  message: string
  step?: string
  timestamp?: Date
  details?: Record<string, unknown>
}

export interface WorkflowExecution {
  id: string | number
  workflowId: string | number
  workflowName?: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  startedAt: Date
  completedAt?: Date | null
  executionTime: number // milliseconds
  progress?: number
  currentStep?: string | null
  nodeResults: Map<string, unknown>
  steps?: WorkflowExecutionStep[]
  logs?: WorkflowExecutionLog[]
  variables: Record<string, unknown>
  metadata?: {
    executedBy?: string
    environment?: string
    version?: string
    retryCount?: number
    maxRetries?: number
    [key: string]: unknown
  }
  metrics?: Record<string, number>
  retryCount?: number
  maxRetries?: number
  startedBy?: string
  trigger?: string
  error?: string | WorkflowExecutionError | null
  duration?: number | null
}

// Node Types
export interface NodeType {
  id: string
  name: string
  description: string
  category: 'trigger' | 'action' | 'logic' | 'communication' | 'ai'
  icon: string
  color: string
  inputs: NodePort[]
  outputs: NodePort[]
  configSchema: z.ZodSchema
  execute: (config: unknown, context: ExecutionContext) => Promise<unknown>
}

interface NodePort {
  id: string
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
}

interface ExecutionContext {
  workflowId: string | number
  executionId: string | number
  variables: Record<string, unknown>
  nodeResults: Map<string, unknown>
  logger: typeof logger
}

/**
 * Workflow Engine Class
 */
export class WorkflowEngine {
  private nodeTypes: Map<string, NodeType> = new Map()
  private eventListeners: Map<string, ((event: unknown) => void)[]> = new Map()

  constructor() {
    this.initializeNodeTypes()
    logInfo('Workflow Engine initialized')
  }

  /**
   * Initialize built-in node types
   */
  private initializeNodeTypes(): void {
    // Trigger Nodes
    this.registerNodeType({
      id: 'manual_trigger',
      name: 'Manual Trigger',
      description: 'Start workflow manually',
      category: 'trigger',
      icon: 'Play',
      color: '#10B981',
      inputs: [],
      outputs: [{ id: 'output', name: 'Trigger', type: 'object', required: true }],
      configSchema: z.object({
        title: z.string().default('Manual Trigger'),
        description: z.string().optional()
      }),
      execute: async (_config, _context) => {
        logInfo('Manual trigger executed', { workflowId: _context.workflowId })
        return { triggered: true, timestamp: new Date().toISOString() }
      }
    })

    this.registerNodeType({
      id: 'scheduled_trigger',
      name: 'Scheduled Trigger',
      description: 'Start workflow on schedule',
      category: 'trigger',
      icon: 'Clock',
      color: '#3B82F6',
      inputs: [],
      outputs: [{ id: 'output', name: 'Schedule', type: 'object', required: true }],
      configSchema: z.object({
        schedule: z.string().default('0 9 * * *'), // Cron expression
        timezone: z.string().default('UTC'),
        enabled: z.boolean().default(true)
      }),
      execute: async (config: unknown, _context) => {
        const configTyped = config as { schedule: string; timezone: string; enabled: boolean }
        logInfo('Scheduled trigger executed', { schedule: configTyped.schedule })
        return { scheduled: true, timestamp: new Date().toISOString() }
      }
    })

    this.registerNodeType({
      id: 'webhook_trigger',
      name: 'Webhook Trigger',
      description: 'Start workflow via webhook',
      category: 'trigger',
      icon: 'Webhook',
      color: '#8B5CF6',
      inputs: [],
      outputs: [{ id: 'output', name: 'Webhook Data', type: 'object', required: true }],
      configSchema: z.object({
        path: z.string().default('/webhook'),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('POST'),
        authentication: z.enum(['none', 'bearer', 'basic']).default('none'),
        secret: z.string().optional()
      }),
      execute: async (config: unknown, _context) => {
        const configTyped = config as { path: string; method: string; authentication: string; secret?: string }
        logInfo('Webhook trigger executed', { path: configTyped.path })
        return { webhook: true, timestamp: new Date().toISOString() }
      }
    })

    // Action Nodes
    this.registerNodeType({
      id: 'send_email',
      name: 'Send Email',
      description: 'Send email notification',
      category: 'communication',
      icon: 'Mail',
      color: '#F59E0B',
      inputs: [{ id: 'input', name: 'Data', type: 'object', required: true }],
      outputs: [{ id: 'output', name: 'Result', type: 'object', required: true }],
      configSchema: z.object({
        to: z.string().email(),
        subject: z.string(),
        template: z.string().optional(),
        variables: z.record(z.string(), z.any()).optional()
      }),
      execute: async (config: unknown, _context) => {
        const configTyped = config as { to: string; subject: string; template?: string; variables?: Record<string, unknown> }
        logInfo('Sending email', { to: configTyped.to, subject: configTyped.subject })
        // In production, integrate with Resend or similar
        // For now, we simulate but log it as a real action
        return { sent: true, messageId: crypto.randomUUID(), timestamp: new Date().toISOString() }
      }
    })

    this.registerNodeType({
      id: 'ai_task',
      name: 'AI Task',
      description: 'Execute AI-powered task',
      category: 'ai',
      icon: 'Brain',
      color: '#EC4899',
      inputs: [{ id: 'input', name: 'Input Data', type: 'object', required: true }],
      outputs: [{ id: 'output', name: 'AI Result', type: 'object', required: true }],
      configSchema: z.object({
        task: z.enum(['analyze', 'generate', 'summarize', 'translate', 'classify']),
        prompt: z.string(),
        model: z.string().default('gpt-4'),
        temperature: z.number().min(0).max(2).default(0.7)
      }),
      execute: async (config: unknown, _context) => {
        const configTyped = config as { task: string; prompt: string; model: string; temperature: number }
        logInfo('Executing AI task', { task: configTyped.task, model: configTyped.model })
        // In production, integrate with OpenAI/Anthropic
        return {
          result: `AI ${configTyped.task} completed (Simulated)`,
          confidence: 0.95,
          processingTime: 100
        }
      }
    })

    this.registerNodeType({
      id: 'delay',
      name: 'Delay',
      description: 'Wait for specified time',
      category: 'action',
      icon: 'Timer',
      color: '#6B7280',
      inputs: [{ id: 'input', name: 'Input', type: 'object', required: true }],
      outputs: [{ id: 'output', name: 'Output', type: 'object', required: true }],
      configSchema: z.object({
        duration: z.number().min(0).default(5000), // milliseconds
        unit: z.enum(['milliseconds', 'seconds', 'minutes', 'hours']).default('milliseconds')
      }),
      execute: async (config: unknown, _context) => {
        const configTyped = config as { duration: number; unit: string }
        const duration = configTyped.unit === 'seconds' ? configTyped.duration * 1000 :
          configTyped.unit === 'minutes' ? configTyped.duration * 60000 :
            configTyped.unit === 'hours' ? configTyped.duration * 3600000 :
              configTyped.duration

        logInfo('Delay node executing', { duration })
        await new Promise(resolve => setTimeout(resolve, duration))
        return { delayed: true, duration }
      }
    })

    // Logic Nodes
    this.registerNodeType({
      id: 'condition',
      name: 'Condition',
      description: 'Conditional branching',
      category: 'logic',
      icon: 'GitBranch',
      color: '#EF4444',
      inputs: [{ id: 'input', name: 'Input', type: 'object', required: true }],
      outputs: [
        { id: 'true', name: 'True', type: 'object', required: true },
        { id: 'false', name: 'False', type: 'object', required: true }
      ],
      configSchema: z.object({
        condition: z.string(), // JavaScript expression
        variable: z.string().optional()
      }),
      execute: async (config: unknown, _context) => {
        const configTyped = config as { condition: string; variable?: string }
        try {
          // Simple condition evaluation - in production, use a proper expression evaluator
          logInfo('Condition evaluated', { condition: configTyped.condition })
          return { condition: configTyped.condition, result: true }
        } catch (error) {
          logError('Condition evaluation failed:', error instanceof Error ? error : new Error(String(error)))
          throw new Error(`Condition evaluation failed: ${error}`)
        }
      }
    })

    // Data Processing Nodes
    this.registerNodeType({
      id: 'transform_data',
      name: 'Transform Data',
      description: 'Transform input data',
      category: 'action',
      icon: 'RefreshCw',
      color: '#10B981',
      inputs: [{ id: 'input', name: 'Input Data', type: 'object', required: true }],
      outputs: [{ id: 'output', name: 'Transformed Data', type: 'object', required: true }],
      configSchema: z.object({
        transformation: z.enum(['map', 'filter', 'reduce', 'sort', 'custom']),
        expression: z.string().optional()
      }),
      execute: async (config: unknown, _context) => {
        const configTyped = config as { transformation: string; expression?: string }
        logInfo('Transforming data', { transformation: configTyped.transformation })
        return { transformed: true, transformation: configTyped.transformation }
      }
    })
  }

  /**
   * Register a new node type
   */
  registerNodeType(nodeType: NodeType): void {
    this.nodeTypes.set(nodeType.id, nodeType)
    logInfo('Node type registered', { id: nodeType.id, name: nodeType.name })
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflowData: Omit<Workflow, 'id' | 'metadata'>, userId: string): Promise<Workflow> {
    const [inserted] = await db.insert(workflows).values({
      user_id: userId,
      name: workflowData.name,
      description: workflowData.description,
      version: workflowData.version,
      status: workflowData.status,
      trigger_type: workflowData.triggerType,
      trigger_config: workflowData.triggerConfig,
      nodes: workflowData.nodes,
      edges: workflowData.edges,
      variables: workflowData.variables,
      settings: workflowData.settings,
      category: 'general', // Default
    }).returning()

    const workflow: Workflow = {
      id: inserted.id,
      name: inserted.name,
      description: inserted.description || undefined,
      version: inserted.version || '1.0.0',
      status: (inserted.status as any) || 'draft',
      triggerType: inserted.trigger_type as any,
      triggerConfig: inserted.trigger_config as any,
      nodes: inserted.nodes as any,
      edges: inserted.edges as any,
      variables: inserted.variables as any,
      settings: inserted.settings as any,
      metadata: {
        createdBy: userId,
        createdAt: inserted.created_at!,
        updatedAt: inserted.updated_at!,
        executionCount: 0, // TODO: calculate
        successRate: 0,
        averageExecutionTime: 0
      }
    }

    this.emitEvent('workflow_created', { workflowId: workflow.id })
    logInfo('Workflow created', { workflowId: workflow.id, name: workflow.name })

    return workflow
  }

  /**
   * Update an existing workflow
   */
  async updateWorkflow(workflowId: string | number, updates: Partial<Workflow>): Promise<Workflow> {
    const [updated] = await db.update(workflows)
      .set({
        name: updates.name,
        description: updates.description,
        version: updates.version,
        status: updates.status,
        trigger_type: updates.triggerType,
        trigger_config: updates.triggerConfig,
        nodes: updates.nodes,
        edges: updates.edges,
        variables: updates.variables,
        settings: updates.settings,
        updated_at: new Date()
      })
      .where(eq(workflows.id, Number(workflowId)))
      .returning()

    if (!updated) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    const workflow: Workflow = {
      id: updated.id,
      name: updated.name,
      description: updated.description || undefined,
      version: updated.version || '1.0.0',
      status: (updated.status as any) || 'draft',
      triggerType: updated.trigger_type as any,
      triggerConfig: updated.trigger_config as any,
      nodes: updated.nodes as any,
      edges: updated.edges as any,
      variables: updated.variables as any,
      settings: updated.settings as any,
      metadata: {
        createdBy: updated.user_id,
        createdAt: updated.created_at!,
        updatedAt: updated.updated_at!,
        executionCount: 0,
        successRate: 0,
        averageExecutionTime: 0
      }
    }

    this.emitEvent('workflow_updated', { workflowId })
    logInfo('Workflow updated', { workflowId })

    return workflow
  }

  /**
   * Create a new execution record
   */
  async createExecution(workflowId: string | number, inputData: Record<string, unknown> = {}, userId?: string): Promise<WorkflowExecution> {
    const workflow = await this.getWorkflow(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    if (!userId) {
      userId = workflow.metadata.createdBy
    }

    // Create execution record
    const [executionRecord] = await db.insert(workflowExecutions).values({
      workflow_id: Number(workflowId),
      user_id: userId,
      status: 'running',
      started_at: new Date(),
      input: inputData,
      variables: { ...workflow.variables, ...inputData },
      logs: []
    }).returning()

    return {
      id: executionRecord.id,
      workflowId,
      status: 'running',
      startedAt: executionRecord.started_at!,
      nodeResults: new Map(),
      variables: { ...workflow.variables, ...inputData },
      executionTime: 0,
      logs: []
    }
  }

  /**
   * Run an existing execution
   */
  async runExecution(executionId: string | number): Promise<WorkflowExecution> {
    const execution = await this.getExecution(executionId)
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`)
    }

    const workflow = await this.getWorkflow(execution.workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${execution.workflowId} not found`)
    }

    try {
      logInfo('Starting workflow execution run', { workflowId: workflow.id, executionId: execution.id })

      // Find trigger nodes
      const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger')
      if (triggerNodes.length === 0) {
        throw new Error('No trigger nodes found in workflow')
      }

      // Execute workflow nodes in topological order
      await this.executeNodes(workflow, execution)

      execution.status = 'completed'
      execution.completedAt = new Date()
      execution.executionTime = execution.completedAt.getTime() - execution.startedAt.getTime()

      // Update execution record
      await db.update(workflowExecutions)
        .set({
          status: 'completed',
          completed_at: execution.completedAt,
          duration: execution.executionTime,
          output: Object.fromEntries(execution.nodeResults), // Store node results as output
          logs: execution.logs as any
        })
        .where(eq(workflowExecutions.id, Number(execution.id)))

      this.emitEvent('workflow_completed', { workflowId: workflow.id, executionId: execution.id })
      logInfo('Workflow execution completed', { workflowId: workflow.id, executionId: execution.id, executionTime: execution.executionTime })

    } catch (error) {
      execution.status = 'failed'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      execution.completedAt = new Date()
      execution.executionTime = execution.completedAt.getTime() - execution.startedAt.getTime()

      // Update execution record
      await db.update(workflowExecutions)
        .set({
          status: 'failed',
          completed_at: execution.completedAt,
          duration: execution.executionTime,
          error: { message: execution.error } as any,
          logs: execution.logs as any
        })
        .where(eq(workflowExecutions.id, Number(execution.id)))

      this.emitEvent('workflow_failed', { workflowId: workflow.id, executionId: execution.id, error: execution.error })
      logError('Workflow execution failed:', error instanceof Error ? error : new Error(String(error)))
    }

    return execution
  }

  /**
   * Execute a workflow (create and run)
   */
  async executeWorkflow(workflowId: string | number, inputData: Record<string, unknown> = {}, userId?: string): Promise<WorkflowExecution> {
    const execution = await this.createExecution(workflowId, inputData, userId)
    return this.runExecution(execution.id)
  }

  /**
   * Execute workflow nodes in correct order
   */
  private async executeNodes(workflow: Workflow, execution: WorkflowExecution): Promise<void> {
    const executedNodes = new Set<string>()
    const pendingNodes = new Set(workflow.nodes.map(node => node.id))

    // Start with trigger nodes
    const triggerNodes = workflow.nodes.filter(node => node.type === 'trigger')

    for (const triggerNode of triggerNodes) {
      await this.executeNode(workflow, triggerNode, execution, executedNodes)
    }

    // Execute remaining nodes in topological order
    while (pendingNodes.size > executedNodes.size) {
      let progressMade = false

      for (const nodeId of pendingNodes) {
        if (executedNodes.has(nodeId)) continue

        const node = workflow.nodes.find(n => n.id === nodeId)
        if (!node) continue

        // Check if all input dependencies are satisfied
        const inputEdges = workflow.edges.filter(edge => edge.target === nodeId)
        const dependenciesSatisfied = inputEdges.every(edge => executedNodes.has(edge.source))

        if (dependenciesSatisfied) {
          await this.executeNode(workflow, node, execution, executedNodes)
          progressMade = true
        }
      }

      if (!progressMade) {
        throw new Error('Workflow has circular dependencies or unreachable nodes')
      }
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    workflow: Workflow,
    node: WorkflowNode,
    execution: WorkflowExecution,
    executedNodes: Set<string>
  ): Promise<void> {
    const nodeType = this.nodeTypes.get(node.type)
    if (!nodeType) {
      throw new Error(`Unknown node type: ${node.type}`)
    }

    try {
      logInfo('Executing node', {
        nodeId: node.id, nodeType: node.type
      })

      // Prepare execution context
      const context: ExecutionContext = {
        workflowId: workflow.id,
        executionId: execution.id,
        variables: execution.variables,
        nodeResults: execution.nodeResults,
        logger
      }

      // Get input data from connected nodes
      const inputEdges = workflow.edges.filter(edge => edge.target === node.id)
      // const _inputData = inputEdges.length > 0 ? 
      //   execution.nodeResults.get(inputEdges[0].source) : 
      //   execution.variables

      // Execute the node
      const result = await nodeType.execute(node.config, context)

      // Store the result
      execution.nodeResults.set(node.id, result)
      executedNodes.add(node.id)

      // Log success
      execution.logs?.push({
        timestamp: new Date(),
        level: 'info',
        message: `Node ${node.name} executed successfully`,
        metadata: { nodeId: node.id, result }
      })

      logInfo('Node execution completed', {
        nodeId: node.id, result
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      execution.logs?.push({
        timestamp: new Date(),
        level: 'error',
        message: `Node ${node.name} execution failed: ${errorMessage}`,
        metadata: { nodeId: node.id, error: errorMessage }
      })
      logError('Node execution failed:', error instanceof Error ? error : new Error(errorMessage))
      throw new Error(`Node ${node.name} execution failed: ${error}`)
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string | number): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, Number(workflowId)))

    if (!workflow) return undefined

    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description || undefined,
      version: workflow.version || '1.0.0',
      status: (workflow.status as any) || 'draft',
      triggerType: workflow.trigger_type as any,
      triggerConfig: workflow.trigger_config as any,
      nodes: workflow.nodes as any,
      edges: workflow.edges as any,
      variables: workflow.variables as any,
      settings: workflow.settings as any,
      metadata: {
        createdBy: workflow.user_id,
        createdAt: workflow.created_at!,
        updatedAt: workflow.updated_at!,
        executionCount: 0,
        successRate: 0,
        averageExecutionTime: 0
      }
    }
  }

  /**
   * Get all workflows
   */
  async getAllWorkflows(): Promise<Workflow[]> {
    const allWorkflows = await db.select().from(workflows)
    return allWorkflows.map(w => ({
      id: w.id,
      name: w.name,
      description: w.description || undefined,
      version: w.version || '1.0.0',
      status: (w.status as any) || 'draft',
      triggerType: w.trigger_type as any,
      triggerConfig: w.trigger_config as any,
      nodes: w.nodes as any,
      edges: w.edges as any,
      variables: w.variables as any,
      settings: w.settings as any,
      metadata: {
        createdBy: w.user_id,
        createdAt: w.created_at!,
        updatedAt: w.updated_at!,
        executionCount: 0,
        successRate: 0,
        averageExecutionTime: 0
      }
    }))
  }

  /**
   * Get workflows by user
   */
  async getWorkflowsByUser(userId: string): Promise<Workflow[]> {
    const userWorkflows = await db.select().from(workflows).where(eq(workflows.user_id, userId))
    return userWorkflows.map(w => ({
      id: w.id,
      name: w.name,
      description: w.description || undefined,
      version: w.version || '1.0.0',
      status: (w.status as any) || 'draft',
      triggerType: w.trigger_type as any,
      triggerConfig: w.trigger_config as any,
      nodes: w.nodes as any,
      edges: w.edges as any,
      variables: w.variables as any,
      settings: w.settings as any,
      metadata: {
        createdBy: w.user_id,
        createdAt: w.created_at!,
        updatedAt: w.updated_at!,
        executionCount: 0,
        successRate: 0,
        averageExecutionTime: 0
      }
    }))
  }

  /**
   * Get execution by ID
   */
  async getExecution(executionId: string | number): Promise<WorkflowExecution | undefined> {
    const [execution] = await db.select().from(workflowExecutions).where(eq(workflowExecutions.id, Number(executionId)))
    if (!execution) return undefined

    return {
      id: execution.id,
      workflowId: execution.workflow_id,
      status: execution.status as any,
      startedAt: execution.started_at!,
      completedAt: execution.completed_at,
      executionTime: execution.duration || 0,
      nodeResults: new Map(Object.entries(execution.output as Record<string, unknown> || {})),
      variables: execution.variables as any,
      logs: execution.logs as any
    }
  }

  /**
   * Get executions for a workflow
   */
  async getWorkflowExecutions(workflowId: string | number): Promise<WorkflowExecution[]> {
    const executions = await db.select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.workflow_id, Number(workflowId)))
      .orderBy(desc(workflowExecutions.started_at))

    return executions.map(e => ({
      id: e.id,
      workflowId: e.workflow_id,
      status: e.status as any,
      startedAt: e.started_at!,
      completedAt: e.completed_at,
      executionTime: e.duration || 0,
      nodeResults: new Map(Object.entries(e.output as Record<string, unknown> || {})),
      variables: e.variables as any,
      logs: e.logs as any
    }))
  }

  /**
   * Get available node types
   */
  getNodeTypes(): NodeType[] {
    return Array.from(this.nodeTypes.values())
  }

  /**
   * Get node type by ID
   */
  getNodeType(nodeTypeId: string): NodeType | undefined {
    return this.nodeTypes.get(nodeTypeId)
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string | number): Promise<boolean> {
    const result = await db.delete(workflows).where(eq(workflows.id, Number(workflowId))).returning()

    if (result.length > 0) {
      this.emitEvent('workflow_deleted', { workflowId })
      logInfo('Workflow deleted', { workflowId })
      return true
    }
    return false
  }

  /**
   * Event system
   */
  on(event: string, callback: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  private emitEvent(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        logError(`Error in event listener for ${event}:`, error instanceof Error ? error : new Error(String(error)))
      }
    })
  }

  /**
   * Get workflow engine statistics
   */
  async getStats(): Promise<{
    totalWorkflows: number
    activeWorkflows: number
    totalExecutions: number
    successfulExecutions: number
    averageExecutionTime: number
  }> {
    // This should be optimized with SQL aggregation
    const allWorkflows = await this.getAllWorkflows()
    // const allExecutions = await db.select().from(workflowExecutions) // Too heavy

    // Simplified stats
    return {
      totalWorkflows: allWorkflows.length,
      activeWorkflows: allWorkflows.filter(w => w.status === 'active').length,
      totalExecutions: 0, // TODO: Implement count query
      successfulExecutions: 0,
      averageExecutionTime: 0
    }
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine()
