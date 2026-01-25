"use client"


export const dynamic = 'force-dynamic'
import { logError } from '@/lib/logger'
import { useState, useEffect} from "react"
import { motion} from "framer-motion"
import { useParams, useRouter} from "next/navigation"
import { 
  ArrowLeft, Save, Trash2, AlertTriangle, Globe, Building, Users, DollarSign, Eye,} from "lucide-react"
import Link from "next/link"

import { Card, CardContent,} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input} from "@/components/ui/input"
import { Textarea} from "@/components/ui/textarea"
import { Label} from "@/components/ui/label"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Badge} from "@/components/ui/badge"
import { Switch} from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { Loading} from "@/components/ui/loading"

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog"

interface CompetitorFormData {
  name: string
  domain: string
  description: string
  industry: string
  headquarters: string
  foundedYear: number | null
  employeeCount: number | null
  fundingAmount: number | null
  fundingStage: string
  threatLevel: string
  monitoringStatus: string
  socialMediaHandles: {
    linkedin: string
    twitter: string
    facebook: string
    instagram: string
  }
  keyPersonnel: Array<{
    name: string
    role: string
    linkedinProfile: string
    joinedDate: string
  }>
  products: Array<{
    name: string
    description: string
    category: string
    status: string
  }>
  competitiveAdvantages: string[]
  vulnerabilities: string[]
  monitoringConfig: {
    websiteMonitoring: boolean
    socialMediaMonitoring: boolean
    newsMonitoring: boolean
    jobPostingMonitoring: boolean
    appStoreMonitoring: boolean
    monitoringFrequency: string
    alertThresholds: {
      pricing: boolean
      productLaunches: boolean
      hiring: boolean
      funding: boolean
      partnerships: boolean
    }
  }
}
export default function EditCompetitorPage() {
  const params = useParams()
  const router = useRouter()
  const competitorId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [hasChanges, setHasChanges] = useState(false)
  
  const [formData, setFormData] = useState<CompetitorFormData>({
    name: "",
    domain: "",
    description: "",
    industry: "",
    headquarters: "",
    foundedYear: null,
    employeeCount: null,
    fundingAmount: null,
    fundingStage: "",
    threatLevel: "medium",
    monitoringStatus: "active",
    socialMediaHandles: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
    },
    keyPersonnel: [],
    products: [],
    competitiveAdvantages: [],
    vulnerabilities: [],
    monitoringConfig: {
      websiteMonitoring: true,
      socialMediaMonitoring: true,
      newsMonitoring: true,
      jobPostingMonitoring: true,
      appStoreMonitoring: false,
      monitoringFrequency: "daily",
      alertThresholds: {
        pricing: true,
        productLaunches: true,
        hiring: true,
        funding: true,
        partnerships: true,
      }
    }
  })

  useEffect(() => {
    fetchCompetitorData()
  }, [competitorId])

  const fetchCompetitorData = async () => {
    try {
      setLoading(true)
      
      // Fetch real competitor data from API
      const response = await fetch(`/api/competitors/${competitorId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch competitor data')
      }
      
      const competitorData = await response.json()
      
      // Transform API data to form data structure
      const formData: CompetitorFormData = {
        name: competitorData.name || "",
        domain: competitorData.domain || "",
        description: competitorData.description || "",
        industry: competitorData.industry || "",
        headquarters: competitorData.headquarters || "",
        foundedYear: competitorData.founded_year || null,
        employeeCount: competitorData.employee_count || null,
        fundingAmount: competitorData.funding_amount || null,
        fundingStage: competitorData.funding_stage || "",
        threatLevel: competitorData.threat_level || "medium",
        monitoringStatus: competitorData.monitoring_status || "active",
        socialMediaHandles: {
          linkedin: competitorData.linkedin_url || "",
          twitter: competitorData.twitter_url || "",
          facebook: competitorData.facebook_url || "",
          instagram: competitorData.instagram_url || "",
        },
        keyPersonnel: competitorData.key_personnel || [],
        products: competitorData.products || [],
        competitiveAdvantages: competitorData.competitive_advantages || [],
        vulnerabilities: competitorData.vulnerabilities || [],
        monitoringConfig: competitorData.monitoring_config || {
          websiteMonitoring: true,
          socialMediaMonitoring: true,
          newsMonitoring: true,
          jobPostingMonitoring: true,
          appStoreMonitoring: false,
          monitoringFrequency: "daily",
          alertThresholds: {
            pricing: true,
            productLaunches: true,
            hiring: true,
            funding: true,
            partnerships: true,
          }
        }
      }
      
      setFormData(formData)
    } catch (error) {
      logError('Error fetching competitor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMediaHandles: {
        ...prev.socialMediaHandles,
        [platform]: value
      }
    }))
    setHasChanges(true)
  }

  const handleMonitoringConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      monitoringConfig: {
        ...prev.monitoringConfig,
        [field]: value
      }
    }))
    setHasChanges(true)
  }

  const handleAlertThresholdChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      monitoringConfig: {
        ...prev.monitoringConfig,
        alertThresholds: {
          ...prev.monitoringConfig.alertThresholds,
          [field]: value
        }
      }
    }))
    setHasChanges(true)
  }

  const addKeyPerson = () => {
    setFormData(prev => ({
      ...prev,
      keyPersonnel: [
        ...prev.keyPersonnel,
        { name: "", role: "", linkedinProfile: "", joinedDate: "" }
      ]
    }))
    setHasChanges(true)
  }

  const removeKeyPerson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyPersonnel: prev.keyPersonnel.filter((_, i) => i !== index)
    }))
    setHasChanges(true)
  }

  const updateKeyPerson = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyPersonnel: prev.keyPersonnel.map((person, i) => 
        i === index ? { ...person, [field]: value } : person
      )
    }))
    setHasChanges(true)
  }

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      products: [
        ...prev.products,
        { name: "", description: "", category: "", status: "active" }
      ]
    }))
    setHasChanges(true)
  }

  const removeProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }))
    setHasChanges(true)
  }

  const updateProduct = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }))
    setHasChanges(true)
  }

  const addAdvantage = () => {
    setFormData(prev => ({
      ...prev,
      competitiveAdvantages: [...prev.competitiveAdvantages, ""]
    }))
    setHasChanges(true)
  }

  const removeAdvantage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      competitiveAdvantages: prev.competitiveAdvantages.filter((_, i) => i !== index)
    }))
    setHasChanges(true)
  }

  const updateAdvantage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      competitiveAdvantages: prev.competitiveAdvantages.map((advantage, i) => 
        i === index ? value : advantage
      )
    }))
    setHasChanges(true)
  }

  const addVulnerability = () => {
    setFormData(prev => ({
      ...prev,
      vulnerabilities: [...prev.vulnerabilities, ""]
    }))
    setHasChanges(true)
  }

  const removeVulnerability = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vulnerabilities: prev.vulnerabilities.filter((_, i) => i !== index)
    }))
    setHasChanges(true)
  }

  const updateVulnerability = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      vulnerabilities: prev.vulnerabilities.map((vulnerability, i) => 
        i === index ? value : vulnerability
      )
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Save competitor data via API
      const response = await fetch(`/api/competitors/${competitorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to save competitor data')
      }
      
      setHasChanges(false)
      router.push(`/dashboard/competitors/${competitorId}`)
    } catch (error) {
      logError('Error saving competitor:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      
      // Delete competitor via API
      const response = await fetch(`/api/competitors/${competitorId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete competitor')
      }
      
      router.push('/dashboard/competitors')
    } catch (error) {
      logError('Error deleting competitor:', error)
    } finally {
      setDeleting(false)
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
      critical: 'bg-red-900/40 text-red-200 border-red-500/50',
      high: 'bg-orange-900/40 text-orange-200 border-orange-500/50',
      medium: 'bg-yellow-900/40 text-yellow-200 border-yellow-500/50',
      low: 'bg-green-900/40 text-green-200 border-green-500/50'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-800 text-gray-300 border-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading 
            variant="pulse" 
            size="lg" 
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6 font-mono">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/competitors/${competitorId}`}>
              <Button variant="outline" size="sm" className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-4 h-4 rounded-full ${getThreatLevelColor(formData.threatLevel)}`} />
                <h1 className="text-3xl font-bold font-orbitron text-white">Edit {formData.name}</h1>
                {hasChanges && (
                  <Badge variant="cyan" className="font-mono">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              <p className="text-gray-400">
                Update competitor information and monitoring settings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="error"
                  className="bg-red-900/50 hover:bg-red-900/70 text-red-100 border border-red-500/50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-dark-card border-neon-cyan/30 text-gray-300">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white font-orbitron">Delete Competitor</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Are you sure you want to delete {formData.name}? This action cannot be undone and will remove all associated intelligence data and alerts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deleting ? 'Deleting...' : 'Delete Competitor'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold"
            >
              {saving ? <span className="animate-spin mr-2">⟳</span> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Form Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-dark-card border border-neon-cyan/30">
            <TabsTrigger value="basic" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">Basic Info</TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">Social Media</TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">Team & Products</TabsTrigger>
            <TabsTrigger value="analysis" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">Analysis</TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">Monitoring</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="bg-dark-card border-neon-cyan/30">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-gray-100 font-orbitron mb-6">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-neon-cyan">Competitor Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="domain" className="text-neon-cyan">Website Domain</Label>
                      <Input
                        id="domain"
                        value={formData.domain}
                        onChange={(e) => handleInputChange('domain', e.target.value)}
                        className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="industry" className="text-neon-cyan">Industry</Label>
                      <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                        <SelectTrigger className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-neon-cyan/30 text-gray-300">
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

                    <div>
                      <Label htmlFor="headquarters" className="text-neon-cyan">Headquarters</Label>
                      <Input
                        id="headquarters"
                        value={formData.headquarters}
                        onChange={(e) => handleInputChange('headquarters', e.target.value)}
                        className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="foundedYear" className="text-neon-cyan">Founded Year</Label>
                      <Input
                        id="foundedYear"
                        type="number"
                        value={formData.foundedYear || ""}
                        onChange={(e) => handleInputChange('foundedYear', e.target.value ? parseInt(e.target.value) : null)}
                        className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="employeeCount" className="text-neon-cyan">Employee Count</Label>
                      <Input
                        id="employeeCount"
                        type="number"
                        value={formData.employeeCount || ""}
                        onChange={(e) => handleInputChange('employeeCount', e.target.value ? parseInt(e.target.value) : null)}
                        className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fundingAmount" className="text-neon-cyan">Funding Amount ($)</Label>
                      <Input
                        id="fundingAmount"
                        type="number"
                        value={formData.fundingAmount || ""}
                        onChange={(e) => handleInputChange('fundingAmount', e.target.value ? parseInt(e.target.value) : null)}
                        className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fundingStage" className="text-neon-cyan">Funding Stage</Label>
                      <Select value={formData.fundingStage} onValueChange={(value) => handleInputChange('fundingStage', value)}>
                        <SelectTrigger className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-card border-neon-cyan/30 text-gray-300">
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
                </div>

                <div className="mt-6">
                  <Label htmlFor="description" className="text-neon-cyan">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                    rows={4}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="threatLevel" className="text-neon-cyan">Threat Level</Label>
                    <Select value={formData.threatLevel} onValueChange={(value) => handleInputChange('threatLevel', value)}>
                      <SelectTrigger className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-neon-cyan/30 text-gray-300">
                        <SelectItem value="low">Low Threat</SelectItem>
                        <SelectItem value="medium">Medium Threat</SelectItem>
                        <SelectItem value="high">High Threat</SelectItem>
                        <SelectItem value="critical">Critical Threat</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className={`w-3 h-3 rounded-full ${getThreatLevelColor(formData.threatLevel)}`} />
                      <Badge 
                        variant="cyan" 
                        className={getThreatLevelBadge(formData.threatLevel)}
                      >
                        {formData.threatLevel.toUpperCase()} THREAT
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="monitoringStatus" className="text-neon-cyan">Monitoring Status</Label>
                    <Select value={formData.monitoringStatus} onValueChange={(value) => handleInputChange('monitoringStatus', value)}>
                      <SelectTrigger className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-neon-cyan/30 text-gray-300">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card className="bg-dark-card border-neon-cyan/30">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-gray-100 font-orbitron mb-6">Social Media Handles</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="linkedin" className="text-neon-cyan">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.socialMediaHandles.linkedin}
                      onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                      className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitter" className="text-neon-cyan">Twitter/X</Label>
                    <Input
                      id="twitter"
                      value={formData.socialMediaHandles.twitter}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                      className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="facebook" className="text-neon-cyan">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.socialMediaHandles.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram" className="text-neon-cyan">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.socialMediaHandles.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300 focus:border-neon-cyan focus:ring-neon-cyan/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team & Products Tab */}
          <TabsContent value="team" className="space-y-6">
            {/* Key Personnel */}
            <Card className="bg-dark-card border-neon-cyan/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-100 font-orbitron">Key Personnel</h3>
                  <Button variant="outline" size="sm" onClick={addKeyPerson} className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10">
                    Add Person
                  </Button>
                </div>
                <div className="space-y-4">
                  {formData.keyPersonnel.map((person, index) => (
                    <div key={index} className="p-4 bg-dark-bg rounded-lg border border-neon-cyan/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          aria-label="Full name"
                          value={person.name}
                          onChange={(e) => updateKeyPerson(index, 'name', e.target.value)}
                          className="bg-dark-card border-neon-cyan/30 text-gray-300"
                        />
                        <Input
                          aria-label="Role or title"
                          value={person.role}
                          onChange={(e) => updateKeyPerson(index, 'role', e.target.value)}
                          className="bg-dark-card border-neon-cyan/30 text-gray-300"
                        />
                        <Input
                          aria-label="LinkedIn profile URL"
                          value={person.linkedinProfile}
                          onChange={(e) => updateKeyPerson(index, 'linkedinProfile', e.target.value)}
                          className="bg-dark-card border-neon-cyan/30 text-gray-300"
                        />
                        <div className="flex items-center space-x-2">
                          <Input
                            type="date"
                            aria-label="Join date"
                            value={person.joinedDate}
                            onChange={(e) => updateKeyPerson(index, 'joinedDate', e.target.value)}
                            className="bg-dark-card border-neon-cyan/30 text-gray-300"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeKeyPerson(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card className="bg-dark-card border-neon-cyan/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-100 font-orbitron">Products & Services</h3>
                  <Button variant="outline" size="sm" onClick={addProduct} className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10">
                    Add Product
                  </Button>
                </div>
                <div className="space-y-4">
                  {formData.products.map((product, index) => (
                    <div key={index} className="p-4 bg-dark-bg rounded-lg border border-neon-cyan/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input
                          aria-label="Product name"
                          value={product.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                          className="bg-dark-card border-neon-cyan/30 text-gray-300"
                        />
                        <Input
                          aria-label="Product category"
                          value={product.category}
                          onChange={(e) => updateProduct(index, 'category', e.target.value)}
                          className="bg-dark-card border-neon-cyan/30 text-gray-300"
                        />
                      </div>
                      <Textarea
                        aria-label="Product description"
                        value={product.description}
                        onChange={(e) => updateProduct(index, 'description', e.target.value)}
                        rows={2}
                        className="mb-4 bg-dark-card border-neon-cyan/30 text-gray-300"
                      />
                      <div className="flex items-center justify-between">
                        <Select 
                          value={product.status} 
                          onValueChange={(value) => updateProduct(index, 'status', value)}
                        >
                          <SelectTrigger className="w-32 bg-dark-card border-neon-cyan/30 text-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-card border-neon-cyan/30 text-gray-300">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="beta">Beta</SelectItem>
                            <SelectItem value="discontinued">Discontinued</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeProduct(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Competitive Advantages */}
              <Card className="bg-dark-card border-neon-cyan/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-100 font-orbitron">Competitive Advantages</h3>
                    <Button variant="outline" size="sm" onClick={addAdvantage} className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10">
                      Add Advantage
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.competitiveAdvantages.map((advantage, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          aria-label="Competitive advantage"
                          value={advantage}
                          onChange={(e) => updateAdvantage(index, e.target.value)}
                          className="bg-dark-bg border-neon-cyan/30 text-gray-300"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeAdvantage(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Vulnerabilities */}
              <Card className="bg-dark-card border-neon-cyan/30">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-100 font-orbitron">Vulnerabilities</h3>
                    <Button variant="outline" size="sm" onClick={addVulnerability} className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10">
                      Add Vulnerability
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.vulnerabilities.map((vulnerability, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          aria-label="Vulnerability or weakness"
                          value={vulnerability}
                          onChange={(e) => updateVulnerability(index, e.target.value)}
                          className="bg-dark-bg border-neon-cyan/30 text-gray-300"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeVulnerability(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card className="bg-dark-card border-neon-cyan/30">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-gray-100 font-orbitron mb-6">Monitoring Configuration</h3>
                
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold text-neon-cyan">Monitoring Channels</Label>
                    <div className="mt-3 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="font-medium text-gray-200">Website Monitoring</p>
                            <p className="text-sm text-gray-400">Track website changes, pricing, and content</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.monitoringConfig.websiteMonitoring}
                          onCheckedChange={(checked) => handleMonitoringConfigChange('websiteMonitoring', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="font-medium text-gray-200">Social Media Monitoring</p>
                            <p className="text-sm text-gray-400">Monitor posts, engagement, and campaigns</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.monitoringConfig.socialMediaMonitoring}
                          onCheckedChange={(checked) => handleMonitoringConfigChange('socialMediaMonitoring', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Eye className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="font-medium text-gray-200">News Monitoring</p>
                            <p className="text-sm text-gray-400">Track news mentions and press releases</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.monitoringConfig.newsMonitoring}
                          onCheckedChange={(checked) => handleMonitoringConfigChange('newsMonitoring', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Building className="w-5 h-5 text-orange-400" />
                          <div>
                            <p className="font-medium text-gray-200">Job Posting Monitoring</p>
                            <p className="text-sm text-gray-400">Monitor hiring patterns and team growth</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.monitoringConfig.jobPostingMonitoring}
                          onCheckedChange={(checked) => handleMonitoringConfigChange('jobPostingMonitoring', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-5 h-5 text-pink-400" />
                          <div>
                            <p className="font-medium text-gray-200">App Store Monitoring</p>
                            <p className="text-sm text-gray-400">Track app updates, ratings, and reviews</p>
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
                    <Label htmlFor="monitoringFrequency" className="text-neon-cyan">Monitoring Frequency</Label>
                    <Select 
                      value={formData.monitoringConfig.monitoringFrequency} 
                      onValueChange={(value) => handleMonitoringConfigChange('monitoringFrequency', value)}
                    >
                      <SelectTrigger className="mt-1 bg-dark-bg border-neon-cyan/30 text-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-card border-neon-cyan/30 text-gray-300">
                        <SelectItem value="hourly">Hourly (Premium)</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-neon-cyan">Alert Thresholds</Label>
                    <div className="mt-3 space-y-3 text-gray-300">
                      <div className="flex items-center justify-between">
                        <span>Pricing Changes</span>
                        <Switch
                          checked={formData.monitoringConfig.alertThresholds.pricing}
                          onCheckedChange={(checked) => handleAlertThresholdChange('pricing', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Product Launches</span>
                        <Switch
                          checked={formData.monitoringConfig.alertThresholds.productLaunches}
                          onCheckedChange={(checked) => handleAlertThresholdChange('productLaunches', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Hiring Activity</span>
                        <Switch
                          checked={formData.monitoringConfig.alertThresholds.hiring}
                          onCheckedChange={(checked) => handleAlertThresholdChange('hiring', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Funding News</span>
                        <Switch
                          checked={formData.monitoringConfig.alertThresholds.funding}
                          onCheckedChange={(checked) => handleAlertThresholdChange('funding', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Partnerships</span>
                        <Switch
                          checked={formData.monitoringConfig.alertThresholds.partnerships}
                          onCheckedChange={(checked) => handleAlertThresholdChange('partnerships', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Warning */}
        {hasChanges && (
          <Card className="bg-yellow-900/20 border-yellow-500/50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-yellow-200">You have unsaved changes</p>
                    <p className="text-sm text-yellow-200/70">
                      Don't forget to save your changes before leaving this page
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold"
                >
                  Save Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  )
}