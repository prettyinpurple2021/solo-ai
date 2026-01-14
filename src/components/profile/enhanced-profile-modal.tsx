"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { logError } from '@/lib/logger'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import { useProfile } from "@/hooks/use-profile-swr"
import { User, Camera, Upload, Crown, Shield, X, Save, Trash2, Key, Mail, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { signOut as nextAuthSignOut } from "next-auth/react"
import { Alert, AlertDescription } from "@/components/ui/alert"


interface EnhancedProfileModalProps {
  _open: boolean
  onOpenChangeAction: (_open: boolean) => void
}

export function EnhancedProfileModal({ _open, onOpenChangeAction }: EnhancedProfileModalProps) {
  const { user } = useAuth()
  const { profile, updateProfile, uploadAvatar, removeAvatar } = useProfile()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<{ full_name: string; image: string | null }>({
    full_name: "",
    image: null,
  })

  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Account management states
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showChangeEmail, setShowChangeEmail] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [changePasswordData, setChangePasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [changeEmailData, setChangeEmailData] = useState({ newEmail: "", password: "" })
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deletePassword, setDeletePassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  useEffect(() => {
    const nextName = profile?.full_name || (user as any)?.displayName || ""
    const nextImage = profile?.image ?? null
    setFormData({ full_name: nextName, image: nextImage })
  }, [profile?.full_name, profile?.image, user])

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
        setFormData((prev) => ({ ...prev, image: avatarUrl }))
      }
    } catch (err) {
      logError('Avatar upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (formData.image) {
      try {
        await removeAvatar()
        setFormData((prev) => ({ ...prev, image: null }))
      } catch (err) {
        logError('Avatar removal error:', err)
      }
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await updateProfile({ full_name: formData.full_name })
      setSuccess("Profile updated successfully")
      setTimeout(() => onOpenChangeAction(false), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
      logError('Profile update error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: changePasswordData.currentPassword,
          newPassword: changePasswordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setSuccess("Password changed successfully. Please sign in again.")
      setShowChangePassword(false)
      setChangePasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      
      setTimeout(() => {
        nextAuthSignOut({ callbackUrl: '/login' })
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (changeEmailData.newEmail === profile?.email) {
      setError("New email must be different from current email")
      return
    }

    setIsChangingEmail(true)
    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail: changeEmailData.newEmail,
          password: changeEmailData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change email')
      }

      setSuccess("Email changed successfully. Please sign in again with your new email.")
      setShowChangeEmail(false)
      setChangeEmailData({ newEmail: "", password: "" })
      
      setTimeout(() => {
        nextAuthSignOut({ callbackUrl: '/login' })
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change email")
    } finally {
      setIsChangingEmail(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setError("Please type DELETE to confirm account deletion")
      return
    }

    setError(null)
    setIsDeletingAccount(true)
    try {
      const password = prompt("Enter your password to confirm account deletion:")
      if (!password) {
        setIsDeletingAccount(false)
        return
      }

      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          confirmation: deleteConfirmText,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      setSuccess("Your account has been permanently deleted.")
      setShowDeleteConfirm(false)
      
      setTimeout(() => {
        nextAuthSignOut({ callbackUrl: '/' })
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account")
      setIsDeletingAccount(false)
    }
  }

  return (
    <Dialog open={_open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-dark-card border border-neon-cyan shadow-[0_0_20px_rgba(11,228,236,0.2)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Crown className="h-6 w-6 text-neon-purple" />
            Profile Settings
          </DialogTitle>
          <DialogDescription className="font-mono text-gray-300">
            Update your name and profile image. Changes are saved to your account.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-dark-bg border border-gray-800">
            <TabsTrigger value="profile" className="flex items-center gap-2 font-mono data-[state=active]:bg-dark-card data-[state=active]:text-neon-cyan">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2 font-mono data-[state=active]:bg-dark-card data-[state=active]:text-neon-cyan">
              <Shield className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-28 w-28 border-2 border-neon-purple shadow-[0_0_15px_rgba(179,0,255,0.25)]">
                  <AvatarImage src={formData.image || "/default-user.svg"} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-dark-bg text-white font-mono">
                    {formData.full_name?.trim()?.charAt(0) || (profile?.email || (user as any)?.email || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {formData.image && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={handleRemoveImage}
                    aria-label="Remove profile image"
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
                  className="bg-dark-bg border border-gray-700 hover:bg-dark-hover font-mono"
                  aria-label="Upload profile image"
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
              <p className="text-xs text-gray-500 text-center font-mono">Max 2MB. JPG/PNG recommended.</p>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="font-mono text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Your name"
                  className="font-mono"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="p-4 rounded-sm border border-gray-700 bg-dark-bg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gray-500">Email</span>
                  <span className="font-mono text-gray-300">{profile?.email || (user as any)?.primaryEmail || user?.email || "—"}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-gray-500">Subscription</span>
                  <Badge className={cn("font-mono", profile?.subscription_status === "active" ? "bg-dark-card border border-neon-lime text-neon-lime" : "bg-dark-card border border-neon-orange text-neon-orange")}>
                    {profile?.subscription_tier || "Free"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-white font-orbitron font-bold uppercase tracking-wider text-sm">
                  <Shield className="h-4 w-4 text-neon-cyan" />
                  Security
                </h3>
                
                {/* Change Password */}
                {!showChangePassword ? (
                  <div className="flex justify-between items-center p-3 border border-gray-700 rounded-sm bg-dark-bg">
                    <div>
                      <p className="font-mono text-gray-300">Change Password</p>
                      <p className="text-sm font-mono text-gray-500">Update your account password</p>
                    </div>
                    <Button variant="outline" onClick={() => setShowChangePassword(true)} className="font-mono">
                      <Key className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="p-4 border border-gray-700 rounded-sm bg-dark-bg space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="font-mono text-gray-300">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={changePasswordData.currentPassword}
                        onChange={(e) => setChangePasswordData({ ...changePasswordData, currentPassword: e.target.value })}
                        className="font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="font-mono text-gray-300">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={changePasswordData.newPassword}
                        onChange={(e) => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })}
                        className="font-mono"
                        required
                        minLength={8}
                      />
                      <p className="text-xs font-mono text-gray-500">Must be 8+ characters with uppercase, lowercase, and number</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="font-mono text-gray-300">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={changePasswordData.confirmPassword}
                        onChange={(e) => setChangePasswordData({ ...changePasswordData, confirmPassword: e.target.value })}
                        className="font-mono"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isChangingPassword} className="flex-1 bg-neon-purple hover:bg-neon-purple/80 font-mono">
                        {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowChangePassword(false)
                        setChangePasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
                      }} className="font-mono">
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {/* Change Email */}
                {!showChangeEmail ? (
                  <div className="flex justify-between items-center p-3 border border-gray-700 rounded-sm bg-dark-bg">
                    <div>
                      <p className="font-mono text-gray-300">Change Email</p>
                      <p className="text-sm font-mono text-gray-500">Update your email address</p>
                    </div>
                    <Button variant="outline" onClick={() => setShowChangeEmail(true)} className="font-mono">
                      <Mail className="h-4 w-4 mr-2" />
                      Change
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleChangeEmail} className="p-4 border border-gray-700 rounded-sm bg-dark-bg space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="newEmail" className="font-mono text-gray-300">New Email Address</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={changeEmailData.newEmail}
                        onChange={(e) => setChangeEmailData({ ...changeEmailData, newEmail: e.target.value })}
                        className="font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailPassword" className="font-mono text-gray-300">Current Password</Label>
                      <Input
                        id="emailPassword"
                        type="password"
                        value={changeEmailData.password}
                        onChange={(e) => setChangeEmailData({ ...changeEmailData, password: e.target.value })}
                        className="font-mono"
                        required
                      />
                      <p className="text-xs font-mono text-gray-500">Enter your current password to confirm</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isChangingEmail} className="flex-1 bg-neon-purple hover:bg-neon-purple/80 font-mono">
                        {isChangingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Email"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowChangeEmail(false)
                        setChangeEmailData({ newEmail: "", password: "" })
                      }} className="font-mono">
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Danger Zone */}
              <div className="space-y-3 pt-4 border-t border-gray-800">
                <h3 className="flex items-center gap-2 text-white font-orbitron font-bold uppercase tracking-wider text-sm text-neon-magenta">
                  <Trash2 className="h-4 w-4" />
                  Danger Zone
                </h3>
                
                {!showDeleteConfirm ? (
                  <div className="p-4 border border-neon-magenta/60 rounded-sm bg-dark-bg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono text-gray-300 font-bold">Delete Account</p>
                        <p className="text-sm font-mono text-gray-500 mt-1">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="font-mono">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-neon-magenta/60 rounded-sm bg-dark-bg space-y-3">
                    <p className="font-mono text-gray-300 text-sm">
                      This will permanently delete your account and all data. Type <span className="text-neon-magenta font-bold">DELETE</span> to confirm:
                    </p>
                    <div className="space-y-2">
                      <Input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="font-mono"
                      />
                      <Input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter your password"
                        className="font-mono"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount || deleteConfirmText !== 'DELETE' || !deletePassword}
                        className="flex-1 font-mono"
                      >
                        {isDeletingAccount ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Permanently Delete Account
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteConfirmText("")
                          setDeletePassword("")
                        }}
                        className="font-mono"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Error/Success Messages */}
        {error && (
          <Alert className="bg-dark-card border border-neon-magenta/60">
            <AlertTriangle className="h-4 w-4 text-neon-magenta" />
            <AlertDescription className="text-gray-300 font-mono">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-dark-card border border-neon-lime/60">
            <AlertDescription className="text-gray-300 font-mono">{success}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-800">
          <Button variant="outline" onClick={() => onOpenChangeAction(false)} className="bg-transparent font-mono">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-neon-purple hover:bg-neon-purple/80 text-white font-mono"
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
