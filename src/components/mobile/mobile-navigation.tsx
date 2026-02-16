"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  Target,
  Users,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  Search,
  Plus,
  Bell,
  User,
  ChevronRight,
  Calendar,
  CheckSquare,
  Briefcase,
  MessageCircle,
  Clock,
  Zap,
  Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter, usePathname } from 'next/navigation'
import { SoloSuccessLogo } from '@/components/cyber/SoloSuccessLogo'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
  color?: string
  isNew?: boolean
  quickActions?: QuickAction[]
}

interface QuickAction {
  id: string
  label: string

  icon: React.ComponentType<{ className?: string }>
  action: () => void
}

interface MobileNavigationProps {
  user?: {
    name: string
    email?: string
    avatar?: string
    level?: number
    points?: number
  }
  notifications?: number
  onNotificationClick?: () => void
  className?: string
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    color: 'text-neon-purple',
    quickActions: [
      { id: 'overview', label: 'Overview', icon: BarChart3, action: () => { } },
      { id: 'insights', label: 'Insights', icon: Zap, action: () => { } }
    ]
  },
  {
    id: 'tasks',
    label: 'SlayList',
    icon: CheckSquare,
    href: '/dashboard/slaylist',
    color: 'text-neon-lime',
    quickActions: [
      { id: 'add_task', label: 'New Task', icon: Plus, action: () => { } },
      { id: 'today', label: "Today's Tasks", icon: Calendar, action: () => { } }
    ]
  },
  {
    id: 'goals',
    label: 'Goals',
    icon: Target,
    href: '/dashboard/goals',
    color: 'text-neon-orange',
    quickActions: [
      { id: 'add_goal', label: 'New Goal', icon: Target, action: () => { } },
      { id: 'progress', label: 'Progress', icon: BarChart3, action: () => { } }
    ]
  },
  {
    id: 'agents',
    label: 'AI Squad',
    icon: Users,
    href: '/dashboard/agents',
    color: 'text-neon-cyan',
    badge: 2,
    quickActions: [
      { id: 'roxy', label: 'Chat Roxy', icon: MessageCircle, action: () => { } },
      { id: 'blaze', label: 'Chat Blaze', icon: Zap, action: () => { } }
    ]
  },
  {
    id: 'nexus',
    label: 'The Nexus',
    icon: Users,
    href: '/dashboard/nexus',
    color: 'text-neon-purple',
    quickActions: [
      { id: 'new_post', label: 'Broadcast', icon: Plus, action: () => { } } // 'Plus' needs to be verified if available or imported
    ]
  },
  {
    id: 'briefcase',
    label: 'Briefcase',
    icon: Briefcase,
    href: '/dashboard/briefcase',
    color: 'text-neon-purple',
    quickActions: [
      { id: 'upload', label: 'Upload File', icon: Plus, action: () => { } },
      { id: 'recent', label: 'Recent Files', icon: Clock, action: () => { } }
    ]
  },
  {
    id: 'incinerator',
    label: 'Incinerator',
    icon: Target,
    href: '/dashboard/incinerator',
    color: 'text-neon-magenta',
    quickActions: [
      { id: 'new_idea', label: 'New Idea', icon: Plus, action: () => { } }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/dashboard/analytics',
    color: 'text-neon-cyan',
    quickActions: [
      { id: 'overview', label: 'Overview', icon: Home, action: () => { } },
      { id: 'reports', label: 'Reports', icon: FileText, action: () => { } }
    ]
  }
]

const SWIPE_THRESHOLD = 150

export default function MobileNavigation({
  user,
  notifications = 0,
  onNotificationClick,
  className = ""
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<string | null>(null)
  const [showQuickActions, setShowQuickActions] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const navRef = useRef<HTMLDivElement>(null)

  // Detect swipe gestures to open/close navigation
  const handleSwipe = (event: any, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD && info.velocity.x > 0) {
      setIsOpen(true)
    } else if (info.offset.x < -SWIPE_THRESHOLD && info.velocity.x < 0) {
      setIsOpen(false)
    }
  }

  // Close navigation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowQuickActions(null)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside as any)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside as any)
    }
  }, [isOpen])

  // Set active item based on current path
  useEffect(() => {
    const activeNav = navigationItems.find(item => pathname.startsWith(item.href))
    setActiveItem(activeNav?.id || null)
  }, [pathname])

  const handleItemClick = (item: NavigationItem) => {
    if (item.quickActions && item.quickActions.length > 0) {
      setShowQuickActions(showQuickActions === item.id ? null : item.id)
    } else {
      router.push(item.href)
      setIsOpen(false)
    }
  }

  const handleQuickAction = (action: QuickAction) => {
    action.action()
    setIsOpen(false)
    setShowQuickActions(null)
  }

  const navVariants = {
    closed: {
      x: -320,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 }
    },
    open: {
      x: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 30 }
    }
  }

  const overlayVariants = {
    closed: { opacity: 0, pointerEvents: 'none' as const },
    open: { opacity: 1, pointerEvents: 'auto' as const }
  }

  return (
    <>
      {/* Mobile Header */}
      <motion.div
        className={cn(
          "lg:hidden sticky top-0 z-40 w-full bg-cyber-black/90 backdrop-blur-md border-b border-cyber-cyan/20",
          className
        )}
        initial={false}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 touch-target"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <SoloSuccessLogo size={32} animated={false} />
              <div>
                <h1 className="font-sci font-bold text-lg text-white">
                  SOLO<span className="text-cyber-cyan">SUCCESS</span>
                </h1>
                <div className="text-xs text-cyber-purple">
                  {navigationItems.find(item => item.id === activeItem)?.label || 'Dashboard'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 touch-target"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 relative touch-target"
              onClick={onNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-neon-magenta text-white rounded-sm flex items-center justify-center font-mono">
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </Button>

            {/* User Avatar */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 touch-target"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-r from-neon-purple to-neon-cyan text-white text-xs">
                  {user?.name?.charAt(0) || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>

        {/* Swipe detector */}
        <motion.div
          className="absolute left-0 top-0 w-6 h-full"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleSwipe}
        />
      </motion.div>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="lg:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Side Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={navRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={navVariants}
            className="lg:hidden fixed left-0 top-0 z-50 h-full w-80 bg-dark-bg border-r border-gray-800 shadow-[0_0_20px_rgba(11,228,236,0.2)]"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-dark-card text-white">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-dark-hover text-white font-mono">
                      {user?.name?.charAt(0) || <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold font-orbitron uppercase tracking-wider">{user?.name || 'Welcome!'}</div>
                    <div className="text-xs text-gray-300 font-mono">
                      Level {user?.level || 1} • {user?.points || 0} points
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-dark-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-4">
                  {navigationItems.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <motion.button
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-sm text-left transition-colors touch-target",
                          activeItem === item.id
                            ? "bg-dark-card text-neon-purple border-l-4 border-neon-purple"
                            : "text-gray-300 hover:bg-dark-hover",
                          item.isNew && "relative"
                        )}
                        onClick={() => handleItemClick(item)}
                        whileTap={{ scale: 0.98 }}
                      >
                        <item.icon className={cn("h-5 w-5", item.color)} />
                        <span className="flex-1 font-medium font-mono">{item.label}</span>

                        {item.badge && (
                          <Badge className="h-5 px-2 text-xs bg-neon-magenta text-white font-mono">
                            {item.badge}
                          </Badge>
                        )}

                        {item.isNew && (
                          <Badge className="h-5 px-2 text-xs bg-neon-lime text-white font-mono">
                            New
                          </Badge>
                        )}

                        {item.quickActions && (
                          <ChevronRight className={cn(
                            "h-4 w-4 transition-transform",
                            showQuickActions === item.id && "rotate-90"
                          )} />
                        )}
                      </motion.button>

                      {/* Quick Actions */}
                      <AnimatePresence>
                        {showQuickActions === item.id && item.quickActions && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden ml-8 space-y-1"
                          >
                            {item.quickActions.map((action) => (
                              <motion.button
                                key={action.id}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-dark-hover rounded-sm transition-colors touch-target font-mono"
                                onClick={() => handleQuickAction(action)}
                                whileTap={{ scale: 0.98 }}
                              >
                                <action.icon className="h-4 w-4" />
                                <span>{action.label}</span>
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t p-4 space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 touch-target"
                  onClick={() => {
                    router.push('/dashboard/settings')
                    setIsOpen(false)
                  }}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Button>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-dark-card border border-gray-700 rounded-sm">
                    <div className="font-bold text-neon-purple font-mono">12</div>
                    <div className="text-gray-300 font-mono">Tasks</div>
                  </div>
                  <div className="p-2 bg-dark-card border border-gray-700 rounded-sm">
                    <div className="font-bold text-neon-lime font-mono">87%</div>
                    <div className="text-gray-300 font-mono">Progress</div>
                  </div>
                  <div className="p-2 bg-dark-card border border-gray-700 rounded-sm">
                    <div className="font-bold text-neon-cyan font-mono">5</div>
                    <div className="text-gray-300 font-mono">Goals</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation for Mobile */}
      <motion.div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-bg border-t border-gray-800 safe-area-pb"
        initial={false}
      >
        <div className="grid grid-cols-5 gap-1 p-2">
          {navigationItems.slice(0, 5).map((item) => (
            <motion.button
              key={item.id}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-sm transition-colors touch-target",
                activeItem === item.id
                  ? "bg-dark-card text-neon-purple"
                  : "text-gray-300 hover:bg-dark-hover"
              )}
              onClick={() => {
                router.push(item.href)
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon-magenta rounded-sm" />
                )}
              </div>
              <span className="text-xs font-medium truncate w-full text-center font-mono">
                {item.label.split(' ')[0]}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </>
  )
}
