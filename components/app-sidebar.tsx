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
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Boss Builder",
    email: "boss@soloboss.ai",
    avatar: "/placeholder-user.jpg",
  },
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
  projects: [
    {
      name: "Empire Builder Pro",
      url: "/dashboard/brand",
      icon: Frame,
    },
    {
      name: "Boss Automation",
      url: "/dashboard/focus",
      icon: PieChart,
    },
    {
      name: "Success Tracker",
      url: "/dashboard/slaylist",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
