"use client"

import Link from "next/link"
import { useState, type FormEvent} from "react"
import { CheckCircle} from "lucide-react"
import { Input} from "@/components/ui/input"
import { Button} from "@/components/ui/button"
import { CyberFooter } from "@/components/cyber/CyberFooter"

const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "System Status", href: "/status" },
  ],
  popular: [
    { name: "Launch (Free)", href: "/pricing/launch" },
    { name: "Accelerator ($19/mo)", href: "/pricing/accelerator" },
    { name: "Dominator ($29/mo)", href: "/pricing/dominator" },
  ],
  company: [
    { name: "About SoloSuccess", href: "/about" },
    { name: "Founder Blog", href: "/blog" },
    { name: "Contact Us", href: "/contact" },
  ],
  resources: [
    { name: "Help Center", href: "/help" },
    { name: "Founder Community", href: "/community" },
    { name: "Templates", href: "/templates" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
  ],
}

export function AppFooter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || isSubmitting) return

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(true)
        setEmail("")
        setTimeout(() => setIsSubscribed(false), 5000)
      } else {
        setErrorMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Newsletter Section */}
      <div className="bg-cyber-dark/80 backdrop-blur-md border-t border-cyber-cyan/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-sci font-bold text-white mb-4">JOIN THE NETWORK</h3>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Get exclusive updates, AI insights, and strategic intelligence delivered to your neural link.
            </p>
            {isSubscribed ? (
              <div className="flex items-center justify-center gap-2 text-cyber-cyan">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-sci font-semibold">Neural Link Established! ⚡</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="bg-cyber-dark/50 border-cyber-cyan/30 text-white placeholder:text-gray-500 focus:border-cyber-cyan"
                    disabled={isSubmitting}
                    required
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="bg-cyber-cyan/10 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-white font-sci font-bold uppercase tracking-widest disabled:opacity-50"
                  >
                    {isSubmitting ? "CONNECTING..." : "SUBSCRIBE"}
                  </Button>
                </div>
                {errorMessage && (
                  <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="border-t border-cyber-cyan/20 bg-cyber-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div>
              <h3 className="font-sci text-sm font-bold text-white mb-4 uppercase tracking-widest">Product</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-cyber-cyan transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-sci text-sm font-bold text-white mb-4 uppercase tracking-widest">Popular</h3>
              <ul className="space-y-2">
                {footerLinks.popular.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-cyber-cyan transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-sci text-sm font-bold text-white mb-4 uppercase tracking-widest">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-cyber-cyan transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-sci text-sm font-bold text-white mb-4 uppercase tracking-widest">Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-cyber-cyan transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-sci text-sm font-bold text-white mb-4 uppercase tracking-widest">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-cyber-cyan transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-cyber-cyan/20 pt-8 text-center">
            <CyberFooter />
          </div>
        </div>
      </footer>
    </>
  )
}
