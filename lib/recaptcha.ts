import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise'

// reCAPTCHA configuration
export const RECAPTCHA_CONFIG = {
  siteKey: '6Lc6OK8rAAAAAPXfc8nHtTiKjk8rE9MhP10Kb8Pj',
  projectId: 'soloboss-ai-v3',
  actions: {
    signup: 'signup',
    signin: 'signin',
    contact: 'contact',
    demo: 'demo',
    submit: 'submit'
  }
}

/**
 * Create an assessment to analyze the risk of a UI action.
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
    // Create the reCAPTCHA client
    const client = new RecaptchaEnterpriseServiceClient()
    const projectPath = client.projectPath(RECAPTCHA_CONFIG.projectId)

    // Build the assessment request
    const request = {
      assessment: {
        event: {
          token: token,
          siteKey: RECAPTCHA_CONFIG.siteKey,
        },
      },
      parent: projectPath,
    }

    const [response] = await client.createAssessment(request)

    // Check if the token is valid
    if (!response.tokenProperties?.valid) {
      console.error(`reCAPTCHA validation failed: ${response.tokenProperties?.invalidReason}`)
      return null
    }

    // Check if the expected action was executed
    if (response.tokenProperties.action === action) {
      const score = response.riskAnalysis?.score || 0
      console.log(`reCAPTCHA score for action '${action}': ${score}`)
      
      // Log risk reasons if any
      if (response.riskAnalysis?.reasons) {
        response.riskAnalysis.reasons.forEach((reason) => {
          console.log(`Risk reason: ${reason}`)
        })
      }

      return score
    } else {
      console.error(`Action mismatch. Expected: ${action}, Got: ${response.tokenProperties.action}`)
      return null
    }
  } catch (error) {
    console.error('Error creating reCAPTCHA assessment:', error)
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
  // Normalize action to lowercase for consistency with Google's expectations
  const normalizedAction = action.toLowerCase()
  const score = await createAssessment(token, normalizedAction)
  
  if (score === null) {
    return false
  }

  // Score ranges from 0.0 (likely bot) to 1.0 (likely human)
  return score >= minScore
}

/**
 * Get reCAPTCHA script URL for client-side loading
 */
export function getRecaptchaScriptUrl(): string {
  return `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_CONFIG.siteKey}`
}

/**
 * reCAPTCHA action types for different user interactions
 */
export const RECAPTCHA_ACTIONS = {
  SIGNUP: 'signup',
  SIGNIN: 'signin',
  CONTACT: 'contact',
  DEMO: 'demo',
  SUBMIT: 'submit',
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgot_password',
  RESET_PASSWORD: 'reset_password',
  UPDATE_PROFILE: 'update_profile',
  CREATE_GOAL: 'create_goal',
  CREATE_TASK: 'create_task',
  SEND_MESSAGE: 'send_message'
} as const

export type RecaptchaAction = typeof RECAPTCHA_ACTIONS[keyof typeof RECAPTCHA_ACTIONS]