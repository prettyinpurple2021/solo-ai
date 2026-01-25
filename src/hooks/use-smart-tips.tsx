"use client"

import { useEffect, useCallback, useRef } from "react"
import { logInfo, logDebug } from "@/lib/logger"
import { SMART_TIPS,} from "@/components/ui/smart-tip"

interface TipTrigger {
  condition: () => boolean
  tipId: string
  delay?: number
  cooldown?: number
}

interface SmartTipConfig {
  enabled: boolean
  triggers: TipTrigger[]
}

export function useSmartTips(config: SmartTipConfig) {
  const cooldowns = useRef<Map<string, number>>(new Map())
  const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const showTip = useCallback((tipId: string) => {
    if (!config.enabled) return

    const tip = SMART_TIPS[tipId]
    if (!tip) {
      logDebug('Tip not found:', tipId)
      return
    }

    // Check cooldown
    const now = Date.now()
    const lastShown = cooldowns.current.get(tipId) || 0
    const cooldown = 5 * 60 * 1000 // 5 minutes default cooldown

    if (now - lastShown < cooldown) {
      logDebug('Tip on cooldown:', tipId)
      return
    }

    // Show tip via global function
    if (typeof window !== 'undefined' && (window as any).showSmartTip) {
      logInfo('Triggering smart tip:', tipId)
      ;(window as any).showSmartTip(tip)
      cooldowns.current.set(tipId, now)
    }
  }, [config.enabled])

  const checkTriggers = useCallback(() => {
    config.triggers.forEach(trigger => {
      const { condition, tipId, delay = 0, cooldown = 5 * 60 * 1000 } = trigger
      
      if (condition()) {
        const now = Date.now()
        const lastShown = cooldowns.current.get(tipId) || 0
        
        if (now - lastShown < cooldown) {
          return // Still on cooldown
        }

        // Clear any existing timeout for this tip
        const existingTimeout = timeouts.current.get(tipId)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
        }

        // Set new timeout
        const timeout = setTimeout(() => {
          showTip(tipId)
          timeouts.current.delete(tipId)
        }, delay)

        timeouts.current.set(tipId, timeout)
      }
    })
  }, [config.triggers, showTip])

  useEffect(() => {
    if (!config.enabled) return

    // Check triggers periodically
    const interval = setInterval(checkTriggers, 2000) // Check every 2 seconds

    return () => {
      clearInterval(interval)
      // Clear all timeouts
      timeouts.current.forEach(timeout => clearTimeout(timeout))
      timeouts.current.clear()
    }
  }, [config.enabled, checkTriggers])

  return { showTip }
}

// Predefined trigger conditions for common scenarios
export const TRIGGER_CONDITIONS = {
  // Goal-related triggers
  goalCreationStruggle: () => {
    const goalInput = document.querySelector('[data-goal-input]') as HTMLInputElement
    const goalText = goalInput?.value || ''
    return goalText.length > 50 && goalText.includes('and') && goalText.includes('also')
  },

  goalCreationEmpty: () => {
    const goalInput = document.querySelector('[data-goal-input]') as HTMLInputElement
    return goalInput && goalInput.value.length === 0 && goalInput === document.activeElement
  },

  // Task-related triggers
  taskOverwhelm: () => {
    const taskList = document.querySelector('[data-task-list]')
    const taskItems = taskList?.querySelectorAll('[data-task-item]') || []
    return taskItems.length > 10
  },

  taskCreationStruggle: () => {
    const taskInput = document.querySelector('[data-task-input]') as HTMLInputElement
    const taskText = taskInput?.value || ''
    return taskText.length > 30 && (taskText.includes('and') || taskText.includes('also'))
  },

  // AI chat triggers
  aiChatInefficient: () => {
    const chatInput = document.querySelector('[data-chat-input]') as HTMLInputElement
    const chatText = chatInput?.value || ''
    return chatText.length > 0 && (chatText.toLowerCase().includes('help') || chatText.toLowerCase().includes('what'))
  },

  aiChatEmpty: () => {
    const chatInput = document.querySelector('[data-chat-input]') as HTMLInputElement
    return chatInput && chatInput.value.length === 0 && chatInput === document.activeElement
  },

  // Navigation triggers
  navigationConfusion: () => {
    const currentPath = window.location.pathname
    const timeOnPage = performance.now()
    return timeOnPage > 30000 && (currentPath === '/dashboard' || currentPath === '/dashboard/slaylist')
  },

  // Feature discovery triggers
  featureDiscovery: () => {
    const hasUsedVoice = localStorage.getItem('voice-commands-used')
    const hasUsedSearch = localStorage.getItem('global-search-used')
    return !hasUsedVoice && !hasUsedSearch
  },

  // Productivity triggers
  productivityStruggle: () => {
    const taskList = document.querySelector('[data-task-list]')
    const completedTasks = taskList?.querySelectorAll('[data-task-completed="true"]') || []
    const totalTasks = taskList?.querySelectorAll('[data-task-item]') || []
    return totalTasks.length > 5 && completedTasks.length === 0
  }
}

// Hook for specific page/component tip management
export function usePageTips(pageName: string, triggers: TipTrigger[]) {
  const config: SmartTipConfig = {
    enabled: true,
    triggers: triggers.map(trigger => ({
      ...trigger,
      tipId: `${pageName}-${trigger.tipId}`
    }))
  }

  return useSmartTips(config)
}
