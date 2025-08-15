"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function AuthWarning() {
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <Alert variant="destructive" className="m-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Development Notice:</strong> Stack Auth environment variables are not configured. 
        Authentication features will not work. Please check your .env.example file for setup instructions.
      </AlertDescription>
    </Alert>
  )
}