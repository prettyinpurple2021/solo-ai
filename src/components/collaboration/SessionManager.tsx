// @ts-nocheck
'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Users, 
  Settings, 
  X, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Target,
  Zap,
  Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'


// Types
interface SessionFormData {
  name: string
  description: string
  type: 'chat' | 'project' | 'handoff' | 'consultation'
  goal: string
  requiredAgents: string[]
  maxParticipants: number
  settings: {
    autoSave: boolean
    allowGuests: boolean
    requiresHumanApproval: boolean
    maxDuration?: number
  }
}

interface Agent {
  id: string
  name: string
  specialization: string
  capabilities: string[]
  status: 'available' | 'busy' | 'offline'
  description?: string
}

interface SessionTemplate {
  id: string
  name: string
  description: string
  type: 'chat' | 'project' | 'handoff' | 'consultation'
  requiredAgents: string[]
  defaultSettings: SessionFormData['settings']
  icon: React.ReactNode
}

const SessionManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<SessionFormData>({
    name: '',
    description: '',
    type: 'project',
    goal: '',
    requiredAgents: [],
    maxParticipants: 5,
    settings: {
      autoSave: true,
      allowGuests: false,
      requiresHumanApproval: false
    }
  })

  // Predefined session templates
  const templates: SessionTemplate[] = [
    {
      id: 'quick-chat',
      name: 'Quick Chat',
      description: 'Fast consultation with AI agents',
      type: 'chat',
      requiredAgents: ['chat-agent-1'],
      defaultSettings: {
        autoSave: true,
        allowGuests: true,
        requiresHumanApproval: false,
        maxDuration: 30
      },
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: 'project-collaboration',
      name: 'Project Collaboration',
      description: 'Multi-agent project development session',
      type: 'project',
      requiredAgents: ['project-manager-agent', 'developer-agent'],
      defaultSettings: {
        autoSave: true,
        allowGuests: false,
        requiresHumanApproval: true
      },
      icon: <Target className="w-6 h-6" />
    },
    {
      id: 'brainstorming',
      name: 'Brainstorming Session',
      description: 'Creative ideation with multiple agents',
      type: 'consultation',
      requiredAgents: ['creative-agent', 'analyst-agent'],
      defaultSettings: {
        autoSave: true,
        allowGuests: true,
        requiresHumanApproval: false
      },
      icon: <Brain className="w-6 h-6" />
    }
  ]

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/collaboration/agents')
        if (response.ok) {
          const data = await response.json()
          setAgents(data.data?.agents || [])
        }
      } catch (error) {
        logError('Error fetching agents:', error)
      }
    }

    if (isOpen) {
      fetchAgents()
    }
  }, [isOpen])

  // Handle template selection
  const selectTemplate = (template: SessionTemplate) => {
    setFormData({
      ...formData,
      name: template.name,
      description: template.description,
      type: template.type,
      requiredAgents: template.requiredAgents,
      settings: template.defaultSettings
    })
    setStep(2)
  }

  // Handle agent selection
  const toggleAgent = (agentId: string) => {
    setFormData(prev => ({
      ...prev,
      requiredAgents: prev.requiredAgents.includes(agentId)
        ? prev.requiredAgents.filter(id => id !== agentId)
        : [...prev.requiredAgents, agentId]
    }))
  }

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/collaboration/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          type: formData.type,
          goal: formData.goal,
          requiredAgents: formData.requiredAgents,
          maxParticipants: formData.maxParticipants,
          settings: formData.settings
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Session created successfully!')
        setIsOpen(false)
        resetForm()
        // Optionally redirect to the new session
        window.location.href = `/dashboard/collaboration/sessions/${data.data.session.id}`
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to create session')
      }
    } catch (error) {
      logError('Error creating session:', error)
      toast.error('Failed to create session')
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'project',
      goal: '',
      requiredAgents: [],
      maxParticipants: 5,
      settings: {
        autoSave: true,
        allowGuests: false,
        requiresHumanApproval: false
      }
    })
    setStep(1)
  }

  // Get available agents (not busy)
  const availableAgents = agents.filter(agent => agent.status === 'available')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Session
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Create Collaboration Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
              step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              1
            </div>
            <div className={cn("w-12 h-0.5", step > 1 ? "bg-primary" : "bg-muted")} />
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
              step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              2
            </div>
            <div className={cn("w-12 h-0.5", step > 2 ? "bg-primary" : "bg-muted")} />
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
              step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              3
            </div>
          </div>

          {/* Step 1: Template Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Choose a Session Type</h3>
                <p className="text-muted-foreground">Select a template to get started quickly</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                    onClick={() => selectTemplate(template)}
                  >
                    <div className="text-center space-y-3">
                      <div className="mx-auto w-12 h-12 bg-dark-card border border-neon-purple rounded-sm flex items-center justify-center text-neon-purple">
                        {template.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {template.type}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Start from Scratch
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Session Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Session Details</h3>
                <p className="text-muted-foreground">Configure your collaboration session</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Session Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Product Launch Strategy"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Session Type</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chat">Chat</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="handoff">Handoff</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 5 })}
                      min={1}
                      max={20}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what you want to accomplish..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="goal">Primary Goal</Label>
                    <Textarea
                      id="goal"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      placeholder="What specific outcome are you looking for?"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Session Settings */}
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Session Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoSave">Auto-save progress</Label>
                      <p className="text-sm text-muted-foreground">Automatically save session progress</p>
                    </div>
                    <Switch
                      id="autoSave"
                      checked={formData.settings.autoSave}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, autoSave: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowGuests">Allow guest agents</Label>
                      <p className="text-sm text-muted-foreground">Allow agents to join dynamically</p>
                    </div>
                    <Switch
                      id="allowGuests"
                      checked={formData.settings.allowGuests}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, allowGuests: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requiresApproval">Require human approval</Label>
                      <p className="text-sm text-muted-foreground">Require approval for agent actions</p>
                    </div>
                    <Switch
                      id="requiresApproval"
                      checked={formData.settings.requiresHumanApproval}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, requiresHumanApproval: checked }
                      })}
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)}>
                  Next: Select Agents
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Agent Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold">Select Agents</h3>
                <p className="text-muted-foreground">Choose which agents will participate in this session</p>
              </div>

              {/* Selected Agents */}
              {formData.requiredAgents.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Selected Agents ({formData.requiredAgents.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.requiredAgents.map((agentId) => {
                      const agent = agents.find(a => a.id === agentId)
                      return agent ? (
                        <Badge key={agentId} variant="secondary" className="flex items-center gap-1">
                          {agent.name}
                          <button
                            onClick={() => toggleAgent(agentId)}
                            className="ml-1 hover:text-destructive"
                            title="Remove agent"
                            aria-label="Remove agent"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                </Card>
              )}

              {/* Available Agents */}
              <div>
                <h4 className="font-semibold mb-4">Available Agents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableAgents.map((agent) => (
                    <Card 
                      key={agent.id} 
                      className={cn(
                        "p-4 cursor-pointer transition-all",
                        formData.requiredAgents.includes(agent.id)
                          ? "border-primary bg-primary/5"
                          : "hover:shadow-md"
                      )}
                      onClick={() => toggleAgent(agent.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-semibold">{agent.name}</h5>
                            {formData.requiredAgents.includes(agent.id) && (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{agent.specialization}</p>
                          {agent.description && (
                            <p className="text-xs text-muted-foreground mb-2">{agent.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.slice(0, 3).map((capability, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                            {agent.capabilities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{agent.capabilities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {availableAgents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>No agents are currently available</p>
                    <p className="text-sm">Please try again later</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={loading || formData.requiredAgents.length === 0 || !formData.name}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Session'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SessionManager
