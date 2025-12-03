'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, Check, RefreshCw, X, ExternalLink, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  isAllDay: boolean
  location?: string
  description?: string
  attendees?: string[]
}

export function CalendarIntegration() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [lastSynced, setLastSynced] = useState<Date | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Check connection status on mount
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      // Try to fetch events as a proxy for checking connection
      const response = await fetch('/api/integrations/google/calendar?action=events')
      if (response.ok) {
        setIsConnected(true)
        setLastSynced(new Date())
        // If connected, load events
        loadCalendarEvents()
      } else {
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Failed to check calendar connection', error)
      setIsConnected(false)
    }
  }

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      // Get Auth URL from our API
      const response = await fetch('/api/integrations/google/calendar?action=auth_url')
      const data = await response.json()
      
      if (data.url) {
        // Redirect to Google OAuth
        window.location.href = data.url
      } else {
        toast.error('Failed to initiate Google Calendar connection')
      }
    } catch (error) {
      console.error('Connection error:', error)
      toast.error('Failed to connect to Google Calendar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    try {
      // Call API to remove tokens (not fully implemented in this step, but UI should reflect intent)
      // await fetch('/api/integrations/google/calendar', { method: 'DELETE' })
      
      setIsConnected(false)
      setEvents([])
      setLastSynced(null)
      toast.success('Calendar disconnected')
    } catch (error) {
      toast.error('Failed to disconnect calendar')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCalendarEvents = async () => {
    if (!isConnected) return

    setSyncing(true)
    try {
      const response = await fetch('/api/integrations/google/calendar?action=events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
        setLastSynced(new Date())
        toast.success('Calendar synced successfully')
      } else {
        // If we get a 401/404 here, it might mean the token expired or was revoked
        if (response.status === 401 || response.status === 404) {
             setIsConnected(false)
        }
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Failed to sync calendar events')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            <CardTitle>Google Calendar</CardTitle>
          </div>
          {isConnected && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Check className="mr-1 h-3 w-3" /> Connected
            </Badge>
          )}
        </div>
        <CardDescription>
          Sync your tasks and deadlines with Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
            <div className="p-3 bg-blue-50 rounded-full">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">Connect your calendar</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Automatically sync your tasks, deadlines, and milestones to your Google Calendar.
              </p>
            </div>
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>Connect Google Calendar</>
              )}
            </Button>
            
            <Alert variant="default" className="bg-amber-50 border-amber-200 mt-4">
              <AlertTitle className="text-amber-800">Configuration Required</AlertTitle>
              <AlertDescription className="text-amber-700 text-xs">
                This feature requires Google Calendar API keys in your .env file.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Last synced: {lastSynced ? lastSynced.toLocaleTimeString() : 'Never'}
              </span>
              <Button variant="ghost" size="sm" onClick={loadCalendarEvents} disabled={syncing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
            </div>

            <div className="border rounded-md divide-y">
              {events.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No upcoming events found
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="p-3 flex items-start justify-between hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.start).toLocaleString()}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-50" />
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <X className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
