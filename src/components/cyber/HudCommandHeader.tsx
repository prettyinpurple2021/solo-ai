"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { HudStatusRadar } from './HudStatusRadar'
import { HudTicker } from './HudTicker'
import { Terminal, Shield, Crosshair } from 'lucide-react'
import { io } from 'socket.io-client'
import { fetchSocketAuthToken, getSocketIoBaseUrl } from '@/lib/socket-client'

interface HudCommandHeaderProps {
  userId: string
  initialMrr?: number
  initialGrowth?: number
}

export function HudCommandHeader({ userId, initialMrr = 0, initialGrowth = 0 }: HudCommandHeaderProps) {
  const [mrr, setMrr] = useState(initialMrr)
  const [growth, setGrowth] = useState(initialGrowth)
  const [socketStatus, setSocketStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected')
  const [activeOps, setActiveOps] = useState(0)
  const [lastEvent, setLastEvent] = useState<string>("SYSTEM_IDLE")
  const activityTimeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const base = getSocketIoBaseUrl()
    const commandCenter = io(`${base}/command-center`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: (cb: (data: object) => void) => {
        fetchSocketAuthToken()
          .then((token) => {
            if (!token) setSocketStatus('disconnected')
            cb({ token: token ?? '' })
          })
          .catch(() => cb({ token: '' }))
      },
    })

    commandCenter.on('connect', () => {
      setSocketStatus('connected')
      commandCenter.emit('sync-hud', userId)
    })

    commandCenter.on('disconnect', () => setSocketStatus('disconnected'))
    commandCenter.on('connect_error', () => setSocketStatus('reconnecting'))

    commandCenter.on('revenue-update', (data: { mrr: number; growth: number }) => {
      setMrr(data.mrr)
      setGrowth(data.growth)
      setLastEvent('REVENUE_SYNC_COMPLETED')
    })

    commandCenter.on('global-activity', (data: { agent: string; action: string }) => {
      setLastEvent(`${data.agent.toUpperCase()}_EXECUTING_OP`)
      setActiveOps((prev) => prev + 1)
      const id = setTimeout(() => setActiveOps((prev) => Math.max(0, prev - 1)), 5000)
      activityTimeouts.current.push(id)
    })

    return () => {
      commandCenter.disconnect()
      activityTimeouts.current.forEach(clearTimeout)
      activityTimeouts.current = []
    }
  }, [userId])

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* System Status */}
      <div className="md:col-span-1">
        <HudStatusRadar 
          status={socketStatus} 
          activeOperations={activeOps}
        />
      </div>

      {/* Revenue Metrics */}
      <div className="md:col-span-2 grid grid-cols-2 gap-4">
        <HudTicker 
          label="Real-time MRR" 
          value={mrr.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
          prefix="$"
          trend="up"
          subValue={lastEvent}
        />
        <HudTicker 
          label="Growth Index" 
          value={growth.toFixed(1)} 
          suffix="%"
          trend={growth > 0 ? 'up' : 'down'}
          subValue="GLOBAL_MARKET_TREND"
        />
      </div>

      {/* Security/Operation Status */}
      <div className="md:col-span-1 flex flex-col p-3 border border-white/5 bg-dark-card/30 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <Shield className="w-3 h-3 text-neon-cyan" />
            Security Grid
          </span>
          <span className="text-[9px] font-mono text-neon-green font-bold">ACTIVE</span>
        </div>
        
        <div className="flex items-center gap-3 mt-1">
          <div className="relative">
            <Crosshair className="w-8 h-8 text-neon-cyan/20 animate-spin-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 bg-neon-magenta rounded-full" />
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-mono text-gray-400 leading-tight">
              LATENCY: <span className="text-white">24ms</span>
            </div>
            <div className="text-[10px] font-mono text-gray-400 leading-tight">
              ENCRYPTION: <span className="text-white">AES-256</span>
            </div>
          </div>
        </div>

        {/* HUD Border Corner */}
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-magenta/40" />
      </div>
    </div>
  )
}
