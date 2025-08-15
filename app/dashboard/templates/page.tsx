"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "@/components/ui/section-header"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import { Search, Plus, Grid, List, Filter, FileText, Sparkles } from "lucide-react"
import Link from "next/link"

export default function TemplatesPage() {
  const SavedTemplatesList = dynamic(
    () => import("@/components/templates/saved-templates-list").then(m => m.SavedTemplatesList),
    { ssr: false, loading: () => <div className="text-muted-foreground">Loading saved templates…</div> }
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  const templateCategories = [
    {
      id: "business",
      name: "Business Operations",
      count: 12,
      description: "Templates for business planning, decision making, and operations",
      icon: "🏢",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      id: "productivity",
      name: "Productivity & Planning",
      count: 8,
      description: "Task management, goal setting, and productivity templates",
      icon: "✅",
      color: "bg-green-50 text-green-700 border-green-200"
    },
    {
      id: "marketing",
      name: "Marketing & Sales",
      count: 15,
      description: "Sales funnels, marketing campaigns, and customer outreach",
      icon: "📈",
      color: "bg-purple-50 text-purple-700 border-purple-200"
    },
    {
      id: "finance",
      name: "Financial Planning",
      count: 6,
      description: "Budget tracking, financial analysis, and investment planning",
      icon: "💰",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200"
    }
  ]

  const quickActions = [
    {
      title: "Create Custom Template",
      description: "Build your own template from scratch",
      icon: Plus,
      href: "/templates/create",
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    {
      title: "Browse All Templates",
      description: "Explore our full template library",
      icon: Grid,
      href: "/templates",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500"
    }
  ]

  return (
    <ProtectedRoute>
      <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Templates</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* Header Section */}
        <SectionHeader
          variant="gradient"
          title="Templates"
          description="Manage your saved templates and discover new ones"
          icon={<FileText className="h-6 w-6" />}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/templates">
                  <Grid className="mr-2 h-4 w-4" />
                  Browse All
                </Link>
              </Button>
              <Button asChild>
                <Link href="/templates/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Link>
              </Button>
            </div>
          }
        />

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          {quickActions.map((action) => (
            <Card key={action.title} className="boss-card">
              <CardContent className="p-6">
                <Link href={action.href} className="block">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Template Categories */}
        <div>
          <SectionHeader
            variant="subtle"
            title="Template Categories"
            icon={<Sparkles className="h-5 w-5" />}
            badge={<Badge variant="default">{templateCategories.reduce((acc, cat) => acc + cat.count, 0)} templates available</Badge>}
          />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {templateCategories.map((category) => (
              <Card key={category.id} className="boss-card cursor-pointer" 
                onClick={() => toast.success(`${category.name} templates coming soon!`)}>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold mb-2 gradient-text-secondary">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  <Badge className={category.color}>{category.count} templates</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search saved templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("Filters coming soon!")}>
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Saved Templates */}
        <SavedTemplatesList />
      </div>
    </SidebarInset>
    </ProtectedRoute>
  )
}