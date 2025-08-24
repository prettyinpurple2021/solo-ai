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
  Share2, 
  Target, 
  Calendar, 
  Hash, 
  BarChart3, 
  Users, 
  TrendingUp,
  MessageCircle,
  Heart,
  Eye,
  Plus,
  Minus,
  Clock,
  Zap,
  Crown,
  Brain,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Settings,
  Camera,
  Video,
  FileText,
  Link,
  Tag,
  Lightbulb,
  Star
} from "lucide-react"

interface SocialPlatform {
  name: string
  enabled: boolean
  handle: string
  followers: number
  engagement: number
  postFrequency: number
  bestTimes: string[]
  contentTypes: string[]
}

interface ContentPost {
  id: string
  title: string
  content: string
  contentType: 'image' | 'video' | 'carousel' | 'text' | 'story' | 'reel'
  platforms: string[]
  hashtags: string[]
  scheduledDate: string
  status: 'draft' | 'scheduled' | 'published'
  estimatedReach: number
  category: string
}

interface HashtagSet {
  id: string
  name: string
  tags: string[]
  category: string
  popularity: 'trending' | 'popular' | 'niche'
  difficulty: number
}

interface SocialGoal {
  id: string
  title: string
  description: string
  metric: string
  targetValue: number
  currentValue: number
  deadline: string
  priority: 'high' | 'medium' | 'low'
}

interface SocialMediaStrategyData {
  // Strategy Setup
  brandName: string
  industry: string
  targetAudience: string
  brandVoice: string
  objectives: string[]
  
  // Platforms
  platforms: SocialPlatform[]
  
  // Content Strategy
  contentPillars: string[]
  contentMix: {
    educational: number
    entertaining: number
    promotional: number
    inspirational: number
    userGenerated: number
  }
  
  // Content Calendar
  posts: ContentPost[]
  
  // Hashtag Strategy
  hashtagSets: HashtagSet[]
  hashtagStrategy: string
  
  // Goals & KPIs
  goals: SocialGoal[]
  kpiMetrics: string[]
  
  // Engagement Strategy
  engagementTactics: string[]
  communityGuidelines: string
  responseTime: number
  
  // Analytics & Reporting
  reportingFrequency: 'daily' | 'weekly' | 'monthly'
  trackingMetrics: string[]
  competitorTracking: boolean
}

interface SocialMediaStrategyProps {
  template: TemplateData
  onSave?: (data: SocialMediaStrategyData) => Promise<void>
  onExport?: (format: 'json' | 'pdf' | 'csv') => void
}

export default function SocialMediaStrategy({ template, onSave, onExport }: SocialMediaStrategyProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<SocialMediaStrategyData>({
    brandName: "",
    industry: "",
    targetAudience: "",
    brandVoice: "",
    objectives: [],
    platforms: [
      {
        name: "Instagram",
        enabled: false,
        handle: "",
        followers: 0,
        engagement: 3.5,
        postFrequency: 1,
        bestTimes: [],
        contentTypes: []
      },
      {
        name: "Facebook",
        enabled: false,
        handle: "",
        followers: 0,
        engagement: 2.8,
        postFrequency: 1,
        bestTimes: [],
        contentTypes: []
      },
      {
        name: "Twitter",
        enabled: false,
        handle: "",
        followers: 0,
        engagement: 1.9,
        postFrequency: 3,
        bestTimes: [],
        contentTypes: []
      },
      {
        name: "LinkedIn",
        enabled: false,
        handle: "",
        followers: 0,
        engagement: 4.2,
        postFrequency: 1,
        bestTimes: [],
        contentTypes: []
      },
      {
        name: "TikTok",
        enabled: false,
        handle: "",
        followers: 0,
        engagement: 8.5,
        postFrequency: 1,
        bestTimes: [],
        contentTypes: []
      },
      {
        name: "YouTube",
        enabled: false,
        handle: "",
        followers: 0,
        engagement: 6.1,
        postFrequency: 1,
        bestTimes: [],
        contentTypes: []
      }
    ],
    contentPillars: [""],
    contentMix: {
      educational: 40,
      entertaining: 30,
      promotional: 20,
      inspirational: 5,
      userGenerated: 5
    },
    posts: [],
    hashtagSets: [],
    hashtagStrategy: "",
    goals: [],
    kpiMetrics: [],
    engagementTactics: [],
    communityGuidelines: "",
    responseTime: 2,
    reportingFrequency: 'weekly',
    trackingMetrics: [],
    competitorTracking: false
  })

  const totalSteps = 5

  // Update platform
  const updatePlatform = (platformName: string, updates: Partial<SocialPlatform>) => {
    setData(prev => ({
      ...prev,
      platforms: prev.platforms.map(platform =>
        platform.name === platformName ? { ...platform, ...updates } : platform
      )
    }))
  }

  // Add content pillar
  const addContentPillar = () => {
    setData(prev => ({
      ...prev,
      contentPillars: [...prev.contentPillars, ""]
    }))
  }

  // Update content pillar
  const updateContentPillar = (index: number, value: string) => {
    const newPillars = [...data.contentPillars]
    newPillars[index] = value
    setData(prev => ({ ...prev, contentPillars: newPillars }))
  }

  // Remove content pillar
  const removeContentPillar = (index: number) => {
    setData(prev => ({
      ...prev,
      contentPillars: prev.contentPillars.filter((_, i) => i !== index)
    }))
  }

  // Add content post
  const addContentPost = () => {
    const newPost: ContentPost = {
      id: crypto.randomUUID(),
      title: "",
      content: "",
      contentType: 'image',
      platforms: [],
      hashtags: [],
      scheduledDate: "",
      status: 'draft',
      estimatedReach: 0,
      category: ""
    }
    setData(prev => ({
      ...prev,
      posts: [...prev.posts, newPost]
    }))
  }

  // Update content post
  const updateContentPost = (id: string, updates: Partial<ContentPost>) => {
    setData(prev => ({
      ...prev,
      posts: prev.posts.map(post =>
        post.id === id ? { ...post, ...updates } : post
      )
    }))
  }

  // Remove content post
  const removeContentPost = (id: string) => {
    setData(prev => ({
      ...prev,
      posts: prev.posts.filter(post => post.id !== id)
    }))
  }

  // Add hashtag set
  const addHashtagSet = () => {
    const newSet: HashtagSet = {
      id: crypto.randomUUID(),
      name: "",
      tags: [""],
      category: "",
      popularity: 'popular',
      difficulty: 50
    }
    setData(prev => ({
      ...prev,
      hashtagSets: [...prev.hashtagSets, newSet]
    }))
  }

  // Update hashtag set
  const updateHashtagSet = (id: string, updates: Partial<HashtagSet>) => {
    setData(prev => ({
      ...prev,
      hashtagSets: prev.hashtagSets.map(set =>
        set.id === id ? { ...set, ...updates } : set
      )
    }))
  }

  // Remove hashtag set
  const removeHashtagSet = (id: string) => {
    setData(prev => ({
      ...prev,
      hashtagSets: prev.hashtagSets.filter(set => set.id !== id)
    }))
  }

  // Add hashtag to set
  const addHashtagToSet = (setId: string) => {
    const set = data.hashtagSets.find(s => s.id === setId)
    if (set) {
      updateHashtagSet(setId, { tags: [...set.tags, ""] })
    }
  }

  // Update hashtag in set
  const updateHashtagInSet = (setId: string, tagIndex: number, value: string) => {
    const set = data.hashtagSets.find(s => s.id === setId)
    if (set) {
      const newTags = [...set.tags]
      newTags[tagIndex] = value
      updateHashtagSet(setId, { tags: newTags })
    }
  }

  // Remove hashtag from set
  const removeHashtagFromSet = (setId: string, tagIndex: number) => {
    const set = data.hashtagSets.find(s => s.id === setId)
    if (set && set.tags.length > 1) {
      const newTags = set.tags.filter((_, i) => i !== tagIndex)
      updateHashtagSet(setId, { tags: newTags })
    }
  }

  // Add social goal
  const addSocialGoal = () => {
    const newGoal: SocialGoal = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      metric: "",
      targetValue: 0,
      currentValue: 0,
      deadline: "",
      priority: 'medium'
    }
    setData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }))
  }

  // Update social goal
  const updateSocialGoal = (id: string, updates: Partial<SocialGoal>) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(goal =>
        goal.id === id ? { ...goal, ...updates } : goal
      )
    }))
  }

  // Remove social goal
  const removeSocialGoal = (id: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal.id !== id)
    }))
  }

  // Calculate total reach
  const getTotalReach = () => {
    return data.platforms
      .filter(p => p.enabled)
      .reduce((total, platform) => total + platform.followers, 0)
  }

  // Get average engagement rate
  const getAverageEngagement = () => {
    const enabledPlatforms = data.platforms.filter(p => p.enabled)
    if (enabledPlatforms.length === 0) return 0
    
    const totalEngagement = enabledPlatforms.reduce((total, platform) => total + platform.engagement, 0)
    return Math.round((totalEngagement / enabledPlatforms.length) * 100) / 100
  }

  // Get posts per week
  const getPostsPerWeek = () => {
    return data.platforms
      .filter(p => p.enabled)
      .reduce((total, platform) => total + (platform.postFrequency * 7), 0)
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
      brandName: "",
      industry: "",
      targetAudience: "",
      brandVoice: "",
      objectives: [],
      platforms: [
        {
          name: "Instagram",
          enabled: false,
          handle: "",
          followers: 0,
          engagement: 3.5,
          postFrequency: 1,
          bestTimes: [],
          contentTypes: []
        },
        {
          name: "Facebook",
          enabled: false,
          handle: "",
          followers: 0,
          engagement: 2.8,
          postFrequency: 1,
          bestTimes: [],
          contentTypes: []
        },
        {
          name: "Twitter",
          enabled: false,
          handle: "",
          followers: 0,
          engagement: 1.9,
          postFrequency: 3,
          bestTimes: [],
          contentTypes: []
        },
        {
          name: "LinkedIn",
          enabled: false,
          handle: "",
          followers: 0,
          engagement: 4.2,
          postFrequency: 1,
          bestTimes: [],
          contentTypes: []
        },
        {
          name: "TikTok",
          enabled: false,
          handle: "",
          followers: 0,
          engagement: 8.5,
          postFrequency: 1,
          bestTimes: [],
          contentTypes: []
        },
        {
          name: "YouTube",
          enabled: false,
          handle: "",
          followers: 0,
          engagement: 6.1,
          postFrequency: 1,
          bestTimes: [],
          contentTypes: []
        }
      ],
      contentPillars: [""],
      contentMix: {
        educational: 40,
        entertaining: 30,
        promotional: 20,
        inspirational: 5,
        userGenerated: 5
      },
      posts: [],
      hashtagSets: [],
      hashtagStrategy: "",
      goals: [],
      kpiMetrics: [],
      engagementTactics: [],
      communityGuidelines: "",
      responseTime: 2,
      reportingFrequency: 'weekly',
      trackingMetrics: [],
      competitorTracking: false
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
            <span className="hidden md:inline">Strategy</span>
          </TabsTrigger>
          <TabsTrigger value="step-2" className="flex items-center gap-1 text-xs">
            <Share2 className="w-3 h-3" />
            <span className="hidden md:inline">Platforms</span>
          </TabsTrigger>
          <TabsTrigger value="step-3" className="flex items-center gap-1 text-xs">
            <Calendar className="w-3 h-3" />
            <span className="hidden md:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="step-4" className="flex items-center gap-1 text-xs">
            <Hash className="w-3 h-3" />
            <span className="hidden md:inline">Hashtags</span>
          </TabsTrigger>
          <TabsTrigger value="step-5" className="flex items-center gap-1 text-xs">
            <BarChart3 className="w-3 h-3" />
            <span className="hidden md:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Strategy Setup */}
        <TabsContent value="step-1" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Social Media Strategy Foundation
              </CardTitle>
              <CardDescription>
                Define your brand's social media strategy and objectives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand-name">Brand Name *</Label>
                  <Input
                    id="brand-name"
                    placeholder="Your brand or company name"
                    value={data.brandName}
                    onChange={(e) => setData(prev => ({ ...prev, brandName: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Select onValueChange={(value) => setData(prev => ({ ...prev, industry: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="food">Food & Beverage</SelectItem>
                      <SelectItem value="fashion">Fashion</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="target-audience">Target Audience</Label>
                <Textarea
                  id="target-audience"
                  placeholder="Describe your ideal followers/customers (demographics, interests, behaviors)..."
                  value={data.targetAudience}
                  onChange={(e) => setData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="brand-voice">Brand Voice & Personality</Label>
                <Textarea
                  id="brand-voice"
                  placeholder="Describe how your brand communicates (tone, style, personality traits)..."
                  value={data.brandVoice}
                  onChange={(e) => setData(prev => ({ ...prev, brandVoice: e.target.value }))}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label>Primary Objectives</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {[
                    'Brand Awareness', 'Lead Generation', 'Sales & Conversions',
                    'Community Building', 'Customer Support', 'Thought Leadership',
                    'User-Generated Content', 'Website Traffic', 'App Downloads'
                  ].map((objective) => (
                    <label key={objective} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={data.objectives.includes(objective)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setData(prev => ({ ...prev, objectives: [...prev.objectives, objective] }))
                          } else {
                            setData(prev => ({ ...prev, objectives: prev.objectives.filter(o => o !== objective) }))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{objective}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Content Pillars</Label>
                  <Button variant="ghost" size="sm" onClick={addContentPillar}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {data.contentPillars.map((pillar, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={pillar}
                        onChange={(e) => updateContentPillar(index, e.target.value)}
                        placeholder={`Content pillar ${index + 1} (e.g., Tips & Education)`}
                      />
                      {data.contentPillars.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContentPillar(index)}
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
              disabled={!data.brandName || !data.targetAudience}
              crown
            >
              Next: Platform Setup
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 2: Platform Configuration */}
        <TabsContent value="step-2" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-600" />
                Platform Configuration
              </CardTitle>
              <CardDescription>
                Set up your social media platforms and posting strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {data.platforms.map((platform) => (
                  <motion.div
                    key={platform.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg ${platform.enabled ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={platform.enabled}
                            onChange={(e) => updatePlatform(platform.name, { enabled: e.target.checked })}
                            className="rounded"
                          />
                          <span className="font-semibold text-lg">{platform.name}</span>
                        </label>
                        <Badge className={`${
                          platform.engagement > 6 ? 'bg-green-100 text-green-700' :
                          platform.engagement > 3 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {platform.engagement}% avg engagement
                        </Badge>
                      </div>
                    </div>

                    {platform.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <Label className="text-sm">Handle/Username</Label>
                          <Input
                            placeholder={`@your${platform.name.toLowerCase()}handle`}
                            value={platform.handle}
                            onChange={(e) => updatePlatform(platform.name, { handle: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Current Followers</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={platform.followers}
                            onChange={(e) => updatePlatform(platform.name, { followers: parseInt(e.target.value) || 0 })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Posts per Day: {platform.postFrequency}</Label>
                          <Slider
                            value={[platform.postFrequency]}
                            onValueChange={([value]) => updatePlatform(platform.name, { postFrequency: value })}
                            max={platform.name === 'Twitter' ? 10 : 3}
                            min={1}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}

                    {platform.enabled && (
                      <div className="mt-4">
                        <Label className="text-sm mb-2 block">Content Types for {platform.name}</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {(platform.name === 'Instagram' ? ['Photos', 'Stories', 'Reels', 'IGTV', 'Carousel'] :
                            platform.name === 'TikTok' ? ['Short Videos', 'Challenges', 'Trends', 'Duets'] :
                            platform.name === 'YouTube' ? ['Long Videos', 'Shorts', 'Live Streams', 'Premieres'] :
                            platform.name === 'LinkedIn' ? ['Articles', 'Updates', 'Documents', 'Events'] :
                            ['Posts', 'Images', 'Videos', 'Links']
                          ).map((type) => (
                            <label key={type} className="flex items-center space-x-2 text-xs p-2 border rounded cursor-pointer hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={platform.contentTypes.includes(type)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    updatePlatform(platform.name, { 
                                      contentTypes: [...platform.contentTypes, type] 
                                    })
                                  } else {
                                    updatePlatform(platform.name, { 
                                      contentTypes: platform.contentTypes.filter(t => t !== type) 
                                    })
                                  }
                                }}
                                className="rounded"
                              />
                              <span>{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Platform Stats Summary */}
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                <h4 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Platform Overview
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{getTotalReach().toLocaleString()}</div>
                    <div className="text-sm text-purple-700">Total Reach</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{getAverageEngagement()}%</div>
                    <div className="text-sm text-purple-700">Avg Engagement</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-900">{getPostsPerWeek()}</div>
                    <div className="text-sm text-purple-700">Posts/Week</div>
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
              disabled={!data.platforms.some(p => p.enabled)}
              crown
            >
              Next: Content Planning
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 3: Content Strategy */}
        <TabsContent value="step-3" className="space-y-6">
          <div className="grid gap-6">
            <BossCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-600" />
                  Content Mix Strategy
                </CardTitle>
                <CardDescription>
                  Define your content distribution strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label className="text-sm">Educational: {data.contentMix.educational}%</Label>
                    <Slider
                      value={[data.contentMix.educational]}
                      onValueChange={([value]) => setData(prev => ({ 
                        ...prev, 
                        contentMix: { ...prev.contentMix, educational: value }
                      }))}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tips, tutorials, how-tos</p>
                  </div>
                  <div>
                    <Label className="text-sm">Entertaining: {data.contentMix.entertaining}%</Label>
                    <Slider
                      value={[data.contentMix.entertaining]}
                      onValueChange={([value]) => setData(prev => ({ 
                        ...prev, 
                        contentMix: { ...prev.contentMix, entertaining: value }
                      }))}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Memes, fun content</p>
                  </div>
                  <div>
                    <Label className="text-sm">Promotional: {data.contentMix.promotional}%</Label>
                    <Slider
                      value={[data.contentMix.promotional]}
                      onValueChange={([value]) => setData(prev => ({ 
                        ...prev, 
                        contentMix: { ...prev.contentMix, promotional: value }
                      }))}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Product/service promotion</p>
                  </div>
                  <div>
                    <Label className="text-sm">Inspirational: {data.contentMix.inspirational}%</Label>
                    <Slider
                      value={[data.contentMix.inspirational]}
                      onValueChange={([value]) => setData(prev => ({ 
                        ...prev, 
                        contentMix: { ...prev.contentMix, inspirational: value }
                      }))}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Motivational quotes</p>
                  </div>
                  <div>
                    <Label className="text-sm">User Generated: {data.contentMix.userGenerated}%</Label>
                    <Slider
                      value={[data.contentMix.userGenerated]}
                      onValueChange={([value]) => setData(prev => ({ 
                        ...prev, 
                        contentMix: { ...prev.contentMix, userGenerated: value }
                      }))}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Customer content</p>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Total: {Object.values(data.contentMix).reduce((sum, val) => sum + val, 0)}%
                    {Object.values(data.contentMix).reduce((sum, val) => sum + val, 0) !== 100 && 
                      " (Should total 100%)"
                    }
                  </AlertDescription>
                </Alert>
              </CardContent>
            </BossCard>

            <BossCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Content Calendar
                </CardTitle>
                <CardDescription>
                  Plan and schedule your social media posts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Scheduled Posts</h4>
                    <p className="text-sm text-gray-600">Create and organize your content pipeline</p>
                  </div>
                  <BossButton onClick={addContentPost} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Post
                  </BossButton>
                </div>

                <div className="space-y-4">
                  {data.posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <Input
                          placeholder="Post title"
                          value={post.title}
                          onChange={(e) => updateContentPost(post.id, { title: e.target.value })}
                          className="font-medium flex-1 mr-4"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContentPost(post.id)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Textarea
                        placeholder="Post content/caption..."
                        value={post.content}
                        onChange={(e) => updateContentPost(post.id, { content: e.target.value })}
                        className="mb-3"
                        rows={3}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-sm">Content Type</Label>
                          <Select onValueChange={(value: any) => updateContentPost(post.id, { contentType: value })}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={post.contentType} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="carousel">Carousel</SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="story">Story</SelectItem>
                              <SelectItem value="reel">Reel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Category</Label>
                          <Input
                            placeholder="e.g., Educational"
                            value={post.category}
                            onChange={(e) => updateContentPost(post.id, { category: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Scheduled Date</Label>
                          <Input
                            type="datetime-local"
                            value={post.scheduledDate}
                            onChange={(e) => updateContentPost(post.id, { scheduledDate: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Status</Label>
                          <Select onValueChange={(value: any) => updateContentPost(post.id, { status: value })}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={post.status} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Label className="text-sm mb-2 block">Platforms</Label>
                        <div className="flex flex-wrap gap-2">
                          {data.platforms.filter(p => p.enabled).map((platform) => (
                            <label key={platform.name} className="flex items-center space-x-2 text-sm p-2 border rounded cursor-pointer hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={post.platforms.includes(platform.name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    updateContentPost(post.id, { 
                                      platforms: [...post.platforms, platform.name] 
                                    })
                                  } else {
                                    updateContentPost(post.id, { 
                                      platforms: post.platforms.filter(p => p !== platform.name) 
                                    })
                                  }
                                }}
                                className="rounded"
                              />
                              <span>{platform.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <Badge className={
                          post.status === 'published' ? 'bg-green-100 text-green-700' :
                          post.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {post.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Platforms: {post.platforms.length}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {data.posts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No posts scheduled yet</p>
                    <p className="text-sm">Start building your content calendar</p>
                  </div>
                )}
              </CardContent>
            </BossCard>
          </div>

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
              Next: Hashtag Strategy
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 4: Hashtag Strategy */}
        <TabsContent value="step-4" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-600" />
                Hashtag Strategy
              </CardTitle>
              <CardDescription>
                Create targeted hashtag sets for better discoverability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="hashtag-strategy">Overall Hashtag Strategy</Label>
                <Textarea
                  id="hashtag-strategy"
                  placeholder="Describe your hashtag approach, research methods, and mixing strategy..."
                  value={data.hashtagStrategy}
                  onChange={(e) => setData(prev => ({ ...prev, hashtagStrategy: e.target.value }))}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">Hashtag Sets</h4>
                    <p className="text-sm text-gray-600">Create themed hashtag collections</p>
                  </div>
                  <BossButton onClick={addHashtagSet} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Set
                  </BossButton>
                </div>

                <div className="space-y-4">
                  {data.hashtagSets.map((set) => (
                    <motion.div
                      key={set.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 mr-4">
                          <Input
                            placeholder="Set name (e.g., Fitness Tips)"
                            value={set.name}
                            onChange={(e) => updateHashtagSet(set.id, { name: e.target.value })}
                          />
                          <Input
                            placeholder="Category"
                            value={set.category}
                            onChange={(e) => updateHashtagSet(set.id, { category: e.target.value })}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHashtagSet(set.id)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-sm">Popularity</Label>
                          <Select onValueChange={(value: any) => updateHashtagSet(set.id, { popularity: value })}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder={set.popularity} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="trending">Trending</SelectItem>
                              <SelectItem value="popular">Popular</SelectItem>
                              <SelectItem value="niche">Niche</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">Competition Level: {set.difficulty}/100</Label>
                          <Slider
                            value={[set.difficulty]}
                            onValueChange={([value]) => updateHashtagSet(set.id, { difficulty: value })}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm">Hashtags</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addHashtagToSet(set.id)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {set.tags.map((tag, tagIndex) => (
                            <div key={tagIndex} className="flex gap-1">
                              <Input
                                placeholder="#hashtag"
                                value={tag}
                                onChange={(e) => updateHashtagInSet(set.id, tagIndex, e.target.value)}
                                className="text-sm"
                              />
                              {set.tags.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeHashtagFromSet(set.id, tagIndex)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                          <Badge className={
                            set.popularity === 'trending' ? 'bg-red-100 text-red-700' :
                            set.popularity === 'popular' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {set.popularity}
                          </Badge>
                          <Badge variant="outline">
                            {set.tags.filter(Boolean).length} tags
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          Competition: {set.difficulty}/100
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {data.hashtagSets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hashtag sets created yet</p>
                    <p className="text-sm">Build hashtag collections for different content types</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Hashtag Best Practices
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Mix hashtag types:</strong> Combine trending, popular, and niche hashtags
                  </div>
                  <div>
                    <strong>Research competitors:</strong> See what hashtags your competitors use
                  </div>
                  <div>
                    <strong>Platform limits:</strong> Instagram (30), Twitter (2-3), LinkedIn (3-5)
                  </div>
                  <div>
                    <strong>Create branded tags:</strong> Use your brand name and campaign-specific tags
                  </div>
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
            <BossButton 
              onClick={() => setCurrentStep(5)}
              crown
            >
              Next: Analytics & Goals
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 5: Analytics & Goals */}
        <TabsContent value="step-5" className="space-y-6">
          <div className="grid gap-6">
            <BossCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Goals & KPIs
                </CardTitle>
                <CardDescription>
                  Set measurable goals for your social media strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">Social Media Goals</h4>
                      <p className="text-sm text-gray-600">Define specific, measurable objectives</p>
                    </div>
                    <BossButton onClick={addSocialGoal} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goal
                    </BossButton>
                  </div>

                  <div className="space-y-4">
                    {data.goals.map((goal) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <Input
                            placeholder="Goal title (e.g., Increase Instagram followers)"
                            value={goal.title}
                            onChange={(e) => updateSocialGoal(goal.id, { title: e.target.value })}
                            className="font-medium flex-1 mr-4"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSocialGoal(goal.id)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>

                        <Textarea
                          placeholder="Goal description..."
                          value={goal.description}
                          onChange={(e) => updateSocialGoal(goal.id, { description: e.target.value })}
                          className="mb-3"
                          rows={2}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <div>
                            <Label className="text-sm">Metric</Label>
                            <Input
                              placeholder="e.g., Followers"
                              value={goal.metric}
                              onChange={(e) => updateSocialGoal(goal.id, { metric: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Target Value</Label>
                            <Input
                              type="number"
                              value={goal.targetValue}
                              onChange={(e) => updateSocialGoal(goal.id, { targetValue: parseInt(e.target.value) || 0 })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Current Value</Label>
                            <Input
                              type="number"
                              value={goal.currentValue}
                              onChange={(e) => updateSocialGoal(goal.id, { currentValue: parseInt(e.target.value) || 0 })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Deadline</Label>
                            <Input
                              type="date"
                              value={goal.deadline}
                              onChange={(e) => updateSocialGoal(goal.id, { deadline: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Priority</Label>
                            <Select onValueChange={(value: any) => updateSocialGoal(goal.id, { priority: value })}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder={goal.priority} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="flex items-center gap-4">
                            <Badge className={
                              goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                              goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }>
                              {goal.priority} priority
                            </Badge>
                            {goal.targetValue > 0 && (
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={(goal.currentValue / goal.targetValue) * 100} 
                                  className="w-20 h-2" 
                                />
                                <span className="text-sm text-gray-600">
                                  {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {data.goals.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No goals set yet</p>
                      <p className="text-sm">Add measurable goals to track success</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </BossCard>

            <BossCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Analytics & Engagement
                </CardTitle>
                <CardDescription>
                  Configure tracking and engagement strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Key Metrics to Track</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {[
                      'Followers', 'Engagement Rate', 'Reach', 'Impressions',
                      'Likes', 'Comments', 'Shares', 'Saves', 'Click-through Rate',
                      'Website Traffic', 'Lead Generation', 'Conversions'
                    ].map((metric) => (
                      <label key={metric} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={data.trackingMetrics.includes(metric)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setData(prev => ({ ...prev, trackingMetrics: [...prev.trackingMetrics, metric] }))
                            } else {
                              setData(prev => ({ ...prev, trackingMetrics: prev.trackingMetrics.filter(m => m !== metric) }))
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
                    <Label>Reporting Frequency</Label>
                    <Select onValueChange={(value: any) => setData(prev => ({ ...prev, reportingFrequency: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Response Time Goal (hours): {data.responseTime}</Label>
                    <Slider
                      value={[data.responseTime]}
                      onValueChange={([value]) => setData(prev => ({ ...prev, responseTime: value }))}
                      max={48}
                      min={1}
                      step={1}
                      className="mt-4"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="community-guidelines">Community Guidelines</Label>
                  <Textarea
                    id="community-guidelines"
                    placeholder="Define your community guidelines and moderation policies..."
                    value={data.communityGuidelines}
                    onChange={(e) => setData(prev => ({ ...prev, communityGuidelines: e.target.value }))}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Engagement Tactics</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {[
                      'Ask Questions', 'User-Generated Content', 'Contests & Giveaways',
                      'Behind-the-Scenes', 'Live Videos', 'Stories/Polls',
                      'Respond to Comments', 'Collaborate with Influencers', 'Trending Topics'
                    ].map((tactic) => (
                      <label key={tactic} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={data.engagementTactics.includes(tactic)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setData(prev => ({ ...prev, engagementTactics: [...prev.engagementTactics, tactic] }))
                            } else {
                              setData(prev => ({ ...prev, engagementTactics: prev.engagementTactics.filter(t => t !== tactic) }))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{tactic}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.competitorTracking}
                      onChange={(e) => setData(prev => ({ ...prev, competitorTracking: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Track Competitor Performance</span>
                  </label>
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
                Save Strategy
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
