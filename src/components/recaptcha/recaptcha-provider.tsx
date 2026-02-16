"use client"

import { logError, logWarn, logInfo,} from '@/lib/logger'
import React, { createContext, useContext, useEffect, useState } from 'react'
import Script from 'next/script'
import { useToast} from '@/hooks/use-toast'


const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

interface RecaptchaContextType {
  isReady: boolean
  executeRecaptcha: (action: string) => Promise<string | null>
  resetRecaptcha: () => void
}

const RecaptchaContext = createContext<RecaptchaContextType | undefined>(undefined)

interface RecaptchaProviderProps {
  children: React.ReactNode
}

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (_callback: () => void) => void
        execute: (_siteKey: string, _options: { action: string }) => Promise<string>
        reset: (_widgetId?: string) => void
      }
    }
  }
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY) {
      // Silently return null if reCAPTCHA is not configured (optional feature)
      return null
    }
    
    if (!isReady || !window.grecaptcha?.enterprise) {
      logWarn('reCAPTCHA is not ready yet. Please wait and try again.')
      toast({
        title: "reCAPTCHA Error",
        description: "Security verification is not ready. Please try again.",
        variant: "destructive"
      })
      return null
    }

    try {
      return new Promise((resolve) => {
        window.grecaptcha.enterprise.ready(async () => {
          try {
            const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, {
              action: action
            })
            
            logInfo(`reCAPTCHA token generated for action: ${action}`)
            resolve(token)
          } catch (error) {
            logError('reCAPTCHA execution error:', error)
            toast({
              title: "reCAPTCHA Error",
              description: "Failed to verify. Please try again.",
              variant: "destructive"
            })
            resolve(null)
          }
        })
      })
    } catch (error) {
      logError('reCAPTCHA execution error:', error)
      toast({
        title: "reCAPTCHA Error",
        description: "Failed to verify. Please try again.",
        variant: "destructive"
      })
      return null
    }
  }

  const resetRecaptcha = () => {
    if (window.grecaptcha?.enterprise) {
      window.grecaptcha.enterprise.reset()
    }
  }

  const handleScriptLoad = () => {
    logInfo('reCAPTCHA script loaded successfully')
    logInfo('reCAPTCHA site key:', RECAPTCHA_SITE_KEY)
    setIsLoading(false)
    
    // Check if grecaptcha is available, with retry logic
    const checkReady = (attempt = 0) => {
      if (window.grecaptcha?.enterprise) {
        // grecaptcha is available, use ready() callback
        window.grecaptcha.enterprise.ready(() => {
          setIsReady(true)
          logInfo('reCAPTCHA is ready')
        })
      } else if (attempt < 5) {
        // Retry after a short delay (up to 5 attempts)
        setTimeout(() => {
          checkReady(attempt + 1)
        }, 100)
      } else {
        // Failed after multiple retries
        logError('reCAPTCHA enterprise not available after script load and retries')
        toast({
          title: "reCAPTCHA Error",
          description: "Security verification failed to initialize. Please refresh the page.",
          variant: "destructive"
        })
      }
    }
    
    // Start checking for grecaptcha availability
    checkReady()
  }

  const handleScriptError = () => {
    // Only log errors if site key is configured (prevents noise when reCAPTCHA is optional)
    if (RECAPTCHA_SITE_KEY) {
      logError('Failed to load reCAPTCHA script')
      logWarn('reCAPTCHA site key configured but script failed to load. Check your network connection.')
      toast({
        title: "reCAPTCHA Error",
        description: "Failed to load security verification. Please refresh the page.",
        variant: "destructive"
      })
    } else {
      logWarn('reCAPTCHA site key not configured - skipping script load')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setIsLoading(true)
  }, [])

  const contextValue: RecaptchaContextType = {
    isReady,
    executeRecaptcha,
    resetRecaptcha
  }

  return (
    <>
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`}
          onLoad={handleScriptLoad}
          onError={handleScriptError}
          strategy="afterInteractive"
        />
      )}
      <RecaptchaContext.Provider value={contextValue}>
        {children}
      </RecaptchaContext.Provider>
    </>
  )
}

export function useRecaptcha() {
  const context = useContext(RecaptchaContext)
  if (context === undefined) {
    throw new Error('useRecaptcha must be used within a RecaptchaProvider')
  }
  return context
}

// Predefined actions for consistency
export const RECAPTCHA_ACTIONS = {
  LOGIN: 'login',
  REGISTER: 'register', 
  SIGNUP: 'signup',
  SIGNIN: 'signin',
  CONTACT: 'contact',
  DEMO: 'demo',
  SUBMIT: 'submit',
  FORGOT_PASSWORD: 'forgot_password',
  RESET_PASSWORD: 'reset_password',
  UPDATE_PROFILE: 'update_profile',
  CREATE_GOAL: 'create_goal',
  CREATE_TASK: 'create_task',
  SEND_MESSAGE: 'send_message',
  UPLOAD_FILE: 'upload_file',
  DELETE_ITEM: 'delete_item',
  PAYMENT: 'payment',
  SUBSCRIPTION: 'subscription'
} as const

export type RecaptchaAction = typeof RECAPTCHA_ACTIONS[keyof typeof RECAPTCHA_ACTIONS]
