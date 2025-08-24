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
  Building2, 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3, 
  Lightbulb, 
  CheckCircle,
  Plus,
  Minus,
  PieChart,
  Crown,
  Zap,
  Brain,
  AlertTriangle,
  FileText,
  Globe
} from "lucide-react"

interface FinancialProjection {
  year: number
  revenue: number
  expenses: number
  profit: number
  growth: number
}

interface MarketSegment {
  id: string
  name: string
  size: number
  growth: number
  competition: string
  opportunity: number
}

interface Milestone {
  id: string
  title: string
  description: string
  targetDate: string
  budget: number
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed'
}

interface BusinessPlanData {
  // Executive Summary
  companyName: string
  missionStatement: string
  visionStatement: string
  executiveSummary: string
  keySuccessFactors: string[]
  
  // Market Analysis
  industryOverview: string
  targetMarket: string
  marketSize: number
  marketSegments: MarketSegment[]
  competitorAnalysis: string
  competitiveAdvantages: string[]
  
  // Products/Services
  productDescription: string
  valueProposition: string
  pricingStrategy: string
  revenueModel: string
  
  // Marketing Strategy
  marketingChannels: string[]
  customerAcquisitionStrategy: string
  brandingStrategy: string
  
  // Financial Projections
  startupCosts: number
  fundingRequired: number
  financialProjections: FinancialProjection[]
  breakEvenPoint: number
  
  // Implementation
  milestones: Milestone[]
  teamStructure: string
  operationalPlan: string
  riskAnalysis: string
}

interface StrategicBusinessPlanProps {
  template: TemplateData
  onSave?: (data: BusinessPlanData) => Promise<void>
  onExport?: (format: 'json' | 'pdf' | 'csv') => void
}

export default function StrategicBusinessPlan({ template, onSave, onExport }: StrategicBusinessPlanProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<BusinessPlanData>({
    companyName: "",
    missionStatement: "",
    visionStatement: "",
    executiveSummary: "",
    keySuccessFactors: [""],
    industryOverview: "",
    targetMarket: "",
    marketSize: 0,
    marketSegments: [],
    competitorAnalysis: "",
    competitiveAdvantages: [""],
    productDescription: "",
    valueProposition: "",
    pricingStrategy: "",
    revenueModel: "",
    marketingChannels: [],
    customerAcquisitionStrategy: "",
    brandingStrategy: "",
    startupCosts: 0,
    fundingRequired: 0,
    financialProjections: [],
    breakEvenPoint: 12,
    milestones: [],
    teamStructure: "",
    operationalPlan: "",
    riskAnalysis: ""
  })
  const [aiInsights, setAiInsights] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const totalSteps = 6

  // Add key success factor
  const addKeySuccessFactor = () => {
    setData(prev => ({
      ...prev,
      keySuccessFactors: [...prev.keySuccessFactors, ""]
    }))
  }

  // Update key success factor
  const updateKeySuccessFactor = (index: number, value: string) => {
    const newFactors = [...data.keySuccessFactors]
    newFactors[index] = value
    setData(prev => ({ ...prev, keySuccessFactors: newFactors }))
  }

  // Remove key success factor
  const removeKeySuccessFactor = (index: number) => {
    setData(prev => ({
      ...prev,
      keySuccessFactors: prev.keySuccessFactors.filter((_, i) => i !== index)
    }))
  }

  // Add market segment
  const addMarketSegment = () => {
    const newSegment: MarketSegment = {
      id: crypto.randomUUID(),
      name: "",
      size: 0,
      growth: 5,
      competition: "",
      opportunity: 50
    }
    setData(prev => ({
      ...prev,
      marketSegments: [...prev.marketSegments, newSegment]
    }))
  }

  // Update market segment
  const updateMarketSegment = (id: string, updates: Partial<MarketSegment>) => {
    setData(prev => ({
      ...prev,
      marketSegments: prev.marketSegments.map(segment =>
        segment.id === id ? { ...segment, ...updates } : segment
      )
    }))
  }

  // Remove market segment
  const removeMarketSegment = (id: string) => {
    setData(prev => ({
      ...prev,
      marketSegments: prev.marketSegments.filter(segment => segment.id !== id)
    }))
  }

  // Add competitive advantage
  const addCompetitiveAdvantage = () => {
    setData(prev => ({
      ...prev,
      competitiveAdvantages: [...prev.competitiveAdvantages, ""]
    }))
  }

  // Update competitive advantage
  const updateCompetitiveAdvantage = (index: number, value: string) => {
    const newAdvantages = [...data.competitiveAdvantages]
    newAdvantages[index] = value
    setData(prev => ({ ...prev, competitiveAdvantages: newAdvantages }))
  }

  // Remove competitive advantage
  const removeCompetitiveAdvantage = (index: number) => {
    setData(prev => ({
      ...prev,
      competitiveAdvantages: prev.competitiveAdvantages.filter((_, i) => i !== index)
    }))
  }

  // Generate financial projections
  const generateFinancialProjections = () => {
    const projections: FinancialProjection[] = []
    const baseRevenue = data.startupCosts * 0.5 || 100000
    
    for (let year = 1; year <= 5; year++) {
      const growth = Math.pow(1.3, year - 1) // 30% growth year over year
      const revenue = Math.round(baseRevenue * growth)
      const expenses = Math.round(revenue * 0.7) // 70% expense ratio
      const profit = revenue - expenses
      const growthRate = year === 1 ? 0 : Math.round(((revenue / (projections[year - 2]?.revenue || revenue)) - 1) * 100)
      
      projections.push({
        year,
        revenue,
        expenses,
        profit,
        growth: growthRate
      })
    }
    
    setData(prev => ({ ...prev, financialProjections: projections }))
  }

  // Add milestone
  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      targetDate: "",
      budget: 0,
      priority: 'medium',
      status: 'pending'
    }
    setData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }))
  }

  // Update milestone
  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setData(prev => ({
      ...prev,
      milestones: prev.milestones.map(milestone =>
        milestone.id === id ? { ...milestone, ...updates } : milestone
      )
    }))
  }

  // Remove milestone
  const removeMilestone = (id: string) => {
    setData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(milestone => milestone.id !== id)
    }))
  }

  // Get AI insights
  const getAIInsights = async () => {
    setIsAnalyzing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const insights = [
        `Your market size of $${(data.marketSize / 1000000).toFixed(1)}M indicates ${data.marketSize > 100000000 ? 'strong' : 'moderate'} market potential`,
        `Consider diversifying revenue streams beyond your current ${data.revenueModel || 'subscription'} model`,
        `Your competitive advantages are ${data.competitiveAdvantages.filter(Boolean).length > 3 ? 'well-defined' : 'limited'} - consider strengthening unique value props`,
        `Financial projections show ${data.financialProjections.length > 0 && data.financialProjections[0]?.profit > 0 ? 'positive' : 'challenging'} profitability outlook`,
        `Your ${data.milestones.filter(m => m.priority === 'high').length} high-priority milestones suggest ${data.milestones.length > 8 ? 'aggressive' : 'realistic'} timeline`
      ]
      
      setAiInsights(insights.slice(0, 4))
    } catch (error) {
      console.error('Failed to get AI insights:', error)
    } finally {
      setIsAnalyzing(false)
    }
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
      companyName: "",
      missionStatement: "",
      visionStatement: "",
      executiveSummary: "",
      keySuccessFactors: [""],
      industryOverview: "",
      targetMarket: "",
      marketSize: 0,
      marketSegments: [],
      competitorAnalysis: "",
      competitiveAdvantages: [""],
      productDescription: "",
      valueProposition: "",
      pricingStrategy: "",
      revenueModel: "",
      marketingChannels: [],
      customerAcquisitionStrategy: "",
      brandingStrategy: "",
      startupCosts: 0,
      fundingRequired: 0,
      financialProjections: [],
      breakEvenPoint: 12,
      milestones: [],
      teamStructure: "",
      operationalPlan: "",
      riskAnalysis: ""
    })
    setCurrentStep(1)
    setAiInsights([])
  }

  // Auto-generate financial projections when startup costs change
  useEffect(() => {
    if (data.startupCosts > 0) {
      generateFinancialProjections()
    }
  }, [data.startupCosts])

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
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="step-1" className="flex items-center gap-1 text-xs">
            <Building2 className="w-3 h-3" />
            <span className="hidden lg:inline">Executive</span>
          </TabsTrigger>
          <TabsTrigger value="step-2" className="flex items-center gap-1 text-xs">
            <BarChart3 className="w-3 h-3" />
            <span className="hidden lg:inline">Market</span>
          </TabsTrigger>
          <TabsTrigger value="step-3" className="flex items-center gap-1 text-xs">
            <Target className="w-3 h-3" />
            <span className="hidden lg:inline">Product</span>
          </TabsTrigger>
          <TabsTrigger value="step-4" className="flex items-center gap-1 text-xs">
            <Users className="w-3 h-3" />
            <span className="hidden lg:inline">Marketing</span>
          </TabsTrigger>
          <TabsTrigger value="step-5" className="flex items-center gap-1 text-xs">
            <DollarSign className="w-3 h-3" />
            <span className="hidden lg:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="step-6" className="flex items-center gap-1 text-xs">
            <CheckCircle className="w-3 h-3" />
            <span className="hidden lg:inline">Plan</span>
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Executive Summary */}
        <TabsContent value="step-1" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Executive Summary
              </CardTitle>
              <CardDescription>
                Define your company's core identity and vision
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    placeholder="Your company name"
                    value={data.companyName}
                    onChange={(e) => setData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Select onValueChange={(value) => setData(prev => ({ ...prev, industryOverview: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="services">Professional Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="mission">Mission Statement</Label>
                <Textarea
                  id="mission"
                  placeholder="What is your company's purpose and core mission?"
                  value={data.missionStatement}
                  onChange={(e) => setData(prev => ({ ...prev, missionStatement: e.target.value }))}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="vision">Vision Statement</Label>
                <Textarea
                  id="vision"
                  placeholder="What do you aspire to achieve in the long term?"
                  value={data.visionStatement}
                  onChange={(e) => setData(prev => ({ ...prev, visionStatement: e.target.value }))}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="executive-summary">Executive Summary</Label>
                <Textarea
                  id="executive-summary"
                  placeholder="Provide a comprehensive overview of your business concept, market opportunity, competitive advantages, and financial highlights..."
                  value={data.executiveSummary}
                  onChange={(e) => setData(prev => ({ ...prev, executiveSummary: e.target.value }))}
                  className="mt-2"
                  rows={6}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Key Success Factors</Label>
                  <Button variant="ghost" size="sm" onClick={addKeySuccessFactor}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {data.keySuccessFactors.map((factor, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={factor}
                        onChange={(e) => updateKeySuccessFactor(index, e.target.value)}
                        placeholder="What will drive your success?"
                      />
                      {data.keySuccessFactors.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKeySuccessFactor(index)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </BossCard>

          <div className="flex justify-end">
            <BossButton 
              onClick={() => setCurrentStep(2)}
              disabled={!data.companyName || !data.missionStatement}
              crown
            >
              Next: Market Analysis
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 2: Market Analysis */}
        <TabsContent value="step-2" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Market Analysis
              </CardTitle>
              <CardDescription>
                Analyze your target market and competitive landscape
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target-market">Target Market</Label>
                  <Textarea
                    id="target-market"
                    placeholder="Describe your primary target customers..."
                    value={data.targetMarket}
                    onChange={(e) => setData(prev => ({ ...prev, targetMarket: e.target.value }))}
                    className="mt-2"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="market-size">Total Addressable Market (TAM)</Label>
                  <Input
                    id="market-size"
                    type="number"
                    placeholder="Market size in USD"
                    value={data.marketSize}
                    onChange={(e) => setData(prev => ({ ...prev, marketSize: parseInt(e.target.value) || 0 }))}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Current: ${(data.marketSize / 1000000).toFixed(1)}M
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">Market Segments</h4>
                    <p className="text-sm text-gray-600">Break down your market into segments</p>
                  </div>
                  <BossButton onClick={addMarketSegment} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Segment
                  </BossButton>
                </div>

                <div className="grid gap-4">
                  {data.marketSegments.map((segment) => (
                    <motion.div
                      key={segment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <Input
                          placeholder="Segment name"
                          value={segment.name}
                          onChange={(e) => updateMarketSegment(segment.id, { name: e.target.value })}
                          className="font-medium"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMarketSegment(segment.id)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Market Size ($M)</Label>
                          <Input
                            type="number"
                            value={segment.size}
                            onChange={(e) => updateMarketSegment(segment.id, { size: parseInt(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Growth Rate (%)</Label>
                          <Input
                            type="number"
                            value={segment.growth}
                            onChange={(e) => updateMarketSegment(segment.id, { growth: parseInt(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Label className="text-sm">Opportunity Score: {segment.opportunity}/100</Label>
                        <Slider
                          value={[segment.opportunity]}
                          onValueChange={([value]) => updateMarketSegment(segment.id, { opportunity: value })}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="competitor-analysis">Competitive Analysis</Label>
                <Textarea
                  id="competitor-analysis"
                  placeholder="Analyze your main competitors, their strengths, weaknesses, and market positioning..."
                  value={data.competitorAnalysis}
                  onChange={(e) => setData(prev => ({ ...prev, competitorAnalysis: e.target.value }))}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Competitive Advantages</Label>
                  <Button variant="ghost" size="sm" onClick={addCompetitiveAdvantage}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {data.competitiveAdvantages.map((advantage, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={advantage}
                        onChange={(e) => updateCompetitiveAdvantage(index, e.target.value)}
                        placeholder="What sets you apart from competitors?"
                      />
                      {data.competitiveAdvantages.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCompetitiveAdvantage(index)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
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
              Next: Products & Services
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 3: Products & Services */}
        <TabsContent value="step-3" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Products & Services
              </CardTitle>
              <CardDescription>
                Define your offerings and value proposition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="product-description">Product/Service Description</Label>
                <Textarea
                  id="product-description"
                  placeholder="Provide a detailed description of your products or services..."
                  value={data.productDescription}
                  onChange={(e) => setData(prev => ({ ...prev, productDescription: e.target.value }))}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="value-proposition">Value Proposition</Label>
                <Textarea
                  id="value-proposition"
                  placeholder="What unique value do you provide to customers? How do you solve their problems?"
                  value={data.valueProposition}
                  onChange={(e) => setData(prev => ({ ...prev, valueProposition: e.target.value }))}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Revenue Model</Label>
                  <Select onValueChange={(value) => setData(prev => ({ ...prev, revenueModel: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select revenue model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscription">Subscription</SelectItem>
                      <SelectItem value="one-time">One-time Purchase</SelectItem>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="marketplace">Marketplace/Commission</SelectItem>
                      <SelectItem value="advertising">Advertising</SelectItem>
                      <SelectItem value="licensing">Licensing</SelectItem>
                      <SelectItem value="consulting">Consulting/Services</SelectItem>
                      <SelectItem value="hybrid">Hybrid Model</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pricing-strategy">Pricing Strategy</Label>
                  <Input
                    id="pricing-strategy"
                    placeholder="e.g., Premium pricing, Cost-plus, Value-based"
                    value={data.pricingStrategy}
                    onChange={(e) => setData(prev => ({ ...prev, pricingStrategy: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>
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
              Next: Marketing Strategy
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 4: Marketing Strategy */}
        <TabsContent value="step-4" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Marketing Strategy
              </CardTitle>
              <CardDescription>
                Plan how you'll reach and acquire customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="customer-acquisition">Customer Acquisition Strategy</Label>
                <Textarea
                  id="customer-acquisition"
                  placeholder="How will you attract and convert customers? Include channels, tactics, and customer journey..."
                  value={data.customerAcquisitionStrategy}
                  onChange={(e) => setData(prev => ({ ...prev, customerAcquisitionStrategy: e.target.value }))}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <Label>Marketing Channels</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {[
                    'Social Media', 'Content Marketing', 'Email Marketing', 
                    'SEO/SEM', 'Paid Advertising', 'Influencer Marketing',
                    'PR/Media', 'Events', 'Partnerships', 'Direct Sales',
                    'Referrals', 'Community Building'
                  ].map((channel) => (
                    <label key={channel} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={data.marketingChannels.includes(channel)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setData(prev => ({ ...prev, marketingChannels: [...prev.marketingChannels, channel] }))
                          } else {
                            setData(prev => ({ ...prev, marketingChannels: prev.marketingChannels.filter(c => c !== channel) }))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{channel}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="branding-strategy">Branding Strategy</Label>
                <Textarea
                  id="branding-strategy"
                  placeholder="Describe your brand positioning, messaging, visual identity, and brand experience..."
                  value={data.brandingStrategy}
                  onChange={(e) => setData(prev => ({ ...prev, brandingStrategy: e.target.value }))}
                  className="mt-2"
                  rows={4}
                />
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
            <BossButton 
              onClick={() => setCurrentStep(5)}
              crown
            >
              Next: Financial Projections
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 5: Financial Projections */}
        <TabsContent value="step-5" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Financial Projections
              </CardTitle>
              <CardDescription>
                Plan your finances and funding requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startup-costs">Startup Costs</Label>
                  <Input
                    id="startup-costs"
                    type="number"
                    placeholder="Initial investment needed"
                    value={data.startupCosts}
                    onChange={(e) => setData(prev => ({ ...prev, startupCosts: parseInt(e.target.value) || 0 }))}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    ${data.startupCosts.toLocaleString()}
                  </p>
                </div>

                <div>
                  <Label htmlFor="funding-required">Funding Required</Label>
                  <Input
                    id="funding-required"
                    type="number"
                    placeholder="Total funding needed"
                    value={data.fundingRequired}
                    onChange={(e) => setData(prev => ({ ...prev, fundingRequired: parseInt(e.target.value) || 0 }))}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    ${data.fundingRequired.toLocaleString()}
                  </p>
                </div>

                <div>
                  <Label htmlFor="break-even">Break-even Point (months)</Label>
                  <Slider
                    value={[data.breakEvenPoint]}
                    onValueChange={([value]) => setData(prev => ({ ...prev, breakEvenPoint: value }))}
                    max={60}
                    min={6}
                    step={1}
                    className="mt-4"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {data.breakEvenPoint} months
                  </p>
                </div>
              </div>

              {data.financialProjections.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    5-Year Financial Projections
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-3 text-left">Year</th>
                          <th className="border border-gray-300 p-3 text-right">Revenue</th>
                          <th className="border border-gray-300 p-3 text-right">Expenses</th>
                          <th className="border border-gray-300 p-3 text-right">Profit</th>
                          <th className="border border-gray-300 p-3 text-right">Growth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.financialProjections.map((projection) => (
                          <tr key={projection.year}>
                            <td className="border border-gray-300 p-3 font-medium">Year {projection.year}</td>
                            <td className="border border-gray-300 p-3 text-right">${projection.revenue.toLocaleString()}</td>
                            <td className="border border-gray-300 p-3 text-right">${projection.expenses.toLocaleString()}</td>
                            <td className={`border border-gray-300 p-3 text-right font-medium ${projection.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${projection.profit.toLocaleString()}
                            </td>
                            <td className="border border-gray-300 p-3 text-right">
                              {projection.growth > 0 && '+'}
                              {projection.growth}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <BossButton
                  onClick={generateFinancialProjections}
                  variant="outline"
                  crown
                >
                  Generate Projections
                </BossButton>
              </div>
            </CardContent>
          </BossCard>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(4)}
              variant="outline"
            >
              Previous
            </BossButton>
            <BossButton 
              onClick={() => setCurrentStep(6)}
              crown
            >
              Next: Implementation Plan
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 6: Implementation Plan */}
        <TabsContent value="step-6" className="space-y-6">
          <div className="grid gap-6">
            <BossCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  Implementation Plan
                </CardTitle>
                <CardDescription>
                  Create your roadmap to execution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">Key Milestones</h4>
                      <p className="text-sm text-gray-600">Define major milestones and deadlines</p>
                    </div>
                    <BossButton onClick={addMilestone} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Milestone
                    </BossButton>
                  </div>

                  <div className="space-y-4">
                    {data.milestones.map((milestone) => (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <Input
                            placeholder="Milestone title"
                            value={milestone.title}
                            onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                            className="font-medium flex-1 mr-4"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMilestone(milestone.id)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <Textarea
                          placeholder="Milestone description"
                          value={milestone.description}
                          onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                          className="mb-3"
                          rows={2}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <Label className="text-sm">Target Date</Label>
                            <Input
                              type="date"
                              value={milestone.targetDate}
                              onChange={(e) => updateMilestone(milestone.id, { targetDate: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Budget ($)</Label>
                            <Input
                              type="number"
                              value={milestone.budget}
                              onChange={(e) => updateMilestone(milestone.id, { budget: parseInt(e.target.value) || 0 })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Priority</Label>
                            <Select onValueChange={(value: any) => updateMilestone(milestone.id, { priority: value })}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder={milestone.priority} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm">Status</Label>
                            <Select onValueChange={(value: any) => updateMilestone(milestone.id, { status: value })}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder={milestone.status} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <Badge 
                            className={
                              milestone.priority === 'high' ? 'bg-red-100 text-red-700' :
                              milestone.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }
                          >
                            {milestone.priority} priority
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Budget: ${milestone.budget.toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="team-structure">Team Structure</Label>
                    <Textarea
                      id="team-structure"
                      placeholder="Describe your team, key roles, and organizational structure..."
                      value={data.teamStructure}
                      onChange={(e) => setData(prev => ({ ...prev, teamStructure: e.target.value }))}
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="operational-plan">Operational Plan</Label>
                    <Textarea
                      id="operational-plan"
                      placeholder="Describe your day-to-day operations, processes, and systems..."
                      value={data.operationalPlan}
                      onChange={(e) => setData(prev => ({ ...prev, operationalPlan: e.target.value }))}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="risk-analysis">Risk Analysis & Mitigation</Label>
                  <Textarea
                    id="risk-analysis"
                    placeholder="Identify potential risks and your strategies to mitigate them..."
                    value={data.riskAnalysis}
                    onChange={(e) => setData(prev => ({ ...prev, riskAnalysis: e.target.value }))}
                    className="mt-2"
                    rows={4}
                  />
                </div>
              </CardContent>
            </BossCard>

            {/* AI Insights Section */}
            <BossCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Business Analysis
                </CardTitle>
                <CardDescription>
                  Get AI-powered insights on your business plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    className="space-y-3"
                  >
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      AI Recommendations
                    </h4>
                    {aiInsights.map((insight, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{insight}</AlertDescription>
                      </Alert>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </BossCard>
          </div>

          <div className="flex justify-between">
            <BossButton 
              onClick={() => setCurrentStep(5)}
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
                Save Business Plan
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
