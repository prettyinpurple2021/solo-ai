"use client"

export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Button} from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw, Home} from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center border-2 border-neon-magenta/50 rounded-sm shadow-[0_0_20px_rgba(255,0,110,0.3)]">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-neon-magenta/20 border-2 border-neon-magenta/50 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,0,110,0.3)]">
            <WifiOff className="w-8 h-8 text-neon-magenta" />
          </div>
          <CardTitle className="text-2xl font-bold font-orbitron uppercase tracking-wider text-white">
            You&apos;re Offline! 😱
          </CardTitle>
          <CardDescription className="text-gray-300 font-mono">
            Don&apos;t worry, boss! We can&apos;t connect to the internet right now, but your SoloSuccess AI platform is still here for you.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-neon-cyan/10 border-2 border-neon-cyan/50 rounded-sm p-4">
            <div className="flex items-start gap-3">
              <Wifi className="w-5 h-5 text-neon-cyan mt-0.5" />
              <div className="text-left">
                <h3 className="font-bold font-orbitron uppercase tracking-wider text-neon-cyan">What you can do:</h3>
                <ul className="text-sm text-gray-300 mt-2 space-y-1 font-mono">
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

          <div className="text-xs text-gray-500 pt-4 border-t-2 border-gray-700 font-mono">
            <p>💡 Pro tip: Enable offline mode in your browser settings for the best experience!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
