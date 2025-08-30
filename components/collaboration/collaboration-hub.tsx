"use client"

import type React from "react"
import Image from "next/image"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCollaboration } from "@/hooks/use-collaboration"
import type { CollaborationTask, AgentHandoff } from "@/lib/agent-collaboration"
import {
  Users,
  Play,
  CheckCircle,
  Clock,
  ArrowRight,
  Lightbulb,
  Loader2,
  Plus,
  Workflow,
  MessageSquare,
} from "lucide-react"

// Add this function at the top of the component
const getAgentAvatar = (agent: string) => {
  const avatars: Record<string, string> = {
    roxy: "/images/agents/roxy.png",
    blaze: "/images/agents/blaze.png",
    echo: "/images/agents/echo.png",
    lumi: "/images/agents/lumi.png",
    vex: "/images/agents/vex.png",
    lexi: "/images/agents/lexi.png",
    nova: "/images/agents/nova.png",
    glitch: "/images/agents/glitch.png",
  }
  return avatars[agent] || "/default-user.svg"
}

export function CollaborationHub() {
  const { createTask, executePhase, suggestCollaboration, getWorkflows, loading, error } = useCollaboration()
  const [activeTasks, setActiveTasks] = useState<CollaborationTask[]>([])
  const [selectedTask, setSelectedTask] = useState<CollaborationTask | null>(null)
  const [phaseOutputs, setPhaseOutputs] = useState<Record<string, Record<string, string>>>({})
  const [handoffs, setHandoffs] = useState<Record<string, AgentHandoff[]>>({})
  const [workflows, setWorkflows] = useState<Record<string, { title: string; description: string }>>({})
  const [newTaskInput, setNewTaskInput] = useState("")
  const [suggestion, setSuggestion] = useState<{ reasoning: string; recommended: boolean; workflow?: string } | null>(null)

  const loadWorkflows = useCallback(async () => {
    const workflowData = await getWorkflows()
    setWorkflows(workflowData)
  }, [getWorkflows])

  useEffect(() => {
    loadWorkflows()
  }, [loadWorkflows])

  const handleCreateTask = async (workflowType: string, customTitle?: string) => {
    const task = await createTask(workflowType, customTitle ? { title: customTitle } : undefined)
    if (task) {
      setActiveTasks((prev) => [...prev, task])
      setPhaseOutputs((prev) => ({ ...prev, [task.id]: {} }))
      setHandoffs((prev) => ({ ...prev, [task.id]: [] }))
    }
  }

  const handleExecutePhase = async (task: CollaborationTask, phaseId: string, input: string) => {
    const result = await executePhase(task, phaseId, input, phaseOutputs[task.id] || {})

    if (result) {
      // Update phase outputs
      setPhaseOutputs((prev) => ({
        ...prev,
        [task.id]: {
          ...prev[task.id],
          [phaseId]: result.output,
        },
      }))

      // Add handoff if present
      if (result.handoff) {
        setHandoffs((prev) => ({
          ...prev,
          [task.id]: [...(prev[task.id] || []), result.handoff!],
        }))
      }

      // Update task progress
      const updatedTask = { ...task }
      const phaseIndex = task.phases.findIndex((p) => p.id === phaseId)

      // Mark current phase as completed
      updatedTask.phases[phaseIndex].status = "completed"
      updatedTask.phases[phaseIndex].output = result.output

      // Mark next phase as in-progress if exists
      if (phaseIndex < task.phases.length - 1) {
        updatedTask.phases[phaseIndex + 1].status = "in-progress"
        updatedTask.currentPhase = task.phases[phaseIndex + 1].id
      } else {
        updatedTask.status = "completed"
      }

      updatedTask.updatedAt = new Date().toISOString()

      setActiveTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)))
      setSelectedTask(updatedTask)
    }
  }

  const handleSuggestCollaboration = async () => {
    if (!newTaskInput.trim()) return

    const result = await suggestCollaboration(newTaskInput)
    setSuggestion(result)
  }

  const getAgentColor = (agent: string) => {
    const colors: Record<string, string> = {
      roxy: "bg-blue-500",
      blaze: "bg-red-500",
      echo: "bg-pink-500",
      lumi: "bg-purple-500",
      vex: "bg-indigo-500",
      lexi: "bg-green-500",
      nova: "bg-orange-500",
      glitch: "bg-teal-500",
    }
    return colors[agent] || "bg-gray-500"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Play className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Agent Collaboration Hub
          </h2>
          <p className="text-muted-foreground">Coordinate complex multi-agent tasks and workflows</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Collaboration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Start New Collaboration</DialogTitle>
              <DialogDescription>Describe your project or choose from predefined workflows</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-description">Project Description</Label>
                <Textarea
                  id="task-description"
                  placeholder="Describe what you want to accomplish..."
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                />
              </div>

              <Button onClick={handleSuggestCollaboration} disabled={loading || !newTaskInput.trim()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                Analyze & Suggest Workflow
              </Button>

              {suggestion && (
                <Alert>
                  <AlertDescription>
                    <strong>Recommendation:</strong> {suggestion.reasoning}
                    {suggestion.recommended && suggestion.workflow && (
                      <div className="mt-2">
                        <Button size="sm" onClick={() => handleCreateTask(suggestion.workflow, newTaskInput)}>
                          Start {workflows[suggestion.workflow]?.title}
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Or choose a predefined workflow:</Label>
                <div className="grid gap-2">
                  {Object.entries(workflows).map(([key, workflow]) => (
                    <Card key={key} className="cursor-pointer hover:bg-muted/50" onClick={() => handleCreateTask(key)}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{workflow.title}</h4>
                            <p className="text-sm text-muted-foreground">{workflow.description}</p>
                          </div>
                          <Workflow className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Collaborations</TabsTrigger>
          <TabsTrigger value="details">Task Details</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeTasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Active Collaborations</h3>
                <p className="text-muted-foreground mb-4">
                  Start a new collaboration to coordinate your AI team on complex projects
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeTasks.map((task) => {
                const completedPhases = task.phases.filter((p) => p.status === "completed").length
                const progress = (completedPhases / task.phases.length) * 100

                return (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <Badge variant={task.status === "completed" ? "default" : "secondary"}>{task.status}</Badge>
                      </div>
                      <CardDescription>{task.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>
                              {completedPhases}/{task.phases.length} phases
                            </span>
                          </div>
                          <Progress value={progress} />
                        </div>

                        {/* In the team members display section */}
                        <div className="flex flex-wrap gap-1">
                          {task.requiredAgents.map((agent) => (
                            <Image
                              key={agent}
                              src={getAgentAvatar(agent) || "/default-user.svg"}
                              alt={agent}
                              width={24}
                              height={24}
                              className="rounded-full object-cover border border-white shadow-sm"
                              title={agent.charAt(0).toUpperCase() + agent.slice(1)}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          {selectedTask ? (
            <TaskDetails
              task={selectedTask}
              phaseOutputs={phaseOutputs[selectedTask.id] || {}}
              handoffs={handoffs[selectedTask.id] || []}
              onExecutePhase={handleExecutePhase}
              loading={loading}
              getAgentColor={getAgentColor}
              getStatusIcon={getStatusIcon}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Select a Collaboration</h3>
                <p className="text-muted-foreground">
                  Choose an active collaboration from the list to view details and manage phases
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface TaskDetailsProps {
  task: CollaborationTask
  phaseOutputs: Record<string, string>
  handoffs: AgentHandoff[]
  onExecutePhase: (_task: CollaborationTask, _phaseId: string, _input: string) => void
  loading: boolean
  getAgentColor: (_agent: string) => string
  getStatusIcon: (_status: string) => React.ReactNode
}

function TaskDetails({
  task,
  phaseOutputs: _phaseOutputs,
  handoffs,
  onExecutePhase,
  loading,
  getAgentColor: _getAgentColor,
  getStatusIcon,
}: TaskDetailsProps) {
  const [phaseInput, setPhaseInput] = useState("")
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null)



  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
          <CardDescription>{task.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={task.status === "completed" ? "default" : "secondary"}>{task.status}</Badge>
            <span className="text-sm text-muted-foreground">
              {task.phases.filter((p) => p.status === "completed").length} of {task.phases.length} phases completed
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Phase Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Phase Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {task.phases.map((phase, index) => (
              <div key={phase.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  {getStatusIcon(phase.status)}
                  {index < task.phases.length - 1 && <div className="w-px h-8 bg-border mt-2" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{phase.name}</h4>
                    {/* Update the phase timeline agent displays: */}
                    <Image
                      src={getAgentAvatar(phase.assignedAgent) || "/default-user.svg"}
                      alt={phase.assignedAgent}
                      width={24}
                      height={24}
                      className="rounded-full object-cover border border-white shadow-sm"
                    />
                    <span className="text-sm text-muted-foreground capitalize">{phase.assignedAgent}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>

                  {phase.status === "in-progress" && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder={`Provide input for ${phase.assignedAgent}...`}
                        value={selectedPhaseId === phase.id ? phaseInput : ""}
                        onChange={(e) => {
                          setPhaseInput(e.target.value)
                          setSelectedPhaseId(phase.id)
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => onExecutePhase(task, phase.id, phaseInput)}
                        disabled={loading || !phaseInput.trim()}
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="mr-2 h-4 w-4" />
                        )}
                        Execute Phase
                      </Button>
                    </div>
                  )}

                  {phase.output && (
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <h5 className="text-sm font-medium mb-1">Output:</h5>
                      <p className="text-sm whitespace-pre-wrap">{phase.output}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Handoffs */}
      {handoffs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Handoffs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {handoffs.map((handoff, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Update the handoff displays: */}
                      <Image
                        src={getAgentAvatar(handoff.fromAgent) || "/default-user.svg"}
                        alt={handoff.fromAgent}
                        width={20}
                        height={20}
                        className="rounded-full object-cover border border-white"
                      />
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Image
                        src={getAgentAvatar(handoff.toAgent) || "/default-user.svg"}
                        alt={handoff.toAgent}
                        width={20}
                        height={20}
                        className="rounded-full object-cover border border-white"
                      />
                      <span className="text-sm font-medium">
                        {handoff.fromAgent} → {handoff.toAgent}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{handoff.context}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
