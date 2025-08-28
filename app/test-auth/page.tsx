"use client"

// Force dynamic rendering to avoid static generation issues with StackAuth
export const dynamic = 'force-dynamic'

import { useUser, useStackApp } from "@stackframe/stack"
import { useSafeUser, useSafeStackApp } from "@/hooks/use-safe-stack"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TestAuthPage() {
  const user = useSafeUser()
  const stackApp = useSafeStackApp()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // If StackAuth is not available (during SSR/build), show loading
  if (!stackApp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading authentication status...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
            <CardDescription>You are not authenticated</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/signin'}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Test</h1>
          <p className="text-gray-600">Your authentication is working correctly!</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Details from Stack Auth</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="text-sm text-gray-900">{user.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{user.primaryEmail || user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Display Name</label>
                <p className="text-sm text-gray-900">{user.displayName || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Avatar URL</label>
                <p className="text-sm text-gray-900">{user.avatarUrl || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="success">Authenticated</Badge>
              <Badge variant="outline">Stack Auth</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
            <CardDescription>Test various functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
              <Button onClick={() => window.location.href = '/dashboard/agents'}>
                Test AI Agents
              </Button>
              <Button onClick={() => window.location.href = '/dashboard/briefcase'}>
                Test Briefcase
              </Button>
              <Button variant="outline" onClick={() => stackApp?.signOut()}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Test</CardTitle>
            <CardDescription>Test API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={async () => {
                try {
                  const response = await fetch('/api/dashboard')
                  if (response.ok) {
                    alert('Dashboard API working!')
                  } else {
                    alert('Dashboard API failed: ' + response.status)
                  }
                } catch (error) {
                  alert('Dashboard API error: ' + error)
                }
              }}
            >
              Test Dashboard API
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
