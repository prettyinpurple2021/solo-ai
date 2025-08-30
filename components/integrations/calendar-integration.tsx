"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Calendar, 
  Clock, 
  CheckCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  calendarId: string
  calendarName: string
  isRecurring: boolean
  attendees?: string[]
}

interface CalendarIntegrationProps {
  className?: string
}

export function CalendarIntegration({ className = "" }: CalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connectedCalendars, setConnectedCalendars] = useState<string[]>([])
  const [syncEnabled, setSyncEnabled] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [_selectedCalendar, _setSelectedCalendar] = useState<string>('primary')
  const { toast } = useToast()

  useEffect(() => {
    // Check if user has connected calendars
    checkCalendarConnection()
  }, [checkCalendarConnection])

  const checkCalendarConnection = useCallback(async () => {
    try {
      // Simulate checking calendar connection
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - in real app, this would check actual calendar API
      const hasConnection = Math.random() > 0.5
      setIsConnected(hasConnection)
      
      if (hasConnection) {
        setConnectedCalendars(['primary', 'work', 'personal'])
        loadCalendarEvents()
      }
    } catch {
      console.error('Failed to check calendar connection')
    }
  }, [])

  const connectCalendar = async (provider: 'google' | 'outlook') => {
    setIsLoading(true)
    
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsConnected(true)
      setConnectedCalendars(['primary', 'work', 'personal'])
      
      toast({
        title: `✅ Connected to ${provider === 'google' ? 'Google' : 'Outlook'} Calendar!`,
        description: "Your calendar is now synced with SoloBoss AI",
      })
      
      loadCalendarEvents()
    } catch {
      toast({
        title: "❌ Connection failed",
        description: "Please try again or check your credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectCalendar = async () => {
    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsConnected(false)
      setConnectedCalendars([])
      setEvents([])
      
      toast({
        title: "Calendar disconnected",
        description: "Your calendar sync has been disabled",
      })
    } catch {
      toast({
        title: "Failed to disconnect",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCalendarEvents = async () => {
    try {
      // Simulate loading calendar events
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Team Standup',
          description: 'Daily team sync meeting',
          startTime: '2024-01-15T09:00:00Z',
          endTime: '2024-01-15T09:30:00Z',
          calendarId: 'work',
          calendarName: 'Work Calendar',
          isRecurring: true,
          attendees: ['team@company.com']
        },
        {
          id: '2',
          title: 'Client Meeting',
          description: 'Quarterly review with client',
          startTime: '2024-01-15T14:00:00Z',
          endTime: '2024-01-15T15:00:00Z',
          calendarId: 'work',
          calendarName: 'Work Calendar',
          isRecurring: false,
          attendees: ['client@example.com']
        },
        {
          id: '3',
          title: 'Focus Time',
          description: 'Deep work session',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T12:00:00Z',
          calendarId: 'personal',
          calendarName: 'Personal Calendar',
          isRecurring: false
        }
      ]
      
      setEvents(mockEvents)
    } catch {
      console.error('Failed to load calendar events')
    }
  }

  const syncTasksToCalendar = async () => {
    try {
      setIsLoading(true)
      
      // Simulate syncing tasks to calendar
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "✅ Tasks synced to calendar!",
        description: "Your tasks have been added to your calendar",
      })
    } catch {
      toast({
        title: "❌ Sync failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createCalendarEvent = async () => {
    try {
      setIsLoading(true)
      
      // Simulate creating calendar event
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "✅ Event created!",
        description: "New event added to your calendar",
      })
    } catch {
      toast({
        title: "❌ Failed to create event",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatEventTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Calendar Integration
        </CardTitle>
        <CardDescription>
          Sync your tasks and goals with your calendar for better time management
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <div>
              <p className="font-medium">
                {isConnected ? 'Calendar Connected' : 'Calendar Not Connected'}
              </p>
              <p className="text-sm text-gray-600">
                {isConnected 
                  ? `${connectedCalendars.length} calendars synced`
                  : 'Connect your calendar to sync tasks and events'
                }
              </p>
            </div>
          </div>
          
          {isConnected ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={disconnectCalendar}
              disabled={isLoading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => connectCalendar('google')}
                disabled={isLoading}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button 
                size="sm"
                onClick={() => connectCalendar('outlook')}
                disabled={isLoading}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Outlook
              </Button>
            </div>
          )}
        </div>

        {/* Sync Settings */}
        {isConnected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-sync tasks</p>
                <p className="text-sm text-gray-600">
                  Automatically add new tasks to your calendar
                </p>
              </div>
              <Switch 
                checked={autoSync} 
                onCheckedChange={setAutoSync}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-way sync</p>
                <p className="text-sm text-gray-600">
                  Sync calendar events back to tasks
                </p>
              </div>
              <Switch 
                checked={syncEnabled} 
                onCheckedChange={setSyncEnabled}
              />
            </div>
          </div>
        )}

        {/* Connected Calendars */}
        {isConnected && connectedCalendars.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Connected Calendars</h4>
            <div className="space-y-2">
              {connectedCalendars.map((calendar) => (
                <div 
                  key={calendar}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="capitalize">{calendar} Calendar</span>
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {isConnected && (
          <div className="space-y-3">
            <h4 className="font-medium">Quick Actions</h4>
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={syncTasksToCalendar}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Tasks
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={createCalendarEvent}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        )}

        {/* Recent Events */}
        {isConnected && events.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Recent Events</h4>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={loadCalendarEvents}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events.map((event) => (
                <div 
                  key={event.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{event.title}</span>
                      {event.isRecurring && (
                        <Badge variant="outline" className="text-xs">
                          Recurring
                        </Badge>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatEventDate(event.startTime)}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {event.calendarName}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {!isConnected && (
          <div className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
            <p className="font-medium mb-1">💡 Calendar Integration Benefits:</p>
            <ul className="space-y-1">
              <li>• Automatically sync tasks to your calendar</li>
              <li>• Block focus time for important tasks</li>
              <li>• Never miss deadlines with calendar reminders</li>
              <li>• Sync across all your devices</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
