'use client'


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function AuthExamplePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-pink-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-pink-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="boss-text-gradient text-4xl font-bold mb-4">
            SoloBoss AI Authentication
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the new authentication system with our custom design system. 
            Punk rock meets professional - just like your business approach.
          </p>
        </div>

        {/* Migration components removed */}

        {/* Main Authentication Component */}
        <div className="max-w-md mx-auto mb-8">
          <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
            <CardHeader>
              <CardTitle className="boss-text-gradient text-xl font-bold">
                🔥 Custom Auth Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                This project uses a custom authentication system with JWT tokens and Neon PostgreSQL.
                The system provides secure login, registration and session management.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">• Custom sign-in page at /signin</p>
                <p className="text-sm text-gray-500">• Custom sign-up page at /signup</p>
                <p className="text-sm text-gray-500">• Protected profile page at /profile</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
            <CardHeader>
              <CardTitle className="boss-text-gradient text-xl font-bold">
                🔥 Seamless Migration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your existing data is automatically migrated from Supabase to Neon PostgreSQL.
                No data loss, no interruption to your workflow.
              </p>
            </CardContent>
          </Card>

          <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
            <CardHeader>
              <CardTitle className="boss-text-gradient text-xl font-bold">
                ✨ Enhanced Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Enterprise-grade security with multi-factor authentication, 
                session management, and advanced user controls.
              </p>
            </CardContent>
          </Card>

          <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
            <CardHeader>
              <CardTitle className="boss-text-gradient text-xl font-bold">
                🎨 Custom Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Beautiful authentication components that match your SoloBoss 
                brand identity and design system.
              </p>
            </CardContent>
          </Card>

          <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
            <CardHeader>
              <CardTitle className="boss-text-gradient text-xl font-bold">
                🚀 Better Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Faster authentication flows, reduced loading times, 
                and improved user experience across all devices.
              </p>
            </CardContent>
          </Card>

          <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
            <CardHeader>
              <CardTitle className="boss-text-gradient text-xl font-bold">
                📱 Mobile Optimized
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Responsive design that works perfectly on desktop, 
                tablet, and mobile devices with touch-friendly interactions.
              </p>
            </CardContent>
          </Card>

          <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
            <CardHeader>
              <CardTitle className="boss-text-gradient text-xl font-bold">
                🔄 Easy Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Simple integration with your existing workflows. 
                Drop-in components that work with your current setup.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Design System Showcase */}
        <div className="mt-16">
          <h2 className="boss-text-gradient text-3xl font-bold text-center mb-8">
            Design System Showcase
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Color Palette */}
            <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Color Palette</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-soloboss"></div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-soloboss-light"></div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-empowerment"></div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Primary: Purple to Pink gradient</p>
                  <p>Secondary: Light purple gradient</p>
                  <p>Accent: Empowerment gradient</p>
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Typography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <h1 className="boss-text-gradient text-2xl font-bold">Boss Heading</h1>
                <h2 className="text-xl font-semibold text-gray-900">Regular Heading</h2>
                <p className="text-gray-600">Body text with proper hierarchy</p>
                <p className="text-sm text-gray-500">Small text for details</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-500">
            Ready to build your empire? Sign up now and start dominating with SoloBoss AI! 🚀
          </p>
        </div>
      </div>
    </div>
  )
} 