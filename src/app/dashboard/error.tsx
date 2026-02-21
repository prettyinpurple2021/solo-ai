'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logError } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    logError('Dashboard Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(10,10,10,1)_1px,transparent_1px),linear-gradient(90deg,rgba(10,10,10,1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] z-0 pointer-events-none opacity-20" />
      
      <Card className="w-full max-w-lg border border-red-500/50 bg-dark-card shadow-[0_0_50px_rgba(220,38,38,0.2)] relative z-10">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold font-orbitron text-white">System Malfunction</CardTitle>
            <CardDescription className="text-gray-400 font-mono">
              The dashboard encountered a critical rendering error.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-black/80 p-4 rounded-lg border border-red-500/20 text-xs text-red-300 font-mono overflow-auto max-h-60 shadow-inner">
            <p className="font-bold mb-2 text-red-400 uppercase tracking-widest border-b border-red-500/20 pb-1">Error Diagnostics</p>
            <p className="mb-4 text-red-200">{error.message || 'Unknown error'}</p>
            
            {error.digest && (
              <p className="opacity-70 mb-2 font-mono text-gray-500">Digest: {error.digest}</p>
            )}

            {error.stack && (
              <>
                <p className="font-bold mb-2 text-red-400 uppercase tracking-widest border-b border-red-500/20 pb-1 mt-4">Stack Trace</p>
                <div className="whitespace-pre-wrap opacity-70 text-gray-400">
                  {error.stack}
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-4 pt-6 border-t border-red-500/20">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="flex-1 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 hover:text-neon-cyan/80 font-mono"
          >
            <Home className="h-4 w-4 mr-2" />
            Return Base
          </Button>
          <Button 
            onClick={() => reset()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-mono shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reboot System
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
