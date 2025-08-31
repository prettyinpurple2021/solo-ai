import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'

// Mock data for testing the dashboard
const mockCompetitors = [
  {
    id: 1,
    name: "TechRival Corp",
    domain: "techrival.com",
    description: "AI-powered productivity platform targeting solo entrepreneurs",
    industry: "Technology",
    threat_level: "high",
    monitoring_status: "active",
    employee_count: 150,
    funding_stage: "series-b",
    last_analyzed: "2024-01-15T10:30:00Z",
    competitive_advantages: ["Strong VC backing", "Enterprise partnerships"],
    vulnerabilities: ["Limited mobile app", "High pricing"],
    recent_activity_count: 12,
    alert_count: 3
  },
  {
    id: 2,
    name: "StartupSlayer",
    domain: "startupslayer.io",
    description: "Business automation tools for small businesses",
    industry: "Technology",
    threat_level: "critical",
    monitoring_status: "active",
    employee_count: 75,
    funding_stage: "series-a",
    last_analyzed: "2024-01-14T15:45:00Z",
    competitive_advantages: ["Lower pricing", "Better UX"],
    vulnerabilities: ["Limited integrations", "Small team"],
    recent_activity_count: 8,
    alert_count: 5
  },
  {
    id: 3,
    name: "BizBoost Solutions",
    domain: "bizboost.com",
    description: "Comprehensive business management platform",
    industry: "Technology",
    threat_level: "medium",
    monitoring_status: "active",
    employee_count: 200,
    funding_stage: "series-c",
    last_analyzed: "2024-01-13T09:15:00Z",
    competitive_advantages: ["Market leader", "Strong brand"],
    vulnerabilities: ["Legacy technology", "Slow innovation"],
    recent_activity_count: 15,
    alert_count: 1
  },
  {
    id: 4,
    name: "AgileWorks",
    domain: "agileworks.net",
    description: "Project management and collaboration tools",
    industry: "Technology",
    threat_level: "low",
    monitoring_status: "paused",
    employee_count: 45,
    funding_stage: "seed",
    last_analyzed: "2024-01-10T14:20:00Z",
    competitive_advantages: ["Niche focus", "Good customer support"],
    vulnerabilities: ["Limited features", "Small market"],
    recent_activity_count: 3,
    alert_count: 0
  },
  {
    id: 5,
    name: "ProductivityPro",
    domain: "productivitypro.app",
    description: "Personal productivity and task management app",
    industry: "Technology",
    threat_level: "medium",
    monitoring_status: "active",
    employee_count: 25,
    funding_stage: "seed",
    last_analyzed: "2024-01-12T11:30:00Z",
    competitive_advantages: ["Simple interface", "Mobile-first"],
    vulnerabilities: ["Limited features", "No AI integration"],
    recent_activity_count: 6,
    alert_count: 2
  }
]

const mockStats = {
  total_competitors: 5,
  active_monitoring: 4,
  critical_threats: 1,
  recent_alerts: 11,
  intelligence_collected: 47,
  opportunities_identified: 8
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type')

    if (type === 'stats') {
      return NextResponse.json(mockStats)
    }

    // Return competitors with pagination
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''
    const threatFilter = url.searchParams.get('threatLevel') || 'all'
    const industryFilter = url.searchParams.get('industry') || 'all'

    let filteredCompetitors = mockCompetitors

    // Apply search filter
    if (search) {
      filteredCompetitors = filteredCompetitors.filter(competitor =>
        competitor.name.toLowerCase().includes(search.toLowerCase()) ||
        competitor.domain.toLowerCase().includes(search.toLowerCase()) ||
        competitor.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply threat level filter
    if (threatFilter !== 'all') {
      filteredCompetitors = filteredCompetitors.filter(competitor =>
        competitor.threat_level === threatFilter
      )
    }

    // Apply industry filter
    if (industryFilter !== 'all') {
      filteredCompetitors = filteredCompetitors.filter(competitor =>
        competitor.industry === industryFilter
      )
    }

    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCompetitors = filteredCompetitors.slice(startIndex, endIndex)

    return NextResponse.json({
      competitors: paginatedCompetitors,
      pagination: {
        page,
        limit,
        total: filteredCompetitors.length,
        totalPages: Math.ceil(filteredCompetitors.length / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching mock competitors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    )
  }
}