"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, AlertCircle, CheckCircle } from "lucide-react"
import { format, subYears } from "date-fns"

export function SupabaseAuth() {
  const { signIn, signUp, user, signOut } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateSignUpForm()) {
      return
    }
    
    setSignUpLoading(true)
    setError(null)
    
    try {
      const { error } = await signUp(signUpData.email, signUpData.password, {
        first_name: signUpData.firstName,
        last_name: signUpData.lastName,
        date_of_birth: signUpData.dateOfBirth,
        username: signUpData.username
      })
      
      if (error) {
        setError(error.message)
      } else {
        setError("Check your email for a confirmation link!")
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
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    }
    
    setSignUpLoading(false)
  }

  const handleSignUpInputChange = (field: string, value: string) => {
    setSignUpData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (signUpErrors[field]) {
      setSignUpErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  if (user) {
    return (
      <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="boss-text-gradient text-xl font-bold">
            Welcome, Boss! 👑
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-soloboss flex items-center justify-center">
              <span className="text-white font-bold text-sm">👑</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.email}</p>
              <p className="text-xs text-gray-600">Ready to dominate?</p>
            </div>
          </div>
          <Button 
            onClick={signOut}
            variant="outline" 
            className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="boss-text-gradient text-xl font-bold">
          SoloBoss AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button 
                type="submit" 
                className="w-full boss-button bg-gradient-soloboss hover:bg-gradient-soloboss-light text-white font-semibold"
                disabled={loading}
              >
                {loading ? "Signing In..." : "🔥 Sign In & Conquer"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={signUpData.firstName}
                    onChange={(e) => handleSignUpInputChange("firstName", e.target.value)}
                    placeholder="John"
                    className={signUpErrors.firstName ? "border-red-500" : ""}
                  />
                  {signUpErrors.firstName && (
                    <p className="text-xs text-red-600">{signUpErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={signUpData.lastName}
                    onChange={(e) => handleSignUpInputChange("lastName", e.target.value)}
                    placeholder="Doe"
                    className={signUpErrors.lastName ? "border-red-500" : ""}
                  />
                  {signUpErrors.lastName && (
                    <p className="text-xs text-red-600">{signUpErrors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <div className="relative">
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={signUpData.dateOfBirth}
                    onChange={(e) => handleSignUpInputChange("dateOfBirth", e.target.value)}
                    max={format(subYears(new Date(), 18), "yyyy-MM-dd")}
                    className={signUpErrors.dateOfBirth ? "border-red-500" : ""}
                  />
                  <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {signUpErrors.dateOfBirth && (
                  <p className="text-xs text-red-600">{signUpErrors.dateOfBirth}</p>
                )}
                <p className="text-xs text-gray-500">You must be at least 18 years old</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email Address *</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signUpData.email}
                  onChange={(e) => handleSignUpInputChange("email", e.target.value)}
                  placeholder="your@email.com"
                  className={signUpErrors.email ? "border-red-500" : ""}
                />
                {signUpErrors.email && (
                  <p className="text-xs text-red-600">{signUpErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  value={signUpData.username}
                  onChange={(e) => handleSignUpInputChange("username", e.target.value)}
                  placeholder="your_username"
                  className={signUpErrors.username ? "border-red-500" : ""}
                />
                {signUpErrors.username && (
                  <p className="text-xs text-red-600">{signUpErrors.username}</p>
                )}
                <p className="text-xs text-gray-500">Letters, numbers, and underscores only</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password *</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signUpData.password}
                  onChange={(e) => handleSignUpInputChange("password", e.target.value)}
                  placeholder="••••••••"
                  className={signUpErrors.password ? "border-red-500" : ""}
                />
                {signUpErrors.password && (
                  <p className="text-xs text-red-600">{signUpErrors.password}</p>
                )}
                <p className="text-xs text-gray-500">At least 8 characters with uppercase, lowercase, and number</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={signUpData.confirmPassword}
                  onChange={(e) => handleSignUpInputChange("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  className={signUpErrors.confirmPassword ? "border-red-500" : ""}
                />
                {signUpErrors.confirmPassword && (
                  <p className="text-xs text-red-600">{signUpErrors.confirmPassword}</p>
                )}
                {signUpData.confirmPassword && signUpData.password === signUpData.confirmPassword && (
                  <div className="flex items-center text-xs text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Passwords match
                  </div>
                )}
              </div>
              
              {error && (
                <Alert variant={error.includes("Check your email") ? "default" : "destructive"}>
                  {error.includes("Check your email") ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                variant="outline"
                className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold"
                disabled={signUpLoading}
              >
                {signUpLoading ? "Creating Account..." : "✨ Start Your Empire"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
