"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"


interface OnboardingData {
  personalInfo: {
    name: string
    businessType: string
    industry: string
    experience: string
  }
  goals: {
    primaryGoals: string[]
    timeframe: string
    biggestChallenge: string
  }
  preferences: {
    workStyle: string
    communicationStyle: string
    focusTime: string
    notifications: string[]
  }
  aiTeam: {
    selectedAgents: string[]
    priorities: string[]
  }
}

interface OnboardingWizardProps {
  open: boolean
  onComplete: (data: OnboardingData) => void
  onSkip: () => void
}

export function OnboardingWizard({ open, onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    personalInfo: { name: "", businessType: "", industry: "", experience: "" },
    goals: { primaryGoals: [], timeframe: "", biggestChallenge: "" },
    preferences: { workStyle: "", communicationStyle: "", focusTime: "", notifications: [] },
    aiTeam: { selectedAgents: [], priorities: [] },
  })

  const totalSteps = 5
  const progress = ((currentStep + 1) / totalSteps) * 100

  const businessTypes = [
    "Freelancer",
    "Consultant",
    "E-commerce Owner",
    "Content Creator",
    "Coach/Trainer",
    "Agency Owner",
    "SaaS Founder",
    "Service Provider",
    "Other",
  ]

  const industries = [
    "Technology",
    "Marketing & Advertising",
    "Health & Wellness",
    "Education & Training",
    "Finance & Consulting",
    "Creative Services",
    "E-commerce & Retail",
    "Real Estate",
    "Other",
  ]

  const goalOptions = [
    { id: "productivity", label: "Boost Productivity", emoji: "⚡", description: "Get more done in less time" },
    { id: "growth", label: "Scale Business", emoji: "📈", description: "Grow revenue and reach" },
    { id: "organization", label: "Get Organized", emoji: "📋", description: "Streamline workflows" },
    { id: "wellness", label: "Work-Life Balance", emoji: "🧘‍♀️", description: "Prevent burnout" },
    { id: "automation", label: "Automate Tasks", emoji: "🤖", description: "Reduce manual work" },
    { id: "creativity", label: "Boost Creativity", emoji: "🎨", description: "Generate fresh ideas" },
  ]

  const agentOptions = [
    {
      id: "roxy",
      name: "Roxy",
      role: "Executive Assistant",
      avatar: "/images/agents/roxy.png",
      description: "Manages schedules, organizes workflows, handles admin tasks",
      specialties: ["Organization", "Scheduling", "Workflow"],
    },
    {
      id: "blaze",
      name: "Blaze",
      role: "Growth Strategist",
      avatar: "/images/agents/blaze.png",
      description: "Drives sales, creates growth strategies, optimizes conversions",
      specialties: ["Sales", "Growth", "Strategy"],
    },
    {
      id: "echo",
      name: "Echo",
      role: "Marketing Maven",
      avatar: "/images/agents/echo.png",
      description: "Creates content, builds brand, manages social media",
      specialties: ["Content", "Branding", "Social Media"],
    },
    {
      id: "lumi",
      name: "Lumi",
      role: "Legal & Docs",
      avatar: "/images/agents/lumi.png",
      description: "Handles contracts, legal docs, compliance guidance",
      specialties: ["Legal", "Contracts", "Compliance"],
    },
  ]

  const updateData = (section: keyof OnboardingData, updates: any) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(data)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleGoal = (goalId: string) => {
    const currentGoals = data.goals.primaryGoals
    const newGoals = currentGoals.includes(goalId)
      ? currentGoals.filter((g) => g !== goalId)
      : [...currentGoals, goalId]
    updateData("goals", { primaryGoals: newGoals })
  }

  const toggleAgent = (agentId: string) => {
    const currentAgents = data.aiTeam.selectedAgents
    const newAgents = currentAgents.includes(agentId)
      ? currentAgents.filter((a) => a !== agentId)
      : [...currentAgents, agentId]
    updateData("aiTeam", { selectedAgents: newAgents })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold boss-heading">Welcome to Your Empire! 👑</h2>
              <p className="text-lg text-muted-foreground">
                Let's set up your SoloBoss AI platform to match your unique boss energy!
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">
                  What should we call you, boss?
                </Label>
                <Input
                  id="name"
                  placeholder="Your name or business name"
                  value={data.personalInfo.name}
                  onChange={(e) => updateData("personalInfo", { name: e.target.value })}
                  className="border-2 border-purple-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">What type of boss are you?</Label>
                <Select
                  value={data.personalInfo.businessType}
                  onValueChange={(value) => updateData("personalInfo", { businessType: value })}
                >
                  <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">What industry do you dominate?</Label>
                <Select
                  value={data.personalInfo.industry}
                  onValueChange={(value) => updateData("personalInfo", { industry: value })}
                >
                  <SelectTrigger className="border-2 border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold boss-heading">What are your empire goals? 🎯</h2>
              <p className="text-muted-foreground">Select all that apply - we'll customize your experience!</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {goalOptions.map((goal) => (
                <Card
                  key={goal.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    data.goals.primaryGoals.includes(goal.id)
                      ? "ring-2 ring-purple-500 bg-gradient-to-r from-purple-50 to-pink-50"
                      : "hover:bg-purple-50/50"
                  }`}
                  onClick={() => toggleGoal(goal.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{goal.emoji}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{goal.label}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      {data.goals.primaryGoals.includes(goal.id) && <CheckCircle className="h-5 w-5 text-purple-600" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold">What's your biggest challenge right now?</Label>
                <Textarea
                  placeholder="Tell us what's keeping you from reaching your full boss potential..."
                  value={data.goals.biggestChallenge}
                  onChange={(e) => updateData("goals", { biggestChallenge: e.target.value })}
                  className="border-2 border-purple-200 focus:border-purple-400"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold boss-heading">How do you work best? 🧠</h2>
              <p className="text-muted-foreground">Let's optimize your AI team for your work style!</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="font-semibold">Your work style:</Label>
                <div className="grid gap-2">
                  {[
                    { value: "focused", label: "Deep Focus", desc: "Long, uninterrupted work sessions" },
                    { value: "collaborative", label: "Collaborative", desc: "Frequent check-ins and teamwork" },
                    { value: "flexible", label: "Flexible", desc: "Mix of focus and collaboration" },
                  ].map((style) => (
                    <Card
                      key={style.value}
                      className={`cursor-pointer transition-all ${
                        data.preferences.workStyle === style.value
                          ? "ring-2 ring-purple-500 bg-purple-50"
                          : "hover:bg-purple-50/50"
                      }`}
                      onClick={() => updateData("preferences", { workStyle: style.value })}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{style.label}</h4>
                            <p className="text-sm text-muted-foreground">{style.desc}</p>
                          </div>
                          {data.preferences.workStyle === style.value && (
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-semibold">Communication style:</Label>
                <div className="grid gap-2">
                  {[
                    { value: "direct", label: "Direct & Efficient", desc: "Get straight to the point" },
                    { value: "encouraging", label: "Encouraging & Motivational", desc: "Positive reinforcement" },
                    { value: "detailed", label: "Detailed & Thorough", desc: "Comprehensive explanations" },
                  ].map((style) => (
                    <Card
                      key={style.value}
                      className={`cursor-pointer transition-all ${
                        data.preferences.communicationStyle === style.value
                          ? "ring-2 ring-purple-500 bg-purple-50"
                          : "hover:bg-purple-50/50"
                      }`}
                      onClick={() => updateData("preferences", { communicationStyle: style.value })}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{style.label}</h4>
                            <p className="text-sm text-muted-foreground">{style.desc}</p>
                          </div>
                          {data.preferences.communicationStyle === style.value && (
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-teal-500 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold boss-heading">Meet Your AI Squad! 👯‍♀️</h2>
              <p className="text-muted-foreground">Choose your starting team (you can add more later!)</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {agentOptions.map((agent) => (
                <Card
                  key={agent.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    data.aiTeam.selectedAgents.includes(agent.id)
                      ? "ring-2 ring-purple-500 bg-gradient-to-r from-purple-50 to-pink-50"
                      : "hover:bg-purple-50/50"
                  }`}
                  onClick={() => toggleAgent(agent.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={agent.avatar || "/default-user.svg"}
                        alt={agent.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{agent.name}</h3>
                          {data.aiTeam.selectedAgents.includes(agent.id) && (
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                        <p className="text-sm font-medium text-purple-600 mb-1">{agent.role}</p>
                        <p className="text-sm text-muted-foreground mb-2">{agent.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.specialties.map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-yellow-500 to-pink-500 rounded-full flex items-center justify-center">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold boss-heading">You're Ready to Rule! 🚀</h2>
              <p className="text-muted-foreground">Here's your personalized empire setup:</p>
            </div>

            <div className="space-y-4">
              <Card className="boss-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    Your Boss Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>
                    <strong>Name:</strong> {data.personalInfo.name || "Boss Babe"}
                  </p>
                  <p>
                    <strong>Business Type:</strong> {data.personalInfo.businessType}
                  </p>
                  <p>
                    <strong>Industry:</strong> {data.personalInfo.industry}
                  </p>
                  <p>
                    <strong>Work Style:</strong> {data.preferences.workStyle}
                  </p>
                </CardContent>
              </Card>

              <Card className="boss-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-pink-600" />
                    Your Goals ({data.goals.primaryGoals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {data.goals.primaryGoals.map((goalId) => {
                      const goal = goalOptions.find((g) => g.id === goalId)
                      return (
                        <Badge key={goalId} className="girlboss-badge">
                          {goal?.emoji} {goal?.label}
                        </Badge>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="boss-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-teal-600" />
                    Your AI Squad ({data.aiTeam.selectedAgents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {data.aiTeam.selectedAgents.map((agentId) => {
                      const agent = agentOptions.find((a) => a.id === agentId)
                      return (
                        <div key={agentId} className="flex items-center gap-2">
                          <img
                            src={agent?.avatar || "/default-user.svg"}
                            alt={agent?.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="font-medium">{agent?.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-lg font-semibold empowering-text">
                <Sparkles className="h-5 w-5" />
                Ready to start building your empire!
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your AI team is ready to help you crush your goals and build the business of your dreams! 💪
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto boss-card border-2 border-purple-200">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="boss-heading text-xl">SoloBoss AI Setup</DialogTitle>
              <DialogDescription>
                Step {currentStep + 1} of {totalSteps} - Let's build your empire!
              </DialogDescription>
            </div>
            <Button variant="ghost" onClick={onSkip} className="text-sm">
              Skip Setup
            </Button>
          </div>
          <Progress value={progress} className="w-full" />
        </DialogHeader>

        <div className="py-4">{renderStep()}</div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={nextStep}
            className="punk-button text-white flex items-center gap-2"
            disabled={
              (currentStep === 0 && !data.personalInfo.name) ||
              (currentStep === 1 && data.goals.primaryGoals.length === 0) ||
              (currentStep === 2 && !data.preferences.workStyle) ||
              (currentStep === 3 && data.aiTeam.selectedAgents.length === 0)
            }
          >
            {currentStep === totalSteps - 1 ? (
              <>
                <Rocket className="h-4 w-4" />
                Launch Empire!
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
