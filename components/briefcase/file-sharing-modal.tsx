"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Share2, 
  Copy, 
  Link, 
  Mail, 
  Users, 
  Shield, 
  Calendar, 
  Clock,
  Eye,
  Edit,
  Download,
  MessageCircle,
  Settings,
  Trash2,
  Plus,
  Check,
  X,
  Globe,
  Lock,
  UserCheck,
  AlertTriangle,
  QrCode,
  Smartphone,
  Crown,
  Sparkles
} from 'lucide-react'

interface BriefcaseFile {
  id: string
  name: string
  size: number
  type: string
  category: string
  createdAt: Date
  modifiedAt: Date
  tags: string[]
  description?: string
  folderId?: string
  favorite: boolean
}

interface SharePermission {
  id: string
  userId?: string
  email: string
  name: string
  avatar?: string
  role: 'viewer' | 'commenter' | 'editor' | 'admin'
  granted: Date
  lastAccess?: Date
  status: 'pending' | 'accepted' | 'declined'
  accessCount: number
  invitedBy: string
}

interface ShareLink {
  id: string
  url: string
  password?: string
  expiresAt?: Date
  permissions: 'view' | 'comment' | 'edit'
  downloadEnabled: boolean
  accessCount: number
  maxAccess?: number
  createdAt: Date
  isActive: boolean
  requireAuth: boolean
  trackAccess: boolean
}

interface CollaborationActivity {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  action: 'viewed' | 'commented' | 'edited' | 'downloaded' | 'shared'
  timestamp: Date
  details?: string
  metadata?: Record<string, any>
}

interface FileSharingModalProps {
  isOpen: boolean
  onClose: () => void
  file: BriefcaseFile | null
  currentUserId: string
  currentUserName: string
}

export default function FileSharingModal({ 
  isOpen, 
  onClose, 
  file, 
  currentUserId, 
  currentUserName 
}: FileSharingModalProps) {
  const [activeTab, setActiveTab] = useState<'share' | 'permissions' | 'links' | 'activity'>('share')
  const [permissions, setPermissions] = useState<SharePermission[]>([])
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [activity, setActivity] = useState<CollaborationActivity[]>([])
  const [loading, setLoading] = useState(false)

  // Share form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'viewer' | 'commenter' | 'editor'>('viewer')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteSuggestions, setInviteSuggestions] = useState<Array<{
    email: string
    name: string
    avatar?: string
    isTeammate: boolean
  }>>([])

  // Link sharing state
  const [newLinkForm, setNewLinkForm] = useState({
    permissions: 'view' as 'view' | 'comment' | 'edit',
    password: '',
    expiresIn: '7' as '1' | '7' | '30' | 'never',
    downloadEnabled: true,
    maxAccess: '',
    requireAuth: false,
    trackAccess: true
  })
  
  const { toast } = useToast()

  // Load sharing data when modal opens
  useEffect(() => {
    if (isOpen && file) {
      loadSharingData()
    }
  }, [isOpen, file])

  const loadSharingData = useCallback(async () => {
    if (!file) return
    
    setLoading(true)
    try {
      // Load permissions
      const permissionsResponse = await fetch(`/api/briefcase/files/${file.id}/permissions`)
      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json()
        setPermissions(permissionsData)
      }

      // Load share links
      const linksResponse = await fetch(`/api/briefcase/files/${file.id}/share-links`)
      if (linksResponse.ok) {
        const linksData = await linksResponse.json()
        setShareLinks(linksData)
      }

      // Load activity
      const activityResponse = await fetch(`/api/briefcase/files/${file.id}/activity`)
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setActivity(activityData)
      }

    } catch (error) {
      console.error('Failed to load sharing data:', error)
      toast({
        title: "Error",
        description: "Failed to load sharing information",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [file, toast])

  // Send email invitation
  const sendInvitation = useCallback(async () => {
    if (!file || !inviteEmail.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          message: inviteMessage,
          invitedBy: currentUserId
        })
      })

      if (!response.ok) throw new Error('Failed to send invitation')

      const newPermission = await response.json()
      setPermissions(prev => [...prev, newPermission])
      
      // Reset form
      setInviteEmail('')
      setInviteMessage('')
      setInviteSuggestions([])

      toast({
        title: "Invitation sent",
        description: `Invited ${inviteEmail} as ${inviteRole}`,
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [file, inviteEmail, inviteRole, inviteMessage, currentUserId, toast])

  // Create share link
  const createShareLink = useCallback(async () => {
    if (!file) return

    setLoading(true)
    try {
      const expiresAt = newLinkForm.expiresIn === 'never' ? null : 
        new Date(Date.now() + parseInt(newLinkForm.expiresIn) * 24 * 60 * 60 * 1000)

      const response = await fetch(`/api/briefcase/files/${file.id}/share-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permissions: newLinkForm.permissions,
          password: newLinkForm.password || null,
          expiresAt,
          downloadEnabled: newLinkForm.downloadEnabled,
          maxAccess: newLinkForm.maxAccess ? parseInt(newLinkForm.maxAccess) : null,
          requireAuth: newLinkForm.requireAuth,
          trackAccess: newLinkForm.trackAccess
        })
      })

      if (!response.ok) throw new Error('Failed to create share link')

      const newLink = await response.json()
      setShareLinks(prev => [...prev, newLink])

      // Reset form
      setNewLinkForm({
        permissions: 'view',
        password: '',
        expiresIn: '7',
        downloadEnabled: true,
        maxAccess: '',
        requireAuth: false,
        trackAccess: true
      })

      toast({
        title: "Share link created",
        description: "Link copied to clipboard",
      })

      // Copy to clipboard
      await navigator.clipboard.writeText(newLink.url)

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [file, newLinkForm, toast])

  // Update permission role
  const updatePermissionRole = useCallback(async (permissionId: string, role: string) => {
    if (!file) return

    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/permissions/${permissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })

      if (!response.ok) throw new Error('Failed to update permission')

      setPermissions(prev => prev.map(p => 
        p.id === permissionId ? { ...p, role: role as any } : p
      ))

      toast({
        title: "Permission updated",
        description: `Updated role to ${role}`,
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permission",
        variant: "destructive"
      })
    }
  }, [file, toast])

  // Remove permission
  const removePermission = useCallback(async (permissionId: string) => {
    if (!file) return

    try {
      const response = await fetch(`/api/briefcase/files/${file.id}/permissions/${permissionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to remove permission')

      setPermissions(prev => prev.filter(p => p.id !== permissionId))

      toast({
        title: "Access removed",
        description: "User access has been revoked",
      })

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove access",
        variant: "destructive"
      })
    }
  }, [file, toast])

  // Copy link to clipboard
  const copyLinkToClipboard = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "Copied",
        description: "Link copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      })
    }
  }, [toast])

  // Search for team members
  const searchTeamMembers = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setInviteSuggestions([])
      return
    }

    try {
      const response = await fetch(`/api/team/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const suggestions = await response.json()
        setInviteSuggestions(suggestions.slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to search team members:', error)
    }
  }, [])

  // Handle email input change with suggestions
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInviteEmail(value)
    searchTeamMembers(value)
  }, [searchTeamMembers])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700'
      case 'editor': return 'bg-blue-100 text-blue-700'
      case 'commenter': return 'bg-yellow-100 text-yellow-700'
      case 'viewer': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3" />
      case 'editor': return <Edit className="w-3 h-3" />
      case 'commenter': return <MessageCircle className="w-3 h-3" />
      case 'viewer': return <Eye className="w-3 h-3" />
      default: return <Shield className="w-3 h-3" />
    }
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'viewed': return <Eye className="w-4 h-4 text-blue-600" />
      case 'commented': return <MessageCircle className="w-4 h-4 text-green-600" />
      case 'edited': return <Edit className="w-4 h-4 text-purple-600" />
      case 'downloaded': return <Download className="w-4 h-4 text-orange-600" />
      case 'shared': return <Share2 className="w-4 h-4 text-pink-600" />
      default: return <Settings className="w-4 h-4 text-gray-600" />
    }
  }

  if (!file) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-600" />
            Share "{file.name}"
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="share" className="flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              Share
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              People ({permissions.length})
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-1">
              <Link className="w-3 h-3" />
              Links ({shareLinks.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Share Tab */}
          <TabsContent value="share" className="space-y-6">
            <div className="grid gap-6">
              {/* Invite People */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Invite People
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Label>Email address</Label>
                    <Input
                      type="email"
                      placeholder="Enter email address..."
                      value={inviteEmail}
                      onChange={handleEmailChange}
                      className="mt-1"
                    />
                    
                    {/* Email suggestions dropdown */}
                    <AnimatePresence>
                      {inviteSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg"
                        >
                          {inviteSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setInviteEmail(suggestion.email)
                                setInviteSuggestions([])
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={suggestion.avatar} />
                                <AvatarFallback className="text-xs">
                                  {suggestion.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium">{suggestion.name}</div>
                                <div className="text-xs text-gray-500">{suggestion.email}</div>
                              </div>
                              {suggestion.isTeammate && (
                                <Badge variant="outline" className="ml-auto text-xs">Team</Badge>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <Label>Role</Label>
                    <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div className="flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            Viewer - Can view only
                          </div>
                        </SelectItem>
                        <SelectItem value="commenter">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-3 h-3" />
                            Commenter - Can view and comment
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center gap-2">
                            <Edit className="w-3 h-3" />
                            Editor - Can view, comment, and edit
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Personal message (optional)</Label>
                    <Textarea
                      placeholder="Add a personal message to the invitation..."
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <Button 
                    onClick={sendInvitation}
                    disabled={!inviteEmail.trim() || loading}
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Share Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Create Share Link
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Access level</Label>
                      <Select 
                        value={newLinkForm.permissions} 
                        onValueChange={(value: any) => setNewLinkForm(prev => ({ ...prev, permissions: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">View only</SelectItem>
                          <SelectItem value="comment">View and comment</SelectItem>
                          <SelectItem value="edit">View, comment, and edit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Expires</Label>
                      <Select 
                        value={newLinkForm.expiresIn} 
                        onValueChange={(value: any) => setNewLinkForm(prev => ({ ...prev, expiresIn: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 day</SelectItem>
                          <SelectItem value="7">1 week</SelectItem>
                          <SelectItem value="30">1 month</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={newLinkForm.downloadEnabled}
                        onCheckedChange={(checked) => setNewLinkForm(prev => ({ ...prev, downloadEnabled: checked }))}
                      />
                      <Label>Allow downloads</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={newLinkForm.requireAuth}
                        onCheckedChange={(checked) => setNewLinkForm(prev => ({ ...prev, requireAuth: checked }))}
                      />
                      <Label>Require sign-in</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Password protection (optional)</Label>
                    <Input
                      type="password"
                      placeholder="Enter password..."
                      value={newLinkForm.password}
                      onChange={(e) => setNewLinkForm(prev => ({ ...prev, password: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    onClick={createShareLink}
                    disabled={loading}
                    className="w-full"
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Create Link
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-4">
            <ScrollArea className="max-h-96">
              <div className="space-y-3">
                {permissions.map((permission) => (
                  <motion.div
                    key={permission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={permission.avatar} />
                        <AvatarFallback>
                          {permission.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-gray-500">{permission.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleColor(permission.role)}>
                            {getRoleIcon(permission.role)}
                            <span className="ml-1 capitalize">{permission.role}</span>
                          </Badge>
                          {permission.status === 'pending' && (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select 
                        value={permission.role} 
                        onValueChange={(value) => updatePermissionRole(permission.id, value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="commenter">Commenter</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePermission(permission.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                
                {permissions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No one has access yet</p>
                    <p className="text-sm">Invite people to collaborate on this file</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-4">
            <ScrollArea className="max-h-96">
              <div className="space-y-3">
                {shareLinks.map((link) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        <span className="font-medium">Share Link</span>
                        <Badge className={getRoleColor(link.permissions)}>
                          {link.permissions}
                        </Badge>
                        {link.password && (
                          <Badge variant="outline">
                            <Lock className="w-3 h-3 mr-1" />
                            Protected
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyLinkToClipboard(link.url)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* TODO: Delete link */}}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {link.accessCount} views
                        </span>
                        {link.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expires {link.expiresAt.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-mono bg-gray-50 p-2 rounded truncate">
                        {link.url}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {shareLinks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No share links created yet</p>
                    <p className="text-sm">Create shareable links for easy access</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <ScrollArea className="max-h-96">
              <div className="space-y-3">
                {activity.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={item.userAvatar} />
                      <AvatarFallback className="text-xs">
                        {item.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(item.action)}
                        <span className="text-sm">
                          <strong>{item.userName}</strong> {item.action} the file
                        </span>
                      </div>
                      {item.details && (
                        <div className="text-xs text-gray-500 mt-1">{item.details}</div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {item.timestamp.toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
                
                {activity.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No activity yet</p>
                    <p className="text-sm">Activity will appear here when people interact with the file</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={() => copyLinkToClipboard(window.location.href)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            Copy File Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
