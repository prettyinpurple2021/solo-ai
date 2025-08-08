"use client"

import type * as React from "react"
import {
  AudioWaveform,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  SquareTerminal,
  Briefcase,
  Palette,
  Target,
  Shield,
  CheckSquare,
  FileText,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { useUser } from "@stackframe/stack"

// This is sample data.
const data = {
  teams: [
    {
      name: "SoloBoss AI",
      logo: GalleryVerticalEnd,
      plan: "Empire Builder",
    },
    {
      name: "My Empire",
      logo: AudioWaveform,
      plan: "Dominator",
    },
    {
      name: "Boss Squad",
      logo: Command,
      plan: "Accelerator",
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
      url: "/team",
      icon: Bot,
    },
    {
      title: "Briefcase",
      url: "/dashboard/briefcase",
      icon: Briefcase,
    },
    {
      title: "Templates",

      url: "/templates",

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
      icon: Target,
    },
    {
      title: "Burnout Shield",
      url: "/dashboard/burnout",
      icon: Shield,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useUser()
  
  // Create user data with fallbacks for missing information
  const userData = {
    name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "SoloBoss User",
    email: user?.email || "user@soloboss.ai",
    avatar: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "/default-user.svg",
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
