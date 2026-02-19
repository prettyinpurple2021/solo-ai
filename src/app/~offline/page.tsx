"use client";

import Link from "next/link";
import { WifiOff, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background text-foreground">
      <div className="p-6 rounded-full bg-muted mb-6 animate-pulse">
        <WifiOff className="w-12 h-12 text-muted-foreground" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2 font-orbitron">You are Offline</h1>
      
      <p className="text-muted-foreground mb-8 max-w-md">
        It seems like you lost your internet connection. 
        Don't worry, some parts of the app may still be accessible.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Button onClick={handleRetry} className="w-full gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
        
        <Button variant="outline" asChild className="w-full gap-2">
          <Link href="/dashboard">
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
