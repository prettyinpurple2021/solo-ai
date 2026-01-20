"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsVisible(false);
      toast.success("App installation started!");
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className="p-4 flex items-start gap-4 shadow-lg border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Download className="w-6 h-6" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-sm">Install App</h3>
              <p className="text-xs text-muted-foreground">
                Install SoloSuccess for a better experience with offline access.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <Button 
            onClick={handleInstallClick} 
            size="sm" 
            className="w-full"
          >
            Install Now
          </Button>
        </div>
      </Card>
    </div>
  );
}
