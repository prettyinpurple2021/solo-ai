import Link from "next/link"
import { ArrowLeft, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="w-full max-w-md text-center">
        {/* SoloBoss Crown Logo */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-purple-100 rounded-full">
            <Crown className="h-12 w-12 text-purple-600" />
          </div>
        </div>

        {/* 404 Typography */}
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard">
              <Crown className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-500">
          Need help? <Link href="/contact" className="text-purple-600 hover:underline">Contact support</Link>
        </p>
      </div>
    </div>
  )
}