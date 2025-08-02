"use client"

import Link from "next/link"
import { Folder, Forward, MoreHorizontal, Trash2, Plus, FolderOpen, Briefcase, Target, Palette } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const iconMap = {
  Folder,
  FolderOpen,
  Briefcase,
  Target,
  Palette,
}

interface Project {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  status: "active" | "archived" | "completed"
  created_at: string
  updated_at: string
}

export function NavProjects() {
  const { isMobile } = useSidebar()
  const { projects, loading } = useProjects()

  // Filter only active projects for the sidebar
  const activeProjects = projects.filter(project => project.status === 'active')

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName as keyof typeof iconMap] || Folder
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {/* Add "Manage Projects" link */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/dashboard/projects">
              <Plus className="h-4 w-4" />
              <span>Manage Projects</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        {/* Show loading state */}
        {loading && (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <Folder className="h-4 w-4 animate-pulse" />
              <span>Loading...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {/* Show user projects */}
        {!loading && activeProjects.map((project: Project) => {
          const IconComponent = getIconComponent(project.icon)
          return (
            <SidebarMenuItem key={project.id}>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/projects">
                  <IconComponent 
                    className="h-4 w-4" 
                    style={{ color: project.color }}
                  />
                  <span>{project.name}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/projects">
                      <Folder className="text-muted-foreground" />
                      <span>View Projects</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward className="text-muted-foreground" />
                    <span>Share Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Trash2 className="text-muted-foreground" />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}

        {/* Show empty state */}
        {!loading && activeProjects.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard/projects">
                <Folder className="h-4 w-4 opacity-50" />
                <span className="opacity-50">No projects yet</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
