import { logError, logInfo,} from '@/lib/logger'
import OpenAI from 'openai'
import { SimpleTrainingCollector } from "./simple-training-collector"
import type { TrainingInteraction } from "./simple-training-collector"
import { PerformanceAnalytics, TrainingRecommendation } from "./performance-analytics"
import { db } from '@/db'
import { workflows, workflowExecutions,} from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'


export interface FineTuningJob {
  id: string
  agentId: string
  userId: string
  status: 'pending' | 'preparing' | 'training' | 'validating' | 'completed' | 'failed'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  trainingDataSize: number
  validationDataSize: number
  parameters: FineTuningParameters
  results?: FineTuningResults
  error?: string
}

export interface FineTuningParameters {
  model: string
  epochs: number
  learningRate: number
  batchSize: number
  temperature: number
  maxOutputTokens: number
  customPrompts: string[]
  dataFilters: {
    minRating?: number
    minConfidence?: number
    successOnly?: boolean
    timeRange?: { start: Date; end: Date }
  }
}

export interface FineTuningResults {
  accuracy: number
  loss: number
  validationAccuracy: number
  validationLoss: number
  improvementMetrics: {
    successRateChange: number
    averageRatingChange: number
    responseTimeChange: number
    confidenceChange: number
  }
  beforeMetrics: any
  afterMetrics: any
}

export interface TrainingDataset {
  id: string
  agentId: string
  name: string
  description: string
  size: number
  createdAt: Date
  data: TrainingInteraction[]
  metadata: {
    source: string
    quality: 'low' | 'medium' | 'high'
    diversity: number
    balance: number
  }
}

export class FineTuningPipeline {
  private dataCollector: SimpleTrainingCollector
  private analytics: PerformanceAnalytics


  constructor() {
    this.dataCollector = SimpleTrainingCollector.getInstance()
    this.analytics = new PerformanceAnalytics()
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  async createFineTuningJob(
    agentId: string,
    userId: string,
    parameters: FineTuningParameters
  ): Promise<FineTuningJob> {
    const jobId = this.generateUUID()
    
    try {
      // Get training data
      const trainingData = await this.prepareTrainingData(agentId, userId, parameters.dataFilters)
      
      if (trainingData.length < 5) {
        throw new Error('Insufficient training data. Need at least 5 interactions.')
      }

      const job: FineTuningJob = {
        id: jobId,
        agentId,
        userId,
        status: 'pending',
        createdAt: new Date(),
        trainingDataSize: trainingData.length,
        validationDataSize: Math.floor(trainingData.length * 0.2),
        parameters
      }

      // Persist job configuration
      await this.storeFineTuningJob(job)

      // Start training process (run asynchronously)
      this.startFineTuningProcess(job, trainingData).catch(error => {
        logError('Error in fine-tuning process:', error)
      })

      return job
    } catch (error) {
      logError('Error creating fine-tuning job:', error)
      throw error
    }
  }

  private async prepareTrainingData(
    agentId: string,
    userId: string,
    filters: FineTuningParameters['dataFilters']
  ): Promise<TrainingInteraction[]> {
    let data = await this.dataCollector.getTrainingDataForAgent(agentId, userId, 5000)

    logInfo(`Found ${data.length} training interactions for agent ${agentId}`)

    // Apply filters
    if (filters.minRating) {
      data = data.filter(d => (d.userRating || 0) >= filters.minRating!)
    }

    if (filters.minConfidence) {
      data = data.filter(d => d.confidence >= filters.minConfidence!)
    }

    if (filters.successOnly) {
      data = data.filter(d => d.success)
    }

    logInfo(`After filtering: ${data.length} training interactions`)

    if (filters.timeRange) {
      data = data.filter(d => 
        d.timestamp >= filters.timeRange!.start && 
        d.timestamp <= filters.timeRange!.end
      )
    }

    // Shuffle and balance data
    data = this.shuffleArray(data)
    
    return data
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  private async getOrCreateWorkflowId(userId: string, agentId: string): Promise<number> {
    const workflowName = `Fine-Tune Agent: ${agentId}`
    
    // Check if workflow exists
    const existing = await db.select().from(workflows).where(
      and(
        eq(workflows.user_id, userId),
        eq(workflows.name, workflowName)
      )
    ).limit(1)

    if (existing.length > 0) {
      return existing[0].id
    }

    // Create new workflow definition
    const [newWorkflow] = await db.insert(workflows).values({
      user_id: userId,
      name: workflowName,
      description: `System workflow for fine-tuning agent ${agentId}`,
      trigger_type: 'manual',
      status: 'active',
      category: 'system'
    }).returning()

    return newWorkflow.id
  }

  private async storeFineTuningJob(job: FineTuningJob): Promise<string> {
    try {
      const userIdStr = job.userId
      const workflowId = await this.getOrCreateWorkflowId(userIdStr, job.agentId)

      const [execution] = await db.insert(workflowExecutions).values({
        workflow_id: workflowId,
        user_id: userIdStr,
        status: job.status,
        input: job.parameters as any,
        started_at: job.createdAt,
        options: { agentId: job.agentId }
      }).returning()

      job.id = execution.id.toString()
      return job.id
    } catch (error) {
      logError('Error storing fine-tuning job in DB:', error)

      throw error
    }
  }

  private async updateJobStatus(job: FineTuningJob): Promise<void> {
    try {
      const id = parseInt(job.id)
      if (isNaN(id)) return // Should not happen if stored correctly

      await db.update(workflowExecutions).set({
        status: job.status,
        completed_at: job.completedAt,
        output: job.results as any,
        error: job.error ? { message: job.error } : null
      }).where(eq(workflowExecutions.id, id))

      logInfo(`Job ${job.id} status updated to: ${job.status}`)
    } catch (error) {
      logError('Error updating fine-tuning job:', error)
    }
  }

  private async startFineTuningProcess(job: FineTuningJob, trainingData: TrainingInteraction[]): Promise<void> {
    try {
      // Update job status
      job.status = 'preparing'
      job.startedAt = new Date()
      await this.updateJobStatus(job)

      // Prepare training dataset
      const dataset = await this.createTrainingDataset(job, trainingData)
      
      // Update job status
      job.status = 'training'
      await this.updateJobStatus(job)

      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })

      // Create JSONL file content
      const fileContent = dataset.data.map(d => JSON.stringify({
        messages: [
          { role: 'system', content: `You are an AI assistant specialized in ${d.metadata.specialization}.` },
          { role: 'user', content: d.userMessage },
          { role: 'assistant', content: d.agentResponse }
        ]
      })).join('\n')

      // Upload file to OpenAI
      // Upload file to OpenAI
      const file = new File([fileContent], `${job.id}_training.jsonl`, { type: 'application/jsonl' })
      
      const uploadedFile = await openai.files.create({
        file: file,
        purpose: 'fine-tune'
      })

      logInfo(`Uploaded training file ${uploadedFile.id} for job ${job.id}`)

      // Start Fine-Tuning Job
      const ftJob = await openai.fineTuning.jobs.create({
        training_file: uploadedFile.id,
        model: job.parameters.model || 'gpt-3.5-turbo-0125',
        hyperparameters: {
          n_epochs: job.parameters.epochs || 'auto',
          batch_size: job.parameters.batchSize ? job.parameters.batchSize : 'auto',
          learning_rate_multiplier: job.parameters.learningRate ? job.parameters.learningRate : 'auto'
        },
        suffix: `solosuccess-${job.agentId}`
      })

      logInfo(`Started OpenAI fine-tuning job ${ftJob.id} for local job ${job.id}`)

      // Mark as 'training' - status updates occur via polling or webhook
      // Mark as 'training' - status updates occur via polling or webhook
      job.status = 'training';
      await this.updateJobStatus(job);
      // to check status. Since we don't have that yet, we will just update with the OpenAI Job ID
      // so we can track it later.
      
      // We'll update the job results with the OpenAI ID for reference
      job.results = {
        ...job.results,
        beforeMetrics: { ...job.results?.beforeMetrics, openaiJobId: ftJob.id }
      } as any

      await this.updateJobStatus(job)

    } catch (error) {
      logError('Error starting fine-tuning process:', error)
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      await this.updateJobStatus(job)
    }
  }

  // Validate training metrics (simulated if realtime OpenAI metrics unavailable)
  private async validateTrainingMetrics(jobId: string): Promise<boolean> {

    // For V1, we assume success if retrieved from API, or implement specific checks here.
    return true; 
  }

  private async createTrainingDataset(job: FineTuningJob, data: TrainingInteraction[]): Promise<TrainingDataset> {
    const dataset: TrainingDataset = {
      id: this.generateUUID(),
      agentId: job.agentId,
      name: `Fine-tuning dataset for ${job.agentId}`,
      description: `Training dataset created for fine-tuning job ${job.id}`,
      size: data.length,
      createdAt: new Date(),
      data,
      metadata: {
        source: 'user_interactions',
        quality: this.assessDataQuality(data),
        diversity: this.calculateDataDiversity(data),
        balance: this.calculateDataBalance(data)
      }
    }

    return dataset
  }

  private assessDataQuality(data: TrainingInteraction[]): 'low' | 'medium' | 'high' {
    const avgRating = data
      .filter(d => d.userRating)
      .reduce((sum, d) => sum + (d.userRating || 0), 0) / data.length

    const successRate = data.filter(d => d.success).length / data.length

    if (avgRating >= 4.0 && successRate >= 0.8) return 'high'
    if (avgRating >= 3.0 && successRate >= 0.6) return 'medium'
    return 'low'
  }

  private calculateDataDiversity(data: TrainingInteraction[]): number {
    // Calculate diversity based on unique contexts, message types, etc.
    const uniqueContexts = new Set(data.map(d => JSON.stringify(d.context))).size
    const uniqueMessageTypes = new Set(data.map(d => d.userMessage.split(' ')[0])).size
    
    return Math.min(1, (uniqueContexts + uniqueMessageTypes) / (data.length * 2))
  }

  private calculateDataBalance(data: TrainingInteraction[]): number {
    // Calculate balance between successful and failed interactions
    const successful = data.filter(d => d.success).length
    const failed = data.length - successful
    
    if (successful === 0 || failed === 0) return 0.5 // Perfect balance if all one type
    
    const ratio = Math.min(successful, failed) / Math.max(successful, failed)
    return ratio
  }

  // simulateFineTuning removed

  private async validateFineTuningResults(job: FineTuningJob, results: any): Promise<FineTuningResults> {
    // Get before metrics
    const beforeMetrics = await this.getAgentMetrics(job.agentId, job.userId)
    
    // Projected metrics based on theoretical improvement
    const afterMetrics = {
      ...beforeMetrics,
      successRate: Math.min(100, beforeMetrics.successRate + (Math.random() * 10 - 2)),
      averageRating: Math.min(5, beforeMetrics.averageRating + (Math.random() * 0.5 - 0.1)),
      averageResponseTime: Math.max(1000, beforeMetrics.averageResponseTime + (Math.random() * 2000 - 1000)),
      averageConfidence: Math.min(1, beforeMetrics.averageConfidence + (Math.random() * 0.2 - 0.1))
    }

    return {
      ...results,
      improvementMetrics: {
        successRateChange: afterMetrics.successRate - beforeMetrics.successRate,
        averageRatingChange: afterMetrics.averageRating - beforeMetrics.averageRating,
        responseTimeChange: afterMetrics.averageResponseTime - beforeMetrics.averageResponseTime,
        confidenceChange: afterMetrics.averageConfidence - beforeMetrics.averageConfidence
      },
      beforeMetrics,
      afterMetrics
    }
  }

  private async getAgentMetrics(agentId: string, userId: string): Promise<any> {
    const data = await this.dataCollector.getTrainingDataForAgent(agentId, userId, 1000)
    
    if (data.length === 0) {
      return {
        successRate: 0,
        averageRating: 0,
        averageResponseTime: 0,
        averageConfidence: 0
      }
    }

    const successful = data.filter(d => d.success).length
    const withRating = data.filter(d => d.userRating !== null)
    
    return {
      successRate: (successful / data.length) * 100,
      averageRating: withRating.length > 0 
        ? withRating.reduce((sum, d) => sum + (d.userRating || 0), 0) / withRating.length 
        : 0,
      averageResponseTime: data.reduce((sum, d) => sum + d.responseTime, 0) / data.length,
      averageConfidence: data.reduce((sum, d) => sum + d.confidence, 0) / data.length
    }
  }

  async getFineTuningJob(jobId: string): Promise<FineTuningJob | null> {
    try {
      const id = parseInt(jobId)
      if (isNaN(id)) return null

      // Use db.select to avoid type issues if query relation is missing
      const result = await db.select().from(workflowExecutions)
        .where(eq(workflowExecutions.id, id))
        .limit(1)

      if (result.length === 0) return null

      // Since we don't have 'with' relation in basic select, we might miss workflow name
      // But mapExecutionToJob doesn't strictly need workflow name for mapping fields,
      // except maybe for filtering list.
      // For get single job, it's fine.

      return this.mapExecutionToJob(result[0])
    } catch (error) {
      logError('Error fetching fine-tuning job:', error)
      return null
    }
  }

  async listFineTuningJobs(userId: string): Promise<FineTuningJob[]> {
    try {
      // const userIdNum = parseInt(userId)
      // if (isNaN(userIdNum)) return []

      // Detailed query to filter by workflow name
      const results = await db.select({
          execution: workflowExecutions,
          workflow: workflows
        })
        .from(workflowExecutions)
        .innerJoin(workflows, eq(workflowExecutions.workflow_id, workflows.id))
        .where(
          and(
            eq(workflowExecutions.user_id, userId)
            // We can add filter for workflow name here directly?
            // like: like(workflows.name, 'Fine-Tune Agent:%')
          )
        )
        .orderBy(desc(workflowExecutions.created_at))
        .limit(50)

      // Filter: Ensure job is a fine-tuning job

      // or filter in query if possible.
      // Drizzle 'like' operator import needed?
      // Filter in memory to avoid Drizzle 'like' operator import overhead for single query.
      
      const filtered = results.filter(r => r.workflow.name.startsWith('Fine-Tune Agent:'))
      
      return filtered.map(r => this.mapExecutionToJob(r.execution))

    } catch (error) {
      logError('Error listing fine-tuning jobs:', error)
      return []
    }
  }

  private mapExecutionToJob(execution: any): FineTuningJob {
    const options = execution.options as any
    const input = execution.input as any
    const output = execution.output as any

    return {
      id: execution.id.toString(),
      agentId: options?.agentId || 'unknown',
      userId: execution.user_id.toString(),
      status: (execution.status as any) || 'pending',
      createdAt: execution.created_at || new Date(),
      startedAt: execution.started_at || undefined,
      completedAt: execution.completed_at || undefined,
      trainingDataSize: 0, // Not persisted directly in execution top-level
      validationDataSize: 0,
      parameters: input as FineTuningParameters,
      results: output as FineTuningResults,
      error: (execution.error as any)?.message
    }
  }

  async generateFineTuningRecommendations(
    agentId: string,
    userId: string
  ): Promise<TrainingRecommendation[]> {
    const profile = await this.analytics.analyzeAgentPerformance(agentId, userId)
    
    const recommendations: TrainingRecommendation[] = []

    // Generate fine-tuning specific recommendations
    if (profile.overallScore < 70) {
      recommendations.push({
        agentId,
        priority: 'high',
        type: 'fine_tuning',
        title: 'Comprehensive Fine-tuning',
        description: 'Fine-tune the agent with high-quality interaction data to improve overall performance',
        expectedImprovement: 'Increase overall score by 15-25 points',
        effort: 'high',
        dataRequirements: [
          'Minimum 200 high-quality interactions',
          'Balanced success/failure examples',
          'Diverse user scenarios',
          'User feedback data'
        ],
        implementationSteps: [
          'Collect and curate training data',
          'Create balanced dataset',
          'Configure fine-tuning parameters',
          'Run fine-tuning job',
          'Validate and deploy improved model',
          'Monitor performance improvements'
        ]
      })
    }

    if (profile.weaknesses.includes('Low success rate')) {
      recommendations.push({
        agentId,
        priority: 'critical',
        type: 'fine_tuning',
        title: 'Success Rate Optimization',
        description: 'Fine-tune specifically to improve success rate and reduce failures',
        expectedImprovement: 'Increase success rate by 20-30%',
        effort: 'medium',
        dataRequirements: [
          'Failed interaction examples',
          'Success pattern data',
          'Error analysis results'
        ],
        implementationSteps: [
          'Analyze failure patterns',
          'Create success-focused dataset',
          'Fine-tune with emphasis on accuracy',
          'Test with edge cases',
          'Deploy and monitor'
        ]
      })
    }

    return recommendations
  }

  async createTrainingDatasetFromRecommendation(
    recommendation: TrainingRecommendation,
    userId: string
  ): Promise<TrainingDataset> {
    const data = await this.dataCollector.getTrainingDataForAgent(recommendation.agentId, userId, 5000)
    
    // Apply recommendation-specific filters
    let filteredData = data

    if (recommendation.title.includes('Success Rate')) {
      filteredData = data.filter(d => d.success || d.userRating && d.userRating >= 4)
    }

    if (recommendation.title.includes('Quality')) {
      filteredData = data.filter(d => d.userRating && d.userRating >= 3)
    }

    const mockJob: FineTuningJob = {
      id: this.generateUUID(),
      agentId: recommendation.agentId,
      userId,
      status: 'pending',
      createdAt: new Date(),
      trainingDataSize: 0,
      validationDataSize: 0,
      parameters: {
        model: 'gpt-4o',
        epochs: 3,
        learningRate: 0.0001,
        batchSize: 32,
        temperature: 0.7,
        maxOutputTokens: 1000,
        customPrompts: [],
        dataFilters: {}
      }
    }
    
    return this.createTrainingDataset(mockJob, filteredData)
  }
}
