"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { BossButton, EmpowermentButton } from "@/components/ui/boss-button"
import { BossCard, EmpowermentCard } from "@/components/ui/boss-card"
import { RecaptchaSignupButton, RecaptchaSigninButton } from "@/components/ui/recaptcha-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, AlertCircle, CheckCircle, Crown, Shield, Lock } from "lucide-react"
import { format, subYears } from "date-fns"
import { motion } from "framer-motion"
import { useStack } from "@stackframe/stack"

export function NeonAuth() {
  const { signIn, signUp, user, signOut } = useStack()
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Enhanced sign-up form state
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  })
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({})
  const [signUpLoading, setSignUpLoading] = useState(false)

  // Determine if we're on signin or signup page
  const isSignInPage = pathname === '/signin'
  const isSignUpPage = pathname === '/signup'

  // Redirect to dashboard when user is authenticated
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleSignIn = async (formData: any) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      await signIn(email, password)
      setSuccess("Sign in successful! Redirecting to dashboard...")
    } catch (err: any) {
      setError(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const validateSignUpForm = () => {
    const errors: Record<string, string> = {}
    
    // First name validation
    if (!signUpData.firstName.trim()) {
      errors.firstName = "First name is required"
    } else if (signUpData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters"
    }
    
    // Last name validation
    if (!signUpData.lastName.trim()) {
      errors.lastName = "Last name is required"
    } else if (signUpData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters"
    }
    
    // Date of birth validation
    if (!signUpData.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required"
    } else {
      const birthDate = new Date(signUpData.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < 18) {
        errors.dateOfBirth = "You must be at least 18 years old to use this app"
      }
    }
    
    // Email validation
    if (!signUpData.email) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    // Username validation
    if (!signUpData.username.trim()) {
      errors.username = "Username is required"
    } else if (signUpData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(signUpData.username)) {
      errors.username = "Username can only contain letters, numbers, and underscores"
    }
    
    // Password validation
    if (!signUpData.password) {
      errors.password = "Password is required"
    } else if (signUpData.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(signUpData.password)) {
      errors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
    
    // Confirm password validation
    if (!signUpData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (signUpData.password !== signUpData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }
    
    setSignUpErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignUp = async (formData: any) => {
    if (!validateSignUpForm()) {
      return { success: false, error: "Please fix the form errors" }
    }
    
    setSignUpLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      await signUp(signUpData.email, signUpData.password, {
        displayName: `${signUpData.firstName} ${signUpData.lastName}`,
        metadata: {
          firstName: signUpData.firstName,
          lastName: signUpData.lastName,
          username: signUpData.username,
          dateOfBirth: signUpData.dateOfBirth
        }
      })
      
      setSuccess("Account created successfully! You can now sign in.")
      // Reset form
      setSignUpData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: ""
      })
      return { success: true }

    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred. Please try again."
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setSignUpLoading(false)
    }
  }

  const handleSignUpInputChange = (field: string, value: string) => {
    setSignUpData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (signUpErrors[field]) {
      setSignUpErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // Don't render anything if user is authenticated (will redirect)
  if (user) {
    return null
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
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gradient font-boss">SoloBoss AI</span>
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400">
                {isSignInPage ? "Welcome back, boss!" : "Join the empire of bad ass girl bosses"}
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

            {/* Sign In Form */}
            {isSignInPage && (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="glass"
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
                    className="glass"
                    required
                    autoComplete="current-password"
                  />
                </div>
                
                <RecaptchaSigninButton
                  onSubmit={handleSignIn}
                  fullWidth
                  size="lg"
                  disabled={!email || !password}
                  type="submit"
                >
                  Sign In
                </RecaptchaSigninButton>

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
            )}

            {/* Sign Up Form */}
            {isSignUpPage && (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={signUpData.firstName}
                      onChange={(e) => handleSignUpInputChange("firstName", e.target.value)}
                      placeholder="First name"
                      className="glass"
                      required
                      autoComplete="given-name"
                    />
                    {signUpErrors.firstName && (
                      <p className="text-red-500 text-xs">{signUpErrors.firstName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={signUpData.lastName}
                      onChange={(e) => handleSignUpInputChange("lastName", e.target.value)}
                      placeholder="Last name"
                      className="glass"
                      required
                      autoComplete="family-name"
                    />
                    {signUpErrors.lastName && (
                      <p className="text-red-500 text-xs">{signUpErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                  <div className="relative">
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={signUpData.dateOfBirth}
                      onChange={(e) => handleSignUpInputChange("dateOfBirth", e.target.value)}
                      max={format(subYears(new Date(), 18), 'yyyy-MM-dd')}
                      className="glass pr-10"
                      required
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {signUpErrors.dateOfBirth && (
                    <p className="text-red-500 text-xs">{signUpErrors.dateOfBirth}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => handleSignUpInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="glass"
                    required
                    autoComplete="email"
                  />
                  {signUpErrors.email && (
                    <p className="text-red-500 text-xs">{signUpErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={signUpData.username}
                    onChange={(e) => handleSignUpInputChange("username", e.target.value)}
                    placeholder="Choose a username"
                    className="glass"
                    required
                    autoComplete="username"
                  />
                  {signUpErrors.username && (
                    <p className="text-red-500 text-xs">{signUpErrors.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => handleSignUpInputChange("password", e.target.value)}
                    placeholder="Create a strong password"
                    className="glass"
                    required
                    autoComplete="new-password"
                  />
                  {signUpErrors.password && (
                    <p className="text-red-500 text-xs">{signUpErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => handleSignUpInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className="glass"
                    required
                    autoComplete="new-password"
                  />
                  {signUpErrors.confirmPassword && (
                    <p className="text-red-500 text-xs">{signUpErrors.confirmPassword}</p>
                  )}
                </div>

                <RecaptchaSignupButton
                  onSubmit={handleSignUp}
                  fullWidth
                  size="lg"
                  disabled={signUpLoading}
                  type="submit"
                >
                  {signUpLoading ? "Creating Account..." : "Create Account"}
                </RecaptchaSignupButton>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
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
            )}
          </div>
        </EmpowermentCard>
      </motion.div>
    </div>
  )
}
