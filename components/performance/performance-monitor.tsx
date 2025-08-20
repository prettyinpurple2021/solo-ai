"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react'

interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  ttfb: number // Time to First Byte
  loadTime: number // Total page load time
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_PERFORMANCE_MONITOR === 'true') {
      setIsVisible(true)
    }

    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Track Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            setMetrics(prev => ({ ...prev, lcp: entry.startTime }))
          } else if (entry.entryType === 'first-input') {
            setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }))
          } else if (entry.entryType === 'layout-shift') {
            const clsEntry = entry as any
            setMetrics(prev => ({ ...prev, cls: (prev?.cls || 0) + clsEntry.value }))
          }
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

      // Track other metrics
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        setMetrics({
          fcp: 0,
          lcp: 0,
          fid: 0,
          cls: 0,
          ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
          loadTime: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
        })
      }

      // Track FCP
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries[entries.length - 1]
        setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }))
      })
      fcpObserver.observe({ entryTypes: ['paint'] })

      return () => {
        observer.disconnect()
        fcpObserver.disconnect()
      }
    }
  }, [])

  if (!isVisible || !metrics) return null

  const getScore = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.poor) return 'needs-improvement'
    return 'poor'
  }

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'bg-green-100 text-green-800'
      case 'needs-improvement': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const lcpScore = getScore(metrics.lcp, { good: 2500, poor: 4000 })
  const fidScore = getScore(metrics.fid, { good: 100, poor: 300 })
  const clsScore = getScore(metrics.cls, { good: 0.1, poor: 0.25 })

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-white/95 backdrop-blur-sm border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance Monitor
        </CardTitle>
        <CardDescription className="text-xs">
          Core Web Vitals & Performance Metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* LCP */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">LCP</span>
            <Badge className={`text-xs ${getScoreColor(lcpScore)}`}>
              {lcpScore.replace('-', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">
              {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'Measuring...'}
            </span>
          </div>
          <Progress 
            value={Math.min((metrics.lcp / 4000) * 100, 100)} 
            className="h-1"
          />
        </div>

        {/* FID */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">FID</span>
            <Badge className={`text-xs ${getScoreColor(fidScore)}`}>
              {fidScore.replace('-', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">
              {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'Measuring...'}
            </span>
          </div>
          <Progress 
            value={Math.min((metrics.fid / 300) * 100, 100)} 
            className="h-1"
          />
        </div>

        {/* CLS */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">CLS</span>
            <Badge className={`text-xs ${getScoreColor(clsScore)}`}>
              {clsScore.replace('-', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-600">
              {metrics.cls ? metrics.cls.toFixed(3) : 'Measuring...'}
            </span>
          </div>
          <Progress 
            value={Math.min((metrics.cls / 0.25) * 100, 100)} 
            className="h-1"
          />
        </div>

        {/* Additional Metrics */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">TTFB:</span>
              <span className="ml-1 font-medium">
                {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Load:</span>
              <span className="ml-1 font-medium">
                {metrics.loadTime ? `${Math.round(metrics.loadTime)}ms` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
