"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Input} from "@/components/ui/input"
import { Label} from "@/components/ui/label"
import { Textarea} from "@/components/ui/textarea"
import { Badge} from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { Switch} from "@/components/ui/switch"
import { Alert, AlertDescription} from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import { Shield, Settings, Clock, Eye, AlertTriangle, Download, CheckCircle} from "lucide-react"

interface DataRequest {
  id: string
  userId: string
  userEmail: string
  requestType: "access" | "deletion" | "rectification" | "portability"
  status: "pending" | "processing" | "completed" | "rejected"
  submittedAt: Date
  completedAt?: Date
  notes?: string
}

interface ConsentLog {
  id: string
  userId: string
  userEmail: string
  consentType: "cookies" | "marketing" | "analytics" | "necessary"
  action: "granted" | "denied" | "withdrawn"
  timestamp: Date
  ipAddress: string
  userAgent: string
}

interface CookieBanner {
  id: string
  name: string
  isActive: boolean
  message: string
  acceptButtonText: string
  rejectButtonText: string
  settingsButtonText: string
  position: "top" | "bottom" | "center"
  theme: "light" | "dark" | "auto"
}

export function ConsentManagement() {
  const [activeTab, setActiveTab] = useState("banner")
  const [isLoading, setIsLoading] = useState(true)
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([])
  const [consentLogs, setConsentLogs] = useState<ConsentLog[]>([])

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const type = activeTab === 'requests' ? 'requests' : 'consent'
      const res = await fetch(`/api/guardian?type=${type}`)
      const data = await res.json()
      
      if (activeTab === 'requests') {
        setDataRequests(data.map((r: any) => ({
          ...r,
          submittedAt: new Date(r.submittedAt),
          completedAt: r.completedAt ? new Date(r.completedAt) : undefined
        })))
      } else {
        setConsentLogs(data.map((l: any) => ({
          ...l,
          timestamp: new Date(l.timestamp)
        })))
      }
    } catch (error) {
      console.error('Failed to fetch guardian data', error)
    } finally {
      setIsLoading(false)
    }
  }

  const [cookieBanner, setCookieBanner] = useState<CookieBanner>({
    id: "1",
    name: "Default Cookie Banner",
    isActive: true,
    message: "We use cookies to enhance your experience and analyze our traffic. By clicking 'Accept', you consent to our use of cookies.",
    acceptButtonText: "Accept All",
    rejectButtonText: "Reject All",
    settingsButtonText: "Cookie Settings",
    position: "bottom",
    theme: "light"
  })

  const updateBanner = (field: keyof CookieBanner, value: string | boolean) => {
    setCookieBanner(prev => ({ ...prev, [field]: value }))
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-dark-card text-neon-orange border border-neon-orange",
      processing: "bg-dark-card text-neon-cyan border border-neon-cyan",
      completed: "bg-dark-card text-neon-lime border border-neon-lime",
      rejected: "bg-dark-card text-neon-magenta border border-neon-magenta"
    }
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>
  }

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case "access":
        return <Eye className="w-4 h-4" />
      case "deletion":
        return <AlertTriangle className="w-4 h-4" />
      case "rectification":
        return <Settings className="w-4 h-4" />
      case "portability":
        return <Download className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const getConsentActionColor = (action: string) => {
    switch (action) {
      case "granted":
        return "text-neon-lime"
      case "denied":
        return "text-neon-magenta"
      case "withdrawn":
        return "text-neon-orange"
      default:
        return "text-gray-300"
    }
  }

  const exportAuditTrail = () => {
    const auditData = {
      dataRequests,
      consentLogs,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `consent-audit-trail-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-orbitron uppercase tracking-wider">
            <Shield className="w-5 h-5 text-neon-purple" />
            Consent Management Hub
          </CardTitle>
          <CardDescription className="font-mono">
            Manage cookie banners, user consent, and data requests with full audit trail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="banner">Cookie Banner</TabsTrigger>
              <TabsTrigger value="requests">Data Requests</TabsTrigger>
              <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            </TabsList>

            {/* Cookie Banner Configuration */}
            <TabsContent value="banner" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="banner-active">Enable Cookie Banner</Label>
                    <Switch
                      id="banner-active"
                      checked={cookieBanner.isActive}
                      onCheckedChange={(checked) => updateBanner('isActive', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="banner-message">Banner Message</Label>
                    <Textarea
                      id="banner-message"
                      value={cookieBanner.message}
                      onChange={(e) => updateBanner('message', e.target.value)}
                      placeholder="Enter your cookie consent message..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accept-text">Accept Button Text</Label>
                      <Input
                        id="accept-text"
                        value={cookieBanner.acceptButtonText}
                        onChange={(e) => updateBanner('acceptButtonText', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reject-text">Reject Button Text</Label>
                      <Input
                        id="reject-text"
                        value={cookieBanner.rejectButtonText}
                        onChange={(e) => updateBanner('rejectButtonText', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-text">Settings Button Text</Label>
                      <Input
                        id="settings-text"
                        value={cookieBanner.settingsButtonText}
                        onChange={(e) => updateBanner('settingsButtonText', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Banner Position</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["top", "bottom", "center"].map((position) => (
                        <Button
                          key={position}
                          variant={cookieBanner.position === position ? "default" : "outline"}
                          onClick={() => updateBanner('position', position)}
                          className="capitalize"
                        >
                          {position}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Banner Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["light", "dark", "auto"].map((theme) => (
                        <Button
                          key={theme}
                          variant={cookieBanner.theme === theme ? "default" : "outline"}
                          onClick={() => updateBanner('theme', theme)}
                          className="capitalize"
                        >
                          {theme}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-dark-card border border-gray-700 rounded-sm">
                    <h4 className="font-semibold mb-2 font-mono">Preview</h4>
                    <div className={`p-4 rounded-sm border border-gray-700 ${cookieBanner.theme === 'dark' ? 'bg-dark-bg text-white' : 'bg-dark-card text-white'}`}>
                      <p className="text-sm mb-3 font-mono">{cookieBanner.message}</p>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-neon-lime hover:bg-neon-lime/80 font-mono font-bold uppercase tracking-wider">
                          {cookieBanner.acceptButtonText}
                        </Button>
                        <Button size="sm" variant="outline">
                          {cookieBanner.rejectButtonText}
                        </Button>
                        <Button size="sm" variant="outline">
                          {cookieBanner.settingsButtonText}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Banner Configuration
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview on Website
                </Button>
              </div>
            </TabsContent>

            {/* Data Requests Management */}
            <TabsContent value="requests" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold font-orbitron uppercase tracking-wider">Data Subject Requests</h3>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Requests
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRequestTypeIcon(request.requestType)}
                          <span className="capitalize">{request.requestType}</span>
                        </div>
                      </TableCell>
                      <TableCell>{request.userEmail}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.submittedAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        {request.completedAt ? request.completedAt.toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>GDPR Compliance:</strong> You have 30 days to respond to data subject requests. 
                  All requests are automatically logged for audit purposes.
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Audit Trail */}
            <TabsContent value="audit" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Consent Audit Trail</h3>
                <Button onClick={exportAuditTrail} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Audit Trail
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Consent Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.userEmail}</TableCell>
                      <TableCell className="capitalize">{log.consentType}</TableCell>
                      <TableCell>
                        <span className={`capitalize ${getConsentActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neon-lime font-mono">
                        {consentLogs.filter(log => log.action === 'granted').length}
                      </div>
                      <div className="text-sm text-gray-300 font-mono">Consents Granted</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neon-magenta font-mono">
                        {consentLogs.filter(log => log.action === 'denied').length}
                      </div>
                      <div className="text-sm text-gray-300 font-mono">Consents Denied</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-neon-cyan font-mono">
                        {dataRequests.filter(req => req.status === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-300 font-mono">Pending Requests</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 
