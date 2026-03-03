"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Activity, Terminal } from 'lucide-react'

interface HudTickerProps {
  label: string
  value: string | number
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  prefix?: string
  suffix?: string
}

export function HudTicker({ label, value, subValue, trend, prefix = "", suffix = "" }: HudTickerProps) {
  const [prevValue, setPrevValue] = useState(value)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (value !== prevValue) {
      setFlash(true)
      const timer = setTimeout(() => {
        setFlash(false)
        setPrevValue(value)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [value, prevValue])

  return (
    <div className="relative group">
      {/* Background Glow */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neon-cyan blur-xl"
          />
        )}
      </AnimatePresence>

      <div className={`relative flex flex-col p-3 border border-white/5 transition-all duration-500 ${flash ? 'border-neon-cyan/50 bg-neon-cyan/5' : 'bg-dark-card/50'}`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <Terminal className="w-3 h-3" />
            {label}
          </span>
          {trend && (
            <TrendingUp className={`w-3 h-3 ${trend === 'up' ? 'text-neon-green' : 'text-neon-magenta'} ${trend === 'neutral' ? 'text-gray-500' : ''}`} />
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-xs text-neon-cyan font-mono opacity-70">{prefix}</span>
          <motion.span 
            key={value.toString()}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xl font-orbitron font-black text-white tabular-nums tracking-tighter"
          >
            {value}
          </motion.span>
          <span className="text-xs text-neon-cyan font-mono opacity-70">{suffix}</span>
        </div>

        {subValue && (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter italic">
              {subValue}
            </span>
          </div>
        )}

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="w-full h-1 bg-neon-cyan/20 animate-scanline" />
        </div>
      </div>
    </div>
  )
}
