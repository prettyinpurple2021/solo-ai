"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User } from "lucide-react"
import Link from "next/link"

export default function UserProfilePage() {

  const handleUserProfile = () => {
    // Redirect to our profile page
    window.location.href = "/profile"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <User className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            User Profile
          </CardTitle>
          <CardDescription>
            Manage your account settings, profile information, and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleUserProfile}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
          >
            👤 Manage Profile
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            Need to sign in first?{" "}
            <Link href="/sign-in" className="text-pink-600 hover:text-pink-700 font-medium">
              Sign in here
            </Link>
          </div>
          
          <div className="pt-4">
            <Link href="/">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
