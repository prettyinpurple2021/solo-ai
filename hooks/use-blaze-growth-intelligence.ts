import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface BlazeAnalysisOptions {
  competitorId: number
  analysisType?: 'pricing_strategy' | 'growth_analysis' | 'market_positioning' | 'revenue_optimization'
  includeCostBenefit?: boolean
  marketContext?: {
    industry?: string
    targetMarket?: string
    businessModel?: string
    currentPricing?: any
  }
}

interface PricingIntelligenceOptions {
  competitorIds: number[]
  analysisScope?: 'pricing_only' | 'competitive_positioning' | 'revenue_optimization' | 'comprehensive'
  marketContext?: {
    industry?: string
    targetSegment?: string
    businessModel?: string
    currentPricingModel?: string
  }
  includeRecommendations?: boolean
}

export function useBlazeGrowthIntelligence() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const analyzePricingStrategy = useCallback(async (competitorId: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/competitors/${competitorId}/growth-analysis?analysis_type=pricing_strategy`)
      
      if (!response.ok) {
        throw new Error('Failed to analyze pricing strategy')
      }

      const data = await response.json()
      
      toast({
        title: "Pricing Analysis Complete",
        description: `Blaze has analyzed ${data.competitor.name}'s pricing strategy`,
      })

      return data.analysis_result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      setError(errorMessage)
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      })
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  const analyzeGrowthStrategy = useCallback(async (competitorId: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/competitors/${competitorId}/growth-analysis?analysis_type=growth_analysis`)
      
      if (!response.ok) {
        throw new Error('Failed to analyze growth strategy')
      }

      const data = await response.json()
      
      toast({
        title: "Growth Analysis Complete",
        description: `Blaze has analyzed ${data.competitor.name}'s growth patterns`,
      })

      return data.analysis_result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Growth analysis failed'
      setError(errorMessage)
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      })
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  const generateRevenueOptimization = useCallback(async (competitorId: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/competitors/${competitorId}/growth-analysis?analysis_type=revenue_optimization`)
      
      if (!response.ok) {
        throw new Error('Failed to generate revenue optimization')
      }

      const data = await response.json()
      
      toast({
        title: "Revenue Optimization Ready",
        description: `Blaze has generated optimization strategies based on competitive analysis`,
      })

      return data.analysis_result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Revenue optimization failed'
      setError(errorMessage)
      
      toast({
        title: "Optimization Failed",
        description: errorMessage,
        variant: "destructive"
      })
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  const performComprehensiveAnalysis = useCallback(async (options: BlazeAnalysisOptions) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/competitors/${options.competitorId}/growth-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysis_type: options.analysisType || 'comprehensive',
          include_cost_benefit: options.includeCostBenefit || false,
          market_context: options.marketContext
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to perform comprehensive analysis')
      }

      const data = await response.json()
      
      toast({
        title: "Comprehensive Analysis Complete",
        description: `Blaze has completed a full competitive intelligence analysis`,
      })

      return data.results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Comprehensive analysis failed'
      setError(errorMessage)
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      })
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  const analyzePricingIntelligence = useCallback(async (options: PricingIntelligenceOptions) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/competitors/pricing-intelligence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          competitor_ids: options.competitorIds,
          analysis_scope: options.analysisScope || 'pricing_only',
          market_context: options.marketContext,
          include_recommendations: options.includeRecommendations !== false
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to analyze pricing intelligence')
      }

      const data = await response.json()
      
      toast({
        title: "Pricing Intelligence Ready",
        description: `Analyzed ${options.competitorIds.length} competitors for pricing opportunities`,
      })

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Pricing intelligence analysis failed'
      setError(errorMessage)
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      })
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  const getPricingIntelligenceOverview = useCallback(async (threatLevels: string[] = ['high', 'critical'], limit: number = 10) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/competitors/pricing-intelligence?threat_levels=${threatLevels.join(',')}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to load pricing intelligence overview')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pricing intelligence'
      setError(errorMessage)
      
      toast({
        title: "Load Failed",
        description: errorMessage,
        variant: "destructive"
      })
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  const performCostBenefitAnalysis = useCallback(async (
    competitorId: number, 
    proposedAction: string,
    marketData?: any[]
  ) => {
    try {
      setLoading(true)
      setError(null)

      // This would typically be part of the comprehensive analysis
      // For now, we'll use the comprehensive analysis endpoint
      const response = await fetch(`/api/competitors/${competitorId}/growth-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysis_type: 'market_positioning',
          include_cost_benefit: true,
          market_context: {
            proposed_action: proposedAction,
            market_data: marketData
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to perform cost-benefit analysis')
      }

      const data = await response.json()
      
      toast({
        title: "Cost-Benefit Analysis Complete",
        description: `Blaze has analyzed the costs and benefits of: ${proposedAction}`,
      })

      return data.results.cost_benefit_analysis || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Cost-benefit analysis failed'
      setError(errorMessage)
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      })
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    loading,
    error,
    
    // Actions
    analyzePricingStrategy,
    analyzeGrowthStrategy,
    generateRevenueOptimization,
    performComprehensiveAnalysis,
    analyzePricingIntelligence,
    getPricingIntelligenceOverview,
    performCostBenefitAnalysis,
    clearError,
    
    // Utilities
    isAnalyzing: loading
  }
}