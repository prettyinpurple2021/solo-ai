'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useIntelligenceBriefings } from '@/hooks/use-intelligence-briefings'
import { IntelligenceBriefing } from '@/lib/intelligence-briefing-system'
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'

interface BriefingDashboardProps {
  competitorIds?: string[]
}

export function BriefingDashboard({ competitorIds }: BriefingDashboardProps) {
  const {
    briefings,
    currentBriefing,
    isGenerating,
    error,
    generateDailyBriefing,
    generateWeeklyBriefing,
    generateMonthlyReport,
    getBriefingHistory,
    clearError
  } = useIntelligenceBriefings()
  
  const [selectedBriefing, setSelectedBriefing] = useState<IntelligenceBriefing | null>(null)
  
  useEffect(() => {
    getBriefingHistory()
  }, [getBriefingHistory])
  
  useEffect(() => {
    if (currentBriefing) {
      setSelectedBriefing(currentBriefing)
    }
  }, [currentBriefing])
  
  const handleGenerateBriefing = async (type: 'daily' | 'weekly' | 'monthly') => {
    clearError()
    
    switch (type) {
      case 'daily':
        await generateDailyBriefing(competitorIds)
        break
      case 'weekly':
        await generateWeeklyBriefing(competitorIds)
        break
      case 'monthly':
        await generateMonthlyReport(competitorIds)
        break
    }
  }
  
  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Intelligence Briefings</h2>
          <p className="text-muted-foreground">
            AI-powered competitive intelligence reports and analysis
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => getBriefingHistory()}
            disabled={isGenerating}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Briefing</CardTitle>
          <CardDescription>
            Create intelligence briefings for different time periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleGenerateBriefing('daily')}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Daily Briefing
            </Button>
            
            <Button
              onClick={() => handleGenerateBriefing('weekly')}
              disabled={isGenerating}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4" />
              )}
              Weekly Strategic
            </Button>
            
            <Button
              onClick={() => handleGenerateBriefing('monthly')}
              disabled={isGenerating}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Monthly Report
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Briefing List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Briefings</CardTitle>
            <CardDescription>
              {briefings.length} briefings available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {briefings.map((briefing) => (
                  <div
                    key={briefing.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedBriefing?.id === briefing.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedBriefing(briefing)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {briefing.briefingType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(briefing.generatedAt), 'MMM dd')}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">
                      {briefing.title}
                    </h4>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {briefing.summary}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${getThreatLevelColor(briefing.threatAssessment.overallThreatLevel)}`} />
                      <span className="text-xs text-muted-foreground">
                        {briefing.threatAssessment.overallThreatLevel} threat
                      </span>
                    </div>
                  </div>
                ))}
                
                {briefings.length === 0 && !isGenerating && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No briefings yet</p>
                    <p className="text-xs">Generate your first briefing to get started</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Briefing Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedBriefing ? selectedBriefing.title : 'Select a Briefing'}
            </CardTitle>
            {selectedBriefing && (
              <CardDescription>
                Generated on {format(new Date(selectedBriefing.generatedAt), 'PPP')} • 
                {selectedBriefing.briefingType} briefing
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedBriefing ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="competitors">Competitors</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                  <TabsTrigger value="threats">Threats</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Executive Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedBriefing.summary}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-3">Key Insights</h4>
                    <div className="space-y-2">
                      {selectedBriefing.keyInsights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 mt-0.5 text-primary" />
                          <span className="text-sm">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedBriefing.trendAnalysis.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-3">Market Trends</h4>
                        <div className="space-y-3">
                          {selectedBriefing.trendAnalysis.map((trend, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-sm">{trend.trend}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(trend.confidence * 100)}% confidence
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {trend.description}
                              </p>
                              <div className="space-y-1">
                                {trend.implications.map((implication, idx) => (
                                  <div key={idx} className="text-xs text-muted-foreground">
                                    • {implication}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="competitors" className="space-y-4">
                  <div className="space-y-4">
                    {selectedBriefing.competitorUpdates.map((competitor) => (
                      <div key={competitor.competitorId} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-3">{competitor.competitorName}</h4>
                        
                        {competitor.updates.length > 0 ? (
                          <div className="space-y-2">
                            {competitor.updates.map((update, index) => (
                              <div key={index} className="flex items-start gap-3 p-2 bg-muted/30 rounded">
                                <Badge variant="outline" className="text-xs">
                                  {update.type}
                                </Badge>
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">{update.title}</h5>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {update.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge 
                                      variant={getPriorityColor(update.impact)}
                                      className="text-xs"
                                    >
                                      {update.impact} impact
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {update.source}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No updates in this period
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="actions" className="space-y-4">
                  <div className="space-y-3">
                    {selectedBriefing.actionItems.map((action, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{action.title}</h4>
                          <Badge variant={getPriorityColor(action.priority)}>
                            {action.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {action.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Effort: </span>
                            <span className="text-muted-foreground">{action.estimatedEffort}</span>
                          </div>
                          <div>
                            <span className="font-medium">Impact: </span>
                            <span className="text-muted-foreground">{action.potentialImpact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {selectedBriefing.opportunities.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Opportunities
                          </h4>
                          <div className="space-y-3">
                            {selectedBriefing.opportunities.map((opportunity, index) => (
                              <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-sm">{opportunity.title}</h5>
                                  <Badge variant="outline" className="text-xs">
                                    {opportunity.priority} priority
                                  </Badge>
                                </div>
                                
                                <p className="text-xs text-muted-foreground mb-2">
                                  {opportunity.description}
                                </p>
                                
                                <div className="text-xs">
                                  <span className="font-medium">Timeframe: </span>
                                  <span className="text-muted-foreground">{opportunity.timeframe}</span>
                                </div>
                                
                                <div className="mt-2">
                                  <span className="font-medium text-xs">Required Actions:</span>
                                  <ul className="mt-1 space-y-1">
                                    {opportunity.requiredActions.map((action, idx) => (
                                      <li key={idx} className="text-xs text-muted-foreground">
                                        • {action}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="threats" className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${getThreatLevelColor(selectedBriefing.threatAssessment.overallThreatLevel)}`} />
                      <h4 className="font-medium">
                        Overall Threat Level: {selectedBriefing.threatAssessment.overallThreatLevel.toUpperCase()}
                      </h4>
                    </div>
                  </div>
                  
                  {selectedBriefing.threatAssessment.emergingThreats.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Emerging Threats
                      </h4>
                      <div className="space-y-3">
                        {selectedBriefing.threatAssessment.emergingThreats.map((threat, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-sm">{threat.threat}</h5>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getThreatLevelColor(threat.severity)}`} />
                                <Badge variant="outline" className="text-xs">
                                  {threat.severity}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Timeframe: </span>
                              {threat.timeframe}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedBriefing.threatAssessment.marketChanges.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Market Changes</h4>
                      <div className="space-y-2">
                        {selectedBriefing.threatAssessment.marketChanges.map((change, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 mt-0.5 text-orange-500" />
                            <span className="text-sm">{change}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No Briefing Selected</h3>
                <p className="text-sm">
                  Select a briefing from the list or generate a new one to view details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}