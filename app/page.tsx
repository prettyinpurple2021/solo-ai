"use client"

import { SharedLandingPage } from "@/components/shared/shared-landing-page"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  const handleAuthRequest = () => {
    // Redirect to Stack Auth sign-in page
    router.push('/signin')
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
