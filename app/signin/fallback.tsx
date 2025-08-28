"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Crown, Lock } from "lucide-react"
import { motion } from "framer-motion"

export default function FallbackSignIn() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Simple validation
      if (!email || !password) {
        throw new Error("Please enter both email and password")
      }

      // For now, just redirect to dashboard (you can add actual auth later)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-pink-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden">
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
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 rounded-full opacity-10"
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
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-teal-600 to-pink-600 bg-clip-text text-transparent">
                  SoloBoss AI
                </span>
              </motion.div>
              <p className="text-gray-600">Welcome back, boss!</p>
            </div>

            {/* Error Message */}
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500 hover:from-purple-600 hover:via-teal-600 hover:to-pink-600 text-white"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-1 mx-auto"
                >
                  <Lock className="w-3 h-3" />
                  Forgot Password?
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push('/signup')}
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
