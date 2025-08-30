"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser } from "@stackframe/stack"
import { useProfile } from "@/hooks/use-profile-swr"
import { User, Camera, Upload, X, Settings, Bell, Shield, Crown, Sparkles, Save, Trash2 } from "lucide-react"

interface EnhancedProfileModalProps {
  _open: boolean
  onOpenChangeAction: (_open: boolean) => void
}

export function EnhancedProfileModal({ _open, onOpenChangeAction }: EnhancedProfileModalProps) {
  const user = useUser()
  const { profile, updateProfile, uploadAvatar, removeAvatar } = useProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    full_name: user?.displayName || profile?.full_name || "",
    company_name: "",
    industry: "",
    business_type: "",
    phone: "",
    website: "",
    bio: "",
    timezone: "",
    avatar_url: profile?.avatar_url || "",
  })

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    weekly_digest: true,
    achievement_alerts: true,
    ai_suggestions: true,
  })

  const [preferences, setPreferences] = useState({
    dark_mode: false,
    compact_view: false,
    auto_save: true,
    show_tips: true,
    analytics_tracking: true,
  })

  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const industries = [
    "Technology",
    "E-commerce",
    "Consulting",
    "Marketing & Advertising",
    "Health & Wellness",
    "Education",
    "Finance",
    "Real Estate",
    "Creative Services",
    "Food & Beverage",
    "Fashion & Beauty",
    "Travel & Tourism",
    "Other",
  ]

  const businessTypes = [
    "Solopreneur",
    "Freelancer",
    "Small Business Owner",
    "Startup Founder",
    "Content Creator",
    "Coach/Consultant",
    "E-commerce Store",
    "Service Provider",
    "Digital Nomad",
    "Other",
  ]

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    try {
      const avatarUrl = await uploadAvatar(file)
      if (avatarUrl) {
        setFormData((prev) => ({ ...prev, avatar_url: avatarUrl }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (formData.avatar_url) {
      try {
        await removeAvatar()
        setFormData((prev) => ({ ...prev, avatar_url: "" }))
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await updateProfile({ full_name: formData.full_name })
      onOpenChangeAction(false)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={_open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto boss-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold boss-heading flex items-center gap-2">
            <Crown className="h-6 w-6 text-purple-600" />
            Boss Profile Settings
            <Sparkles className="h-6 w-6 text-pink-500" />
          </DialogTitle>
          <DialogDescription className="font-medium">
            Customize your empire settings and make your profile legendary! 👑✨
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-purple-100 to-pink-100">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-gradient-to-r from-purple-400 to-pink-400">
                  <AvatarImage src={formData.avatar_url || "/default-user.svg"} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                    {formData.full_name?.charAt(0) || user?.primaryEmail?.charAt(0) || "B"}
                  </AvatarFallback>
                </Avatar>
                {formData.avatar_url && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200 hover:from-purple-200 hover:to-pink-200"
                >
                  {isUploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Upload Photo
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload profile photo"
                />
              </div>
              <p className="text-xs text-gray-500 text-center">Upload a boss-level photo! Max 2MB, JPG/PNG format 📸</p>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="font-semibold empowering-text">
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Your boss name"
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name" className="font-semibold empowering-text">
                  Company Name
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                  placeholder="Your empire name"
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="font-semibold empowering-text">
                  Industry
                </Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_type" className="font-semibold empowering-text">
                  Business Type
                </Label>
                <Select
                  value={formData.business_type}
                  onValueChange={(value) => handleInputChange("business_type", value)}
                >
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold empowering-text">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="font-semibold empowering-text">
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://yourbosswebsite.com"
                  className="border-purple-200 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="timezone" className="font-semibold empowering-text">
                  Timezone
                </Label>
                <Select value={formData.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio" className="font-semibold empowering-text">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell the world about your boss journey and empire goals! 👑"
                  className="border-purple-200 focus:border-purple-400 min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">{formData.bio.length}/500 characters</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h3 className="font-bold empowering-text mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-purple-600" />
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive important updates via email</p>
                    </div>
                    <Switch
                      checked={notifications.email_notifications}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, email_notifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Push Notifications</Label>
                      <p className="text-sm text-gray-600">Get real-time alerts in your browser</p>
                    </div>
                    <Switch
                      checked={notifications.push_notifications}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, push_notifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Marketing Emails</Label>
                      <p className="text-sm text-gray-600">Boss tips, updates, and special offers</p>
                    </div>
                    <Switch
                      checked={notifications.marketing_emails}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, marketing_emails: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Weekly Digest</Label>
                      <p className="text-sm text-gray-600">Summary of your boss achievements</p>
                    </div>
                    <Switch
                      checked={notifications.weekly_digest}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weekly_digest: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Achievement Alerts</Label>
                      <p className="text-sm text-gray-600">Celebrate your wins with notifications</p>
                    </div>
                    <Switch
                      checked={notifications.achievement_alerts}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, achievement_alerts: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">AI Suggestions</Label>
                      <p className="text-sm text-gray-600">Smart recommendations from your AI squad</p>
                    </div>
                    <Switch
                      checked={notifications.ai_suggestions}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, ai_suggestions: checked }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6 mt-6">
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h3 className="font-bold empowering-text mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-600" />
                  Interface Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Dark Mode</Label>
                      <p className="text-sm text-gray-600">Switch to dark theme for late-night boss sessions</p>
                    </div>
                    <Switch
                      checked={preferences.dark_mode}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, dark_mode: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Compact View</Label>
                      <p className="text-sm text-gray-600">Show more content in less space</p>
                    </div>
                    <Switch
                      checked={preferences.compact_view}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, compact_view: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Auto-Save</Label>
                      <p className="text-sm text-gray-600">Automatically save your work as you type</p>
                    </div>
                    <Switch
                      checked={preferences.auto_save}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, auto_save: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Show Tips</Label>
                      <p className="text-sm text-gray-600">Display helpful boss tips and tutorials</p>
                    </div>
                    <Switch
                      checked={preferences.show_tips}
                      onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, show_tips: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Analytics Tracking</Label>
                      <p className="text-sm text-gray-600">Help us improve by sharing usage data</p>
                    </div>
                    <Switch
                      checked={preferences.analytics_tracking}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, analytics_tracking: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-6 mt-6">
            <div className="space-y-6">
              {/* Account Info */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h3 className="font-bold empowering-text mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Email:</span>
                    <span className="text-gray-600">{user?.primaryEmail}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Account Created:</span>
                    <span className="text-gray-600">
                      {"Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subscription:</span>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Boss Pro 👑</Badge>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-red-700">
                    These actions are permanent and cannot be undone. Please proceed with caution.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent">
                      Change Password
                    </Button>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChangeAction(false)} className="bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {isSaving ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
