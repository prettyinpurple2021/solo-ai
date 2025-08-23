"use client"

import { useState, useEffect, useCallback } from 'react'
import { RECAPTCHA_CONFIG, RECAPTCHA_ACTIONS, type RecaptchaAction } from '@/lib/recaptcha'

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

  // Load reCAPTCHA script
  useEffect(() => {
    const scriptId = 'recaptcha-enterprise-script'
    
    // Check if script already exists
    if (document.getElementById(scriptId)) {
      setIsReady(true)
      return
    }

    // Create and load script
    const script = document.createElement('script')
    script.id = scriptId
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_CONFIG.siteKey}`
    script.async = true
    script.defer = true

    script.onload = () => {
      if (window.grecaptcha?.enterprise?.ready) {
        window.grecaptcha.enterprise.ready(() => {
          setIsReady(true)
        })
      }
    }

    script.onerror = () => {
      setError('Failed to load reCAPTCHA script')
      onError?.('Failed to load reCAPTCHA script')
    }

    document.head.appendChild(script)

    return () => {
      const existingScript = document.getElementById(scriptId)
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [onError])

  // Execute reCAPTCHA
  const execute = useCallback(async (): Promise<string | null> => {
    if (!isReady) {
      const errorMsg = 'reCAPTCHA not ready'
      setError(errorMsg)
      onError?.(errorMsg)
      return null
    }

    setIsLoading(true)
    setError(null)
    onLoading?.(true)

    try {
      const token = await window.grecaptcha.enterprise.execute(
        RECAPTCHA_CONFIG.siteKey,
        { action }
      )

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
        onSuccess?.(token, result.score)
        return token
      } else {
        const errorMsg = result.error || 'reCAPTCHA validation failed'
        setError(errorMsg)
        onError?.(errorMsg)
        return null
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'reCAPTCHA execution failed'
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