'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useIntelligenceBriefings } from '@/hooks/use-intelligence-briefings'
import { AgentBriefing } from '@/lib/agent-intelligence-briefings'
import { 
  User, 
  Brain, 
  Palette, 
  TrendingUp, 
  Users,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Target,
  Lightbulb,
  CheckCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface AgentBriefingDashboardProps {
  competitorIds?: string[]
}

const agentConfig = {
  echo: {
    name: 'Echo',
    icon: User,
    color: 'bg-pink-500',
    description: 'Marketing Maven',
    personality: 'Creative, trend-savvy marketing expert'
  },
  lexi: {
    name: 'Lexi',
    icon: Brain,
    color: 'bg-purple-500',
    description: 'Strategy Analyst',
    personality: 'Analytical, strategic thinker'
  },
  nova: {
    name: 'Nova',
    icon: Palette,
    color: 'bg-blue-500',
    description: 'Product Designer',
    personality: 'Creative, user-focused designer'
  },
  blaze: {
    name: 'Blaze',
    icon: TrendingUp,
    color: 'bg-orange-500',
    description: 'Growth Strategist',
    personality: 'Results-driven growth expert'
  },
  collaborative: {
    name: 'Team',
    icon: Users,
    color: 'bg-green-500',
    description: 'Collaborative Analysis',
    personality: 'Multi-agent perspective'
  }
}

export function AgentBriefingDashboard({ competitorIds }: AgentBriefingDashboardProps) {
  const {
    agentBriefings,
    currentAgentBriefing,
    isGenerating,
    error,
    generateEchoBriefing,
    generateLexiBriefing,
    generateNovaBriefing,
    generateBlazeBriefing,
    generateCollaborativeBriefing,
    clearError
  } = useIntelligenceBriefings()
  
  const [selectedBriefing, setSelectedBriefing] = useState<AgentBriefing | null>(null)
  
  useEffect(() => {
    if (currentAgentBriefing) {
      setSelectedBriefing(currentAgentBriefing)
    }
  }, [currentAgentBriefing])
  
  const handleGenerateAgentBriefing = async (agentId: string) => {
    clearError()
    
    switch (agentId) {
      case 'echo':
        await generateEchoBriefing(competitorIds)
        break
      case 'lexi':
        await generateLexiBriefing(competitorIds)
        break
      case 'nova':
        await generateNovaBriefing(competitorIds)
        break
      case 'blaze':
        await generateBlazeBriefing(competitorIds)
        break
      case 'collaborative':
        await generateCollaborativeBriefing(competitorIds)
        break
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'urgent':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }
  
  const getAgentIcon = (agentId: string) => {
    const config = agentConfig[agentId as keyof typeof agentConfig]
    return config ? config.icon : User
  }
  
  const getAgentColor = (agentId: string) => {
    const config = agentConfig[agentId as keyof typeof agentConfig]
    return config ? config.color : 'bg-gray-500'
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Intelligence Briefings</h2>
          <p className="text-muted-foreground">
            Specialized intelligence analysis from your AI agent team
          </p>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Agent Briefing Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Agent Briefings</CardTitle>
          <CardDescription>
            Get specialized intelligence analysis from each AI agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(agentConfig).map(([agentId, config]) => {
              const Icon = config.icon
              return (
                <Button
                  key={agentId}
                  onClick={() => handleGenerateAgentBriefing(agentId)}
                  disabled={isGenerating}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <div className={`p-2 rounded-full ${config.color} text-white`}>
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{config.name}</div>
                    <div className="text-xs text-muted-foreground">{config.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Briefing List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Agent Briefings</CardTitle>
            <CardDescription>
              {agentBriefings.length} agent briefings available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {agentBriefings.map((briefing) => {
                  const Icon = getAgentIcon(briefing.agentId)
                  const colorClass = getAgentColor(briefing.agentId)
                  
                  return (
                    <div
                      key={briefing.agentId + briefing.generatedAt}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedBriefing?.agentId === briefing.agentId && 
                        selectedBriefing?.generatedAt === briefing.generatedAt
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedBriefing(briefing)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-1.5 rounded-full ${colorClass} text-white`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{briefing.agentName}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(briefing.generatedAt), 'MMM dd, HH:mm')}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {briefing.briefingType}
                        </Badge>
                      </div>
                      
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">
                        {briefing.title}
                      </h4>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {briefing.summary}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {briefing.keyFindings.length} insights
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {briefing.recommendations.length} recommendations
                        </span>
                      </div>
                    </div>
                  )
                })}
                
                {agentBriefings.length === 0 && !isGenerating && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No agent briefings yet</p>
                    <p className="text-xs">Generate your first agent briefing to get started</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Briefing Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            {selectedBriefing && (
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getAgentColor(selectedBriefing.agentId)} text-white`}>
                  {React.createElement(getAgentIcon(selectedBriefing.agentId), { className: "h-4 w-4" })}
                </div>
                <div>
                  <CardTitle>{selectedBriefing.title}</CardTitle>
                  <CardDescription>
                    {selectedBriefing.agentName} • Generated on {format(new Date(selectedBriefing.generatedAt), 'PPP')}
                  </CardDescription>
                </div>
              </div>
            )}
            {!selectedBriefing && (
              <>
                <CardTitle>Select an Agent Briefing</CardTitle>
                <CardDescription>Choose a briefing from the list to view details</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {selectedBriefing ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="recommendations">Actions</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Agent Personality
                    </h4>
                    <p className="text-sm text-muted-foreground italic">
                      "{selectedBriefing.agentPersonality}"
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Executive Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedBriefing.summary}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Key Findings
                    </h4>
                    <div className="space-y-2">
                      {selectedBriefing.keyFindings.map((finding, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
                          <span className="text-sm">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Next Steps
                    </h4>
                    <div className="space-y-2">
                      {selectedBriefing.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="insights" className="space-y-4">
                  <div className="space-y-4">
                    {selectedBriefing.insights.map((insight, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{insight.category}</h4>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(insight.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {insight.insight}
                        </p>
                        
                        {insight.evidence.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-medium text-xs mb-2">Evidence:</h5>
                            <ul className="space-y-1">
                              {insight.evidence.map((evidence, idx) => (
                                <li key={idx} className="text-xs text-muted-foreground">
                                  • {evidence}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {insight.implications.length > 0 && (
                          <div>
                            <h5 className="font-medium text-xs mb-2">Implications:</h5>
                            <ul className="space-y-1">
                              {insight.implications.map((implication, idx) => (
                                <li key={idx} className="text-xs text-muted-foreground">
                                  • {implication}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-4">
                  <div className="space-y-4">
                    {selectedBriefing.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(rec.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {rec.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Reasoning: </span>
                            <span className="text-muted-foreground">{rec.reasoning}</span>
                          </div>
                          <div>
                            <span className="font-medium">Timeframe: </span>
                            <span className="text-muted-foreground">{rec.timeframe}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Expected Outcome: </span>
                          <span className="text-muted-foreground">{rec.expectedOutcome}</span>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-3">Action Items</h4>
                      <div className="space-y-3">
                        {selectedBriefing.actionItems.map((action, index) => (
                          <div key={index} className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-sm">{action.action}</h5>
                              <Badge variant={getPriorityColor(action.priority)}>
                                {action.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-2">
                              {action.description}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="font-medium">Effort: </span>
                                <span className="text-muted-foreground">{action.effort}</span>
                              </div>
                              <div>
                                <span className="font-medium">Impact: </span>
                                <span className="text-muted-foreground">{action.impact}</span>
                              </div>
                            </div>
                            
                            {action.deadline && (
                              <div className="mt-2 text-xs">
                                <span className="font-medium">Deadline: </span>
                                <span className="text-muted-foreground">{action.deadline}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="analysis" className="space-y-4">
                  {/* Agent-specific analysis content would go here */}
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Detailed analysis view</p>
                    <p className="text-xs">Agent-specific analysis details coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No Agent Briefing Selected</h3>
                <p className="text-sm">
                  Select an agent briefing from the list or generate a new one to view details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}