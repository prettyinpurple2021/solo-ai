"use client"

import { useState } from 'react'
import { useRecaptcha } from '@/components/recaptcha/recaptcha-provider'
import { useToast } from '@/hooks/use-toast'

interface ValidationResult {
  success: boolean
  error?: string
}

interface UseRecaptchaValidationReturn {
  validateWithRecaptcha: (action: string, minScore?: number) => Promise<ValidationResult>
  isValidating: boolean
  lastValidationError: string | null
}

export function useRecaptchaValidation(): UseRecaptchaValidationReturn {
  const [isValidating, setIsValidating] = useState(false)
  const [lastValidationError, setLastValidationError] = useState<string | null>(null)
  const { executeRecaptcha, isReady } = useRecaptcha()
  const { toast } = useToast()

  const validateWithRecaptcha = async (
    action: string,
    minScore: number = 0.5
  ): Promise<ValidationResult> => {
    if (!isReady) {
      const error = 'reCAPTCHA is not ready. Please wait and try again.'
      setLastValidationError(error)
      return { success: false, error }
    }

    setIsValidating(true)
    setLastValidationError(null)

    try {
      // Step 1: Generate reCAPTCHA token
      const token = await executeRecaptcha(action)
      
      if (!token) {
        const error = 'Failed to generate reCAPTCHA token'
        setLastValidationError(error)
        setIsValidating(false)
        return { success: false, error }
      }

      // Step 2: Validate token with backend
      const response = await fetch('/api/recaptcha/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          action,
          minScore,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        const error = result.error || 'reCAPTCHA validation failed'
        setLastValidationError(error)
        setIsValidating(false)
        
        // Show user-friendly error message
        toast({
          title: "Security Verification Failed",
          description: "Please try again. If the problem persists, contact support.",
          variant: "destructive"
        })
        
        return { success: false, error }
      }

      setIsValidating(false)
      return { success: true }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error during validation'
      setLastValidationError(errorMessage)
      setIsValidating(false)
      
      toast({
        title: "Verification Error",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive"
      })
      
      return { success: false, error: errorMessage }
    }
  }

  return {
    validateWithRecaptcha,
    isValidating,
    lastValidationError
  }
}

// Helper function to get action-specific minimum scores
export function getMinScoreForAction(action: string): number {
  const actionScores: Record<string, number> = {
    LOGIN: 0.3,
    SIGNIN: 0.3,
    REGISTER: 0.5,
    SIGNUP: 0.5,
    CONTACT: 0.4,
    FORGOT_PASSWORD: 0.3,
    RESET_PASSWORD: 0.5,
    PAYMENT: 0.7,
    SUBSCRIPTION: 0.7,
    DELETE_ITEM: 0.6,
    UPLOAD_FILE: 0.5,
    CREATE_GOAL: 0.4,
    CREATE_TASK: 0.4,
    SEND_MESSAGE: 0.4,
    DEMO: 0.2,
    SUBMIT: 0.5
  }
  
  return actionScores[action.toUpperCase()] || 0.5
}

// Helper function to create a reCAPTCHA-protected form submission handler
export function useProtectedFormSubmit<T = any>(
  action: string,
  onSubmit: (data: T) => Promise<void> | void,
  minScore?: number
) {
  const { validateWithRecaptcha, isValidating } = useRecaptchaValidation()
  
  const handleSubmit = async (data: T) => {
    const validationResult = await validateWithRecaptcha(
      action, 
      minScore ?? getMinScoreForAction(action)
    )
    
    if (!validationResult.success) {
      throw new Error(validationResult.error || 'reCAPTCHA validation failed')
    }
    
    await onSubmit(data)
  }
  
  return {
    handleSubmit,
    isValidating
  }
}
