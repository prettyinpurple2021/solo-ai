"use client"

import { useState } from "react"
import { SharedLandingPage } from "@/components/shared/shared-landing-page"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  const handleAuthRequest = () => {
    // Redirect to Clerk sign-in page
    router.push('/sign-in')
  }

  return (
    <>
      <SharedLandingPage 
        showAuthModal={false}
        onShowAuthModal={handleAuthRequest}
        styleVariant="gradient"
      />
    </>
  )
}
