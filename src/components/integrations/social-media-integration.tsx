"use client"

import { logError,} from '@/lib/logger'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'


import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Settings,
  HelpCircle,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SocialMediaConnection {
  platform: string
  connected: boolean
  accountHandle?: string
  accountName?: string
  lastSyncedAt?: string
  isSyncing?: boolean
}

interface SocialMediaIntegrationProps {
  className?: string
}

export function SocialMediaIntegration({ className = "" }: SocialMediaIntegrationProps) {
  const [connections, setConnections] = useState<Record<string, SocialMediaConnection>>({
    linkedin: { platform: 'linkedin', connected: false },
    twitter: { platform: 'twitter', connected: false },
    facebook: { platform: 'facebook', connected: false },
    instagram: { platform: 'instagram', connected: false },
    youtube: { platform: 'youtube', connected: false }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showCredentialsDialog, setShowCredentialsDialog] = useState<string (null)
  const [credentials, setCredentials] = useState<Record<string, { clientId: string; clientSecret: string; instagramAccountId?: string }>>({})
  const { toast } = useToast()

  const checkConnections = useCallback(async () => {
    const platforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube']
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
    if (!token) return

    for (const platform of platforms) {
      try {
        const response = await fetch(`/api/integrations/social-media/${platform}?action=status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setConnections(prev => ({
            ...prev,
            [platform]: {
              ...prev[platform],
              connected: data.connected,
              accountHandle: data.accountHandle || data.account_handle,
              accountName: data.accountName || data.account_name,
              lastSyncedAt: data.lastSyncedAt || data.last_synced_at
            }
          }))
        }
      } catch (error) {
        logError(`Failed to check ${platform} connection:`, error)
      }
    }
  }, [])

  useEffect(() => {
    checkConnections()

    // Handle OAuth callbacks
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const platforms = ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube']
      
      for (const platform of platforms) {
        const code = urlParams.get(`${platform}_code`)
        const state = urlParams.get(`${platform}_state`)
        
        if (code && state) {
          await completeConnection(platform, code, state)
        }
      }
    }

    handleOAuthCallback()
  }, [checkConnections])

  const completeConnection = async (platform: string, code: string, state: string) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
    if (!token) return

    const creds = credentials[platform]
    if (!creds || !creds.clientId || !creds.clientSecret) {
      toast({
        title: "Credentials required",
        description: `Please enter your ${platform} API credentials first`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      
      // Prepare request body
      const body: any = {
        code,
        state,
        clientId: creds.clientId,
        clientSecret: creds.clientSecret
      }
      
      // Instagram requires Instagram Business Account ID
      if (platform === 'instagram' && (creds as any).instagramAccountId) {
        body.instagramAccountId = (creds as any).instagramAccountId
      }
      
      const response = await fetch(`/api/integrations/social-media/${platform}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        setConnections(prev => ({
          ...prev,
          [platform]: {
            ...prev[platform],
            connected: true,
            accountHandle: data.accountHandle,
            accountName: data.accountName
          }
        }))
        
        toast({
          title: `✅ Connected to ${getPlatformName(platform)}!`,
          description: "Your account is now synced with SoloSuccess AI",
        })

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      } else {
        throw new Error('Connection failed')
      }
    } catch (error) {
      logError(`Failed to complete ${platform} connection:`, error)
      toast({
        title: "❌ Connection failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (platform: string) => {
    const creds = credentials[platform]
    if (!creds || !creds.clientId || !creds.clientSecret) {
      setShowCredentialsDialog(platform)
      return
    }

    // Instagram Account ID is already stored in credentials from the dialog

    setIsLoading(true)
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
    if (!token) return

    try {
      let url: string
      
      if (platform === 'youtube') {
        // YouTube needs both clientId and clientSecret for OAuth URL generation
        const response = await fetch(`/api/integrations/social-media/${platform}?action=auth_url&clientId=${encodeURIComponent(creds.clientId)}&clientSecret=${encodeURIComponent(creds.clientSecret)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to get auth URL')
        }
        
        const data = await response.json()
        url = data.url
      } else {
        const response = await fetch(`/api/integrations/social-media/${platform}?action=auth_url&clientId=${encodeURIComponent(creds.clientId)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to get auth URL')
        }
        
        const data = await response.json()
        url = data.url
      }

      window.location.href = url
    } catch (error) {
      logError(`Failed to connect ${platform}:`, error)
      toast({
        title: "Connection failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleDisconnect = async (platform: string) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/integrations/social-media/${platform}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disconnect: true })
      })

      if (response.ok) {
        setConnections(prev => ({
          ...prev,
          [platform]: {
            ...prev[platform],
            connected: false,
            accountHandle: undefined,
            accountName: undefined
          }
        }))
        
        toast({
          title: "Account disconnected",
          description: `${getPlatformName(platform)} has been disconnected`,
        })
      }
    } catch (error) {
      logError(`Failed to disconnect ${platform}:`, error)
      toast({
        title: "Failed to disconnect",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async (platform: string) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token')
    if (!token) return

    try {
      setConnections(prev => ({
        ...prev,
        [platform]: { ...prev[platform], isSyncing: true }
      }))

      const response = await fetch(`/api/integrations/social-media/${platform}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast({
          title: "✅ Sync complete",
          description: `${getPlatformName(platform)} data has been updated`,
        })
        await checkConnections()
      }
    } catch (error) {
      logError(`Failed to sync ${platform}:`, error)
      toast({
        title: "Sync failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setConnections(prev => ({
        ...prev,
        [platform]: { ...prev[platform], isSyncing: false }
      }))
    }
  }

  const getPlatformName = (platform: string) => {
    const names: Record<string, string> = {
      linkedin: 'LinkedIn',
      twitter: 'Twitter/X',
      facebook: 'Facebook',
      instagram: 'Instagram',
      youtube: 'YouTube'
    }
    return names[platform] || platform
  }

  const getPlatformIcon = (platform: string) => {
    const icons = {
      linkedin: Linkedin,
      twitter: Twitter,
      facebook: Facebook,
      instagram: Instagram,
      youtube: Youtube
    }
    return icons[platform as keyof typeof icons] || ExternalLink
  }

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Social Media Integration
        </CardTitle>
        <CardDescription>
          Connect your social media accounts to monitor engagement and analyze performance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Info Banner */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Need help setting up API credentials?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                Each platform requires you to create your own developer app. Follow our step-by-step guides to get started.
              </p>
              <div className="flex gap-2 flex-wrap">
                <a
                  href="/docs/user-guides/SOCIAL_MEDIA_API_SETUP.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Full Setup Guide
                  </Button>
                </a>
                <a
                  href="/docs/user-guides/SOCIAL_MEDIA_CONNECTION_QUICK_START.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Quick Start
                  </Button>
                </a>
                <a
                  href="/docs/user-guides/SOCIAL_MEDIA_INTEGRATION_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Integration Guide
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Connections */}
        {Object.entries(connections).map(([platform, connection]) => {
          const Icon = getPlatformIcon(platform)
          
          return (
            <div
              key={platform}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  connection.connected 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    connection.connected 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getPlatformName(platform)}</span>
                    {connection.connected ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CheckCircle className="w-4 h-4 text-green-600 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Connected and active</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <XCircle className="w-4 h-4 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Not connected. Click Connect to set up.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`/docs/user-guides/SOCIAL_MEDIA_API_SETUP.md#${platform}-setup`, '_blank')
                            }}
                          >
                            <HelpCircle className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View setup guide for {getPlatformName(platform)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  {connection.connected ? (
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {connection.accountName && (
                        <p className="truncate">{connection.accountName}</p>
                      )}
                      {connection.accountHandle && (
                        <p className="truncate text-xs">@{connection.accountHandle}</p>
                      )}
                      <p className="text-xs">
                        Last synced: {formatLastSync(connection.lastSyncedAt)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Not connected
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {connection.connected ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(platform)}
                      disabled={isLoading || connection.isSyncing}
                    >
                      {connection.isSyncing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span className="ml-1">Sync</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnect(platform)}
                      disabled={isLoading}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(platform)}
                    disabled={isLoading}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          )
        })}

        {/* Credentials Dialog */}
        <Dialog open={showCredentialsDialog !== null} onOpenChange={(open) => !open && setShowCredentialsDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Enter {showCredentialsDialog && getPlatformName(showCredentialsDialog)} API Credentials
              </DialogTitle>
              <DialogDescription>
                You need to create a developer app on {showCredentialsDialog && getPlatformName(showCredentialsDialog)} first.
                <a
                  href="/docs/user-guides/SOCIAL_MEDIA_API_SETUP.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  View setup guide
                </a>
              </DialogDescription>
            </DialogHeader>
            
            {showCredentialsDialog && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    type="text"
                    placeholder="Enter your Client ID"
                    value={credentials[showCredentialsDialog]?.clientId || ''}
                    onChange={(e) => setCredentials(prev => ({
                      ...prev,
                      [showCredentialsDialog]: {
                        ...prev[showCredentialsDialog],
                        clientId: e.target.value,
                        clientSecret: prev[showCredentialsDialog]?.clientSecret || ''
                      }
                    }))}
                  />
                </div>
                
                  <div>
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      placeholder="Enter your Client Secret"
                      value={credentials[showCredentialsDialog]?.clientSecret || ''}
                      onChange={(e) => setCredentials(prev => ({
                        ...prev,
                        [showCredentialsDialog]: {
                          ...prev[showCredentialsDialog],
                          clientId: prev[showCredentialsDialog]?.clientId || '',
                          clientSecret: e.target.value
                        }
                      }))}
                    />
                  </div>

                  {showCredentialsDialog === 'instagram' && (
                    <div>
                      <Label htmlFor="instagramAccountId">Instagram Business Account ID</Label>
                      <Input
                        id="instagramAccountId"
                        type="text"
                        placeholder="Enter your Instagram Business Account ID"
                        value={(credentials[showCredentialsDialog] as any)?.instagramAccountId || ''}
                        onChange={(e) => setCredentials(prev => ({
                          ...prev,
                          [showCredentialsDialog]: {
                            ...prev[showCredentialsDialog],
                            ...(prev[showCredentialsDialog] || {}),
                            instagramAccountId: e.target.value
                          } as any
                        }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Find this in your Facebook Page settings → Instagram → Business Account ID
                      </p>
                    </div>
                  )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCredentialsDialog(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (showCredentialsDialog) {
                        handleConnect(showCredentialsDialog)
                      }
                    }}
                    disabled={
                      !credentials[showCredentialsDialog]?.clientId || 
                      !credentials[showCredentialsDialog]?.clientSecret ||
                      (showCredentialsDialog === 'instagram' && !(credentials[showCredentialsDialog] as any)?.instagramAccountId)
                    }
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

