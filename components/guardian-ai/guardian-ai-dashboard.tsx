"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, CheckCircle, AlertTriangle, TrendingUp, Users, FileText, Settings } from "lucide-react"
import { ComplianceScanner } from "./compliance-scanner"
import { PolicyGenerator } from "./policy-generator"
import { ConsentManagement } from "./consent-management"

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
        console.error('Error fetching compliance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComplianceData()
  }, [])

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
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
          <h1 className="text-3xl font-bold text-gray-900">Guardian AI</h1>
          <p className="text-gray-600">Your proactive compliance & ethics co-pilot</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            <Shield className="w-3 h-3 mr-1" />
            Guardian AI Certified
          </Badge>
        </div>
      </div>

      {/* Trust Score Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Compliance Trust Score</h2>
              <p className="text-gray-600">Your current compliance status and recommendations</p>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-bold ${getTrustScoreColor(metrics.trustScore)}`}>
                {metrics.trustScore}/100
              </div>
              <div className="text-sm text-gray-600">{getTrustScoreStatus(metrics.trustScore)}</div>
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
                    <p className="text-sm font-medium text-gray-600">Total Scans</p>
                    <p className="text-2xl font-bold">{metrics.totalScans}</p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Issues Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.issuesResolved}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Policies Generated</p>
                    <p className="text-2xl font-bold">{metrics.policiesGenerated}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
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
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Privacy Policy Updated</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Website Scan Completed</p>
                    <p className="text-sm text-gray-600">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">New Data Request Received</p>
                    <p className="text-sm text-gray-600">2 days ago</p>
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