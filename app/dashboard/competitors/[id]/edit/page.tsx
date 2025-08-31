"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Save, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Globe,
  Building,
  Users,
  DollarSign,
  Shield,
  Eye,
  Zap
} from "lucide-react"
import Link from "next/link"

import { BossCard, EmpowermentCard } from "@/components/ui/boss-card"
import { BossButton, ZapButton, DangerButton } from "@/components/ui/boss-button"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loading } from "@/components/ui/loading"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
      
      // Mock data for now - replace with actual API call
      const mockData: CompetitorFormData = {
        name: "TechRival Corp",
        domain: "techrival.com",
        description: "AI-powered productivity platform targeting solo entrepreneurs and small businesses with advanced automation tools.",
        industry: "Technology",
        headquarters: "San Francisco, CA",
        foundedYear: 2019,
        employeeCount: 150,
        fundingAmount: 25000000,
        fundingStage: "series-b",
        threatLevel: "high",
        monitoringStatus: "active",
        socialMediaHandles: {
          linkedin: "https://linkedin.com/company/techrival",
          twitter: "https://twitter.com/techrival",
          facebook: "https://facebook.com/techrival",
          instagram: ""
        },
        keyPersonnel: [
          {
            name: "Sarah Chen",
            role: "CEO & Co-founder",
            linkedinProfile: "https://linkedin.com/in/sarahchen",
            joinedDate: "2019-01-15"
          },
          {
            name: "Marcus Rodriguez",
            role: "CTO & Co-founder",
            linkedinProfile: "https://linkedin.com/in/marcusrodriguez",
            joinedDate: "2019-01-15"
          }
        ],
        products: [
          {
            name: "TechRival AI Assistant",
            description: "AI-powered business automation platform",
            category: "Productivity",
            status: "active"
          }
        ],
        competitiveAdvantages: [
          "Strong VC backing ($25M Series B)",
          "Experienced founding team",
          "Enterprise partnerships with Fortune 500"
        ],
        vulnerabilities: [
          "Limited mobile app functionality",
          "High pricing compared to competitors",
          "Dependency on third-party integrations"
        ],
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
      }
      
      setFormData(mockData)
    } catch (error) {
      console.error('Error fetching competitor data:', error)
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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/competitors/${competitorId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      setHasChanges(false)
      router.push(`/dashboard/competitors/${competitorId}`)
    } catch (error) {
      console.error('Error saving competitor:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/competitors/${competitorId}`, {
      //   method: 'DELETE'
      // })
      
      router.push('/dashboard/competitors')
    } catch (error) {
      console.error('Error deleting competitor:', error)
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
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    }
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-background p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading 
            variant="boss" 
            size="lg" 
            text="Loading competitor data..."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-background p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/dashboard/competitors/${competitorId}`}>
              <BossButton variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </BossButton>
            </Link>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-4 h-4 rounded-full ${getThreatLevelColor(formData.threatLevel)}`} />
                <h1 className="text-3xl font-bold text-gradient">Edit {formData.name}</h1>
                {hasChanges && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Update competitor information and monitoring settings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DangerButton
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Delete
                </DangerButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Competitor</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {formData.name}? This action cannot be undone and will remove all associated intelligence data and alerts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleting ? 'Deleting...' : 'Delete Competitor'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <ZapButton
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges}
              icon={<Save className="w-4 h-4" />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </ZapButton>
          </div>
        </div>

        {/* Form Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="team">Team & Products</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <EmpowermentCard>
              <h3 className="text-xl font-bold text-gradient mb-6">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Competitor Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="domain">Website Domain</Label>
                    <Input
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                      className="mt-1"
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

                  <div>
                    <Label htmlFor="headquarters">Headquarters</Label>
                    <Input
                      id="headquarters"
                      value={formData.headquarters}
                      onChange={(e) => handleInputChange('headquarters', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="foundedYear">Founded Year</Label>
                    <Input
                      id="foundedYear"
                      type="number"
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
                      value={formData.employeeCount || ""}
                      onChange={(e) => handleInputChange('employeeCount', e.target.value ? parseInt(e.target.value) : null)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fundingAmount">Funding Amount ($)</Label>
                    <Input
                      id="fundingAmount"
                      type="number"
                      value={formData.fundingAmount || ""}
                      onChange={(e) => handleInputChange('fundingAmount', e.target.value ? parseInt(e.target.value) : null)}
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
              </div>

              <div className="mt-6">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="threatLevel">Threat Level</Label>
                  <Select value={formData.threatLevel} onValueChange={(value) => handleInputChange('threatLevel', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select threat level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Threat</SelectItem>
                      <SelectItem value="medium">Medium Threat</SelectItem>
                      <SelectItem value="high">High Threat</SelectItem>
                      <SelectItem value="critical">Critical Threat</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${getThreatLevelColor(formData.threatLevel)}`} />
                    <Badge 
                      variant="outline" 
                      className={getThreatLevelBadge(formData.threatLevel)}
                    >
                      {formData.threatLevel.toUpperCase()} THREAT
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label htmlFor="monitoringStatus">Monitoring Status</Label>
                  <Select value={formData.monitoringStatus} onValueChange={(value) => handleInputChange('monitoringStatus', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </EmpowermentCard>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-6">
            <EmpowermentCard>
              <h3 className="text-xl font-bold text-gradient mb-6">Social Media Handles</h3>
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
            </EmpowermentCard>
          </TabsContent>

          {/* Team & Products Tab */}
          <TabsContent value="team" className="space-y-6">
            {/* Key Personnel */}
            <EmpowermentCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gradient">Key Personnel</h3>
                <BossButton variant="secondary" size="sm" onClick={addKeyPerson}>
                  Add Person
                </BossButton>
              </div>
              <div className="space-y-4">
                {formData.keyPersonnel.map((person, index) => (
                  <div key={index} className="p-4 glass rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Full Name"
                        value={person.name}
                        onChange={(e) => updateKeyPerson(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Role/Title"
                        value={person.role}
                        onChange={(e) => updateKeyPerson(index, 'role', e.target.value)}
                      />
                      <Input
                        placeholder="LinkedIn Profile URL"
                        value={person.linkedinProfile}
                        onChange={(e) => updateKeyPerson(index, 'linkedinProfile', e.target.value)}
                      />
                      <div className="flex items-center space-x-2">
                        <Input
                          type="date"
                          placeholder="Join Date"
                          value={person.joinedDate}
                          onChange={(e) => updateKeyPerson(index, 'joinedDate', e.target.value)}
                        />
                        <BossButton 
                          variant="secondary" 
                          size="sm"
                          onClick={() => removeKeyPerson(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </BossButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </EmpowermentCard>

            {/* Products */}
            <EmpowermentCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gradient">Products & Services</h3>
                <BossButton variant="secondary" size="sm" onClick={addProduct}>
                  Add Product
                </BossButton>
              </div>
              <div className="space-y-4">
                {formData.products.map((product, index) => (
                  <div key={index} className="p-4 glass rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input
                        placeholder="Product Name"
                        value={product.name}
                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Category"
                        value={product.category}
                        onChange={(e) => updateProduct(index, 'category', e.target.value)}
                      />
                    </div>
                    <Textarea
                      placeholder="Product Description"
                      value={product.description}
                      onChange={(e) => updateProduct(index, 'description', e.target.value)}
                      rows={2}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between">
                      <Select 
                        value={product.status} 
                        onValueChange={(value) => updateProduct(index, 'status', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="beta">Beta</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                        </SelectContent>
                      </Select>
                      <BossButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => removeProduct(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </BossButton>
                    </div>
                  </div>
                ))}
              </div>
            </EmpowermentCard>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Competitive Advantages */}
              <EmpowermentCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gradient">Competitive Advantages</h3>
                  <BossButton variant="secondary" size="sm" onClick={addAdvantage}>
                    Add Advantage
                  </BossButton>
                </div>
                <div className="space-y-3">
                  {formData.competitiveAdvantages.map((advantage, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="Competitive advantage..."
                        value={advantage}
                        onChange={(e) => updateAdvantage(index, e.target.value)}
                      />
                      <BossButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => removeAdvantage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </BossButton>
                    </div>
                  ))}
                </div>
              </EmpowermentCard>

              {/* Vulnerabilities */}
              <EmpowermentCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gradient">Vulnerabilities</h3>
                  <BossButton variant="secondary" size="sm" onClick={addVulnerability}>
                    Add Vulnerability
                  </BossButton>
                </div>
                <div className="space-y-3">
                  {formData.vulnerabilities.map((vulnerability, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="Vulnerability or weakness..."
                        value={vulnerability}
                        onChange={(e) => updateVulnerability(index, e.target.value)}
                      />
                      <BossButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => removeVulnerability(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </BossButton>
                    </div>
                  ))}
                </div>
              </EmpowermentCard>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <EmpowermentCard>
              <h3 className="text-xl font-bold text-gradient mb-6">Monitoring Configuration</h3>
              
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

                <div>
                  <Label className="text-base font-semibold">Alert Thresholds</Label>
                  <div className="mt-3 space-y-3">
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
            </EmpowermentCard>
          </TabsContent>
        </Tabs>

        {/* Save Warning */}
        {hasChanges && (
          <BossCard variant="warning">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium">You have unsaved changes</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't forget to save your changes before leaving this page
                  </p>
                </div>
              </div>
              <ZapButton
                onClick={handleSave}
                loading={saving}
                icon={<Save className="w-4 h-4" />}
              >
                Save Now
              </ZapButton>
            </div>
          </BossCard>
        )}
      </motion.div>
    </div>
  )
}