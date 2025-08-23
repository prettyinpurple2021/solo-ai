import { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Authentication Error - SoloBoss AI',
  description: 'An error occurred during authentication. Please try again.',
}

interface AuthErrorPageProps {
  searchParams: {
    error?: string
    error_description?: string
  }
}

export default function AuthCodeErrorPage({ searchParams }: AuthErrorPageProps) {
  const { error, error_description } = searchParams

  const getErrorMessage = (errorCode?: string) => {
    switch (errorCode) {
      case 'access_denied':
        return 'Access was denied. You may have cancelled the authentication process.'
      case 'invalid_request':
        return 'The authentication request was invalid.'
      case 'invalid_client':
        return 'The authentication client configuration is invalid.'
      case 'invalid_grant':
        return 'The authorization grant is invalid.'
      case 'unauthorized_client':
        return 'The client is not authorized to perform this request.'
      case 'unsupported_grant_type':
        return 'The authorization grant type is not supported.'
      case 'invalid_scope':
        return 'The requested scope is invalid.'
      case 'server_error':
        return 'An internal server error occurred during authentication.'
      case 'temporarily_unavailable':
        return 'The authentication service is temporarily unavailable.'
      default:
        return 'An unexpected error occurred during authentication.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600">
            {getErrorMessage(error)}
          </p>
          
          {error_description && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                <strong>Details:</strong> {error_description}
              </p>
            </div>
          )}
          
          {error && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-xs text-gray-500">
                <strong>Error Code:</strong> {error}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Link 
            href="/signin"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Link>
          
          <Link 
            href="/"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If this problem persists, please{' '}
            <Link href="/contact" className="text-purple-600 hover:text-purple-700">
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}