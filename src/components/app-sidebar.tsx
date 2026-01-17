"use client"

import type * as React from "react"
import {
  Bot, GalleryVerticalEnd, SquareTerminal, Briefcase, Palette, Target, Shield, CheckSquare, FileText, Eye, Focus, Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { TipSettingsButton } from "@/components/ui/tip-settings-button"

// Production data - will be fetched from user's actual teams
const data = {
  teams: [
    {
      name: "SoloSuccess AI",
      logo: GalleryVerticalEnd,
      plan: "Scale",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "SlayList",
      url: "/dashboard/slaylist",
      icon: CheckSquare,
    },
    {
      title: "AI Squad",
      url: "/dashboard/agents",
      icon: Bot,
    },
    {
      title: "The Nexus",
      url: "/dashboard/nexus",
      icon: Users,
    },
    {
      title: "Competitor Intel",
      url: "/dashboard/competitors",
      icon: Eye,
    },
    {
      title: "Briefcase",
      url: "/dashboard/briefcase",
      icon: Briefcase,
    },
    {
      title: "Templates",
      url: "/dashboard/templates",
      icon: FileText,
    },
    {
      title: "Brand Studio",
      url: "/dashboard/brand",
      icon: Palette,
    },
    {
      title: "Focus Mode",
      url: "/dashboard/focus",
      icon: Focus,
    },
    {
      title: "Burnout Shield",
      url: "/dashboard/burnout",
      icon: Shield,
    },
    {
      title: "Idea Incinerator",
      url: "/dashboard/incinerator",
      icon: Target,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Create user data with fallbacks for missing information
  const userData = {
    name: (user as any)?.name || (user as any)?.full_name || user?.email?.split('@')[0] || "SoloSuccess User",
    email: user?.email || "user@solobossai.fun",
    avatar: user?.avatar_url || "/default-user.svg",
  }

  return (
    <Sidebar
      collapsible="icon"
      className="bg-dark-bg/95 backdrop-blur-xl border-r border-neon-cyan/20"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent className="text-gray-300">
        <NavMain items={data.navMain} />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter className="text-gray-300">
        <div className="p-2">
          <TipSettingsButton />
        </div>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
