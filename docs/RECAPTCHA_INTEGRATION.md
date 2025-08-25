# reCAPTCHA Enterprise Integration

This document explains how to use the Google reCAPTCHA Enterprise integration in the SoloBoss AI platform.

## Overview

The reCAPTCHA integration provides enterprise-grade bot protection for forms, buttons, and user interactions across the platform. It uses Google reCAPTCHA Enterprise with server-side validation for maximum security.

## Configuration

### Site Key
- **Site Key**: `6Lc6OK8rAAAAAPXfc8nHtTiKjk8rE9MhP10Kb8Pj`
- **Project ID**: `soloboss-ai-v3`

### Environment Variables
Make sure these are set in your environment:
```bash
# Client-side (optional - fallback)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc6OK8rAAAAAPXfc8nHtTiKjk8rE9MhP10Kb8Pj
NEXT_PUBLIC_RECAPTCHA_PROJECT_ID=soloboss-ai-v3

# Server-side (for Google Cloud client)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

## Components

### 1. RecaptchaProvider
Wraps your app to provide reCAPTCHA functionality.

```tsx
import { RecaptchaProvider } from '@/components/recaptcha/recaptcha-provider'

function App() {
  return (
    <RecaptchaProvider>
      {/* Your app content */}
    </RecaptchaProvider>
  )
}
```

### 2. useRecaptcha Hook
Basic hook for direct reCAPTCHA interaction.

```tsx
import { useRecaptcha, RECAPTCHA_ACTIONS } from '@/components/recaptcha/recaptcha-provider'

function MyComponent() {
  const { isReady, executeRecaptcha } = useRecaptcha()

  const handleClick = async () => {
    if (isReady) {
      const token = await executeRecaptcha(RECAPTCHA_ACTIONS.LOGIN)
      console.log('Token:', token)
    }
  }

  return <button onClick={handleClick}>Login</button>
}
```

### 3. useRecaptchaValidation Hook
Advanced hook with backend validation.

```tsx
import { useRecaptchaValidation } from '@/hooks/use-recaptcha-validation'
import { RECAPTCHA_ACTIONS } from '@/components/recaptcha/recaptcha-provider'

function MyForm() {
  const { validateWithRecaptcha, isValidating } = useRecaptchaValidation()

  const handleSubmit = async () => {
    const result = await validateWithRecaptcha(RECAPTCHA_ACTIONS.SUBMIT, 0.5)
    
    if (result.success) {
      // Proceed with form submission
      console.log('Validation passed!')
    } else {
      console.error('Validation failed:', result.error)
    }
  }

  return (
    <button onClick={handleSubmit} disabled={isValidating}>
      {isValidating ? 'Verifying...' : 'Submit'}
    </button>
  )
}
```

### 4. RecaptchaButton Component
Button with built-in reCAPTCHA protection.

```tsx
import { RecaptchaButton } from '@/components/recaptcha/recaptcha-button'

function LoginForm() {
  const handleLogin = async () => {
    // Your login logic here
    console.log('Login executed after reCAPTCHA validation')
  }

  return (
    <RecaptchaButton
      action="LOGIN"
      minScore={0.3}
      onClick={handleLogin}
      showSecurityBadge
    >
      Sign In
    </RecaptchaButton>
  )
}
```

### 5. Predefined Secure Buttons

```tsx
import { 
  SecureLoginButton, 
  SecureSignupButton, 
  SecureDemoButton 
} from '@/components/recaptcha/recaptcha-button'

function AuthForm() {
  return (
    <>
      <SecureLoginButton onClick={handleLogin} />
      <SecureSignupButton onClick={handleSignup} />
      <SecureDemoButton onClick={showDemo} />
    </>
  )
}
```

### 6. SecureContactForm Example

```tsx
import { SecureContactForm } from '@/components/forms/secure-contact-form'

function ContactPage() {
  const handleContactSubmit = async (data) => {
    console.log('Contact form data:', data)
    // Process the contact form
  }

  return (
    <SecureContactForm onSubmit={handleContactSubmit} />
  )
}
```

## Available Actions

Pre-defined reCAPTCHA actions with recommended minimum scores:

```typescript
const RECAPTCHA_ACTIONS = {
  LOGIN: 'LOGIN',           // Min score: 0.3
  REGISTER: 'REGISTER',     // Min score: 0.5
  SIGNUP: 'SIGNUP',         // Min score: 0.5
  SIGNIN: 'SIGNIN',         // Min score: 0.3
  CONTACT: 'CONTACT',       // Min score: 0.4
  DEMO: 'DEMO',             // Min score: 0.2
  SUBMIT: 'SUBMIT',         // Min score: 0.5
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',  // Min score: 0.3
  RESET_PASSWORD: 'RESET_PASSWORD',    // Min score: 0.5
  PAYMENT: 'PAYMENT',       // Min score: 0.7
  SUBSCRIPTION: 'SUBSCRIPTION',  // Min score: 0.7
  DELETE_ITEM: 'DELETE_ITEM',    // Min score: 0.6
  UPLOAD_FILE: 'UPLOAD_FILE',    // Min score: 0.5
  CREATE_GOAL: 'CREATE_GOAL',    // Min score: 0.4
  CREATE_TASK: 'CREATE_TASK',    // Min score: 0.4
  SEND_MESSAGE: 'SEND_MESSAGE',  // Min score: 0.4
}
```

## Server-Side Validation

The backend automatically validates reCAPTCHA tokens:

```typescript
// POST /api/recaptcha/validate
{
  "token": "reCAPTCHA_token_here",
  "action": "LOGIN",
  "minScore": 0.5
}

// Response
{
  "success": true,
  "message": "reCAPTCHA validation successful"
}
```

## Manual Implementation

If you need custom implementation:

```tsx
import { useRecaptcha } from '@/components/recaptcha/recaptcha-provider'

function CustomForm() {
  const { executeRecaptcha } = useRecaptcha()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Generate token
    const token = await executeRecaptcha('CUSTOM_ACTION')
    if (!token) return

    // Validate with backend
    const response = await fetch('/api/recaptcha/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        action: 'CUSTOM_ACTION',
        minScore: 0.5
      })
    })

    const result = await response.json()
    if (result.success) {
      // Proceed with form submission
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Best Practices

### 1. Choose Appropriate Actions
Use specific action names for different user interactions to get better analytics and protection.

### 2. Set Appropriate Minimum Scores
- **High security (0.7+)**: Payments, subscriptions, account deletion
- **Medium security (0.4-0.6)**: Registration, password reset, file uploads
- **Low security (0.2-0.3)**: Login, demos, basic interactions

### 3. User Experience
- Show loading states during validation
- Provide clear error messages
- Don't block users unnecessarily

### 4. Error Handling
Always handle reCAPTCHA errors gracefully:

```tsx
const result = await validateWithRecaptcha(action, minScore)
if (!result.success) {
  // Show user-friendly error message
  // Log technical details for debugging
  console.error('reCAPTCHA failed:', result.error)
}
```

### 5. Testing
- Test with different user behaviors
- Monitor reCAPTCHA scores in production
- Adjust minimum scores based on actual usage patterns

## Troubleshooting

### Common Issues

1. **Script not loading**: Check network connectivity and domain registration
2. **Low scores**: Adjust minimum score thresholds based on your user base
3. **Validation errors**: Check server-side Google Cloud credentials

### Debug Mode

Enable debug logging:

```typescript
// In development, you can see detailed logs
console.log('reCAPTCHA token generated:', token)
console.log('Validation result:', result)
```

### Support

For issues with reCAPTCHA Enterprise:
1. Check Google Cloud Console for assessment logs
2. Verify domain registration in reCAPTCHA admin
3. Monitor score distributions and adjust thresholds

## Security Notes

- reCAPTCHA tokens expire after 2 minutes
- Always validate tokens server-side
- Use HTTPS for all reCAPTCHA interactions
- Regularly review reCAPTCHA analytics for suspicious patterns

## Integration Checklist

- [ ] RecaptchaProvider added to app root
- [ ] Environment variables configured
- [ ] Google Cloud credentials set up
- [ ] Test forms protected with reCAPTCHA
- [ ] Error handling implemented
- [ ] User feedback for validation states
- [ ] Minimum scores tuned for your use case
- [ ] Production testing completed
