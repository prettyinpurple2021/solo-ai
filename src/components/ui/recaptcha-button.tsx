"use client"

import { logError, logWarn, logInfo,} from '@/lib/logger'
import { ReactNode} from "react"
import { motion} from "framer-motion"
import { CyberButton } from "@/components/cyber/CyberButton"
import { ComponentProps } from "react"
import { useRecaptcha, useRecaptchaForm} from "@/hooks/use-recaptcha"
import { RECAPTCHA_ACTIONS, type RecaptchaAction} from "@/lib/recaptcha-client"
import { Shield, AlertCircle,} from "lucide-react"
import { RECAPTCHA_CONFIG} from "@/lib/recaptcha-client"


interface RecaptchaButtonProps extends Omit<ComponentProps<typeof CyberButton>, 'onClick' | 'onError'> {
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
    
    if (!RECAPTCHA_CONFIG.siteKey) {
      logWarn('reCAPTCHA site key not configured, proceeding without validation')
      if (onSubmit) {
        try {
          const result = await onSubmit(formData)
          return result
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Submission failed'
          onError?.(errorMsg)
        }
      }
      return
    }
    
    if (!isReady) {
      const errorMsg = 'reCAPTCHA not ready. Please wait a moment and try again.'
      logError('reCAPTCHA not ready')
      onError?.(errorMsg)
      return
    }

    try {
      logInfo('Executing reCAPTCHA for action:', action)
      const token = await execute()
      
      if (token && onSubmit) {
        logInfo('reCAPTCHA token generated, submitting form')
        const result = await onSubmit(formData)
        return result
      } else if (!token) {
        logError('Failed to generate reCAPTCHA token')
        onError?.('Failed to generate security verification token')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Submission failed'
      logError('reCAPTCHA execution error:', err)
      onError?.(errorMsg)
    }
  }

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
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
              repeat: Infinity
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
      <CyberButton
        {...buttonProps}
        onClick={handleClick}
        disabled={!isReady || isLoading}
        className={`relative ${className}`}
      >
        {getButtonContent()}
      </CyberButton>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-neon-magenta text-sm font-mono"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}
      
      {!isReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-neon-orange text-sm font-mono"
        >
          <Shield className="w-4 h-4" />
          <span>Loading security verification...</span>
        </motion.div>
      )}
    </div>
  )
}

// Specialized reCAPTCHA button variants following Cyberpunk Design System v3
export function RecaptchaSignupButton({ children, ...props }: Omit<RecaptchaButtonProps, 'action'>) {
  return (
    <RecaptchaButton 
      action={RECAPTCHA_ACTIONS.SIGNUP}
      variant="cyan"
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
      variant="cyan"
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
      variant="purple"
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
      variant="magenta"
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
  const { handleSubmit, isReady, error } = useRecaptchaForm({
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
          className="flex items-center space-x-2 text-neon-magenta text-sm font-mono p-3 bg-dark-card border border-neon-magenta rounded-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}
      
      {!isReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 text-neon-orange text-sm font-mono p-3 bg-dark-card border border-neon-orange rounded-sm"
        >
          <Shield className="w-4 h-4" />
          <span>Loading security verification...</span>
        </motion.div>
      )}
    </div>
  )
}
