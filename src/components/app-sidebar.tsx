"use client"

import type * as React from "react"
import {
  Bot, GalleryVerticalEnd, SquareTerminal, Briefcase, Palette, Shield, CheckSquare, FileText, Eye, Focus, Users, GraduationCap, Sparkles, Trophy, MessageCircle,
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
      title: "The Academy",
      url: "/academy",
      icon: GraduationCap,
    },
    {
      title: "The Tribe",
      url: "/community",
      icon: MessageCircle,
    },
    {
      title: "The Sanctuary",
      url: "/sanctuary",
      icon: Sparkles,
    },
    {
      title: "Achievements",
      url: "/achievements",
      icon: Trophy,
    },
    {
      title: "Dev Tools",
      url: "/dev",
      icon: SquareTerminal,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Create user data with fallbacks for missing information
  const userData = {
    name: user?.name || user?.full_name || user?.email?.split('@')[0] || "SoloSuccess User",
    email: user?.email || "support@solosuccesss.com",
    avatar: user?.image || user?.avatar_url || "/default-user.svg", // Fixed prop name to image/avatar_url based on type
  }

  // Filter nav items based on role
  const filteredNavMain = data.navMain.filter(item => {
    if (item.url === "/dev") {
      return user?.role === 'admin';
    }
    return true;
  });

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
        <NavMain items={filteredNavMain} />
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
