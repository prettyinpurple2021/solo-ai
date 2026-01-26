// @ts-nocheck
'use client'

import { useState, useEffect} from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import { Button} from '@/components/ui/button'
import { Badge} from '@/components/ui/badge'
import { Progress} from '@/components/ui/progress'
import { Alert, AlertDescription} from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import { 
  DollarSign, TrendingUp, Target, BarChart3, Lightbulb, AlertTriangle, CheckCircle, Zap, Users, PieChart, ArrowUpRight, ArrowDownRight} from 'lucide-react'

interface PricingIntelligenceData {
  competitor: {
    id: string
    name: string
    threat_level: string
    industry?: string
  }
  pricing_analysis: {
    pricingModel: {
      type: string
      currency: string
      hasFreeTier: boolean
      hasTrial: boolean
    }
    competitivePricing: {
      marketPosition: string
      priceAdvantage: number
      valueProposition: string
      pricingGaps: Array<{
        segment: string
        opportunity: string
        potentialRevenue: string
        recommendedPrice: number
      }>
    }
  } | null
  data_availability: string
  intelligence_points?: number
}

interface MarketInsights {
  pricing_models_detected: string[]
  average_market_position: number
  total_pricing_gaps: number
  market_opportunity_score: number
}

export function PricingIntelligenceDashboard() {
  const [loading, setLoading] = useState(false)
  const [pricingData, setPricingData] = useState<PricingIntelligenceData[]>([])
  const [marketInsights, setMarketInsights] = useState<MarketInsights (null)
  const [summary, setSummary] = useState<any>(null)
  const [error, setError] = useState<string (null)
  const [threatLevelFilter, setThreatLevelFilter] = useState('high,critical')
  const [analysisScope, setAnalysisScope] = useState<'pricing_only' | 'comprehensive'>('pricing_only')

  useEffect(() => {
    loadPricingIntelligence()
  }, [threatLevelFilter])

  const loadPricingIntelligence = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/competitors/pricing-intelligence?threat_levels=${threatLevelFilter}&limit=10`)
      
      if (!response.ok) {
        throw new Error('Failed to load pricing intelligence')
      }

      const data = await response.json()
      setPricingData(data.pricing_intelligence || [])
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const performComprehensiveAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get competitor IDs from current data
      const competitorIds = pricingData
        .filter(item => item.pricing_analysis !== null)
        .map(item => item.competitor.id)
        .slice(0, 5) // Limit to 5 competitors for comprehensive analysis

      if (competitorIds.length === 0) {
        throw new Error('No competitors available for analysis')
      }

      const response = await fetch('/api/competitors/pricing-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          competitor_ids: competitorIds,
          analysis_scope: 'comprehensive',
          include_recommendations: true,
          market_context: {
            industry: 'technology'
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to perform comprehensive analysis')
      }

      const data = await response.json()
      
      if (data.pricing_analyses) {
        // Update pricing data with comprehensive results
        const updatedData = pricingData.map(item => {
          const analysis = data.pricing_analyses.find((a: any) => a.competitor_id === item.competitor.id)
          if (analysis && analysis.pricing_analysis) {
            return {
              ...item,
              pricing_analysis: analysis.pricing_analysis,
              data_availability: 'comprehensive'
            }
          }
          return item
        })
        setPricingData(updatedData)
      }

      if (data.market_insights) {
        setMarketInsights(data.market_insights)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comprehensive analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-neon-magenta text-white'
      case 'high': return 'bg-neon-orange text-white'
      case 'medium': return 'bg-neon-orange text-white'
      case 'low': return 'bg-neon-lime text-white'
      default: return 'bg-gray-700 text-white'
    }
  }

  const getMarketPositionColor = (position: string) => {
    switch (position) {
      case 'premium': return 'text-neon-purple'
      case 'mid_market': return 'text-neon-cyan'
      case 'value': return 'text-neon-lime'
      case 'budget': return 'text-neon-orange'
      default: return 'text-gray-300'
    }
  }

  const getDataAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'sufficient':
      case 'comprehensive':
        return <CheckCircle className="h-4 w-4 text-neon-lime" />
      case 'insufficient':
        return <AlertTriangle className="h-4 w-4 text-neon-orange" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-neon-magenta" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-orbitron uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-6 w-6 text-neon-purple" />
            Pricing Intelligence Dashboard
          </h2>
          <p className="text-muted-foreground font-mono">
            Blaze's competitive pricing and growth analysis across your monitored competitors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={threatLevelFilter} onValueChange={setThreatLevelFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by threat level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical Only</SelectItem>
              <SelectItem value="high,critical">High & Critical</SelectItem>
              <SelectItem value="medium,high,critical">Medium & Above</SelectItem>
              <SelectItem value="low,medium,high,critical">All Levels</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={performComprehensiveAnalysis}
            disabled={loading || pricingData.length === 0}
          >
            {loading ? 'Analyzing...' : 'Deep Analysis'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Competitors Monitored</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_competitors}</div>
              <p className="text-xs text-muted-foreground">
                {summary.pricing_strategies_analyzed} with pricing data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Opportunities</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-lime">{summary.market_opportunities}</div>
              <p className="text-xs text-muted-foreground font-mono">
                Pricing gaps identified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.data_points_analyzed}</div>
              <p className="text-xs text-muted-foreground">
                Intelligence entries analyzed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analysis Period</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.analysis_period}</div>
              <p className="text-xs text-muted-foreground">
                Recent intelligence data
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Market Insights */}
      {marketInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Market Intelligence Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium mb-2">Pricing Models</h4>
                <div className="space-y-1">
                  {marketInsights.pricing_models_detected.map((model, index) => (
                    <Badge key={index} variant="outline" className="mr-1">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Market Position</h4>
                <div className="text-2xl font-bold">
                  {marketInsights.average_market_position.toFixed(1)}/4
                </div>
                <p className="text-sm text-muted-foreground">Average positioning</p>
              </div>
              <div>
                <h4 className="font-medium mb-2 font-mono">Pricing Gaps</h4>
                <div className="text-2xl font-bold text-neon-lime">
                  {marketInsights.total_pricing_gaps}
                </div>
                <p className="text-sm text-muted-foreground font-mono">Opportunities found</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Opportunity Score</h4>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {marketInsights.market_opportunity_score}%
                  </div>
                  <Progress value={marketInsights.market_opportunity_score} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitor Pricing Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Competitor Pricing Analysis</CardTitle>
          <CardDescription>
            Detailed pricing intelligence for each monitored competitor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple mx-auto mb-4"></div>
              <p className="font-mono">Analyzing competitor pricing strategies...</p>
            </div>
          ) : pricingData.length > 0 ? (
            <div className="space-y-4">
              {pricingData.map((item, index) => (
                <Card key={item.competitor.id} className="border-l-4 border-l-neon-purple">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{item.competitor.name}</h3>
                        <Badge className={getThreatLevelColor(item.competitor.threat_level)}>
                          {item.competitor.threat_level}
                        </Badge>
                        {getDataAvailabilityIcon(item.data_availability)}
                      </div>
                      {item.intelligence_points && (
                        <Badge variant="outline">
                          {item.intelligence_points} data points
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {item.pricing_analysis ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Pricing Model</h4>
                            <Badge variant="secondary">
                              {item.pricing_analysis.pricingModel.type}
                            </Badge>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {item.pricing_analysis.pricingModel.hasFreeTier && '• Free tier'}
                              {item.pricing_analysis.pricingModel.hasTrial && '• Trial available'}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Market Position</h4>
                            <div className={`font-medium ${getMarketPositionColor(item.pricing_analysis.competitivePricing.marketPosition)}`}>
                              {item.pricing_analysis.competitivePricing.marketPosition.replace('_', ' ')}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {item.pricing_analysis.competitivePricing.priceAdvantage > 0 ? (
                                <ArrowUpRight className="h-3 w-3 text-neon-lime" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3 text-neon-magenta" />
                              )}
                              <span className={`text-sm font-mono ${
                                item.pricing_analysis.competitivePricing.priceAdvantage > 0 
                                  ? 'text-neon-lime' 
                                  : 'text-neon-magenta'
                              }`}>
                                {item.pricing_analysis.competitivePricing.priceAdvantage > 0 ? '+' : ''}
                                {item.pricing_analysis.competitivePricing.priceAdvantage}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 font-mono">Opportunities</h4>
                            <div className="text-lg font-bold text-neon-lime">
                              {item.pricing_analysis.competitivePricing.pricingGaps.length}
                            </div>
                            <div className="text-sm text-muted-foreground font-mono">
                              Pricing gaps found
                            </div>
                          </div>
                        </div>

                        {item.pricing_analysis.competitivePricing.pricingGaps.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Key Opportunities</h4>
                            <div className="space-y-2">
                              {item.pricing_analysis.competitivePricing.pricingGaps.slice(0, 2).map((gap, gapIndex) => (
                                <div key={gapIndex} className="bg-dark-card border border-neon-lime rounded-sm p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm font-mono">{gap.segment}</span>
                                    <Badge variant="outline" className="text-neon-lime border-neon-lime">
                                      ${gap.recommendedPrice}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-neon-lime font-mono">{gap.opportunity}</p>
                                  <p className="text-xs text-neon-lime mt-1 font-mono">{gap.potentialRevenue}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-muted-foreground">
                          {item.data_availability === 'insufficient' 
                            ? 'Insufficient pricing data available'
                            : 'Pricing analysis failed'
                          }
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No competitors found with selected threat levels</p>
              <p className="text-sm text-muted-foreground">
                Adjust the threat level filter or add more competitors to monitor
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}