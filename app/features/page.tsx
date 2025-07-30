"use client"

import Link from "next/link"
import { ArrowLeft, Crown, Brain, Target, Sparkles, Zap, TrendingUp, Shield, Users, Briefcase, Calendar, MessageCircle, Palette, Focus, CheckCircle, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FeaturesPage() {
  const aiAgents = [
    {
      name: "Roxy",
      role: "Executive Assistant",
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      description: "Your personal EA who handles scheduling, emails, and administrative tasks with boss-level efficiency.",
      capabilities: ["Calendar Management", "Email Sorting", "Meeting Coordination", "Task Prioritization"]
    },
    {
      name: "Blaze",
      role: "Growth Strategist",
      icon: TrendingUp,
      color: "from-orange-500 to-red-500",
      description: "The marketing mastermind who develops growth strategies and identifies new business opportunities.",
      capabilities: ["Growth Planning", "Market Analysis", "Strategy Development", "Opportunity Identification"]
    },
    {
      name: "Echo",
      role: "Marketing Maven",
      icon: MessageCircle,
      color: "from-pink-500 to-purple-500",
      description: "Your creative marketing genius who crafts compelling content and manages your brand presence.",
      capabilities: ["Content Creation", "Social Media Strategy", "Brand Voice", "Campaign Planning"]
    },
    {
      name: "Lumi",
      role: "Legal & Docs",
      icon: Shield,
      color: "from-blue-500 to-indigo-500",
      description: "The legal expert who handles contracts, compliance, and documentation with precision.",
      capabilities: ["Contract Review", "Legal Compliance", "Document Templates", "Risk Assessment"]
    },
    {
      name: "Vex",
      role: "Technical Architect",
      icon: Zap,
      color: "from-green-500 to-teal-500",
      description: "Your tech wizard who handles system design, integrations, and technical problem-solving.",
      capabilities: ["System Design", "API Integrations", "Technical Planning", "Troubleshooting"]
    },
    {
      name: "Lexi",
      role: "Strategy Analyst",
      icon: Target,
      color: "from-indigo-500 to-purple-500",
      description: "The data-driven strategist who analyzes performance and provides actionable insights.",
      capabilities: ["Performance Analysis", "Strategic Insights", "Data Interpretation", "Recommendations"]
    },
    {
      name: "Nova",
      role: "Product Designer",
      icon: Sparkles,
      color: "from-cyan-500 to-blue-500",
      description: "Your creative visionary who designs beautiful user experiences and product interfaces.",
      capabilities: ["UI/UX Design", "Product Strategy", "User Research", "Design Systems"]
    },
    {
      name: "Glitch",
      role: "QA & Debug",
      icon: Focus,
      color: "from-red-500 to-orange-500",
      description: "The quality assurance expert who ensures everything works perfectly and catches issues early.",
      capabilities: ["Quality Testing", "Bug Detection", "Process Optimization", "System Monitoring"]
    }
  ]

  const coreFeatures = [
    {
      name: "SlayList",
      icon: Target,
      description: "AI-powered goal and task management system designed for ambitious solo entrepreneurs.",
      features: [
        "Smart goal breakdown and prioritization",
        "AI-assisted task scheduling",
        "Progress tracking and analytics",
        "Motivation and accountability system"
      ],
      benefits: "Achieve 3x more goals with less stress"
    },
    {
      name: "AI Squad",
      icon: Brain,
      description: "Your 8-member virtual team of specialized AI agents, each with unique expertise.",
      features: [
        "8 specialized AI agents with distinct personalities",
        "Natural conversation interface",
        "Context-aware assistance",
        "Continuous learning and adaptation"
      ],
      benefits: "Get the output of a full team as a solo entrepreneur"
    },
    {
      name: "BrandStyler Studio",
      icon: Palette,
      description: "AI-powered brand creation and design tools for consistent visual identity.",
      features: [
        "Automated brand asset generation",
        "Consistent style application",
        "Marketing material creation",
        "Brand voice development"
      ],
      benefits: "Professional branding without hiring a design team"
    },
    {
      name: "Focus Mode",
      icon: Focus,
      description: "Anti-burnout system that optimizes your energy and prevents overwhelm.",
      features: [
        "Energy-based scheduling",
        "Burnout prevention alerts",
        "Optimal work session planning",
        "Mental health monitoring"
      ],
      benefits: "Work smarter and maintain sustainable productivity"
    },
    {
      name: "Briefcase",
      icon: Briefcase,
      description: "Secure file storage and knowledge management system for your business.",
      features: [
        "Encrypted file storage",
        "AI-powered document organization",
        "Smart search and retrieval",
        "Version control and backup"
      ],
      benefits: "Keep your business organized and secure"
    },
    {
      name: "Collaboration Hub",
      icon: Users,
      description: "Tools for managing client relationships and external collaborations.",
      features: [
        "Client communication management",
        "Project collaboration tools",
        "External team coordination",
        "Contractor management"
      ],
      benefits: "Seamless collaboration without the complexity"
    }
  ]

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
              <Link href="/pricing">
                <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                  View Pricing
                </Button>
              </Link>
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
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <Badge className="mb-6 text-lg px-6 py-2 bg-purple-100 text-purple-700 border-purple-200 rounded-full">
            🚀 All Features
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Everything You Need
            </span>
            <br />
            <span className="text-gray-600 text-3xl md:text-4xl">To Build Your Empire</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover all the powerful features that make SoloBoss AI the ultimate productivity platform 
            for solo entrepreneurs. From AI agents to automation tools, we've got you covered. 💪
          </p>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="ai-squad" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger value="ai-squad" className="text-lg py-3">AI Squad</TabsTrigger>
              <TabsTrigger value="core-features" className="text-lg py-3">Core Features</TabsTrigger>
              <TabsTrigger value="integrations" className="text-lg py-3">Integrations</TabsTrigger>
            </TabsList>

            {/* AI Squad Tab */}
            <TabsContent value="ai-squad">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Your AI Squad</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  8 specialized AI agents, each with unique personalities and expertise to handle different aspects of your business
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {aiAgents.map((agent, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                    <CardContent className="p-8 text-center">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${agent.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                        <agent.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{agent.name}</h3>
                      <Badge className="mb-4 text-xs">
                        {agent.role}
                      </Badge>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {agent.description}
                      </p>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Specializes In:</h4>
                        {agent.capabilities.map((capability, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {capability}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Core Features Tab */}
            <TabsContent value="core-features">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Core Platform Features</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Powerful tools designed specifically for solo entrepreneurs who want to build without burning out
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {coreFeatures.map((feature, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-800">{feature.name}</CardTitle>
                          <p className="text-green-600 font-semibold text-sm">{feature.benefits}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-800">Key Features:</h4>
                        {feature.features.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-600">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Powerful Integrations</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Connect SoloBoss AI with your favorite tools and streamline your entire workflow
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="border-purple-200 hover:border-purple-300 transition-colors">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-6">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Productivity Tools</h3>
                    <div className="space-y-2 text-gray-600">
                      <p>• Google Calendar</p>
                      <p>• Notion & Obsidian</p>
                      <p>• Todoist & TickTick</p>
                      <p>• Slack & Discord</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 hover:border-purple-300 transition-colors">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Business Tools</h3>
                    <div className="space-y-2 text-gray-600">
                      <p>• Stripe & PayPal</p>
                      <p>• QuickBooks</p>
                      <p>• HubSpot & Salesforce</p>
                      <p>• Mailchimp & ConvertKit</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 hover:border-purple-300 transition-colors">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Communication</h3>
                    <div className="space-y-2 text-gray-600">
                      <p>• Gmail & Outlook</p>
                      <p>• Zoom & Teams</p>
                      <p>• WhatsApp Business</p>
                      <p>• Social Media APIs</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-12">
                <p className="text-gray-600 mb-6">Don't see your tool? We're constantly adding new integrations!</p>
                <Link href="/contact">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Request Integration
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Feature Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Solo Entrepreneurs Choose SoloBoss</h2>
            <p className="text-xl text-gray-600">Real benefits that make a difference in your business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">3x More Productive</h3>
              <p className="text-gray-600 leading-relaxed">
                Solo entrepreneurs report 3x higher productivity with AI agents handling routine tasks and providing expert assistance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">60% Less Burnout</h3>
              <p className="text-gray-600 leading-relaxed">
                Our anti-burnout focus system and workload optimization help maintain sustainable productivity without overwhelm.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">5x Goal Achievement</h3>
              <p className="text-gray-600 leading-relaxed">
                Smart goal breakdown and AI-assisted prioritization help entrepreneurs achieve 5x more of their ambitious goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">See SoloBoss AI in Action</h2>
          <p className="text-xl text-gray-600 mb-8">
            Watch how real solo entrepreneurs use SoloBoss AI to build their empires
          </p>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-2xl border border-purple-200">
            <div className="flex items-center justify-center mb-6">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-20 h-20">
                <Play className="w-8 h-8" />
              </Button>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              "From Overwhelmed to Empire Builder in 30 Days"
            </h3>
            <p className="text-gray-600 mb-6">
              Watch Sarah transform her struggling freelance business into a thriving empire using SoloBoss AI's complete toolkit.
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Watch Demo Video
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Your Empire?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of solo entrepreneurs who've transformed their businesses with SoloBoss AI. 
            Start your journey today and experience the power of having an AI squad! 🚀
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200"
              >
                Start for free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200 bg-transparent"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
