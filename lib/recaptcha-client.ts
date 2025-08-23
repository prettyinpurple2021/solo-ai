// Client-side reCAPTCHA configuration (no server-side imports)

// reCAPTCHA configuration
// Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY and NEXT_PUBLIC_RECAPTCHA_PROJECT_ID in your environment variables
export const RECAPTCHA_CONFIG = {
  siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
  projectId: process.env.NEXT_PUBLIC_RECAPTCHA_PROJECT_ID || '',
  actions: {
    signup: 'signup',
    signin: 'signin',
    contact: 'contact',
    demo: 'demo',
    submit: 'submit'
  }
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