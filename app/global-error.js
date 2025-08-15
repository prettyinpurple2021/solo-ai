'use client'

import * as Sentry from '@sentry/nextjs'
// Not using Error component directly
// import Error from 'next/error'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
          <h1 className="text-3xl font-bold text-purple-600 mb-4">Something went wrong!</h1>
          <p className="mb-6 text-gray-600">We've been notified and are working to fix the issue.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
