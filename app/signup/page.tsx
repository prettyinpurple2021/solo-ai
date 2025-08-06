"use client"

import { useState } from "react"
import { AuthModal } from "@/components/auth/auth-modal"
import { SharedLandingPage } from "@/components/shared/shared-landing-page"
import { useRouter } from "next/navigation"

export default function SignupPage() {
  const [showAuthModal, setShowAuthModal] = useState(true) // Start with modal open
  const router = useRouter()

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    router.push('/dashboard')
  }

  const handleModalClose = () => {
    setShowAuthModal(false)
    // Optionally redirect to home page when modal is closed
    router.push('/')
  }

  return (
    <>
      <SharedLandingPage 
        showAuthModal={showAuthModal}
        onShowAuthModal={() => setShowAuthModal(true)}
        styleVariant="gradient"
      />
      
      {/* Auth Modal - Always show initially for signup page */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleModalClose}
        onSuccess={handleAuthSuccess}
      />
    </>
  )
}