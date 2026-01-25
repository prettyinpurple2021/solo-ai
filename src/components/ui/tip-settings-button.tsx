"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TipSettings } from "@/components/ui/tip-settings"
import { Lightbulb } from "lucide-react"

export function TipSettingsButton() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSettings(true)}
        className="flex items-center gap-2"
      >
        <Lightbulb className="h-4 w-4" />
        Tip Settings
      </Button>
      
      <TipSettings
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  )
}
