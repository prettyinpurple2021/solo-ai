"use client"


export const dynamic = 'force-dynamic'
import { useState} from "react"
import { useAuth} from "@/hooks/use-auth"
import { Loading} from "@/components/ui/loading"
import { Button} from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import { Switch} from "@/components/ui/switch"
import { Label} from "@/components/ui/label"
import { Separator} from "@/components/ui/separator"
import { useToast} from "@/hooks/use-toast"
import { Bell, Mail, Smartphone, Save} from "lucide-react"
import { motion} from "framer-motion"

export default function NotificationsPage() {
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState({
    email: {
      marketing: true,
      updates: true,
      security: true,
      weeklyDigest: false,
    },
    push: {
      newFeatures: true,
      reminders: true,
      achievements: true,
      urgent: true,
    },
    inApp: {
      messages: true,
      systemUpdates: true,
      taskReminders: true,
      goalProgress: true,
    },
  })

  const handleNotificationChange = (category: string, type: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [type]: value,
      },
    }))
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notifications),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-background p-6 flex flex-col items-center justify-center gap-4">
        <Loading variant="bounce" size="lg" />
        <p className="text-muted-foreground animate-pulse">Checking your access...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access notifications</h1>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">
            Customize how and when you receive notifications
          </p>
        </div>

        <div className="grid gap-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Manage your email notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-marketing">Marketing & Promotions</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new features and special offers
                    </p>
                  </div>
                  <Switch
                    id="email-marketing"
                    checked={notifications.email.marketing}
                    onCheckedChange={(value) => handleNotificationChange("email", "marketing", value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-updates">Product Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about important product updates and changes
                    </p>
                  </div>
                  <Switch
                    id="email-updates"
                    checked={notifications.email.updates}
                    onCheckedChange={(value) => handleNotificationChange("email", "updates", value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-security">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Important security notifications and account activity
                    </p>
                  </div>
                  <Switch
                    id="email-security"
                    checked={notifications.email.security}
                    onCheckedChange={(value) => handleNotificationChange("email", "security", value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-digest">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      A weekly summary of your activity and achievements
                    </p>
                  </div>
                  <Switch
                    id="email-digest"
                    checked={notifications.email.weeklyDigest}
                    onCheckedChange={(value) => handleNotificationChange("email", "weeklyDigest", value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Control your mobile and browser push notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-features">New Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new features are released
                    </p>
                  </div>
                  <Switch
                    id="push-features"
                    checked={notifications.push.newFeatures}
                    onCheckedChange={(value) => handleNotificationChange("push", "newFeatures", value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-reminders">Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Task reminders and deadline notifications
                    </p>
                  </div>
                  <Switch
                    id="push-reminders"
                    checked={notifications.push.reminders}
                    onCheckedChange={(value) => handleNotificationChange("push", "reminders", value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-achievements">Achievements</Label>
                    <p className="text-sm text-muted-foreground">
                      Celebrate your milestones and accomplishments
                    </p>
                  </div>
                  <Switch
                    id="push-achievements"
                    checked={notifications.push.achievements}
                    onCheckedChange={(value) => handleNotificationChange("push", "achievements", value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-urgent">Urgent Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Critical updates that require immediate attention
                    </p>
                  </div>
                  <Switch
                    id="push-urgent"
                    checked={notifications.push.urgent}
                    onCheckedChange={(value) => handleNotificationChange("push", "urgent", value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                In-App Notifications
              </CardTitle>
              <CardDescription>
                Manage notifications within the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inapp-messages">Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for new messages and comments
                    </p>
                  </div>
                  <Switch
                    id="inapp-messages"
                    checked={notifications.inApp.messages}
                    onCheckedChange={(value) => handleNotificationChange("inApp", "messages", value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inapp-updates">System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Platform updates and maintenance notifications
                    </p>
                  </div>
                  <Switch
                    id="inapp-updates"
                    checked={notifications.inApp.systemUpdates}
                    onCheckedChange={(value) => handleNotificationChange("inApp", "systemUpdates", value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inapp-reminders">Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders for upcoming tasks and deadlines
                    </p>
                  </div>
                  <Switch
                    id="inapp-reminders"
                    checked={notifications.inApp.taskReminders}
                    onCheckedChange={(value) => handleNotificationChange("inApp", "taskReminders", value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="inapp-progress">Goal Progress</Label>
                    <p className="text-sm text-muted-foreground">
                      Updates on your goal progress and milestones
                    </p>
                  </div>
                  <Switch
                    id="inapp-progress"
                    checked={notifications.inApp.goalProgress}
                    onCheckedChange={(value) => handleNotificationChange("inApp", "goalProgress", value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isLoading} className="min-w-32">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
