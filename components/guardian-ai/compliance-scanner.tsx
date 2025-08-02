"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertTriangle, CheckCircle, ExternalLink, Eye, Database, Cookie, User } from "lucide-react"

interface ComplianceIssue {
  id: string
  type: "critical" | "warning" | "info"
  category: "data_collection" | "consent" | "cookies" | "privacy_policy" | "data_requests"
  title: string
  description: string
  recommendation: string
  gdpr_article?: string
  ccpa_section?: string
}

interface ComplianceScan {
  url: string
  scanDate: Date
  trustScore: number
  issues: ComplianceIssue[]
  dataCollectionPoints: string[]
  cookieTypes: string[]
  consentMechanisms: string[]
  pageTitle?: string
  hasPrivacyPolicy?: boolean
  hasCookieBanner?: boolean
  hasContactForm?: boolean
  hasNewsletterSignup?: boolean
  hasAnalytics?: boolean
}

export function ComplianceScanner() {
  const [url, setUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResults, setScanResults] = useState<ComplianceScan | null>(null)

  const startScan = async () => {
    if (!url) return

    setIsScanning(true)
    setScanProgress(0)

    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Call the real compliance scanner API
      const response = await fetch('/api/compliance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error('Failed to scan website')
      }

      const scanResults = await response.json()
      
      setScanProgress(100)
      setScanResults(scanResults)
      
      clearInterval(progressInterval)
    } catch (error) {
      console.error('Scan error:', error)
      // Handle error - could show a toast notification here
    } finally {
      setIsScanning(false)
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <Eye className="w-4 h-4 text-blue-500" />
      default:
        return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const getIssueBadgeColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Guardian AI Compliance Scanner
          </CardTitle>
          <CardDescription>
            Scan your website or app for GDPR/CCPA compliance issues and get automated recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isScanning}
              />
              <Button 
                onClick={startScan} 
                disabled={!url || isScanning}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isScanning ? "Scanning..." : "Start Scan"}
              </Button>
            </div>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Scanning website...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {scanResults && (
        <div className="space-y-6">
          {/* Trust Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Compliance Trust Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`text-4xl font-bold ${getTrustScoreColor(scanResults.trustScore)}`}>
                  {scanResults.trustScore}/100
                </div>
                <div className="text-sm text-gray-600">
                  {scanResults.trustScore >= 80 ? "Excellent compliance" : 
                   scanResults.trustScore >= 60 ? "Good compliance with room for improvement" : 
                   "Needs immediate attention"}
                </div>
                {scanResults.trustScore >= 80 && (
                  <Badge className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Guardian AI Certified
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Issues Found</CardTitle>
              <CardDescription>
                {scanResults.issues.length} issues detected that need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scanResults.issues.map((issue) => (
                  <Alert key={issue.id}>
                    <div className="flex items-start gap-3">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{issue.title}</h4>
                          <Badge className={getIssueBadgeColor(issue.type)}>
                            {issue.type.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm font-medium mb-1">Recommendation:</p>
                          <p className="text-sm">{issue.recommendation}</p>
                        </div>
                        {(issue.gdpr_article || issue.ccpa_section) && (
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            {issue.gdpr_article && <span>GDPR: {issue.gdpr_article}</span>}
                            {issue.ccpa_section && <span>CCPA: {issue.ccpa_section}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Collection Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Data Collection Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <Database className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-semibold">{scanResults.dataCollectionPoints.length}</div>
                  <div className="text-sm text-gray-600">Data Collection Points</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <Cookie className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="font-semibold">{scanResults.cookieTypes.length}</div>
                  <div className="text-sm text-gray-600">Cookie Types</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <User className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="font-semibold">{scanResults.consentMechanisms.length}</div>
                  <div className="text-sm text-gray-600">Consent Mechanisms</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Shield className="w-4 h-4 mr-2" />
              Generate Compliance Report
            </Button>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Detailed Analysis
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 