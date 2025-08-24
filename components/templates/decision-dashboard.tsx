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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Minus, 
  TrendingUp, 
  TrendingDown, 
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Scale,
  Crown,
  Zap,
  BarChart3
} from "lucide-react"

interface DecisionOption {
  id: string
  title: string
  description: string
  pros: string[]
  cons: string[]
  impactScore: number
  confidenceScore: number
  riskLevel: number
  resourcesRequired: string
  timeframe: string
}

interface DecisionDashboardData {
  decisionTitle: string
  context: string
  stakeholders: string[]
  deadline: string
  options: DecisionOption[]
  finalDecision?: string
  reasoning?: string
  nextSteps?: string[]
}

interface DecisionDashboardProps {
  template: TemplateData
  onSave?: (data: DecisionDashboardData) => Promise<void>
  onExport?: (format: 'json' | 'pdf' | 'csv') => void
}

export default function DecisionDashboard({ template, onSave, onExport }: DecisionDashboardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<DecisionDashboardData>({
    decisionTitle: "",
    context: "",
    stakeholders: [],
    deadline: "",
    options: []
  })
  const [aiInsights, setAiInsights] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const totalSteps = 4

  // Create a new option
  const createOption = (): DecisionOption => ({
    id: crypto.randomUUID(),
    title: "",
    description: "",
    pros: [""],
    cons: [""],
    impactScore: 50,
    confidenceScore: 50,
    riskLevel: 50,
    resourcesRequired: "",
    timeframe: ""
  })

  // Add new option
  const addOption = () => {
    setData(prev => ({
      ...prev,
      options: [...prev.options, createOption()]
    }))
  }

  // Remove option
  const removeOption = (optionId: string) => {
    setData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== optionId)
    }))
  }

  // Update option
  const updateOption = (optionId: string, updates: Partial<DecisionOption>) => {
    setData(prev => ({
      ...prev,
      options: prev.options.map(opt => 
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    }))
  }

  // Add pro/con
  const addProCon = (optionId: string, type: 'pros' | 'cons') => {
    updateOption(optionId, {
      [type]: [...(data.options.find(o => o.id === optionId)?.[type] || []), ""]
    })
  }

  // Update pro/con
  const updateProCon = (optionId: string, type: 'pros' | 'cons', index: number, value: string) => {
    const option = data.options.find(o => o.id === optionId)
    if (!option) return
    
    const newList = [...option[type]]
    newList[index] = value
    
    updateOption(optionId, { [type]: newList })
  }

  // Remove pro/con
  const removeProCon = (optionId: string, type: 'pros' | 'cons', index: number) => {
    const option = data.options.find(o => o.id === optionId)
    if (!option) return
    
    const newList = option[type].filter((_, i) => i !== index)
    updateOption(optionId, { [type]: newList })
  }

  // Get AI insights for decision
  const getAIInsights = async () => {
    setIsAnalyzing(true)
    try {
      // Simulate AI analysis - in production, call your AI API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const insights = [
        `Based on your options, Option 1 shows the highest impact potential (${data.options[0]?.impactScore || 50}/100)`,
        `Consider the time constraints: your deadline is ${data.context.includes('urgent') ? 'tight' : 'reasonable'}`,
        `Resource allocation is a key factor - ensure you have bandwidth for implementation`,
        `Risk mitigation strategies should be developed for high-risk options`,
        `Stakeholder buy-in will be crucial for success`
      ]
      
      setAiInsights(insights.slice(0, Math.min(3, data.options.length + 1)))
    } catch (error) {
      console.error('Failed to get AI insights:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Calculate decision scores
  const getDecisionScore = (option: DecisionOption) => {
    const impactWeight = 0.4
    const confidenceWeight = 0.3
    const riskWeight = 0.3
    
    // Risk is inversely related to score (lower risk = higher score)
    const riskScore = 100 - option.riskLevel
    
    return Math.round(
      (option.impactScore * impactWeight) +
      (option.confidenceScore * confidenceWeight) +
      (riskScore * riskWeight)
    )
  }

  // Get top recommendation
  const getTopRecommendation = () => {
    if (data.options.length === 0) return null
    
    return data.options.reduce((best, current) => 
      getDecisionScore(current) > getDecisionScore(best) ? current : best
    )
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
      decisionTitle: "",
      context: "",
      stakeholders: [],
      deadline: "",
      options: []
    })
    setCurrentStep(1)
    setAiInsights([])
  }

  // Initialize with one option if none exist
  useEffect(() => {
    if (data.options.length === 0) {
      addOption()
    }
  }, [])

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
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="step-1" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Setup</span>
          </TabsTrigger>
          <TabsTrigger value="step-2" className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">Options</span>
          </TabsTrigger>
          <TabsTrigger value="step-3" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="step-4" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Decision</span>
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Decision Setup */}
        <TabsContent value="step-1" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Decision Setup
              </CardTitle>
              <CardDescription>
                Define your decision context and key details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="decision-title">Decision Title *</Label>
                <Input
                  id="decision-title"
                  placeholder="e.g., Should we pivot our product strategy?"
                  value={data.decisionTitle}
                  onChange={(e) => setData(prev => ({ ...prev, decisionTitle: e.target.value }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="context">Context & Background</Label>
                <Textarea
                  id="context"
                  placeholder="Provide background information about this decision..."
                  value={data.context}
                  onChange={(e) => setData(prev => ({ ...prev, context: e.target.value }))}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deadline">Decision Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={data.deadline}
                    onChange={(e) => setData(prev => ({ ...prev, deadline: e.target.value }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="stakeholders">Key Stakeholders</Label>
                  <Input
                    id="stakeholders"
                    placeholder="Separate with commas"
                    value={data.stakeholders.join(", ")}
                    onChange={(e) => setData(prev => ({ 
                      ...prev, 
                      stakeholders: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                    }))}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </BossCard>

          <div className="flex justify-end">
            <BossButton 
              onClick={() => setCurrentStep(2)}
              disabled={!data.decisionTitle}
              crown
            >
              Next: Add Options
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 2: Options Configuration */}
        <TabsContent value="step-2" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Decision Options</h3>
              <p className="text-sm text-gray-600">Add and configure your available options</p>
            </div>
            <BossButton onClick={addOption} variant="outline" icon={<Plus className="w-4 h-4" />}>
              Add Option
            </BossButton>
          </div>

          <div className="grid gap-6">
            <AnimatePresence>
              {data.options.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <BossCard className="relative">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                      <div>
                        <CardTitle className="text-lg">Option {index + 1}</CardTitle>
                        {getDecisionScore(option) > 70 && (
                          <Badge className="mt-1">High Score</Badge>
                        )}
                      </div>
                      {data.options.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(option.id)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Option Title</Label>
                        <Input
                          value={option.title}
                          onChange={(e) => updateOption(option.id, { title: e.target.value })}
                          placeholder="e.g., Launch new product line"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={option.description}
                          onChange={(e) => updateOption(option.id, { description: e.target.value })}
                          placeholder="Detailed description of this option..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pros */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-green-600 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Pros
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addProCon(option.id, 'pros')}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {option.pros.map((pro, proIndex) => (
                              <div key={proIndex} className="flex gap-2">
                                <Input
                                  value={pro}
                                  onChange={(e) => updateProCon(option.id, 'pros', proIndex, e.target.value)}
                                  placeholder="Enter a benefit..."
                                  className="text-sm"
                                />
                                {option.pros.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeProCon(option.id, 'pros', proIndex)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cons */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-red-600 flex items-center gap-1">
                              <TrendingDown className="w-4 h-4" />
                              Cons
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addProCon(option.id, 'cons')}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {option.cons.map((con, conIndex) => (
                              <div key={conIndex} className="flex gap-2">
                                <Input
                                  value={con}
                                  onChange={(e) => updateProCon(option.id, 'cons', conIndex, e.target.value)}
                                  placeholder="Enter a drawback..."
                                  className="text-sm"
                                />
                                {option.cons.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeProCon(option.id, 'cons', conIndex)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Scoring Sliders */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <Label className="text-sm">Impact Score: {option.impactScore}</Label>
                          <Slider
                            value={[option.impactScore]}
                            onValueChange={([value]) => updateOption(option.id, { impactScore: value })}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">Expected business impact</p>
                        </div>

                        <div>
                          <Label className="text-sm">Confidence: {option.confidenceScore}</Label>
                          <Slider
                            value={[option.confidenceScore]}
                            onValueChange={([value]) => updateOption(option.id, { confidenceScore: value })}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">How confident you are</p>
                        </div>

                        <div>
                          <Label className="text-sm">Risk Level: {option.riskLevel}</Label>
                          <Slider
                            value={[option.riskLevel]}
                            onValueChange={([value]) => updateOption(option.id, { riskLevel: value })}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">Potential risk involved</p>
                        </div>
                      </div>

                      <div className="text-center pt-2 border-t">
                        <div className="text-lg font-bold text-purple-600">
                          Decision Score: {getDecisionScore(option)}/100
                        </div>
                      </div>
                    </CardContent>
                  </BossCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(1)}
              variant="outline"
            >
              Previous
            </BossButton>
            <BossButton 
              onClick={() => setCurrentStep(3)}
              disabled={data.options.some(opt => !opt.title)}
              crown
            >
              Next: Analysis
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 3: AI Analysis */}
        <TabsContent value="step-3" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Decision Analysis
              </CardTitle>
              <CardDescription>
                AI-powered insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <BossButton
                  onClick={getAIInsights}
                  loading={isAnalyzing}
                  crown
                  className="px-8"
                >
                  {isAnalyzing ? "Analyzing..." : "Get AI Insights"}
                </BossButton>
              </div>

              {aiInsights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h4 className="font-semibold flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    AI Insights
                  </h4>
                  {aiInsights.map((insight, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{insight}</AlertDescription>
                    </Alert>
                  ))}
                </motion.div>
              )}

              {/* Option Comparison */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Option Comparison
                </h4>
                <div className="space-y-4">
                  {data.options
                    .sort((a, b) => getDecisionScore(b) - getDecisionScore(a))
                    .map((option, index) => (
                      <div key={option.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{option.title || `Option ${index + 1}`}</h5>
                            <div className="flex items-center gap-2">
                              {index === 0 && (
                                <Badge className="bg-green-100 text-green-700">Recommended</Badge>
                              )}
                              <span className="font-bold text-purple-600">
                                {getDecisionScore(option)}/100
                              </span>
                            </div>
                          </div>
                          <Progress value={getDecisionScore(option)} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Impact: {option.impactScore}</span>
                            <span>Confidence: {option.confidenceScore}</span>
                            <span>Risk: {option.riskLevel}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {getTopRecommendation() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200"
                >
                  <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Top Recommendation
                  </h4>
                  <p className="text-lg font-medium text-purple-900">
                    {getTopRecommendation()?.title}
                  </p>
                  <p className="text-sm text-purple-700 mt-2">
                    Score: {getDecisionScore(getTopRecommendation()!)}/100
                  </p>
                </motion.div>
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
              Make Decision
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 4: Final Decision */}
        <TabsContent value="step-4" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Final Decision
              </CardTitle>
              <CardDescription>
                Document your decision and next steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="final-decision">Selected Option</Label>
                <Textarea
                  id="final-decision"
                  placeholder="Document your final decision and the reasoning behind it..."
                  value={data.finalDecision || ""}
                  onChange={(e) => setData(prev => ({ ...prev, finalDecision: e.target.value }))}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="reasoning">Decision Reasoning</Label>
                <Textarea
                  id="reasoning"
                  placeholder="Explain why you chose this option over others..."
                  value={data.reasoning || ""}
                  onChange={(e) => setData(prev => ({ ...prev, reasoning: e.target.value }))}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <Label>Next Steps</Label>
                <div className="space-y-2 mt-2">
                  {(data.nextSteps || [""]).map((step, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...(data.nextSteps || [])]
                          newSteps[index] = e.target.value
                          setData(prev => ({ ...prev, nextSteps: newSteps }))
                        }}
                        placeholder={`Step ${index + 1}...`}
                      />
                      {(data.nextSteps || []).length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newSteps = (data.nextSteps || []).filter((_, i) => i !== index)
                            setData(prev => ({ ...prev, nextSteps: newSteps }))
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setData(prev => ({
                        ...prev,
                        nextSteps: [...(prev.nextSteps || []), ""]
                      }))
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              </div>
            </CardContent>
          </BossCard>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(3)}
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
                Save Decision
              </BossButton>
              <BossButton 
                onClick={() => handleExport('pdf')}
                variant="accent"
              >
                Export PDF
              </BossButton>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </BaseTemplate>
  )
}
