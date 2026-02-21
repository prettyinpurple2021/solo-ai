"use client"

export const dynamic = 'force-dynamic'

import React from "react"
import { CustomAgentChat} from "@/components/custom-agents/custom-agent-chat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Badge} from "@/components/ui/badge"
import { SubscriptionGuard} from "@/components/subscription/subscription-guard"
import { 
  Brain, Users, Workflow, Sparkles, Target, Zap, Shield, Code, BarChart3, Palette, Bug} from "lucide-react"

const AGENT_INFO = [
  {
    id: "roxy",
    name: "Roxy",
    title: "Strategic Decision Architect",
    description: "SPADE Framework expert for Type 1 decisions and strategic planning",
    icon: Target,
    color: "bg-neon-magenta",
    specialties: ["Strategic Planning", "Decision Making", "Risk Assessment", "Executive Assistance"]
  },
  {
    id: "blaze", 
    name: "Blaze",
    title: "Growth Strategist",
    description: "Cost-Benefit-Mitigation Matrix specialist for scaling and revenue growth",
    icon: Zap,
    color: "bg-neon-orange",
    specialties: ["Growth Strategy", "Sales Optimization", "Market Analysis", "Revenue Generation"]
  },
  {
    id: "echo",
    name: "Echo", 
    title: "Marketing Maven",
    description: "Content creation and brand strategy with authentic punk rock energy",
    icon: Sparkles,
    color: "bg-neon-pink",
    specialties: ["Content Creation", "Brand Strategy", "Social Media", "Community Building"]
  },
  {
    id: "lumi",
    name: "Lumi",
    title: "Guardian AI",
    description: "Compliance and legal guidance that transforms burdens into advantages",
    icon: Shield,
    color: "bg-neon-blue",
    specialties: ["GDPR/CCPA Compliance", "Policy Generation", "Legal Guidance", "Trust Building"]
  },
  {
    id: "vex",
    name: "Vex",
    title: "Technical Architect", 
    description: "System design and technical implementation with security-first approach",
    icon: Code,
    color: "bg-neon-lime",
    specialties: ["System Architecture", "Security", "Performance", "Automation"]
  },
  {
    id: "lexi",
    name: "Lexi",
    title: "Strategy Analyst",
    description: "Data analysis and insights with Five Whys root cause investigation",
    icon: BarChart3,
    color: "bg-neon-purple", 
    specialties: ["Data Analysis", "Strategic Insights", "Performance Metrics", "Pattern Recognition"]
  },
  {
    id: "nova",
    name: "Nova",
    title: "Product Designer",
    description: "UI/UX design and user experience optimization with creative flair",
    icon: Palette,
    color: "bg-neon-cyan",
    specialties: ["UI/UX Design", "User Research", "Prototyping", "Design Systems"]
  },
  {
    id: "glitch",
    name: "Glitch",
    title: "Problem-Solving Architect",
    description: "Quality assurance and debugging with systematic Five Whys analysis",
    icon: Bug,
    color: "bg-neon-red",
    specialties: ["Problem Solving", "Quality Assurance", "Debug Analysis", "System Optimization"]
  }
]

export default function CustomAgentsPage() {
  return (
    <SubscriptionGuard 
      requiredTier="accelerator" 
      feature="Custom AI Agents"
    >
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Brain className="h-8 w-8 text-neon-purple" />
          <h1 className="text-4xl font-bold font-orbitron uppercase tracking-wider bg-gradient-to-r from-neon-purple to-neon-magenta bg-clip-text text-transparent">
            Custom AI Agents
          </h1>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto font-mono">
          Your 8 specialized AI agents working together as a cohesive team. Each agent has unique capabilities, 
          personalities, and expertise areas that complement each other for comprehensive business support.
        </p>
      </div>

      {/* Agent Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-neon-purple" />
            <span className="font-orbitron uppercase tracking-wider">Meet Your AI Team</span>
          </CardTitle>
          <CardDescription className="text-gray-300 font-mono">
            Each agent specializes in different areas and can collaborate seamlessly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {AGENT_INFO.map((agent) => {
              const IconComponent = agent.icon
              return (
                <Card key={agent.id} className="hover:shadow-[0_0_15px_rgba(179,0,255,0.3)] transition-shadow rounded-sm border-2 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 rounded-full ${agent.color} flex items-center justify-center border-2 border-white/20`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold font-orbitron text-lg uppercase tracking-wider text-white">{agent.name}</h3>
                        <p className="text-sm text-gray-400 font-mono">{agent.title}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-3 font-mono">{agent.description}</p>
                    <div className="space-y-1">
                      {agent.specialties.map((specialty, index) => (
                        <Badge key={index} variant="purple" className="text-xs mr-1 mb-1">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Collaboration Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Workflow className="h-6 w-6 text-neon-purple" />
            <span className="font-orbitron uppercase tracking-wider">Collaboration Features</span>
          </CardTitle>
          <CardDescription className="text-gray-300 font-mono">
            Your agents work together intelligently to provide comprehensive solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-neon-purple/20 border-2 border-neon-purple/50 rounded-full flex items-center justify-center mx-auto">
                <Brain className="h-6 w-6 text-neon-purple" />
              </div>
              <h3 className="font-bold font-orbitron uppercase tracking-wider text-white">Intelligent Routing</h3>
              <p className="text-sm text-gray-300 font-mono">
                Requests are automatically routed to the most appropriate agent based on content and context
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-neon-orange/20 border-2 border-neon-orange/50 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-neon-orange" />
              </div>
              <h3 className="font-bold font-orbitron uppercase tracking-wider text-white">Multi-Agent Collaboration</h3>
              <p className="text-sm text-gray-300 font-mono">
                Agents can request help from each other and work together on complex problems
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-neon-lime/20 border-2 border-neon-lime/50 rounded-full flex items-center justify-center mx-auto">
                <Workflow className="h-6 w-6 text-neon-lime" />
              </div>
              <h3 className="font-bold font-orbitron uppercase tracking-wider text-white">Workflow Orchestration</h3>
              <p className="text-sm text-gray-300 font-mono">
                Complex tasks are broken down into workflows with multiple agents working in sequence
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle className="font-orbitron uppercase tracking-wider">Chat with Your AI Agents</CardTitle>
          <CardDescription className="text-gray-300 font-mono">
            Interact with your custom AI agents. They&apos;ll automatically collaborate when needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-full p-0">
          <CustomAgentChat className="h-full" />
        </CardContent>
      </Card>
      </div>
    </SubscriptionGuard>
  )
}
