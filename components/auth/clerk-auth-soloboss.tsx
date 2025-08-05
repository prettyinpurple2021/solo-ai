"use client"

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ClerkAuthSoloboss() {
  return (
    <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="boss-text-gradient text-xl font-bold">
          SoloBoss AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignedOut>
          <div className="space-y-3">
            <SignInButton mode="modal">
              <Button className="w-full boss-button bg-gradient-soloboss hover:bg-gradient-soloboss-light text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                🔥 Sign In & Conquer
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline" className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold py-3 px-6 rounded-full transition-all duration-300 hover:border-purple-400 hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                ✨ Start Your Empire
              </Button>
            </SignUpButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-soloboss flex items-center justify-center">
                <span className="text-white font-bold text-sm">👑</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Welcome, Boss!</p>
                <p className="text-xs text-gray-600">Ready to dominate?</p>
              </div>
            </div>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 rounded-full bg-gradient-soloboss",
                  userButtonPopoverCard: "shadow-xl border-2 border-purple-200",
                  userButtonPopoverActionButton: "hover:bg-purple-50 text-purple-700",
                }
              }}
            />
          </div>
        </SignedIn>
      </CardContent>
    </Card>
  )
}

export function ClerkAuthHeader() {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-purple-200">
      <div className="flex items-center space-x-4">
        <h1 className="boss-text-gradient text-2xl font-bold">SoloBoss AI</h1>
      </div>
      <div className="flex items-center space-x-3">
        <SignedOut>
          <SignInButton mode="modal">
            <Button className="boss-button bg-gradient-soloboss hover:bg-gradient-soloboss-light text-white font-semibold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="outline" className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold py-2 px-4 rounded-full transition-all duration-300 hover:border-purple-400 hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              Sign Up
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-full bg-gradient-soloboss",
                userButtonPopoverCard: "shadow-xl border-2 border-purple-200",
                userButtonPopoverActionButton: "hover:bg-purple-50 text-purple-700",
              }
            }}
          />
        </SignedIn>
      </div>
    </div>
  )
}

export function ClerkAuthSidebar() {
  return (
    <div className="p-4 space-y-4">
      <div className="text-center">
        <h2 className="boss-text-gradient text-lg font-bold mb-2">Your AI Squad</h2>
        <p className="text-sm text-gray-600">Ready to work for you</p>
      </div>
      
      <SignedOut>
        <div className="space-y-3">
          <SignInButton mode="modal">
            <Button className="w-full boss-button bg-gradient-soloboss hover:bg-gradient-soloboss-light text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              🔥 Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="outline" className="w-full border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold py-3 px-4 rounded-lg transition-all duration-300 hover:border-purple-400 hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              ✨ Get Started
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="w-8 h-8 rounded-full bg-gradient-soloboss flex items-center justify-center">
              <span className="text-white font-bold text-xs">👑</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Boss Mode</p>
              <p className="text-xs text-gray-600">Active</p>
            </div>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-6 h-6 rounded-full bg-gradient-soloboss",
                  userButtonPopoverCard: "shadow-xl border-2 border-purple-200",
                  userButtonPopoverActionButton: "hover:bg-purple-50 text-purple-700",
                }
              }}
            />
          </div>
        </div>
      </SignedIn>
    </div>
  )
} 