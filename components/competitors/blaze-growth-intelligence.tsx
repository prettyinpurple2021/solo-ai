'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  BarChart3, 
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'

interface BlazeGrowthIntelligenceProps {
  competitorId: number
  competitorName: string
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface PricingAnalysis {
  competitorId: number
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
  pricingStrategy: string
  marketPositioning: string
}

interface GrowthRecommendation {
  id: string
  type: 'offensive' | 'defensive' | 'strategic'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  growthAction: string
  revenueImpact: string
  marketTiming: string
  investmentRequired: string
  riskAssessment: string
  successMetrics: string[]
}

export function BlazeGrowthIntelligence({ 
  competitorId, 
  competitorName, 
  threatLevel 
}: BlazeGrowthIntelligenceProps) {
  const [activeTab, setActiveTab] = useState('pricing')
  const [loading, setLoading] = useState(false)
  const [pricingAnalysis, setPricingAnalysis] = useState<PricingAnalysis | null>(null)
  const [growthRecommendations, setGrowthRecommendations] = useState<GrowthRecommendation[]>([])
  const [revenueOptimization, setRevenueOptimization] = useState<GrowthRecommendation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [lastAnalyzed, setLastAnalyzed] = useState<string | null>(null)

  useEffect(() => {
    // Auto-load pricing analysis for high/critical threats
    if (threatLevel === 'high' || threatLevel === 'critical') {
      analyzePricingStrategy()
    }
  }, [competitorId, threatLevel])

  const analyzePricingStrategy = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/competitors/${competitorId}/growth-analysis?analysis_type=pricing_strategy`)
      
      if (!response.ok) {
        throw new Error('Failed to analyze pricing strategy')
      }

      const data = await response.json()
      setPricingAnalysis(data.analysis_result)
      setLastAnalyzed(data.analyzed_at)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const analyzeGrowthStrategy = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/competitors/${competitorId}/growth-analysis?analysis_type=growth_analysis`)
      
      if (!response.ok) {
        throw new Error('Failed to analyze growth strategy')
      }

      const data = await response.json()
      setGrowthRecommendations(Array.isArray(data.analysis_result) ? data.analysis_result : [])
      setLastAnalyzed(data.analyzed_at)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Growth analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const generateRevenueOptimization = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/competitors/${competitorId}/growth-analysis?analysis_type=revenue_optimization`)
      
      if (!response.ok) {
        throw new Error('Failed to generate revenue optimization')
      }

      const data = await response.json()
      setRevenueOptimization(Array.isArray(data.analysis_result) ? data.analysis_result : [])
      setLastAnalyzed(data.analyzed_at)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revenue optimization failed')
    } finally {
      setLoading(false)
    }
  }

  const performComprehensiveAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/competitors/${competitorId}/growth-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysis_type: 'comprehensive',
          include_cost_benefit: true,
          market_context: {
            industry: 'technology' // This could be dynamic based on competitor data
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to perform comprehensive analysis')
      }

      const data = await response.json()
      
      if (data.results.pricing_analysis) {
        setPricingAnalysis(data.results.pricing_analysis)
      }
      if (data.results.market_positioning) {
        setGrowthRecommendations(data.results.market_positioning)
      }
      if (data.results.revenue_optimization) {
        setRevenueOptimization(data.results.revenue_optimization)
      }
      
      setLastAnalyzed(data.analyzed_at)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comprehensive analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              Blaze Growth Intelligence
            </CardTitle>
            <CardDescription>
              Pricing and growth strategy analysis for {competitorName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getThreatLevelColor(threatLevel)}>
              {threatLevel.toUpperCase()}
            </Badge>
            <Button 
              onClick={performComprehensiveAnalysis}
              disabled={loading}
              size="sm"
            >
              {loading ? 'Analyzing...' : 'Full Analysis'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing Strategy
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Growth Analysis
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Revenue Optimization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pricing Intelligence</h3>
              <Button 
                onClick={analyzePricingStrategy}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? 'Analyzing...' : 'Analyze Pricing'}
              </Button>
            </div>

            {pricingAnalysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Pricing Model</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge variant="outline">{pricingAnalysis.pricingModel.type}</Badge>
                        <p className="text-sm text-muted-foreground">
                          {pricingAnalysis.pricingModel.hasFreeTier && '• Free tier available'}
                          {pricingAnalysis.pricingModel.hasTrial && '• Trial period offered'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Market Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge variant="secondary">
                          {pricingAnalysis.competitivePricing.marketPosition}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Price Advantage:</span>
                          <span className={`text-sm font-medium ${
                            pricingAnalysis.competitivePricing.priceAdvantage > 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {pricingAnalysis.competitivePricing.priceAdvantage > 0 ? '+' : ''}
                            {pricingAnalysis.competitivePricing.priceAdvantage}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {pricingAnalysis.competitivePricing.pricingGaps.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Pricing Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {pricingAnalysis.competitivePricing.pricingGaps.map((gap, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{gap.segment}</h4>
                              <Badge variant="outline">${gap.recommendedPrice}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{gap.opportunity}</p>
                            <p className="text-sm font-medium text-green-600">{gap.potentialRevenue}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Strategy Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{pricingAnalysis.pricingStrategy}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No pricing analysis available</p>
                <p className="text-sm text-muted-foreground">Click "Analyze Pricing" to get started</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Growth Strategy Analysis</h3>
              <Button 
                onClick={analyzeGrowthStrategy}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? 'Analyzing...' : 'Analyze Growth'}
              </Button>
            </div>

            {growthRecommendations.length > 0 ? (
              <div className="space-y-4">
                {growthRecommendations.map((recommendation, index) => (
                  <Card key={recommendation.id || index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {getPriorityIcon(recommendation.priority)}
                          {recommendation.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={recommendation.type === 'offensive' ? 'default' : 'secondary'}>
                            {recommendation.type}
                          </Badge>
                          <Badge variant="outline">{recommendation.marketTiming}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{recommendation.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Revenue Impact:</span>
                          <p className="text-muted-foreground">{recommendation.revenueImpact}</p>
                        </div>
                        <div>
                          <span className="font-medium">Investment:</span>
                          <p className="text-muted-foreground">{recommendation.investmentRequired}</p>
                        </div>
                      </div>
                      {recommendation.successMetrics.length > 0 && (
                        <div className="mt-3">
                          <span className="font-medium text-sm">Success Metrics:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {recommendation.successMetrics.map((metric, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {metric}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No growth analysis available</p>
                <p className="text-sm text-muted-foreground">Click "Analyze Growth" to get strategic insights</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Revenue Optimization</h3>
              <Button 
                onClick={generateRevenueOptimization}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? 'Generating...' : 'Optimize Revenue'}
              </Button>
            </div>

            {revenueOptimization.length > 0 ? (
              <div className="space-y-4">
                {revenueOptimization.map((optimization, index) => (
                  <Card key={optimization.id || index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          {optimization.title}
                        </CardTitle>
                        <Badge variant="default">{optimization.priority} priority</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{optimization.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Expected Impact:</span>
                          <span className="font-medium text-green-600">{optimization.revenueImpact}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Risk Level:</span>
                          <span className="font-medium">{optimization.riskAssessment}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Timeline:</span>
                          <span className="font-medium">{optimization.marketTiming}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No revenue optimization available</p>
                <p className="text-sm text-muted-foreground">Click "Optimize Revenue" to get recommendations</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {lastAnalyzed && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Last analyzed: {new Date(lastAnalyzed).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}