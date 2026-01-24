"use client"

import React, { useState } from 'react'
import { logError } from '@/lib/logger'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Table, 
  Trash2, 
  Eye,
  Save,
  Zap,
  Target,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReportMetric {
  id: string
  name: string
  type: 'number' | 'percentage' | 'currency' | 'duration'
  category: 'user' | 'engagement' | 'productivity' | 'business' | 'performance'
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface ReportFilter {
  id: string
  field: string
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'contains'
  value: string | number | [number, number]
  label: string
}

interface ReportVisualization {
  id: string
  type: 'bar' | 'line' | 'pie' | 'table' | 'metric'
  title: string
  metrics: string[]
  filters: string[]
  config: {
    color?: string
    showLegend?: boolean
    showGrid?: boolean
    stacked?: boolean
  }
}

interface CustomReport {
  id: string
  name: string
  description: string
  timeframe: {
    start: string
    end: string
    granularity: 'day' | 'week' | 'month' | 'quarter' | 'year'
  }
  metrics: string[]
  filters: ReportFilter[]
  visualizations: ReportVisualization[]
  schedule?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

interface CustomReportBuilderEnhancedProps {
  className?: string
  onSave?: (report: CustomReport) => void
  onExport?: (report: CustomReport, format: 'csv' | 'pdf' | 'excel') => void
}

export default function CustomReportBuilderEnhanced({ 
  className = "",
  onSave,
  onExport
}: CustomReportBuilderEnhancedProps) {
  const [report, setReport] = useState<Partial<CustomReport>>({
    name: '',
    description: '',
    timeframe: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      granularity: 'day'
    },
    metrics: [],
    filters: [],
    visualizations: []
  })

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [selectedVisualizations, setSelectedVisualizations] = useState<ReportVisualization[]>([])
  const [previewData, setPreviewData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Available metrics
  const availableMetrics: ReportMetric[] = [
    {
      id: 'user_count',
      name: 'Total Users',
      type: 'number',
      category: 'user',
      description: 'Total number of registered users',
      icon: Users
    },
    {
      id: 'active_users',
      name: 'Active Users',
      type: 'number',
      category: 'user',
      description: 'Users active in the selected timeframe',
      icon: Users
    },
    {
      id: 'engagement_rate',
      name: 'Engagement Rate',
      type: 'percentage',
      category: 'engagement',
      description: 'Percentage of users who are actively engaged',
      icon: TrendingUp
    },
    {
      id: 'task_completion_rate',
      name: 'Task Completion Rate',
      type: 'percentage',
      category: 'productivity',
      description: 'Percentage of tasks completed successfully',
      icon: Target
    },
    {
      id: 'avg_session_duration',
      name: 'Average Session Duration',
      type: 'duration',
      category: 'engagement',
      description: 'Average time users spend in sessions',
      icon: Clock
    },
    {
      id: 'revenue',
      name: 'Revenue',
      type: 'currency',
      category: 'business',
      description: 'Total revenue generated',
      icon: TrendingUp
    },
    {
      id: 'churn_rate',
      name: 'Churn Rate',
      type: 'percentage',
      category: 'business',
      description: 'Percentage of users who stopped using the service',
      icon: TrendingUp
    },
    {
      id: 'feature_adoption',
      name: 'Feature Adoption',
      type: 'percentage',
      category: 'engagement',
      description: 'Percentage of users using specific features',
      icon: Zap
    }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'user': return <Users className="w-4 h-4" />
      case 'engagement': return <TrendingUp className="w-4 h-4" />
      case 'productivity': return <Target className="w-4 h-4" />
      case 'business': return <BarChart3 className="w-4 h-4" />
      case 'performance': return <Clock className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'engagement': return 'bg-green-100 text-green-700 border-green-200'
      case 'productivity': return 'bg-neon-purple/10 text-neon-purple border-neon-purple/50'
      case 'business': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'performance': return 'bg-pink-100 text-pink-700 border-pink-200'
      default: return 'bg-dark-card text-gray-300 border-gray-700'
    }
  }

  const addMetric = (metricId: string) => {
    if (!selectedMetrics.includes(metricId)) {
      setSelectedMetrics([...selectedMetrics, metricId])
    }
  }

  const removeMetric = (metricId: string) => {
    setSelectedMetrics(selectedMetrics.filter(id => id !== metricId))
  }

  const addVisualization = (type: 'bar' | 'line' | 'pie' | 'table' | 'metric') => {
    const newViz: ReportVisualization = {
      id: `viz_${Date.now()}`,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
      metrics: selectedMetrics,
      filters: report.filters!.map(f => f.id),
      config: {
        color: '#8B5CF6',
        showLegend: true,
        showGrid: true,
        stacked: false
      }
    }
    setSelectedVisualizations([...selectedVisualizations, newViz])
  }

  const removeVisualization = (vizId: string) => {
    setSelectedVisualizations(selectedVisualizations.filter(viz => viz.id !== vizId))
  }

  const generatePreview = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: selectedMetrics,
          timeframe: report.timeframe,
          visualizations: selectedVisualizations // ensuring API has context if needed later
        })
      });

      if (!response.ok) throw new Error('Failed to generate preview');

      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      logError('Error generating preview:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveReport = () => {
    if (!report.name) {
      alert('Please enter a report name')
      return
    }

    const finalReport: CustomReport = {
      id: `report_${Date.now()}`,
      name: report.name!,
      description: report.description || '',
      timeframe: report.timeframe!,
      metrics: selectedMetrics,
      filters: report.filters!,
      visualizations: selectedVisualizations,
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave?.(finalReport)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-sm flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Custom Report Builder</h2>
            <p className="text-gray-600">Create personalized analytics reports</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={generatePreview} disabled={loading}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={saveReport}>
            <Save className="w-4 h-4 mr-2" />
            Save Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>
                Configure the basic settings for your custom report
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input
                    id="report-name"
                    placeholder="Enter report name"
                    value={report.name}
                    onChange={(e) => setReport({ ...report, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="report-description">Description</Label>
                  <Input
                    id="report-description"
                    placeholder="Enter report description"
                    value={report.description}
                    onChange={(e) => setReport({ ...report, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={report.timeframe?.start}
                    onChange={(e) => setReport({
                      ...report,
                      timeframe: { ...report.timeframe!, start: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={report.timeframe?.end}
                    onChange={(e) => setReport({
                      ...report,
                      timeframe: { ...report.timeframe!, end: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="granularity">Granularity</Label>
                  <Select
                    value={report.timeframe?.granularity}
                    onValueChange={(value) => setReport({
                      ...report,
                      timeframe: { ...report.timeframe!, granularity: value as any }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select granularity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="quarter">Quarterly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Available Metrics</CardTitle>
                <CardDescription>
                  Select metrics to include in your report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-sm cursor-pointer transition-colors",
                      selectedMetrics.includes(metric.id) 
                        ? "border-neon-purple bg-neon-purple/10" 
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => selectedMetrics.includes(metric.id) ? removeMetric(metric.id) : addMetric(metric.id)}
                  >
                    <div className="flex items-center gap-3">
                      <metric.icon className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{metric.name}</p>
                        <p className="text-sm text-gray-600">{metric.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(metric.category)}>
                        {getCategoryIcon(metric.category)}
                        <span className="ml-1">{metric.category}</span>
                      </Badge>
                      <Checkbox
                        checked={selectedMetrics.includes(metric.id)}
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Metrics ({selectedMetrics.length})</CardTitle>
                <CardDescription>
                  Metrics that will be included in your report
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMetrics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No metrics selected</p>
                    <p className="text-sm">Select metrics from the left panel</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedMetrics.map((metricId) => {
                      const metric = availableMetrics.find(m => m.id === metricId)
                      if (!metric) return null
                      
                      return (
                        <div key={metricId} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <metric.icon className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{metric.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMetric(metricId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visualizations Tab */}
        <TabsContent value="visualizations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visualization Types */}
            <Card>
              <CardHeader>
                <CardTitle>Add Visualizations</CardTitle>
                <CardDescription>
                  Choose how to display your data
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[
                  { type: 'bar' as const, label: 'Bar Chart', icon: BarChart3 },
                  { type: 'line' as const, label: 'Line Chart', icon: LineChart },
                  { type: 'pie' as const, label: 'Pie Chart', icon: PieChart },
                  { type: 'table' as const, label: 'Table', icon: Table },
                  { type: 'metric' as const, label: 'Metric Cards', icon: Target }
                ].map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => addVisualization(type)}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm">{label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Selected Visualizations */}
            <Card>
              <CardHeader>
                <CardTitle>Report Visualizations ({selectedVisualizations.length})</CardTitle>
                <CardDescription>
                  Visualizations in your report
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedVisualizations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No visualizations added</p>
                    <p className="text-sm">Add visualizations from the left panel</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedVisualizations.map((viz) => (
                      <div key={viz.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          {viz.type === 'bar' && <BarChart3 className="w-4 h-4 text-blue-500" />}
                          {viz.type === 'line' && <LineChart className="w-4 h-4 text-green-500" />}
                          {viz.type === 'pie' && <PieChart className="w-4 h-4 text-purple-500" />}
                          {viz.type === 'table' && <Table className="w-4 h-4 text-orange-500" />}
                          {viz.type === 'metric' && <Target className="w-4 h-4 text-pink-500" />}
                          <div>
                            <p className="font-medium">{viz.title}</p>
                            <p className="text-sm text-gray-600">{viz.metrics.length} metrics</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVisualization(viz.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Generating preview...</p>
            </div>
          ) : previewData ? (
            <div className="space-y-6">
              {/* Metrics Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Metrics Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {previewData.metrics.map((metric: any) => (
                      <div key={metric.id} className="text-center p-4 border rounded-sm">
                        <p className="text-sm text-gray-600">{metric.name}</p>
                        <p className="text-2xl font-bold text-purple-600">{metric.value}</p>
                        <p className={cn(
                          "text-sm",
                          metric.changePercent > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {metric.changePercent > 0 ? '+' : ''}{metric.changePercent}%
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chart Previews */}
              {previewData.charts.map((chart: any) => (
                <Card key={chart.id}>
                  <CardHeader>
                    <CardTitle className="capitalize">{chart.type} Chart</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-dark-card rounded-sm flex items-center justify-center">
                      <p className="text-gray-500">Chart preview will be rendered here</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No preview available</p>
              <p className="text-sm text-gray-500">Configure your report and click Preview</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
