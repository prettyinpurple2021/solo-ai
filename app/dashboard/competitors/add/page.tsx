"use client"


export const dynamic = 'force-dynamic'
import { logError,} from '@/lib/logger'
import { useState} from "react"
import { motion} from "framer-motion"
import { useRouter} from "next/navigation"
import { 
  ArrowLeft, Globe, Building, Users, DollarSign, Eye, CheckCircle, AlertTriangle} from "lucide-react"
import Link from "next/link"

import { HudBorder } from "@/components/cyber/HudBorder"
import { CyberButton } from "@/components/cyber/CyberButton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"


interface CompetitorFormData {
  name: string
  domain: string
  description: string
  industry: string
  headquarters: string
  foundedYear: number | null
  employeeCount: number | null
  fundingStage: string
  threatLevel: string
  monitoringStatus: string
  socialMediaHandles: {
    linkedin: string
    twitter: string
    facebook: string
    instagram: string
  }
  monitoringConfig: {
    websiteMonitoring: boolean
    socialMediaMonitoring: boolean
    newsMonitoring: boolean
    jobPostingMonitoring: boolean
    appStoreMonitoring: boolean
    monitoringFrequency: string
  }
}

export default function AddCompetitorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CompetitorFormData>({
    name: "",
    domain: "",
    description: "",
    industry: "",
    headquarters: "",
    foundedYear: null,
    employeeCount: null,
    fundingStage: "",
    threatLevel: "medium",
    monitoringStatus: "active",
    socialMediaHandles: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
    },
    monitoringConfig: {
      websiteMonitoring: true,
      socialMediaMonitoring: true,
      newsMonitoring: true,
      jobPostingMonitoring: true,
      appStoreMonitoring: false,
      monitoringFrequency: "daily",
    }
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMediaHandles: {
        ...prev.socialMediaHandles,
        [platform]: value
      }
    }))
  }

  const handleMonitoringConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      monitoringConfig: {
        ...prev.monitoringConfig,
        [field]: value
      }
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to create competitor')
      }
      
      router.push('/dashboard/competitors')
    } catch (error) {
      logError('Error creating competitor:', error)
    } finally {
      setLoading(false)
    }
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getThreatLevelBadge = (level: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.name.trim() !== ""
      case 2:
        return true // Optional fields
      case 3:
        return true // Optional fields
      case 4:
        return true // Configuration step
      default:
        return false
    }
  }

  const renderStep1 = () => (
    <HudBorder className="bg-dark-card border-neon-purple/30">
      <div className="p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-orbitron text-white mb-2">Basic Information</h2>
          <p className="text-gray-400 font-mono">
            Start by adding the essential details about your competitor
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-neon-cyan font-mono">Competitor Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1 bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
            />
          </div>

          <div>
            <Label htmlFor="domain" className="text-neon-cyan font-mono">Website Domain</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              className="mt-1 bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-neon-cyan font-mono">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="mt-1 bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="industry" className="text-neon-cyan font-mono">Industry</Label>
            <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
              <SelectTrigger className="mt-1 bg-dark-bg border-neon-purple/30 text-white font-mono rounded-none focus:border-neon-purple">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-neon-purple/30 text-white font-mono rounded-none">
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </HudBorder>
  )

  const renderStep2 = () => (
    <HudBorder className="bg-dark-card border-neon-purple/30">
      <div className="p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-orbitron text-white mb-2">Company Details</h2>
          <p className="text-gray-400 font-mono">
            Add more details to better understand your competitor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="headquarters" className="text-neon-cyan font-mono">Headquarters</Label>
            <Input
              id="headquarters"
              value={formData.headquarters}
              onChange={(e) => handleInputChange('headquarters', e.target.value)}
              className="mt-1 bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
            />
          </div>

          <div>
            <Label htmlFor="foundedYear" className="text-neon-cyan font-mono">Founded Year</Label>
            <Input
              id="foundedYear"
              type="number"
              value={formData.foundedYear || ""}
              onChange={(e) => handleInputChange('foundedYear', e.target.value ? parseInt(e.target.value) : null)}
              className="mt-1 bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
            />
          </div>

          <div>
            <Label htmlFor="employeeCount" className="text-neon-cyan font-mono">Employee Count</Label>
            <Input
              id="employeeCount"
              type="number"
              value={formData.employeeCount || ""}
              onChange={(e) => handleInputChange('employeeCount', e.target.value ? parseInt(e.target.value) : null)}
              className="mt-1 bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
            />
          </div>

          <div>
            <Label htmlFor="fundingStage" className="text-neon-cyan font-mono">Funding Stage</Label>
            <Select value={formData.fundingStage} onValueChange={(value) => handleInputChange('fundingStage', value)}>
              <SelectTrigger className="mt-1 bg-dark-bg border-neon-purple/30 text-white font-mono rounded-none focus:border-neon-purple">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-neon-purple/30 text-white font-mono rounded-none">
                <SelectItem value="seed">Seed</SelectItem>
                <SelectItem value="series-a">Series A</SelectItem>
                <SelectItem value="series-b">Series B</SelectItem>
                <SelectItem value="series-c">Series C</SelectItem>
                <SelectItem value="ipo">IPO</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="threatLevel" className="text-neon-cyan font-mono">Threat Level</Label>
          <div className="mt-2 space-y-2">
            <Select value={formData.threatLevel} onValueChange={(value) => handleInputChange('threatLevel', value)}>
              <SelectTrigger className="bg-dark-bg border-neon-purple/30 text-white font-mono rounded-none focus:border-neon-purple">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-neon-purple/30 text-white font-mono rounded-none">
                <SelectItem value="low">Low Threat</SelectItem>
                <SelectItem value="medium">Medium Threat</SelectItem>
                <SelectItem value="high">High Threat</SelectItem>
                <SelectItem value="critical">Critical Threat</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-none ${getThreatLevelColor(formData.threatLevel)}`} />
              <Badge 
                variant="orange" 
                className={`${getThreatLevelBadge(formData.threatLevel)} rounded-none font-mono`}
              >
                {formData.threatLevel.toUpperCase()} THREAT
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </HudBorder>
  )

  const renderStep3 = () => (
    <HudBorder className="bg-dark-card border-neon-purple/30">
      <div className="p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-orbitron text-white mb-2">Social Media Handles</h2>
          <p className="text-gray-400 font-mono">
            Add social media profiles to monitor their online presence
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="linkedin" className="text-neon-cyan font-mono">LinkedIn</Label>
            <Input
              id="linkedin"
              value={formData.socialMediaHandles.linkedin}
              onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
              className="mt-1 bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
            />
          </div>

          <div>
            <Label htmlFor="twitter" className="text-neon-cyan font-mono">Twitter/X</Label>
            <Input
              id="twitter"
              value={formData.socialMediaHandles.twitter}
              onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
              className="mt-1 bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
            />
          </div>

          <div>
            <Label htmlFor="facebook" className="text-neon-cyan font-mono">Facebook</Label>
            <Input
              id="facebook"
              value={formData.socialMediaHandles.facebook}
              onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              className="mt-1 bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
            />
          </div>

          <div>
            <Label htmlFor="instagram" className="text-neon-cyan font-mono">Instagram</Label>
            <Input
              id="instagram"
              value={formData.socialMediaHandles.instagram}
              onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              className="mt-1 bg-dark-bg border-neon-purple/30 text-white placeholder:text-gray-500 font-mono rounded-none focus:border-neon-purple"
            />
          </div>
        </div>
      </div>
    </HudBorder>
  )

  const renderStep4 = () => (
    <HudBorder className="bg-dark-card border-neon-purple/30">
      <div className="p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-orbitron text-white mb-2">Monitoring Configuration</h2>
          <p className="text-gray-400 font-mono">
            Configure what you want to monitor about this competitor
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold text-white font-orbitron">Monitoring Channels</Label>
            <div className="mt-3 space-y-4">
              <div className="flex items-center justify-between p-3 border border-neon-purple/10 bg-dark-bg/50">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-neon-cyan" />
                  <div>
                    <p className="font-medium text-white font-mono">Website Monitoring</p>
                    <p className="text-sm text-gray-500 font-mono">Track website changes, pricing, and content</p>
                  </div>
                </div>
                <Switch
                  checked={formData.monitoringConfig.websiteMonitoring}
                  onCheckedChange={(checked) => handleMonitoringConfigChange('websiteMonitoring', checked)}
                  className="data-[state=checked]:bg-neon-cyan"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-neon-purple/10 bg-dark-bg/50">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-neon-purple" />
                  <div>
                    <p className="font-medium text-white font-mono">Social Media Monitoring</p>
                    <p className="text-sm text-gray-500 font-mono">Monitor posts, engagement, and campaigns</p>
                  </div>
                </div>
                <Switch
                  checked={formData.monitoringConfig.socialMediaMonitoring}
                  onCheckedChange={(checked) => handleMonitoringConfigChange('socialMediaMonitoring', checked)}
                  className="data-[state=checked]:bg-neon-purple"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-neon-purple/10 bg-dark-bg/50">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-neon-green" />
                  <div>
                    <p className="font-medium text-white font-mono">News Monitoring</p>
                    <p className="text-sm text-gray-500 font-mono">Track news mentions and press releases</p>
                  </div>
                </div>
                <Switch
                  checked={formData.monitoringConfig.newsMonitoring}
                  onCheckedChange={(checked) => handleMonitoringConfigChange('newsMonitoring', checked)}
                  className="data-[state=checked]:bg-neon-green"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-neon-purple/10 bg-dark-bg/50">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-neon-yellow" />
                  <div>
                    <p className="font-medium text-white font-mono">Job Posting Monitoring</p>
                    <p className="text-sm text-gray-500 font-mono">Monitor hiring patterns and team growth</p>
                  </div>
                </div>
                <Switch
                  checked={formData.monitoringConfig.jobPostingMonitoring}
                  onCheckedChange={(checked) => handleMonitoringConfigChange('jobPostingMonitoring', checked)}
                  className="data-[state=checked]:bg-neon-yellow"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-neon-purple/10 bg-dark-bg/50">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-neon-pink" />
                  <div>
                    <p className="font-medium text-white font-mono">App Store Monitoring</p>
                    <p className="text-sm text-gray-500 font-mono">Track app updates, ratings, and reviews</p>
                  </div>
                </div>
                <Switch
                  checked={formData.monitoringConfig.appStoreMonitoring}
                  onCheckedChange={(checked) => handleMonitoringConfigChange('appStoreMonitoring', checked)}
                  className="data-[state=checked]:bg-neon-pink"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="monitoringFrequency" className="text-neon-cyan font-mono">Monitoring Frequency</Label>
            <Select 
              value={formData.monitoringConfig.monitoringFrequency} 
              onValueChange={(value) => handleMonitoringConfigChange('monitoringFrequency', value)}
            >
              <SelectTrigger className="mt-1 bg-dark-bg border-neon-purple/30 text-white font-mono rounded-none focus:border-neon-purple">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-neon-purple/30 text-white font-mono rounded-none">
                <SelectItem value="hourly">Hourly (Premium)</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </HudBorder>
  )

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/competitors">
              <CyberButton variant="outline" size="sm" className="border-neon-purple/30 text-gray-300 hover:text-white hover:bg-neon-purple/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </CyberButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-orbitron text-white">Add New Competitor</h1>
              <p className="text-gray-400 font-mono">
                Step {step} of 4: Set up competitive intelligence monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <HudBorder className="bg-dark-card border-neon-purple/30 p-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-none flex items-center justify-center font-bold font-mono transition-all duration-300 ${
                    stepNumber <= step 
                      ? 'bg-neon-purple text-white shadow-[0_0_10px_rgba(179,0,255,0.5)]' 
                      : 'bg-dark-bg border border-gray-700 text-gray-500'
                  }`}
                >
                  {stepNumber < step ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 4 && (
                  <div 
                    className={`w-16 h-1 mx-2 transition-all duration-300 ${
                      stepNumber < step ? 'bg-neon-purple shadow-[0_0_5px_rgba(179,0,255,0.5)]' : 'bg-gray-800'
                    }`} 
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-neon-cyan font-mono tracking-wider uppercase">
              {step === 1 && "Basic Information"}
              {step === 2 && "Company Details"}
              {step === 3 && "Social Media"}
              {step === 4 && "Monitoring Setup"}
            </p>
          </div>
        </HudBorder>

        {/* Form Steps */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {step > 1 && (
              <CyberButton
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="text-gray-400 hover:text-white"
              >
                Previous
              </CyberButton>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {step < 4 ? (
              <CyberButton
                variant="cyan"
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid(step)}
              >
                Next Step
              </CyberButton>
            ) : (
              <CyberButton
                variant="purple"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-neon-purple hover:bg-neon-purple/80 text-white shadow-[0_0_15px_rgba(179,0,255,0.4)]"
              >
                {loading ? 'Creating Competitor...' : 'Start Monitoring'}
              </CyberButton>
            )}
          </div>
        </div>

        {/* Help Text */}
        <HudBorder className="bg-dark-card border-neon-cyan/20 p-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 font-mono">
            <AlertTriangle className="w-4 h-4 text-neon-yellow" />
            <span>
              All monitoring is done ethically using publicly available information only
            </span>
          </div>
        </HudBorder>
      </motion.div>
    </div>
  )
}
