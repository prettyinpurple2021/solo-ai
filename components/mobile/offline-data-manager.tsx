"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { logError } from '@/lib/logger'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Wifi,
  WifiOff,
  Database,
  CheckCircle,
  AlertTriangle,
  Clock,
  Cloud,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OfflineDataManagerProps {
  className?: string
  onSyncComplete?: () => void
  onSyncError?: (error: string) => void
}

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  lastSync: Date | null
  pendingActions: number
  syncProgress: number
  error: string | null
}

interface PendingAction {
  id: string
  type: 'create' | 'update' | 'delete'
  resource: string
  data: any
  timestamp: Date
  retries: number
}

export interface OfflineDataManagerRef {
  addPendingAction: (action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>) => Promise<void>
  cacheData: (key: string, resource: string, data: any) => Promise<void>
  getCachedData: (key: string) => Promise<any>
}

const OfflineDataManager = React.forwardRef<OfflineDataManagerRef, OfflineDataManagerProps>(({
  className = "",
  onSyncComplete,
  onSyncError
}, ref) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingActions: 0,
    syncProgress: 0,
    error: null
  })

  const [pendingActions, setPendingActions] = useState<PendingAction[]>([])
  const [showDetails, setShowDetails] = useState(false)

  // ... (keep existing useEffects and helper functions) ...

  // Open IndexedDB connection
  const openIndexedDB = useCallback(() => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('SoloSuccessOffline', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create pending actions store
        if (!db.objectStoreNames.contains('pendingActions')) {
          const store = db.createObjectStore('pendingActions', {
            keyPath: 'id',
            autoIncrement: false
          })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('resource', 'resource', { unique: false })
        }

        // Create offline cache store
        if (!db.objectStoreNames.contains('offlineCache')) {
          const store = db.createObjectStore('offlineCache', {
            keyPath: 'key'
          })
          store.createIndex('resource', 'resource', { unique: false })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }, [])

  // Add action to pending queue
  const addPendingAction = useCallback(async (action: Omit<PendingAction, 'id' | 'timestamp' | 'retries'>) => {
    const pendingAction: PendingAction = {
      ...action,
      id: `${action.type}_${action.resource}_${Date.now()}`,
      timestamp: new Date(),
      retries: 0
    }

    try {
      const db = await openIndexedDB()
      const transaction = db.transaction(['pendingActions'], 'readwrite')
      const store = transaction.objectStore('pendingActions')

      await new Promise<void>((resolve, reject) => {
        const request = store.add(pendingAction)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      setPendingActions(prev => [...prev, pendingAction])
      setSyncStatus(prev => ({
        ...prev,
        pendingActions: prev.pendingActions + 1
      }))
    } catch (error) {
      logError('Failed to add pending action', error as any)
    }
  }, [openIndexedDB])

  // Cache data for offline use
  const cacheData = useCallback(async (key: string, resource: string, data: any) => {
    try {
      const db = await openIndexedDB()
      const transaction = db.transaction(['offlineCache'], 'readwrite')
      const store = transaction.objectStore('offlineCache')

      const cacheEntry = {
        key,
        resource,
        data,
        timestamp: new Date()
      }

      await new Promise<void>((resolve, reject) => {
        const request = store.put(cacheEntry)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      logError('Failed to cache data', error as any)
    }
  }, [openIndexedDB])

  // Get cached data
  const getCachedData = useCallback(async (key: string) => {
    try {
      const db = await openIndexedDB()
      const transaction = db.transaction(['offlineCache'], 'readonly')
      const store = transaction.objectStore('offlineCache')

      return new Promise<any>((resolve, reject) => {
        const request = store.get(key)
        request.onsuccess = () => resolve(request.result?.data || null)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      logError('Failed to get cached data', error as any)
      return null
    }
  }, [openIndexedDB])

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    addPendingAction,
    cacheData,
    getCachedData
  }))

  // Load pending actions from IndexedDB
  const loadPendingActions = useCallback(async () => {
    try {
      const db = await openIndexedDB()
      const transaction = db.transaction(['pendingActions'], 'readonly')
      const store = transaction.objectStore('pendingActions')
      const request = store.getAll()

      request.onsuccess = () => {
        const actions = request.result || []
        setPendingActions(actions)
        setSyncStatus(prev => ({
          ...prev,
          pendingActions: actions.length
        }))
      }
    } catch (error) {
      logError('Failed to load pending actions', error as any)
    }
  }, [openIndexedDB])

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true, error: null }))
      // Auto-sync when coming back online
      syncPendingActions()
    }

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load pending actions from IndexedDB
    loadPendingActions()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [loadPendingActions]) // Added loadPendingActions to dependency array

  // Sync individual action
  const syncAction = async (action: PendingAction) => {
    const { type, resource, data } = action

    switch (type) {
      case 'create':
        return fetch(`/api/${resource}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      case 'update':
        return fetch(`/api/${resource}/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      case 'delete':
        return fetch(`/api/${resource}/${data.id}`, {
          method: 'DELETE'
        })
      default:
        throw new Error(`Unknown action type: ${type}`)
    }
  }

  // Remove pending action
  const removePendingAction = async (id: string) => {
    try {
      const db = await openIndexedDB()
      const transaction = db.transaction(['pendingActions'], 'readwrite')
      const store = transaction.objectStore('pendingActions')

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      setPendingActions(prev => prev.filter(action => action.id !== id))
    } catch (error) {
      logError('Failed to remove pending action', error as any)
    }
  }

  // Update pending action retries
  const updatePendingActionRetries = async (id: string, retries: number) => {
    try {
      const db = await openIndexedDB()
      const transaction = db.transaction(['pendingActions'], 'readwrite')
      const store = transaction.objectStore('pendingActions')

      const action = pendingActions.find(a => a.id === id)
      if (action) {
        action.retries = retries
        await new Promise<void>((resolve, reject) => {
          const request = store.put(action)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      }
    } catch (error) {
      logError('Failed to update pending action retries', error as any)
    }
  }

  // Sync pending actions with server
  const syncPendingActions = useCallback(async () => {
    if (!syncStatus.isOnline || syncStatus.isSyncing || pendingActions.length === 0) {
      return
    }

    setSyncStatus(prev => ({
      ...prev,
      isSyncing: true,
      syncProgress: 0,
      error: null
    }))

    const totalActions = pendingActions.length
    let completedActions = 0
    const errors: string[] = []

    try {
      for (const action of pendingActions) {
        try {
          await syncAction(action)
          completedActions++

          // Remove successful action from pending list
          await removePendingAction(action.id)

          setSyncStatus(prev => ({
            ...prev,
            syncProgress: (completedActions / totalActions) * 100
          }))
        } catch (error) {
          logError(`Failed to sync action ${action.id}`, error as any)
          errors.push(`${action.type} ${action.resource}: ${error}`)

          // Increment retry count
          await updatePendingActionRetries(action.id, action.retries + 1)
        }
      }

      if (errors.length === 0) {
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date(),
          pendingActions: 0,
          error: null
        }))
        onSyncComplete?.()
      } else {
        setSyncStatus(prev => ({
          ...prev,
          error: `${errors.length} actions failed to sync`
        }))
        onSyncError?.(errors.join(', '))
      }
    } finally {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        syncProgress: 0
      }))
      loadPendingActions() // Refresh the list
    }
  }, [syncStatus.isOnline, pendingActions, onSyncComplete, onSyncError, loadPendingActions]) // Added loadPendingActions

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Status Card */}
      <Card className="border-2 border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                syncStatus.isOnline
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              )}>
                {syncStatus.isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>
              <div>
                <CardTitle className="text-lg">
                  {syncStatus.isOnline ? 'Online' : 'Offline'}
                </CardTitle>
                <CardDescription>
                  {syncStatus.pendingActions > 0
                    ? `${syncStatus.pendingActions} actions pending sync`
                    : 'All data synced'
                  }
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {syncStatus.pendingActions > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  <Clock className="w-3 h-3 mr-1" />
                  {syncStatus.pendingActions}
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-8 w-8 p-0"
              >
                <Database className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Sync Progress */}
        {syncStatus.isSyncing && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Syncing data...</span>
                <span>{Math.round(syncStatus.syncProgress)}%</span>
              </div>
              <Progress value={syncStatus.syncProgress} className="h-2" />
            </div>
          </CardContent>
        )}

        {/* Error Message */}
        {syncStatus.error && (
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertTriangle className="w-4 h-4" />
              {syncStatus.error}
            </div>
          </CardContent>
        )}

        {/* Action Buttons */}
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={syncPendingActions}
              disabled={!syncStatus.isOnline || syncStatus.isSyncing || syncStatus.pendingActions === 0}
              className="flex-1"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", syncStatus.isSyncing && "animate-spin")} />
              Sync Now
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadPendingActions}
              disabled={syncStatus.isSyncing}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details Panel */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sync Details</CardTitle>
                <CardDescription>
                  Manage offline data and pending actions
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Last Sync Info */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last sync:</span>
                  <span className="font-medium">{formatLastSync(syncStatus.lastSync)}</span>
                </div>

                {/* Pending Actions List */}
                {pendingActions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Pending Actions:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {pendingActions.map((action) => (
                        <div key={action.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              action.type === 'create' && "bg-green-500",
                              action.type === 'update' && "bg-blue-500",
                              action.type === 'delete' && "bg-red-500"
                            )} />
                            <span className="capitalize">{action.type}</span>
                            <span className="text-gray-600">{action.resource}</span>
                          </div>
                          {action.retries > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {action.retries} retries
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

OfflineDataManager.displayName = 'OfflineDataManager'

export default OfflineDataManager

// Hook for offline data management
export function useOfflineData() {
  const manager = React.useRef<OfflineDataManagerRef>(null)

  const addPendingAction = useCallback(async (
    type: 'create' | 'update' | 'delete',
    resource: string,
    data: any
  ) => {
    if (manager.current?.addPendingAction) {
      await manager.current.addPendingAction({ type, resource, data })
    }
  }, [])

  const cacheData = useCallback(async (key: string, resource: string, data: any) => {
    if (manager.current?.cacheData) {
      await manager.current.cacheData(key, resource, data)
    }
  }, [])

  const getCachedData = useCallback(async (key: string) => {
    if (manager.current?.getCachedData) {
      return await manager.current.getCachedData(key)
    }
    return null
  }, [])

  return {
    manager, // Export the ref to be attached to the component
    addPendingAction,
    cacheData,
    getCachedData
  }
}
