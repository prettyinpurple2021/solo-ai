"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { BossButton, EmpowermentButton } from "@/components/ui/boss-button"
import { BossCard, EmpowermentCard } from "@/components/ui/boss-card"
import { RecaptchaSignupButton, RecaptchaSigninButton } from "@/components/ui/recaptcha-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, AlertCircle, CheckCircle, Crown, Shield } from "lucide-react"
import { format, subYears } from "date-fns"
import { motion } from "framer-motion"

export function NeonAuth() {
  const { signIn, signUp, user, signOut: _signOut } = useAuth()
  const router = useRouter()
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
    
    const { error } = await signIn(email, password)
    if (error) {
      setError(typeof error === 'string' ? error : 'Sign in failed')
    } else {
      setSuccess("Sign in successful! Redirecting to dashboard...")
    }
    setLoading(false)
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
      const { error } = await signUp(signUpData.email, signUpData.password, {
        full_name: `${signUpData.firstName} ${signUpData.lastName}`,
        date_of_birth: signUpData.dateOfBirth,
        username: signUpData.username
      })
      
      if (error) {
        setError(typeof error === 'string' ? error : 'Sign up failed')
        return { success: false, error: typeof error === 'string' ? error : 'Sign up failed' }
      } else {
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
      }
    } catch (err) {
      const errorMsg = "An unexpected error occurred. Please try again."
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
              <p className="text-gray-600 dark:text-gray-400">Join the empire of bad ass girl bosses</p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass">
                <TabsTrigger value="signin" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:gradient-empowerment data-[state=active]:text-white">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="glass"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="glass"
                      required
                    />
                  </div>
                  
                  <RecaptchaSigninButton
                    onSubmit={handleSignIn}
                    fullWidth
                    size="lg"
                    disabled={!email || !password}
                  >
                    Sign In
                  </RecaptchaSigninButton>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={signUpData.firstName}
                        onChange={(e) => handleSignUpInputChange("firstName", e.target.value)}
                        placeholder="First name"
                        className="glass"
                        required
                      />
                      {signUpErrors.firstName && (
                        <p className="text-red-500 text-xs">{signUpErrors.firstName}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={signUpData.lastName}
                        onChange={(e) => handleSignUpInputChange("lastName", e.target.value)}
                        placeholder="Last name"
                        className="glass"
                        required
                      />
                      {signUpErrors.lastName && (
                        <p className="text-red-500 text-xs">{signUpErrors.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={signUpData.dateOfBirth}
                      onChange={(e) => handleSignUpInputChange("dateOfBirth", e.target.value)}
                      max={format(subYears(new Date(), 18), 'yyyy-MM-dd')}
                      className="glass"
                      required
                    />
                    {signUpErrors.dateOfBirth && (
                      <p className="text-red-500 text-xs">{signUpErrors.dateOfBirth}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-sm font-medium">Email</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => handleSignUpInputChange("email", e.target.value)}
                      placeholder="Enter your email"
                      className="glass"
                      required
                    />
                    {signUpErrors.email && (
                      <p className="text-red-500 text-xs">{signUpErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={signUpData.username}
                      onChange={(e) => handleSignUpInputChange("username", e.target.value)}
                      placeholder="Choose a username"
                      className="glass"
                      required
                    />
                    {signUpErrors.username && (
                      <p className="text-red-500 text-xs">{signUpErrors.username}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-sm font-medium">Password</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => handleSignUpInputChange("password", e.target.value)}
                      placeholder="Create a password"
                      className="glass"
                      required
                    />
                    {signUpErrors.password && (
                      <p className="text-red-500 text-xs">{signUpErrors.password}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => handleSignUpInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm your password"
                      className="glass"
                      required
                    />
                    {signUpErrors.confirmPassword && (
                      <p className="text-red-500 text-xs">{signUpErrors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <RecaptchaSignupButton
                    onSubmit={handleSignUp}
                    fullWidth
                    size="lg"
                    disabled={Object.keys(signUpErrors).length > 0 || !signUpData.email || !signUpData.password}
                  >
                    Create Account
                  </RecaptchaSignupButton>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Error and Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            {/* Security Notice */}
            <div className="mt-6 p-4 glass rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Protected by Google reCAPTCHA Enterprise</span>
              </div>
            </div>
          </div>
        </EmpowermentCard>
      </motion.div>
    </div>
  )
}
