"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import OfflineDataManager, { OfflineDataManagerRef, useOfflineData } from '@/components/mobile/offline-data-manager'
import { logInfo } from '@/lib/logger'

interface OfflineContextType {
    isOnline: boolean
    addPendingAction: (type: 'create' | 'update' | 'delete', resource: string, data: any) => Promise<void>
    cacheData: (key: string, resource: string, data: any) => Promise<void>
    getCachedData: (key: string) => Promise<any>
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: React.ReactNode }) {
    const managerRef = useRef<OfflineDataManagerRef>(null)
    const { addPendingAction, cacheData, getCachedData } = useOfflineData()
    const [isOnline, setIsOnline] = useState(true) // Default to true, will update on mount

    useEffect(() => {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') return

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
            <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
                <div className="pointer-events-auto">
                    <OfflineDataManager
                        ref={managerRef}
                        onSyncComplete={handleSyncComplete}
                        onSyncError={handleSyncError}
                        className="w-80 shadow-lg"
                    />
                </div>
            </div>
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
