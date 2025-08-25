"use client"

import { useState, useEffect, useCallback } from 'react'
import { RECAPTCHA_CONFIG, RECAPTCHA_ACTIONS, type RecaptchaAction } from '@/lib/recaptcha-client'

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void
        execute: (siteKey: string, options: { action: string }) => Promise<string>
      }
    }
  }
}

interface UseRecaptchaOptions {
  action?: RecaptchaAction
  minScore?: number
  onSuccess?: (token: string, score: number) => void
  onError?: (error: string) => void
  onLoading?: (loading: boolean) => void
}

export function useRecaptcha(options: UseRecaptchaOptions = {}) {
  const {
    action = RECAPTCHA_ACTIONS.SUBMIT,
    minScore = 0.5,
    onSuccess,
    onError,
    onLoading
  } = options

  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if reCAPTCHA is ready (script loaded by RecaptchaProvider)
  useEffect(() => {
    const checkRecaptchaReady = () => {
      if (window.grecaptcha?.enterprise) {
        window.grecaptcha.enterprise.ready(() => {
          setIsReady(true)
          console.log('reCAPTCHA ready in useRecaptcha hook')
        })
      } else {
        // Check again in a moment if not ready
        setTimeout(checkRecaptchaReady, 100)
      }
    }

    checkRecaptchaReady()
  }, [])

  // Execute reCAPTCHA
  const execute = useCallback(async (): Promise<string | null> => {
    if (!isReady) {
      const errorMsg = 'reCAPTCHA not ready'
      console.error('reCAPTCHA not ready. Site key:', RECAPTCHA_CONFIG.siteKey)
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    setIsLoading(true)
    setError(null)
    onLoading?.(true)

    try {
      console.log('Executing reCAPTCHA for action:', action)
      const token = await window.grecaptcha.enterprise.execute(
        RECAPTCHA_CONFIG.siteKey,
        { action }
      )

      console.log('reCAPTCHA token generated, validating with backend')

      // Send token to backend for validation
      const response = await fetch('/api/recaptcha/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          action,
          minScore
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to validate reCAPTCHA token')
      }

      const result = await response.json()
      
      if (result.success) {
        console.log('reCAPTCHA validation successful')
        onSuccess?.(token, result.score)
        return token
      } else {
        const errorMsg = result.error || 'reCAPTCHA validation failed'
        console.error('reCAPTCHA validation failed:', errorMsg)
        setError(errorMsg)
        onError?.(errorMsg)
        return null
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'reCAPTCHA execution failed'
      console.error('reCAPTCHA execution error:', err)
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    } finally {
      setIsLoading(false)
      onLoading?.(false)
    }
  }, [isReady, action, minScore, onSuccess, onError, onLoading])

  // Reset error state
  const resetError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isReady,
    isLoading,
    error,
    execute,
    resetError
  }
}

// Hook for form submission with reCAPTCHA
export function useRecaptchaForm(options: UseRecaptchaOptions = {}) {
  const recaptcha = useRecaptcha(options)

  const handleSubmit = useCallback(async (
    formData: any,
    submitFunction: (data: any) => Promise<any>
  ) => {
    const token = await recaptcha.execute()
    
    if (!token) {
      return { success: false, error: recaptcha.error }
    }

    try {
      const result = await submitFunction(formData)
      return { success: true, data: result }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Form submission failed' 
      }
    }
  }, [recaptcha])

  return {
    ...recaptcha,
    handleSubmit
  }
}
}