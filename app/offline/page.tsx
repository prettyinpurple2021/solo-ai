"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            You're Offline! 😱
          </CardTitle>
          <CardDescription className="text-gray-600">
            Don't worry, boss! We can't connect to the internet right now, but your SoloBoss AI platform is still here for you.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Wifi className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h3 className="font-medium text-blue-900">What you can do:</h3>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• View cached pages and data</li>
                  <li>• Access your saved templates</li>
                  <li>• Review your goals and tasks</li>
                  <li>• Plan your next moves</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-xs text-gray-500 pt-4 border-t">
            <p>💡 Pro tip: Enable offline mode in your browser settings for the best experience!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
