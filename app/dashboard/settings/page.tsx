"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

import {
  User,
  Shield,
  Bell,
  CreditCard,
  Save,
  Trash2,
  Crown,
  Mail,
  Eye,
  EyeOff,
  Smartphone,
  AlertTriangle,
  Settings as SettingsIcon
} from 'lucide-react'
import { CyberButton } from '@/components/cyber/CyberButton'
import { HudBorder } from '@/components/cyber/HudBorder'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from 'next/link'
import { SocialMediaIntegration } from '@/components/integrations/social-media-integration'
import { CalendarIntegration } from '@/components/integrations/calendar-integration'
import { RevenueIntegration } from '@/components/integrations/revenue-integration'
import { logError } from '@/lib/logger'

export default function SettingsPage() {
  const { user, signOut, loading } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletePassword, setDeletePassword] = useState('')

  const [formData, setFormData] = useState({
    displayName: (user as any)?.name || "",
    email: user?.email || "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    weeklyReports: true,
    productUpdates: true
  })

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showActivity: true,
    allowTagging: true,
    dataSharing: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (!user) return
    setFormData((prev) => ({
      ...prev,
      displayName: (user as any)?.name || prev.displayName || "",
      email: user?.email || prev.email || "",
    }))
  }, [user])

  useEffect(() => {
    if (loading || !user) return

    const loadProfile = async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' })
        if (!res.ok) {
          logError('Failed to load profile', { status: res.status })
          return
        }
        const data = await res.json().catch(() => ({}))
        setFormData((prev) => ({
          ...prev,
          displayName: typeof data?.full_name === 'string' && data.full_name.trim().length > 0 ? data.full_name : prev.displayName,
          bio: typeof data?.bio === 'string' ? data.bio : (data?.bio === null ? '' : prev.bio),
        }))
      } catch (err) {
        logError('Failed to load profile', err)
      }
    }

    loadProfile()
  }, [loading, user])

  useEffect(() => {
    if (loading || !user) return

    // Hydrate saved preferences (privacy + notification toggles)
    const loadPreferences = async () => {
      try {
        const res = await fetch('/api/preferences', { credentials: 'include' })
        if (!res.ok) {
          logError('Failed to load preferences', { status: res.status })
          return
        }
        const data = await res.json().catch(() => ({}))
        const prefs = data?.preferences || {}

        const normalize = (val: unknown) => {
          if (typeof val === 'string') {
            try { return JSON.parse(val) } catch { return val }
          }
          return val
        }

        const savedNotificationSettings = normalize(prefs.notificationSettings)
        if (savedNotificationSettings && typeof savedNotificationSettings === 'object') {
          setNotificationSettings((prev) => ({ ...prev, ...(savedNotificationSettings as any) }))
        }

        const savedPrivacySettings = normalize(prefs.privacySettings)
        if (savedPrivacySettings && typeof savedPrivacySettings === 'object') {
          setPrivacySettings((prev) => ({ ...prev, ...(savedPrivacySettings as any) }))
        }
      } catch (err) {
        logError('Failed to load preferences', err)
      }
    }

    loadPreferences()
  }, [loading, user])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // 1) Update basic profile (name/email-like display)
      const profileResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.displayName,
          bio: formData.bio,
        }),
      })

      if (!profileResponse.ok) {
        const data = await profileResponse.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update profile information')
      }

      // 2) Persist notification + privacy settings (so switches don't reset)
      const prefResponse = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          preferences: {
            notificationSettings,
            privacySettings,
          },
        }),
      })

      if (!prefResponse.ok) {
        const data = await prefResponse.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to save notification/privacy settings')
      }

      // 3) If password fields are filled, change password via dedicated endpoint
      if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
          throw new Error('Please fill out current, new, and confirmation password fields.')
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match')
        }

        const passwordResponse = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        })

        const pwdData = await passwordResponse.json().catch(() => ({}))
        if (!passwordResponse.ok) {
          throw new Error(pwdData.error || 'Failed to change password')
        }
      }

      toast({
        title: "Settings Saved",
        description: "Your profile and security settings have been updated.",
      })
    } catch (error) {
      logError('Error saving settings:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      if (deleteConfirmText !== 'DELETE') {
        throw new Error('Please type DELETE to confirm account deletion.')
      }
      if (!deletePassword) {
        throw new Error('Password is required to delete account.')
      }

      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmText,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
        variant: "destructive",
      })
      await signOut()
    } catch (error) {
      logError('Error deleting account:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-none animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 pointer-events-none" />
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-card/90 backdrop-blur-sm border-b border-neon-purple/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link href="/dashboard" className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 rounded-none bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_20px_rgba(179,0,255,0.4)]"
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown className="w-6 h-6 text-white" />
                </motion.div>
                <span className="font-orbitron text-xl font-bold text-white">SOLOSUCCESS AI</span>
              </Link>

              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <CyberButton variant="ghost" size="sm" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                    Back to Command
                  </CyberButton>
                </Link>
                <CyberButton size="sm" onClick={handleSave} disabled={isLoading} className="bg-neon-purple hover:bg-neon-purple/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </CyberButton>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="text-neon-purple font-mono text-sm uppercase tracking-wider">
                  Command Center
                </span>
              </div>

              <h1 className="font-orbitron text-5xl font-bold text-white mb-6">
                SETTINGS <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">CONFIGURATION</span>
              </h1>

              <p className="text-xl text-gray-400 max-w-2xl font-mono">
                Configure your command center settings and preferences.
                Customize your experience for maximum efficiency.
              </p>
            </motion.div>

            {/* Settings Tabs */}
            <div className="max-w-6xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-dark-card border border-neon-purple/30">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="security" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono">
                    <Shield className="w-4 h-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono">
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Integrations
                  </TabsTrigger>
                  <TabsTrigger value="billing" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-white font-mono">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <HudBorder variant="hover" className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-none bg-neon-purple/20 flex items-center justify-center border border-neon-purple/30">
                        <User className="w-6 h-6 text-neon-purple" />
                      </div>
                      <div>
                        <h3 className="text-xl font-orbitron font-bold text-white">Profile Information</h3>
                        <p className="text-gray-400 font-mono">Update your personal details and public profile</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="displayName" className="text-neon-cyan font-mono uppercase text-xs">Display Name</Label>
                          <Input
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className="bg-dark-bg border-neon-cyan/30 text-white focus:border-neon-cyan font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-neon-cyan font-mono uppercase text-xs">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-dark-bg border-neon-cyan/30 text-white focus:border-neon-cyan font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-neon-cyan font-mono uppercase text-xs">Bio</Label>
                          <Input
                            id="bio"
                            name="bio"
                            value={formData.bio ?? ""}
                            onChange={handleInputChange}
                            className="bg-dark-bg border-neon-cyan/30 text-white focus:border-neon-cyan font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-4 rounded-none bg-dark-bg/50 border border-neon-purple/30">
                          <h4 className="text-white font-bold mb-2 font-orbitron">Profile Visibility</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm font-mono">Make profile public</span>
                            <Switch
                              checked={privacySettings.profileVisibility === 'public'}
                              onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, profileVisibility: checked ? 'public' : 'private' }))}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-none bg-dark-bg/50 border border-neon-purple/30">
                          <h4 className="text-white font-bold mb-2 font-orbitron">Activity Status</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm font-mono">Show online status</span>
                            <Switch
                              checked={privacySettings.showActivity}
                              onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showActivity: checked }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </HudBorder>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                  <HudBorder variant="hover" className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-none bg-neon-purple/20 flex items-center justify-center border border-neon-purple/30">
                        <Shield className="w-6 h-6 text-neon-purple" />
                      </div>
                      <div>
                        <h3 className="text-xl font-orbitron font-bold text-white">Security Settings</h3>
                        <p className="text-gray-400 font-mono">Manage your password and account security</p>
                      </div>
                    </div>

                    <div className="space-y-6 max-w-2xl">
                      <div className="space-y-4">
                        <h4 className="text-white font-bold font-orbitron">Change Password</h4>
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-neon-cyan font-mono uppercase text-xs">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type={showPassword ? "text" : "password"}
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              className="bg-dark-bg border-neon-cyan/30 text-white pr-10 focus:border-neon-cyan"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon-cyan"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-neon-cyan font-mono uppercase text-xs">New Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="bg-dark-bg border-neon-cyan/30 text-white focus:border-neon-cyan font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-neon-cyan font-mono uppercase text-xs">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="bg-dark-bg border-neon-cyan/30 text-white focus:border-neon-cyan font-mono"
                          />
                        </div>
                      </div>

                      <div className="h-px bg-neon-cyan/30 my-6" />

                      <div className="space-y-4">
                        <h4 className="text-neon-magenta font-bold flex items-center gap-2 font-orbitron">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </h4>
                        <div className="p-4 rounded-none border border-neon-magenta/30 bg-neon-magenta/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-white font-bold font-orbitron">Delete Account</h5>
                              <p className="text-gray-400 text-sm font-mono">Permanently delete your account and all data</p>
                            </div>
                            <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
                              setDeleteDialogOpen(open)
                              if (!open) {
                                setDeleteConfirmText('')
                                setDeletePassword('')
                              }
                            }}>
                              <DialogTrigger asChild>
                                <CyberButton variant="ghost" size="sm" className="bg-neon-magenta hover:bg-neon-magenta/90 text-white">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Account
                                </CyberButton>
                              </DialogTrigger>
                                <DialogContent className="bg-dark-card border-neon-magenta/30 text-white">
                                <DialogHeader>
                                  <DialogTitle className="font-orbitron">Are you absolutely sure?</DialogTitle>
                                  <DialogDescription className="text-gray-400 font-mono">
                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-2">
                                  <div className="space-y-2">
                                    <Label className="text-neon-magenta font-mono uppercase text-xs">Type DELETE to confirm</Label>
                                    <Input
                                      value={deleteConfirmText}
                                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                                      className="bg-dark-bg border-neon-magenta/30 text-white focus:border-neon-magenta font-mono"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-neon-magenta font-mono uppercase text-xs">Password</Label>
                                    <Input
                                      type="password"
                                      value={deletePassword}
                                      onChange={(e) => setDeletePassword(e.target.value)}
                                      className="bg-dark-bg border-neon-magenta/30 text-white focus:border-neon-magenta font-mono"
                                    />
                                  </div>
                                  <p className="text-xs text-gray-400 font-mono">
                                    This is to confirm you are the owner of this account.
                                  </p>
                                </div>
                                <DialogFooter>
                                  <CyberButton
                                    variant="ghost"
                                    className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                                    onClick={() => setDeleteDialogOpen(false)}
                                  >
                                    Cancel
                                  </CyberButton>
                                  <CyberButton
                                    variant="ghost"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting || deleteConfirmText !== 'DELETE' || !deletePassword}
                                    className="bg-neon-magenta hover:bg-neon-magenta/90 text-white"
                                  >
                                    {isDeleting ? "Deleting..." : "Yes, delete account"}
                                  </CyberButton>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                  </HudBorder>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                  <HudBorder variant="hover" className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-none bg-neon-purple/20 flex items-center justify-center border border-neon-purple/30">
                        <Bell className="w-6 h-6 text-neon-purple" />
                      </div>
                      <div>
                        <h3 className="text-xl font-orbitron font-bold text-white">Notification Preferences</h3>
                        <p className="text-gray-400 font-mono">Control how and when we communicate with you</p>
                      </div>
                    </div>

                    <div className="space-y-6 max-w-2xl">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-none bg-dark-bg/50 border border-neon-purple/30">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-neon-purple" />
                            <div>
                              <h5 className="text-white font-bold font-orbitron">Email Notifications</h5>
                              <p className="text-gray-400 text-sm font-mono">Receive updates via email</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-none bg-dark-bg/50 border border-neon-purple/30">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-neon-purple" />
                            <div>
                              <h5 className="text-white font-bold font-orbitron">Push Notifications</h5>
                              <p className="text-gray-400 text-sm font-mono">Receive mobile push notifications</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.pushNotifications}
                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-none bg-dark-bg/50 border border-neon-purple/30">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-neon-purple" />
                            <div>
                              <h5 className="text-white font-bold font-orbitron">Security Alerts</h5>
                              <p className="text-gray-400 text-sm font-mono">Get notified about security events</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.securityAlerts}
                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, securityAlerts: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                  </HudBorder>
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations">
                  <div className="space-y-6">
                    <HudBorder variant="hover" className="p-8">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-none bg-neon-purple/20 flex items-center justify-center border border-neon-purple/30">
                          <SettingsIcon className="w-6 h-6 text-neon-purple" />
                        </div>
                        <div>
                          <h3 className="text-xl font-orbitron font-bold text-white">Third-Party Integrations</h3>
                          <p className="text-gray-400 font-mono">Connect your accounts and services for enhanced functionality</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <RevenueIntegration />
                        <SocialMediaIntegration />
                        <CalendarIntegration />
                      </div>
                    </HudBorder>
                  </div>
                </TabsContent>

                {/* Billing Tab Redirect */}
                <TabsContent value="billing">
                  <HudBorder variant="hover" className="p-8 text-center">
                    <CreditCard className="w-16 h-16 text-neon-purple mx-auto mb-4" />
                    <h3 className="text-2xl font-orbitron font-bold text-white mb-2">Manage Subscription</h3>
                    <p className="text-gray-400 mb-6 font-mono">
                      View your plan details, billing history, and payment methods in the dedicated billing portal.
                    </p>
                    <Link href="/dashboard/billing">
                      <CyberButton size="lg" className="bg-neon-purple hover:bg-neon-purple/90">
                        Go to Billing Portal
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </CyberButton>
                    </Link>
                  </HudBorder>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
    </div>
  )
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}