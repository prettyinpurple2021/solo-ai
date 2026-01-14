"use client"

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useState, useEffect} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Badge} from "@/components/ui/badge"
import { Progress} from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { Alert, AlertDescription} from "@/components/ui/alert"

import {
  BarChart3, TrendingUp, Brain, Target, Clock, Star, AlertTriangle, CheckCircle, Lightbulb, Download, Play, Settings} from "lucide-react"

interface TrainingMetrics {
  totalInteractions: number
  averageRating: number
  successRate: number
  averageResponseTime: number
  averageConfidence: number
  topPerformingAgents: Array<{
    agentId: string
    successRate: number
    averageRating: number
    totalInteractions: number
  }>
  userSatisfactionTrends: Array<{
    date: string
    averageRating: number
    totalInteractions: number
  }>
}

interface AgentPerformance {
  agentId: string
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  improvementAreas: string[]
  recommendations: string[]
  performanceInsights: Array<{
    type: 'success' | 'warning' | 'error' | 'optimization'
    title: string
    description: string
    impact: 'low' | 'medium' | 'high'
    recommendation: string
  }>
  benchmarkComparison: {
    vsAverage: number
    vsTopPerformer: number
    percentile: number
  }
}

interface FineTuningJob {
  id: string
  agentId: string
  status: 'pending' | 'preparing' | 'training' | 'validating' | 'completed' | 'failed'
  createdAt: string
  trainingDataSize: number
  results?: {
    accuracy: number
    improvementMetrics: {
      successRateChange: number
      averageRatingChange: number
    }
  }
}

export function TrainingDashboard() {
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null)
  const [agentPerformance, setAgentPerformance] = useState<Record<string, AgentPerformance>>({})
  const [fineTuningJobs, setFineTuningJobs] = useState<FineTuningJob[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string>('roxy')
  const [trainingInProgress, setTrainingInProgress] = useState(false)

  useEffect(() => {
    loadTrainingData()
  }, [])

  const loadTrainingData = async () => {
    try {
      setLoading(true)
      
      // Load metrics
      const metricsResponse = await fetch('/api/custom-agents/training?action=metrics')
      const metricsData = await metricsResponse.json()
      if (metricsData.success) {
        setMetrics(metricsData.metrics)
      }

      // Load agent performance for all agents
      const agents = ['roxy', 'blaze', 'echo', 'lumi', 'vex', 'lexi', 'nova', 'glitch']
      const performanceData: Record<string, AgentPerformance> = {}
      
      for (const agentId of agents) {
        const response = await fetch(`/api/custom-agents/training?action=agent-performance&agentId=${agentId}`)
        const data = await response.json()
        if (data.success) {
          performanceData[agentId] = data.performance
        }
      }
      setAgentPerformance(performanceData)

      // Load fine-tuning jobs
      const jobsResponse = await fetch('/api/custom-agents/training?action=fine-tuning-jobs')
      const jobsData = await jobsResponse.json()
      if (jobsData.success) {
        setFineTuningJobs(jobsData.jobs)
      }

    } catch (error) {
      logError('Error loading training data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startTraining = async () => {
    try {
      setTrainingInProgress(true)
      
      // Check if we have enough training data first
      if (!metrics || metrics.totalInteractions < 5) {
        alert('Insufficient training data. Please interact with your agents more to collect training data before starting fine-tuning.')
        return
      }
      
      const response = await fetch('/api/custom-agents/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-fine-tuning-job',
          agentId: selectedAgent,
          parameters: {
            model: 'gpt-4o',
            epochs: 3,
            learningRate: 0.001,
            batchSize: 32,
            temperature: 0.7,customPrompts: [],
            dataFilters: {
              minRating: 3,
              minConfidence: 0.7,
              successOnly: true
            }
          }
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Reload training data to show the new job
        await loadTrainingData()
        alert('Training job started successfully!')
      } else {
        alert(`Failed to start training: ${data.error}`)
      }
    } catch (error) {
      logError('Error starting training:', error)
      alert('Failed to start training. Please try again.')
    } finally {
      setTrainingInProgress(false)
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch('/api/custom-agents/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'export-data',
          format: 'json'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Create and download the file
        const blob = new Blob([data.data], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `training-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert(`Failed to export data: ${data.error}`)
      }
    } catch (error) {
      logError('Error exporting data:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-neon-lime'
      case 'training': return 'bg-neon-cyan'
      case 'failed': return 'bg-neon-magenta'
      case 'pending': return 'bg-neon-orange'
      default: return 'bg-gray-700'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-neon-lime" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-neon-orange" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-neon-magenta" />
      case 'optimization': return <Lightbulb className="h-4 w-4 text-neon-cyan" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-neon-lime bg-dark-card'
      case 'warning': return 'border-neon-orange bg-dark-card'
      case 'error': return 'border-neon-magenta bg-dark-card'
      case 'optimization': return 'border-neon-cyan bg-dark-card'
      default: return 'border-gray-700 bg-dark-card'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const currentAgent = agentPerformance[selectedAgent]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-orbitron uppercase tracking-wider text-white">Agent Training Dashboard</h2>
          <p className="text-gray-300 font-mono">Monitor and optimize your AI agents&apos; performance</p>
        </div>
        <Button onClick={loadTrainingData} variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Overview Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalInteractions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all agents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average across agents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}/5</div>
              <p className="text-xs text-muted-foreground">
                Average user satisfaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(metrics.averageResponseTime / 1000).toFixed(1)}s</div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="training">Fine-tuning</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Agents */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Agents</CardTitle>
                <CardDescription>Agents ranked by success rate and user satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.topPerformingAgents.map((agent, index) => (
                    <div key={agent.agentId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium capitalize">{agent.agentId}</p>
                          <p className="text-sm text-gray-300 font-mono">{agent.totalInteractions} interactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium font-mono">{agent.successRate.toFixed(1)}%</p>
                        <p className="text-sm text-gray-300 font-mono">{agent.averageRating.toFixed(1)}★</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Fine-tuning Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Fine-tuning Jobs</CardTitle>
                <CardDescription>Latest training and optimization activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fineTuningJobs.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No fine-tuning jobs yet</p>
                  ) : (
                    fineTuningJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{job.agentId}</p>
                          <p className="text-sm text-gray-600">
                            {job.trainingDataSize} samples
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`} />
                          <span className="text-sm capitalize">{job.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm font-medium">Select Agent:</label>
            <select 
              value={selectedAgent} 
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-3 py-1 border rounded-md"
              aria-label="Select agent to view performance"
            >
              {Object.keys(agentPerformance).map(agentId => (
                <option key={agentId} value={agentId} className="capitalize">
                  {agentId}
                </option>
              ))}
            </select>
          </div>

          {currentAgent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Score</CardTitle>
                  <CardDescription>Overall performance rating</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-neon-purple font-mono">
                        {currentAgent.overallScore.toFixed(0)}
                      </div>
                      <p className="text-sm text-gray-300 font-mono">out of 100</p>
                    </div>
                    <Progress value={currentAgent.overallScore} className="h-2" />
                    <div className="text-center text-sm text-gray-300 font-mono">
                      {currentAgent.benchmarkComparison.percentile.toFixed(0)}th percentile
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Weaknesses */}
              <Card>
                <CardHeader>
                  <CardTitle>Strengths & Weaknesses</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                      <div className="space-y-1">
                        {currentAgent.strengths.map((strength, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">Areas for Improvement</h4>
                      <div className="space-y-1">
                        {currentAgent.weaknesses.map((weakness, index) => (
                          <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                            {weakness}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>Detailed analysis and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentAgent.performanceInsights.map((insight, index) => (
                      <Alert key={index} className={getInsightColor(insight.type)}>
                        <div className="flex items-start space-x-2">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <AlertDescription>
                              <div className="font-medium">{insight.title}</div>
                              <div className="text-sm mt-1">{insight.description}</div>
                              <div className="text-sm mt-2 font-medium">Recommendation: {insight.recommendation}</div>
                            </AlertDescription>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {insight.impact} impact
                          </Badge>
                        </div>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Training Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Start Fine-tuning</CardTitle>
                <CardDescription>Configure and start training for your selected agent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Agent:</label>
                    <select 
                      value={selectedAgent} 
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md mt-1"
                      aria-label="Select agent for training"
                    >
                      {Object.keys(agentPerformance).map(agentId => (
                        <option key={agentId} value={agentId} className="capitalize">
                          {agentId}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Training Parameters:</label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Epochs: 3</div>
                      <div>Learning Rate: 0.001</div>
                      <div>Batch Size: 32</div>
                      <div>Data Size: 100 samples</div>
                    </div>
                  </div>

                  <Button 
                    onClick={startTraining}
                    disabled={trainingInProgress || !metrics || metrics.totalInteractions < 5}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {trainingInProgress ? 'Starting Training...' : 
                     (!metrics || metrics.totalInteractions < 5) ? 'Need More Data' : 'Start Training'}
                  </Button>
                  
                  {(!metrics || metrics.totalInteractions < 5) && (
                    <p className="text-sm text-gray-300 text-center font-mono">
                      Need at least 5 interactions to start training. 
                      <br />
                      Current: {metrics?.totalInteractions || 0} interactions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Training Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Training Jobs</CardTitle>
                <CardDescription>Track your fine-tuning progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fineTuningJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm">No training jobs yet</p>
                      <p className="text-gray-400 text-xs">Start your first training job to see progress here</p>
                    </div>
                  ) : (
                    fineTuningJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 border border-gray-700 rounded-sm">
                        <div>
                          <p className="font-medium capitalize font-mono">{job.agentId}</p>
                          <p className="text-sm text-gray-300 font-mono">
                            {job.trainingDataSize} samples • {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`} />
                          <span className="text-sm capitalize">{job.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Insights</CardTitle>
              <CardDescription>Key insights and recommendations for improving your agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">Data Collection</div>
                    <div className="text-sm mt-1">
                      Continue using your agents to collect more training data. More interactions lead to better insights and recommendations.
                    </div>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium">Performance Monitoring</div>
                    <div className="text-sm mt-1">
                      Monitor agent performance regularly and provide feedback to improve response quality.
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={exportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={startTraining}
                    disabled={trainingInProgress}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {trainingInProgress ? 'Starting Training...' : 'Start Training'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
