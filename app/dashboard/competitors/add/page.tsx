"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Globe, 
  Building, 
  Users, 
  DollarSign,
  Shield,
  Eye,
  Zap,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"

import { BossCard, EmpowermentCard } from "@/components/ui/boss-card"
import { BossButton, ZapButton } from "@/components/ui/boss-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
      
      // For now, just simulate success and redirect
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/competitors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      router.push('/dashboard/competitors')
    } catch (error) {
      console.error('Error creating competitor:', error)
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
    <EmpowermentCard>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gradient mb-2">Basic Information</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start by adding the essential details about your competitor
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Competitor Name *</Label>
            <Input
              id="name"
              placeholder="e.g., TechRival Corp"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="domain">Website Domain</Label>
            <Input
              id="domain"
              placeholder="e.g., techrival.com"
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of what this competitor does..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="industry">Industry</Label>
            <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
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
    </EmpowermentCard>
  )

  const renderStep2 = () => (
    <EmpowermentCard>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gradient mb-2">Company Details</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Add more details to better understand your competitor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="headquarters">Headquarters</Label>
            <Input
              id="headquarters"
              placeholder="e.g., San Francisco, CA"
              value={formData.headquarters}
              onChange={(e) => handleInputChange('headquarters', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="foundedYear">Founded Year</Label>
            <Input
              id="foundedYear"
              type="number"
              placeholder="e.g., 2020"
              value={formData.foundedYear || ""}
              onChange={(e) => handleInputChange('foundedYear', e.target.value ? parseInt(e.target.value) : null)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="employeeCount">Employee Count</Label>
            <Input
              id="employeeCount"
              type="number"
              placeholder="e.g., 150"
              value={formData.employeeCount || ""}
              onChange={(e) => handleInputChange('employeeCount', e.target.value ? parseInt(e.target.value) : null)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="fundingStage">Funding Stage</Label>
            <Select value={formData.fundingStage} onValueChange={(value) => handleInputChange('fundingStage', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select funding stage" />
              </SelectTrigger>
              <SelectContent>
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
          <Label htmlFor="threatLevel">Threat Level</Label>
          <div className="mt-2 space-y-2">
            <Select value={formData.threatLevel} onValueChange={(value) => handleInputChange('threatLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select threat level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Threat</SelectItem>
                <SelectItem value="medium">Medium Threat</SelectItem>
                <SelectItem value="high">High Threat</SelectItem>
                <SelectItem value="critical">Critical Threat</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getThreatLevelColor(formData.threatLevel)}`} />
              <Badge 
                variant="outline" 
                className={getThreatLevelBadge(formData.threatLevel)}
              >
                {formData.threatLevel.toUpperCase()} THREAT
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </EmpowermentCard>
  )

  const renderStep3 = () => (
    <EmpowermentCard>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gradient mb-2">Social Media Handles</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Add social media profiles to monitor their online presence
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/company/competitor"
              value={formData.socialMediaHandles.linkedin}
              onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="twitter">Twitter/X</Label>
            <Input
              id="twitter"
              placeholder="https://twitter.com/competitor"
              value={formData.socialMediaHandles.twitter}
              onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              placeholder="https://facebook.com/competitor"
              value={formData.socialMediaHandles.facebook}
              onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="https://instagram.com/competitor"
              value={formData.socialMediaHandles.instagram}
              onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </EmpowermentCard>
  )

  const renderStep4 = () => (
    <EmpowermentCard>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gradient mb-2">Monitoring Configuration</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Configure what you want to monitor about this competitor
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Monitoring Channels</Label>
            <div className="mt-3 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Website Monitoring</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track website changes, pricing, and content</p>
                  </div>
                </div>
                <Switch
                  checked={formData.monitoringConfig.websiteMonitoring}
                  onCheckedChange={(checked) => handleMonitoringConfigChange('websiteMonitoring', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Social Media Monitoring</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monitor posts, engagement, and campaigns</p>
                  </div>
                </div>
                <Switch
                  checked={formData.monitoringConfig.socialMediaMonitoring}
                  onCheckedChange={(checked) => handleMonitoringConfigChange('socialMediaMonitoring', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">News Monitoring</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track news mentions and press releases</p>
                  </div>
                </div>
                <Switch
                  checked={formData.monitoringConfig.newsMonitoring}
                  onCheckedChange={(checked) => handleMonitoringConfigChange('newsMonitoring', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Job Posting Monitoring</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monitor hiring patterns and team growth</p>
                  </div>
                </div>
                <Switch
                  checked={formData.monitoringConfig.jobPostingMonitoring}
                  onCheckedChange={(checked) => handleMonitoringConfigChange('jobPostingMonitoring', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-pink-500" />
                  <div>
                    <p className="font-medium">App Store Monitoring</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Track app updates, ratings, and reviews</p>
                  </div>
                </div>
                <Switch
                  checked={formData.monitoringConfig.appStoreMonitoring}
                  onCheckedChange={(checked) => handleMonitoringConfigChange('appStoreMonitoring', checked)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="monitoringFrequency">Monitoring Frequency</Label>
            <Select 
              value={formData.monitoringConfig.monitoringFrequency} 
              onValueChange={(value) => handleMonitoringConfigChange('monitoringFrequency', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly (Premium)</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </EmpowermentCard>
  )

  return (
    <div className="min-h-screen gradient-background p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/competitors">
              <BossButton variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </BossButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Add New Competitor</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Step {step} of 4: Set up competitive intelligence monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <BossCard variant="default">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    stepNumber <= step 
                      ? 'gradient-primary text-white' 
                      : 'bg-gray-200 text-gray-600'
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
                    className={`w-16 h-1 mx-2 ${
                      stepNumber < step ? 'gradient-primary' : 'bg-gray-200'
                    }`} 
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {step === 1 && "Basic Information"}
              {step === 2 && "Company Details"}
              {step === 3 && "Social Media"}
              {step === 4 && "Monitoring Setup"}
            </p>
          </div>
        </BossCard>

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
              <BossButton
                variant="secondary"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </BossButton>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {step < 4 ? (
              <ZapButton
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid(step)}
                icon={<ArrowLeft className="w-4 h-4 rotate-180" />}
              >
                Next Step
              </ZapButton>
            ) : (
              <ZapButton
                onClick={handleSubmit}
                loading={loading}
                icon={<Shield className="w-4 h-4" />}
              >
                {loading ? 'Creating Competitor...' : 'Start Monitoring'}
              </ZapButton>
            )}
          </div>
        </div>

        {/* Help Text */}
        <BossCard variant="default" className="text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <AlertTriangle className="w-4 h-4" />
            <span>
              All monitoring is done ethically using publicly available information only
            </span>
          </div>
        </BossCard>
      </motion.div>
    </div>
  )
}