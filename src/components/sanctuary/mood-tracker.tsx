"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Battery, BatteryCharging, BatteryWarning, BatteryFull, BatteryMedium } from "lucide-react"

export function MoodTracker() {
  const [energy, setEnergy] = useState([3])
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleLog = async () => {
    setLoading(true)
    try {
        const res = await fetch('/api/wellness/mood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                energyLevel: energy[0],
                note,
                moodLabel: getMoodLabel(energy[0])
            })
        })

        if (res.ok) {
            toast.success("Mood logged. Take care of yourself!")
            setSubmitted(true)
        } else {
            toast.error("Failed to log mood")
        }
    } catch (error) {
        console.error(error)
        toast.error("Error logging mood")
    } finally {
        setLoading(false)
    }
  }

  const getMoodLabel = (level: number) => {
      if (level === 1) return "Exhausted"
      if (level === 2) return "Tired"
      if (level === 3) return "Okay"
      if (level === 4) return "Good"
      return "Energized"
  }

  const getIcon = (level: number) => {
      if (level === 1) return <BatteryWarning className="w-8 h-8 text-red-500" />
      if (level === 2) return <Battery className="w-8 h-8 text-orange-500" />
      if (level === 3) return <BatteryMedium className="w-8 h-8 text-yellow-500" />
      if (level === 4) return <BatteryCharging className="w-8 h-8 text-lime-500" />
      return <BatteryFull className="w-8 h-8 text-green-500" />
  }

  if (submitted) {
      return (
          <div className="p-6 text-center border rounded-xl bg-muted/20">
              <h3 className="text-lg font-medium">Check-in Complete</h3>
              <p className="text-muted-foreground">Thanks for tracking your energy.</p>
              <Button variant="link" onClick={() => setSubmitted(false)}>Log another</Button>
          </div>
      )
  }

  return (
    <div className="space-y-6 p-6 border rounded-xl bg-card">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg flex items-center gap-2">
            Energy Pulse
        </h3>
        <p className="text-sm text-muted-foreground">How are you feeling right now?</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 py-4">
          {getIcon(energy[0])}
          <span className="font-medium text-lg">{getMoodLabel(energy[0])}</span>
      </div>

      <div className="space-y-4">
        <Slider
            value={energy}
            onValueChange={setEnergy}
            min={1}
            max={5}
            step={1}
            className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Drained</span>
            <span>Unstoppable</span>
        </div>
      </div>

      <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Textarea 
            placeholder="What's consuming your energy?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="h-20"
          />
      </div>

      <Button onClick={handleLog} disabled={loading} className="w-full">
          {loading ? "Logging..." : "Log Check-in"}
      </Button>
    </div>
  )
}
