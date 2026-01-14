"use client"

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useState} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Input} from "@/components/ui/input"
import { Label} from "@/components/ui/label"
import { Badge} from "@/components/ui/badge"
import { Progress} from "@/components/ui/progress"
import { Alert} from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import { Shield, AlertTriangle, Eye, CheckCircle, Database, Cookie, User, Download, FileText} from "lucide-react"


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
  const [isDetailedAnalysisOpen, setIsDetailedAnalysisOpen] = useState(false)

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

      try {
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
      } catch (apiError) {
        logError('API Error:', apiError)
        
        // Fallback to empty results when API fails
        clearInterval(progressInterval)
        setScanProgress(100)
        
        const emptyScanResults: ComplianceScan = {
          url: url,
          scanDate: new Date(),
          trustScore: 0,
          issues: [],
          dataCollectionPoints: [],
          cookieTypes: [],
          consentMechanisms: [],
          pageTitle: "",
          hasPrivacyPolicy: false,
          hasCookieBanner: false,
          hasContactForm: false,
          hasNewsletterSignup: false,
          hasAnalytics: false
        }
        
        setScanResults(emptyScanResults)
      }
    } catch (error) {
      logError('Scan error:', error)
      // Handle error - could show a toast notification here
    } finally {
      setIsScanning(false)
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-neon-lime"
    if (score >= 60) return "text-neon-orange"
    return "text-neon-magenta"
  }

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-neon-magenta" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-neon-orange" />
      case "info":
        return <Eye className="w-4 h-4 text-neon-cyan" />
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

  const generateComplianceReport = () => {
    if (!scanResults) return

    const reportData = {
      title: `Compliance Report for ${scanResults.url}`,
      scanDate: scanResults.scanDate.toLocaleDateString(),
      trustScore: scanResults.trustScore,
      issues: scanResults.issues,
      dataCollectionPoints: scanResults.dataCollectionPoints,
      cookieTypes: scanResults.cookieTypes,
      consentMechanisms: scanResults.consentMechanisms,
      pageTitle: scanResults.pageTitle,
      hasPrivacyPolicy: scanResults.hasPrivacyPolicy,
      hasCookieBanner: scanResults.hasCookieBanner,
      hasContactForm: scanResults.hasContactForm,
      hasNewsletterSignup: scanResults.hasNewsletterSignup,
      hasAnalytics: scanResults.hasAnalytics
    }

    // Create a formatted text report
    const reportContent = `
GUARDIAN AI COMPLIANCE REPORT
============================

Website: ${reportData.title}
Scan Date: ${reportData.scanDate}
Trust Score: ${reportData.trustScore}/100

EXECUTIVE SUMMARY
-----------------
${reportData.trustScore >= 80 ? 'Excellent compliance status with minimal issues.' : 
  reportData.trustScore >= 60 ? 'Good compliance with some areas for improvement.' : 
  'Significant compliance issues require immediate attention.'}

SCAN RESULTS
------------
Page Title: ${reportData.pageTitle}
Privacy Policy: ${reportData.hasPrivacyPolicy ? 'Present' : 'Missing'}
Cookie Banner: ${reportData.hasCookieBanner ? 'Present' : 'Missing'}
Contact Form: ${reportData.hasContactForm ? 'Present' : 'Not detected'}
Newsletter Signup: ${reportData.hasNewsletterSignup ? 'Present' : 'Not detected'}
Analytics Tracking: ${reportData.hasAnalytics ? 'Present' : 'Not detected'}

DATA COLLECTION POINTS (${reportData.dataCollectionPoints.length})
${reportData.dataCollectionPoints.map(point => `- ${point}`).join('\n')}

COOKIE TYPES (${reportData.cookieTypes.length})
${reportData.cookieTypes.map(type => `- ${type}`).join('\n')}

CONSENT MECHANISMS (${reportData.consentMechanisms.length})
${reportData.consentMechanisms.map(mechanism => `- ${mechanism}`).join('\n')}

COMPLIANCE ISSUES FOUND (${reportData.issues.length})
${reportData.issues.map((issue, index) => `
${index + 1}. ${issue.title} [${issue.type.toUpperCase()}]
   Category: ${issue.category}
   Description: ${issue.description}
   Recommendation: ${issue.recommendation}
   ${issue.gdpr_article ? `GDPR: ${issue.gdpr_article}` : ''}
   ${issue.ccpa_section ? `CCPA: ${issue.ccpa_section}` : ''}
`).join('\n')}

RECOMMENDATIONS
---------------
${reportData.issues.length === 0 ? 
  'No critical issues found. Continue monitoring for compliance.' :
  'Address the issues listed above to improve compliance standing.'}

---
Report generated by Guardian AI
This report does not constitute legal advice. Consult with qualified legal professionals.
    `.trim()

    // Create and download the report
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compliance-report-${scanResults.url.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const openDetailedAnalysis = () => {
    setIsDetailedAnalysisOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-orbitron uppercase tracking-wider">
            <Shield className="w-5 h-5 text-neon-purple" />
            Guardian AI Compliance Scanner
          </CardTitle>
          <CardDescription className="font-mono">
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
              <CardTitle className="flex items-center gap-2 font-orbitron uppercase tracking-wider">
                <CheckCircle className="w-5 h-5 text-neon-lime" />
                Compliance Trust Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`text-4xl font-bold ${getTrustScoreColor(scanResults.trustScore)}`}>
                  {scanResults.trustScore}/100
                </div>
                <div className="text-sm text-gray-300 font-mono">
                  {scanResults.trustScore >= 80 ? "Excellent compliance" : 
                   scanResults.trustScore >= 60 ? "Good compliance with room for improvement" : 
                   "Needs immediate attention"}
                </div>
                {scanResults.trustScore >= 80 && (
                  <Badge className="bg-dark-card text-neon-lime border border-neon-lime">
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
                        <p className="text-sm text-gray-300 mb-2 font-mono">{issue.description}</p>
                        <div className="bg-dark-hover p-3 rounded-sm border border-gray-700">
                          <p className="text-sm font-medium mb-1 font-mono">Recommendation:</p>
                          <p className="text-sm font-mono">{issue.recommendation}</p>
                        </div>
                        {(issue.gdpr_article || issue.ccpa_section) && (
                          <div className="flex gap-4 mt-2 text-xs text-gray-500 font-mono">
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
                <div className="text-center p-4 bg-dark-card border border-neon-cyan rounded-sm">
                  <Database className="w-8 h-8 mx-auto mb-2 text-neon-cyan" />
                  <div className="font-semibold font-mono">{scanResults.dataCollectionPoints.length}</div>
                  <div className="text-sm text-gray-300 font-mono">Data Collection Points</div>
                </div>
                <div className="text-center p-4 bg-dark-card border border-neon-lime rounded-sm">
                  <Cookie className="w-8 h-8 mx-auto mb-2 text-neon-lime" />
                  <div className="font-semibold font-mono">{scanResults.cookieTypes.length}</div>
                  <div className="text-sm text-gray-300 font-mono">Cookie Types</div>
                </div>
                <div className="text-center p-4 bg-dark-card border border-neon-purple rounded-sm">
                  <User className="w-8 h-8 mx-auto mb-2 text-neon-purple" />
                  <div className="font-semibold font-mono">{scanResults.consentMechanisms.length}</div>
                  <div className="text-sm text-gray-300 font-mono">Consent Mechanisms</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              className="bg-neon-purple hover:bg-neon-purple/80 font-mono font-bold uppercase tracking-wider"
              onClick={generateComplianceReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Generate Compliance Report
            </Button>
            <Dialog open={isDetailedAnalysisOpen} onOpenChange={setIsDetailedAnalysisOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={openDetailedAnalysis}>
                  <FileText className="w-4 h-4 mr-2" />
                  View Detailed Analysis
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detailed Compliance Analysis</DialogTitle>
                  <DialogDescription>
                    Comprehensive analysis for {scanResults?.url}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Technical Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Technical Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Page Title:</p>
                          <p className="text-gray-300 font-mono">{scanResults?.pageTitle || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="font-medium font-mono">Scan Date:</p>
                          <p className="text-gray-300 font-mono">{scanResults?.scanDate.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-medium font-mono">Privacy Policy:</p>
                          <p className={`font-mono ${scanResults?.hasPrivacyPolicy ? 'text-neon-lime' : 'text-neon-magenta'}`}>
                            {scanResults?.hasPrivacyPolicy ? 'Detected' : 'Not Found'}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium font-mono">Cookie Banner:</p>
                          <p className={`font-mono ${scanResults?.hasCookieBanner ? 'text-neon-lime' : 'text-neon-magenta'}`}>
                            {scanResults?.hasCookieBanner ? 'Detected' : 'Not Found'}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium font-mono">Contact Form:</p>
                          <p className={`font-mono ${scanResults?.hasContactForm ? 'text-neon-cyan' : 'text-gray-500'}`}>
                            {scanResults?.hasContactForm ? 'Detected' : 'Not Found'}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium font-mono">Newsletter Signup:</p>
                          <p className={`font-mono ${scanResults?.hasNewsletterSignup ? 'text-neon-cyan' : 'text-gray-500'}`}>
                            {scanResults?.hasNewsletterSignup ? 'Detected' : 'Not Found'}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium font-mono">Analytics Tracking:</p>
                          <p className={`font-mono ${scanResults?.hasAnalytics ? 'text-neon-orange' : 'text-gray-500'}`}>
                            {scanResults?.hasAnalytics ? 'Detected' : 'Not Found'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Compliance Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">GDPR Compliance</span>
                            <span className={`font-bold ${getTrustScoreColor(scanResults?.trustScore || 0)}`}>
                              {scanResults?.trustScore || 0}%
                            </span>
                          </div>
                          <Progress value={scanResults?.trustScore || 0} className="w-full" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">CCPA Compliance</span>
                            <span className={`font-bold ${getTrustScoreColor(scanResults?.trustScore || 0)}`}>
                              {scanResults?.trustScore || 0}%
                            </span>
                          </div>
                          <Progress value={scanResults?.trustScore || 0} className="w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Issues by Category */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Issues by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {['critical', 'warning', 'info'].map(issueType => {
                          const issuesOfType = scanResults?.issues.filter(issue => issue.type === issueType) || []
                          return issuesOfType.length > 0 && (
                            <div key={issueType}>
                              <h4 className="font-medium capitalize mb-2 flex items-center gap-2">
                                {getIssueIcon(issueType)}
                                {issueType} Issues ({issuesOfType.length})
                              </h4>
                              <div className="space-y-2 ml-6">
                                {issuesOfType.map(issue => (
                                  <div key={issue.id} className="text-sm">
                                    <p className="font-medium">{issue.title}</p>
                                    <p className="text-gray-600">{issue.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {scanResults?.issues.length === 0 ? (
                          <p className="text-neon-lime font-mono">
                            ✓ Your website appears to be compliant. Continue monitoring for any changes.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="font-medium">Priority Actions:</p>
                            {scanResults?.issues
                              .filter(issue => issue.type === 'critical')
                              .slice(0, 3)
                              .map((issue, index) => (
                                <p key={issue.id} className="text-sm">
                                  {index + 1}. {issue.recommendation}
                                </p>
                              ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  )
} 