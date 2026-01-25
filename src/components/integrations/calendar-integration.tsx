"use client"

import { logError, logInfo } from '@/lib/logger'
import { useState, useEffect, useCallback} from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card'
import { Button} from '@/components/ui/button'
import { Badge} from '@/components/ui/badge'
import { Switch} from '@/components/ui/switch'
import { 
  Calendar, Clock, CheckCircle, XCircle, ExternalLink, Settings, RefreshCw, Plus} from 'lucide-react'
import { useToast} from '@/hooks/use-toast'


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
  const [calendarInfo, setCalendarInfo] = useState<{ email?: string; name?: string }>({})
  const { toast } = useToast()

  const checkCalendarConnection = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('/api/integrations/google/calendar?action=status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsConnected(data.connected)
        
        if (data.connected) {
          setCalendarInfo({
            email: data.email,
            name: data.name
          })
          // Fetch calendars and events
          await loadCalendarEvents()
        }
      } else {
        setIsConnected(false)
      }
    } catch (error) {
      logError('Failed to check calendar connection:', error)
      setIsConnected(false)
    }
  }, [])

  useEffect(() => {
    // Check if user has connected calendars
    checkCalendarConnection()

    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('calendar_code')
      const state = urlParams.get('calendar_state')
      
      if (code && state) {
        const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
        if (!token) return

        try {
          const response = await fetch('/api/integrations/google/calendar', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, state })
          })

          if (response.ok) {
            const data = await response.json()
            setIsConnected(true)
            setCalendarInfo({
              email: data.email,
              name: data.name
            })
            
            toast({
              title: `✅ Connected to Google Calendar!`,
              description: "Your calendar is now synced with SoloSuccess AI",
            })
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname)
            
            // Load events
            await loadCalendarEvents()
          } else {
            throw new Error('Failed to connect')
          }
        } catch (error) {
          logError('Failed to complete calendar connection:', error)
          toast({
            title: "❌ Connection failed",
            description: "Please try again",
            variant: "destructive",
          })
        }
      }
    }

    handleOAuthCallback()
  }, [checkCalendarConnection])

  const connectCalendar = async (provider: 'google' | 'outlook') => {
    if (provider === 'outlook') {
      toast({
        title: "Outlook integration",
        description: "Outlook Calendar integration is planned for a future release. Google Calendar is available now.",
        variant: "default",
      })
      logInfo('Outlook integration requested', { provider })
      return
    }

    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Get OAuth URL
      const response = await fetch('/api/integrations/google/calendar?action=auth_url', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get auth URL')
      }

      const { url } = await response.json()
      
      // Open OAuth popup
      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2
      
      const popup = window.open(
        url,
        'Google Calendar Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      // Listen for OAuth callback
      const checkPopup = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(checkPopup)
          setIsLoading(false)
          
          // Check connection status
          await checkCalendarConnection()
        }
      }, 1000)

      // Timeout after 5 minutes
      setTimeout(() => {
        if (popup && !popup.closed) {
          popup.close()
          clearInterval(checkPopup)
          setIsLoading(false)
          toast({
            title: "Connection timeout",
            description: "Please try again",
            variant: "destructive",
          })
        }
      }, 5 * 60 * 1000)

    } catch (error) {
      logError('Failed to connect calendar:', error)
      toast({
        title: "❌ Connection failed",
        description: "Please try again or check your credentials",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const disconnectCalendar = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/integrations/google/calendar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disconnect: true })
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      setIsConnected(false)
      setConnectedCalendars([])
      setEvents([])
      
      toast({
        title: "Calendar disconnected",
        description: "Your calendar sync has been disabled",
      })
    } catch (error) {
      logError('Failed to disconnect calendar:', error)
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
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
      if (!token) return

      const timeMin = new Date().toISOString()
      const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Next 7 days

      const response = await fetch(
        `/api/integrations/google/calendar?action=events&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&maxResults=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        if (response.status === 404) {
          setIsConnected(false)
          return
        }
        throw new Error('Failed to load events')
      }

      const data = await response.json()
      
      // Transform API events to component format
      const transformedEvents: CalendarEvent[] = data.events.map((event: any) => ({
        id: event.id || Math.random().toString(),
        title: event.title,
        description: event.description || '',
        startTime: event.startTime,
        endTime: event.endTime,
        calendarId: event.calendarId || 'primary',
        calendarName: event.calendarName || 'Calendar',
        isRecurring: event.isRecurring || false,
        attendees: event.attendees || []
      }))

      setEvents(transformedEvents)
      
      // Update connected calendars list
      if (data.calendars && data.calendars.length > 0) {
        setConnectedCalendars(data.calendars.map((cal: any) => cal.id))
      }

      logInfo('Calendar events loaded', { count: transformedEvents.length })
    } catch (error) {
      logError('Failed to load calendar events:', error)
      toast({
        title: "Failed to load events",
        description: "Please try refreshing",
        variant: "destructive",
      })
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

  const syncTasksToCalendar = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Fetch user's tasks
      const tasksResponse = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!tasksResponse.ok) {
        throw new Error('Failed to fetch tasks')
      }

      const tasksData = await tasksResponse.json()
      const tasks = tasksData.tasks || []

      // Filter tasks that need to be synced (not completed, have due date)
      const tasksToSync = tasks.filter((task: any) => {
        return !task.completed && task.due_date && new Date(task.due_date) >= new Date()
      })

      if (tasksToSync.length === 0) {
        toast({
          title: "No tasks to sync",
          description: "All tasks are either completed or don't have due dates.",
          variant: "default",
        })
        return
      }

      // Sync each task to calendar
      let syncedCount = 0
      let failedCount = 0

      for (const task of tasksToSync) {
        try {
          const dueDate = new Date(task.due_date)
          const startTime = new Date(dueDate)
          startTime.setHours(9, 0, 0, 0) // Default to 9 AM
          const endTime = new Date(startTime)
          endTime.setHours(startTime.getHours() + 1) // 1 hour duration

          const eventResponse = await fetch('/api/integrations/google/calendar', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: 'create_event',
              title: task.title || 'Untitled Task',
              description: task.description || `Task from SoloSuccess AI: ${task.title}`,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              calendarId: 'primary'
            })
          })

          if (eventResponse.ok) {
            syncedCount++
          } else {
            failedCount++
          }
        } catch (error) {
          logError('Failed to sync task to calendar', { taskId: task.id }, error instanceof Error ? error : new Error(String(error)))
          failedCount++
        }
      }

      toast({
        title: `✅ Task sync complete`,
        description: `Successfully synced ${syncedCount} task${syncedCount !== 1 ? 's' : ''}${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
        variant: syncedCount > 0 ? "default" : "destructive",
      })

      // Refresh calendar events
      await loadCalendarEvents()

      logInfo('Tasks synced to calendar', { syncedCount, failedCount, totalTasks: tasksToSync.length })
    } catch (error) {
      logError('Failed to sync tasks to calendar', error)
      toast({
        title: "❌ Sync failed",
        description: "Please try again or check your calendar connection",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createCalendarEvent = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Prompt user for event details
      const title = prompt('Event Title:')
      if (!title) {
        setIsLoading(false)
        return
      }

      const description = prompt('Event Description (optional):') || ''
      const dateStr = prompt('Event Date & Time (YYYY-MM-DD HH:MM):')
      if (!dateStr) {
        setIsLoading(false)
        return
      }

      // Parse date
      const [datePart, timePart] = dateStr.split(' ')
      const [year, month, day] = datePart.split('-').map(Number)
      const [hours, minutes] = timePart ? timePart.split(':').map(Number) : [9, 0]

      const startTime = new Date(year, month - 1, day, hours, minutes)
      const endTime = new Date(startTime)
      endTime.setHours(endTime.getHours() + 1) // Default 1 hour duration

      const response = await fetch('/api/integrations/google/calendar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'create_event',
          title,
          description,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          calendarId: 'primary'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create event')
      }

      const eventData = await response.json()

      toast({
        title: "✅ Event created",
        description: `${title} has been added to your calendar`,
      })

      // Refresh calendar events
      await loadCalendarEvents()

      logInfo('Calendar event created', { eventId: eventData.id, title })
    } catch (error) {
      logError('Failed to create calendar event', error)
      toast({
        title: "❌ Failed to create event",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
                variant="outline"
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
        {isConnected && (connectedCalendars.length > 0 || calendarInfo.email) && (
          <div className="space-y-3">
            <h4 className="font-medium">Connected Calendar</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-medium">{calendarInfo.name || calendarInfo.email || 'Google Calendar'}</span>
                    {calendarInfo.email && (
                      <p className="text-sm text-gray-600">{calendarInfo.email}</p>
                    )}
                    <Badge variant="cyan" className="text-xs mt-1">
                      Active
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
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
                        <Badge variant="purple" className="text-xs">
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
                      <Badge variant="cyan" className="text-xs">
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
