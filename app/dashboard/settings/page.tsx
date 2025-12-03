"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  User,
  Shield,
  Bell,
  CreditCard,
  LogOut,
  Save,
  Trash2,
  Crown,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Smartphone,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import {
  TacticalButton,
  GlassCard,
  RankStars,
  CamoBackground,
  SergeantDivider,
  StatsBadge
} from '@/components/military'
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

import { ApiKeysTutorial } from '@/components/settings/api-keys-tutorial'
import { useEffect } from 'react'

export default function SettingsPage() {
  const { user, signOut, loading } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  // API Keys State
  const [isSavingKeys, setIsSavingKeys] = useState(false)
  const [apiKeys, setApiKeys] = useState({
    twitter: '',
    linkedin: '',
    facebook: '',
    instagram: ''
  })

  // Fetch keys on mount
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await fetch('/api/user/api-keys')
        if (response.ok) {
          const data = await response.json()
          const newKeys = { ...apiKeys }
          data.keys.forEach((k: any) => {
            if (k.service === 'twitter') newKeys.twitter = k.masked_value
            if (k.service === 'linkedin') newKeys.linkedin = k.masked_value
            if (k.service === 'facebook') newKeys.facebook = k.masked_value
            if (k.service === 'instagram') newKeys.instagram = k.masked_value
          })
          setApiKeys(newKeys)
        }
      } catch (error) {
        console.error('Failed to fetch API keys', error)
      }
    }
    fetchKeys()
  }, [])

  const handleSaveApiKeys = async () => {
    setIsSavingKeys(true)
    try {
      const keysToSave = []
      if (apiKeys.twitter && !apiKeys.twitter.includes('***')) keysToSave.push({ service: 'twitter', key_value: apiKeys.twitter })
      if (apiKeys.linkedin && !apiKeys.linkedin.includes('***')) keysToSave.push({ service: 'linkedin', key_value: apiKeys.linkedin })
      if (apiKeys.facebook && !apiKeys.facebook.includes('***')) keysToSave.push({ service: 'facebook', key_value: apiKeys.facebook })
      if (apiKeys.instagram && !apiKeys.instagram.includes('***')) keysToSave.push({ service: 'instagram', key_value: apiKeys.instagram })

      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: keysToSave })
      })

      if (response.ok) {
        toast({
          title: "API Keys Saved",
          description: "Your integration settings have been updated.",
        })
      } else {
        throw new Error('Failed to save keys')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API keys.",
        variant: "destructive"
      })
    } finally {
      setIsSavingKeys(false)
    }
  }

  const [formData, setFormData] = useState({
    displayName: (user as any)?.name || "",
    email: user?.email || "",
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

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Call API to update profile
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.displayName,
          email: formData.email,
          // Only send password if it's being changed
          ...(formData.newPassword ? {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword
          } : {}),
          notifications: notificationSettings,
          privacy: privacySettings
        })
      })

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Your profile has been updated successfully.",
        })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted.",
          variant: "destructive"
        })
        signOut()
      } else {
        throw new Error('Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-military-midnight flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-military-hot-pink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-military-midnight relative overflow-hidden">
      <CamoBackground opacity={0.1} withGrid>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-panel-strong border-b border-military-hot-pink/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link href="/dashboard" className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-military-hot-pink to-military-blush-pink flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown className="w-6 h-6 text-white" />
                </motion.div>
                <span className="font-heading text-xl font-bold text-white">SoloSuccess AI</span>
              </Link>

              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <TacticalButton variant="outline" size="sm">
                    Back to Command
                  </TacticalButton>
                </Link>
                <TacticalButton size="sm" onClick={handleSave} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </TacticalButton>
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
                <RankStars count={5} size="lg" />
                <span className="text-military-hot-pink font-tactical text-sm uppercase tracking-wider">
                  Command Center
                </span>
              </div>

              <h1 className="font-heading text-5xl font-bold text-white mb-6">
                Tactical <span className="text-transparent bg-clip-text bg-gradient-to-r from-military-hot-pink to-military-blush-pink">Settings</span>
              </h1>

              <p className="text-xl text-military-storm-grey max-w-2xl">
                Configure your elite command center settings and tactical preferences.
                Customize your experience for maximum efficiency.
              </p>
            </motion.div>

            {/* Settings Tabs */}
            <div className="max-w-6xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="glass-panel-strong border border-military-hot-pink/30">
                  <TabsTrigger value="profile" className="data-[state=active]:bg-military-hot-pink/20 data-[state=active]:text-white">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="security" className="data-[state=active]:bg-military-hot-pink/20 data-[state=active]:text-white">
                    <Shield className="w-4 h-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="data-[state=active]:bg-military-hot-pink/20 data-[state=active]:text-white">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="data-[state=active]:bg-military-hot-pink/20 data-[state=active]:text-white">
                    <Globe className="w-4 h-4 mr-2" />
                    Integrations
                  </TabsTrigger>
                  <TabsTrigger value="billing" className="data-[state=active]:bg-military-hot-pink/20 data-[state=active]:text-white">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                  </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <GlassCard className="p-8" glow>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-lg bg-military-hot-pink/20 flex items-center justify-center border border-military-hot-pink/30">
                        <User className="w-6 h-6 text-military-hot-pink" />
                      </div>
                      <div>
                        <h3 className="text-xl font-heading font-bold text-white">Profile Information</h3>
                        <p className="text-military-storm-grey">Update your personal details and public profile</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="displayName" className="text-white">Display Name</Label>
                          <Input
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className="bg-military-tactical-black/50 border-military-storm-grey text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="bg-military-tactical-black/50 border-military-storm-grey text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-white">Bio</Label>
                          <Input
                            id="bio"
                            className="bg-military-tactical-black/50 border-military-storm-grey text-white"
                            placeholder="Tell us about your mission..."
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-military-tactical-black/30 border border-military-storm-grey/30">
                          <h4 className="text-white font-bold mb-2">Profile Visibility</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-military-storm-grey text-sm">Make profile public</span>
                            <Switch
                              checked={privacySettings.profileVisibility === 'public'}
                              onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, profileVisibility: checked ? 'public' : 'private' }))}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-military-tactical-black/30 border border-military-storm-grey/30">
                          <h4 className="text-white font-bold mb-2">Activity Status</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-military-storm-grey text-sm">Show online status</span>
                            <Switch
                              checked={privacySettings.showActivity}
                              onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showActivity: checked }))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                  <GlassCard className="p-8" glow>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-lg bg-military-hot-pink/20 flex items-center justify-center border border-military-hot-pink/30">
                        <Shield className="w-6 h-6 text-military-hot-pink" />
                      </div>
                      <div>
                        <h3 className="text-xl font-heading font-bold text-white">Security Settings</h3>
                        <p className="text-military-storm-grey">Manage your password and account security</p>
                      </div>
                    </div>

                    <div className="space-y-6 max-w-2xl">
                      <div className="space-y-4">
                        <h4 className="text-white font-bold">Change Password</h4>
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type={showPassword ? "text" : "password"}
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              className="bg-military-tactical-black/50 border-military-storm-grey text-white pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-military-storm-grey hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-white">New Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="bg-military-tactical-black/50 border-military-storm-grey text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="bg-military-tactical-black/50 border-military-storm-grey text-white"
                          />
                        </div>
                      </div>

                      <SergeantDivider />

                      <div className="space-y-4">
                        <h4 className="text-red-500 font-bold flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </h4>
                        <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-white font-bold">Delete Account</h5>
                              <p className="text-military-storm-grey text-sm">Permanently delete your account and all data</p>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Account
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-military-tactical-black border-military-storm-grey text-white">
                                <DialogHeader>
                                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                                  <DialogDescription className="text-military-storm-grey">
                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" className="border-military-storm-grey text-white hover:bg-military-storm-grey/20">Cancel</Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? "Deleting..." : "Yes, delete account"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                  <GlassCard className="p-8" glow>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-lg bg-military-hot-pink/20 flex items-center justify-center border border-military-hot-pink/30">
                        <Bell className="w-6 h-6 text-military-hot-pink" />
                      </div>
                      <div>
                        <h3 className="text-xl font-heading font-bold text-white">Notification Preferences</h3>
                        <p className="text-military-storm-grey">Control how and when we communicate with you</p>
                      </div>
                    </div>

                    <div className="space-y-6 max-w-2xl">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-military-tactical-black/30 border border-military-storm-grey/30">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-military-hot-pink" />
                            <div>
                              <h5 className="text-white font-bold">Email Notifications</h5>
                              <p className="text-military-storm-grey text-sm">Receive updates via email</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-military-tactical-black/30 border border-military-storm-grey/30">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-military-hot-pink" />
                            <div>
                              <h5 className="text-white font-bold">Push Notifications</h5>
                              <p className="text-military-storm-grey text-sm">Receive mobile push notifications</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.pushNotifications}
                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-military-tactical-black/30 border border-military-storm-grey/30">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-military-hot-pink" />
                            <div>
                              <h5 className="text-white font-bold">Security Alerts</h5>
                              <p className="text-military-storm-grey text-sm">Get notified about security events</p>
                            </div>
                          </div>
                          <Switch
                            checked={notificationSettings.securityAlerts}
                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, securityAlerts: checked }))}
                          />
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations">
                  <GlassCard className="p-8" glow>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-military-hot-pink/20 flex items-center justify-center border border-military-hot-pink/30">
                          <Globe className="w-6 h-6 text-military-hot-pink" />
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold text-white">API Integrations</h3>
                          <p className="text-military-storm-grey">Connect your social media accounts for monitoring</p>
                        </div>
                      </div>
                      <ApiKeysTutorial />
                    </div>

                    <div className="space-y-6 max-w-2xl">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="twitterKey" className="text-white">Twitter / X Bearer Token</Label>
                          <div className="flex gap-2">
                            <Input
                              id="twitterKey"
                              type="password"
                              placeholder="Enter your Twitter Bearer Token"
                              className="bg-military-tactical-black/50 border-military-storm-grey text-white"
                              value={apiKeys.twitter}
                              onChange={(e) => setApiKeys(prev => ({ ...prev, twitter: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="linkedinKey" className="text-white">LinkedIn Access Token</Label>
                          <Input
                            id="linkedinKey"
                            type="password"
                            placeholder="Enter your LinkedIn Access Token"
                            className="bg-military-tactical-black/50 border-military-storm-grey text-white"
                            value={apiKeys.linkedin}
                            onChange={(e) => setApiKeys(prev => ({ ...prev, linkedin: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="facebookKey" className="text-white">Facebook Graph Token</Label>
                          <Input
                            id="facebookKey"
                            type="password"
                            placeholder="Enter your Facebook Graph Token"
                            className="bg-military-tactical-black/50 border-military-storm-grey text-white"
                            value={apiKeys.facebook}
                            onChange={(e) => setApiKeys(prev => ({ ...prev, facebook: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="instagramKey" className="text-white">Instagram Graph Token</Label>
                          <Input
                            id="instagramKey"
                            type="password"
                            placeholder="Enter your Instagram Graph Token"
                            className="bg-military-tactical-black/50 border-military-storm-grey text-white"
                            value={apiKeys.instagram}
                            onChange={(e) => setApiKeys(prev => ({ ...prev, instagram: e.target.value }))}
                          />
                        </div>

                        <div className="pt-4">
                          <Button onClick={handleSaveApiKeys} disabled={isSavingKeys} className="w-full sm:w-auto">
                            {isSavingKeys ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Saving Keys...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save API Keys
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </TabsContent>

                {/* Billing Tab Redirect */}
                <TabsContent value="billing">
                  <GlassCard className="p-8 text-center" glow>
                    <CreditCard className="w-16 h-16 text-military-hot-pink mx-auto mb-4" />
                    <h3 className="text-2xl font-heading font-bold text-white mb-2">Manage Subscription</h3>
                    <p className="text-military-storm-grey mb-6">
                      View your plan details, billing history, and payment methods in the dedicated billing portal.
                    </p>
                    <Link href="/dashboard/billing">
                      <TacticalButton size="lg">
                        Go to Billing Portal
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </TacticalButton>
                    </Link>
                  </GlassCard>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </CamoBackground>
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