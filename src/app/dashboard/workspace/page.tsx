"use client"

export const dynamic = 'force-dynamic'

import { useState, useMemo } from "react"
import { useTemplates } from "@/hooks/use-templates-swr"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Trash2, 
  Download, 
  Eye,
  FolderOpen,
  Calendar,
  ArrowLeft,
  Clock,
  TrendingUp,
  Filter
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TemplateRenderer } from "@/components/templates/template-renderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loading } from "@/components/ui/loading"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function WorkspacePage() {
  const router = useRouter()
  const { templates, isLoading, deleteTemplate, exportTemplate } = useTemplates()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  const categories = useMemo(() => {
    const cats = new Set(templates.map(t => t.category || "General"))
    return Array.from(cats).sort()
  }, [templates])

  const { filteredTemplates, stats } = useMemo(() => {
    let filtered = [...templates]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(t => 
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.template_slug?.toLowerCase().includes(q)
      )
    }

    // Category Filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(t => (t.category || "General") === categoryFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      if (sortBy === "alphabetical") {
        return (a.title || "").localeCompare(b.title || "")
      }
      // newest default
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Stats
    const total = templates.length
    // Assume average template saves 30 minutes
    const timeSavedHrs = (total * 30) / 60
    
    // Most active category
    const catCounts: Record<string, number> = {}
    templates.forEach(t => {
      const cat = t.category || "General"
      catCounts[cat] = (catCounts[cat] || 0) + 1
    })
    const topCategory = Object.keys(catCounts).reduce((a, b) => catCounts[a] > catCounts[b] ? a : b, "None")

    return {
      filteredTemplates: filtered,
      stats: { total, timeSavedHrs, topCategory }
    }
  }, [templates, searchQuery, categoryFilter, sortBy])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const getTemplateIcon = (slug: string) => {
    const iconMap: Record<string, string> = {
      'decision-dashboard': '🎯',
      'delegation-list-builder': '📋',
      'i-hate-this-tracker': '⚠️',
      'quarterly-biz-review': '📊',
      'business-plan': '📈',
      'content-calendar': '📅',
      'saas-metrics': '📊',
      'product-roadmap': '🗺️',
      'customer-interview': '💬',
      'fundraising-pitch': '💰',
    }
    return iconMap[slug] || '📄'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <Loading variant="pulse" text="Loading workspace..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden p-6 font-mono">
      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-magenta/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard/templates">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </Button>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-blue-500 mb-2">
                Workspace
              </h1>
              <p className="text-lg text-gray-400 max-w-xl">
                Your dedicated hub for saved strategies, trackers, and dynamic documents.
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex shrink-0">
               <Link href="/dashboard/templates">
                <Button className="bg-neon-cyan text-black hover:bg-neon-cyan/80 font-bold border border-neon-cyan/50 shadow-[0_0_15px_rgba(11,228,236,0.3)] transition-all">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        {stats.total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <Card className="bg-dark-card/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-neon-cyan/10 rounded-lg text-neon-cyan">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Documents</p>
                  <p className="text-2xl font-bold text-white font-orbitron">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-dark-card/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-neon-magenta/10 rounded-lg text-neon-magenta">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Est. Time Saved</p>
                  <p className="text-2xl font-bold text-white font-orbitron">{stats.timeSavedHrs.toFixed(1)} hrs</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-dark-card/50 border-gray-800 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-neon-lime/10 rounded-lg text-neon-lime">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Top Category</p>
                  <p className="text-2xl font-bold text-white font-orbitron capitalize">{stats.topCategory}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Toolbar: Search, Filter, Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-dark-card/40 p-4 rounded-xl border border-gray-800/50 backdrop-blur-sm">
          <div className="relative flex-1">
            <label htmlFor="workspace-template-search" className="sr-only">Search templates</label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="workspace-template-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your documents..."
              className="pl-10 bg-black/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="w-full md:w-[180px]">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-black/50 border-gray-700 h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-[180px]">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-black/50 border-gray-700 h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-700 rounded-2xl bg-dark-card/20 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-900 mb-6 border border-gray-800">
              <FolderOpen className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold font-orbitron text-white mb-3">
              {searchQuery || categoryFilter !== 'all' ? "No Matches Found" : "Empty Workspace"}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg leading-relaxed">
              {searchQuery || categoryFilter !== 'all' 
                ? "We couldn't find any documents matching your current filters. Try resetting them."
                : "Your workspace is a blank slate. Head over to the template catalog to add powerful, interactive tools."
              }
            </p>
            {searchQuery || categoryFilter !== 'all' ? (
              <Button 
                variant="outline" 
                onClick={() => { setSearchQuery(""); setCategoryFilter("all"); setSortBy("newest"); }}
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                Clear Filters
              </Button>
            ) : (
              <Link href="/dashboard/templates">
                <Button className="bg-white text-black hover:bg-gray-200 font-bold px-8">
                  Explore Templates
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="group bg-dark-card border-gray-800 hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(11,228,236,0.15)] transition-all duration-500 overflow-hidden flex flex-col h-full">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                          {getTemplateIcon(template.template_slug)}
                        </span>
                      </div>
                      <Badge variant="outline" className="border-neon-cyan/30 text-neon-cyan bg-neon-cyan/5 capitalize font-mono text-xs px-2 py-0.5">
                        {template.category || "General"}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold font-orbitron text-white mb-2 group-hover:text-neon-cyan transition-colors line-clamp-2">
                      {template.title}
                    </h3>

                    {template.description && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                        {template.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
                      <Calendar className="h-3 w-3" />
                      <span>Saved {formatDate(template.created_at)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-900/50 border-t border-gray-800 flex items-center justify-between gap-2 mt-auto">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex-1 text-gray-300 hover:text-white hover:bg-neon-cyan/10 hover:border-transparent transition-all"
                          onClick={() => setSelectedTemplate(template.template_slug)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-black border-neon-cyan/50 text-white rounded-xl">
                        <DialogHeader>
                          <DialogTitle className="text-neon-cyan font-orbitron text-2xl">{template.title}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          {selectedTemplate && (
                            <TemplateRenderer slug={selectedTemplate} />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => exportTemplate(template)}
                        className="text-gray-400 hover:text-neon-lime hover:bg-neon-lime/10"
                        title="Export Data"
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${template.title}" from your workspace?`)) {
                            deleteTemplate(template.id)
                          }
                        }}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
