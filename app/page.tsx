"use client"

import { useState } from "react"
import { AuthModal } from "@/components/auth/auth-modal"
import { SharedLandingPage } from "@/components/shared/shared-landing-page"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    router.push('/dashboard')
  }

  return (
    <>
      <SharedLandingPage 
        showAuthModal={showAuthModal}
        onShowAuthModal={() => setShowAuthModal(true)}
        styleVariant="gradient"
      />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}
