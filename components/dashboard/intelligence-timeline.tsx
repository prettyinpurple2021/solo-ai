"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Clock, 
  Activity, 
  Globe, 
  Users, 
  TrendingUp,
  AlertTriangle,
  Zap,
  Eye,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react"

import { BossCard, EmpowermentCard } from "@/components/ui/boss-card"
import { BossButton } from "@/components/ui/boss-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface TimelineEvent {
  id: string
  timestamp: string
  competitorId: number
  competitorName: string
  competitorDomain?: string
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  eventType: 'website_change' | 'social_post' | 'news_mention' | 'job_posting' | 'product_launch' | 'pricing_change' | 'funding' | 'partnership'
  title: string
  description: string
  importance: 'low' | 'medium' | 'high' | 'critical'
  sourceUrl?: string
  tags: string[]
  analysisResults?: {
    agentId: string
    agentName: string
    insights: string[]
    recommendations: string[]
    confidence: number
    analysisType: string
  }[]
  relatedEvents?: string[]
  impactScore: number
}

interface IntelligenceTimelineProps {
  className?: string
  competitorId?: number
  timeRange?: string
  maxEvents?: number
}

export function IntelligenceTimeline({ 
  className,
  competitorId,
  timeRange = "7d",
  maxEvents = 50
}: IntelligenceTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all")
  const [importanceFilter, setImportanceFilter] = useState<string>("all")
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchTimelineEvents()
  }, [competitorId, timeRange])

  const fetchTimelineEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        timeRange,
        limit: maxEvents.toString(),
      })
      
      if (competitorId) {
        params.append('competitorId', competitorId.toString())
      }
      
      const response = await fetch(`/api/competitors/intelligence/timeline?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching timeline events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'website_change': return <Globe className="w-4 h-4" />
      case 'social_post': return <Activity className="w-4 h-4" />
      case 'news_mention': return <TrendingUp className="w-4 h-4" />
      case 'job_posting': return <Users className="w-4 h-4" />
      case 'product_launch': return <Zap className="w-4 h-4" />
      case 'pricing_change': return <TrendingUp className="w-4 h-4" />
      case 'funding': return <TrendingUp className="w-4 h-4" />
      case 'partnership': return <Users className="w-4 h-4" />
      default: return <Eye className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'website_change': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20'
      case 'social_post': return 'text-green-500 bg-green-100 dark:bg-green-900/20'
      case 'news_mention': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20'
      case 'job_posting': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20'
      case 'product_launch': return 'text-red-500 bg-red-100 dark:bg-red-900/20'
      case 'pricing_change': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20'
      case 'funding': return 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20'
      case 'partnership': return 'text-pink-500 bg-pink-100 dark:bg-pink-900/20'
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'border-red-500'
      case 'high': return 'border-orange-500'
      case 'medium': return 'border-yellow-500'
      case 'low': return 'border-green-500'
      default: return 'border-gray-500'
    }
  }

  const getImportanceBadge = (importance: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return colors[importance as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getEventTypeLabel = (type: string) => {
    const labels = {
      website_change: 'Website Change',
      social_post: 'Social Media',
      news_mention: 'News Mention',
      job_posting: 'Job Posting',
      product_launch: 'Product Launch',
      pricing_change: 'Pricing Change',
      funding: 'Funding News',
      partnership: 'Partnership'
    }
    return labels[type as keyof typeof labels] || type
  }

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.competitorName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = eventTypeFilter === "all" || event.eventType === eventTypeFilter
    const matchesImportance = importanceFilter === "all" || event.importance === importanceFilter
    
    return matchesSearch && matchesType && matchesImportance
  })

  const groupEventsByDate = (events: TimelineEvent[]) => {
    const groups: { [key: string]: TimelineEvent[] } = {}
    
    events.forEach(event => {
      const date = new Date(event.timestamp).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
    })
    
    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    )
  }

  const groupedEvents = groupEventsByDate(filteredEvents)

  if (loading) {
    return (
      <BossCard className={className}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </BossCard>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header and Filters */}
        <EmpowermentCard>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gradient flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Intelligence Timeline</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Chronological view of competitor activities and analysis
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="website_change">Website Changes</SelectItem>
                  <SelectItem value="social_post">Social Media</SelectItem>
                  <SelectItem value="news_mention">News Mentions</SelectItem>
                  <SelectItem value="job_posting">Job Postings</SelectItem>
                  <SelectItem value="product_launch">Product Launches</SelectItem>
                  <SelectItem value="pricing_change">Pricing Changes</SelectItem>
                  <SelectItem value="funding">Funding News</SelectItem>
                  <SelectItem value="partnership">Partnerships</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={importanceFilter} onValueChange={setImportanceFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Importance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </EmpowermentCard>

        {/* Timeline */}
        <BossCard>
          <div className="space-y-6">
            {groupedEvents.length > 0 ? (
              groupedEvents.map(([date, dayEvents], dayIndex) => (
                <div key={date} className="space-y-4">
                  {/* Date Header */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                    </div>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                    <Badge variant="outline" className="text-xs">
                      {dayEvents.length} events
                    </Badge>
                  </div>

                  {/* Events for this date */}
                  <div className="space-y-3 ml-6">
                    {dayEvents
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((event, eventIndex) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (dayIndex * 0.1) + (eventIndex * 0.05) }}
                          className={`
                            relative border-l-4 pl-6 pb-4
                            ${getThreatLevelColor(event.threatLevel)}
                          `}
                        >
                          {/* Timeline dot */}
                          <div className={`
                            absolute -left-2 top-2 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800
                            ${getEventColor(event.eventType).split(' ')[1]}
                          `}>
                            <div className="w-full h-full rounded-full flex items-center justify-center">
                              <div className={`w-2 h-2 rounded-full ${getEventColor(event.eventType).split(' ')[0]} bg-current`}></div>
                            </div>
                          </div>

                          <Collapsible>
                            <div className="space-y-3">
                              {/* Event Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <div className={`p-1 rounded ${getEventColor(event.eventType)}`}>
                                      {getEventIcon(event.eventType)}
                                    </div>
                                    <h5 className="font-semibold text-sm">{event.title}</h5>
                                    <Badge 
                                      variant="outline" 
                                      className={getImportanceBadge(event.importance)}
                                    >
                                      {event.importance.toUpperCase()}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    <span>{event.competitorName}</span>
                                    <span>•</span>
                                    <span>{getEventTypeLabel(event.eventType)}</span>
                                    <span>•</span>
                                    <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                    {event.impactScore > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>Impact: {event.impactScore}/100</span>
                                      </>
                                    )}
                                  </div>
                                  
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    {event.description}
                                  </p>
                                  
                                  {/* Tags */}
                                  {event.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {event.tags.slice(0, 3).map((tag, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {event.tags.length > 3 && (
                                        <Badge variant="secondary" className="text-xs">
                                          +{event.tags.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  {event.sourceUrl && (
                                    <BossButton
                                      variant="secondary"
                                      size="sm"
                                      icon={<ExternalLink className="w-3 h-3" />}
                                      onClick={() => window.open(event.sourceUrl, '_blank')}
                                    >
                                      Source
                                    </BossButton>
                                  )}
                                  
                                  {event.analysisResults && event.analysisResults.length > 0 && (
                                    <CollapsibleTrigger asChild>
                                      <BossButton
                                        variant="secondary"
                                        size="sm"
                                        icon={expandedEvents.has(event.id) ? 
                                          <ChevronUp className="w-3 h-3" /> : 
                                          <ChevronDown className="w-3 h-3" />
                                        }
                                        onClick={() => toggleEventExpansion(event.id)}
                                      >
                                        Analysis
                                      </BossButton>
                                    </CollapsibleTrigger>
                                  )}
                                </div>
                              </div>

                              {/* Expandable Analysis Results */}
                              {event.analysisResults && event.analysisResults.length > 0 && (
                                <CollapsibleContent>
                                  <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    {event.analysisResults.map((result, index) => (
                                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                                                {result.agentName.charAt(0)}
                                              </span>
                                            </div>
                                            <span className="font-medium text-sm">{result.agentName}</span>
                                            <Badge variant="outline" className="text-xs">
                                              {result.analysisType}
                                            </Badge>
                                          </div>
                                          <span className="text-xs text-gray-500">
                                            {Math.round(result.confidence * 100)}% confidence
                                          </span>
                                        </div>
                                        
                                        {result.insights.length > 0 && (
                                          <div className="mb-2">
                                            <h6 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">
                                              Key Insights:
                                            </h6>
                                            <ul className="space-y-1">
                                              {result.insights.map((insight, i) => (
                                                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start space-x-1">
                                                  <span className="text-blue-500 mt-1">•</span>
                                                  <span>{insight}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        
                                        {result.recommendations.length > 0 && (
                                          <div>
                                            <h6 className="font-medium text-xs text-gray-700 dark:text-gray-300 mb-1">
                                              Recommendations:
                                            </h6>
                                            <ul className="space-y-1">
                                              {result.recommendations.map((rec, i) => (
                                                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start space-x-1">
                                                  <span className="text-green-500 mt-1">•</span>
                                                  <span>{rec}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              )}
                            </div>
                          </Collapsible>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  {searchQuery || eventTypeFilter !== "all" || importanceFilter !== "all" 
                    ? "No events match your filters" 
                    : "No intelligence events yet"
                  }
                </h4>
                <p className="text-gray-500 mb-4">
                  {searchQuery || eventTypeFilter !== "all" || importanceFilter !== "all"
                    ? "Try adjusting your search criteria or filters"
                    : "Intelligence events will appear here as competitors are monitored"
                  }
                </p>
                {(searchQuery || eventTypeFilter !== "all" || importanceFilter !== "all") && (
                  <BossButton 
                    variant="secondary"
                    onClick={() => {
                      setSearchQuery("")
                      setEventTypeFilter("all")
                      setImportanceFilter("all")
                    }}
                  >
                    Clear Filters
                  </BossButton>
                )}
              </div>
            )}
          </div>
        </BossCard>
      </div>
    </div>
  )
}