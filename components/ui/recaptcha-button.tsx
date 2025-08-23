"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { BossButton, BossButtonProps } from "./boss-button"
import { useRecaptcha } from "@/hooks/use-recaptcha"
import { RECAPTCHA_ACTIONS, type RecaptchaAction } from "@/lib/recaptcha"
import { Shield, AlertCircle, CheckCircle } from "lucide-react"

interface RecaptchaButtonProps extends Omit<BossButtonProps, 'onClick'> {
  children: ReactNode
  action?: RecaptchaAction
  minScore?: number
  onSuccess?: (token: string, score: number) => void
  onError?: (error: string) => void
  onSubmit?: (formData?: any) => Promise<any>
  formData?: any
  showShield?: boolean
  className?: string
}

export function RecaptchaButton({
  children,
  action = RECAPTCHA_ACTIONS.SUBMIT,
  minScore = 0.5,
  onSuccess,
  onError,
  onSubmit,
  formData,
  showShield = true,
  className = "",
  ...buttonProps
}: RecaptchaButtonProps) {
  const {
    isReady,
    isLoading,
    error,
    execute,
    resetError
  } = useRecaptcha({
    action,
    minScore,
    onSuccess,
    onError,
    onLoading: (loading) => {
      // Handle loading state if needed
    }
  })

  const handleClick = async () => {
    resetError()
    
    if (!isReady) {
      onError?.('reCAPTCHA not ready. Please wait a moment and try again.')
      return
    }

    try {
      const token = await execute()
      
      if (token && onSubmit) {
        const result = await onSubmit(formData)
        return result
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Submission failed'
      onError?.(errorMsg)
    }
  }

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="w-4 h-4" />
          </motion.div>
          <span>Verifying...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span>Try Again</span>
        </div>
      )
    }

    return (
      <div className="flex items-center space-x-2">
        {showShield && (
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Shield className="w-4 h-4" />
          </motion.div>
        )}
        <span>{children}</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <BossButton
        {...buttonProps}
        onClick={handleClick}
        disabled={!isReady || isLoading}
        loading={isLoading}
        className={`relative ${className}`}
      >
        {getButtonContent()}
      </BossButton>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-red-600 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}
      
      {!isReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-yellow-600 text-sm"
        >
          <Shield className="w-4 h-4" />
          <span>Loading security verification...</span>
        </motion.div>
      )}
    </div>
  )
}

// Specialized reCAPTCHA button variants
export function RecaptchaSignupButton({ children, ...props }: Omit<RecaptchaButtonProps, 'action'>) {
  return (
    <RecaptchaButton 
      action={RECAPTCHA_ACTIONS.SIGNUP}
      variant="empowerment"
      crown
      {...props}
    >
      {children}
    </RecaptchaButton>
  )
}

export function RecaptchaSigninButton({ children, ...props }: Omit<RecaptchaButtonProps, 'action'>) {
  return (
    <RecaptchaButton 
      action={RECAPTCHA_ACTIONS.SIGNIN}
      variant="primary"
      {...props}
    >
      {children}
    </RecaptchaButton>
  )
}

export function RecaptchaContactButton({ children, ...props }: Omit<RecaptchaButtonProps, 'action'>) {
  return (
    <RecaptchaButton 
      action={RECAPTCHA_ACTIONS.CONTACT}
      variant="accent"
      {...props}
    >
      {children}
    </RecaptchaButton>
  )
}

export function RecaptchaDemoButton({ children, ...props }: Omit<RecaptchaButtonProps, 'action'>) {
  return (
    <RecaptchaButton 
      action={RECAPTCHA_ACTIONS.DEMO}
      variant="secondary"
      {...props}
    >
      {children}
    </RecaptchaButton>
  )
}

// Form wrapper component
export function RecaptchaForm({
  children,
  action = RECAPTCHA_ACTIONS.SUBMIT,
  onSubmit,
  ...props
}: {
  children: ReactNode
  action?: RecaptchaAction
  onSubmit: (formData: any) => Promise<any>
  [key: string]: any
}) {
  const { handleSubmit, isReady, isLoading, error } = useRecaptchaForm({
    action,
    ...props
  })

  const handleFormSubmit = async (formData: any) => {
    return await handleSubmit(formData, onSubmit)
  }

  return (
    <div className="space-y-4">
      {children}
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-red-600 text-sm p-3 glass rounded-lg"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}
      
      {!isReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-yellow-600 text-sm p-3 glass rounded-lg"
        >
          <Shield className="w-4 h-4" />
          <span>Loading security verification...</span>
        </motion.div>
      )}
    </div>
  )
}