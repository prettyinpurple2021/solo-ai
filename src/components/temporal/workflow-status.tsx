"use client"

import { logError, logInfo,} from '@/lib/logger'
import { useState} from 'react'
import { useOnboardingWorkflow, useStartOnboarding} from '@/hooks/use-temporal-workflow'
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import { Button} from '@/components/ui/button'
import { Badge} from '@/components/ui/badge'
import { Progress} from '@/components/ui/progress'
import { Alert, AlertDescription} from '@/components/ui/alert'
import { CheckCircle, Clock, AlertCircle, Play, RefreshCw} from 'lucide-react'
import { motion, AnimatePresence} from 'framer-motion'


interface WorkflowStatusProps {
  workflowId?: string | null
  userId?: string
  userData?: any
}

export function WorkflowStatus({ workflowId, userId, userData }: WorkflowStatusProps) {
  const [currentWorkflowId, setCurrentWorkflowId] = useState(workflowId)
  
  const { status, error, isCompleted, isRunning, isFailed } = useOnboardingWorkflow(
    currentWorkflowId ?? null,
    {
      onComplete: (result) => {
        logInfo('Onboarding completed:', result)
      },
      onError: (error) => {
        logError('Onboarding failed:', error)
      }
    }
  )

  const { startOnboarding, loading: starting } = useStartOnboarding()

  const handleStartOnboarding = async () => {
    if (!userId || !userData) return

    try {
      const result = await startOnboarding(userId, userData)
      setCurrentWorkflowId(result.workflowId)
    } catch (error) {
      logError('Failed to start onboarding:', error)
    }
  }

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (isRunning) return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
    if (isFailed) return <AlertCircle className="h-5 w-5 text-red-500" />
    return <Clock className="h-5 w-5 text-gray-500" />
  }

  const getStatusBadge = () => {
    if (isCompleted) return <Badge variant="cyan" className="bg-green-500">Completed</Badge>
    if (isRunning) return <Badge variant="cyan" className="bg-blue-500">Running</Badge>
    if (isFailed) return <Badge variant="magenta">Failed</Badge>
    return <Badge variant="purple">Pending</Badge>
  }

  const getProgress = () => {
    if (isCompleted) return 100
    if (isRunning) return 50
    if (isFailed) return 0
    return 0
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          SoloSuccess AI Platform Onboarding
        </CardTitle>
        <CardDescription>
          Your personalized AI team setup and platform initialization
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!currentWorkflowId ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Start your SoloSuccess AI Platform onboarding to set up your personalized AI team
            </p>
            <Button 
              onClick={handleStartOnboarding}
              disabled={starting || !userId || !userData}
              className="gap-2"
            >
              {starting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Onboarding
                </>
              )}
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span className="font-medium">Workflow Status</span>
                </div>
                {getStatusBadge()}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{getProgress()}%</span>
                </div>
                <Progress value={getProgress()} className="h-2" />
              </div>

              {/* Workflow Details */}
              {status && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Workflow ID:</span>
                    <p className="text-muted-foreground font-mono text-xs break-all">
                      {status.workflowId}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <p className="text-muted-foreground">{status.status}</p>
                  </div>
                  {status.startTime && (
                    <div>
                      <span className="font-medium">Started:</span>
                      <p className="text-muted-foreground">
                        {new Date(status.startTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {status.executionTime && (
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p className="text-muted-foreground">
                        {Math.round(parseInt(status.executionTime) / 1000)}s
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Results */}
              {isCompleted && status?.result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-2"
                >
                  <h4 className="font-medium text-green-600">Onboarding Complete! 🎉</h4>
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <p><strong>Goals Created:</strong> {status.result.goalsCreated}</p>
                    <p><strong>Tasks Created:</strong> {status.result.tasksCreated}</p>
                    <p><strong>AI Agents Initialized:</strong> {status.result.agentsInitialized?.length || 0}</p>
                    <div className="mt-3">
                      <p className="font-medium">Steps Completed:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {status.result.steps?.map((step: string, index: number) => (
                          <li key={index} className="text-green-700">{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error State */}
              {isFailed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Alert variant="error">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Onboarding failed. Please try again or contact support.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {/* Loading State */}
              {isRunning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4"
                >
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Setting up your AI team...</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This may take a few minutes. We're creating your goals, initializing AI agents, and setting up competitive intelligence.
                  </p>
                </motion.div>
              )}

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
}
