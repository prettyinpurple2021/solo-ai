"use client"

import { logWarn,} from '@/lib/logger'
import { useAuth } from '@/hooks/use-auth'


export function useSafeUser() {
  try {
    const { user } = useAuth()
    return user
  } catch (error) {
    logWarn('Auth not available:', error)
    return null
  }
}

export function useSafeStackApp() {
  // Stack Auth has been removed, return null
  logWarn('Stack Auth has been removed from this application')
  return null
}