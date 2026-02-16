"use client"

import { logError,} from '@/lib/logger'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Bell, 
  BellOff, 
  Shield, 
  Clock, 
  Target, 
  Zap,
  AlertTriangle,
  Info,
  Settings
} from 'lucide-react'

import { webPushManager, NotificationPermissionState } from '@/lib/web-push-notifications'
import { useToast } from '@/hooks/use-toast'
import { useUserPreferences } from '@/hooks/use-user-preferences'


interface NotificationPreferences {
  enabled: boolean
  taskReminders: boolean
  goalDeadlines: boolean
  workloadAlerts: boolean
  productivityTips: boolean
  reminderOffset: number // minutes before due date
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  frequency: 'minimal' | 'normal' | 'frequent'
}

interface NotificationSettingsProps {
  className?: string
}

export default function NotificationSettings({ className = "" }: NotificationSettingsProps) {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>({
    supported: false,
    permission: 'default',
    subscription: null
  })
  const [subscribing, setSubscribing] = useState(false)
  const { toast } = useToast()
  
  // Use database preferences with localStorage fallback
  const { 
    preferences: userPrefs, 
    loading: prefsLoading, 
    setPreference,
    setPreferences 
  } = useUserPreferences({
    defaultValues: {
      notifications: {
        enabled: false,
        taskReminders: true,
        goalDeadlines: true,
        workloadAlerts: true,
        productivityTips: false,
        reminderOffset: 60, // 1 hour
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00'
        },
        frequency: 'normal'
      }
    },
    fallbackToLocalStorage: true
  })
  
  const preferences = userPrefs.notifications || {
    enabled: false,
    taskReminders: true,
    goalDeadlines: true,
    workloadAlerts: true,
    productivityTips: false,
    reminderOffset: 60,
    quietHours: { enabled: false, start: '22:00', end: '08:00' },
    frequency: 'normal'
  }
  
  const loading = prefsLoading

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // Get permission state
      const state = await webPushManager.getPermissionState()
      setPermissionState(state)
    } catch (error) {
      logError('Error loading notification settings:', error)
    }
  }

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await setPreference('notifications', newPreferences)
    } catch (error) {
      logError('Failed to save notification preferences:', error)
      toast({
        title: "Failed to Save Settings",
        description: "Your notification preferences could not be saved.",
        variant: "destructive"
      })
    }
  }

  const handleEnableNotifications = async () => {
    if (permissionState.permission !== 'granted') {
      try {
        setSubscribing(true)
        const subscription = await webPushManager.subscribe()
        
        // Update state
        setPermissionState(prev => ({
          ...prev,
          permission: 'granted',
          subscription
        }))
        
        // Enable notifications
        const newPrefs = { ...preferences, enabled: true }
        savePreferences(newPrefs)
        
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive smart reminders and alerts.",
        })
        
        // Schedule a welcome notification
        webPushManager.showNotification({
          title: "🎉 Notifications Enabled!",
          body: "You'll now receive smart reminders to help you stay productive.",
          icon: '/images/logo.png',
          vibrate: [200, 100, 200]
        })
        
      } catch (error) {
        logError('Error enabling notifications:', error)
        toast({
          title: "Failed to Enable Notifications",
          description: error instanceof Error ? error.message : "Please check your browser settings.",
          variant: "destructive"
        })
      } finally {
        setSubscribing(false)
      }
    } else {
      // Just toggle the enabled state
      const newPrefs = { ...preferences, enabled: !preferences.enabled }
      savePreferences(newPrefs)
    }
  }

  const handleDisableNotifications = async () => {
    try {
      if (permissionState.subscription) {
        await webPushManager.unsubscribe()
        setPermissionState(prev => ({
          ...prev,
          subscription: null
        }))
      }
      
      const newPrefs = { ...preferences, enabled: false }
      savePreferences(newPrefs)
      
      toast({
        title: "Notifications Disabled",
        description: "You won't receive any more notifications.",
      })
    } catch (error) {
      logError('Error disabling notifications:', error)
      toast({
        title: "Error",
        description: "Failed to disable notifications completely.",
        variant: "destructive"
      })
    }
  }

  const testNotification = () => {
    webPushManager.showNotification({
      title: "🧪 Test Notification",
      body: "This is how your notifications will look!",
      icon: '/images/logo.png',
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'view',
          title: 'View Dashboard'
        }
      ]
    })
  }

  const getPermissionBadge = () => {
    switch (permissionState.permission) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">Enabled</Badge>
      case 'denied':
        return <Badge className="bg-red-100 text-red-800">Blocked</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not Requested</Badge>
    }
  }

  const getFrequencyDescription = (frequency: string) => {
    switch (frequency) {
      case 'minimal':
        return 'Only urgent reminders and critical alerts'
      case 'normal':
        return 'Task reminders, deadlines, and workload alerts'
      case 'frequent':
        return 'All notifications including productivity tips'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            <div>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage your push notifications and reminders
              </CardDescription>
            </div>
          </div>
          {getPermissionBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Support Check */}
        {!permissionState.supported && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Notifications Not Supported</AlertTitle>
            <AlertDescription>
              Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </AlertDescription>
          </Alert>
        )}

        {/* Permission Denied */}
        {permissionState.supported && permissionState.permission === 'denied' && (
          <Alert variant="destructive">
            <BellOff className="h-4 w-4" />
            <AlertTitle>Notifications Blocked</AlertTitle>
            <AlertDescription>
              Notifications are blocked in your browser. Please click the lock icon in your address bar and allow notifications, then refresh this page.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Toggle */}
        {permissionState.supported && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notifications-enabled" className="text-base font-medium">
                Enable Notifications
              </Label>
              <p className="text-sm text-gray-600">
                Receive smart reminders and productivity alerts
              </p>
            </div>
            <div className="flex items-center gap-2">
              {permissionState.permission === 'granted' && (
                <Button
                  onClick={testNotification}
                  variant="outline"
                  size="sm"
                  disabled={!preferences.enabled}
                >
                  Test
                </Button>
              )}
              <Switch
                id="notifications-enabled"
                checked={preferences.enabled && permissionState.permission === 'granted'}
                onCheckedChange={preferences.enabled ? handleDisableNotifications : handleEnableNotifications}
                disabled={subscribing || permissionState.permission === 'denied'}
              />
            </div>
          </div>
        )}

        {/* Notification Types */}
        {preferences.enabled && permissionState.permission === 'granted' && (
          <>
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Notification Types
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <Label>Task Reminders</Label>
                  </div>
                  <Switch
                    checked={preferences.taskReminders}
                    onCheckedChange={(checked) => savePreferences({
                      ...preferences,
                      taskReminders: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <Label>Goal Deadlines</Label>
                  </div>
                  <Switch
                    checked={preferences.goalDeadlines}
                    onCheckedChange={(checked) => savePreferences({
                      ...preferences,
                      goalDeadlines: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <Label>Workload Alerts</Label>
                  </div>
                  <Switch
                    checked={preferences.workloadAlerts}
                    onCheckedChange={(checked) => savePreferences({
                      ...preferences,
                      workloadAlerts: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-600" />
                    <Label>Productivity Tips</Label>
                  </div>
                  <Switch
                    checked={preferences.productivityTips}
                    onCheckedChange={(checked) => savePreferences({
                      ...preferences,
                      productivityTips: checked
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Reminder Timing */}
            <div className="space-y-4">
              <h3 className="font-medium">Reminder Timing</h3>
              
              <div className="space-y-2">
                <Label>Remind me {preferences.reminderOffset} minutes before tasks are due</Label>
                <Slider
                  value={[preferences.reminderOffset]}
                  onValueChange={([value]) => savePreferences({
                    ...preferences,
                    reminderOffset: value
                  })}
                  max={1440} // 24 hours
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5 min</span>
                  <span>24 hours</span>
                </div>
              </div>
            </div>

            {/* Notification Frequency */}
            <div className="space-y-2">
              <Label>Notification Frequency</Label>
              <Select 
                value={preferences.frequency} 
                onValueChange={(value: 'minimal' | 'normal' | 'frequent') => savePreferences({
                  ...preferences,
                  frequency: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="frequent">Frequent</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600">
                {getFrequencyDescription(preferences.frequency)}
              </p>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Quiet Hours</h3>
                <Switch
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(enabled) => savePreferences({
                    ...preferences,
                    quietHours: { ...preferences.quietHours, enabled }
                  })}
                />
              </div>
              
              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => savePreferences({
                        ...preferences,
                        quietHours: { ...preferences.quietHours, start: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      aria-label="Quiet hours start time"
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => savePreferences({
                        ...preferences,
                        quietHours: { ...preferences.quietHours, end: e.target.value }
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      aria-label="Quiet hours end time"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Privacy & Security */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>Privacy & Security</AlertTitle>
              <AlertDescription>
                Notifications are processed locally and only sent when needed. 
                Your notification preferences are stored on your device.
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  )
}
