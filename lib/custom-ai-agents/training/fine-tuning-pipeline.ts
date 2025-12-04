import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { SimpleTrainingCollector } from "./simple-training-collector"
import type { TrainingInteraction } from "./simple-training-collector"
import { PerformanceAnalytics, TrainingRecommendation } from "./performance-analytics"
import { db } from '@/lib/database-client'
import { fineTuningJobs } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'


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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
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

      // Store job in database (simplified - in real implementation, use proper DB)
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

  private async storeFineTuningJob(job: FineTuningJob): Promise<void> {
    try {
      await db.insert(fineTuningJobs).values({
        id: job.id,
        agent_id: job.agentId,
        user_id: job.userId,
        status: job.status,
        created_at: job.createdAt,
        training_data_size: job.trainingDataSize,
        validation_data_size: job.validationDataSize,
        parameters: job.parameters,
      })
      logInfo('Stored fine-tuning job in database:', job.id)
    } catch (error) {
      logError('Failed to store fine-tuning job:', error)
      throw error
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

      // Simulate training process (in real implementation, call actual fine-tuning API)
      const results = await this.simulateFineTuning(job, dataset)

      // Update job status
      job.status = 'validating'
      await this.updateJobStatus(job)

      // Validate results
      const validationResults = await this.validateFineTuningResults(job, results)

      // Update job status
      job.status = 'completed'
      job.completedAt = new Date()
      job.results = validationResults
      await this.updateJobStatus(job)

    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
      await this.updateJobStatus(job)
    }
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

  private async simulateFineTuning(job: FineTuningJob, dataset: TrainingDataset): Promise<any> {
    // Simulate training process
    logInfo(`Simulating fine-tuning for ${job.agentId} with ${dataset.size} samples`)

    // In real implementation, this would call the actual fine-tuning API
    await new Promise(resolve => setTimeout(resolve, 5000)) // Simulate 5 second training

    return {
      accuracy: 0.85 + Math.random() * 0.1,
      loss: 0.1 + Math.random() * 0.05,
      validationAccuracy: 0.82 + Math.random() * 0.08,
      validationLoss: 0.12 + Math.random() * 0.03
    }
  }

  private async validateFineTuningResults(job: FineTuningJob, results: any): Promise<FineTuningResults> {
    // Get before metrics
    const beforeMetrics = await this.getAgentMetrics(job.agentId, job.userId)

    // Simulate after metrics (in real implementation, test with new model)
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

  private async updateJobStatus(job: FineTuningJob): Promise<void> {
    try {
      await db.update(fineTuningJobs)
        .set({
          status: job.status,
          started_at: job.startedAt,
          completed_at: job.completedAt,
          results: job.results,
          error: job.error,
        })
        .where(eq(fineTuningJobs.id, job.id))

      logInfo(`Job ${job.id} status updated to: ${job.status}`)
    } catch (error) {
      logError(`Failed to update job status for ${job.id}:`, error)
      throw error
    }
  }

  async getFineTuningJob(jobId: string): Promise<FineTuningJob | null> {
    logInfo(`Fetching fine-tuning job: ${jobId}`)
    try {
      const result = await db.select().from(fineTuningJobs).where(eq(fineTuningJobs.id, jobId)).limit(1)

      if (result.length === 0) return null

      const record = result[0]
      return {
        id: record.id,
        agentId: record.agent_id,
        userId: record.user_id,
        status: record.status as FineTuningJob['status'],
        createdAt: record.created_at || new Date(),
        startedAt: record.started_at || undefined,
        completedAt: record.completed_at || undefined,
        trainingDataSize: record.training_data_size || 0,
        validationDataSize: record.validation_data_size || 0,
        parameters: record.parameters as FineTuningParameters,
        results: record.results as FineTuningResults | undefined,
        error: record.error || undefined,
      }
    } catch (error) {
      logError(`Failed to fetch fine-tuning job ${jobId}:`, error)
      return null
    }
  }

  async listFineTuningJobs(userId: string): Promise<FineTuningJob[]> {
    logInfo(`Listing fine-tuning jobs for user: ${userId}`)
    try {
      const results = await db.select()
        .from(fineTuningJobs)
        .where(eq(fineTuningJobs.user_id, userId))
        .orderBy(desc(fineTuningJobs.created_at))

      return results.map(record => ({
        id: record.id,
        agentId: record.agent_id,
        userId: record.user_id,
        status: record.status as FineTuningJob['status'],
        createdAt: record.created_at || new Date(),
        startedAt: record.started_at || undefined,
        completedAt: record.completed_at || undefined,
        trainingDataSize: record.training_data_size || 0,
        validationDataSize: record.validation_data_size || 0,
        parameters: record.parameters as FineTuningParameters,
        results: record.results as FineTuningResults | undefined,
        error: record.error || undefined,
      }))
    } catch (error) {
      logError(`Failed to list fine-tuning jobs for user ${userId}:`, error)
      return []
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
