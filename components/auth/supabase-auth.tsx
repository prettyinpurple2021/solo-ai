"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SupabaseAuth() {
  const { signIn, signUp, user, signOut } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
    } else {
      setError("Check your email for a confirmation link!")
    }
    setLoading(false)
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
                <p className="text-sm text-red-600">{error}</p>
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
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button 
                type="submit" 
                variant="outline"
                className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "✨ Start Your Empire"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
