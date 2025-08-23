// Client-side reCAPTCHA configuration (no server-side imports)

// reCAPTCHA configuration
export const RECAPTCHA_CONFIG = {
  siteKey: '6Lc6OKnHtTiKjk8rE9MhP10Kb8Pj',
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