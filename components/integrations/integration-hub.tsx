"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Mail,
  MessageSquare,
  CreditCard,
  BarChart3,
  FileText,
  Camera,
  Globe,
  Zap,
  Settings,
  CheckCircle,
  AlertCircle,
  Plus,
  Link,
  Sparkles,
  Crown,
  Shield,
} from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: string
  isConnected: boolean
  isPremium: boolean
  features: string[]
  setupSteps: string[]
  apiEndpoint?: string
  webhookUrl?: string
}

export function IntegrationHub() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  const integrations: Integration[] = [
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Sync your tasks and deadlines with Google Calendar for seamless scheduling",
      icon: Calendar,
      category: "productivity",
      isConnected: true,
      isPremium: false,
      features: [
        "Two-way sync with tasks",
        "Automatic deadline reminders",
        "Focus time blocking",
        "Meeting preparation alerts",
      ],
      setupSteps: [
        "Connect your Google account",
        "Select calendars to sync",
        "Configure sync preferences",
        "Set up notification rules",
      ],
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get notifications and updates directly in your Slack workspace",
      icon: MessageSquare,
      category: "communication",
      isConnected: false,
      isPremium: false,
      features: [
        "Task completion notifications",
        "Daily progress summaries",
        "AI agent updates",
        "Team collaboration alerts",
      ],
      setupSteps: [
        "Install SoloBoss Slack app",
        "Authorize workspace access",
        "Choose notification channels",
        "Configure message preferences",
      ],
    },
    {
      id: "clerk-billing",
      name: "Clerk Billing",
      description: "Subscription billing and feature gating with Clerk",
      icon: CreditCard,
      category: "finance",
      isConnected: true,
      isPremium: true,
      features: ["Subscription management", "Feature gating", "Payment processing", "User billing"],
      setupSteps: [
        "Connect Clerk Billing",
        "Configure subscription plans",
        "Set up feature gating",
        "Enable payment processing",
      ],
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "AI-powered email management and smart responses",
      icon: Mail,
      category: "communication",
      isConnected: false,
      isPremium: true,
      features: [
        "Smart email categorization",
        "AI-generated responses",
        "Priority inbox management",
        "Follow-up reminders",
      ],
      setupSteps: [
        "Authorize Gmail access",
        "Configure email filters",
        "Set up AI response templates",
        "Enable smart notifications",
      ],
    },
    {
      id: "notion",
      name: "Notion",
      description: "Sync your knowledge base and project documentation",
      icon: FileText,
      category: "productivity",
      isConnected: false,
      isPremium: false,
      features: [
        "Document synchronization",
        "Project template sharing",
        "Knowledge base integration",
        "Collaborative editing",
      ],
      setupSteps: [
        "Connect Notion workspace",
        "Select pages to sync",
        "Configure access permissions",
        "Set up auto-sync rules",
      ],
    },
    {
      id: "instagram",
      name: "Instagram Business",
      description: "Manage your Instagram presence and content scheduling",
      icon: Camera,
      category: "social",
      isConnected: true,
      isPremium: true,
      features: ["Content scheduling", "Analytics tracking", "Hashtag optimization", "Story management"],
      setupSteps: [
        "Connect Instagram Business account",
        "Authorize posting permissions",
        "Set up content calendar",
        "Configure analytics tracking",
      ],
    },
  ]

  const categories = [
    { id: "all", name: "All Integrations", count: integrations.length },
    {
      id: "productivity",
      name: "Productivity",
      count: integrations.filter((i) => i.category === "productivity").length,
    },
    {
      id: "communication",
      name: "Communication",
      count: integrations.filter((i) => i.category === "communication").length,
    },
    { id: "finance", name: "Finance", count: integrations.filter((i) => i.category === "finance").length },
    { id: "social", name: "Social Media", count: integrations.filter((i) => i.category === "social").length },
  ]

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory = activeTab === "all" || integration.category === activeTab
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const connectedCount = integrations.filter((i) => i.isConnected).length

  const handleToggleIntegration = (integrationId: string) => {
    // In a real app, this would make an API call to connect/disconnect the integration
    console.log(`Toggling integration: ${integrationId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="boss-card soloboss-gradient text-white">
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
              <Link className="h-8 w-8" />
              Integration Hub
              <Zap className="h-8 w-8" />
            </h1>
            <p className="text-lg opacity-90">Connect your favorite tools and supercharge your empire! 🔗✨</p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>{connectedCount} Connected</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>{integrations.length} Available</span>
              </div>
              <div className="flex items-center gap-1">
                <Crown className="h-4 w-4" />
                <span>Premium Features</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="boss-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search integrations... 🔍"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeTab === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(category.id)}
                  className={activeTab === category.id ? "punk-button text-white" : ""}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations.map((integration) => {
          const IconComponent = integration.icon
          return (
            <Card key={integration.id} className="boss-card relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="boss-heading flex items-center gap-2">
                        {integration.name}
                        {integration.isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {integration.category}
                        </Badge>
                        {integration.isConnected ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Available
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={integration.isConnected}
                    onCheckedChange={() => handleToggleIntegration(integration.id)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="font-medium">{integration.description}</CardDescription>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold empowering-text">Key Features:</h4>
                  <ul className="text-xs space-y-1">
                    {integration.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-purple-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Setup
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] boss-card">
                      <DialogHeader>
                        <DialogTitle className="boss-heading flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-purple-600" />
                          Setup {integration.name}
                          {integration.isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                        </DialogTitle>
                        <DialogDescription className="font-medium">{integration.description}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Features */}
                        <div className="space-y-3">
                          <h4 className="font-semibold empowering-text">What you'll get:</h4>
                          <div className="grid gap-2">
                            {integration.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Setup Steps */}
                        <div className="space-y-3">
                          <h4 className="font-semibold empowering-text">Setup Steps:</h4>
                          <div className="space-y-2">
                            {integration.setupSteps.map((step, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {integration.isPremium && (
                          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Crown className="h-4 w-4 text-yellow-600" />
                              <span className="font-semibold text-yellow-800">Premium Feature</span>
                            </div>
                            <p className="text-sm text-yellow-700">
                              This integration requires a Boss Pro subscription to unlock all features.
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1 bg-transparent">
                            Learn More
                          </Button>
                          <Button className="flex-1 punk-button text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            {integration.isConnected ? "Reconfigure" : "Connect Now"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {integration.isConnected && (
                    <Button size="sm" variant="outline" className="px-3 bg-transparent">
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Setup Suggestions */}
      <Card className="boss-card">
        <CardHeader>
          <CardTitle className="boss-heading flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Recommended Boss Combos
          </CardTitle>
          <CardDescription className="font-medium">
            Popular integration combinations that supercharge productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-bold empowering-text mb-2">📅 The Scheduler Boss</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Perfect time management with Google Calendar + Slack notifications
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-xs">+</span>
                <MessageSquare className="h-4 w-4 text-purple-600" />
                <Button size="sm" className="ml-auto punk-button text-white text-xs px-3 py-1">
                  Setup Combo
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-bold empowering-text mb-2">💰 The Revenue Tracker</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Complete financial overview with Stripe + Analytics dashboard
              </p>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                <span className="text-xs">+</span>
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <Button size="sm" className="ml-auto punk-button text-white text-xs px-3 py-1">
                  Setup Combo
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card className="boss-card">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="font-bold empowering-text">All integrations are secure and encrypted</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your data is protected with enterprise-grade security. We never store your passwords or sensitive
            information.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
