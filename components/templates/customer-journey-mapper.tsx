"use client"

import { useState, useEffect } from "react"
import BaseTemplate, { TemplateData } from "./base-template"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { BossButton } from "@/components/ui/boss-button"
import { BossCard } from "@/components/ui/boss-card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { 
  User, 
  MapPin, 
  Heart, 
  Frown, 
  Meh, 
  Smile,
  Plus,
  Minus,
  ArrowRight,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Store,
  Smartphone,
  Monitor,
  Settings,
  Crown,
  Brain,
  Lightbulb,
  Zap,
  BarChart3,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  Route
} from "lucide-react"

interface Touchpoint {
  id: string
  name: string
  type: 'website' | 'mobile-app' | 'social-media' | 'email' | 'phone' | 'in-store' | 'chat' | 'support' | 'advertising' | 'other'
  channel: string
  description: string
  customerActions: string[]
  businessActions: string[]
  emotionScore: number // 1-10 scale
  satisfactionScore: number // 1-10 scale
  painPoints: string[]
  opportunities: string[]
  tools: string[]
  metrics: string[]
}

interface JourneyStage {
  id: string
  name: string
  description: string
  duration: string
  customerGoals: string[]
  customerNeeds: string[]
  customerExpectations: string[]
  touchpoints: string[] // touchpoint IDs
  overallEmotion: number // 1-10 scale
  keyMetrics: string[]
  improvementIdeas: string[]
}

interface CustomerPersona {
  id: string
  name: string
  demographics: {
    age: string
    gender: string
    location: string
    occupation: string
    income: string
  }
  psychographics: {
    goals: string[]
    motivations: string[]
    frustrations: string[]
    preferences: string[]
  }
  technicalProfile: {
    digitalSavvy: number // 1-10 scale
    preferredChannels: string[]
    deviceUsage: string[]
  }
}

interface CustomerJourneyData {
  // Journey Overview
  journeyName: string
  journeyDescription: string
  businessGoal: string
  targetOutcome: string
  timeframe: string
  
  // Customer Profile
  persona: CustomerPersona
  
  // Journey Mapping
  stages: JourneyStage[]
  touchpoints: Touchpoint[]
  
  // Analysis
  overallSatisfactionScore: number
  criticalPainPoints: string[]
  keyOpportunities: string[]
  priorityImprovements: string[]
  
  // Recommendations
  quickWins: string[]
  longTermImprovements: string[]
  resourceRequirements: string
  expectedROI: string
  
  // Metrics & KPIs
  successMetrics: string[]
  currentMetrics: {
    [metric: string]: number
  }
  targetMetrics: {
    [metric: string]: number
  }
}

interface CustomerJourneyMapperProps {
  template: TemplateData
  onSave?: (data: CustomerJourneyData) => Promise<void>
  onExport?: (format: 'json' | 'pdf' | 'csv') => void
}

export default function CustomerJourneyMapper({ template, onSave, onExport }: CustomerJourneyMapperProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<CustomerJourneyData>({
    journeyName: "",
    journeyDescription: "",
    businessGoal: "",
    targetOutcome: "",
    timeframe: "",
    persona: {
      id: crypto.randomUUID(),
      name: "",
      demographics: {
        age: "",
        gender: "",
        location: "",
        occupation: "",
        income: ""
      },
      psychographics: {
        goals: [],
        motivations: [],
        frustrations: [],
        preferences: []
      },
      technicalProfile: {
        digitalSavvy: 5,
        preferredChannels: [],
        deviceUsage: []
      }
    },
    stages: [],
    touchpoints: [],
    overallSatisfactionScore: 0,
    criticalPainPoints: [],
    keyOpportunities: [],
    priorityImprovements: [],
    quickWins: [],
    longTermImprovements: [],
    resourceRequirements: "",
    expectedROI: "",
    successMetrics: [],
    currentMetrics: {},
    targetMetrics: {}
  })

  const totalSteps = 5

  // Add journey stage
  const addStage = () => {
    const newStage: JourneyStage = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      duration: "",
      customerGoals: [""],
      customerNeeds: [""],
      customerExpectations: [""],
      touchpoints: [],
      overallEmotion: 5,
      keyMetrics: [],
      improvementIdeas: []
    }
    setData(prev => ({
      ...prev,
      stages: [...prev.stages, newStage]
    }))
  }

  // Update stage
  const updateStage = (id: string, updates: Partial<JourneyStage>) => {
    setData(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.id === id ? { ...stage, ...updates } : stage
      )
    }))
  }

  // Remove stage
  const removeStage = (id: string) => {
    setData(prev => ({
      ...prev,
      stages: prev.stages.filter(stage => stage.id !== id)
    }))
  }

  // Add touchpoint
  const addTouchpoint = () => {
    const newTouchpoint: Touchpoint = {
      id: crypto.randomUUID(),
      name: "",
      type: 'website',
      channel: "",
      description: "",
      customerActions: [""],
      businessActions: [""],
      emotionScore: 5,
      satisfactionScore: 5,
      painPoints: [],
      opportunities: [],
      tools: [],
      metrics: []
    }
    setData(prev => ({
      ...prev,
      touchpoints: [...prev.touchpoints, newTouchpoint]
    }))
  }

  // Update touchpoint
  const updateTouchpoint = (id: string, updates: Partial<Touchpoint>) => {
    setData(prev => ({
      ...prev,
      touchpoints: prev.touchpoints.map(touchpoint =>
        touchpoint.id === id ? { ...touchpoint, ...updates } : touchpoint
      )
    }))
  }

  // Remove touchpoint
  const removeTouchpoint = (id: string) => {
    setData(prev => ({
      ...prev,
      touchpoints: prev.touchpoints.filter(touchpoint => touchpoint.id !== id),
      // Remove from stages
      stages: prev.stages.map(stage => ({
        ...stage,
        touchpoints: stage.touchpoints.filter(tpId => tpId !== id)
      }))
    }))
  }

  // Update array field in stage
  const updateStageArrayField = (stageId: string, field: keyof JourneyStage, index: number, value: string) => {
    const stage = data.stages.find(s => s.id === stageId)
    if (!stage || !Array.isArray(stage[field])) return

    const newArray = [...(stage[field] as string[])]
    newArray[index] = value

    updateStage(stageId, { [field]: newArray })
  }

  // Add to array field in stage
  const addToStageArrayField = (stageId: string, field: keyof JourneyStage) => {
    const stage = data.stages.find(s => s.id === stageId)
    if (!stage || !Array.isArray(stage[field])) return

    const newArray = [...(stage[field] as string[]), ""]
    updateStage(stageId, { [field]: newArray })
  }

  // Remove from array field in stage
  const removeFromStageArrayField = (stageId: string, field: keyof JourneyStage, index: number) => {
    const stage = data.stages.find(s => s.id === stageId)
    if (!stage || !Array.isArray(stage[field]) || (stage[field] as string[]).length <= 1) return

    const newArray = (stage[field] as string[]).filter((_, i) => i !== index)
    updateStage(stageId, { [field]: newArray })
  }

  // Update array field in touchpoint
  const updateTouchpointArrayField = (touchpointId: string, field: keyof Touchpoint, index: number, value: string) => {
    const touchpoint = data.touchpoints.find(t => t.id === touchpointId)
    if (!touchpoint || !Array.isArray(touchpoint[field])) return

    const newArray = [...(touchpoint[field] as string[])]
    newArray[index] = value

    updateTouchpoint(touchpointId, { [field]: newArray })
  }

  // Add to array field in touchpoint
  const addToTouchpointArrayField = (touchpointId: string, field: keyof Touchpoint) => {
    const touchpoint = data.touchpoints.find(t => t.id === touchpointId)
    if (!touchpoint || !Array.isArray(touchpoint[field])) return

    const newArray = [...(touchpoint[field] as string[]), ""]
    updateTouchpoint(touchpointId, { [field]: newArray })
  }

  // Remove from array field in touchpoint
  const removeFromTouchpointArrayField = (touchpointId: string, field: keyof Touchpoint, index: number) => {
    const touchpoint = data.touchpoints.find(t => t.id === touchpointId)
    if (!touchpoint || !Array.isArray(touchpoint[field]) || (touchpoint[field] as string[]).length <= 1) return

    const newArray = (touchpoint[field] as string[]).filter((_, i) => i !== index)
    updateTouchpoint(touchpointId, { [field]: newArray })
  }

  // Calculate overall satisfaction
  const calculateOverallSatisfaction = () => {
    if (data.touchpoints.length === 0) return 0
    const total = data.touchpoints.reduce((sum, tp) => sum + tp.satisfactionScore, 0)
    return Math.round(total / data.touchpoints.length)
  }

  // Get emotion color
  const getEmotionColor = (score: number) => {
    if (score <= 3) return "text-red-600"
    if (score <= 6) return "text-yellow-600"
    return "text-green-600"
  }

  // Get emotion icon
  const getEmotionIcon = (score: number) => {
    if (score <= 3) return <Frown className="w-4 h-4" />
    if (score <= 6) return <Meh className="w-4 h-4" />
    return <Smile className="w-4 h-4" />
  }

  // Get touchpoint icon
  const getTouchpointIcon = (type: string) => {
    const icons: { [key: string]: JSX.Element } = {
      website: <Globe className="w-4 h-4" />,
      'mobile-app': <Smartphone className="w-4 h-4" />,
      'social-media': <MessageCircle className="w-4 h-4" />,
      email: <Mail className="w-4 h-4" />,
      phone: <Phone className="w-4 h-4" />,
      'in-store': <Store className="w-4 h-4" />,
      chat: <MessageCircle className="w-4 h-4" />,
      support: <Phone className="w-4 h-4" />,
      advertising: <Monitor className="w-4 h-4" />,
      other: <MapPin className="w-4 h-4" />
    }
    return icons[type] || <MapPin className="w-4 h-4" />
  }

  const handleSave = async () => {
    if (onSave) {
      await onSave(data)
    }
  }

  const handleExport = (format: 'json' | 'pdf' | 'csv') => {
    if (onExport) {
      onExport(format)
    }
  }

  const handleReset = () => {
    setData({
      journeyName: "",
      journeyDescription: "",
      businessGoal: "",
      targetOutcome: "",
      timeframe: "",
      persona: {
        id: crypto.randomUUID(),
        name: "",
        demographics: {
          age: "",
          gender: "",
          location: "",
          occupation: "",
          income: ""
        },
        psychographics: {
          goals: [],
          motivations: [],
          frustrations: [],
          preferences: []
        },
        technicalProfile: {
          digitalSavvy: 5,
          preferredChannels: [],
          deviceUsage: []
        }
      },
      stages: [],
      touchpoints: [],
      overallSatisfactionScore: 0,
      criticalPainPoints: [],
      keyOpportunities: [],
      priorityImprovements: [],
      quickWins: [],
      longTermImprovements: [],
      resourceRequirements: "",
      expectedROI: "",
      successMetrics: [],
      currentMetrics: {},
      targetMetrics: {}
    })
    setCurrentStep(1)
  }

  return (
    <BaseTemplate
      template={template}
      currentStep={currentStep}
      totalSteps={totalSteps}
      showProgress={true}
      onSave={handleSave}
      onExport={handleExport}
      onReset={handleReset}
    >
      <Tabs value={`step-${currentStep}`} onValueChange={(value) => setCurrentStep(parseInt(value.split('-')[1]))}>
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="step-1" className="flex items-center gap-1 text-xs">
            <Target className="w-3 h-3" />
            <span className="hidden md:inline">Setup</span>
          </TabsTrigger>
          <TabsTrigger value="step-2" className="flex items-center gap-1 text-xs">
            <User className="w-3 h-3" />
            <span className="hidden md:inline">Persona</span>
          </TabsTrigger>
          <TabsTrigger value="step-3" className="flex items-center gap-1 text-xs">
            <Route className="w-3 h-3" />
            <span className="hidden md:inline">Stages</span>
          </TabsTrigger>
          <TabsTrigger value="step-4" className="flex items-center gap-1 text-xs">
            <MapPin className="w-3 h-3" />
            <span className="hidden md:inline">Touchpoints</span>
          </TabsTrigger>
          <TabsTrigger value="step-5" className="flex items-center gap-1 text-xs">
            <BarChart3 className="w-3 h-3" />
            <span className="hidden md:inline">Analysis</span>
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Journey Setup */}
        <TabsContent value="step-1" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Journey Setup
              </CardTitle>
              <CardDescription>
                Define the scope and objectives of your customer journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="journey-name">Journey Name *</Label>
                <Input
                  id="journey-name"
                  placeholder="e.g., E-commerce Purchase Journey, Customer Onboarding"
                  value={data.journeyName}
                  onChange={(e) => setData(prev => ({ ...prev, journeyName: e.target.value }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="journey-description">Journey Description</Label>
                <Textarea
                  id="journey-description"
                  placeholder="Describe the customer journey you want to map..."
                  value={data.journeyDescription}
                  onChange={(e) => setData(prev => ({ ...prev, journeyDescription: e.target.value }))}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business-goal">Business Goal</Label>
                  <Input
                    id="business-goal"
                    placeholder="e.g., Increase conversion rate, Reduce churn"
                    value={data.businessGoal}
                    onChange={(e) => setData(prev => ({ ...prev, businessGoal: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="target-outcome">Target Outcome</Label>
                  <Input
                    id="target-outcome"
                    placeholder="e.g., Purchase, Sign-up, Renewal"
                    value={data.targetOutcome}
                    onChange={(e) => setData(prev => ({ ...prev, targetOutcome: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timeframe">Journey Timeframe</Label>
                <Select onValueChange={(value) => setData(prev => ({ ...prev, timeframe: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select journey duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutes (0-30 minutes)</SelectItem>
                    <SelectItem value="hours">Hours (1-24 hours)</SelectItem>
                    <SelectItem value="days">Days (1-7 days)</SelectItem>
                    <SelectItem value="weeks">Weeks (1-4 weeks)</SelectItem>
                    <SelectItem value="months">Months (1-12 months)</SelectItem>
                    <SelectItem value="ongoing">Ongoing relationship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">Journey Mapping Best Practices</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
                  <li>Focus on one specific customer journey at a time</li>
                  <li>Include both digital and physical touchpoints</li>
                  <li>Consider emotional aspects, not just functional ones</li>
                  <li>Validate with real customer data and feedback</li>
                </ul>
              </div>
            </CardContent>
          </BossCard>

          <div className="flex justify-end">
            <BossButton 
              onClick={() => setCurrentStep(2)}
              disabled={!data.journeyName}
              crown
            >
              Next: Customer Persona
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 2: Customer Persona */}
        <TabsContent value="step-2" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Customer Persona
              </CardTitle>
              <CardDescription>
                Define the primary customer persona for this journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="persona-name">Persona Name</Label>
                <Input
                  id="persona-name"
                  placeholder="e.g., Sarah the Busy Professional"
                  value={data.persona.name}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    persona: { ...prev.persona, name: e.target.value }
                  }))}
                  className="mt-2"
                />
              </div>

              {/* Demographics */}
              <div>
                <h4 className="font-semibold mb-3">Demographics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Age Range</Label>
                    <Input
                      placeholder="e.g., 25-34"
                      value={data.persona.demographics.age}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        persona: {
                          ...prev.persona,
                          demographics: { ...prev.persona.demographics, age: e.target.value }
                        }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Gender</Label>
                    <Select onValueChange={(value) => setData(prev => ({
                      ...prev,
                      persona: {
                        ...prev.persona,
                        demographics: { ...prev.persona.demographics, gender: value }
                      }
                    }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        <SelectItem value="all">All genders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Location</Label>
                    <Input
                      placeholder="e.g., Urban areas, USA"
                      value={data.persona.demographics.location}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        persona: {
                          ...prev.persona,
                          demographics: { ...prev.persona.demographics, location: e.target.value }
                        }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Occupation</Label>
                    <Input
                      placeholder="e.g., Marketing Manager"
                      value={data.persona.demographics.occupation}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        persona: {
                          ...prev.persona,
                          demographics: { ...prev.persona.demographics, occupation: e.target.value }
                        }
                      }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-sm">Income Level</Label>
                  <Input
                    placeholder="e.g., $50,000 - $75,000"
                    value={data.persona.demographics.income}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      persona: {
                        ...prev.persona,
                        demographics: { ...prev.persona.demographics, income: e.target.value }
                      }
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Psychographics */}
              <div>
                <h4 className="font-semibold mb-3">Psychographics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm">Goals (comma-separated)</Label>
                    <Textarea
                      placeholder="e.g., Save time, Find quality products, Stay organized"
                      value={data.persona.psychographics.goals.join(", ")}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        persona: {
                          ...prev.persona,
                          psychographics: {
                            ...prev.persona.psychographics,
                            goals: e.target.value.split(",").map(g => g.trim()).filter(Boolean)
                          }
                        }
                      }))}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Motivations (comma-separated)</Label>
                    <Textarea
                      placeholder="e.g., Efficiency, Quality, Recognition"
                      value={data.persona.psychographics.motivations.join(", ")}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        persona: {
                          ...prev.persona,
                          psychographics: {
                            ...prev.persona.psychographics,
                            motivations: e.target.value.split(",").map(m => m.trim()).filter(Boolean)
                          }
                        }
                      }))}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Frustrations (comma-separated)</Label>
                    <Textarea
                      placeholder="e.g., Slow websites, Poor customer service"
                      value={data.persona.psychographics.frustrations.join(", ")}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        persona: {
                          ...prev.persona,
                          psychographics: {
                            ...prev.persona.psychographics,
                            frustrations: e.target.value.split(",").map(f => f.trim()).filter(Boolean)
                          }
                        }
                      }))}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Preferences (comma-separated)</Label>
                    <Textarea
                      placeholder="e.g., Self-service, Mobile-first, Personal recommendations"
                      value={data.persona.psychographics.preferences.join(", ")}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        persona: {
                          ...prev.persona,
                          psychographics: {
                            ...prev.persona.psychographics,
                            preferences: e.target.value.split(",").map(p => p.trim()).filter(Boolean)
                          }
                        }
                      }))}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Technical Profile */}
              <div>
                <h4 className="font-semibold mb-3">Technical Profile</h4>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Digital Savviness: {data.persona.technicalProfile.digitalSavvy}/10</Label>
                    <Slider
                      value={[data.persona.technicalProfile.digitalSavvy]}
                      onValueChange={([value]) => setData(prev => ({
                        ...prev,
                        persona: {
                          ...prev.persona,
                          technicalProfile: { ...prev.persona.technicalProfile, digitalSavvy: value }
                        }
                      }))}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      1 = Beginner, 5 = Intermediate, 10 = Expert
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Preferred Channels</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {['Email', 'Social Media', 'Mobile App', 'Website', 'Phone', 'In-store', 'Chat', 'SMS'].map((channel) => (
                          <label key={channel} className="flex items-center space-x-2 text-sm p-2 border rounded cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={data.persona.technicalProfile.preferredChannels.includes(channel)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setData(prev => ({
                                    ...prev,
                                    persona: {
                                      ...prev.persona,
                                      technicalProfile: {
                                        ...prev.persona.technicalProfile,
                                        preferredChannels: [...prev.persona.technicalProfile.preferredChannels, channel]
                                      }
                                    }
                                  }))
                                } else {
                                  setData(prev => ({
                                    ...prev,
                                    persona: {
                                      ...prev.persona,
                                      technicalProfile: {
                                        ...prev.persona.technicalProfile,
                                        preferredChannels: prev.persona.technicalProfile.preferredChannels.filter(c => c !== channel)
                                      }
                                    }
                                  }))
                                }
                              }}
                              className="rounded"
                            />
                            <span>{channel}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Device Usage</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {['Smartphone', 'Desktop', 'Tablet', 'Laptop', 'Smart TV', 'Wearable', 'Voice Assistant', 'Gaming Console'].map((device) => (
                          <label key={device} className="flex items-center space-x-2 text-sm p-2 border rounded cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={data.persona.technicalProfile.deviceUsage.includes(device)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setData(prev => ({
                                    ...prev,
                                    persona: {
                                      ...prev.persona,
                                      technicalProfile: {
                                        ...prev.persona.technicalProfile,
                                        deviceUsage: [...prev.persona.technicalProfile.deviceUsage, device]
                                      }
                                    }
                                  }))
                                } else {
                                  setData(prev => ({
                                    ...prev,
                                    persona: {
                                      ...prev.persona,
                                      technicalProfile: {
                                        ...prev.persona.technicalProfile,
                                        deviceUsage: prev.persona.technicalProfile.deviceUsage.filter(d => d !== device)
                                      }
                                    }
                                  }))
                                }
                              }}
                              className="rounded"
                            />
                            <span>{device}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </BossCard>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(1)}
              variant="outline"
            >
              Previous
            </BossButton>
            <BossButton 
              onClick={() => setCurrentStep(3)}
              crown
            >
              Next: Journey Stages
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 3: Journey Stages */}
        <TabsContent value="step-3" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5 text-purple-600" />
                Journey Stages
              </CardTitle>
              <CardDescription>
                Define the key stages of your customer journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Customer Journey Stages</h4>
                  <p className="text-sm text-gray-600">Break down the journey into distinct phases</p>
                </div>
                <BossButton onClick={addStage} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stage
                </BossButton>
              </div>

              <div className="space-y-6">
                {data.stages.map((stage, index) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 border rounded-lg relative"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <Input
                          placeholder="Stage name (e.g., Awareness, Consideration)"
                          value={stage.name}
                          onChange={(e) => updateStage(stage.id, { name: e.target.value })}
                          className="font-medium text-lg"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStage(stage.id)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      <div>
                        <Label className="text-sm">Stage Description</Label>
                        <Textarea
                          placeholder="Describe what happens in this stage..."
                          value={stage.description}
                          onChange={(e) => updateStage(stage.id, { description: e.target.value })}
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Duration</Label>
                          <Input
                            placeholder="e.g., 5 minutes, 1 week"
                            value={stage.duration}
                            onChange={(e) => updateStage(stage.id, { duration: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Overall Emotion: {stage.overallEmotion}/10</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Slider
                              value={[stage.overallEmotion]}
                              onValueChange={([value]) => updateStage(stage.id, { overallEmotion: value })}
                              max={10}
                              min={1}
                              step={1}
                              className="flex-1"
                            />
                            <div className={getEmotionColor(stage.overallEmotion)}>
                              {getEmotionIcon(stage.overallEmotion)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Customer Goals */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Customer Goals</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addToStageArrayField(stage.id, 'customerGoals')}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {stage.customerGoals.map((goal, goalIndex) => (
                              <div key={goalIndex} className="flex gap-1">
                                <Input
                                  placeholder="Customer goal..."
                                  value={goal}
                                  onChange={(e) => updateStageArrayField(stage.id, 'customerGoals', goalIndex, e.target.value)}
                                  className="text-sm"
                                />
                                {stage.customerGoals.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromStageArrayField(stage.id, 'customerGoals', goalIndex)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Customer Needs */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Customer Needs</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addToStageArrayField(stage.id, 'customerNeeds')}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {stage.customerNeeds.map((need, needIndex) => (
                              <div key={needIndex} className="flex gap-1">
                                <Input
                                  placeholder="Customer need..."
                                  value={need}
                                  onChange={(e) => updateStageArrayField(stage.id, 'customerNeeds', needIndex, e.target.value)}
                                  className="text-sm"
                                />
                                {stage.customerNeeds.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromStageArrayField(stage.id, 'customerNeeds', needIndex)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Customer Expectations */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Customer Expectations</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addToStageArrayField(stage.id, 'customerExpectations')}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {stage.customerExpectations.map((expectation, expIndex) => (
                              <div key={expIndex} className="flex gap-1">
                                <Input
                                  placeholder="Customer expectation..."
                                  value={expectation}
                                  onChange={(e) => updateStageArrayField(stage.id, 'customerExpectations', expIndex, e.target.value)}
                                  className="text-sm"
                                />
                                {stage.customerExpectations.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromStageArrayField(stage.id, 'customerExpectations', expIndex)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {index < data.stages.length - 1 && (
                        <div className="flex justify-center pt-4">
                          <ArrowRight className="w-6 h-6 text-purple-400" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {data.stages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Route className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No journey stages defined yet</p>
                  <p className="text-sm">Add stages to map your customer journey</p>
                </div>
              )}
            </CardContent>
          </BossCard>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(2)}
              variant="outline"
            >
              Previous
            </BossButton>
            <BossButton 
              onClick={() => setCurrentStep(4)}
              crown
            >
              Next: Touchpoints
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 4: Touchpoints */}
        <TabsContent value="step-4" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Customer Touchpoints
              </CardTitle>
              <CardDescription>
                Map all the touchpoints where customers interact with your brand
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Touchpoints</h4>
                  <p className="text-sm text-gray-600">Define every interaction point in the journey</p>
                </div>
                <BossButton onClick={addTouchpoint} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Touchpoint
                </BossButton>
              </div>

              <div className="space-y-6">
                {data.touchpoints.map((touchpoint) => (
                  <motion.div
                    key={touchpoint.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 border rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {getTouchpointIcon(touchpoint.type)}
                        <Input
                          placeholder="Touchpoint name (e.g., Homepage, Checkout)"
                          value={touchpoint.name}
                          onChange={(e) => updateTouchpoint(touchpoint.id, { name: e.target.value })}
                          className="font-medium"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTouchpoint(touchpoint.id)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm">Touchpoint Type</Label>
                          <Select
                            value={touchpoint.type}
                            onValueChange={(value: any) => updateTouchpoint(touchpoint.id, { type: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="mobile-app">Mobile App</SelectItem>
                              <SelectItem value="social-media">Social Media</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="in-store">In-store</SelectItem>
                              <SelectItem value="chat">Chat</SelectItem>
                              <SelectItem value="support">Support</SelectItem>
                              <SelectItem value="advertising">Advertising</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Channel</Label>
                          <Input
                            placeholder="e.g., Google Ads, Facebook, Store"
                            value={touchpoint.channel}
                            onChange={(e) => updateTouchpoint(touchpoint.id, { channel: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Link to Stage</Label>
                          <Select
                            onValueChange={(value) => {
                              // Add touchpoint to selected stage
                              const stage = data.stages.find(s => s.id === value)
                              if (stage && !stage.touchpoints.includes(touchpoint.id)) {
                                updateStage(value, { 
                                  touchpoints: [...stage.touchpoints, touchpoint.id] 
                                })
                              }
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                              {data.stages.map((stage) => (
                                <SelectItem key={stage.id} value={stage.id}>
                                  {stage.name || `Stage ${data.stages.indexOf(stage) + 1}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm">Description</Label>
                        <Textarea
                          placeholder="Describe what happens at this touchpoint..."
                          value={touchpoint.description}
                          onChange={(e) => updateTouchpoint(touchpoint.id, { description: e.target.value })}
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Customer Actions */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Customer Actions</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addToTouchpointArrayField(touchpoint.id, 'customerActions')}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {touchpoint.customerActions.map((action, actionIndex) => (
                              <div key={actionIndex} className="flex gap-1">
                                <Input
                                  placeholder="What customer does..."
                                  value={action}
                                  onChange={(e) => updateTouchpointArrayField(touchpoint.id, 'customerActions', actionIndex, e.target.value)}
                                  className="text-sm"
                                />
                                {touchpoint.customerActions.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromTouchpointArrayField(touchpoint.id, 'customerActions', actionIndex)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Business Actions */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Business Actions</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addToTouchpointArrayField(touchpoint.id, 'businessActions')}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {touchpoint.businessActions.map((action, actionIndex) => (
                              <div key={actionIndex} className="flex gap-1">
                                <Input
                                  placeholder="What business does..."
                                  value={action}
                                  onChange={(e) => updateTouchpointArrayField(touchpoint.id, 'businessActions', actionIndex, e.target.value)}
                                  className="text-sm"
                                />
                                {touchpoint.businessActions.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromTouchpointArrayField(touchpoint.id, 'businessActions', actionIndex)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Emotion Score: {touchpoint.emotionScore}/10</Label>
                          <div className="flex items-center gap-2 mt-2">
                            <Slider
                              value={[touchpoint.emotionScore]}
                              onValueChange={([value]) => updateTouchpoint(touchpoint.id, { emotionScore: value })}
                              max={10}
                              min={1}
                              step={1}
                              className="flex-1"
                            />
                            <div className={getEmotionColor(touchpoint.emotionScore)}>
                              {getEmotionIcon(touchpoint.emotionScore)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">Satisfaction Score: {touchpoint.satisfactionScore}/10</Label>
                          <Slider
                            value={[touchpoint.satisfactionScore]}
                            onValueChange={([value]) => updateTouchpoint(touchpoint.id, { satisfactionScore: value })}
                            max={10}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Pain Points (comma-separated)</Label>
                          <Textarea
                            placeholder="e.g., Slow loading, Confusing navigation"
                            value={touchpoint.painPoints.join(", ")}
                            onChange={(e) => updateTouchpoint(touchpoint.id, { 
                              painPoints: e.target.value.split(",").map(p => p.trim()).filter(Boolean)
                            })}
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Opportunities (comma-separated)</Label>
                          <Textarea
                            placeholder="e.g., Add live chat, Simplify form"
                            value={touchpoint.opportunities.join(", ")}
                            onChange={(e) => updateTouchpoint(touchpoint.id, { 
                              opportunities: e.target.value.split(",").map(o => o.trim()).filter(Boolean)
                            })}
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{touchpoint.type.replace('-', ' ')}</Badge>
                          <div className={`flex items-center gap-1 ${getEmotionColor(touchpoint.emotionScore)}`}>
                            {getEmotionIcon(touchpoint.emotionScore)}
                            <span className="text-sm">Emotion: {touchpoint.emotionScore}/10</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Satisfaction: {touchpoint.satisfactionScore}/10
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {data.touchpoints.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No touchpoints defined yet</p>
                  <p className="text-sm">Add touchpoints to map customer interactions</p>
                </div>
              )}
            </CardContent>
          </BossCard>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(3)}
              variant="outline"
            >
              Previous
            </BossButton>
            <BossButton 
              onClick={() => setCurrentStep(5)}
              crown
            >
              Next: Analysis & Recommendations
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 5: Analysis & Recommendations */}
        <TabsContent value="step-5" className="space-y-6">
          <div className="grid gap-6">
            {/* Journey Overview */}
            <BossCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Journey Analysis
                </CardTitle>
                <CardDescription>
                  Review your customer journey insights and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{data.stages.length}</div>
                    <div className="text-sm text-purple-700">Journey Stages</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">{data.touchpoints.length}</div>
                    <div className="text-sm text-purple-700">Touchpoints</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">
                      {calculateOverallSatisfaction()}/10
                    </div>
                    <div className="text-sm text-purple-700">Avg Satisfaction</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-900">
                      {data.touchpoints.filter(tp => tp.emotionScore <= 5).length}
                    </div>
                    <div className="text-sm text-purple-700">Pain Points</div>
                  </div>
                </div>

                {/* Emotion Journey */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Emotional Journey</h4>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    {data.stages.map((stage, index) => (
                      <div key={stage.id} className="text-center">
                        <div className={`text-2xl ${getEmotionColor(stage.overallEmotion)}`}>
                          {getEmotionIcon(stage.overallEmotion)}
                        </div>
                        <div className="text-xs mt-1">{stage.name || `Stage ${index + 1}`}</div>
                        <div className="text-xs text-gray-500">{stage.overallEmotion}/10</div>
                        {index < data.stages.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-400 mt-2 mx-auto" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Critical Pain Points */}
                {data.touchpoints.filter(tp => tp.emotionScore <= 5).length > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-4 h-4" />
                      Critical Pain Points
                    </h4>
                    <div className="space-y-2">
                      {data.touchpoints
                        .filter(tp => tp.emotionScore <= 5)
                        .slice(0, 3)
                        .map((touchpoint) => (
                          <div key={touchpoint.id} className="flex items-center justify-between text-sm">
                            <span>{touchpoint.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-red-600 border-red-200">
                                {touchpoint.emotionScore}/10
                              </Badge>
                              <div className="text-red-600">
                                {getEmotionIcon(touchpoint.emotionScore)}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Opportunities */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Key Opportunities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quick-wins">Quick Wins (comma-separated)</Label>
                      <Textarea
                        id="quick-wins"
                        placeholder="e.g., Add loading indicators, Simplify form fields"
                        value={data.quickWins.join(", ")}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          quickWins: e.target.value.split(",").map(w => w.trim()).filter(Boolean)
                        }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="long-term">Long-term Improvements (comma-separated)</Label>
                      <Textarea
                        id="long-term"
                        placeholder="e.g., Redesign checkout flow, Implement AI chatbot"
                        value={data.longTermImprovements.join(", ")}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          longTermImprovements: e.target.value.split(",").map(i => i.trim()).filter(Boolean)
                        }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Success Metrics */}
                <div>
                  <h4 className="font-semibold mb-3">Success Metrics</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Key Metrics to Track</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {[
                          'Conversion Rate', 'Customer Satisfaction', 'Time to Complete',
                          'Drop-off Rate', 'Net Promoter Score', 'Customer Effort Score',
                          'First Contact Resolution', 'Average Session Duration', 'Return Rate'
                        ].map((metric) => (
                          <label key={metric} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={data.successMetrics.includes(metric)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setData(prev => ({ ...prev, successMetrics: [...prev.successMetrics, metric] }))
                                } else {
                                  setData(prev => ({ ...prev, successMetrics: prev.successMetrics.filter(m => m !== metric) }))
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{metric}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="resource-requirements">Resource Requirements</Label>
                        <Textarea
                          id="resource-requirements"
                          placeholder="What resources are needed to implement improvements..."
                          value={data.resourceRequirements}
                          onChange={(e) => setData(prev => ({ ...prev, resourceRequirements: e.target.value }))}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expected-roi">Expected ROI/Impact</Label>
                        <Textarea
                          id="expected-roi"
                          placeholder="What business impact do you expect from these improvements..."
                          value={data.expectedROI}
                          onChange={(e) => setData(prev => ({ ...prev, expectedROI: e.target.value }))}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Journey Summary */}
                <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                  <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Journey Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Journey:</strong> {data.journeyName}
                    </div>
                    <div>
                      <strong>Persona:</strong> {data.persona.name}
                    </div>
                    <div>
                      <strong>Stages:</strong> {data.stages.length}
                    </div>
                    <div>
                      <strong>Touchpoints:</strong> {data.touchpoints.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </BossCard>
          </div>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(4)}
              variant="outline"
            >
              Previous
            </BossButton>
            <div className="flex gap-2">
              <BossButton 
                onClick={handleSave}
                variant="empowerment"
                crown
              >
                Save Journey Map
              </BossButton>
              <BossButton 
                onClick={() => handleExport('pdf')}
                variant="accent"
              >
                Export Journey
              </BossButton>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </BaseTemplate>
  )
}
