"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useOfflineData } from '@/components/mobile/offline-data-manager'
import { logInfo } from '@/lib/logger'
// OfflineDataManager widget UI removed - functionality preserved via useOfflineData hook

interface OfflineContextType {
    isOnline: boolean
    addPendingAction: (type: 'create' | 'update' | 'delete', resource: string, data: any) => Promise<void>
    cacheData: (key: string, resource: string, data: any) => Promise<void>
    getCachedData: (key: string) => Promise<any>
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: React.ReactNode }) {
    const { manager, addPendingAction, cacheData, getCachedData } = useOfflineData()
    const [isOnline, setIsOnline] = useState(true) // Default to true, will update on mount

    useEffect(() => {
        setIsOnline(navigator.onLine)

        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const handleSyncComplete = () => {
        logInfo('Offline data sync completed successfully')
    }

    const handleSyncError = (error: string) => {
        logInfo(`Offline data sync error: ${error}`)
    }

    return (
        <OfflineContext.Provider value={{ isOnline, addPendingAction, cacheData, getCachedData }}>
            {children}
            {/* OfflineDataManager widget removed - was cluttering UI */}
            {/* Offline functionality still works, just no visible widget */}
        </OfflineContext.Provider>
    )
}

export function useOffline() {
    const context = useContext(OfflineContext)
    if (context === undefined) {
        throw new Error('useOffline must be used within an OfflineProvider')
    }
    return context
}
