"use client";

import { logError,} from '@/lib/logger'
import { useEffect} from "react";
import { Button} from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw} from "lucide-react";


export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    logError("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-dark-bg">
      <Card className="w-full max-w-lg border-2 border-neon-magenta/50 rounded-sm shadow-[0_0_20px_rgba(255,0,110,0.3)]">
        <CardHeader>
          <div className="flex items-center gap-2 text-neon-magenta mb-2">
            <AlertCircle className="h-6 w-6" />
            <CardTitle className="text-xl font-orbitron uppercase tracking-wider text-white">Something went wrong</CardTitle>
          </div>
          <CardDescription className="text-gray-300 font-mono">
            We've encountered an unexpected error. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-dark-bg p-4 rounded-sm border-2 border-gray-700 text-sm text-gray-300 font-mono overflow-auto max-h-40">
            {error?.message || "Unknown error"}
            {error?.digest && (
              <div className="mt-2 text-xs text-gray-500 font-mono">
                Error ID: {error.digest}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 border-2 border-gray-700 text-gray-300 hover:border-neon-cyan hover:text-neon-cyan font-mono font-bold uppercase tracking-wider rounded-sm"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
          <Button 
            onClick={() => reset()}
            variant="purple"
            className="flex items-center gap-2 font-mono font-bold uppercase tracking-wider rounded-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
