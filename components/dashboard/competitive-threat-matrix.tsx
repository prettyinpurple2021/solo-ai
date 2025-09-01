"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Users,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Info
} from "lucide-react"

import { BossCard } from "@/components/ui/boss-card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CompetitorThreat {
  id: number
  name: string
  domain?: string
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  marketOverlap: number
  competitiveStrength: number
  recentActivity: number
  alertCount: number
  fundingStage?: string
  employeeCount?: number
  lastAnalyzed: string
  trendDirection: 'up' | 'down' | 'stable'
  keyThreats: string[]
  opportunities: string[]
}

interface CompetitiveThreatMatrixProps {
  className?: string
  interactive?: boolean
  showDetails?: boolean
}

export function CompetitiveThreatMatrix({ 
  className, 
  interactive = true, 
  showDetails = true 
}: CompetitiveThreatMatrixProps) {
  const [competitors, setCompetitors] = useState<CompetitorThreat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorThreat | null>(null)

  useEffect(() => {
    fetchThreatMatrix()
  }, [])

  const fetchThreatMatrix = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/competitors/intelligence/threat-matrix')
      if (response.ok) {
        const data = await response.json()
        setCompetitors(data.competitors || [])
      }
    } catch (error) {
      console.error('Error fetching threat matrix:', error)
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

  const getThreatLevelBadge = (level: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowUp className="w-3 h-3 text-red-500" />
      case 'down': return <ArrowDown className="w-3 h-3 text-green-500" />
      default: return <Minus className="w-3 h-3 text-gray-500" />
    }
  }

  const getPositionInMatrix = (marketOverlap: number, competitiveStrength: number) => {
    // Calculate position in a 4x4 matrix based on market overlap (x-axis) and competitive strength (y-axis)
    const x = Math.min(Math.floor((marketOverlap / 100) * 4), 3)
    const y = Math.min(Math.floor((competitiveStrength / 100) * 4), 3)
    return { x, y }
  }

  const getQuadrantLabel = (x: number, y: number) => {
    if (x >= 2 && y >= 2) return 'High Threat'
    if (x >= 2 && y < 2) return 'Market Competitor'
    if (x < 2 && y >= 2) return 'Strong Player'
    return 'Low Priority'
  }

  const getQuadrantColor = (x: number, y: number) => {
    if (x >= 2 && y >= 2) return 'bg-red-100 border-red-300'
    if (x >= 2 && y < 2) return 'bg-orange-100 border-orange-300'
    if (x < 2 && y >= 2) return 'bg-yellow-100 border-yellow-300'
    return 'bg-green-100 border-green-300'
  }

  if (loading) {
    return (
      <BossCard className={className}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </BossCard>
    )
  }

  return (
    <TooltipProvider>
      <BossCard className={className}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gradient flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Competitive Threat Matrix</span>
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Info className="w-4 h-4" />
              <span>Market Overlap vs Competitive Strength</span>
            </div>
          </div>

          {/* Matrix Visualization */}
          <div className="relative">
            {/* Matrix Grid */}
            <div className="grid grid-cols-4 grid-rows-4 gap-1 h-80 w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {Array.from({ length: 16 }, (_, index) => {
                const x = index % 4
                const y = Math.floor(index / 4)
                const isHighThreat = x >= 2 && y >= 2
                const isMarketCompetitor = x >= 2 && y < 2
                const isStrongPlayer = x < 2 && y >= 2
                
                return (
                  <div
                    key={index}
                    className={`
                      relative border border-gray-100 dark:border-gray-800
                      ${isHighThreat ? 'bg-red-50 dark:bg-red-900/20' : ''}
                      ${isMarketCompetitor ? 'bg-orange-50 dark:bg-orange-900/20' : ''}
                      ${isStrongPlayer ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}
                      ${!isHighThreat && !isMarketCompetitor && !isStrongPlayer ? 'bg-green-50 dark:bg-green-900/20' : ''}
                    `}
                  >
                    {/* Quadrant Labels (only in corners) */}
                    {x === 3 && y === 3 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          High Threat
                        </span>
                      </div>
                    )}
                    {x === 3 && y === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                          Market Competitor
                        </span>
                      </div>
                    )}
                    {x === 0 && y === 3 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                          Strong Player
                        </span>
                      </div>
                    )}
                    {x === 0 && y === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Low Priority
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Competitors positioned on matrix */}
            {competitors.map((competitor, index) => {
              const position = getPositionInMatrix(competitor.marketOverlap, competitor.competitiveStrength)
              const left = (position.x * 25) + 12.5 // Center in quadrant
              const bottom = (position.y * 25) + 12.5 // Center in quadrant (inverted y-axis)
              
              return (
                <Tooltip key={competitor.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        absolute w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-lg
                        cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10
                        ${getThreatLevelColor(competitor.threatLevel)}
                        ${interactive ? 'hover:scale-110 transition-transform' : ''}
                        ${selectedCompetitor?.id === competitor.id ? 'ring-2 ring-purple-500' : ''}
                      `}
                      style={{
                        left: `${left}%`,
                        bottom: `${bottom}%`,
                      }}
                      onClick={() => interactive && setSelectedCompetitor(competitor)}
                    >
                      <div className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {competitor.name.charAt(0)}
                      </div>
                      {competitor.alertCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                          {competitor.alertCount}
                        </div>
                      )}
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">{competitor.name}</p>
                      <p className="text-sm">Market Overlap: {competitor.marketOverlap}%</p>
                      <p className="text-sm">Competitive Strength: {competitor.competitiveStrength}%</p>
                      <Badge className={getThreatLevelBadge(competitor.threatLevel)}>
                        {competitor.threatLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}

            {/* Axis Labels */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Market Overlap →
            </div>
            <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-600 dark:text-gray-400">
              Competitive Strength →
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Low</span>
              </div>
            </div>
            <div className="text-gray-500">
              {competitors.length} competitors plotted
            </div>
          </div>

          {/* Selected Competitor Details */}
          {showDetails && selectedCompetitor && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 glass rounded-xl border border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{selectedCompetitor.name}</h4>
                  {selectedCompetitor.domain && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCompetitor.domain}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getThreatLevelBadge(selectedCompetitor.threatLevel)}>
                    {selectedCompetitor.threatLevel.toUpperCase()}
                  </Badge>
                  {getTrendIcon(selectedCompetitor.trendDirection)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Market Overlap</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={selectedCompetitor.marketOverlap} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{selectedCompetitor.marketOverlap}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Competitive Strength</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={selectedCompetitor.competitiveStrength} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{selectedCompetitor.competitiveStrength}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Recent Activity</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{selectedCompetitor.recentActivity}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Active Alerts</p>
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">{selectedCompetitor.alertCount}</span>
                  </div>
                </div>
              </div>

              {(selectedCompetitor.keyThreats.length > 0 || selectedCompetitor.opportunities.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCompetitor.keyThreats.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2 text-red-600 dark:text-red-400">Key Threats</h5>
                      <ul className="space-y-1">
                        {selectedCompetitor.keyThreats.slice(0, 3).map((threat, index) => (
                          <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start space-x-1">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{threat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedCompetitor.opportunities.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm mb-2 text-green-600 dark:text-green-400">Opportunities</h5>
                      <ul className="space-y-1">
                        {selectedCompetitor.opportunities.slice(0, 3).map((opportunity, index) => (
                          <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start space-x-1">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </BossCard>
    </TooltipProvider>
  )
}