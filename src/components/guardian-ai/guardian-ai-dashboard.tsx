"use client"

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useState, useEffect} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Badge} from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { Alert, AlertDescription} from "@/components/ui/alert"
import { Shield, CheckCircle, AlertTriangle, TrendingUp, Users, FileText, Settings} from "lucide-react"
import { ComplianceScanner} from "./compliance-scanner"
import { PolicyGenerator} from "./policy-generator"
import { ConsentManagement} from "./consent-management"


interface ComplianceMetrics {
  trustScore: number
  totalScans: number
  issuesResolved: number
  policiesGenerated: number
  activeConsents: number
  pendingRequests: number
}

export function GuardianAiDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    trustScore: 0,
    totalScans: 0,
    issuesResolved: 0,
    policiesGenerated: 0,
    activeConsents: 0,
    pendingRequests: 0
  })
  const [_loading, setLoading] = useState(true)

  // Fetch compliance data on component mount
  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        const response = await fetch('/api/compliance/history')
        if (response.ok) {
          const data = await response.json()
          setMetrics({
            trustScore: Math.round(data.summary.average_trust_score || 0),
            totalScans: data.summary.total_scans || 0,
            issuesResolved: data.summary.resolved_issues || 0,
            policiesGenerated: data.summary.active_policies || 0,
            activeConsents: data.scans.filter((scan: { has_cookie_banner: boolean }) => scan.has_cookie_banner).length || 0,
            pendingRequests: (data.summary.total_issues || 0) - (data.summary.resolved_issues || 0)
          })
        }
      } catch (error) {
        logError('Error fetching compliance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComplianceData()
  }, [])

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-neon-lime"
    if (score >= 60) return "text-neon-orange"
    return "text-neon-magenta"
  }

  const getTrustScoreStatus = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    return "Needs Attention"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-orbitron uppercase tracking-wider text-white">Guardian AI</h1>
          <p className="text-gray-300 font-mono">Your proactive compliance & ethics co-pilot</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-dark-card text-neon-lime border border-neon-lime">
            <Shield className="w-3 h-3 mr-1" />
            Guardian AI Certified
          </Badge>
        </div>
      </div>

      {/* Trust Score Banner */}
      <Card className="bg-dark-card border border-neon-purple">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-orbitron uppercase tracking-wider text-white mb-2">Compliance Trust Score</h2>
              <p className="text-gray-300 font-mono">Your current compliance status and recommendations</p>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-bold font-mono ${getTrustScoreColor(metrics.trustScore)}`}>
                {metrics.trustScore}/100
              </div>
              <div className="text-sm text-gray-300 font-mono">{getTrustScoreStatus(metrics.trustScore)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scanner">Compliance Scanner</TabsTrigger>
          <TabsTrigger value="policies">Policy Generator</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 font-mono">Total Scans</p>
                    <p className="text-2xl font-bold font-mono">{metrics.totalScans}</p>
                  </div>
                  <Shield className="w-8 h-8 text-neon-purple" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 font-mono">Issues Resolved</p>
                    <p className="text-2xl font-bold text-neon-lime font-mono">{metrics.issuesResolved}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-neon-lime" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 font-mono">Policies Generated</p>
                    <p className="text-2xl font-bold font-mono">{metrics.policiesGenerated}</p>
                  </div>
                  <FileText className="w-8 h-8 text-neon-cyan" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common compliance tasks and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab("scanner")}
                >
                  <Shield className="w-6 h-6" />
                  <span>Scan Website</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab("policies")}
                >
                  <FileText className="w-6 h-6" />
                  <span>Generate Policies</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab("consent")}
                >
                  <Users className="w-6 h-6" />
                  <span>Manage Consent</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                >
                  <Settings className="w-6 h-6" />
                  <span>Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-dark-card border border-neon-lime rounded-sm">
                  <CheckCircle className="w-5 h-5 text-neon-lime" />
                  <div>
                    <p className="font-medium font-mono">Privacy Policy Updated</p>
                    <p className="text-sm text-gray-300 font-mono">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-dark-card border border-neon-cyan rounded-sm">
                  <Shield className="w-5 h-5 text-neon-cyan" />
                  <div>
                    <p className="font-medium font-mono">Website Scan Completed</p>
                    <p className="text-sm text-gray-300 font-mono">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-dark-card border border-neon-orange rounded-sm">
                  <AlertTriangle className="w-5 h-5 text-neon-orange" />
                  <div>
                    <p className="font-medium font-mono">New Data Request Received</p>
                    <p className="text-sm text-gray-300 font-mono">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>GDPR Tip:</strong> Ensure your cookie banner appears before any non-essential cookies are set. 
                    Users must give explicit consent for marketing and analytics cookies.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>CCPA Tip:</strong> California residents have the right to know what personal information is collected 
                    and request deletion. Make sure your privacy policy clearly explains these rights.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Best Practice:</strong> Regularly review and update your privacy policies, especially when 
                    adding new data collection methods or third-party services.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Scanner Tab */}
        <TabsContent value="scanner">
          <ComplianceScanner />
        </TabsContent>

        {/* Policy Generator Tab */}
        <TabsContent value="policies">
          <PolicyGenerator />
        </TabsContent>

        {/* Consent Management Tab */}
        <TabsContent value="consent">
          <ConsentManagement />
        </TabsContent>
      </Tabs>

      {/* Footer Disclaimer */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Legal Disclaimer:</strong> Guardian AI provides automated compliance tools and guidance, but this does not 
          constitute legal advice. Always consult with qualified legal professionals to ensure your compliance with applicable 
          laws and regulations in your jurisdiction.
        </AlertDescription>
      </Alert>
    </div>
  )
} 