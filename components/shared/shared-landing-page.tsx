"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

interface SharedLandingPageProps {
  showAuthModal?: boolean
  onShowAuthModal?: () => void
  styleVariant?: string
}

export function SharedLandingPage({
  showAuthModal = false,
  onShowAuthModal = () => {},
  styleVariant = "default",
}: SharedLandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center">SoloBoss AI Platform</h1>
        <p className="text-center mt-4 text-gray-600">Loading full landing page...</p>
      </div>
    </div>
  )
}