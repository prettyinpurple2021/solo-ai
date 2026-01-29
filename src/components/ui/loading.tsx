'use client'

import { cn } from '@/lib/utils'

interface LoadingProps {
  variant?: 'pulse' | 'shimmer' | 'flicker' | 'bounce'
  size?: 'sm' | 'md' | 'lg'
  color?: 'cyan' | 'magenta' | 'lime' | 'purple'
  className?: string
  text?: string
}

export const Loading = ({ 
  variant = 'pulse',
  size = 'md',
  color = 'cyan',
  className = ''
}: LoadingProps) => {
  // Theme not available during static generation - use defaults
  const theme = undefined
  const isBalanced = false // Default: balanced shadows work for all themes
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }
  
  const colorClasses = {
    cyan: isBalanced 
      ? 'border-neon-cyan shadow-[0_0_15px_rgba(11,228,236,0.4)]'
      : 'border-neon-cyan shadow-[0_0_20px_rgba(11,228,236,0.8)]',
    magenta: isBalanced
      ? 'border-neon-magenta shadow-[0_0_15px_rgba(255,0,110,0.4)]'
      : 'border-neon-magenta shadow-[0_0_20px_rgba(255,0,110,0.8)]',
    lime: isBalanced
      ? 'border-neon-lime shadow-[0_0_15px_rgba(57,255,20,0.4)]'
      : 'border-neon-lime shadow-[0_0_20px_rgba(57,255,20,0.8)]',
    purple: isBalanced
      ? 'border-neon-purple shadow-[0_0_15px_rgba(179,0,255,0.4)]'
      : 'border-neon-purple shadow-[0_0_20px_rgba(179,0,255,0.8)]',
  }
  
  const variants = {
    pulse: cn(sizeClasses[size], 'border-2', colorClasses[color], 'rounded-none animate-pulse'),
    shimmer: cn(sizeClasses[size], 'border-2', colorClasses[color], 'rounded-none animate-shimmer'),
    flicker: cn(sizeClasses[size], 'border-2', colorClasses[color], 'rounded-none animate-flicker'),
    bounce: cn(sizeClasses[size], 'border-2', colorClasses[color], 'rounded-none animate-bounce-neon'),
  }
  
  return <div className={cn(variants[variant], className)} aria-label="Loading" role="status" />
}
