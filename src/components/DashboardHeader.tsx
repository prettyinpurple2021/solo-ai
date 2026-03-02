// @ts-nocheck
'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import React, { useState, useEffect } from 'react'
import { Crown, Sparkles, Bell, CheckCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import GlobalSearch from './GlobalSearch'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SidebarTrigger } from "@/components/ui/sidebar"


interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  className?: string
  showSearch?: boolean
  onOpenProfile?: () => void
}

interface Notification {
  id: number
  title: string
  message: string
  createdAt: string | Date
  read: boolean
  type: string
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  className = '',
  showSearch = true,
  onOpenProfile,
}) => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data)
        }
      } catch (error) {
        logError('Failed to fetch notifications', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
    
    // Set up polling for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [user])
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  const handleProfileSettings = () => {
    if (onOpenProfile) {
      onOpenProfile()
      return
    }
    router.push('/dashboard/settings')
  }
  
  const handleYourBriefcase = () => {
    router.push('/dashboard/briefcase')
  }
  
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      logError('Sign out error:', error)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (error) {
      logError('Failed to mark notification as read', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' })
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      logError('Failed to mark all notifications as read', error)
    }
  }

  return (
    <div className={`bg-dark-bg/80 backdrop-blur-xl border-b border-neon-cyan/20 px-4 md:px-6 py-3 md:py-4 ${className}`}>
      <div className="flex items-center justify-between gap-2 md:gap-4">
        {/* Left side - Title or Search */}
        <div className="flex items-center gap-2 md:gap-6 flex-1 min-w-0">
          {/* Sidebar Toggle */}
          <SidebarTrigger className="text-white hover:text-neon-cyan shrink-0" />
          
          {title ? (
            <div className="hidden sm:block min-w-0">
              <div className="flex items-center gap-2 md:gap-3">
                <Crown className="text-neon-magenta shrink-0" size={20} />
                <h1 className="text-lg md:text-2xl font-orbitron font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent truncate">
                  {title}
                </h1>
                <Sparkles className="text-neon-purple animate-pulse hidden md:block shrink-0" size={18} />
              </div>
              {subtitle && (
                <p className="text-gray-500 font-mono text-xs mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          ) : null}
          
          {/* Search Bar - Hidden on very small screens, visible on md+ */}
          {showSearch && (
            <div className="flex-1 max-w-md mx-auto hidden md:block">
              <GlobalSearch />
            </div>
          )}
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Mobile Search Trigger - only visible on mobile */}
          {showSearch && (
            <div className="md:hidden">
               <Button
                variant="ghost"
                size="icon"
                onClick={() => { /* Logic to open search if needed */ }}
                className="hover:bg-dark-elem text-white hover:text-neon-cyan transition-colors rounded-full"
              >
                <Search size={20} />
              </Button>
            </div>
          )}
          {/* Notifications */}
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-dark-elem text-white hover:text-neon-cyan transition-colors rounded-full"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-purple rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 transform transition-all duration-200" align="end">
              <div className="p-4 border-b border-gray-800 bg-dark-bg flex justify-between items-center">
                <div>
                  <h4 className="font-orbitron font-semibold text-white">Notifications</h4>
                  <p className="text-sm text-gray-400 font-mono">You have {unreadCount} unread notifications</p>
                </div>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleMarkAllAsRead}
                    className="h-8 px-2 text-xs text-neon-cyan hover:text-neon-cyan/80 hover:bg-neon-cyan/10"
                    title="Mark all as read"
                  >
                    <CheckCheck size={16} />
                  </Button>
                )}
              </div>
              <div className="max-h-[60vh] overflow-y-auto bg-dark-bg scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {loading ? (
                   <div className="p-8 text-center text-gray-400">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan mx-auto mb-2"></div>
                     <p className="font-mono text-xs">Loading...</p>
                   </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-500 opacity-50" />
                    <p className="font-mono text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                      className={`p-4 border-b border-gray-800 last:border-b-0 hover:bg-dark-hover transition-colors cursor-pointer group ${
                        !notification.read ? 'bg-neon-purple/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-orbitron text-sm text-white ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                              {notification.title}
                            </p>
                            <span className="text-[10px] text-gray-500 font-mono whitespace-nowrap ml-2">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-mono line-clamp-2 group-hover:text-gray-300 transition-colors">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-neon-purple rounded-full mt-1.5 flex-shrink-0 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
               {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-800 bg-dark-bg/95 backdrop-blur supports-[backdrop-filter]:bg-dark-bg/60">
                  <Button variant="ghost" className="w-full h-9 text-xs text-gray-400 hover:text-white hover:bg-dark-elem font-mono transition-colors">
                    View All Activity
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 hover:bg-dark-hover text-white hover:text-neon-cyan transition-all duration-200 px-3 py-2 rounded-full"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-neon-cyan/40"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-neon-cyan/20">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="font-medium font-mono hidden md:inline-block max-w-[100px] truncate">
                  {(user as any)?.name || user?.email?.split('@')[0] || 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-dark-card border border-neon-cyan/20 shadow-xl shadow-black/50"
            >
              <DropdownMenuLabel className="font-orbitron font-bold text-white px-3 py-2">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-dark-hover text-gray-300 focus:text-neon-cyan focus:bg-neon-cyan/10 px-3 py-2.5 my-0.5"
                onClick={handleProfileSettings}
              >
                <Crown className="mr-2 h-4 w-4 text-neon-cyan" />
                <span className="font-mono text-sm">Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-dark-hover text-gray-300 focus:text-neon-purple focus:bg-neon-purple/10 px-3 py-2.5 my-0.5"
                onClick={handleYourBriefcase}
              >
                <Sparkles className="mr-2 h-4 w-4 text-neon-purple" />
                <span className="font-mono text-sm">Your Briefcase</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-red-900/10 text-red-400 font-mono text-sm focus:bg-red-900/20 focus:text-red-300 px-3 py-2.5 my-0.5"
                onClick={handleSignOut}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default DashboardHeader
