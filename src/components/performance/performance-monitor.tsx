"use client"

import { useEffect, useState} from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import { Badge} from '@/components/ui/badge'
import { Progress} from '@/components/ui/progress'
import { Button} from '@/components/ui/button'
import { Activity, Zap, Clock, TrendingUp, X, ChevronDown, ChevronUp} from 'lucide-react'

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
  const [isClosed, setIsClosed] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

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
            setMetrics(prev => ({ ...(prev || { fcp: 0, lcp: 0, fid: 0, cls: 0, ttfb: 0, loadTime: 0 }), lcp: entry.startTime }))
          } else if (entry.entryType === 'first-input') {
            const fiEntry = entry as PerformanceEventTiming
            setMetrics(prev => ({ ...(prev || { fcp: 0, lcp: 0, fid: 0, cls: 0, ttfb: 0, loadTime: 0 }), fid: (fiEntry.processingStart || fiEntry.startTime) - fiEntry.startTime }))
          } else if (entry.entryType === 'layout-shift') {
            const clsEntry = entry as PerformanceEntry & { value: number }
            setMetrics(prev => ({ ...(prev || { fcp: 0, lcp: 0, fid: 0, cls: 0, ttfb: 0, loadTime: 0 }), cls: (prev?.cls || 0) + clsEntry.value }))
          }
        }
      })

      // One observe() call only: multiple observe() configs are not reliable across browsers for the same observer.
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })

      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigationEntry) {
        const loadEnd = navigationEntry.loadEventEnd
        const loadStart = navigationEntry.loadEventStart
        setMetrics((prev) => ({
          ...(prev || { fcp: 0, lcp: 0, fid: 0, cls: 0, ttfb: 0, loadTime: 0 }),
          ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
          loadTime: loadEnd > 0 ? loadEnd - loadStart : 0,
        }))
      }

      // Track FCP
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries[entries.length - 1]
        setMetrics(prev => ({ ...(prev || { fcp: 0, lcp: 0, fid: 0, cls: 0, ttfb: 0, loadTime: 0 }), fcp: fcpEntry.startTime }))
      })
      fcpObserver.observe({ entryTypes: ['paint'] })

      return () => {
        observer.disconnect()
        fcpObserver.disconnect()
      }
    }
    return undefined
  }, [])

  if (!isVisible || isClosed) return null
  if (!metrics) return null

  const getScore = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'good'
    if (value <= thresholds.poor) return 'needs-improvement'
    return 'poor'
  }

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good':
        return 'border border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
      case 'needs-improvement':
        return 'border border-amber-500/50 bg-amber-500/15 text-amber-200'
      case 'poor':
        return 'border border-red-500/50 bg-red-500/15 text-red-300'
      default:
        return 'border border-zinc-600 bg-zinc-800/80 text-zinc-300'
    }
  }

  const lcpScore = getScore(metrics.lcp, { good: 2500, poor: 4000 })
  const fidScore = getScore(metrics.fid, { good: 100, poor: 300 })
  const clsScore = getScore(metrics.cls, { good: 0.1, poor: 0.25 })

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 border border-cyan-500/35 bg-dark-bg/95 text-zinc-100 shadow-[0_0_24px_rgba(34,211,238,0.12)] backdrop-blur-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <Activity className="h-4 w-4 text-cyan-400" />
            Performance Monitor
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 p-0 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsClosed(true)}
              className="h-6 w-6 p-0 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              title="Close"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <CardDescription className="text-xs text-zinc-500">
            Core Web Vitals (dev) — LCP, FID, CLS
          </CardDescription>
        )}
      </CardHeader>
      {!isMinimized && (
        <CardContent className="space-y-3 text-zinc-200">
        {/* LCP */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300">LCP</span>
            <Badge className={`text-xs font-medium ${getScoreColor(lcpScore)}`}>
              {lcpScore.replace('-', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-cyan-500/70" />
            <span className="text-xs text-zinc-400">
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
            <span className="text-xs font-medium text-zinc-300">FID</span>
            <Badge className={`text-xs font-medium ${getScoreColor(fidScore)}`}>
              {fidScore.replace('-', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-cyan-500/70" />
            <span className="text-xs text-zinc-400">
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
            <span className="text-xs font-medium text-zinc-300">CLS</span>
            <Badge className={`text-xs font-medium ${getScoreColor(clsScore)}`}>
              {clsScore.replace('-', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-cyan-500/70" />
            <span className="text-xs text-zinc-400">
              {metrics.cls ? metrics.cls.toFixed(3) : 'Measuring...'}
            </span>
          </div>
          <Progress 
            value={Math.min((metrics.cls / 0.25) * 100, 100)} 
            className="h-1"
          />
        </div>

        {/* Additional Metrics */}
        <div className="border-t border-zinc-700/80 pt-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-zinc-500">TTFB:</span>
              <span className="ml-1 font-medium text-zinc-200">
                {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Load:</span>
              <span className="ml-1 font-medium text-zinc-200">
                {metrics.loadTime ? `${Math.round(metrics.loadTime)}ms` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      )}
    </Card>
  )
}
