"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Calendar,
  Filter,
  Target,
  Users,
  Activity,
  CheckCircle
} from 'lucide-react'
import { HolographicButton } from '@/components/ui/holographic-button'
import { HolographicCard } from '@/components/ui/holographic-card'
import { HolographicLoader } from '@/components/ui/holographic-loader'
import { useToast } from '@/hooks/use-toast'
import { logError, logInfo } from '@/lib/logger'

// Types
interface ReportField {
  id: string
  name: string
  type: 'metric' | 'dimension' | 'calculated'
  dataType: 'number' | 'string' | 'date' | 'boolean'
  category: string
  description: string
  formula?: string
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median'
}

interface ReportFilter {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in'
  value: string | number | boolean | Date
  value2?: string | number | boolean | Date // For 'between' operator
}

interface ReportVisualization {
  id: string
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'table' | 'kpi' | 'funnel'
  title: string
  description?: string
  xAxis?: string
  yAxis?: string
  groupBy?: string
  metrics: string[]
  filters: ReportFilter[]
  config: Record<string, unknown>
}

interface CustomReport {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  isPublic: boolean
  isTemplate: boolean
  visualizations: ReportVisualization[]
  globalFilters: ReportFilter[]
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
    time: string
    recipients: string[]
    format: 'pdf' | 'excel' | 'csv' | 'json'
  }
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// Available report fields
const REPORT_FIELDS: ReportField[] = [
  // User Metrics
  { id: 'total_users', name: 'Total Users', type: 'metric', dataType: 'number', category: 'Users', description: 'Total number of registered users', aggregation: 'count' },
  { id: 'active_users', name: 'Active Users', type: 'metric', dataType: 'number', category: 'Users', description: 'Users active in the last 30 days', aggregation: 'count' },
  { id: 'new_users', name: 'New Users', type: 'metric', dataType: 'number', category: 'Users', description: 'Users who signed up in the selected period', aggregation: 'count' },
  { id: 'retention_rate', name: 'Retention Rate', type: 'calculated', dataType: 'number', category: 'Users', description: 'Percentage of users who remain active', formula: '(active_users / total_users) * 100' },

  // Engagement Metrics
  { id: 'session_duration', name: 'Session Duration', type: 'metric', dataType: 'number', category: 'Engagement', description: 'Average time spent per session', aggregation: 'avg' },
  { id: 'page_views', name: 'Page Views', type: 'metric', dataType: 'number', category: 'Engagement', description: 'Total number of page views', aggregation: 'sum' },
  { id: 'bounce_rate', name: 'Bounce Rate', type: 'calculated', dataType: 'number', category: 'Engagement', description: 'Percentage of single-page sessions', formula: '(single_page_sessions / total_sessions) * 100' },

  // Business Metrics
  { id: 'revenue', name: 'Revenue', type: 'metric', dataType: 'number', category: 'Business', description: 'Total revenue generated', aggregation: 'sum' },
  { id: 'mrr', name: 'Monthly Recurring Revenue', type: 'metric', dataType: 'number', category: 'Business', description: 'Monthly recurring revenue', aggregation: 'sum' },
  { id: 'conversion_rate', name: 'Conversion Rate', type: 'calculated', dataType: 'number', category: 'Business', description: 'Percentage of users who convert', formula: '(converted_users / total_users) * 100' },

  // Feature Usage
  { id: 'ai_interactions', name: 'AI Interactions', type: 'metric', dataType: 'number', category: 'Features', description: 'Total AI agent interactions', aggregation: 'sum' },
  { id: 'goals_created', name: 'Goals Created', type: 'metric', dataType: 'number', category: 'Features', description: 'Number of goals created by users', aggregation: 'sum' },
  { id: 'tasks_completed', name: 'Tasks Completed', type: 'metric', dataType: 'number', category: 'Features', description: 'Number of tasks completed', aggregation: 'sum' },

  // Dimensions
  { id: 'user_id', name: 'User ID', type: 'dimension', dataType: 'string', category: 'Dimensions', description: 'Unique user identifier' },
  { id: 'date', name: 'Date', type: 'dimension', dataType: 'date', category: 'Dimensions', description: 'Event date' },
  { id: 'feature_name', name: 'Feature Name', type: 'dimension', dataType: 'string', category: 'Dimensions', description: 'Name of the feature used' },
  { id: 'user_segment', name: 'User Segment', type: 'dimension', dataType: 'string', category: 'Dimensions', description: 'User segmentation category' },
]

// Visualization types
const VISUALIZATION_TYPES = [
  { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories' },
  { id: 'line', name: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
  { id: 'pie', name: 'Pie Chart', icon: PieChart, description: 'Show proportions of a whole' },
  { id: 'area', name: 'Area Chart', icon: TrendingUp, description: 'Show cumulative values over time' },
  { id: 'scatter', name: 'Scatter Plot', icon: Target, description: 'Show relationships between variables' },
  { id: 'table', name: 'Data Table', icon: Activity, description: 'Display raw data in tabular format' },
  { id: 'kpi', name: 'KPI Card', icon: CheckCircle, description: 'Display key performance indicators' },
  { id: 'funnel', name: 'Funnel Chart', icon: Users, description: 'Show conversion through stages' },
]

interface CustomReportBuilderProps {
  onSave?: (report: CustomReport) => void
  onExport?: (report: CustomReport, format: string) => void
  initialReport?: CustomReport
  className?: string
}

export function CustomReportBuilder({
  onSave,
  onExport,
  initialReport,
  className = ""
}: CustomReportBuilderProps) {
  const [report, setReport] = useState<CustomReport>(initialReport || {
    id: crypto.randomUUID(),
    name: '',
    description: '',
    category: 'General',
    tags: [],
    isPublic: false,
    isTemplate: false,
    visualizations: [],
    globalFilters: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'current-user'
  })

  const [activeTab, setActiveTab] = useState<'design' | 'visualize' | 'schedule' | 'preview'>('design')
  const [selectedVisualization, setSelectedVisualization] = useState<ReportVisualization | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const { toast } = useToast()

  // Get available fields by category
  const fieldsByCategory = useMemo(() => {
    const grouped = REPORT_FIELDS.reduce((acc, field) => {
      if (!acc[field.category]) {
        acc[field.category] = []
      }
      acc[field.category].push(field)
      return acc
    }, {} as Record<string, ReportField[]>)
    return grouped
  }, [])

  // Add new visualization
  const addVisualization = useCallback(() => {
    const newViz: ReportVisualization = {
      id: crypto.randomUUID(),
      type: 'bar',
      title: 'New Chart',
      metrics: [],
      filters: [],
      config: {}
    }

    setReport(prev => ({
      ...prev,
      visualizations: [...prev.visualizations, newViz]
    }))

    setSelectedVisualization(newViz)
    setActiveTab('visualize')
  }, [])

  // Update visualization
  const updateVisualization = useCallback((vizId: string, updates: Partial<ReportVisualization>) => {
    setReport(prev => ({
      ...prev,
      visualizations: prev.visualizations.map(viz =>
        viz.id === vizId ? { ...viz, ...updates } : viz
      )
    }))

    if (selectedVisualization?.id === vizId) {
      setSelectedVisualization(prev => prev ? { ...prev, ...updates } : null)
    }
  }, [selectedVisualization])

  // Remove visualization
  const removeVisualization = useCallback((vizId: string) => {
    setReport(prev => ({
      ...prev,
      visualizations: prev.visualizations.filter(viz => viz.id !== vizId)
    }))

    if (selectedVisualization?.id === vizId) {
      setSelectedVisualization(null)
    }
  }, [selectedVisualization])

  // Add filter
  const addFilter = useCallback((visualizationId: string, isGlobal = false) => {
    const newFilter: ReportFilter = {
      id: crypto.randomUUID(),
      field: '',
      operator: 'equals',
      value: ''
    }

    if (isGlobal) {
      setReport(prev => ({
        ...prev,
        globalFilters: [...prev.globalFilters, newFilter]
      }))
    } else {
      updateVisualization(visualizationId, {
        filters: [...(selectedVisualization?.filters || []), newFilter]
      })
    }
  }, [selectedVisualization, updateVisualization])

  // Update filter
  const updateFilter = useCallback((filterId: string, updates: Partial<ReportFilter>, isGlobal = false) => {
    if (isGlobal) {
      setReport(prev => ({
        ...prev,
        globalFilters: prev.globalFilters.map(filter =>
          filter.id === filterId ? { ...filter, ...updates } : filter
        )
      }))
    } else if (selectedVisualization) {
      updateVisualization(selectedVisualization.id, {
        filters: selectedVisualization.filters.map(filter =>
          filter.id === filterId ? { ...filter, ...updates } : filter
        )
      })
    }
  }, [selectedVisualization, updateVisualization])

  // Remove filter
  const removeFilter = useCallback((filterId: string, isGlobal = false) => {
    if (isGlobal) {
      setReport(prev => ({
        ...prev,
        globalFilters: prev.globalFilters.filter(filter => filter.id !== filterId)
      }))
    } else if (selectedVisualization) {
      updateVisualization(selectedVisualization.id, {
        filters: selectedVisualization.filters.filter(filter => filter.id !== filterId)
      })
    }
  }, [selectedVisualization, updateVisualization])

  // Save report
  const handleSave = useCallback(async () => {
    if (!report.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Report name is required',
        variant: 'destructive'
      })
      return
    }

    setIsSaving(true)
    try {
      const updatedReport = {
        ...report,
        updatedAt: new Date()
      }

      setReport(updatedReport)
      onSave?.(updatedReport)

      toast({
        title: 'Report Saved',
        description: 'Your custom report has been saved successfully',
        variant: 'success'
      })

      logInfo('Custom report saved:', { reportId: updatedReport.id, name: updatedReport.name })
    } catch (error) {
      logError('Failed to save report:', error)
      toast({
        title: 'Save Failed',
        description: 'Failed to save the report. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }, [report, onSave, toast])

  // Export report
  const handleExport = useCallback(async (format: string) => {
    setIsExporting(true)
    try {
      onExport?.(report, format)

      toast({
        title: 'Export Started',
        description: `Exporting report as ${format.toUpperCase()}...`,
        variant: 'success'
      })

      logInfo('Report export initiated:', { reportId: report.id, format })
    } catch (error) {
      logError('Failed to export report:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export the report. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsExporting(false)
    }
  }, [report, onExport, toast])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold boss-heading">Custom Report Builder</h2>
          <p className="text-gray-600">Create powerful analytics reports with drag-and-drop visualization</p>
        </div>
        <div className="flex items-center gap-2">
          <HolographicButton
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </HolographicButton>
          <HolographicButton
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <HolographicLoader size="sm" text="Saving..." />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Report
              </>
            )}
          </HolographicButton>
        </div>
      </div>

      {/* Report Configuration */}
      <HolographicCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="report-name">Report Name</Label>
            <Input
              id="report-name"
              value={report.name}
              onChange={(e) => setReport(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter report name..."
              className="holographic-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="report-category">Category</Label>
            <Select
              value={report.category}
              onValueChange={(value) => setReport(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="holographic-input">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Users">Users</SelectItem>
                <SelectItem value="Engagement">Engagement</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Features">Features</SelectItem>
                <SelectItem value="Performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="report-description">Description</Label>
            <Textarea
              id="report-description"
              value={report.description}
              onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this report shows..."
              className="holographic-input"
              rows={3}
            />
          </div>
        </div>
      </HolographicCard>

      {/* Main Builder Interface */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'design' | 'visualize' | 'schedule' | 'preview')}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="visualize" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visualize
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Fields */}
            <HolographicCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Available Fields
                </CardTitle>
                <CardDescription>
                  Drag fields to create visualizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {Object.entries(fieldsByCategory).map(([category, fields]) => (
                    <div key={category} className="mb-4">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">{category}</h4>
                      <div className="space-y-1">
                        {fields.map(field => (
                          <div
                            key={field.id}
                            className="p-2 bg-gray-50 rounded-md cursor-move hover:bg-gray-100 transition-colors"
                            draggable
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{field.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {field.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{field.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </HolographicCard>

            {/* Global Filters */}
            <HolographicCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Global Filters
                </CardTitle>
                <CardDescription>
                  Apply filters to all visualizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.globalFilters.map(filter => (
                    <div key={filter.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                      <Select
                        value={filter.field}
                        onValueChange={(value) => updateFilter(filter.id, { field: value }, true)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          {REPORT_FIELDS.map(field => (
                            <SelectItem key={field.id} value={field.id}>
                              {field.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={filter.operator}
                        onValueChange={(value) => updateFilter(filter.id, { operator: value as ReportFilter['operator'] }, true)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="not_contains">Not Contains</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                          <SelectItem value="between">Between</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, { value: e.target.value }, true)}
                        placeholder="Value..."
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter(filter.id, true)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addFilter('', true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Global Filter
                  </Button>
                </div>
              </CardContent>
            </HolographicCard>
          </div>
        </TabsContent>

        {/* Visualize Tab */}
        <TabsContent value="visualize" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Visualizations</h3>
            <HolographicButton onClick={addVisualization}>
              <Plus className="h-4 w-4 mr-2" />
              Add Visualization
            </HolographicButton>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visualization List */}
            <div className="space-y-4">
              {report.visualizations.map(viz => (
                <HolographicCard
                  key={viz.id}
                  className={`cursor-pointer transition-all ${selectedVisualization?.id === viz.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                  onClick={() => setSelectedVisualization(viz)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {VISUALIZATION_TYPES.find(t => t.id === viz.type)?.icon && (
                          React.createElement(VISUALIZATION_TYPES.find(t => t.id === viz.type)!.icon, {
                            className: "h-5 w-5 text-purple-500"
                          })
                        )}
                        <div>
                          <h4 className="font-semibold">{viz.title}</h4>
                          <p className="text-sm text-gray-500">
                            {VISUALIZATION_TYPES.find(t => t.id === viz.type)?.name}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeVisualization(viz.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </HolographicCard>
              ))}
            </div>

            {/* Visualization Editor */}
            {selectedVisualization && (
              <HolographicCard>
                <CardHeader>
                  <CardTitle>Edit Visualization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={selectedVisualization.title}
                      onChange={(e) => updateVisualization(selectedVisualization.id, { title: e.target.value })}
                      placeholder="Enter visualization title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={selectedVisualization.type}
                      onValueChange={(value) => updateVisualization(selectedVisualization.id, { type: value as ReportVisualization['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VISUALIZATION_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Metrics</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (!selectedVisualization.metrics.includes(value)) {
                          updateVisualization(selectedVisualization.id, {
                            metrics: [...selectedVisualization.metrics, value]
                          })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add metric..." />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_FIELDS.filter(f => f.type === 'metric').map(field => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedVisualization.metrics.map(metric => (
                        <Badge key={metric} variant="secondary" className="flex items-center gap-1">
                          {REPORT_FIELDS.find(f => f.id === metric)?.name}
                          <button
                            onClick={() => updateVisualization(selectedVisualization.id, {
                              metrics: selectedVisualization.metrics.filter(m => m !== metric)
                            })}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Filters</Label>
                    <div className="space-y-2">
                      {selectedVisualization.filters.map(filter => (
                        <div key={filter.id} className="flex items-center gap-2">
                          <Select
                            value={filter.field}
                            onValueChange={(value) => updateFilter(filter.id, { field: value })}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Field..." />
                            </SelectTrigger>
                            <SelectContent>
                              {REPORT_FIELDS.map(field => (
                                <SelectItem key={field.id} value={field.id}>
                                  {field.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={filter.operator}
                            onValueChange={(value) => updateFilter(filter.id, { operator: value as ReportFilter['operator'] })}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">=</SelectItem>
                              <SelectItem value="not_equals">≠</SelectItem>
                              <SelectItem value="contains">⊃</SelectItem>
                              <SelectItem value="greater_than">&gt;</SelectItem>
                              <SelectItem value="less_than">&lt;</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={filter.value}
                            onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                            placeholder="Value..."
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFilter(filter.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => addFilter(selectedVisualization.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Filter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </HolographicCard>
            )}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <HolographicCard>
            <CardHeader>
              <CardTitle>Automated Reporting</CardTitle>
              <CardDescription>
                Schedule automatic report generation and delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable-schedule"
                  checked={!!report.schedule}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setReport(prev => ({
                        ...prev,
                        schedule: {
                          frequency: 'weekly',
                          time: '09:00',
                          recipients: [],
                          format: 'pdf'
                        }
                      }))
                    } else {
                      setReport(prev => ({ ...prev, schedule: undefined }))
                    }
                  }}
                />
                <Label htmlFor="enable-schedule">Enable automated reporting</Label>
              </div>

              {report.schedule && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={report.schedule.frequency}
                      onValueChange={(value) => setReport(prev => ({
                        ...prev,
                        schedule: prev.schedule ? { ...prev.schedule, frequency: value as any } : undefined
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={report.schedule.time}
                      onChange={(e) => setReport(prev => ({
                        ...prev,
                        schedule: prev.schedule ? { ...prev.schedule, time: e.target.value } : undefined
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select
                      value={report.schedule.format}
                      onValueChange={(value) => setReport(prev => ({
                        ...prev,
                        schedule: prev.schedule ? { ...prev.schedule, format: value as any } : undefined
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Recipients (Email addresses)</Label>
                    <Textarea
                      value={report.schedule.recipients.join(', ')}
                      onChange={(e) => setReport(prev => ({
                        ...prev,
                        schedule: prev.schedule ? {
                          ...prev.schedule,
                          recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                        } : undefined
                      }))}
                      placeholder="Enter email addresses separated by commas..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </HolographicCard>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report Preview</h3>
            <p className="text-gray-500 mb-4">
              Preview your report with sample data
            </p>
            <HolographicButton onClick={() => setIsPreviewOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Open Preview
            </HolographicButton>
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Export as:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
            disabled={isExporting}
          >
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            CSV
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="is-public"
            checked={report.isPublic}
            onCheckedChange={(checked) => setReport(prev => ({ ...prev, isPublic: !!checked }))}
          />
          <Label htmlFor="is-public" className="text-sm">Make public</Label>

          <Checkbox
            id="is-template"
            checked={report.isTemplate}
            onCheckedChange={(checked) => setReport(prev => ({ ...prev, isTemplate: !!checked }))}
          />
          <Label htmlFor="is-template" className="text-sm">Save as template</Label>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>
              Preview of your custom report with sample data
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-6">
              {report.visualizations.map(viz => (
                <HolographicCard key={viz.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{viz.title}</h3>
                    <Badge variant="secondary">
                      {VISUALIZATION_TYPES.find(t => t.id === viz.type)?.name}
                    </Badge>
                  </div>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart preview would appear here</p>
                      <p className="text-sm text-gray-400">
                        Metrics: {viz.metrics.length}, Filters: {viz.filters.length}
                      </p>
                    </div>
                  </div>
                </HolographicCard>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

