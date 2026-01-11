import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'

// reCAPTCHA Enterprise configuration
export const RECAPTCHA_CONFIG = {
  siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
  apiKey: process.env.GOOGLE_CLOUD_API_KEY || '',
  projectId: process.env.NEXT_PUBLIC_RECAPTCHA_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID || '',
  actions: {
    signup: 'signup',
    signin: 'signin',
    contact: 'contact',
    demo: 'demo',
    submit: 'submit'
  }
}

/**
 * Verify reCAPTCHA Enterprise token using Google Cloud REST API
 * 
 * @param token - The generated token obtained from the client
 * @param action - Action name corresponding to the token
 * @returns Promise<number | null> - Risk score or null if validation failed
 */
export async function createAssessment(
  token: string,
  action: string = 'submit'
): Promise<number | null> {
  try {
    if (!RECAPTCHA_CONFIG.apiKey) {
      logError('Google Cloud API key not configured for reCAPTCHA Enterprise')
      return null
    }

    if (!RECAPTCHA_CONFIG.projectId) {
      logError('Google Cloud Project ID not configured for reCAPTCHA Enterprise')
      return null
    }

    if (!RECAPTCHA_CONFIG.siteKey) {
      logError('reCAPTCHA site key not configured')
      return null
    }

    const apiUrl = `https://recaptchaenterprise.googleapis.com/v1/projects/${RECAPTCHA_CONFIG.projectId}/assessments?key=${RECAPTCHA_CONFIG.apiKey}`
    
    const requestBody = {
      event: {
        token: token,
        siteKey: RECAPTCHA_CONFIG.siteKey,
        expectedAction: action
      }
    }

    logDebug('Creating reCAPTCHA Enterprise assessment', { action, projectId: RECAPTCHA_CONFIG.projectId })

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `reCAPTCHA Enterprise API error (${response.status})`
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.message) {
          errorMessage += `: ${errorData.error.message}`
        }
        logError(errorMessage, { 
          status: response.status, 
          error: errorData,
          projectId: RECAPTCHA_CONFIG.projectId 
        })
      } catch {
        logError(errorMessage, { 
          status: response.status, 
          errorText,
          projectId: RECAPTCHA_CONFIG.projectId 
        })
      }
      
      return null
    }

    const data = await response.json()

    if (!data.tokenProperties?.valid) {
      logError(`reCAPTCHA token validation failed:`, data.tokenProperties?.invalidReason)
      return null
    }

    // Check if action matches
    if (data.tokenProperties.action !== action) {
      logWarn(`reCAPTCHA action mismatch. Expected: ${action}, Got: ${data.tokenProperties.action}`)
      return null
    }

    const score = data.riskAnalysis?.score ?? null
    
    if (score === null) {
      logError('reCAPTCHA assessment missing risk score')
      return null
    }

    logInfo(`reCAPTCHA Enterprise score for action '${action}': ${score}`)
    logDebug('reCAPTCHA assessment details:', {
      score,
      action: data.tokenProperties.action,
      valid: data.tokenProperties.valid,
      hostname: data.tokenProperties.hostname
    })

    return score
  } catch (error) {
    logError('Error verifying reCAPTCHA Enterprise token:', error)
    return null
  }
}

/**
 * Validate reCAPTCHA token with a minimum score threshold
 * 
 * @param token - The reCAPTCHA token
 * @param action - The expected action
 * @param minScore - Minimum acceptable score (0.0 to 1.0, default 0.5)
 * @returns Promise<boolean> - Whether the token is valid and meets score threshold
 */
export async function validateRecaptcha(
  token: string,
  action: string = 'submit',
  minScore: number = 0.5
): Promise<boolean> {
  const score = await createAssessment(token, action)
  
  if (score === null) {
    return false
  }

  return score >= minScore
}

/**
 * Get reCAPTCHA script URL for client-side loading
 */
export function getRecaptchaScriptUrl(): string {
  return `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_CONFIG.siteKey}`
}

/**
 * reCAPTCHA action types for different user interactions
 */
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