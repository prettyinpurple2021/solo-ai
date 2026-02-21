
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, TrendingUp, Calculator, FileText, Brain, Target } from "lucide-react"
import { FirstHireArchitect } from "@/components/evolve/first-hire-architect"
import { CompensationModeler } from "@/components/evolve/compensation-modeler"

interface ScalingMetrics {
  currentTeamSize: number
  targetTeamSize: number
  hiringBudget: number
  timeToHire: number
  successRate: number
}

interface EvolveClientProps {
  initialMetrics: ScalingMetrics;
  user: any;
}

export function EvolveClient({ initialMetrics, user }: EvolveClientProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [metrics] = useState<ScalingMetrics>(initialMetrics)

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-orbitron uppercase tracking-wider text-white">Evolve</h1>
          <p className="text-gray-300 font-mono text-sm">Your comprehensive scaling & first hire playbook</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-dark-card text-neon-purple border border-neon-purple rounded-none uppercase font-bold text-[10px] px-3">
            <Users className="w-3 h-3 mr-2" />
            Scaling Mode
          </Badge>
        </div>
      </div>

      {/* Scaling Overview Banner */}
      <Card className="bg-dark-card border border-neon-purple/30 rounded-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-orbitron uppercase tracking-wider text-white mb-2">Ready to Scale?</h2>
              <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Transform from solo founder to team leader with confidence</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-neon-purple font-mono">
                {metrics.currentTeamSize} → {metrics.targetTeamSize}
              </div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">Deployment Projection</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-white/10 p-1">
          <TabsTrigger value="overview" className="font-mono uppercase text-xs data-[state=active]:bg-neon-purple data-[state=active]:text-black">Overview</TabsTrigger>
          <TabsTrigger value="role-architect" className="font-mono uppercase text-xs data-[state=active]:bg-neon-purple data-[state=active]:text-black">Role Architect</TabsTrigger>
          <TabsTrigger value="compensation" className="font-mono uppercase text-xs data-[state=active]:bg-neon-purple data-[state=active]:text-black">Compensation</TabsTrigger>
          <TabsTrigger value="onboarding" className="font-mono uppercase text-xs data-[state=active]:bg-neon-purple data-[state=active]:text-black">Onboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black/20 border-white/5 rounded-none p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Current Team</p>
                  <p className="text-2xl font-bold font-mono text-white">{metrics.currentTeamSize} UNIT</p>
                </div>
                <Users className="w-8 h-8 text-neon-purple opacity-50" />
              </div>
            </Card>

            <Card className="bg-black/20 border-white/5 rounded-none p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Hiring Budget</p>
                  <p className="text-2xl font-bold font-mono text-white">${metrics.hiringBudget.toLocaleString()}</p>
                </div>
                <Calculator className="w-8 h-8 text-neon-lime opacity-50" />
              </div>
            </Card>

            <Card className="bg-black/20 border-white/5 rounded-none p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Success Rate</p>
                  <p className="text-2xl font-bold font-mono text-neon-lime">{metrics.successRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-neon-lime opacity-50" />
              </div>
            </Card>
          </div>

          <Card className="bg-black/20 border-white/5 rounded-none">
            <CardHeader>
              <CardTitle className="font-orbitron text-sm uppercase tracking-widest">Scaling Toolkit</CardTitle>
              <CardDescription className="font-mono text-[10px] uppercase">Essential tools for your scaling journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 border-white/10 hover:border-neon-purple hover:bg-neon-purple/5 rounded-none group transition-all"
                  onClick={() => setActiveTab("role-architect")}
                >
                  <Users className="w-6 h-6 group-hover:text-neon-purple" />
                  <span className="font-mono uppercase text-[10px] font-bold tracking-widest">Design Role</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 border-white/10 hover:border-neon-lime hover:bg-neon-lime/5 rounded-none group transition-all"
                  onClick={() => setActiveTab("compensation")}
                >
                  <Calculator className="w-6 h-6 group-hover:text-neon-lime" />
                  <span className="font-mono uppercase text-[10px] font-bold tracking-widest">Model Comp</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 border-white/10 hover:border-neon-cyan hover:bg-neon-cyan/5 rounded-none group transition-all"
                  onClick={() => setActiveTab("onboarding")}
                >
                  <FileText className="w-6 h-6 group-hover:text-neon-cyan" />
                  <span className="font-mono uppercase text-[10px] font-bold tracking-widest">Plan Onboarding</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col gap-2 border-white/10 hover:border-neon-magenta hover:bg-neon-magenta/5 rounded-none group transition-all"
                >
                  <Brain className="w-6 h-6 group-hover:text-neon-magenta" />
                  <span className="font-mono uppercase text-[10px] font-bold tracking-widest">Team Strategy</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="role-architect" className="mt-6">
          <FirstHireArchitect />
        </TabsContent>

        <TabsContent value="compensation" className="mt-6">
          <CompensationModeler />
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-6 mt-6">
          <Card className="bg-black/20 border-white/5 rounded-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-orbitron uppercase tracking-wider text-white">
                <FileText className="w-5 h-5 text-neon-purple" />
                30-60-90 Day Framework
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Generate structured onboarding plans with clear objectives and success metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20 border border-dashed border-white/10">
                <FileText className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <h3 className="text-lg font-orbitron uppercase tracking-wider text-gray-500 mb-2">Protocol Pending</h3>
                <p className="text-gray-600 mb-4 font-mono text-xs uppercase tracking-widest">
                  Onboarding Plan Generator is currently under synchronization.
                </p>
                <Button className="mt-6 bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed font-mono uppercase text-xs" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert className="bg-neon-purple/5 border-neon-purple/20 rounded-none">
        <Users className="h-4 w-4 text-neon-purple" />
        <AlertDescription className="text-[10px] font-mono text-gray-400 uppercase tracking-wider leading-relaxed">
          <strong>Scaling Warning:</strong> Hiring is a critical tactical decision. These tools provide algorithmic guidance but require oversight from professional HR and legal operatives to ensure compliance with regional labor protocols.
        </AlertDescription>
      </Alert>
    </div>
  )
}
