import { useState, useCallback } from 'react'
import { IntelligenceBriefing, BriefingType } from '@/lib/intelligence-briefing-system'
import { AgentBriefing } from '@/lib/agent-intelligence-briefings'

interface BriefingRequest {
  briefingType: BriefingType
  competitorIds?: string[]
  topics?: string[]
  customization?: {
    role?: string
    interests?: string[]
    priority?: 'high-level' | 'detailed' | 'executive'
  }
}

interface UseBriefingsReturn {
  briefings: IntelligenceBriefing[]
  agentBriefings: AgentBriefing[]
  currentBriefing: IntelligenceBriefing | null
  currentAgentBriefing: AgentBriefing | null
  isGenerating: boolean
  error: string | null
  generateBriefing: (request: BriefingRequest) => Promise<void>
  generateDailyBriefing: (competitorIds?: string[]) => Promise<void>
  generateWeeklyBriefing: (competitorIds?: string[]) => Promise<void>
  generateMonthlyReport: (competitorIds?: string[]) => Promise<void>
  generateOnDemandBriefing: (topics: string[], competitorIds?: string[]) => Promise<void>
  generateAgentBriefing: (agentId: string, competitorIds?: string[]) => Promise<void>
  generateEchoBriefing: (competitorIds?: string[]) => Promise<void>
  generateLexiBriefing: (competitorIds?: string[]) => Promise<void>
  generateNovaBriefing: (competitorIds?: string[]) => Promise<void>
  generateBlazeBriefing: (competitorIds?: string[]) => Promise<void>
  generateCollaborativeBriefing: (competitorIds?: string[], agents?: string[]) => Promise<void>
  getBriefingHistory: () => Promise<void>
  clearError: () => void
}

export function useIntelligenceBriefings(): UseBriefingsReturn {
  const [briefings, setBriefings] = useState<IntelligenceBriefing[]>([])
  const [agentBriefings, setAgentBriefings] = useState<AgentBriefing[]>([])
  const [currentBriefing, setCurrentBriefing] = useState<IntelligenceBriefing | null>(null)
  const [currentAgentBriefing, setCurrentAgentBriefing] = useState<AgentBriefing | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  const generateBriefing = useCallback(async (request: BriefingRequest) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/intelligence/briefings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate briefing')
      }
      
      const data = await response.json()
      
      if (data.success && data.briefing) {
        setCurrentBriefing(data.briefing)
        setBriefings(prev => [data.briefing, ...prev])
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate briefing'
      setError(errorMessage)
      console.error('Error generating briefing:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])
  
  const generateDailyBriefing = useCallback(async (competitorIds?: string[]) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/intelligence/briefings/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ competitorIds })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate daily briefing')
      }
      
      const data = await response.json()
      
      if (data.success && data.briefing) {
        setCurrentBriefing(data.briefing)
        setBriefings(prev => [data.briefing, ...prev])
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate daily briefing'
      setError(errorMessage)
      console.error('Error generating daily briefing:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])
  
  const generateWeeklyBriefing = useCallback(async (competitorIds?: string[]) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/intelligence/briefings/weekly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ competitorIds })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate weekly briefing')
      }
      
      const data = await response.json()
      
      if (data.success && data.briefing) {
        setCurrentBriefing(data.briefing)
        setBriefings(prev => [data.briefing, ...prev])
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate weekly briefing'
      setError(errorMessage)
      console.error('Error generating weekly briefing:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])
  
  const generateMonthlyReport = useCallback(async (competitorIds?: string[]) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/intelligence/briefings/monthly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ competitorIds })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate monthly report')
      }
      
      const data = await response.json()
      
      if (data.success && data.briefing) {
        setCurrentBriefing(data.briefing)
        setBriefings(prev => [data.briefing, ...prev])
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate monthly report'
      setError(errorMessage)
      console.error('Error generating monthly report:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])
  
  const generateOnDemandBriefing = useCallback(async (topics: string[], competitorIds?: string[]) => {
    await generateBriefing({
      briefingType: 'on-demand',
      topics,
      competitorIds,
      customization: {
        role: 'analyst',
        interests: topics,
        priority: 'detailed'
      }
    })
  }, [generateBriefing])
  
  const generateAgentBriefing = useCallback(async (agentId: string, competitorIds?: string[]) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/intelligence/briefings/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ agentId, competitorIds })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate agent briefing')
      }
      
      const data = await response.json()
      
      if (data.success && data.briefing) {
        setCurrentAgentBriefing(data.briefing)
        setAgentBriefings(prev => [data.briefing, ...prev])
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate agent briefing'
      setError(errorMessage)
      console.error('Error generating agent briefing:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])
  
  const generateEchoBriefing = useCallback(async (competitorIds?: string[]) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/intelligence/briefings/agents/echo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ competitorIds })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate Echo briefing')
      }
      
      const data = await response.json()
      
      if (data.success && data.briefing) {
        setCurrentAgentBriefing(data.briefing)
        setAgentBriefings(prev => [data.briefing, ...prev])
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate Echo briefing'
      setError(errorMessage)
      console.error('Error generating Echo briefing:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])
  
  const generateLexiBriefing = useCallback(async (competitorIds?: string[]) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/intelligence/briefings/agents/lexi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ competitorIds })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate Lexi briefing')
      }
      
      const data = await response.json()
      
      if (data.success && data.briefing) {
        setCurrentAgentBriefing(data.briefing)
        setAgentBriefings(prev => [data.briefing, ...prev])
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate Lexi briefing'
      setError(errorMessage)
      console.error('Error generating Lexi briefing:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])
  
  const generateNovaBriefing = useCallback(async (competitorIds?: string[]) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/intelligence/briefings/agents/nova', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ competitorIds })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate Nova briefing')
      }
      
      const data = await response.json()
      
      if (data.success && data.briefing) {
        setCurrentAgentBriefing(data.briefing)
        setAgentBriefings(prev => [data.briefing, ...prev])
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate Nova briefing'
      setError(errorMessage)
      console.error('Error generating Nova briefing:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])
  
  const generateBlazeBriefing = useCallback(async (competitorIds?: string[]) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/intelligence/briefings/agents/blaze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ competitorIds })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate Blaze briefing')
      }
      
      const data = await response.json()
      
      if (data.success && data.briefing) {
        setCurrentAgentBriefing(data.briefing)
        setAgentBriefings(prev => [data.briefing, ...prev])
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate Blaze briefing'
      setError(errorMessage)
      console.error('Error generating Blaze briefing:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])
  
  const generateCollaborativeBriefing = useCallback(async (competitorIds?: string[], agents?: string[]) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/intelligence/briefings/agents/collaborative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ competitorIds, participatingAgents: agents })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate collaborative briefing')
      }
      
      const data = await response.json()
      
      if (data.success && data.briefing) {
        setCurrentAgentBriefing(data.briefing)
        setAgentBriefings(prev => [data.briefing, ...prev])
      } else {
        throw new Error('Invalid response format')
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate collaborative briefing'
      setError(errorMessage)
      console.error('Error generating collaborative briefing:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])
  
  const getBriefingHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/intelligence/briefings')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch briefing history')
      }
      
      const data = await response.json()
      
      if (data.success && data.briefings) {
        setBriefings(data.briefings)
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch briefing history'
      setError(errorMessage)
      console.error('Error fetching briefing history:', err)
    }
  }, [])
  
  return {
    briefings,
    agentBriefings,
    currentBriefing,
    currentAgentBriefing,
    isGenerating,
    error,
    generateBriefing,
    generateDailyBriefing,
    generateWeeklyBriefing,
    generateMonthlyReport,
    generateOnDemandBriefing,
    generateAgentBriefing,
    generateEchoBriefing,
    generateLexiBriefing,
    generateNovaBriefing,
    generateBlazeBriefing,
    generateCollaborativeBriefing,
    getBriefingHistory,
    clearError
  }
}