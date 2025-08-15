"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@stackframe/stack"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useUser()
  const loading = !user
  const router = useRouter()

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-lg font-medium">Loading your SoloBoss empire...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full">
        <div className="rounded-xl p-[2px] soloboss-gradient animate-gradient mb-6">
          <div className="rounded-xl bg-background/70 backdrop-blur border-2 border-purple-200 px-4 py-6">
            <h2 className="text-2xl font-bold boss-text-gradient">Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">Own your day. Build your empire.</p>
          </div>
        </div>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
