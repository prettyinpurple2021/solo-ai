"use client"

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Play,
  Save,
  Settings,
  Plus,
  Trash2,
  Edit,
  Zap,
  Workflow as WorkflowIcon,
  GitBranch,
  Mail,
  Brain,
  Webhook,
  Timer,
  AlertCircle
} from 'lucide-react'
import { PrimaryButton } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { useToast } from '@/hooks/use-toast'
import { logError, logInfo } from '@/lib/logger'
import type { Workflow, WorkflowNode, WorkflowEdge, NodeType } from '@/lib/workflow-engine'
import './visual-workflow-builder.css'

// Types
interface WorkflowBuilderProps {
  workflow?: Workflow
  onSave?: (workflow: Workflow) => void
  onExecute?: (workflow: Workflow) => void
  className?: string
}

interface NodePosition {
  x: number
  y: number
}

interface DragState {
  isDragging: boolean
  dragStart: NodePosition
  dragOffset: NodePosition
}

// Node type icons mapping
const NODE_TYPE_ICONS = {
  trigger: Play,
  action: Zap,
  condition: GitBranch,
  delay: Timer,
  webhook: Webhook,
  ai_task: Brain,
  email: Mail,
  notification: AlertCircle
}

// Node type colors
const NODE_TYPE_COLORS = {
  trigger: '#10B981',
  action: '#3B82F6',
  condition: '#EF4444',
  delay: '#6B7280',
  webhook: '#8B5CF6',
  ai_task: '#EC4899',
  email: '#F59E0B',
  notification: '#06B6D4'
}

export function VisualWorkflowBuilder({
  workflow: initialWorkflow,
  onSave,
  onExecute,
  className = ""
}: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = React.useState<Workflow>(initialWorkflow || {
    id: crypto.randomUUID(),
    name: 'New Workflow',
    description: '',
    version: '1.0.0',
    status: 'draft',
    triggerType: 'manual',
    triggerConfig: {},
    nodes: [],
    edges: [],
    variables: {},
    settings: {
      timeout: 300000,
      retryAttempts: 3,
      retryDelay: 5000,
      parallelExecution: true,
      errorHandling: 'stop'
    },
    metadata: {
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 0,
      successRate: 0,
      averageExecutionTime: 0
    }
  })

  const [selectedNode, setSelectedNode] = React.useState<WorkflowNode | null>(null)
  const [selectedEdge, setSelectedEdge] = React.useState<WorkflowEdge | null>(null)
  const [dragState, setDragState] = React.useState<DragState>({
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 }
  })
  const [isExecuting, setIsExecuting] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [showNodeLibrary, setShowNodeLibrary] = React.useState(false)
  const [_showWorkflowSettings, _setShowWorkflowSettings] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'design' | 'settings' | 'variables' | 'preview'>('design')

  const { toast } = useToast()
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const [_canvasOffset, _setCanvasOffset] = React.useState({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)

  // Fetch node types from API
  const [nodeTypes, setNodeTypes] = React.useState<NodeType[]>([])
  const [ setIsLoadingNodeTypes] = React.useState(true)

  // Fetch agents from API
  const [agents, setAgents] = React.useState<any[]>([])
  const [isLoadingAgents, setIsLoadingAgents] = React.useState(true)

  React.useEffect(() => {
    async function fetchNodeTypes() {
      try {
        const response = await fetch('/api/workflows/node-types')
        const data = await response.json()
        if (data.success && Array.isArray(data.data)) {
           setNodeTypes(data.data as NodeType[])
        }
      } catch (error) {
        logError('Failed to fetch node types', error)
        toast({
          title: 'Error',
          description: 'Failed to load workflow node types',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingNodeTypes(false)
      }
    }

    async function fetchAgents() {
        try {
            const response = await fetch('/api/agents')
            const data = await response.json()
            if (data.success && Array.isArray(data.data)) {
                setAgents(data.data)
            }
        } catch (error) {
            logError('Failed to fetch agents', error)
        } finally {
            setIsLoadingAgents(false)
        }
    }

    fetchNodeTypes()
    fetchAgents()
  },   [toast])

  // Add new node
  const addNode = React.useCallback((nodeType: NodeType, position: NodePosition) => {
    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type: nodeType.id as 'trigger' | 'action' | 'condition' | 'delay' | 'webhook' | 'ai_task' | 'email' | 'notification',
      name: nodeType.name,
      description: nodeType.description,
      position,
      config: {},
      inputs: nodeType.inputs.map(input => input.id),
      outputs: nodeType.outputs.map(output => output.id),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setWorkflow((prev: Workflow) => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }))

    setShowNodeLibrary(false)
    logInfo('Node added to workflow', { nodeId: newNode.id, type: nodeType.id })
  }, [])

  // Update node position
  const updateNodePosition = React.useCallback((nodeId: string, position: NodePosition) => {
    setWorkflow((prev: Workflow) => ({
      ...prev,
      nodes: prev.nodes.map((node: WorkflowNode) =>
        node.id === nodeId ? { ...node, position, updatedAt: new Date() } : node
      )
    }))
  }, [])

  // Update node config
  const _updateNodeConfig = React.useCallback((nodeId: string, config: Record<string, unknown>) => {
    setWorkflow((prev: Workflow) => ({
      ...prev,
      nodes: prev.nodes.map((node: WorkflowNode) =>
        node.id === nodeId ? { ...node, config: { ...node.config, ...config }, updatedAt: new Date() } : node
      )
    }))
  }, [])

  // Delete node
  const deleteNode = React.useCallback((nodeId: string) => {
    setWorkflow((prev: Workflow) => ({
      ...prev,
      nodes: prev.nodes.filter((node: WorkflowNode) => node.id !== nodeId),
      edges: prev.edges.filter((edge: WorkflowEdge) => edge.source !== nodeId && edge.target !== nodeId)
    }))

    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }

    logInfo('Node deleted from workflow', { nodeId })
  }, [selectedNode])

  // Add edge between nodes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _addEdge = React.useCallback((sourceId: string, targetId: string, sourceHandle?: string, targetHandle?: string) => {
    const newEdge: WorkflowEdge = {
      id: crypto.randomUUID(),
      source: sourceId,
      target: targetId,
      sourceHandle,
      targetHandle,
      animated: false
    }

    setWorkflow((prev: Workflow) => ({
      ...prev,
      edges: [...prev.edges, newEdge]
    }))

    logInfo('Edge added to workflow', { edgeId: newEdge.id, source: sourceId, target: targetId })
  }, [])

  // Delete edge
  const deleteEdge = React.useCallback((edgeId: string) => {
    setWorkflow((prev: Workflow) => ({
      ...prev,
      edges: prev.edges.filter((edge: WorkflowEdge) => edge.id !== edgeId)
    }))

    if (selectedEdge?.id === edgeId) {
      setSelectedEdge(null)
    }

    logInfo('Edge deleted from workflow', { edgeId })
  }, [selectedEdge])





  // Save workflow
  const handleSave = React.useCallback(async () => {
    setIsSaving(true)
    try {
      const updatedWorkflow = {
        ...workflow,
        metadata: {
          ...workflow.metadata,
          updatedAt: new Date()
        }
      }

      setWorkflow(updatedWorkflow)
      onSave?.(updatedWorkflow)

      toast({
        title: 'Workflow Saved',
        description: 'Your workflow has been saved successfully',
        variant: 'success'
      })

      logInfo('Workflow saved', { workflowId: workflow.id, name: workflow.name })
    } catch (error) {
      logError('Failed to save workflow:', error instanceof Error ? error : new Error(String(error)))
      toast({
        title: 'Save Failed',
        description: 'Failed to save the workflow. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }, [workflow, onSave, toast])

  // Execute workflow
  const handleExecute = React.useCallback(async () => {
    setIsExecuting(true)
    try {
      onExecute?.(workflow)

      toast({
        title: 'Workflow Started',
        description: 'Your workflow is now executing',
        variant: 'success'
      })

      logInfo('Workflow execution started', { workflowId: workflow.id })
    } catch (error) {
      logError('Failed to execute workflow:', error instanceof Error ? error : new Error(String(error)))
      toast({
        title: 'Execution Failed',
        description: 'Failed to start workflow execution',
        variant: 'destructive'
      })
    } finally {
      setIsExecuting(false)
    }
  }, [workflow, onExecute, toast])

  // Handle canvas click
  const handleCanvasClick = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === canvasRef.current) {
      setSelectedNode(null)
      setSelectedEdge(null)
    }
  }, [])

  // Handle node drag start
  const handleNodeDragStart = React.useCallback((nodeId: string, event: React.MouseEvent<HTMLDivElement>) => {
    const node = workflow.nodes.find(n => n.id === nodeId)
    if (!node) return

    setDragState({
      isDragging: true,
      dragStart: { x: event.clientX, y: event.clientY },
      dragOffset: { x: node.position.x, y: node.position.y }
    })

    event.preventDefault()
  }, [workflow.nodes])

  // Handle node drag
  const handleNodeDrag = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState.isDragging || !selectedNode) return

    const deltaX = event.clientX - dragState.dragStart.x
    const deltaY = event.clientY - dragState.dragStart.y

    const newPosition = {
      x: Math.max(0, dragState.dragOffset.x + deltaX / zoom),
      y: Math.max(0, dragState.dragOffset.y + deltaY / zoom)
    }

    updateNodePosition(selectedNode.id, newPosition)
  }, [dragState, selectedNode, zoom, updateNodePosition])

  // Handle node drag end
  const handleNodeDragEnd = React.useCallback(() => {
    setDragState({
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 }
    })
  }, [])

  // Mouse event handlers
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (dragState.isDragging) {
        handleNodeDrag(event as unknown as React.MouseEvent<HTMLDivElement>)
      }
    }

    const handleMouseUp = () => {
      if (dragState.isDragging) {
        handleNodeDragEnd()
      }
    }

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState.isDragging, handleNodeDrag, handleNodeDragEnd])

  // Render node
  const renderNode = React.useCallback((node: WorkflowNode) => {
    const nodeType = nodeTypes.find(nt => nt.id === node.type)
    if (!nodeType) return null

    const IconComponent = NODE_TYPE_ICONS[nodeType.category as keyof typeof NODE_TYPE_ICONS] || WorkflowIcon
    const color = NODE_TYPE_COLORS[nodeType.category as keyof typeof NODE_TYPE_COLORS] || '#6B7280'
    const isSelected = selectedNode?.id === node.id

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`absolute cursor-pointer select-none ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: `scale(${zoom})`
        }}
        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
          setSelectedNode(node)
          handleNodeDragStart(node.id, e)
        }}
      >
        <div className="w-48 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="node-color-indicator"
              style={{ backgroundColor: color }}
            />
            <IconComponent className="node-icon" style={{ color }} />
            <span className="text-sm font-medium truncate">{node.name}</span>
          </div>

          {node.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{node.description}</p>
          )}

          <div className="flex items-center justify-between">
            <Badge
              variant="purple"
              className="text-xs"
            >
              {nodeType.category}
            </Badge>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  setSelectedNode(node)
                }}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation()
                  deleteNode(node.id)
                }}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Input ports */}
          {nodeType.inputs.length > 0 && (
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
              <div className="node-port node-port-input" />
            </div>
          )}

          {/* Output ports */}
          {nodeType.outputs.length > 0 && (
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
              <div className="node-port node-port-output" />
            </div>
          )}
        </div>
      </motion.div>
    )
  }, [selectedNode, zoom, nodeTypes, handleNodeDragStart, deleteNode])

  // Render edge
  const renderEdge = React.useCallback((edge: WorkflowEdge) => {
    const sourceNode = workflow.nodes.find((n: WorkflowNode) => n.id === edge.source)
    const targetNode = workflow.nodes.find((n: WorkflowNode) => n.id === edge.target)

    if (!sourceNode || !targetNode) return null

    const startX = sourceNode.position.x + 192 // Node width
    const startY = sourceNode.position.y + 60  // Node height / 2
    const endX = targetNode.position.x
    const endY = targetNode.position.y + 60

    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2

    const isSelected = selectedEdge?.id === edge.id

    return (
      <svg
        key={edge.id}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <defs>
          <marker
            id={`arrowhead-${edge.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill={isSelected ? '#8B5CF6' : '#6B7280'}
            />
          </marker>
        </defs>

        <path
          d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
          stroke={isSelected ? '#8B5CF6' : '#6B7280'}
          strokeWidth={isSelected ? 3 : 2}
          fill="none"
          markerEnd={`url(#arrowhead-${edge.id})`}
          className="cursor-pointer"
          onClick={() => setSelectedEdge(edge)}
        />
      </svg>
    )
  }, [workflow.nodes, selectedEdge])

  // Render node configuration form based on type
  const renderNodeConfig = (node: WorkflowNode) => {
    switch (node.type) {
      case 'ai_task':
        return (
          <>
            {/* Select Agent - Show loading state */}
            {isLoadingAgents ? (
                <div className="flex items-center gap-2 p-2 text-sm text-gray-400">
                    <Loading size="sm" /> 
                    <span>Loading agents...</span>
                </div>
            ) : (
                <>
                  <div>
                    <Label className="mb-2 block">Select Agent</Label>
                    <Select
                      value={node.config.agentId as string || ''}
                      onValueChange={(value) => _updateNodeConfig(node.id, { agentId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {node.config.agentId && (
                      <div className="text-xs text-purple-300 mt-1">
                          {agents.find(a => a.id === node.config.agentId)?.description}
                      </div>
                  )}
                </>
            )}
            
            <div>
              <Label className="mb-2 block">Prompt</Label>
              <Textarea 
                value={node.config.prompt as string || ''}
                onChange={(e) => _updateNodeConfig(node.id, { prompt: e.target.value })}
                placeholder="Describe what you want the agent to do..."
                rows={5}
                className="text-sm"
              />
            </div>
            
             <div>
              <Label className="mb-2 block">Task Type</Label>
               <Select
                value={node.config.task as string || 'custom'}
                onValueChange={(value) => _updateNodeConfig(node.id, { task: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="custom">Custom Instruction</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="generation">Content Generation</SelectItem>
                    <SelectItem value="decision">Decision Making</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )
      
      case 'manual_trigger':
        return (
             <div className="space-y-2">
                <p className="text-xs text-gray-400">
                    This workflow is triggered manually. You can define expected inputs here.
                </p>
                {/* Future: Add dynamic input field definition here */}
                 <div className="bg-purple-900/20 p-3 rounded text-xs">
                    No configuration options available yet.
                 </div>
            </div>
        )

      default:
        return (
             <div className="text-xs text-gray-500 italic">
                No specific configuration for this node type.
             </div>
        )
    }
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold boss-heading">Workflow Builder</h2>
            <p className="text-sm text-gray-300">Create and manage automated workflows</p>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={workflow.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkflow((prev: Workflow) => ({ ...prev, name: e.target.value }))}
              className="h-8 w-48 text-sm"
              placeholder="Workflow name..."
            />
            <Badge variant="purple" className="capitalize">
              {workflow.status}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PrimaryButton
            variant="outline"
            size="sm"
            onClick={() => setShowNodeLibrary(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Node
          </PrimaryButton>

          <PrimaryButton
            variant="outline"
            size="sm"
            onClick={() => _setShowWorkflowSettings(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </PrimaryButton>

          <PrimaryButton
            variant="outline"
            size="sm"
            onClick={handleExecute}
            disabled={isExecuting || workflow.nodes.length === 0}
          >
            {isExecuting ? (
              <Loading size="sm" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            Execute
          </PrimaryButton>

          <PrimaryButton
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loading size="sm" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save
          </PrimaryButton>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-purple-800/30 bg-black/10 backdrop-blur-sm p-4">
          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'design' | 'settings' | 'variables' | 'preview')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="design" className="flex items-center gap-1">
                <WorkflowIcon className="h-3 w-3" />
                Design
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Design Tab */}
            <TabsContent value="design" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Workflow Info</h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="workflow-description">Description</Label>
                    <Textarea
                      id="workflow-description"
                      value={workflow.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setWorkflow((prev: Workflow) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your workflow..."
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="trigger-type">Trigger Type</Label>
                    <Select
                      value={workflow.triggerType}
                      onValueChange={(value: string) => setWorkflow((prev: Workflow) => ({ ...prev, triggerType: value as 'manual' | 'scheduled' | 'webhook' | 'event' | 'ai_trigger' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="ai_trigger">AI Trigger</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {selectedEdge && (
                <div>
                    <h3 className="font-semibold mb-2">Edge Configuration</h3>
                    <div className="p-3 border border-purple-800/30 rounded-lg">
                        <div className="flex items-center justify-between">
                             <div className="text-sm">Connection ID:</div>
                             <div className="text-xs text-gray-400 font-mono">{selectedEdge.id.slice(0, 8)}...</div>
                        </div>
                        <div className="mt-4">
                             <Button 
                                variant="destructive" 
                                size="sm" 
                                className="w-full"
                                onClick={() => deleteEdge(selectedEdge.id)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Connection
                            </Button>
                        </div>
                    </div>
                </div>
              )}

              {selectedNode && (
                <div>
                  <h3 className="font-semibold mb-2">Node Configuration</h3>
                  <div className="p-3">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="node-name">Name</Label>
                        <Input
                          id="node-name"
                          value={selectedNode.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setWorkflow((prev: Workflow) => ({
                              ...prev,
                              nodes: prev.nodes.map((n: WorkflowNode) =>
                                n.id === selectedNode.id ? { ...n, name: e.target.value } : n
                              )
                            }))
                            setSelectedNode((prev: WorkflowNode | null) => prev ? { ...prev, name: e.target.value } : null)
                          }}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="node-description">Description</Label>
                        <Textarea
                          id="node-description"
                          value={selectedNode.description || ''}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            setWorkflow((prev: Workflow) => ({
                              ...prev,
                              nodes: prev.nodes.map((n: WorkflowNode) =>
                                n.id === selectedNode.id ? { ...n, description: e.target.value } : n
                              )
                            }))
                            setSelectedNode((prev: WorkflowNode | null) => prev ? { ...prev, description: e.target.value } : null)
                          }}
                          rows={2}
                          className="text-sm"
                        />
                      </div>

                      {/* Node-specific configuration */}
                      <div className="pt-4 border-t border-purple-800/30 space-y-4">
                        {renderNodeConfig(selectedNode)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Node type: {selectedNode.type}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Workflow Stats</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-purple-900/20 rounded p-2">
                    <div className="text-purple-300">Nodes</div>
                    <div className="font-semibold">{workflow.nodes.length}</div>
                  </div>
                  <div className="bg-purple-900/20 rounded p-2">
                    <div className="text-purple-300">Edges</div>
                    <div className="font-semibold">{workflow.edges.length}</div>
                  </div>
                  <div className="bg-purple-900/20 rounded p-2">
                    <div className="text-purple-300">Executions</div>
                    <div className="font-semibold">{workflow.metadata.executionCount}</div>
                  </div>
                  <div className="bg-purple-900/20 rounded p-2">
                    <div className="text-purple-300">Success Rate</div>
                    <div className="font-semibold">{(workflow.metadata.successRate * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Execution Settings</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="timeout">Timeout (ms)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={workflow.settings.timeout}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkflow((prev: Workflow) => ({
                        ...prev,
                        settings: { ...prev.settings, timeout: parseInt(e.target.value) || 300000 }
                      }))}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="retry-attempts">Retry Attempts</Label>
                    <Input
                      id="retry-attempts"
                      type="number"
                      value={workflow.settings.retryAttempts}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkflow((prev: Workflow) => ({
                        ...prev,
                        settings: { ...prev.settings, retryAttempts: parseInt(e.target.value) || 3 }
                      }))}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="error-handling">Error Handling</Label>
                    <Select
                      value={workflow.settings.errorHandling}
                      onValueChange={(value: string) => setWorkflow((prev: Workflow) => ({
                        ...prev,
                        settings: { ...prev.settings, errorHandling: value as any }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stop">Stop on Error</SelectItem>
                        <SelectItem value="continue">Continue on Error</SelectItem>
                        <SelectItem value="rollback">Rollback on Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full bg-gradient-to-br from-purple-900/20 to-black/40 relative cursor-grab active:cursor-grabbing canvas-transform"
            onClick={handleCanvasClick}
            style={{
              transform: `translate(${_canvasOffset.x}px, ${_canvasOffset.y}px) scale(${zoom})`
            }}
          >
            {/* Grid background */}
            <div className="grid-background" />

            {/* Render edges */}
            {workflow.edges.map(renderEdge)}

            {/* Render nodes */}
            {workflow.nodes.map(renderNode)}

            {/* Empty state */}
            {workflow.nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <WorkflowIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No Workflow Nodes</h3>
                  <p className="text-gray-500 mb-4">Add nodes to start building your workflow</p>
                  <PrimaryButton onClick={() => setShowNodeLibrary(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Node
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>

          {/* Canvas controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <span className="text-sm text-gray-300 min-w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="h-8 w-8 p-0"
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {/* Node Library Dialog */}
      <Dialog open={showNodeLibrary} onOpenChange={setShowNodeLibrary}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Node to Workflow</DialogTitle>
            <DialogDescription>
              Select a node type to add to your workflow
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {nodeTypes.map(nodeType => (
              <button
                key={nodeType.id}
                onClick={() => addNode(nodeType, { x: 100, y: 100 })}
                className="p-4 border border-purple-800/30 rounded-lg hover:border-purple-500 hover:bg-purple-900/20 transition-colors text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="node-type-color"
                    style={{ backgroundColor: nodeType.color }}
                  />
                  {React.createElement(NODE_TYPE_ICONS[nodeType.category as keyof typeof NODE_TYPE_ICONS] || WorkflowIcon, {
                    className: "node-type-icon",
                    style: { color: nodeType.color }
                  })}
                  <span className="font-medium text-sm">{nodeType.name}</span>
                </div>
                <p className="text-xs text-gray-500 group-hover:text-gray-300">
                  {nodeType.description}
                </p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
