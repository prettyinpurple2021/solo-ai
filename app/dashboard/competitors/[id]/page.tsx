"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Globe, 
  Building, 
  Users, 
  DollarSign,
  Shield,
  Eye,
  Zap,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ExternalLink,
  Settings,
  RefreshCw,
  Target,
  Lightbulb,
  Activity,
  BarChart3,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Clock,
  MapPin,
  Briefcase,
  Award,
  ChevronRight,
  Plus
} from "lucide-react"
import Link from "next/link"

import { BossCard, EmpowermentCard, StatsCard } from "@/components/ui/boss-card"
import { BossButton, ZapButton } from "@/components/ui/boss-button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loading } from "@/components/ui/loading"

interface CompetitorProfile {
  id: number
  name: string
  domain: string
  description: string
  industry: string
  headquarters: string
  foundedYear: number
  employeeCount: number
  fundingStage: string
  fundingAmount: number
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  monitoringStatus: 'active' | 'paused' | 'archived'
  socialMediaHandles: {
    linkedin?: string
    twitter?: string
    facebook?: string
    instagram?: string
  }
  keyPersonnel: Array<{
    name: string
    role: string
    linkedinProfile?: string
    joinedDate?: string
  }>
  products: Array<{
    name: string
    description: string
    category: string
    status: string
  }>
  competitiveAdvantages: string[]
  vulnerabilities: string[]
  lastAnalyzed: string
  createdAt: string
}

interface ActivityItem {
  id: number
  type: 'website_change' | 'social_post' | 'news_mention' | 'job_posting' | 'product_update'
  title: string
  description: string
  source: string
  importance: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  metadata?: any
}

interface Alert {
  id: number
  type: string
  severity: 'info' | 'warning' | 'urgent' | 'critical'
  title: string
  description: string
  timestamp: string
  isRead: boolean
}

interface Insight {
  id: number
  type: 'opportunity' | 'threat' | 'trend' | 'recommendation'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  actionItems: string[]
  generatedBy: string
  timestamp: string
}

export default function CompetitorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const competitorId = params.id as string
  
  const [competitor, setCompetitor] = useState<CompetitorProfile | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchCompetitorData()
  }, [competitorId])

  const fetchCompetitorData = async () => {
    try {
      setLoading(true)
      
      // Mock data for now
      const mockCompetitor: CompetitorProfile = {
        id: parseInt(competitorId),
        name: "TechRival Corp",
        domain: "techrival.com",
        description: "AI-powered productivity platform targeting solo entrepreneurs and small businesses with advanced automation tools.",
        industry: "Technology",
        headquarters: "San Francisco, CA",
        foundedYear: 2019,
        employeeCount: 150,
        fundingStage: "Series B",
        fundingAmount: 25000000,
        threatLevel: "high",
        monitoringStatus: "active",
        socialMediaHandles: {
          linkedin: "https://linkedin.com/company/techrival",
          twitter: "https://twitter.com/techrival",
          facebook: "https://facebook.com/techrival"
        },
        keyPersonnel: [
          {
            name: "Sarah Chen",
            role: "CEO & Co-founder",
            linkedinProfile: "https://linkedin.com/in/sarahchen",
            joinedDate: "2019-01-15"
          },
          {
            name: "Marcus Rodriguez",
            role: "CTO & Co-founder",
            linkedinProfile: "https://linkedin.com/in/marcusrodriguez",
            joinedDate: "2019-01-15"
          },
          {
            name: "Emily Watson",
            role: "VP of Marketing",
            linkedinProfile: "https://linkedin.com/in/emilywatson",
            joinedDate: "2021-03-10"
          }
        ],
        products: [
          {
            name: "TechRival AI Assistant",
            description: "AI-powered business automation platform",
            category: "Productivity",
            status: "active"
          },
          {
            name: "TechRival Analytics",
            description: "Business intelligence and analytics dashboard",
            category: "Analytics",
            status: "active"
          }
        ],
        competitiveAdvantages: [
          "Strong VC backing ($25M Series B)",
          "Experienced founding team",
          "Enterprise partnerships with Fortune 500",
          "Advanced AI technology stack",
          "Strong brand recognition"
        ],
        vulnerabilities: [
          "Limited mobile app functionality",
          "High pricing compared to competitors",
          "Dependency on third-party integrations",
          "Small customer support team",
          "Limited international presence"
        ],
        lastAnalyzed: "2024-01-15T10:30:00Z",
        createdAt: "2024-01-01T00:00:00Z"
      }

      const mockActivities: ActivityItem[] = [
        {
          id: 1,
          type: 'website_change',
          title: 'Pricing page updated',
          description: 'TechRival updated their pricing structure, reducing the starter plan by 20%',
          source: 'techrival.com/pricing',
          importance: 'high',
          timestamp: '2024-01-15T09:30:00Z'
        },
        {
          id: 2,
          type: 'social_post',
          title: 'New product feature announcement',
          description: 'Announced AI-powered workflow automation on LinkedIn',
          source: 'LinkedIn',
          importance: 'medium',
          timestamp: '2024-01-14T16:45:00Z'
        },
        {
          id: 3,
          type: 'job_posting',
          title: 'Hiring Senior AI Engineer',
          description: 'Posted new job opening for Senior AI Engineer position',
          source: 'LinkedIn Jobs',
          importance: 'medium',
          timestamp: '2024-01-13T11:20:00Z'
        },
        {
          id: 4,
          type: 'news_mention',
          title: 'Featured in TechCrunch',
          description: 'Article about AI productivity tools mentions TechRival as market leader',
          source: 'TechCrunch',
          importance: 'high',
          timestamp: '2024-01-12T14:15:00Z'
        }
      ]

      const mockAlerts: Alert[] = [
        {
          id: 1,
          type: 'pricing_change',
          severity: 'urgent',
          title: 'Competitor reduced pricing by 20%',
          description: 'TechRival lowered their starter plan price from $49 to $39/month',
          timestamp: '2024-01-15T09:30:00Z',
          isRead: false
        },
        {
          id: 2,
          type: 'product_launch',
          severity: 'warning',
          title: 'New AI feature announced',
          description: 'TechRival launched AI-powered workflow automation feature',
          timestamp: '2024-01-14T16:45:00Z',
          isRead: false
        },
        {
          id: 3,
          type: 'hiring',
          severity: 'info',
          title: 'Expanding AI team',
          description: 'Posted job opening for Senior AI Engineer - indicates AI investment',
          timestamp: '2024-01-13T11:20:00Z',
          isRead: true
        }
      ]

      const mockInsights: Insight[] = [
        {
          id: 1,
          type: 'opportunity',
          title: 'Pricing Gap Opportunity',
          description: 'TechRival\'s pricing reduction creates an opportunity to position our premium features as better value',
          confidence: 85,
          impact: 'high',
          actionItems: [
            'Review our pricing strategy',
            'Highlight premium features in marketing',
            'Consider competitive pricing adjustment'
          ],
          generatedBy: 'Blaze',
          timestamp: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          type: 'threat',
          title: 'AI Feature Competition',
          description: 'TechRival\'s new AI automation feature directly competes with our core offering',
          confidence: 92,
          impact: 'high',
          actionItems: [
            'Accelerate our AI roadmap',
            'Differentiate our AI capabilities',
            'Prepare competitive response campaign'
          ],
          generatedBy: 'Nova',
          timestamp: '2024-01-14T17:00:00Z'
        },
        {
          id: 3,
          type: 'trend',
          title: 'Increased AI Investment',
          description: 'Hiring patterns suggest TechRival is heavily investing in AI capabilities',
          confidence: 78,
          impact: 'medium',
          actionItems: [
            'Monitor their AI team growth',
            'Track AI-related job postings',
            'Analyze their AI technology stack'
          ],
          generatedBy: 'Lexi',
          timestamp: '2024-01-13T12:00:00Z'
        }
      ]

      setCompetitor(mockCompetitor)
      setActivities(mockActivities)
      setAlerts(mockAlerts)
      setInsights(mockInsights)
    } catch (error) {
      console.error('Error fetching competitor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCompetitorData()
    setRefreshing(false)
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'website_change': return <Globe className="w-4 h-4" />
      case 'social_post': return <MessageSquare className="w-4 h-4" />
      case 'news_mention': return <Activity className="w-4 h-4" />
      case 'job_posting': return <Briefcase className="w-4 h-4" />
      case 'product_update': return <Zap className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-500'
      case 'high': return 'text-orange-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="w-5 h-5 text-green-500" />
      case 'threat': return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'trend': return <TrendingUp className="w-5 h-5 text-blue-500" />
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-yellow-500" />
      default: return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-background p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading 
            variant="boss" 
            size="lg" 
            text="Loading competitor profile..."
          />
        </div>
      </div>
    )
  }

  if (!competitor) {
    return (
      <div className="min-h-screen gradient-background p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmpowermentCard className="max-w-md">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gradient">Competitor Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400">
                The competitor profile you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/dashboard/competitors">
                <BossButton variant="primary">
                  Back to Dashboard
                </BossButton>
              </Link>
            </div>
          </EmpowermentCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-background p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/competitors">
              <BossButton variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </BossButton>
            </Link>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-4 h-4 rounded-full ${getThreatLevelColor(competitor.threatLevel)}`} />
                <h1 className="text-3xl font-bold text-gradient">{competitor.name}</h1>
                <Badge 
                  variant="outline" 
                  className={getThreatLevelBadge(competitor.threatLevel)}
                >
                  {competitor.threatLevel.toUpperCase()} THREAT
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {competitor.domain} • Last analyzed {new Date(competitor.lastAnalyzed).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <BossButton
              variant="secondary"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              Refresh Data
            </BossButton>
            <BossButton
              variant="secondary"
              size="sm"
              icon={<Settings className="w-4 h-4" />}
            >
              Configure
            </BossButton>
            <ZapButton
              icon={<Zap className="w-4 h-4" />}
            >
              Trigger Enrichment
            </ZapButton>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Employees"
            value={competitor.employeeCount.toLocaleString()}
            icon={<Users className="w-6 h-6 text-white" />}
            trend={{ value: 12, isPositive: true }}
          />
          
          <StatsCard
            title="Funding"
            value={`$${(competitor.fundingAmount / 1000000).toFixed(1)}M`}
            icon={<DollarSign className="w-6 h-6 text-white" />}
            trend={{ value: 0, isPositive: true }}
          />
          
          <StatsCard
            title="Recent Activities"
            value={activities.length}
            icon={<Activity className="w-6 h-6 text-white" />}
            trend={{ value: 25, isPositive: true }}
          />
          
          <StatsCard
            title="Active Alerts"
            value={alerts.filter(a => !a.isRead).length}
            icon={<AlertTriangle className="w-6 h-6 text-white" />}
            trend={{ value: 15, isPositive: false }}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Company Info */}
              <div className="lg:col-span-2 space-y-6">
                <EmpowermentCard>
                  <h3 className="text-xl font-bold text-gradient mb-4">Company Information</h3>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">{competitor.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Industry:</span>
                        <span className="font-medium">{competitor.industry}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">HQ:</span>
                        <span className="font-medium">{competitor.headquarters}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Founded:</span>
                        <span className="font-medium">{competitor.foundedYear}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-500">Stage:</span>
                        <span className="font-medium">{competitor.fundingStage}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        {competitor.socialMediaHandles.linkedin && (
                          <a 
                            href={competitor.socialMediaHandles.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            LinkedIn <ExternalLink className="w-3 h-3 inline ml-1" />
                          </a>
                        )}
                        {competitor.socialMediaHandles.twitter && (
                          <a 
                            href={competitor.socialMediaHandles.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-600"
                          >
                            Twitter <ExternalLink className="w-3 h-3 inline ml-1" />
                          </a>
                        )}
                        {competitor.domain && (
                          <a 
                            href={`https://${competitor.domain}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800"
                          >
                            Website <ExternalLink className="w-3 h-3 inline ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </EmpowermentCard>

                {/* Products */}
                <EmpowermentCard>
                  <h3 className="text-xl font-bold text-gradient mb-4">Products & Services</h3>
                  <div className="space-y-3">
                    {competitor.products.map((product, index) => (
                      <div key={index} className="p-4 glass rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{product.name}</h4>
                          <Badge variant="outline">{product.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
                      </div>
                    ))}
                  </div>
                </EmpowermentCard>
              </div>

              {/* Key Personnel */}
              <div className="space-y-6">
                <EmpowermentCard>
                  <h3 className="text-xl font-bold text-gradient mb-4">Key Personnel</h3>
                  <div className="space-y-4">
                    {competitor.keyPersonnel.map((person, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{person.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{person.role}</p>
                          {person.joinedDate && (
                            <p className="text-xs text-gray-500">
                              Joined {new Date(person.joinedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {person.linkedinProfile && (
                          <a 
                            href={person.linkedinProfile} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </EmpowermentCard>

                {/* Competitive Analysis */}
                <EmpowermentCard>
                  <h3 className="text-xl font-bold text-gradient mb-4">Competitive Analysis</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Advantages
                      </h4>
                      <ul className="space-y-1">
                        {competitor.competitiveAdvantages.map((advantage, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Vulnerabilities
                      </h4>
                      <ul className="space-y-1">
                        {competitor.vulnerabilities.map((vulnerability, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {vulnerability}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </EmpowermentCard>
              </div>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <EmpowermentCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gradient">Recent Activity</h3>
                <BossButton variant="secondary" size="sm">
                  View All Activity
                </BossButton>
              </div>
              
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 glass rounded-lg">
                    <div className={`p-2 rounded-full ${getImportanceColor(activity.importance)} bg-opacity-10`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{activity.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{activity.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {activity.source}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getImportanceColor(activity.importance)}`}
                        >
                          {activity.importance.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </EmpowermentCard>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.map((insight) => (
                <EmpowermentCard key={insight.id}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Generated by {insight.generatedBy}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {insight.confidence}% confidence
                        </div>
                        <Progress value={insight.confidence} className="w-16 h-2 mt-1" />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {insight.description}
                    </p>
                    
                    <div>
                      <h5 className="font-medium mb-2">Recommended Actions:</h5>
                      <ul className="space-y-1">
                        {insight.actionItems.map((action, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <ChevronRight className="w-3 h-3 mt-0.5 mr-1 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          insight.impact === 'high' ? 'text-red-600' :
                          insight.impact === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}
                      >
                        {insight.impact.toUpperCase()} IMPACT
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(insight.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </EmpowermentCard>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <EmpowermentCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gradient">Active Alerts</h3>
                <BossButton variant="secondary" size="sm">
                  Mark All Read
                </BossButton>
              </div>
              
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-4 glass rounded-lg border-l-4 ${
                      alert.severity === 'critical' ? 'border-red-500' :
                      alert.severity === 'urgent' ? 'border-orange-500' :
                      alert.severity === 'warning' ? 'border-yellow-500' :
                      'border-blue-500'
                    } ${!alert.isRead ? 'bg-opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={getSeverityColor(alert.severity)}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {!alert.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <BossButton variant="secondary" size="sm">
                        View Details
                      </BossButton>
                    </div>
                  </div>
                ))}
              </div>
            </EmpowermentCard>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmpowermentCard>
                <h3 className="text-xl font-bold text-gradient mb-4">Threat Assessment</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Overall Threat Level</span>
                    <Badge 
                      variant="outline" 
                      className={getThreatLevelBadge(competitor.threatLevel)}
                    >
                      {competitor.threatLevel.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Market Overlap</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Competitive Strength</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Growth Rate</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </div>
                </div>
              </EmpowermentCard>

              <EmpowermentCard>
                <h3 className="text-xl font-bold text-gradient mb-4">Monitoring Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge 
                      variant={competitor.monitoringStatus === 'active' ? 'default' : 'secondary'}
                    >
                      {competitor.monitoringStatus.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Website Monitoring</span>
                      <span className="text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Social Media</span>
                      <span className="text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>News Tracking</span>
                      <span className="text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Job Postings</span>
                      <span className="text-green-600">Active</span>
                    </div>
                  </div>
                  
                  <BossButton variant="secondary" size="sm" fullWidth>
                    Configure Monitoring
                  </BossButton>
                </div>
              </EmpowermentCard>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}