"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Mic, Calendar, Target,} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface FloatingActionButtonProps {
  onAddTask: () => void
  onAddGoal: () => void
  onVoiceTask: () => void
  onQuickAdd: () => void
  className?: string
  hideOnDesktop?: boolean
}

export default function FloatingActionButton({
  onAddTask,
  onAddGoal,
  onVoiceTask,
  onQuickAdd,
  className = "",
  hideOnDesktop = true
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close expanded menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isExpanded) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
    return undefined
  }, [isExpanded])

  // Don't render on desktop if hideOnDesktop is true
  if (hideOnDesktop && !isMobile) {
    return null
  }

  const handleMainButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isExpanded) {
      setIsExpanded(false)
    } else {
      setIsExpanded(true)
      // Haptic feedback if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(25)
      }
    }
  }

  const handleActionClick = (action: () => void) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsExpanded(false)
      action()
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }
  }

  const actionButtons = [
    {
      icon: Plus,
      label: "Add Task",
      action: onAddTask,
      color: "bg-neon-cyan hover:bg-neon-cyan/80 shadow-[0_0_15px_rgba(11,228,236,0.5)]",
      delay: 0.1
    },
    {
      icon: Target,
      label: "Add Goal",
      action: onAddGoal,
      color: "bg-neon-purple hover:bg-neon-purple/80 shadow-[0_0_15px_rgba(179,0,255,0.5)]",
      delay: 0.15
    },
    {
      icon: Mic,
      label: "Voice Task",
      action: onVoiceTask,
      color: "bg-neon-magenta hover:bg-neon-magenta/80 shadow-[0_0_15px_rgba(255,0,110,0.5)]",
      delay: 0.2
    },
    {
      icon: Calendar,
      label: "Quick Add",
      action: onQuickAdd,
      color: "bg-neon-lime hover:bg-neon-lime/80 shadow-[0_0_15px_rgba(57,255,20,0.5)]",
      delay: 0.25
    }
  ]

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        {/* Action Buttons */}
        <AnimatePresence>
          {isExpanded && (
            <div className="absolute bottom-20 right-0 flex flex-col-reverse gap-3">
              {actionButtons.map((button,) => {
                const Icon = button.icon
                return (
                  <motion.div
                    key={button.label}
                    initial={{ scale: 0, opacity: 0, x: 20 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    exit={{ scale: 0, opacity: 0, x: 20 }}
                    transition={{ 
                      delay: button.delay,
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                    className="flex items-center gap-3"
                  >
                    {/* Label */}
                    <div className="bg-dark-card/95 backdrop-blur-sm rounded-sm px-3 py-2 shadow-[0_0_10px_rgba(11,228,236,0.2)] border border-gray-700">
                      <span className="text-sm font-mono font-medium text-gray-300 whitespace-nowrap">
                        {button.label}
                      </span>
                    </div>
                    
                    {/* Action Button */}
                    <Button
                      onClick={handleActionClick(button.action)}
                      className={cn(
                        "h-12 w-12 rounded-sm shadow-lg transition-all duration-200",
                        "border-2 border-dark-bg",
                        "transform hover:scale-110 active:scale-95",
                        button.color
                      )}
                    >
                      <Icon className="w-5 h-5 text-dark-bg" />
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            onClick={handleMainButtonClick}
            className={cn(
              "h-16 w-16 rounded-sm shadow-[0_0_25px_rgba(11,228,236,0.5)] transition-all duration-300",
              "bg-neon-cyan",
              "hover:bg-neon-cyan/90 hover:shadow-[0_0_35px_rgba(11,228,236,0.7)]",
              "border-2 border-dark-bg",
              "transform hover:scale-105 active:scale-95",
              isExpanded && "rotate-45"
            )}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-7 h-7 text-dark-bg" />
            </motion.div>
          </Button>

          {/* Pulse animation when not expanded */}
          {!isExpanded && (
            <motion.div
              className="absolute inset-0 rounded-sm bg-neon-cyan opacity-30"
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>

        {/* Hint text for first-time users */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 right-20 bg-dark-card/95 backdrop-blur-sm rounded-sm px-3 py-2 shadow-[0_0_10px_rgba(11,228,236,0.2)] border border-gray-700 max-w-[150px]"
          >
            <div className="text-xs text-gray-300 text-center font-mono">
              Tap for quick actions
            </div>
            <div className="absolute top-1/2 -right-1 w-2 h-2 bg-dark-card border-r border-b border-gray-700 transform rotate-45 -translate-y-1/2"></div>
          </motion.div>
        )}
      </div>
    </>
  )
}
