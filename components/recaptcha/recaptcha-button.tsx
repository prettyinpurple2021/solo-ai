"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { useRecaptchaValidation } from '@/hooks/use-recaptcha-validation'
import { Shield, Loader2 } from 'lucide-react'

interface RecaptchaButtonProps {
  children: React.ReactNode
  action: string
  minScore?: number
  onClick: () => Promise<void> | void
  disabled?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showSecurityBadge?: boolean
}

export function RecaptchaButton({
  children,
  action,
  minScore,
  onClick,
  disabled = false,
  variant = "default",
  size = "default",
  className = "",
  showSecurityBadge = false
}: RecaptchaButtonProps) {
  const { validateWithRecaptcha, isValidating } = useRecaptchaValidation()

  const handleClick = async () => {
    // Validate with reCAPTCHA first
    const result = await validateWithRecaptcha(action, minScore)
    
    if (result.success) {
      // Execute the original onClick if validation succeeds
      await onClick()
    }
    // If validation fails, the error is already shown by the validation hook
  }

  const isDisabled = disabled || isValidating

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {isValidating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </Button>
      
      {showSecurityBadge && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <Shield className="w-3 h-3 text-green-600" />
          <span>Protected by reCAPTCHA</span>
        </div>
      )}
    </div>
  )
}

// Higher-order component to wrap any component with reCAPTCHA protection
interface WithRecaptchaProps {
  action: string
  minScore?: number
  onSuccess: () => Promise<void> | void
  onError?: (error: string) => void
  children: (props: {
    onClick: () => Promise<void>
    isValidating: boolean
  }) => React.ReactNode
}

export function WithRecaptcha({
  action,
  minScore,
  onSuccess,
  onError,
  children
}: WithRecaptchaProps) {
  const { validateWithRecaptcha, isValidating } = useRecaptchaValidation()

  const handleClick = async () => {
    const result = await validateWithRecaptcha(action, minScore)
    
    if (result.success) {
      await onSuccess()
    } else if (onError) {
      onError(result.error || 'reCAPTCHA validation failed')
    }
  }

  return (
    <>
      {children({
        onClick: handleClick,
        isValidating
      })}
    </>
  )
}

// Example usage components:

export function SecureLoginButton({ onClick, disabled, className }: {
  onClick: () => Promise<void> | void
  disabled?: boolean
  className?: string
}) {
  return (
    <RecaptchaButton
      action="LOGIN"
      minScore={0.3}
      onClick={onClick}
      disabled={disabled}
      className={className}
      showSecurityBadge
    >
      Sign In
    </RecaptchaButton>
  )
}

export function SecureSignupButton({ onClick, disabled, className }: {
  onClick: () => Promise<void> | void
  disabled?: boolean
  className?: string
}) {
  return (
    <RecaptchaButton
      action="SIGNUP"
      minScore={0.5}
      onClick={onClick}
      disabled={disabled}
      className={className}
      showSecurityBadge
    >
      Create Account
    </RecaptchaButton>
  )
}

export function SecureDemoButton({ onClick, disabled, className }: {
  onClick: () => Promise<void> | void
  disabled?: boolean
  className?: string
}) {
  return (
    <RecaptchaButton
      action="DEMO"
      minScore={0.2}
      onClick={onClick}
      disabled={disabled}
      className={className}
      variant="outline"
    >
      Watch Demo
    </RecaptchaButton>
  )
}
