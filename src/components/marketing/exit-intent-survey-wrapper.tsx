'use client'

import { usePathname } from 'next/navigation'
import ExitIntentSurvey from './exit-intent-survey'

/**
 * Renders the exit-intent survey only on non-studio routes.
 * This wrapper handles the pathname check outside the survey component
 * to avoid React hooks ordering violations.
 */
export default function ExitIntentSurveyWrapper() {
  const pathname = usePathname()
  if (pathname?.startsWith('/studio')) return null
  return <ExitIntentSurvey />
}
