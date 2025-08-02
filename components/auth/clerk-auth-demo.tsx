"use client"

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs"

export function ClerkAuthDemo() {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
            Sign Up
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Welcome!</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </div>
  )
} 