"use client"

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { CyberButton } from "@/components/cyber/CyberButton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  FileText,
  Search,
  Clock,
  Users,
  Zap,
  Target,
  Briefcase,
  TrendingUp,
  Lightbulb,
  Crown,
  Sparkles,
  Eye,
  Download,
  Copy,
  CheckCircle,
  Star,
  Trash2
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { logger, logInfo } from "@/lib/logger"
import { useSmartTips } from "@/hooks/use-smart-tips"
import { HudBorder } from "@/components/cyber/HudBorder"
import { useTemplateSave } from "@/hooks/use-templates-swr"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface Template {
  id: string
  title: string
  description: string
  category: string
  tier: "launch" | "accelerator" | "dominator"
  estimatedTime: string
  difficulty: "beginner" | "intermediate" | "advanced"
  tags: string[]
  preview: string
  content: any
  usageCount: number
  rating: number
  isPremium: boolean
  isNew: boolean
  isPopular: boolean
  user_id: string
  template_slug?: string
}

// Helper to infer slug
const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const categories = [
  { id: "all", label: "All Categories", icon: FileText },
  { id: "business", label: "Business Strategy", icon: Target },
  { id: "marketing", label: "Marketing & Sales", icon: TrendingUp },
  { id: "finance", label: "Financial Planning", icon: Briefcase },
  { id: "operations", label: "Operations", icon: Zap },
  { id: "legal", label: "Legal & Compliance", icon: FileText },
  { id: "hr", label: "HR & Team", icon: Users },
  { id: "innovation", label: "Innovation", icon: Lightbulb },
]

const tiers = [
  { id: "all", label: "All Tiers" },
  { id: "launch", label: "Launch Plan" },
  { id: "accelerator", label: "Accelerator Plan" },
  { id: "dominator", label: "Dominator Plan" },
]

export default function TemplatesDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { saveTemplate, isSaving } = useTemplateSave()
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTier, setSelectedTier] = useState("all")
  const [usedTemplates, setUsedTemplates] = useState(new Set())

  // Smart tips configuration for templates
  const smartTipsConfig = {
    enabled: true,
    triggers: [
      {
        condition: () => {
          // Show tip if user hasn't used any templates yet
          return usedTemplates.size === 0 && templates.length > 0
        },
        tipId: 'template-discovery',
        delay: 10000,
        cooldown: 15 * 60 * 1000 // 15 minutes
      }
    ]
  }

  useSmartTips(smartTipsConfig)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/api/templates', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          const mappedTemplates = data.map((t: any) => ({
            ...t,
            template_slug: t.template_slug || toSlug(t.title),
            tier: t.tier || 'launch',
            estimatedTime: t.estimated_minutes ? `${t.estimated_minutes} min` : '15 min',
            difficulty: t.difficulty || 'beginner',
            tags: t.tags || [],
            preview: t.content ? t.content.substring(0, 100) + '...' : 'No preview available',
            usageCount: t.usage_count || 0,
            rating: t.rating ? Number(t.rating) : 0,
            isPremium: t.is_premium || false,
            isNew: t.created_at ? new Date(t.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 : false,
            isPopular: (t.usage_count || 0) > 50
          }))
          setTemplates(mappedTemplates)
          setFilteredTemplates(mappedTemplates)
        }
      } catch (error) {
        logError('Failed to fetch templates:', error)
        toast({
          title: "Error",
          description: "Failed to load templates. Please try again.",
          variant: "destructive"
        })
      }
    }

    fetchTemplates()
  }, [toast])

  useEffect(() => {
    let filtered = templates

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((template: Template) =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((template: Template) => template.category === selectedCategory)
    }

    // Filter by tier
    if (selectedTier !== "all") {
      filtered = filtered.filter((template: Template) => template.tier === selectedTier)
    }

    setFilteredTemplates(filtered)
  }, [templates, searchQuery, selectedCategory, selectedTier])

  const handleUseTemplate = async (template: Template) => {
    try {
      // Call API to save template to user workspace
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: template.title,
          description: template.description,
          content: template.content,
          category: template.category,
          template_slug: template.template_slug || toSlug(template.title),
          is_public: false
        })
      })

      if (response.ok) {
        setUsedTemplates(prev => new Set(prev).add(template.id))
        toast({
          title: "Template Added",
          description: "Template has been added to your workspace.",
        })
        // Optionally redirect to edit page
        // router.push(`/dashboard/templates/${newTemplateId}`)
      } else {
        throw new Error('Failed to save template')
      }
    } catch (error) {
      logError('Error using template:', error)
      toast({
        title: "Error",
        description: "Failed to add template to workspace.",
        variant: "destructive"
      })
    }
  }

  const handleEditTemplate = async (id: string, updates: Partial<Template>) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updated = await response.json()
        setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t))
        toast({
          title: "Template Updated",
          description: "Your template has been updated successfully.",
        })
      } else {
        throw new Error('Failed to update template')
      }
    } catch (error) {
      logError('Error updating template:', error)
      toast({
        title: "Error",
        description: "Failed to update template.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id))
        toast({
          title: "Template Deleted",
          description: "Your template has been deleted.",
        })
      } else {
        throw new Error('Failed to delete template')
      }
    } catch (error) {
      logError('Error deleting template:', error)
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive"
      })
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "launch": return <Sparkles className="h-4 w-4" />
      case "accelerator": return <Zap className="h-4 w-4" />
      case "dominator": return <Crown className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const userTier = user?.subscription_tier || "launch"

  const canAccessTemplate = (template: Template) => {
    if (template.tier === "launch") return true
    if (template.tier === "accelerator" && (userTier === "accelerator" || userTier === "dominator")) return true
    if (template.tier === "dominator" && userTier === "dominator") return true
    return false
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden p-6">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-orbitron font-bold text-white mb-2">
                TEMPLATE LIBRARY 📚
              </h1>
              <p className="text-lg text-gray-400 font-mono">
                Professional templates to accelerate your business growth
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-sm border border-neon-purple/30 text-neon-purple bg-neon-purple/10 font-mono rounded-none">
                {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <label htmlFor="template-library-search" className="sr-only">
                Search templates
              </label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="template-library-search"
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(e.target.value)}
                aria-label="Search templates"
                className="pl-10 bg-dark-card border-neon-cyan/30 text-white placeholder:text-gray-500 focus:border-neon-cyan rounded-none font-mono"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger
                className="w-full md:w-48 bg-dark-card border-neon-cyan/30 text-white rounded-none font-mono focus:ring-neon-cyan/50"
                aria-label="Filter templates by category"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-neon-cyan/30 rounded-none">
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id} className="text-white hover:bg-neon-cyan/10 focus:bg-neon-cyan/10 cursor-pointer font-mono">
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger
                className="w-full md:w-48 bg-dark-card border-neon-cyan/30 text-white rounded-none font-mono focus:ring-neon-cyan/50"
                aria-label="Filter templates by tier"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-neon-cyan/30 rounded-none">
                {tiers.map(tier => (
                  <SelectItem key={tier.id} value={tier.id} className="text-white hover:bg-neon-cyan/10 focus:bg-neon-cyan/10 cursor-pointer font-mono">
                    <div className="flex items-center gap-2">
                      {tier.id !== "all" && getTierIcon(tier.id)}
                      {tier.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template: Template) => {
            const hasAccess = canAccessTemplate(template)
            const isUsed = usedTemplates.has(template.id)

            return (
              <HudBorder key={template.id} variant="hover" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTierIcon(template.tier)}
                      <span className={`px-2 py-1 text-xs font-mono rounded-none border ${template.difficulty === "beginner" ? "bg-neon-lime/10 text-neon-lime border-neon-lime/30" :
                        template.difficulty === "intermediate" ? "bg-neon-orange/10 text-neon-orange border-neon-orange/30" :
                          "bg-neon-magenta/10 text-neon-magenta border-neon-magenta/30"
                        }`}>
                        {template.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {template.isNew && <span className="px-2 py-1 text-xs border border-neon-purple/30 text-neon-purple font-mono rounded-none bg-neon-purple/10">New</span>}
                      {template.isPopular && <span className="px-2 py-1 text-xs border border-neon-cyan/30 text-neon-cyan font-mono rounded-none bg-neon-cyan/10">Popular</span>}
                      {template.isPremium && <span className="px-2 py-1 text-xs border border-neon-magenta/30 text-neon-magenta font-mono rounded-none bg-neon-magenta/10">Premium</span>}
                    </div>
                  </div>
                  <h3 className="text-lg font-orbitron font-bold text-white">{template.title}</h3>
                  <p className="text-sm text-gray-400 font-mono line-clamp-2">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.estimatedTime}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {template.usageCount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {template.rating}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-neon-cyan/5 text-neon-cyan border border-neon-cyan/20 font-mono rounded-none">
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-neon-cyan/5 text-neon-cyan border border-neon-cyan/20 font-mono rounded-none">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {/* Public Template Actions */}
                    {template.user_id !== user?.id && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <CyberButton variant="ghost" size="sm" className="flex-1 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </CyberButton>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl bg-dark-card border-neon-cyan/30 rounded-none">
                            <DialogHeader>
                              <DialogTitle className="text-white font-orbitron">{template.title}</DialogTitle>
                              <DialogDescription className="text-gray-400 font-mono">
                                {template.description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-dark-bg/50 border border-neon-cyan/20 rounded-none">
                                <h4 className="font-medium mb-2 text-white font-orbitron">Template Preview:</h4>
                                <p className="text-sm text-gray-400 font-mono space-y-2 whitespace-pre-wrap">
                                  {template.preview}
                                </p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-400 font-mono">
                                  <span>⏱️ {template.estimatedTime}</span>
                                  <span>👥 {template.usageCount.toLocaleString()} uses</span>
                                  <span>⭐ {template.rating}</span>
                                </div>
                                <CyberButton
                                  onClick={() => handleUseTemplate(template)}
                                  disabled={!hasAccess || isSaving}
                                  variant="purple"
                                  className="bg-gradient-to-r from-neon-purple to-neon-magenta text-white hover:opacity-90 border-none"
                                >
                                  {isUsed ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Added
                                    </>
                                  ) : (
                                    <>
                                      <Download className="h-4 w-4 mr-2" />
                                      Add to Workspace
                                    </>
                                  )}
                                </CyberButton>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <CyberButton
                          onClick={() => handleUseTemplate(template)}
                          disabled={!hasAccess || isSaving}
                          size="sm"
                          variant="purple"
                          className="flex-1 bg-gradient-to-r from-neon-purple to-neon-magenta text-white hover:opacity-90 border-none"
                        >
                          {isUsed ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Added
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Add
                            </>
                          )}
                        </CyberButton>
                      </>
                    )}

                    {/* Owned Users Template Actions */}
                    {template.user_id === user?.id && (
                       <CyberButton
                          onClick={() => router.push(`/dashboard/templates/${template.id}`)}
                          variant="purple"
                          size="sm"
                          className="flex-1 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Open Editor
                        </CyberButton>
                    )}
                  </div>

                  {template.user_id === user?.id && (
                    <div className="flex gap-2 pt-2 border-t border-neon-cyan/20 mt-2">
                       <Dialog>
                        <DialogTrigger asChild>
                          <CyberButton variant="ghost" size="sm" className="flex-1 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                            Edit Info
                          </CyberButton>
                        </DialogTrigger>
                        <DialogContent className="bg-dark-card border-neon-cyan/30 rounded-none">
                          <DialogHeader>
                            <DialogTitle className="text-white font-orbitron">Edit Template Info</DialogTitle>
                          </DialogHeader>
                          <EditTemplateForm template={template} onSave={handleEditTemplate} />
                        </DialogContent>
                      </Dialog>

                      <CyberButton
                        variant="destructive"
                        size="sm"
                        className="flex-1 bg-neon-magenta hover:bg-neon-magenta/90"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </CyberButton>
                    </div>
                  )}

                  {!hasAccess && (
                    <div className="text-xs text-gray-400 text-center pt-2 font-mono">
                      Upgrade to {template.tier} plan to access this template
                    </div>
                  )}
                </div>
              </HudBorder>
            )
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-orbitron font-bold mb-2 text-white">No templates found</h3>
            <p className="text-gray-400 font-mono">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function EditTemplateForm({ template, onSave }: { template: any, onSave: (id: string, data: any) => void }) {
  const [title, setTitle] = useState(template.title)
  const [description, setDescription] = useState(template.description)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-neon-cyan font-mono uppercase">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-dark-bg border-neon-cyan/30 text-white focus:border-neon-cyan rounded-none font-mono"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-neon-cyan font-mono uppercase">Description</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-dark-bg border-neon-cyan/30 text-white focus:border-neon-cyan rounded-none font-mono"
        />
      </div>
      <CyberButton
        onClick={() => onSave(template.id, { title, description })}
        className="w-full bg-neon-purple hover:bg-neon-purple/90 text-white"
        variant="purple"
      >
        Save Changes
      </CyberButton>
    </div>
  )
}