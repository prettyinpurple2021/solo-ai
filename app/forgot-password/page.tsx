"use client"

// Force dynamic rendering to avoid static generation issues with StackAuth
export const dynamic = 'force-dynamic'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BossButton, EmpowermentButton } from "@/components/ui/boss-button"
import { BossCard, EmpowermentCard } from "@/components/ui/boss-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Crown, Lock, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useStackApp } from "@stackframe/stack"

export default function ForgotPasswordPage() {
  const stackApp = useStackApp()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // If StackAuth is not available (during SSR/build), show loading
  if (!stackApp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await stackApp?.resetPassword(email)
      setSuccess("Password reset email sent! Check your inbox for instructions.")
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <EmpowermentCard className="relative overflow-hidden">
          {/* Animated background elements */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-20 -right-20 w-40 h-40 gradient-primary rounded-full opacity-10"
          />
          
          <div className="relative z-10">
            <div className="text-center mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-flex items-center space-x-2 mb-4"
              >
                <div className="w-12 h-12 gradient-empowerment rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gradient font-boss">Reset Password</span>
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your email to receive password reset instructions
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="glass"
                  required
                  autoComplete="email"
                />
              </div>
              
              <EmpowermentButton
                type="submit"
                fullWidth
                size="lg"
                disabled={!email.trim() || loading}
                crown
              >
                {loading ? "Sending..." : "Send Reset Email"}
              </EmpowermentButton>

              <div className="text-center space-y-3">
                <button
                  type="button"
                  onClick={() => router.push('/signin')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Sign In
                </button>
                
                <p className="text-sm text-gray-600">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => router.push('/signin')}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </EmpowermentCard>
      </motion.div>
    </div>
  )
}
