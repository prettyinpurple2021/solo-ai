"use client"

import type { ReactNode } from 'react'
import { useState } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import DashboardHeader from "@/components/DashboardHeader"
import MobileNavigation from "@/components/mobile/mobile-navigation"
import { useAuth } from "@/hooks/use-auth"
import { ProfileModal } from "@/components/profile/profile-modal"
import { EnhancedProfileModal } from "@/components/profile/enhanced-profile-modal"
import { PageTransition } from "@/components/layout/PageTransition"



export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Transform user data for MobileNavigation
  const mobileNavUser = user ? {
    name: (user as any).name || (user as any).full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar: user.avatar_url || '',
    level: (user as any).level || 1,
    points: (user as any).points || 0
  } : undefined

  const subscriptionTier = ((user as any)?.subscription_tier || 'free').toLowerCase()
  const isPaidTier = subscriptionTier !== 'free' && subscriptionTier !== 'launch'

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen bg-cyber-black border-0 w-full overflow-x-hidden">
        <div className="hidden lg:block">
          <DashboardHeader onOpenProfile={() => setIsProfileOpen(true)} />
        </div>
        <main className="flex-1 p-0 pb-20 lg:pb-0 w-full overflow-x-hidden">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <MobileNavigation user={mobileNavUser} />
        {user && (
          isPaidTier ? (
            <EnhancedProfileModal
              _open={isProfileOpen}
              onOpenChangeAction={setIsProfileOpen}
            />
          ) : (
            <ProfileModal
              open={isProfileOpen}
              onOpenChange={setIsProfileOpen}
            />
          )
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
