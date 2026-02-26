"use client"


export const dynamic = 'force-dynamic'
import { logError, logInfo } from '@/lib/logger'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HudBorder } from '@/components/cyber/HudBorder'
import { CyberButton } from '@/components/cyber/CyberButton'
import { toast } from 'sonner'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

import { Progress } from "@/components/ui/progress"
import {
  Palette, 
  Type, 
  ImageIcon, 
  Download, 
  Save, 
  Sparkles, 
  Crown, 
  Lightbulb,
  Loader2,
  CheckCircle,
  AlertCircle,
  Wand2,
  Brain,
  Target,
  TrendingUp,
  FileText
} from 'lucide-react'

interface BrandSettings {
  id?: string
  companyName: string
  tagline: string
  description: string
  industry: string
  targetAudience: string
  brandPersonality: string[]
  colorPalette: {
    name?: string
    primary: string
    secondary: string
    accent: string
    neutral: string
    success: string
    warning: string
    error: string
  }
  typography: {
    primary: string
    secondary: string
  }
  logoUrl?: string
  logoPrompt?: string
  moodboard: string[]
  brandGuidelines?: {
    logoUsage: string[]
    colorUsage: string[]
    typographyRules: string[]
    spacingRules: string[]
  }
  marketingAssets?: {
    businessCards: string[]
    letterheads: string[]
    socialMedia: string[]
    presentations: string[]
  }
  createdAt?: string
  updatedAt?: string
}

interface LogoVariant {
  id: string
  url: string
  style: string
  description: string
  generated: boolean
  rating?: number
  isSelected?: boolean
}

interface BrandAnalysis {
  completeness: number
  strengths: string[]
  improvements: string[]
  recommendations: string[]
  competitiveAnalysis?: {
    similarBrands: string[]
    differentiation: string[]
    marketPosition: string
  }
}

const INDUSTRY_OPTIONS = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
  'Consulting', 'Marketing', 'Real Estate', 'Food & Beverage', 'Fashion',
  'Entertainment', 'Travel', 'Non-profit', 'Other'
]

const PERSONALITY_TRAITS = [
  'Professional', 'Creative', 'Innovative', 'Trustworthy', 'Friendly', 'Luxury',
  'Modern', 'Traditional', 'Bold', 'Minimalist', 'Playful', 'Serious',
  'Approachable', 'Authoritative', 'Energetic', 'Calm'
]

const COLOR_PALETTES = [
  {
    name: "Founder Purple",
    primary: "#8E24AA",
    secondary: "#E1BEE7",
    accent: "#FF4081",
    neutral: "#F5F5F5",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336"
  },
  {
    name: "Empire Gold",
    primary: "#FFD700",
    secondary: "#FFF8DC",
    accent: "#FF6B35",
    neutral: "#F8F8F8",
    success: "#2E7D32",
    warning: "#F57C00",
    error: "#D32F2F"
  },
  {
    name: "Success Blue",
    primary: "#1976D2",
    secondary: "#BBDEFB",
    accent: "#00BCD4",
    neutral: "#FAFAFA",
    success: "#388E3C",
    warning: "#F9A825",
    error: "#E53935"
  },
  {
    name: "Power Green",
    primary: "#4CAF50",
    secondary: "#C8E6C9",
    accent: "#FFC107",
    neutral: "#F1F8E9",
    success: "#2E7D32",
    warning: "#FF9800",
    error: "#D32F2F"
  }
]

export default function BrandStudioPage() {
  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    companyName: '',
    tagline: '',
    description: '',
    industry: '',
    targetAudience: '',
    brandPersonality: [],
    colorPalette: COLOR_PALETTES[0],
    typography: {
      primary: 'Inter',
      secondary: 'Roboto'
    },
    moodboard: [],
    brandGuidelines: {
      logoUsage: [],
      colorUsage: [],
      typographyRules: [],
      spacingRules: []
    },
    marketingAssets: {
      businessCards: [],
      letterheads: [],
      socialMedia: [],
      presentations: []
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generatingLogo, setGeneratingLogo] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [logoVariants, setLogoVariants] = useState<LogoVariant[]>([])
  const [selectedLogoVariant, setSelectedLogoVariant] = useState<string | null>(null)
  const [brandAnalysis, setBrandAnalysis] = useState<BrandAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    loadBrandSettings()
  }, [])

  const loadBrandSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/brand/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.brand) {
          setBrandSettings(data.brand)
        }
      }
    } catch (error) {
      logError('Error loading brand settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveBrandSettings = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/brand/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(brandSettings)
      })

      if (response.ok) {
        // Show success message
        logInfo('Brand settings saved successfully')
      }
    } catch (error) {
      logError('Error saving brand settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const generateLogo = async () => {
    if (!brandSettings.companyName || !brandSettings.industry) {
      toast.error('Please fill in company name and industry before generating a logo', { icon: '⚠️' })
      return
    }

    try {
      setGeneratingLogo(true)
      const token = localStorage.getItem('auth_token')

      const response = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          brandName: brandSettings.companyName,
          style: 'modern'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setLogoVariants(data.logos || [])
        toast.success('Logo variants generated successfully!', { icon: '✨' })
      }
    } catch (error) {
      logError('Error generating logo:', error)
      toast.error('Failed to generate logo variants', { icon: '❌' })
    } finally {
      setGeneratingLogo(false)
    }
  }

  const analyzeBrand = async () => {
    if (!brandSettings.companyName) {
      toast.error('Please fill in your company name first', { icon: '⚠️' })
      return
    }

    try {
      setAnalyzing(true)
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('/api/brand/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(brandSettings)
      })

      if (response.ok) {
        const data = await response.json()
        setBrandAnalysis(data.analysis)
        toast.success('Brand analysis completed!', { icon: '📊' })
      }
    } catch (error) {
      logError('Error analyzing brand:', error)
      toast.error('Failed to analyze brand', { icon: '❌' })
    } finally {
      setAnalyzing(false)
    }
  }

  const generateBrandGuidelines = async () => {
    if (!brandSettings.companyName) {
      toast.error('Please fill in your company name first', { icon: '⚠️' })
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch('/api/brand/guidelines', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(brandSettings)
      })

      if (response.ok) {
        const data = await response.json()
        setBrandSettings(prev => ({
          ...prev,
          brandGuidelines: data.guidelines
        }))
        toast.success('Brand guidelines generated!', { icon: '📋' })
      }
    } catch (error) {
      logError('Error generating brand guidelines:', error)
      toast.error('Failed to generate brand guidelines', { icon: '❌' })
    }
  }

  const selectLogoVariant = (variantId: string) => {
    setSelectedLogoVariant(variantId)
    const variant = logoVariants.find(v => v.id === variantId)
    if (variant) {
      setBrandSettings(prev => ({
        ...prev,
        logoUrl: variant.url
      }))
      toast.success('Logo variant selected!', { icon: '✅' })
    }
  }

  const updateBrandSettings = (updates: Partial<BrandSettings>) => {
    setBrandSettings(prev => ({ ...prev, ...updates }))
  }

  const togglePersonalityTrait = (trait: string) => {
    setBrandSettings(prev => ({
      ...prev,
      brandPersonality: prev.brandPersonality.includes(trait)
        ? prev.brandPersonality.filter(t => t !== trait)
        : [...prev.brandPersonality, trait]
    }))
  }

  const selectColorPalette = (palette: typeof COLOR_PALETTES[0]) => {
    setBrandSettings(prev => ({
      ...prev,
      colorPalette: palette
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 to-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6 space-y-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center shadow-md"
              >
                <Wand2 className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold font-orbitron text-white">Brand Studio</h1>
                <p className="text-lg text-gray-400 font-mono">
                  AI-powered brand identity creation and management
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CyberButton
              variant="outline"
              size="sm"
              onClick={analyzeBrand}
              disabled={analyzing}
              className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
            >
              {analyzing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              Analyze Brand
            </CyberButton>
            <CyberButton onClick={saveBrandSettings} disabled={saving} variant="purple">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Brand
                </>
              )}
            </CyberButton>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-dark-card border border-neon-purple/30 rounded-none">
            <TabsTrigger value="overview" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono rounded-none">
              <Crown className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="identity" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono rounded-none">
              <Target className="w-4 h-4 mr-2" />
              Identity
            </TabsTrigger>
            <TabsTrigger value="visuals" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono rounded-none">
              <Palette className="w-4 h-4 mr-2" />
              Visuals
            </TabsTrigger>
            <TabsTrigger value="logo" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono rounded-none">
              <ImageIcon className="w-4 h-4 mr-2" />
              Logo
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono rounded-none">
              <FileText className="w-4 h-4 mr-2" />
              Guidelines
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono rounded-none">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HudBorder className="bg-dark-card border-neon-purple/30">
                <div className="p-6 pb-2">
                  <h3 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-neon-purple" />
                    Brand Overview
                  </h3>
                  <p className="text-gray-400 font-mono text-sm mt-1">
                    Define your brand&apos;s core identity and values
                  </p>
                </div>
                <div className="p-6 pt-2 space-y-4">
                  <div>
                    <Label htmlFor="companyName" className="text-neon-cyan font-mono">Company Name</Label>
                    <Input
                      id="companyName"
                      value={brandSettings.companyName}
                      onChange={(e) => updateBrandSettings({ companyName: e.target.value })}
                      className="bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline" className="text-neon-cyan font-mono">Tagline</Label>
                    <Input
                      id="tagline"
                      value={brandSettings.tagline}
                      onChange={(e) => updateBrandSettings({ tagline: e.target.value })}
                      className="bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-neon-cyan font-mono">Brand Description</Label>
                    <Textarea
                      id="description"
                      value={brandSettings.description}
                      onChange={(e) => updateBrandSettings({ description: e.target.value })}
                      rows={4}
                      className="bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry" className="text-neon-cyan font-mono">Industry</Label>
                    <Select
                      value={brandSettings.industry}
                      onValueChange={(value) => updateBrandSettings({ industry: value })}
                    >
                      <SelectTrigger
                        className="bg-dark-bg border-neon-purple/30 text-white font-mono rounded-none"
                        aria-label="Select industry"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-neon-purple/30 text-white font-mono rounded-none">
                        {INDUSTRY_OPTIONS.map(industry => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetAudience" className="text-neon-cyan font-mono">Target Audience</Label>
                    <Textarea
                      id="targetAudience"
                      value={brandSettings.targetAudience}
                      onChange={(e) => updateBrandSettings({ targetAudience: e.target.value })}
                      rows={3}
                      className="bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
                    />
                  </div>
                </div>
              </HudBorder>

              <HudBorder className="bg-dark-card border-neon-purple/30">
                <div className="p-6 pb-2">
                  <h3 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-neon-purple" />
                    Brand Personality
                  </h3>
                  <p className="text-gray-400 font-mono text-sm mt-1">
                    Select traits that describe your brand&apos;s personality
                  </p>
                </div>
                <div className="p-6 pt-2">
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITY_TRAITS.map(trait => (
                      <CyberButton
                        key={trait}
                        size="sm"
                        variant={brandSettings.brandPersonality.includes(trait) ? "cyan" : "outline"}
                        className={`transition-all ${
                          brandSettings.brandPersonality.includes(trait)
                            ? ''
                            : 'text-gray-400 border-white/10 hover:border-neon-cyan/50 hover:text-white'
                        }`}
                        onClick={() => togglePersonalityTrait(trait)}
                      >
                        {trait}
                      </CyberButton>
                    ))}
                  </div>
                </div>
              </HudBorder>
            </div>
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-6">
            <HudBorder className="bg-dark-card border-neon-purple/30">
              <div className="p-6 pb-2">
                <h3 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-neon-cyan" />
                  Brand Guidelines
                </h3>
                <p className="text-gray-400 font-mono text-sm mt-1">
                  AI-generated brand guidelines and usage rules
                </p>
              </div>
              <div className="p-6 pt-2 space-y-6">
                {brandSettings.brandGuidelines && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 font-orbitron">Logo Usage Rules</h3>
                      <div className="bg-dark-bg/50 border border-white/10 rounded-none p-4 space-y-2">
                        {brandSettings.brandGuidelines.logoUsage.map((rule, index) => (
                          <p key={index} className="text-gray-300 text-sm font-mono">• {rule}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2 font-orbitron">Color Usage Rules</h3>
                      <div className="bg-dark-bg/50 border border-white/10 rounded-none p-4 space-y-2">
                        {brandSettings.brandGuidelines.colorUsage.map((rule, index) => (
                          <p key={index} className="text-gray-300 text-sm font-mono">• {rule}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <CyberButton onClick={generateBrandGuidelines} variant="purple">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Brand Guidelines
                </CyberButton>
              </div>
            </HudBorder>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <HudBorder className="bg-dark-card border-neon-purple/30">
              <div className="p-6 pb-2">
                <h3 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-lime" />
                  Brand Analytics
                </h3>
                <p className="text-gray-400 font-mono text-sm mt-1">
                  AI-powered brand analysis and insights
                </p>
              </div>
              <div className="p-6 pt-2 space-y-6">
                {brandAnalysis && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-mono">Brand Completeness</span>
                      <span className="text-white font-medium font-mono">{brandAnalysis.completeness}%</span>
                    </div>
                    <Progress value={brandAnalysis.completeness} className="h-3" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2 font-orbitron">Strengths</h3>
                        <div className="bg-dark-bg/50 border border-white/10 rounded-none p-4 space-y-2">
                          {brandAnalysis.strengths.map((strength, index) => (
                            <p key={index} className="text-neon-lime text-sm flex items-center gap-2 font-mono">
                              <CheckCircle className="w-4 h-4" /> {strength}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2 font-orbitron">Improvements</h3>
                        <div className="bg-dark-bg/50 border border-white/10 rounded-none p-4 space-y-2">
                          {brandAnalysis.improvements.map((improvement, index) => (
                            <p key={index} className="text-neon-magenta text-sm flex items-center gap-2 font-mono">
                              <AlertCircle className="w-4 h-4" /> {improvement}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <CyberButton onClick={analyzeBrand} disabled={analyzing} variant="outline" className="text-neon-cyan border-neon-cyan/30 hover:bg-neon-cyan/10">
                  {analyzing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  Analyze Brand
                </CyberButton>
              </div>
            </HudBorder>
          </TabsContent>

        <TabsContent value="identity" className="space-y-6">
          <HudBorder className="bg-dark-card border-neon-purple/30">
            <div className="p-6 pb-2">
              <h3 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                <Type className="w-5 h-5 text-neon-purple" />
                Typography
              </h3>
              <p className="text-gray-400 font-mono text-sm mt-1">
                Choose fonts that represent your brand
              </p>
            </div>
            <div className="p-6 pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryFont" className="text-neon-cyan font-mono">Primary Font</Label>
                  <select
                    id="primaryFont"
                    value={brandSettings.typography.primary}
                    onChange={(e) => updateBrandSettings({ 
                      typography: { ...brandSettings.typography, primary: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-dark-bg border border-neon-purple/30 rounded-none text-white focus:outline-none focus:border-neon-purple font-mono"
                    aria-label="Select primary font"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="secondaryFont" className="text-neon-cyan font-mono">Secondary Font</Label>
                  <select
                    id="secondaryFont"
                    value={brandSettings.typography.secondary}
                    onChange={(e) => updateBrandSettings({ 
                      typography: { ...brandSettings.typography, secondary: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-dark-bg border border-neon-purple/30 rounded-none text-white focus:outline-none focus:border-neon-purple font-mono"
                    aria-label="Select secondary font"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>
              </div>
            </div>
          </HudBorder>
        </TabsContent>

        <TabsContent value="visuals" className="space-y-6">
          <HudBorder className="bg-dark-card border-neon-purple/30">
            <div className="p-6 pb-2">
              <h3 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-neon-magenta" />
                Color Palette
              </h3>
              <p className="text-gray-400 font-mono text-sm mt-1">
                Choose a color scheme that reflects your brand
              </p>
            </div>
            <div className="p-6 pt-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COLOR_PALETTES.map((palette, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-none p-4 cursor-pointer transition-all ${
                      brandSettings.colorPalette.name === palette.name || 
                      (brandSettings.colorPalette.primary === palette.primary && 
                       brandSettings.colorPalette.secondary === palette.secondary)
                        ? 'border-neon-cyan bg-neon-cyan/10' 
                        : 'border-white/10 hover:border-neon-purple/50 bg-dark-bg/50'
                    }`}
                    onClick={() => selectColorPalette(palette)}
                  >
                    <h3 className="font-medium mb-3 font-orbitron text-white">{palette.name}</h3>
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-none border border-white/20"
                        style={{ backgroundColor: palette.primary }}
                        title="Primary"
                      ></div>
                      <div 
                        className="w-8 h-8 rounded-none border border-white/20"
                        style={{ backgroundColor: palette.secondary }}
                        title="Secondary"
                      ></div>
                      <div 
                        className="w-8 h-8 rounded-none border border-white/20"
                        style={{ backgroundColor: palette.accent }}
                        title="Accent"
                      ></div>
                      <div 
                        className="w-8 h-8 rounded-none border border-white/20"
                        style={{ backgroundColor: palette.neutral }}
                        title="Neutral"
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-medium mb-3 font-orbitron text-white">Current Color Palette</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-neon-cyan font-mono">Primary</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded-none border border-white/20"
                        style={{ backgroundColor: brandSettings.colorPalette.primary }}
                      ></div>
                      <span className="text-sm font-mono text-gray-300">{brandSettings.colorPalette.primary}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-neon-cyan font-mono">Secondary</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded-none border border-white/20"
                        style={{ backgroundColor: brandSettings.colorPalette.secondary }}
                      ></div>
                      <span className="text-sm font-mono text-gray-300">{brandSettings.colorPalette.secondary}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-neon-cyan font-mono">Accent</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded-none border border-white/20"
                        style={{ backgroundColor: brandSettings.colorPalette.accent }}
                      ></div>
                      <span className="text-sm font-mono text-gray-300">{brandSettings.colorPalette.accent}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-neon-cyan font-mono">Neutral</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded-none border border-white/20"
                        style={{ backgroundColor: brandSettings.colorPalette.neutral }}
                      ></div>
                      <span className="text-sm font-mono text-gray-300">{brandSettings.colorPalette.neutral}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </HudBorder>
        </TabsContent>

          <TabsContent value="logo" className="space-y-6">
            <HudBorder className="bg-dark-card border-neon-purple/30">
              <div className="p-6 pb-2">
                <h3 className="text-xl font-orbitron font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-neon-pink" />
                  Logo Generation
                </h3>
                <p className="text-gray-400 font-mono text-sm mt-1">
                  Generate professional logo variants with AI
                </p>
              </div>
              <div className="p-6 pt-2 space-y-6">
                {logoVariants.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {logoVariants.map((variant) => (
                        <motion.div
                          key={variant.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`relative border-2 p-4 cursor-pointer transition-all rounded-none ${
                            selectedLogoVariant === variant.id
                              ? 'border-neon-cyan bg-neon-cyan/10'
                              : 'border-white/10 bg-dark-bg/50 hover:border-neon-purple/50'
                          }`}
                          onClick={() => selectLogoVariant(variant.id)}
                        >
                          <div className="flex items-center justify-center h-32 bg-dark-bg/50 rounded-none border border-white/5 mb-3">
                            <img 
                              src={variant.url} 
                              alt={`Logo variant ${variant.id}`}
                              className="max-h-24 max-w-full object-contain"
                            />
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium text-white font-orbitron">{variant.style}</h4>
                            <p className="text-sm text-gray-400 font-mono">{variant.description}</p>
                            {selectedLogoVariant === variant.id && (
                              <div className="flex items-center gap-2 text-neon-cyan">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-sm font-mono">Selected</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <CyberButton onClick={generateLogo} disabled={generatingLogo} variant="purple">
                        {generatingLogo ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate New Variants
                          </>
                        )}
                      </CyberButton>
                      <CyberButton variant="outline" className="text-neon-cyan border-neon-cyan/30 hover:bg-neon-cyan/10">
                        <Download className="w-4 h-4 mr-2" />
                        Download Selected
                      </CyberButton>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center w-32 h-32 mx-auto bg-dark-bg/50 rounded-none border border-neon-purple/30">
                      <ImageIcon className="w-16 h-16 text-neon-purple/50" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-white font-orbitron">No logo generated yet</h3>
                      <p className="text-gray-400 font-mono">
                        Generate professional logo variants based on your brand settings
                      </p>
                    </div>
                    <CyberButton 
                      onClick={generateLogo} 
                      disabled={generatingLogo || !brandSettings.companyName}
                      size="lg"
                      variant="purple"
                    >
                      {generatingLogo ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating Logo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Logo Variants
                        </>
                      )}
                    </CyberButton>
                    {!brandSettings.companyName && (
                      <div className="flex items-center justify-center gap-2 text-neon-yellow">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-mono">Please fill in your company name first</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </HudBorder>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
