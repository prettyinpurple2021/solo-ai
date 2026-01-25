"use client"

import type React from "react"
import { useState} from "react"
import { Button} from "@/components/ui/button"
import { Input} from "@/components/ui/input"
import { Label} from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import { Calendar, Clock, Loader2} from "lucide-react"
import { toast } from "sonner"

interface ScheduleDemoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ScheduleDemoModal({ isOpen, onClose }: ScheduleDemoModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, type: 'demo_request' })
      })

      if (!response.ok) throw new Error('Failed to submit')

      toast.success("Demo request submitted! We'll contact you soon.")
      setName("")
      setEmail("")
      onClose()
    } catch (error) {
      toast.error("Failed to submit request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Calendar className="h-6 w-6 text-purple-600" />
            Schedule Your Demo
          </DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" />
            Request a Personalized Demo
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Get a tailored demonstration of SoloSuccess AI and see how it can transform your business.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Request Demo"
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
