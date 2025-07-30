"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowLeft, Crown, CheckCircle, AlertTriangle, XCircle, Clock, Zap, Shield, Database, Globe, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ServiceStatus {
  name: string
  status: "operational" | "degraded" | "outage" | "maintenance"
  lastCheck: string
  uptime: string
  description: string
  icon: any
}

interface Incident {
  id: string
  title: string
  status: "investigating" | "identified" | "monitoring" | "resolved"
  severity: "low" | "medium" | "high" | "critical"
  date: string
  description: string
  updates: string[]
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "SoloBoss AI Platform",
      status: "operational",
      lastCheck: new Date().toLocaleTimeString(),
      uptime: "99.98%",
      description: "Main application and dashboard",
      icon: Crown
    },
    {
      name: "AI Squad Services",
      status: "operational", 
      lastCheck: new Date().toLocaleTimeString(),
      uptime: "99.95%",
      description: "AI agent processing and responses",
      icon: Zap
    },
    {
      name: "Authentication",
      status: "operational",
      lastCheck: new Date().toLocaleTimeString(),
      uptime: "99.99%",
      description: "User login and registration",
      icon: Shield
    },
    {
      name: "Database",
      status: "operational",
      lastCheck: new Date().toLocaleTimeString(),
      uptime: "99.97%",
      description: "Data storage and retrieval",
      icon: Database
    },
    {
      name: "API Services",
      status: "operational",
      lastCheck: new Date().toLocaleTimeString(),
      uptime: "99.96%",
      description: "External integrations and webhooks",
      icon: Globe
    },
    {
      name: "Email Services",
      status: "operational",
      lastCheck: new Date().toLocaleTimeString(),
      uptime: "99.94%",
      description: "Notifications and communication",
      icon: Mail
    }
  ])

  const [incidents] = useState<Incident[]>([
    {
      id: "inc-001",
      title: "Scheduled Maintenance: Infrastructure Upgrade",
      status: "resolved",
      severity: "low",
      date: "2025-01-15 03:00 UTC",
      description: "Routine infrastructure upgrade to improve performance and reliability.",
      updates: [
        "03:00 UTC - Maintenance window begins",
        "03:45 UTC - Database migration completed",
        "04:15 UTC - All services restored",
        "04:30 UTC - Maintenance completed successfully"
      ]
    }
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev => prev.map(service => ({
        ...service,
        lastCheck: new Date().toLocaleTimeString()
      })))
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-green-600 bg-green-100 border-green-200"
      case "degraded": return "text-yellow-600 bg-yellow-100 border-yellow-200"
      case "outage": return "text-red-600 bg-red-100 border-red-200"
      case "maintenance": return "text-blue-600 bg-blue-100 border-blue-200"
      default: return "text-gray-600 bg-gray-100 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return <CheckCircle className="w-5 h-5 text-green-600" />
      case "degraded": return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "outage": return <XCircle className="w-5 h-5 text-red-600" />
      case "maintenance": return <Clock className="w-5 h-5 text-blue-600" />
      default: return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-green-100 text-green-700"
      case "medium": return "bg-yellow-100 text-yellow-700"
      case "high": return "bg-orange-100 text-orange-700"
      case "critical": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const overallStatus = services.every(s => s.status === "operational") 
    ? "All Systems Operational" 
    : services.some(s => s.status === "outage")
    ? "Service Disruption"
    : "Partial Service Disruption"

  const overallStatusColor = services.every(s => s.status === "operational")
    ? "text-green-600"
    : services.some(s => s.status === "outage")
    ? "text-red-600"
    : "text-yellow-600"

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <div className="text-2xl">👑</div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SoloBoss AI
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-full">
                Start Building Empire
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <Badge className="mb-6 text-lg px-6 py-2 bg-purple-100 text-purple-700 border-purple-200 rounded-full">
            📊 System Status
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SoloBoss Status
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Real-time status and uptime monitoring for all SoloBoss AI services. 
            Stay informed about any service disruptions or maintenance windows.
          </p>
          
          {/* Overall Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-200 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-3 mb-2">
              {getStatusIcon(services.every(s => s.status === "operational") ? "operational" : "degraded")}
              <span className={`text-2xl font-bold ${overallStatusColor}`}>
                {overallStatus}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Last updated: {services[0]?.lastCheck}
            </p>
          </div>
        </div>
      </section>

      {/* Service Status */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Service Status</h2>
            <p className="text-xl text-gray-600">Current status of all SoloBoss AI services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-800">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(service.status)}
                        <Badge className={`text-xs ${getStatusColor(service.status)}`}>
                          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uptime (30 days)</span>
                      <span className="text-sm font-semibold text-gray-800">{service.uptime}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Check</span>
                      <span className="text-sm text-gray-600">{service.lastCheck}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Uptime Statistics */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Uptime Statistics</h2>
            <p className="text-lg text-gray-600">Historical uptime data for the last 30 days</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">99.97%</div>
                <div className="text-gray-600">Overall Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">14.2m</div>
                <div className="text-gray-600">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
                <div className="text-gray-600">Critical Incidents</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Recent Incidents</h2>
            <p className="text-lg text-gray-600">Latest service incidents and maintenance windows</p>
          </div>

          {incidents.length > 0 ? (
            <div className="space-y-6">
              {incidents.map((incident) => (
                <Card key={incident.id} className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {incident.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getSeverityColor(incident.severity)}`}>
                          {incident.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {incident.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{incident.date}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{incident.description}</p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-800">Updates:</h4>
                      {incident.updates.map((update, index) => (
                        <div key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                          {update}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Recent Incidents</h3>
              <p className="text-gray-600">All systems have been running smoothly! 🎉</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Stay Informed</h2>
          <p className="text-lg text-gray-600 mb-8">
            Get notified about service updates, maintenance windows, and incident reports
          </p>
          
          <Card className="max-w-2xl mx-auto shadow-lg border-0">
            <CardContent className="p-8">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Status Notifications</h3>
                <p className="text-gray-600 mb-4">
                  Subscribe to our newsletter to receive status updates and maintenance notifications directly in your inbox.
                </p>
                <div className="flex items-center justify-center gap-2 text-purple-600 font-semibold">
                  <Mail className="w-5 h-5" />
                  <span>Subscribe below for status updates! 👇</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl text-center">
            <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
            <p className="text-lg mb-6 opacity-90">
              If you're experiencing issues not reflected on this status page, please contact our support team.
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200"
                >
                  Contact Support
                </Button>
              </Link>
              <Link href="/help">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200 bg-transparent"
                >
                  Help Center
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 