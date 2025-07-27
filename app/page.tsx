"use client"

import { useState } from "react"
import { AuthModal } from "@/components/auth/auth-modal"
import { SharedLandingPage } from "@/components/shared/shared-landing-page"

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <>
      <SharedLandingPage 
        showAuthModal={showAuthModal}
        onShowAuthModal={() => setShowAuthModal(true)}
        styleVariant="gradient"
      />
      
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}