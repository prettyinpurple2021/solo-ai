"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, TrendingUp, Calculator, FileText, Brain, Target } from "lucide-react"
import { FirstHireArchitect } from "./first-hire-architect"
import { CompensationModeler } from "./compensation-modeler"

interface ScalingMetrics {
  currentTeamSize: number
  targetTeamSize: number
  hiringBudget: number
  timeToHire: number
  successRate: number
}

export function EvolveDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [metrics] = useState<ScalingMetrics>({
    currentTeamSize: 1,
    targetTeamSize: 3,
    hiringBudget: 150000,
    timeToHire: 45,
    successRate: 85
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Evolve</h1>
          <p className="text-gray-600">Your comprehensive scaling & first hire playbook</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-800">
            <Users className="w-3 h-3 mr-1" />
            Scaling Mode
          </Badge>
        </div>
      </div>

      {/* Scaling Overview Banner */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Scale?</h2>
              <p className="text-gray-600">Transform from solo founder to team leader with confidence</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {metrics.currentTeamSize} → {metrics.targetTeamSize}
              </div>
              <div className="text-sm text-gray-600">Team Growth</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="role-architect">Role Architect</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Scaling Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Team</p>
                    <p className="text-2xl font-bold">{metrics.currentTeamSize} person</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hiring Budget</p>
                    <p className="text-2xl font-bold">${metrics.hiringBudget.toLocaleString()}</p>
                  </div>
                  <Calculator className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.successRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Scaling Toolkit</CardTitle>
              <CardDescription>Essential tools for your scaling journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab("role-architect")}
                >
                  <Users className="w-6 h-6" />
                  <span>Design Role</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab("compensation")}
                >
                  <Calculator className="w-6 h-6" />
                  <span>Model Compensation</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setActiveTab("onboarding")}
                >
                  <FileText className="w-6 h-6" />
                  <span>Plan Onboarding</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                >
                  <Brain className="w-6 h-6" />
                  <span>Team Strategy</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scaling Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Scaling Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Business Model Validated</p>
                    <p className="text-sm text-gray-600">Consistent revenue and product-market fit</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Processes Documented</p>
                    <p className="text-sm text-gray-600">Key workflows and systems in place</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <div>
                    <p className="font-medium">Financial Planning</p>
                    <p className="text-sm text-gray-600">Budget and runway analysis needed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-xs">○</span>
                  </div>
                  <div>
                    <p className="font-medium">Role Definition</p>
                    <p className="text-sm text-gray-600">Clear job descriptions and responsibilities</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-xs">○</span>
                  </div>
                  <div>
                    <p className="font-medium">Onboarding Plan</p>
                    <p className="text-sm text-gray-600">30-60-90 day success framework</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scaling Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Scaling Wisdom</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Hire for the biggest gap:</strong> Focus on the role that will have the most immediate 
                    impact on your business growth and free up your time for strategic work.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Calculator className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Plan for 18 months:</strong> Ensure you have sufficient runway to give your new hire 
                    time to ramp up and start contributing meaningfully to the business.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Culture matters:</strong> Your first hire sets the foundation for your company culture. 
                    Choose someone who aligns with your values and vision.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Architect Tab */}
        <TabsContent value="role-architect">
          <FirstHireArchitect />
        </TabsContent>

        {/* Compensation Tab */}
        <TabsContent value="compensation">
          <CompensationModeler />
        </TabsContent>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                30-60-90 Day Onboarding Plan Generator
              </CardTitle>
              <CardDescription>
                Create structured onboarding plans with clear objectives and success metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Onboarding Plan Generator</h3>
                <p className="text-gray-600 mb-4">
                  Coming soon! This tool will help you create comprehensive onboarding plans with:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>30 Days:</strong> Learning & orientation
                  </div>
                  <div>
                    <strong>60 Days:</strong> Contribution & integration
                  </div>
                  <div>
                    <strong>90 Days:</strong> Independence & growth
                  </div>
                </div>
                <Button className="mt-6" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Disclaimer */}
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          <strong>Scaling Disclaimer:</strong> Hiring is a significant business decision that requires careful planning. 
          These tools provide guidance but should be used alongside professional HR and legal advice to ensure compliance 
          with employment laws and best practices.
        </AlertDescription>
      </Alert>
    </div>
  )
} 