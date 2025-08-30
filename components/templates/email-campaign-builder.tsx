"use client"

import { useState } from "react"
import BaseTemplate, { TemplateData } from "./base-template"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { BossButton } from "@/components/ui/boss-button"
import { BossCard } from "@/components/ui/boss-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { motion } from "framer-motion"
import { 
  Mail, 
  Users, 
  BarChart3, 
  Send, 
  Eye, 
  Split, 
  Plus,
  Minus,
  Copy,
  Image,
  Type,
  Link,
  TrendingUp,
  Edit3,
  Settings
} from "lucide-react"

interface EmailBlock {
  id: string
  type: 'text' | 'image' | 'button' | 'divider' | 'social' | 'spacer'
  content: any
  style: any
}

interface ABTestVariant {
  id: string
  name: string
  subject: string
  preheader: string
  blocks: EmailBlock[]
  trafficPercentage: number
}

interface Personalization {
  tag: string
  fallback: string
  description: string
}

interface EmailCampaignData {
  // Campaign Setup
  campaignName: string
  campaignType: 'newsletter' | 'promotional' | 'transactional' | 'welcome' | 'abandoned-cart' | 're-engagement'
  audience: string[]
  sendDate: string
  timezone: string
  
  // Email Content
  fromName: string
  fromEmail: string
  replyTo: string
  subject: string
  preheader: string
  
  // Design
  template: string
  blocks: EmailBlock[]
  
  // Personalization
  personalizations: Personalization[]
  dynamicContent: boolean
  
  // A/B Testing
  enableABTest: boolean
  testElement: 'subject' | 'content' | 'send-time' | 'from-name'
  variants: ABTestVariant[]
  testDuration: number
  winnerCriteria: 'open-rate' | 'click-rate' | 'conversion-rate'
  
  // Analytics Goals
  primaryGoal: string
  secondaryGoals: string[]
  trackingEnabled: boolean
  utmParameters: {
    source: string
    medium: string
    campaign: string
    term: string
    content: string
  }
  
  // Send Settings
  sendImmediately: boolean
  scheduledSend: boolean
  autoSend: boolean
  throttling: number
}

interface EmailCampaignBuilderProps {
  template: TemplateData
  onSave?: (data: EmailCampaignData) => Promise<void>
  onExport?: (format: 'json' | 'pdf' | 'csv') => void
}

export default function EmailCampaignBuilder({ template, onSave: _onSave, onExport: _onExport }: EmailCampaignBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [_data, setData] = useState<EmailCampaignData>({
    campaignName: "",
    campaignType: 'newsletter',
    audience: [],
    sendDate: "",
    timezone: "UTC",
    fromName: "",
    fromEmail: "",
    replyTo: "",
    subject: "",
    preheader: "",
    template: "minimal",
    blocks: [],
    personalizations: [],
    dynamicContent: false,
    enableABTest: false,
    testElement: 'subject',
    variants: [],
    testDuration: 24,
    winnerCriteria: 'open-rate',
    primaryGoal: "",
    secondaryGoals: [],
    trackingEnabled: true,
    utmParameters: {
      source: "email",
      medium: "email",
      campaign: "",
      term: "",
      content: ""
    },
    sendImmediately: false,
    scheduledSend: true,
    autoSend: false,
    throttling: 100
  })
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  
  const totalSteps = 5

  // Create new email block
  const createBlock = (type: EmailBlock['type']): EmailBlock => {
    const baseBlock = {
      id: crypto.randomUUID(),
      type,
      style: {
        padding: '20px',
        backgroundColor: 'transparent',
        textAlign: 'left' as const,
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#333333'
      }
    }

    switch (type) {
      case 'text':
        return {
          ...baseBlock,
          content: {
            text: "Your text here...",
            html: "<p>Your text here...</p>"
          }
        }
      case 'image':
        return {
          ...baseBlock,
          content: {
            src: "",
            alt: "",
            width: "100%",
            link: ""
          }
        }
      case 'button':
        return {
          ...baseBlock,
          content: {
            text: "Click Here",
            link: "#",
            backgroundColor: "#007bff",
            textColor: "#ffffff",
            borderRadius: "4px",
            padding: "12px 24px"
          }
        }
      case 'divider':
        return {
          ...baseBlock,
          content: {
            height: "2px",
            color: "#e5e5e5",
            style: "solid"
          }
        }
      case 'social':
        return {
          ...baseBlock,
          content: {
            platforms: [
              { name: 'facebook', url: '#', icon: '📘' },
              { name: 'twitter', url: '#', icon: '🐦' },
              { name: 'instagram', url: '#', icon: '📷' }
            ]
          }
        }
      case 'spacer':
        return {
          ...baseBlock,
          content: {
            height: "30px"
          }
        }
      default:
        return baseBlock
    }
  }

  // Add block to email
  const addBlock = (type: EmailBlock['type']) => {
    const newBlock = createBlock(type)
    setData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }))
    setSelectedBlock(newBlock.id)
  }

  // Update block
  const _updateBlock = (id: string, updates: Partial<EmailBlock>) => {
    setData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === id ? { ...block, ...updates } : block
      )
    }))
  }

  // Delete block
  const deleteBlock = (id: string) => {
    setData(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== id)
    }))
    setSelectedBlock(null)
  }

  // Duplicate block
  const duplicateBlock = (id: string) => {
    const blockToDuplicate = data.blocks.find(block => block.id === id)
    if (blockToDuplicate) {
      const duplicatedBlock = {
        ...blockToDuplicate,
        id: crypto.randomUUID()
      }
      const blockIndex = data.blocks.findIndex(block => block.id === id)
      const newBlocks = [...data.blocks]
      newBlocks.splice(blockIndex + 1, 0, duplicatedBlock)
      
      setData(prev => ({
        ...prev,
        blocks: newBlocks
      }))
    }
  }

  // Move block up/down
  const _moveBlock = (id: string, direction: 'up' | 'down') => {
    const currentIndex = data.blocks.findIndex(block => block.id === id)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= data.blocks.length) return

    const newBlocks = [...data.blocks]
    const [movedBlock] = newBlocks.splice(currentIndex, 1)
    newBlocks.splice(newIndex, 0, movedBlock)

    setData(prev => ({
      ...prev,
      blocks: newBlocks
    }))
  }

  // Add personalization token
  const addPersonalization = () => {
    const newPersonalization: Personalization = {
      tag: "",
      fallback: "",
      description: ""
    }
    setData(prev => ({
      ...prev,
      personalizations: [...prev.personalizations, newPersonalization]
    }))
  }

  // Update personalization
  const updatePersonalization = (index: number, updates: Partial<Personalization>) => {
    const newPersonalizations = [...data.personalizations]
    newPersonalizations[index] = { ...newPersonalizations[index], ...updates }
    setData(prev => ({ ...prev, personalizations: newPersonalizations }))
  }

  // Remove personalization
  const removePersonalization = (index: number) => {
    setData(prev => ({
      ...prev,
      personalizations: prev.personalizations.filter((_, i) => i !== index)
    }))
  }

  // Create A/B test variant
  const createABTestVariant = () => {
    const newVariant: ABTestVariant = {
      id: crypto.randomUUID(),
      name: `Variant ${data.variants.length + 1}`,
      subject: data.subject,
      preheader: data.preheader,
      blocks: [...data.blocks],
      trafficPercentage: 50
    }
    setData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }))
  }

  // Update A/B test variant
  const updateABTestVariant = (id: string, updates: Partial<ABTestVariant>) => {
    setData(prev => ({
      ...prev,
      variants: prev.variants.map(variant =>
        variant.id === id ? { ...variant, ...updates } : variant
      )
    }))
  }

  // Remove A/B test variant
  const removeABTestVariant = (id: string) => {
    setData(prev => ({
      ...prev,
      variants: prev.variants.filter(variant => variant.id !== id)
    }))
  }

  // Get email preview HTML
  const getEmailPreviewHTML = (blocks: EmailBlock[]) => {
    return blocks.map(block => {
      const baseStyles = `
        padding: ${block.style.padding};
        background-color: ${block.style.backgroundColor};
        text-align: ${block.style.textAlign};
        font-size: ${block.style.fontSize};
        font-family: ${block.style.fontFamily};
        color: ${block.style.color};
      `

      switch (block.type) {
        case 'text':
          return `<div style="${baseStyles}">${block.content.html || block.content.text}</div>`
        case 'image':
          return `<div style="${baseStyles}">
            ${block.content.link ? `<a href="${block.content.link}">` : ''}
            <img src="${block.content.src || '/placeholder-image.png'}" 
                 alt="${block.content.alt}" 
                 style="width: ${block.content.width}; max-width: 100%; height: auto;" />
            ${block.content.link ? '</a>' : ''}
          </div>`
        case 'button':
          return `<div style="${baseStyles}">
            <a href="${block.content.link}" 
               style="
                 display: inline-block;
                 background-color: ${block.content.backgroundColor};
                 color: ${block.content.textColor};
                 text-decoration: none;
                 padding: ${block.content.padding};
                 border-radius: ${block.content.borderRadius};
                 font-weight: bold;
               ">
              ${block.content.text}
            </a>
          </div>`
        case 'divider':
          return `<div style="${baseStyles}">
            <hr style="
              height: ${block.content.height};
              background-color: ${block.content.color};
              border: none;
              border-style: ${block.content.style};
            " />
          </div>`
        case 'social':
          return `<div style="${baseStyles}">
            ${block.content.platforms.map((platform: any) => 
              `<a href="${platform.url}" style="margin: 0 10px; text-decoration: none;">
                ${platform.icon} ${platform.name}
               </a>`
            ).join('')}
          </div>`
        case 'spacer':
          return `<div style="height: ${block.content.height};"></div>`
        default:
          return ''
      }
    }).join('')
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
      campaignName: "",
      campaignType: 'newsletter',
      audience: [],
      sendDate: "",
      timezone: "UTC",
      fromName: "",
      fromEmail: "",
      replyTo: "",
      subject: "",
      preheader: "",
      template: "minimal",
      blocks: [],
      personalizations: [],
      dynamicContent: false,
      enableABTest: false,
      testElement: 'subject',
      variants: [],
      testDuration: 24,
      winnerCriteria: 'open-rate',
      primaryGoal: "",
      secondaryGoals: [],
      trackingEnabled: true,
      utmParameters: {
        source: "email",
        medium: "email",
        campaign: "",
        term: "",
        content: ""
      },
      sendImmediately: false,
      scheduledSend: true,
      autoSend: false,
      throttling: 100
    })
    setCurrentStep(1)
    setSelectedBlock(null)
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
            <Settings className="w-3 h-3" />
            <span className="hidden md:inline">Setup</span>
          </TabsTrigger>
          <TabsTrigger value="step-2" className="flex items-center gap-1 text-xs">
            <Edit3 className="w-3 h-3" />
            <span className="hidden md:inline">Design</span>
          </TabsTrigger>
          <TabsTrigger value="step-3" className="flex items-center gap-1 text-xs">
            <Type className="w-3 h-3" />
            <span className="hidden md:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="step-4" className="flex items-center gap-1 text-xs">
            <Split className="w-3 h-3" />
            <span className="hidden md:inline">A/B Test</span>
          </TabsTrigger>
          <TabsTrigger value="step-5" className="flex items-center gap-1 text-xs">
            <Send className="w-3 h-3" />
            <span className="hidden md:inline">Send</span>
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Campaign Setup */}
        <TabsContent value="step-1" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Campaign Setup
              </CardTitle>
              <CardDescription>
                Configure your email campaign settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name *</Label>
                  <Input
                    id="campaign-name"
                    placeholder="e.g., Weekly Newsletter - March 2024"
                    value={data.campaignName}
                    onChange={(e) => setData(prev => ({ ...prev, campaignName: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Campaign Type</Label>
                  <Select onValueChange={(value: any) => setData(prev => ({ ...prev, campaignType: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="transactional">Transactional</SelectItem>
                      <SelectItem value="welcome">Welcome Series</SelectItem>
                      <SelectItem value="abandoned-cart">Abandoned Cart</SelectItem>
                      <SelectItem value="re-engagement">Re-engagement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="from-name">From Name *</Label>
                  <Input
                    id="from-name"
                    placeholder="Your Company"
                    value={data.fromName}
                    onChange={(e) => setData(prev => ({ ...prev, fromName: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="from-email">From Email *</Label>
                  <Input
                    id="from-email"
                    type="email"
                    placeholder="hello@company.com"
                    value={data.fromEmail}
                    onChange={(e) => setData(prev => ({ ...prev, fromEmail: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="reply-to">Reply To</Label>
                  <Input
                    id="reply-to"
                    type="email"
                    placeholder="support@company.com"
                    value={data.replyTo}
                    onChange={(e) => setData(prev => ({ ...prev, replyTo: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject Line *</Label>
                  <Input
                    id="subject"
                    placeholder="Your compelling subject line"
                    value={data.subject}
                    onChange={(e) => setData(prev => ({ ...prev, subject: e.target.value }))}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Length: {data.subject.length}/50 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="preheader">Preheader Text</Label>
                  <Input
                    id="preheader"
                    placeholder="Preview text that appears after subject"
                    value={data.preheader}
                    onChange={(e) => setData(prev => ({ ...prev, preheader: e.target.value }))}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Length: {data.preheader.length}/90 characters
                  </p>
                </div>
              </div>

              <div>
                <Label>Audience Segments</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {[
                    'All Subscribers', 'VIP Customers', 'New Subscribers',
                    'Engaged Users', 'Inactive Users', 'Premium Users',
                    'Location Based', 'Interest Based', 'Behavioral'
                  ].map((segment) => (
                    <label key={segment} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={data.audience.includes(segment)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setData(prev => ({ ...prev, audience: [...prev.audience, segment] }))
                          } else {
                            setData(prev => ({ ...prev, audience: prev.audience.filter(a => a !== segment) }))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{segment}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="send-date">Send Date</Label>
                  <Input
                    id="send-date"
                    type="datetime-local"
                    value={data.sendDate}
                    onChange={(e) => setData(prev => ({ ...prev, sendDate: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Select onValueChange={(value) => setData(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern (EST)</SelectItem>
                      <SelectItem value="PST">Pacific (PST)</SelectItem>
                      <SelectItem value="CST">Central (CST)</SelectItem>
                      <SelectItem value="MST">Mountain (MST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </BossCard>

          <div className="flex justify-end">
            <BossButton 
              onClick={() => setCurrentStep(2)}
              disabled={!data.campaignName || !data.fromName || !data.fromEmail || !data.subject}
              crown
            >
              Next: Design Email
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 2: Email Design */}
        <TabsContent value="step-2" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Design Controls */}
            <div className="lg:col-span-1 space-y-4">
              <BossCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Edit3 className="w-5 h-5 text-purple-600" />
                    Email Builder
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Template</Label>
                    <Select onValueChange={(value) => setData(prev => ({ ...prev, template: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 block">Add Elements</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBlock('text')}
                        className="flex items-center gap-2"
                      >
                        <Type className="w-4 h-4" />
                        Text
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBlock('image')}
                        className="flex items-center gap-2"
                      >
                        <Image className="w-4 h-4" />
                        Image
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBlock('button')}
                        className="flex items-center gap-2"
                      >
                        <Link className="w-4 h-4" />
                        Button
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBlock('divider')}
                        className="flex items-center gap-2"
                      >
                        <Minus className="w-4 h-4" />
                        Divider
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBlock('social')}
                        className="flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Social
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addBlock('spacer')}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Spacer
                      </Button>
                    </div>
                  </div>

                  {selectedBlock && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Element Settings</h4>
                      {/* Block-specific settings would go here */}
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateBlock(selectedBlock)}
                          className="w-full"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteBlock(selectedBlock)}
                          className="w-full"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </BossCard>
            </div>

            {/* Email Preview */}
            <div className="lg:col-span-2">
              <BossCard>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    Email Preview
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      Desktop
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewMode('mobile')}
                    >
                      Mobile
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`border rounded-lg overflow-hidden ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                    {/* Email Header */}
                    <div className="bg-gray-50 p-4 text-sm border-b">
                      <div className="font-medium">From: {data.fromName} &lt;{data.fromEmail}&gt;</div>
                      <div className="font-bold mt-1">{data.subject || 'Subject line...'}</div>
                      {data.preheader && (
                        <div className="text-gray-600 text-xs mt-1">{data.preheader}</div>
                      )}
                    </div>

                    {/* Email Body */}
                    <div className="bg-white min-h-[400px]">
                      {data.blocks.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p>Start building your email by adding elements</p>
                        </div>
                      ) : (
                        <div 
                          className="email-content"
                          dangerouslySetInnerHTML={{ __html: getEmailPreviewHTML(data.blocks) }}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </BossCard>
            </div>
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
              crown
            >
              Next: Personalization
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 3: Personalization & Content */}
        <TabsContent value="step-3" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-purple-600" />
                Personalization & Dynamic Content
              </CardTitle>
              <CardDescription>
                Add personalization tokens and dynamic content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.dynamicContent}
                    onChange={(e) => setData(prev => ({ ...prev, dynamicContent: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Enable Dynamic Content</span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold">Personalization Tokens</h4>
                    <p className="text-sm text-gray-600">Define merge tags for dynamic content</p>
                  </div>
                  <BossButton onClick={addPersonalization} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Token
                  </BossButton>
                </div>

                <div className="space-y-4">
                  {data.personalizations.map((personalization, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm">Token Name</Label>
                          <Input
                            placeholder="e.g., {{firstName}}"
                            value={personalization.tag}
                            onChange={(e) => updatePersonalization(index, { tag: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Fallback Value</Label>
                          <Input
                            placeholder="Default value if empty"
                            value={personalization.fallback}
                            onChange={(e) => updatePersonalization(index, { fallback: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePersonalization(index)}
                            className="text-red-600"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label className="text-sm">Description</Label>
                        <Input
                          placeholder="What this token represents"
                          value={personalization.description}
                          onChange={(e) => updatePersonalization(index, { description: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {data.personalizations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No personalization tokens yet</p>
                    <p className="text-sm">Add tokens to personalize your emails</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-4">Common Personalization Examples</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded">
                    <strong>{{firstName}}</strong> - Recipient&apos;s first name
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <strong>{{companyName}}</strong> - Company name
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <strong>{{location}}</strong> - City or region
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <strong>{{recentPurchase}}</strong> - Last item bought
                  </div>
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
              Next: A/B Testing
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 4: A/B Testing */}
        <TabsContent value="step-4" className="space-y-6">
          <BossCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Split className="w-5 h-5 text-purple-600" />
                A/B Testing Setup
              </CardTitle>
              <CardDescription>
                Test different versions to optimize performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.enableABTest}
                    onChange={(e) => setData(prev => ({ ...prev, enableABTest: e.target.checked }))}
                    className="rounded"
                  />
                  <span>Enable A/B Testing</span>
                </label>
              </div>

              {data.enableABTest && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Test Element</Label>
                      <Select onValueChange={(value: any) => setData(prev => ({ ...prev, testElement: value }))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="What to test" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subject">Subject Line</SelectItem>
                          <SelectItem value="content">Email Content</SelectItem>
                          <SelectItem value="send-time">Send Time</SelectItem>
                          <SelectItem value="from-name">From Name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Test Duration (hours)</Label>
                      <Slider
                        value={[data.testDuration]}
                        onValueChange={([value]) => setData(prev => ({ ...prev, testDuration: value }))}
                        max={168}
                        min={1}
                        step={1}
                        className="mt-4"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {data.testDuration} hours
                      </p>
                    </div>

                    <div>
                      <Label>Winner Criteria</Label>
                      <Select onValueChange={(value: any) => setData(prev => ({ ...prev, winnerCriteria: value }))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Success metric" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open-rate">Open Rate</SelectItem>
                          <SelectItem value="click-rate">Click Rate</SelectItem>
                          <SelectItem value="conversion-rate">Conversion Rate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">Test Variants</h4>
                        <p className="text-sm text-gray-600">Create different versions to test</p>
                      </div>
                      <BossButton onClick={createABTestVariant} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Variant
                      </BossButton>
                    </div>

                    <div className="space-y-4">
                      {data.variants.map((variant) => (
                        <motion.div
                          key={variant.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Input
                              placeholder="Variant name"
                              value={variant.name}
                              onChange={(e) => updateABTestVariant(variant.id, { name: e.target.value })}
                              className="font-medium max-w-xs"
                            />
                            <div className="flex items-center gap-2">
                              <Badge>{variant.trafficPercentage}% traffic</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeABTestVariant(variant.id)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {data.testElement === 'subject' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm">Subject Line</Label>
                                <Input
                                  value={variant.subject}
                                  onChange={(e) => updateABTestVariant(variant.id, { subject: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm">Preheader</Label>
                                <Input
                                  value={variant.preheader}
                                  onChange={(e) => updateABTestVariant(variant.id, { preheader: e.target.value })}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-3">
                            <Label className="text-sm">Traffic Split: {variant.trafficPercentage}%</Label>
                            <Slider
                              value={[variant.trafficPercentage]}
                              onValueChange={([value]) => updateABTestVariant(variant.id, { trafficPercentage: value })}
                              max={100}
                              step={5}
                              className="mt-2"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {data.variants.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Split className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No test variants created yet</p>
                        <p className="text-sm">Add variants to start A/B testing</p>
                      </div>
                    )}
                  </div>
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
              Next: Send Settings
            </BossButton>
          </div>
        </TabsContent>

        {/* Step 5: Send & Analytics */}
        <TabsContent value="step-5" className="space-y-6">
          <div className="grid gap-6">
            <BossCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-600" />
                  Send Settings
                </CardTitle>
                <CardDescription>
                  Configure when and how to send your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Send Options</Label>
                  <div className="space-y-3 mt-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sendOption"
                        checked={data.sendImmediately}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          sendImmediately: e.target.checked,
                          scheduledSend: false,
                          autoSend: false
                        }))}
                        className="rounded"
                      />
                      <span>Send Immediately</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sendOption"
                        checked={data.scheduledSend}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          sendImmediately: false,
                          scheduledSend: e.target.checked,
                          autoSend: false
                        }))}
                        className="rounded"
                      />
                      <span>Schedule Send</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="sendOption"
                        checked={data.autoSend}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          sendImmediately: false,
                          scheduledSend: false,
                          autoSend: e.target.checked
                        }))}
                        className="rounded"
                      />
                      <span>Auto Send (Based on triggers)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="throttling">Send Rate Throttling</Label>
                  <div className="mt-2">
                    <Slider
                      value={[data.throttling]}
                      onValueChange={([value]) => setData(prev => ({ ...prev, throttling: value }))}
                      max={100}
                      min={10}
                      step={10}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {data.throttling}% of normal send rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </BossCard>

            <BossCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Analytics & Tracking
                </CardTitle>
                <CardDescription>
                  Set up tracking and define success metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={data.trackingEnabled}
                      onChange={(e) => setData(prev => ({ ...prev, trackingEnabled: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Enable Click & Open Tracking</span>
                  </label>
                </div>

                <div>
                  <Label htmlFor="primary-goal">Primary Campaign Goal</Label>
                  <Input
                    id="primary-goal"
                    placeholder="e.g., Increase product awareness, Drive website traffic"
                    value={data.primaryGoal}
                    onChange={(e) => setData(prev => ({ ...prev, primaryGoal: e.target.value }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>UTM Parameters</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label className="text-sm">Source</Label>
                      <Input
                        placeholder="email"
                        value={data.utmParameters.source}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          utmParameters: { ...prev.utmParameters, source: e.target.value }
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Medium</Label>
                      <Input
                        placeholder="newsletter"
                        value={data.utmParameters.medium}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          utmParameters: { ...prev.utmParameters, medium: e.target.value }
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Campaign</Label>
                      <Input
                        placeholder="march-2024"
                        value={data.utmParameters.campaign}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          utmParameters: { ...prev.utmParameters, campaign: e.target.value }
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Content</Label>
                      <Input
                        placeholder="header-cta"
                        value={data.utmParameters.content}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          utmParameters: { ...prev.utmParameters, content: e.target.value }
                        }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                  <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Expected Performance
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-900">24%</div>
                      <div className="text-sm text-purple-700">Open Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-900">3.2%</div>
                      <div className="text-sm text-purple-700">Click Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-900">{data.audience.length * 1250}</div>
                      <div className="text-sm text-purple-700">Recipients</div>
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
                Save Campaign
              </BossButton>
              <BossButton 
                onClick={() => handleExport('pdf')}
                variant="accent"
              >
                Export
              </BossButton>
              <BossButton 
                variant="success"
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Campaign
              </BossButton>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </BaseTemplate>
  )
}
