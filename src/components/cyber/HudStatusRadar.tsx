"use client"

import { motion } from 'framer-motion'
import { Wifi, WifiOff, Zap } from 'lucide-react'

interface HudStatusRadarProps {
  status: 'connected' | 'reconnecting' | 'disconnected'
  activeOperations?: number
  label?: string
}

export function HudStatusRadar({ status, activeOperations = 0, label = "Neural Syndicate" }: HudStatusRadarProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-neon-green'
      case 'reconnecting': return 'text-neon-orange'
      case 'disconnected': return 'text-neon-magenta'
      default: return 'text-gray-500'
    }
  }

  const getStatusBg = () => {
    switch (status) {
      case 'connected': return 'bg-neon-green'
      case 'reconnecting': return 'bg-neon-orange'
      case 'disconnected': return 'bg-neon-magenta'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="relative flex items-center gap-4 p-3 border border-white/5 bg-dark-card/30 overflow-hidden">
      {/* Radar Animation */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <div className={`absolute inset-0 rounded-full border border-white/10`} />
        <div className={`absolute inset-2 rounded-full border border-white/5`} />
        
        {/* Scanning Sweep */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t border-neon-cyan/40 shadow-[0_0_15px_rgba(11,228,236,0.2)]"
          style={{ originX: '50%', originY: '50%' }}
        />

        {/* Center Point */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-1.5 h-1.5 rounded-full ${getStatusBg()} shadow-[0_0_8px_currentColor] animate-pulse`} />
        </div>

        {/* Status Icon */}
        <div className="absolute -top-1 -right-1">
          {status === 'connected' ? (
            <Wifi className="w-3 h-3 text-neon-green" />
          ) : (
            <WifiOff className="w-3 h-3 text-neon-magenta" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-orbitron font-bold text-gray-400 uppercase tracking-widest truncate">
            {label}
          </span>
          <span className={`text-[9px] font-mono font-bold uppercase ${getStatusColor()}`}>
            {status}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Zap className={`w-3 h-3 ${activeOperations > 0 ? 'text-neon-purple animate-pulse' : 'text-gray-600'}`} />
            <span className="text-xs font-mono text-white">
              {activeOperations.toString().padStart(2, '0')} <span className="text-[9px] text-gray-500 uppercase">Ops</span>
            </span>
          </div>
          
          <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, activeOperations * 20)}%` }}
              className="h-full bg-neon-purple shadow-[0_0_10px_#bc13fe]"
            />
          </div>
        </div>
      </div>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-4 h-4 overflow-hidden opacity-20">
        <div className="absolute top-0 right-0 w-px h-full bg-neon-cyan" />
        <div className="absolute top-0 right-0 w-full h-px bg-neon-cyan" />
      </div>
    </div>
  )
}
