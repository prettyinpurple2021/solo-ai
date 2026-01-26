"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { useProfile } from "@/hooks/use-profile-swr"
import { AlertTriangle, Camera, Loader2, Save, Shield, User, Trash2, Key, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { signOut as nextAuthSignOut } from "next-auth/react"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { user, signOut: authSignOut } = useAuth()
  const { profile, updateProfile, uploadAvatar, removeAvatar, isUpdating } = useProfile()
  const router = useRouter()

  const [error, setError] = useState<string (null)
  const [success, setSuccess] = useState<string (null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({ full_name: "" })
  
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
    const next = profile?.full_name || (user as any)?.displayName || ""
    setFormData({ full_name: next })
  }, [profile?.full_name, user])

  const signOut = async () => {
    if (user) await authSignOut()
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      await updateProfile({ full_name: formData.full_name })
      setSuccess("Profile updated.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)
    setSuccess(null)
    setIsUploading(true)
    try {
      await uploadAvatar(file)
      setSuccess("Profile image updated.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    setError(null)
    setSuccess(null)
    try {
      await removeAvatar()
      setSuccess("Profile image removed.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove image")
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
      
      // Sign out after password change for security
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
      
      // Sign out after email change
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

    if (!deletePassword) {
      setError("Password is required to delete account")
      return
    }

    setError(null)
    setIsDeletingAccount(true)
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmText,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      setSuccess("Your account has been permanently deleted.")
      setShowDeleteConfirm(false)
      
      // Sign out and redirect
      setTimeout(() => {
        nextAuthSignOut({ callbackUrl: '/' })
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account")
      setIsDeletingAccount(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-dark-card border border-neon-cyan shadow-[0_0_20px_rgba(11,228,236,0.2)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white font-orbitron font-bold uppercase tracking-wider">
            <User className="h-5 w-5 text-neon-purple" />
            Profile
          </DialogTitle>
          <DialogDescription className="font-mono text-gray-300">Manage your name and profile image</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-dark-bg border border-gray-800">
            <TabsTrigger value="profile" className="font-mono data-[state=active]:bg-dark-card data-[state=active]:text-neon-cyan">
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="font-mono data-[state=active]:bg-dark-card data-[state=active]:text-neon-cyan">
              Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border border-neon-purple">
                  <AvatarImage src={profile?.image || "/default-user.svg"} />
                  <AvatarFallback className="text-lg bg-dark-bg text-white font-mono">
                    {(profile?.full_name || profile?.email || (user as any)?.email || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <label className={cn("inline-flex items-center", isUploading && "opacity-60 pointer-events-none")}>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <span className="inline-flex">
                        <Button type="button" variant="outline" size="sm" className="font-mono" aria-label="Change profile image">
                          <Camera className="mr-2 h-4 w-4" />
                          Change Photo
                        </Button>
                      </span>
                    </label>
                    {profile?.image && (
                      <Button type="button" variant="outline" size="sm" className="font-mono" onClick={handleRemoveImage} aria-label="Remove profile image">
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-mono">JPG/PNG recommended. Max size 2MB.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="font-mono text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Your full name"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-mono text-gray-300">
                    Email
                  </Label>
                  <Input id="email" value={profile?.email || (user as any)?.primaryEmail || user?.email || ""} disabled className="bg-dark-bg font-mono" />
                </div>
              </div>

              <Button type="submit" disabled={isUpdating} className="w-full bg-neon-purple hover:bg-neon-purple/80 font-mono">
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 rounded-sm border border-gray-700 bg-dark-bg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-gray-500">Email</span>
                  <span className="font-mono text-gray-300">{profile?.email || "—"}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-gray-500">Subscription</span>
                  <span className="font-mono text-gray-300">{profile?.subscription_tier || "Free"}</span>
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

                {/* Sign Out */}
                <div className="flex justify-between items-center p-3 border border-gray-700 rounded-sm bg-dark-bg">
                  <div>
                    <p className="font-mono text-gray-300">Sign Out</p>
                    <p className="text-sm font-mono text-gray-500">End this session on this device</p>
                  </div>
                  <Button variant="outline" onClick={signOut} className="font-mono">
                    Sign Out
                  </Button>
                </div>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-mono">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

