"use client"


export const dynamic = 'force-dynamic'
import { logger, logError } from '@/lib/logger'
import { useState} from "react"
import { motion} from "framer-motion"
import { useRouter} from "next/navigation"
import { 
  ArrowLeft, Search, Plus, Eye, Zap, Globe, Building, Users, DollarSign, TrendingUp, CheckCircle, AlertTriangle, Lightbulb, Target, Sparkles} from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input} from "@/components/ui/input"
import { Textarea} from "@/components/ui/textarea"
import { Label} from "@/components/ui/label"
import { Badge} from "@/components/ui/badge"
import { Loading} from "@/components/ui/loading"


interface CompetitorSuggestion {
  id: string
  name: string
  domain: string
  description: string
  industry: string
  headquarters: string
  employeeCount: number
  fundingStage: string
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  matchScore: number
  matchReasons: string[]
  keyProducts: string[]
  recentNews: string[]
  socialMediaFollowers: {
    linkedin?: number
    twitter?: number
  }
  isAlreadyTracked: boolean
}

export default function CompetitorDiscoveryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [businessDescription, setBusinessDescription] = useState("")
  const [targetMarket, setTargetMarket] = useState("")
  const [keyProducts, setKeyProducts] = useState("")
  const [suggestions, setSuggestions] = useState<CompetitorSuggestion[]>([])
  const [selectedCompetitors, setSelectedCompetitors] = useState<Set<string>>(new Set())

  const handleSearch = async () => {
    if (!businessDescription.trim()) return

    try {
      setSearching(true)
      
      // Call real AI-powered competitor discovery API
      const response = await fetch('/api/competitors/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessDescription,
          targetMarket,
          keyProducts
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to discover competitors')
      }
      
      const data = await response.json()
      const suggestions: CompetitorSuggestion[] = data.suggestions || []
      
      setSuggestions(suggestions)
    } catch (error) {
      logError('Error discovering competitors:', error)
    } finally {
      setSearching(false)
    }
  }

  const toggleCompetitorSelection = (competitorId: string) => {
    const newSelection = new Set(selectedCompetitors)
    if (newSelection.has(competitorId)) {
      newSelection.delete(competitorId)
    } else {
      newSelection.add(competitorId)
    }
    setSelectedCompetitors(newSelection)
  }

  const handleAddSelected = async () => {
    if (selectedCompetitors.size === 0) return

    try {
      setLoading(true)
      
      // Save selected competitors via API
      const selectedCompetitorsData = suggestions.filter(s => selectedCompetitors.has(s.id))
      
      const response = await fetch('/api/competitors/save-discovered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitors: selectedCompetitorsData
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save competitors')
      }
      
      router.push('/dashboard/competitors')
    } catch (error) {
      logError('Error adding competitors:', error)
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
      critical: 'bg-red-900/40 text-red-200 border-red-500/50',
      high: 'bg-orange-900/40 text-orange-200 border-orange-500/50',
      medium: 'bg-yellow-900/40 text-yellow-200 border-yellow-500/50',
      low: 'bg-green-900/40 text-green-200 border-green-500/50'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-800 text-gray-300 border-gray-600'
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-red-400'
    if (score >= 80) return 'text-orange-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="min-h-screen bg-black p-6 font-mono">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/competitors">
              <Button variant="outline" size="sm" className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-12 h-12 bg-dark-card border border-neon-cyan/30 rounded-full flex items-center justify-center"
                >
                  <Search className="w-6 h-6 text-neon-cyan" />
                </motion.div>
                <h1 className="text-3xl font-bold font-orbitron text-white tracking-wider">Discover Competitors</h1>
              </div>
              <p className="text-gray-400">
                Use AI to find and analyze potential competitors based on your business
              </p>
            </div>
          </div>
          {selectedCompetitors.size > 0 && (
            <Button
              onClick={handleAddSelected}
              disabled={loading}
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold"
            >
              {loading ? <span className="animate-spin mr-2">⟳</span> : <Plus className="w-4 h-4 mr-2" />}
              Add {selectedCompetitors.size} Competitor{selectedCompetitors.size > 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {/* Search Form */}
        <Card className="bg-dark-card border-neon-cyan/30">
          <CardContent className="space-y-6 pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-100 font-orbitron mb-2">Describe Your Business</h2>
              <p className="text-gray-400">
                Tell us about your business and we'll find similar companies that could be competitors
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="businessDescription" className="text-neon-cyan">Business Description *</Label>
                <Textarea
                  id="businessDescription"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20 min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetMarket" className="text-neon-cyan">Target Market</Label>
                  <Input
                    id="targetMarket"
                    value={targetMarket}
                    onChange={(e) => setTargetMarket(e.target.value)}
                    className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan"
                  />
                </div>

                <div>
                  <Label htmlFor="keyProducts" className="text-neon-cyan">Key Products/Features</Label>
                  <Input
                    id="keyProducts"
                    value={keyProducts}
                    onChange={(e) => setKeyProducts(e.target.value)}
                    className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan"
                  />
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button
                onClick={handleSearch}
                disabled={searching || !businessDescription.trim()}
                className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold px-8"
              >
                {searching ? (
                   <>
                    <span className="animate-spin mr-2">⟳</span>
                    Discovering Competitors...
                   </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Discover Competitors
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {searching && (
          <Card className="bg-dark-card border-neon-cyan/30">
            <CardContent className="text-center py-12">
              <Loading 
                variant="pulse" 
                size="lg" 
              />
              <p className="mt-4 text-neon-cyan font-bold animate-pulse">AI is analyzing your business and finding competitors...</p>
              <div className="mt-6 space-y-2 text-sm text-gray-400">
                <p>🔍 Scanning business databases...</p>
                <p>🤖 Analyzing market positioning...</p>
                <p>📊 Calculating match scores...</p>
                <p>⚡ Generating insights...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {suggestions.length > 0 && !searching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-dark-card border-neon-cyan/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-100 font-orbitron">Competitor Suggestions</h3>
                    <p className="text-gray-400">
                      Found {suggestions.length} potential competitors based on your business description
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-neon-cyan">
                    <Lightbulb className="w-4 h-4" />
                    <span>Select competitors to add to your monitoring list</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {suggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div 
                        className={`h-full rounded-xl border p-4 transition-all duration-300 cursor-pointer ${
                          selectedCompetitors.has(suggestion.id) 
                            ? 'bg-neon-cyan/5 border-neon-cyan ring-1 ring-neon-cyan' 
                            : 'bg-dark-bg/50 border-neon-cyan/20 hover:border-neon-cyan/50 hover:bg-dark-bg/80'
                        } ${suggestion.isAlreadyTracked ? 'opacity-60 cursor-default' : ''}`}
                        onClick={() => !suggestion.isAlreadyTracked && toggleCompetitorSelection(suggestion.id)}
                      >
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${getThreatLevelColor(suggestion.threatLevel)}`} />
                                <h4 className="font-bold text-lg text-gray-100">{suggestion.name}</h4>
                                {suggestion.isAlreadyTracked && (
                                  <Badge variant="purple" className="bg-purple-500/10 border-purple-500/50 text-purple-400">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Already Tracked
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 mb-2">
                                {suggestion.domain}
                              </p>
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge 
                                  variant="purple" 
                                  className={getThreatLevelBadge(suggestion.threatLevel)}
                                >
                                  {suggestion.threatLevel.toUpperCase()} THREAT
                                </Badge>
                                <Badge 
                                  variant="cyan" 
                                  className={`${getMatchScoreColor(suggestion.matchScore)} border-current bg-transparent`}
                                >
                                  {suggestion.matchScore}% Match
                                </Badge>
                              </div>
                            </div>
                            
                            {!suggestion.isAlreadyTracked && (
                              <div className="flex items-center space-x-2">
                                {selectedCompetitors.has(suggestion.id) ? (
                                  <CheckCircle className="w-6 h-6 text-neon-cyan" />
                                ) : (
                                  <div className="w-6 h-6 border-2 border-gray-600 rounded-full hover:border-neon-cyan transition-colors" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-300">
                            {suggestion.description}
                          </p>

                          {/* Company Info */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-500">HQ:</span>
                              <span className="font-medium text-gray-300">{suggestion.headquarters}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-500">Team:</span>
                              <span className="font-medium text-gray-300">{suggestion.employeeCount}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-500">Stage:</span>
                              <span className="font-medium text-gray-300">{suggestion.fundingStage}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-500">Industry:</span>
                              <span className="font-medium text-gray-300">{suggestion.industry}</span>
                            </div>
                          </div>

                          {/* Match Reasons */}
                          <div>
                            <h5 className="font-medium mb-2 text-sm text-neon-cyan">Why this is a match:</h5>
                            <ul className="space-y-1">
                              {suggestion.matchReasons.slice(0, 3).map((reason, index) => (
                                <li key={index} className="text-xs text-gray-400 flex items-start">
                                  <Target className="w-3 h-3 mt-0.5 mr-1 flex-shrink-0 text-neon-pink" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Key Products */}
                          <div>
                            <h5 className="font-medium mb-2 text-sm text-neon-cyan">Key Products:</h5>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.keyProducts.slice(0, 3).map((product, index) => (
                                <Badge key={index} variant="cyan" className="bg-neon-cyan/10 border-neon-cyan/50 text-neon-cyan">
                                  {product}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Social Media */}
                          {(suggestion.socialMediaFollowers.linkedin || suggestion.socialMediaFollowers.twitter) && (
                            <div className="flex items-center space-x-4 text-xs text-gray-500 border-t border-gray-700/50 pt-3">
                              {suggestion.socialMediaFollowers.linkedin && (
                                <span>LinkedIn: {suggestion.socialMediaFollowers.linkedin.toLocaleString()}</span>
                              )}
                              {suggestion.socialMediaFollowers.twitter && (
                                <span>Twitter: {suggestion.socialMediaFollowers.twitter.toLocaleString()}</span>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2">
                            <a 
                              href={`https://${suggestion.domain}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-neon-pink hover:text-neon-pink/80 flex items-center transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe className="w-3 h-3 mr-1" />
                              Visit Website
                            </a>
                            
                            {!suggestion.isAlreadyTracked && (
                              <Button 
                                size="sm"
                                className={selectedCompetitors.has(suggestion.id) 
                                  ? "bg-neon-cyan text-black hover:bg-neon-cyan/90 border-transparent"
                                  : "border-neon-cyan/50 text-neon-cyan bg-transparent hover:bg-neon-cyan/10"
                                }
                                variant={selectedCompetitors.has(suggestion.id) ? "cyan" : "purple"}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleCompetitorSelection(suggestion.id)
                                }}
                              >
                                {selectedCompetitors.has(suggestion.id) ? 'Selected' : 'Select'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help Text */}
            <Card className="bg-dark-card border-neon-cyan/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>
                    Competitor suggestions are generated using AI and public data. Verify information before making strategic decisions.
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {suggestions.length === 0 && !searching && businessDescription && (
          <Card className="bg-dark-card border-neon-cyan/30">
            <CardContent className="text-center py-12">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="mx-auto w-20 h-20 bg-dark-bg border border-neon-pink/30 rounded-full flex items-center justify-center mb-6"
              >
                <Search className="w-10 h-10 text-neon-pink" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-100 font-orbitron mb-4">No Competitors Found</h2>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                We couldn't find any competitors matching your business description. Try refining your description or adding more details about your target market.
              </p>
              <Button 
                className="bg-neon-pink hover:bg-neon-pink/80 text-white font-bold"
                onClick={() => {
                  setBusinessDescription("")
                  setTargetMarket("")
                  setKeyProducts("")
                }}
              >
                Try Different Description
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}