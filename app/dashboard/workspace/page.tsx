"use client"

export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useTemplates } from "@/hooks/use-templates-swr"
import { Card, CardContent,} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
, 
  Search, 
  Trash2, 
  Download, 
  Eye,
  FolderOpen,
  Calendar,
  ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TemplateRenderer } from "@/components/templates/template-renderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loading } from "@/components/ui/loading"

export default function WorkspacePage() {
  const router = useRouter()
  const { templates, isLoading, deleteTemplate, exportTemplate } = useTemplates()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const filteredTemplates = templates.filter(template =>
    template.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.template_slug?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link href="/dashboard/templates">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Templates
                  </Button>
                </Link>
              </div>
              <h1 className="text-4xl font-bold font-orbitron text-white mb-2">
                My Workspace 📁
              </h1>
              <p className="text-lg text-gray-400">
                View and manage your saved templates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan" className="border-neon-cyan/50 text-neon-cyan px-3 py-1">
                {templates.length} {templates.length === 1 ? 'template' : 'templates'}
              </Badge>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <label htmlFor="workspace-template-search" className="sr-only">
              Search templates
            </label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="workspace-template-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search templates"
              className="pl-10 bg-dark-bg border-neon-cyan/30 text-white placeholder:text-gray-500 focus:border-neon-cyan focus:ring-neon-cyan/20"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl bg-dark-card/30">
            <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold font-orbitron text-white mb-2">
              {searchQuery ? "No templates found" : "Your workspace is empty"}
            </h3>
            <p className="text-gray-400 mb-6 font-mono">
              {searchQuery 
                ? "Try adjusting your search query"
                : "Start by adding templates from the template library"
              }
            </p>
            {!searchQuery && (
              <Link href="/dashboard/templates">
                <Button className="bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold">
                  Browse Templates
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="bg-dark-card border-neon-cyan/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{getTemplateIcon(template.template_slug)}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold font-orbitron text-white mb-1 line-clamp-1">
                          {template.title}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3" />
                          {formatDate(template.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {template.description && (
                    <p className="text-sm text-gray-400 line-clamp-2 h-10 font-mono">
                      {template.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
                          onClick={() => setSelectedTemplate(template.template_slug)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-neon-cyan/50 text-white">
                        <DialogHeader>
                          <DialogTitle className="text-neon-cyan font-orbitron text-xl">{template.title}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          {selectedTemplate && (
                            <TemplateRenderer slug={selectedTemplate} />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportTemplate(template)}
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${template.title}"?`)) {
                          deleteTemplate(template.id)
                        }
                      }}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
