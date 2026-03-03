'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'cyan' | 'neon' | 'purple' | 'magenta' | 'orange' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xs'
}

export function CyberButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: CyberButtonProps) {
  const baseStyles = 'relative overflow-hidden font-sci font-bold tracking-[0.2em] uppercase transition-all duration-300'
 
  const variants = {
    primary: 'bg-neon-magenta text-black shadow-[0_0_15px_rgba(255,0,110,0.4)] hover:shadow-[0_0_30px_rgba(255,0,110,0.6)] hover:-skew-x-6',
    secondary: 'border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 hover:shadow-[0_0_20px_rgba(11,228,236,0.3)]',
    ghost: 'border border-neon-purple/40 text-white hover:bg-neon-purple/20 hover:border-neon-purple',
    cyan: 'bg-neon-cyan text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]',
    neon: 'bg-neon-lime text-black shadow-[0_0_15px_rgba(132,204,22,0.4)] hover:shadow-[0_0_30px_rgba(132,204,22,0.6)]',
    purple: 'bg-neon-purple text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]',
    magenta: 'bg-neon-magenta text-black shadow-[0_0_15px_rgba(255,0,110,0.4)] hover:shadow-[0_0_30px_rgba(255,0,110,0.6)]',
    orange: 'bg-neon-orange text-black shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]',
    destructive: 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:bg-red-700',
    outline: 'border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10',
  }
  
  const sizes = {
    xs: 'px-2 py-1 text-[9px]',
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        'before:content-[""] before:absolute before:inset-0 before:bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] before:bg-[length:100%_4px] before:pointer-events-none before:opacity-20 hover:before:opacity-40',
        className
      )}
      {...props as any}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_100%] animate-shimmer pointer-events-none" />
    </motion.button>
  )
}

