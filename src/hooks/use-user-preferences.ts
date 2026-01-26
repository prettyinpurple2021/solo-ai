// @ts-nocheck
import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'


interface UseUserPreferencesOptions {
  defaultValues?: Record<string, any>
  fallbackToLocalStorage?: boolean
}

interface UserPreferencesHook {
  preferences: Record<string, any>
  loading: boolean
  error: string | null
  setPreference: (key: string, value: any) => Promise<void>
  setPreferences: (prefs: Record<string, any>) => Promise<void>
  getPreference: {
    <T>(key: string, defaultValue: T): T
    <T>(key: string): T | undefined
  }
  removePreference: (key: string) => Promise<void>
  refreshPreferences: () => Promise<void>
}

export function useUserPreferences(
  options: UseUserPreferencesOptions = {}
): UserPreferencesHook {
  const { getToken } = useAuth()
  const [preferences, setPreferencesState] = useState<Record<string, any>>(options.defaultValues || {})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadingRef = useRef(false) // Prevent multiple simultaneous calls

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  }, []) // Remove getToken dependency to prevent unnecessary re-renders

  // Load preferences from server or fallback to localStorage
  const refreshPreferences = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) return
    
    try {
      loadingRef.current = true
      setLoading(true)
      setError(null)

      const headers = await getAuthHeaders()
      const response = await fetch('/api/preferences', {
        method: 'GET',
        headers,
      })

      if (response.ok) {
        const data = await response.json()
        setPreferencesState(data.preferences || {})
      } else if (response.status === 401) {
        // 401 is expected for anonymous users - return empty preferences
        setPreferencesState(options.defaultValues || {})
        setError(null)
      } else if (options.fallbackToLocalStorage) {
        // Fallback to localStorage for anonymous users or on error
        const fallbackPrefs = { ...options.defaultValues }
        
        // Load from localStorage if available
        Object.keys(fallbackPrefs).forEach(key => {
          try {
            const stored = localStorage.getItem(`pref_${key}`)
            if (stored !== null) {
              fallbackPrefs[key] = JSON.parse(stored)
            }
          } catch {
            // Ignore localStorage errors
          }
        })
        
        setPreferencesState(fallbackPrefs)
      }
    } catch (err) {
      logError('Failed to load preferences:', err)
      setError(err instanceof Error ? err.message : 'Failed to load preferences')
      
      if (options.fallbackToLocalStorage) {
        // Use localStorage as fallback
        const fallbackPrefs = { ...options.defaultValues }
        Object.keys(fallbackPrefs).forEach(key => {
          try {
            const stored = localStorage.getItem(`pref_${key}`)
            if (stored !== null) {
              fallbackPrefs[key] = JSON.parse(stored)
            }
          } catch {
            // Ignore localStorage errors
          }
        })
        setPreferencesState(fallbackPrefs)
      }
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [getAuthHeaders, options.defaultValues, options.fallbackToLocalStorage])

  // Set a single preference
  const setPreference = useCallback(async (key: string, value: any) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers,
        body: JSON.stringify({ key, value }),
      })

      if (response.ok) {
        setPreferencesState(prev => ({ ...prev, [key]: value }))
        setError(null)
      } else if (options.fallbackToLocalStorage) {
        // Fallback to localStorage
        try {
          localStorage.setItem(`pref_${key}`, JSON.stringify(value))
          setPreferencesState(prev => ({ ...prev, [key]: value }))
        } catch (localErr) {
          logError('Failed to save to localStorage:', localErr)
          throw new Error('Failed to save preference')
        }
      } else {
        throw new Error('Failed to save preference')
      }
    } catch (err) {
      logError('Failed to set preference:', err)
      setError(err instanceof Error ? err.message : 'Failed to save preference')
      throw err
    }
  }, [getAuthHeaders, options.fallbackToLocalStorage])

  // Set multiple preferences at once
  const setPreferences = useCallback(async (prefs: Record<string, any>) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers,
        body: JSON.stringify({ preferences: prefs }),
      })

      if (response.ok) {
        setPreferencesState(prev => ({ ...prev, ...prefs }))
        setError(null)
      } else if (options.fallbackToLocalStorage) {
        // Fallback to localStorage
        try {
          Object.entries(prefs).forEach(([key, value]) => {
            localStorage.setItem(`pref_${key}`, JSON.stringify(value))
          })
          setPreferencesState(prev => ({ ...prev, ...prefs }))
        } catch (localErr) {
          logError('Failed to save to localStorage:', localErr)
          throw new Error('Failed to save preferences')
        }
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (err) {
      logError('Failed to set preferences:', err)
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
      throw err
    }
  }, [getAuthHeaders, options.fallbackToLocalStorage])

  // Get a specific preference with optional default value
  const getPreference = useCallback((<T>(key: string, defaultValue?: T): T | undefined => {
    return preferences[key] !== undefined ? preferences[key] : defaultValue
  }) as {
    <T>(key: string, defaultValue: T): T
    <T>(key: string): T | undefined
  }, [preferences])

  // Remove a preference
  const removePreference = useCallback(async (key: string) => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/preferences?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers,
      })

      if (response.ok) {
        setPreferencesState(prev => {
          const newPrefs = { ...prev }
          delete newPrefs[key]
          return newPrefs
        })
        setError(null)
      } else if (options.fallbackToLocalStorage) {
        // Fallback to localStorage
        try {
          localStorage.removeItem(`pref_${key}`)
          setPreferencesState(prev => {
            const newPrefs = { ...prev }
            delete newPrefs[key]
            return newPrefs
          })
        } catch (localErr) {
          logError('Failed to remove from localStorage:', localErr)
          throw new Error('Failed to remove preference')
        }
      } else {
        throw new Error('Failed to remove preference')
      }
    } catch (err) {
      logError('Failed to remove preference:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove preference')
      throw err
    }
  }, [getAuthHeaders, options.fallbackToLocalStorage])

  // Load preferences on mount - only run once to prevent infinite loops
  useEffect(() => {
    refreshPreferences()
  }, []) // Empty dependency array to run only once

  return {
    preferences,
    loading,
    error,
    setPreference,
    setPreferences,
    getPreference,
    removePreference,
    refreshPreferences,
  }
}