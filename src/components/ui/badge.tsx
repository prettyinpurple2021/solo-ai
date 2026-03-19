'use client'

import type { MouseEventHandler, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'cyan' | 'magenta' | 'lime' | 'purple' | 'orange' | 'outline' | 'secondary' | 'destructive' | 'default'
  size?: 'sm' | 'md' | 'lg'
  glitch?: boolean
  className?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export const Badge = ({ 
  children,
  variant = 'cyan',
  size = 'md',
  glitch = false,
  className = '',
  onClick,
}: BadgeProps) => {
  // Theme not available during static generation - use defaults
  const theme = undefined
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }
  
  const variants = {
    cyan: 'border-neon-cyan text-neon-cyan bg-neon-cyan/5',
    magenta: 'border-neon-magenta text-neon-magenta bg-neon-magenta/5',
    lime: 'border-neon-lime text-neon-lime bg-neon-lime/5',
    purple: 'border-neon-purple text-neon-purple bg-neon-purple/5',
    orange: 'border-neon-orange text-neon-orange bg-neon-orange/5',
    outline: 'border-gray-400 text-gray-700 bg-transparent dark:border-gray-500 dark:text-gray-300',
    secondary: 'border-gray-300 text-gray-600 bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800',
    destructive: 'border-red-500 text-red-700 bg-red-50 dark:border-red-400 dark:text-red-300 dark:bg-red-900/20',
    default: 'border-gray-200 text-gray-800 bg-white dark:border-gray-700 dark:text-gray-200 dark:bg-gray-900',
  }
  
  const sharedClassName = cn(
    'border-2',
    variants[variant],
    theme === 'aggressive' ? 'rounded-none' : 'rounded-sm',
    'font-bold uppercase tracking-wide',
    'inline-block',
    sizeClasses[size],
    glitch && 'glitch-hover',
    'transition-all duration-300',
    className,
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(sharedClassName, 'cursor-pointer text-left')}
        data-text={glitch ? String(children) : undefined}
      >
        {children}
      </button>
    )
  }

  return (
    <span
      className={sharedClassName}
      data-text={glitch ? String(children) : undefined}
    >
      {children}
    </span>
  )
}
