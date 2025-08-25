"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import Script from 'next/script'
import { useToast } from '@/hooks/use-toast'

const RECAPTCHA_SITE_KEY = '6Lc6OK8rAAAAAPXfc8nHtTiKjk8rE9MhP10Kb8Pj'

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
        ready: (callback: () => void) => void
        execute: (siteKey: string, options: { action: string }) => Promise<string>
        reset: (widgetId?: string) => void
      }
    }
  }
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const executeRecaptcha = async (action: string): Promise<string | null> => {
    if (!isReady || !window.grecaptcha?.enterprise) {
      console.error('reCAPTCHA is not ready')
      toast({
        title: "reCAPTCHA Error",
        description: "reCAPTCHA is not ready. Please try again.",
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
            
            console.log(`reCAPTCHA token generated for action: ${action}`)
            resolve(token)
          } catch (error) {
            console.error('reCAPTCHA execution error:', error)
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
      console.error('reCAPTCHA execution error:', error)
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
    console.log('reCAPTCHA script loaded successfully')
    setIsLoading(false)
    
    if (window.grecaptcha?.enterprise) {
      window.grecaptcha.enterprise.ready(() => {
        setIsReady(true)
        console.log('reCAPTCHA is ready')
      })
    }
  }

  const handleScriptError = () => {
    console.error('Failed to load reCAPTCHA script')
    setIsLoading(false)
    toast({
      title: "reCAPTCHA Error",
      description: "Failed to load security verification. Please refresh the page.",
      variant: "destructive"
    })
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
      <Script
        src={`https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="lazyOnload"
      />
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
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER', 
  SIGNUP: 'SIGNUP',
  SIGNIN: 'SIGNIN',
  CONTACT: 'CONTACT',
  DEMO: 'DEMO',
  SUBMIT: 'SUBMIT',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
  RESET_PASSWORD: 'RESET_PASSWORD',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CREATE_GOAL: 'CREATE_GOAL',
  CREATE_TASK: 'CREATE_TASK',
  SEND_MESSAGE: 'SEND_MESSAGE',
  UPLOAD_FILE: 'UPLOAD_FILE',
  DELETE_ITEM: 'DELETE_ITEM',
  PAYMENT: 'PAYMENT',
  SUBSCRIPTION: 'SUBSCRIPTION'
} as const

export type RecaptchaAction = keyof typeof RECAPTCHA_ACTIONS
