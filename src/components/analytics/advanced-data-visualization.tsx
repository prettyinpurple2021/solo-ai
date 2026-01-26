"use client"
// @ts-nocheck

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  TrendingUp,
  Activity,
  Target,
  Users,
  Zap,
  Sparkles,
  Download,
  RefreshCw,
  Maximize2,
  Minimize2,
  Square
} from 'lucide-react'
import { PrimaryButton } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'

import { useToast } from '@/hooks/use-toast'
import { logError, logInfo } from '@/lib/logger'

// Types
interface DataPoint {
  x: string | number
  y: number
  label?: string
  color?: string
  metadata?: Record<string, unknown>
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'funnel' | 'gauge' | 'heatmap' | 'treemap' | 'sankey'
  title: string
  description?: string
  xAxis?: {
    field: string
    label: string
    type: 'category' | 'number' | 'date'
  }
  yAxis?: {
    field: string
    label: string
    type: 'number' | 'percentage'
  }
  colorScheme: 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'pink' | 'indigo' | 'teal'
  animation: boolean
  interactive: boolean
  showLegend: boolean
  showGrid: boolean
  showTooltip: boolean
  responsive: boolean
  height?: number
  width?: number
}

interface VisualizationData {
  id: string
  config: ChartConfig
  data: DataPoint[]
  filters: Record<string, unknown>
  metadata: {
    lastUpdated: Date
    dataSource: string
    recordCount: number
    processingTime: number
  }
}

interface AdvancedDataVisualizationProps {
  data?: VisualizationData[]
  onDataUpdate?: (data: VisualizationData[]) => void
  onExport?: (format: string, data: VisualizationData[]) => void
  className?: string
}

// Color schemes
const COLOR_SCHEMES = {
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
  blue: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
  green: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
  orange: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
  red: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],
  pink: ['#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8', '#FCE7F3'],
  indigo: ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'],
  teal: ['#14B8A6', '#5EEAD4', '#99F6E4', '#CCFBF1', '#F0FDFA']
}

// Chart type configurations
const CHART_TYPES = [
  { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Compare values across categories' },
  { id: 'line', name: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
  { id: 'pie', name: 'Pie Chart', icon: PieChart, description: 'Show proportions of a whole' },
  { id: 'area', name: 'Area Chart', icon: TrendingUp, description: 'Show cumulative values over time' },
  { id: 'scatter', name: 'Scatter Plot', icon: Target, description: 'Show relationships between variables' },
  { id: 'funnel', name: 'Funnel Chart', icon: Users, description: 'Show conversion through stages' },
  { id: 'gauge', name: 'Gauge Chart', icon: Activity, description: 'Show progress towards a goal' },
  { id: 'heatmap', name: 'Heatmap', icon: Activity, description: 'Show data density and patterns' },
  { id: 'treemap', name: 'Treemap', icon: Target, description: 'Show hierarchical data' },
  { id: 'sankey', name: 'Sankey Diagram', icon: TrendingUp, description: 'Show flow between entities' }
]

// Data fetcher
const fetchChartData = async (metric: string): Promise<DataPoint[]> => {
  try {
    const response = await fetch('/api/analytics/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metric }),
    });
    
    if (!response.ok) throw new Error('Failed to fetch data');
    
    const data = await response.json();
    
    // Transform API response to DataPoint[]
    // Assuming API returns { history: [{ name: 'Mon', value: 10 }] }
    return data.history.map((item: any) => ({
      x: item.name,
      y: item.value,
      label: item.name,
    }));
  } catch (error) {
    logError('Error fetching chart data', error instanceof Error ? error : new Error(String(error)));
    return [];
  }
}

export function AdvancedDataVisualization({ 
  data = [], 
  onDataUpdate, 
  onExport, 
  className = "" 
}: AdvancedDataVisualizationProps) {
  const [visualizations, setVisualizations] = useState<VisualizationData[]>(data)
  const [selectedViz, setSelectedViz] = useState<VisualizationData | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState<'charts' | 'dashboards' | 'templates'>('charts')
  
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Create new visualization
  const createVisualization = useCallback((type: string) => {
    // Initial empty state, will load data on mount/refresh
    const newViz: VisualizationData = {
      id: crypto.randomUUID(),
      config: {
        type: type as ChartConfig['type'],
        title: `New ${CHART_TYPES.find(t => t.id === type)?.name || 'Chart'}`,
        xAxis: { field: 'x', label: 'X Axis', type: 'category' },
        yAxis: { field: 'y', label: 'Y Axis', type: 'number' },
        colorScheme: 'purple',
        animation: true,
        interactive: true,
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        responsive: true
      },
      data: [], // Starts empty
      filters: {},
      metadata: {
        lastUpdated: new Date(),
        dataSource: 'api',
        recordCount: 0,
        processingTime: 0
      }
    }
    
    setVisualizations((prev: VisualizationData[]) => [...prev, newViz])
    setSelectedViz(newViz)
    setIsCreating(false)
    
    // Trigger initial fetch
    refreshData(newViz.id)
    
    toast({
      title: 'Visualization Created',
      description: `New ${CHART_TYPES.find(t => t.id === type)?.name} has been created`,
      variant: 'default'
    })
    
    logInfo('New visualization created:', { type, id: newViz.id })
  }, [toast])

  // Update visualization
  const updateVisualization = useCallback((id: string, updates: Partial<VisualizationData>) => {
    setVisualizations((prev: VisualizationData[]) => prev.map((viz: VisualizationData) => 
      viz.id === id ? { ...viz, ...updates, metadata: { ...viz.metadata, lastUpdated: new Date() } } : viz
    ))
    
    if (selectedViz?.id === id) {
      setSelectedViz((prev: VisualizationData | null) => prev ? { ...prev, ...updates, metadata: { ...prev.metadata, lastUpdated: new Date() } } : null)
    }
    
    onDataUpdate?.(visualizations)
  }, [selectedViz, visualizations, onDataUpdate])

  // Delete visualization
  const deleteVisualization = useCallback((id: string) => {
    setVisualizations((prev: VisualizationData[]) => prev.filter((viz: VisualizationData) => viz.id !== id))
    
    if (selectedViz?.id === id) {
      setSelectedViz(null)
    }
    
    toast({
      title: 'Visualization Deleted',
      description: 'The visualization has been removed',
      variant: 'success'
    })
  }, [selectedViz, toast])

  // Refresh data
  const refreshData = useCallback(async (id: string) => {
    const viz = visualizations.find((v: VisualizationData) => v.id === id)
    if (!viz) return
    
    setIsAnimating(true)
    
    try {
      const startTime = Date.now()
      // Default metric initialization (configurable via viz props)
      let metricValue = 0;
      const newData = await fetchChartData('total_actions');
      
      updateVisualization(id, { 
        data: newData,
        metadata: {
          ...viz.metadata,
          lastUpdated: new Date(),
          recordCount: newData.length,
          processingTime: Date.now() - startTime
        }
      })
      
      toast({
        title: 'Data Refreshed',
        description: 'Visualization data has been updated from live data',
        variant: 'default'
      })
    } catch (error) {
      logError('Failed to refresh data:', error as Error)
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh visualization data',
        variant: 'destructive'
      })
    } finally {
      setIsAnimating(false)
    }
  }, [visualizations, updateVisualization, toast])

  // Export visualization
  const exportVisualization = useCallback((id: string, format: string) => {
    const viz = visualizations.find((v: VisualizationData) => v.id === id)
    if (!viz) return
    
    onExport?.(format, [viz])
    
    toast({
      title: 'Export Started',
      description: `Exporting visualization as ${format.toUpperCase()}...`,
      variant: 'success'
    })
  }, [visualizations, onExport, toast])

  // Render chart (simplified canvas-based rendering)
  const renderChart = useCallback((viz: VisualizationData) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)
    
    // Set up colors
    const colors = COLOR_SCHEMES[viz.config.colorScheme]
    
    // Draw chart based on type
    switch (viz.config.type) {
      case 'bar':
        const barWidth = width / viz.data.length * 0.8
        const maxValue = Math.max(...viz.data.map(d => d.y))
        
        viz.data.forEach((point, i) => {
          const barHeight = (point.y / maxValue) * height * 0.8
          const x = (i * width / viz.data.length) + (width / viz.data.length - barWidth) / 2
          const y = height - barHeight - 20
          
          ctx.fillStyle = colors[i % colors.length]
          ctx.fillRect(x, y, barWidth, barHeight)
        })
        break
        
      case 'line':
        ctx.strokeStyle = colors[0]
        ctx.lineWidth = 3
        ctx.beginPath()
        
        viz.data.forEach((point, i) => {
          const x = (i / (viz.data.length - 1)) * width
          const y = height - (point.y / Math.max(...viz.data.map(d => d.y))) * height * 0.8 - 20
          
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()
        break
        
      case 'pie':
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(width, height) / 2 - 20
        const total = viz.data.reduce((sum, point) => sum + point.y, 0)
        
        let currentAngle = 0
        
        viz.data.forEach((point, i) => {
          const sliceAngle = (point.y / total) * 2 * Math.PI
          
          ctx.fillStyle = colors[i % colors.length]
          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
          ctx.closePath()
          ctx.fill()
          
          currentAngle += sliceAngle
        })
        break
        
      default:
        // Fallback: draw simple bars
        const fallbackBarWidth = width / viz.data.length * 0.8
        const fallbackMaxValue = Math.max(...viz.data.map(d => d.y))
        
        viz.data.forEach((point, i) => {
          const barHeight = (point.y / fallbackMaxValue) * height * 0.8
          const x = (i * width / viz.data.length) + (width / viz.data.length - fallbackBarWidth) / 2
          const y = height - barHeight - 20
          
          ctx.fillStyle = colors[i % colors.length]
          ctx.fillRect(x, y, fallbackBarWidth, barHeight)
        })
    }
  }, [])

  // Auto-refresh effect
  useEffect(() => {
    if (selectedViz && canvasRef.current) {
      renderChart(selectedViz)
    }
  }, [selectedViz, renderChart])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold boss-heading">Advanced Data Visualization</h2>
          <p className="text-gray-600">Create interactive charts and dashboards with real-time data</p>
        </div>
        <div className="flex items-center gap-2">
          <PrimaryButton
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </PrimaryButton>
          <PrimaryButton
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            New Chart
          </PrimaryButton>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'charts' | 'dashboards' | 'templates')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="dashboards" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboards
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Charts</h3>
                <Badge variant="purple">{visualizations.length}</Badge>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {visualizations.map((viz: VisualizationData) => (
                    <div
                      key={viz.id}
                      className={`cursor-pointer transition-all ${
                        selectedViz?.id === viz.id ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => setSelectedViz(viz)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {CHART_TYPES.find(t => t.id === viz.config.type)?.icon && (
                              React.createElement(CHART_TYPES.find((t: typeof CHART_TYPES[0]) => t.id === viz.config.type)!.icon, {
                                className: "h-4 w-4 text-neon-purple"
                              })
                            )}
                            <span className="font-medium text-sm">{viz.config.title}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                refreshData(viz.id)
                              }}
                              disabled={isAnimating}
                            >
                              {isAnimating ? (
                                <Loading size="sm" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteVisualization(viz.id)
                              }}
                            >
                              <Square className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Type: {CHART_TYPES.find(t => t.id === viz.config.type)?.name}</div>
                          <div>Data Points: {viz.data.length}</div>
                          <div>Updated: {viz.metadata.lastUpdated.toLocaleTimeString()}</div>
                        </div>
                      </CardContent>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Chart Editor */}
            <div className="lg:col-span-2">
              {selectedViz ? (
                <div className="space-y-6">
                  {/* Chart Configuration */}
                  <div>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{selectedViz.config.title}</CardTitle>
                          <CardDescription>
                            {CHART_TYPES.find(t => t.id === selectedViz.config.type)?.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refreshData(selectedViz.id)}
                            disabled={isAnimating}
                          >
                            {isAnimating ? (
                              <Loading size="sm" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportVisualization(selectedViz.id, 'png')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Chart Canvas */}
                      <div className="relative">
                        <canvas
                          ref={canvasRef}
                          width={800}
                          height={400}
                          className="w-full h-96 border rounded-lg bg-dark-card"
                        />
                        {isAnimating && (
                          <div className="absolute inset-0 flex items-center justify-center bg-dark-card/80 rounded-lg">
                            <Loading />
                          </div>
                        )}
                      </div>

                      {/* Chart Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Title</label>
                          <input
                            type="text"
                            value={selectedViz.config.title}
                            onChange={(e) => updateVisualization(selectedViz.id, {
                              config: { ...selectedViz.config, title: e.target.value }
                            })}
                            className="w-full p-2 border rounded-md"
                            placeholder="Enter chart title..."
                            aria-label="Chart title"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Color Scheme</label>
                          <Select
                            value={selectedViz.config.colorScheme}
                            onValueChange={(value: string) => updateVisualization(selectedViz.id, {
                              config: { ...selectedViz.config, colorScheme: value as ChartConfig['colorScheme'] }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(COLOR_SCHEMES).map(scheme => (
                                <SelectItem key={scheme} value={scheme}>
                                  <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                      {COLOR_SCHEMES[scheme as keyof typeof COLOR_SCHEMES].slice(0, 3).map((color: string, i: number) => (
                                        <div 
                                          key={i} 
                                          className="w-3 h-3 rounded-full" 
                                          style={{ backgroundColor: color }}
                                          aria-label={`Color ${i + 1}`}
                                        />
                                      ))}
                                    </div>
                                    {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Chart Options */}
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedViz.config.animation}
                            onChange={(e) => updateVisualization(selectedViz.id, {
                              config: { ...selectedViz.config, animation: e.target.checked }
                            })}
                          />
                          <span className="text-sm">Animation</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedViz.config.interactive}
                            onChange={(e) => updateVisualization(selectedViz.id, {
                              config: { ...selectedViz.config, interactive: e.target.checked }
                            })}
                          />
                          <span className="text-sm">Interactive</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedViz.config.showLegend}
                            onChange={(e) => updateVisualization(selectedViz.id, {
                              config: { ...selectedViz.config, showLegend: e.target.checked }
                            })}
                          />
                          <span className="text-sm">Show Legend</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedViz.config.showGrid}
                            onChange={(e) => updateVisualization(selectedViz.id, {
                              config: { ...selectedViz.config, showGrid: e.target.checked }
                            })}
                          />
                          <span className="text-sm">Show Grid</span>
                        </label>
                      </div>
                    </CardContent>
                  </div>

                  {/* Data Table */}
                  <div>
                    <CardHeader>
                      <CardTitle>Data Preview</CardTitle>
                      <CardDescription>
                        {selectedViz.data.length} data points
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">X</th>
                              <th className="text-left p-2">Y</th>
                              <th className="text-left p-2">Label</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedViz.data.slice(0, 10).map((point: DataPoint, i: number) => (
                              <tr key={i} className="border-b">
                                <td className="p-2">{point.x}</td>
                                <td className="p-2">{point.y}</td>
                                <td className="p-2">{point.label}</td>
                              </tr>
                            ))}
                            {selectedViz.data.length > 10 && (
                              <tr>
                                <td colSpan={3} className="p-2 text-center text-gray-500">
                                  ... and {selectedViz.data.length - 10} more rows
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </ScrollArea>
                    </CardContent>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Chart Selected</h3>
                  <p className="text-gray-500 mb-4">
                    Select a chart from the list or create a new one
                  </p>
                  <PrimaryButton onClick={() => setIsCreating(true)}>
                    <Zap className="h-4 w-4 mr-2" />
                    Create Chart
                  </PrimaryButton>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Dashboards Tab */}
        <TabsContent value="dashboards" className="space-y-6">
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dashboard Builder</h3>
            <p className="text-gray-500 mb-4">
              Create interactive dashboards with multiple visualizations
            </p>
            <PrimaryButton>
              <Sparkles className="h-4 w-4 mr-2" />
              Coming Soon
            </PrimaryButton>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chart Templates</h3>
            <p className="text-gray-500 mb-4">
              Pre-built chart templates for common use cases
            </p>
            <PrimaryButton>
              <Sparkles className="h-4 w-4 mr-2" />
              Coming Soon
            </PrimaryButton>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Chart Dialog */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-dark-card rounded-sm border-2 border-gray-700 p-6 max-w-2xl w-full mx-4 shadow-[0_0_20px_rgba(179,0,255,0.3)]"
          >
            <h3 className="text-lg font-bold font-orbitron uppercase tracking-wider mb-4 text-white">Create New Chart</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CHART_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => createVisualization(type.id)}
                  className="p-4 border-2 border-gray-700 rounded-sm hover:border-neon-purple hover:bg-neon-purple/10 transition-colors text-left bg-dark-card"
                >
                  <type.icon className="h-6 w-6 text-neon-purple mb-2" />
                  <div className="font-bold font-mono text-sm text-white uppercase tracking-wider">{type.name}</div>
                  <div className="text-xs text-gray-300 mt-1 font-mono">{type.description}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
