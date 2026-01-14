// @ts-nocheck
'use client'

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import React, { useState } from 'react'
import { Crown, Sparkles, Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import GlobalSearch from './GlobalSearch'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
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
  
  // Mock notifications - you can replace with real data
  const notifications = [
    { id: 1, title: "Welcome to SoloSuccess AI!", message: "Your profile is ready to go.", time: "2 min ago", unread: true },
    { id: 2, title: "Template Updated", message: "Your brand template has been saved.", time: "1 hour ago", unread: false },
    { id: 3, title: "New Features Available", message: "Check out the enhanced briefcase features.", time: "2 hours ago", unread: false },
  ]
  
  const unreadCount = notifications.filter(n => n.unread).length
  
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

  return (
    <div className={`bg-dark-bg/80 backdrop-blur-xl border-b border-neon-cyan/20 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Title or Search */}
        <div className="flex items-center gap-6 flex-1">
          {/* Sidebar Toggle */}
          <SidebarTrigger className="text-white hover:text-neon-cyan" />
          
          {title ? (
            <div>
              <div className="flex items-center gap-3">
                <Crown className="text-neon-magenta" size={24} />
                <h1 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-neon-cyan via-white to-neon-purple bg-clip-text text-transparent">
                  {title}
                </h1>
                <Sparkles className="text-neon-purple animate-pulse" size={20} />
              </div>
              {subtitle && (
                <p className="text-gray-400 font-mono mt-1">{subtitle}</p>
              )}
            </div>
          ) : null}
          
          {/* Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-md mx-auto">
              <GlobalSearch />
            </div>
          )}
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center gap-4">
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
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b border-gray-800 bg-dark-bg">
                <h4 className="font-orbitron font-semibold text-white">Notifications</h4>
                <p className="text-sm text-gray-400 font-mono">You have {unreadCount} unread notifications</p>
              </div>
              <div className="max-h-64 overflow-y-auto bg-dark-bg">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                    <p className="font-mono">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-800 last:border-b-0 hover:bg-dark-hover cursor-pointer ${
                        notification.unread ? 'bg-neon-purple/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-orbitron font-medium text-sm text-white">{notification.title}</p>
                          <p className="text-sm text-gray-400 font-mono mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 font-mono mt-2">{notification.time}</p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-neon-purple rounded-full mt-1 ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-4 border-t border-gray-800 bg-dark-bg">
                  <Button variant="outline" className="w-full text-sm border-neon-cyan/30 text-white hover:bg-dark-hover font-mono hover:text-neon-cyan hover:border-neon-cyan">
                    View All Notifications
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white font-bold text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="font-medium font-mono">
                  {(user as any)?.name || user?.email?.split('@')[0] || 'User'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-dark-card border-neon-cyan/30"
            >
              <DropdownMenuLabel className="font-orbitron font-bold text-white">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-dark-hover text-gray-300 focus:text-neon-cyan focus:bg-neon-cyan/10"
                onClick={handleProfileSettings}
              >
                <Crown className="mr-2 h-4 w-4 text-neon-cyan" />
                <span className="font-mono">Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-dark-hover text-gray-300 focus:text-neon-purple focus:bg-neon-purple/10"
                onClick={handleYourBriefcase}
              >
                <Sparkles className="mr-2 h-4 w-4 text-neon-purple" />
                <span className="font-mono">Your Briefcase</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-red-900/20 text-red-400 font-mono focus:bg-red-950/30 focus:text-red-300"
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