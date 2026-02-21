'use client'

import type { ButtonHTMLAttributes, ReactNode, MouseEventHandler } from 'react'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'

export interface PrimaryButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'icon'
  variant?: 'cyan' | 'magenta' | 'lime' | 'purple' | 'orange' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'ghost' | 'default' | 'secondary' | 'destructive' | 'link' | 'empowerment' | 'accent'
  className?: string
  asChild?: boolean
}

import { forwardRef } from 'react'
// ... existing imports ...

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(({ 
  children, 
  onClick, 
  disabled = false,
  size = 'md',
  variant = 'cyan',
  className = '',
  asChild = false,
  ...props
}, ref) => {
  // Theme is not available during static generation (React context is null)
  // Use default values that work for all themes
  // The theme-dependent styling will be applied on the client side after hydration
  const theme = undefined // Default: will be set on client after mount
  const isBalanced = false // Default: use balanced shadows (works for all themes)
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    icon: 'h-10 w-10 p-2 flex items-center justify-center',
  }
  
  const semanticMap = {
    success: 'lime',
    warning: 'orange',
    error: 'magenta',
    info: 'cyan',
    default: 'cyan',
    secondary: 'purple',
    destructive: 'magenta',
  } as const
  
  const resolvedVariant = (semanticMap as any)[variant] || variant
  
  const variants = {
    cyan: `border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:bg-opacity-10 ${
      isBalanced ? 'hover:shadow-[0_0_15px_rgba(11,228,236,0.3)]' : 'hover:shadow-[0_0_20px_rgba(11,228,236,0.5)]'
    }`,
    magenta: `border-2 border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:bg-opacity-10 ${
      isBalanced ? 'hover:shadow-[0_0_15px_rgba(255,0,110,0.3)]' : 'hover:shadow-[0_0_20px_rgba(255,0,110,0.5)]'
    }`,
    lime: `border-2 border-neon-lime text-neon-lime hover:bg-neon-lime hover:bg-opacity-10 ${
      isBalanced ? 'hover:shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]'
    }`,
    purple: `border-2 border-neon-purple text-neon-purple hover:bg-neon-purple hover:bg-opacity-10 ${
      isBalanced ? 'hover:shadow-[0_0_15px_rgba(179,0,255,0.3)]' : 'hover:shadow-[0_0_20px_rgba(179,0,255,0.5)]'
    }`,
    orange: `border-2 border-neon-orange text-neon-orange hover:bg-neon-orange hover:bg-opacity-10 ${
      isBalanced ? 'hover:shadow-[0_0_15px_rgba(255,102,0,0.3)]' : 'hover:shadow-[0_0_20px_rgba(255,102,0,0.5)]'
    }`,
    outline: 'border border-gray-600 text-gray-300 hover:border-neon-cyan hover:text-neon-cyan',
    ghost: 'border-transparent text-gray-300 hover:bg-dark-hover',
    link: 'text-neon-cyan hover:underline underline-offset-4',
    // Fallbacks for any unmapped variants that might slip through
    default: `border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:bg-opacity-10 ${
      isBalanced ? 'hover:shadow-[0_0_15px_rgba(11,228,236,0.3)]' : 'hover:shadow-[0_0_20px_rgba(11,228,236,0.5)]'
    }`,
    secondary: `border-2 border-neon-purple text-neon-purple hover:bg-neon-purple hover:bg-opacity-10 ${
      isBalanced ? 'hover:shadow-[0_0_15px_rgba(179,0,255,0.3)]' : 'hover:shadow-[0_0_20px_rgba(179,0,255,0.5)]'
    }`,
    destructive: `border-2 border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:bg-opacity-10 ${
      isBalanced ? 'hover:shadow-[0_0_15px_rgba(255,0,110,0.3)]' : 'hover:shadow-[0_0_20px_rgba(255,0,110,0.5)]'
    }`,
  }
  
  const Comp = asChild ? Slot : 'button'
  
  return (
    <Comp
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        sizes[size],
        (variants as any)[resolvedVariant] || variants.cyan,
        'bg-transparent',
        'font-bold uppercase tracking-wider',
        theme === 'aggressive' ? 'rounded-none' : 'rounded-sm',
        'transition-all duration-300 ease-out',
        'disabled:opacity-30 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg',
        'hover:scale-105',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
})
PrimaryButton.displayName = 'PrimaryButton'

/**
 * Backward-compatible exports for existing components that expect
 * `Button`, `ButtonProps`, and `buttonVariants` from `@/components/ui/button`.
 *
 * These wrappers delegate to `PrimaryButton` and use a simplified
 * variant system that is consistent with the new design tokens.
 */

export type ButtonProps = PrimaryButtonProps

// Alias so existing imports `import { Button } from '@/components/ui/button'` keep working.
export const Button = PrimaryButton

export type ButtonVariant =
  | 'cyan'
  | 'magenta'
  | 'lime'
  | 'purple'
  | 'orange'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  // legacy shadcn-style variants we still see in a few places
  | 'outline'
  | 'ghost'
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'link'

interface ButtonVariantOptions {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg' | 'icon'
  className?: string
}

// Utility that returns Tailwind classNames for non-PrimaryButton usages
// (e.g. Links styled like buttons). This is intentionally theme-agnostic
// and uses the "balanced" shadow styles.
export function buttonVariants(options: ButtonVariantOptions = {}): string {
  const { variant = 'cyan', size = 'md', className } = options

  const sizeClasses: Record<'sm' | 'md' | 'lg' | 'icon', string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    icon: 'h-10 w-10 p-2 flex items-center justify-center',
  }

  const resolvedVariant: string =
    (variant === 'success' && 'lime') ||
    (variant === 'warning' && 'orange') ||
    (variant === 'error' && 'magenta') ||
    (variant === 'info' && 'cyan') ||
    (variant === 'default' && 'cyan') ||
    (variant === 'secondary' && 'purple') ||
    (variant === 'destructive' && 'magenta') ||
    variant

  const base =
    'font-bold uppercase tracking-wider transition-all duration-300 ease-out disabled:opacity-30 disabled:cursor-not-allowed'

  const variantClasses: Record<string, string> = {
    cyan: 'border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:bg-opacity-10 hover:shadow-[0_0_15px_rgba(11,228,236,0.3)]',
    magenta:
      'border-2 border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:bg-opacity-10 hover:shadow-[0_0_15px_rgba(255,0,110,0.3)]',
    lime:
      'border-2 border-neon-lime text-neon-lime hover:bg-neon-lime hover:bg-opacity-10 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)]',
    purple:
      'border-2 border-neon-purple text-neon-purple hover:bg-neon-purple hover:bg-opacity-10 hover:shadow-[0_0_15px_rgba(179,0,255,0.3)]',
    orange:
      'border-2 border-neon-orange text-neon-orange hover:bg-neon-orange hover:bg-opacity-10 hover:shadow-[0_0_15px_rgba(255,102,0,0.3)]',
    success:
      'border-2 border-neon-lime text-neon-lime hover:bg-neon-lime hover:bg-opacity-10 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)]',
    warning:
      'border-2 border-neon-orange text-neon-orange hover:bg-neon-orange hover:bg-opacity-10 hover:shadow-[0_0_15px_rgba(255,102,0,0.3)]',
    error:
      'border-2 border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:bg-opacity-10 hover:shadow-[0_0_15px_rgba(255,0,110,0.3)]',
    info:
      'border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:bg-opacity-10 hover:shadow-[0_0_15px_rgba(11,228,236,0.3)]',
    outline: 'border border-gray-600 text-gray-300 hover:border-neon-cyan hover:text-neon-cyan',
    ghost: 'border-transparent text-gray-300 hover:bg-dark-hover',
    link: 'text-neon-cyan hover:underline underline-offset-4',
    // Mapping direct styles for safety if resolvedVariant doesn't catch them
    default: 'border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:bg-opacity-10 hover:shadow-[0_0_15px_rgba(11,228,236,0.3)]',
    secondary: 'border-2 border-neon-purple text-neon-purple hover:bg-neon-purple hover:bg-opacity-10 hover:shadow-[0_0_15px_rgba(179,0,255,0.3)]',
    destructive: 'border-2 border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:bg-opacity-10 hover:shadow-[0_0_15px_rgba(255,0,110,0.3)]',
  }

  return cn(sizeClasses[size], base, variantClasses[resolvedVariant] || variantClasses[variant], className)
}
