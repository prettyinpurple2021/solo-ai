'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { CyberButton } from '@/components/cyber/CyberButton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, Send, Shield } from 'lucide-react'
import { useRecaptchaValidation } from '@/hooks/use-recaptcha-validation'
import { RECAPTCHA_ACTIONS } from '@/components/recaptcha/recaptcha-provider'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  
  const { validateWithRecaptcha, isValidating } = useRecaptchaValidation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      // Step 1: Validate with reCAPTCHA
      const recaptchaResult = await validateWithRecaptcha(RECAPTCHA_ACTIONS.CONTACT, 0.4)
      
      if (!recaptchaResult.success) {
        // Show the actual error message if available
        const errorMsg = recaptchaResult.error || 'Security verification failed. Please try again.'
        setError(errorMsg)
        setIsSubmitting(false)
        return
      }

      // Step 2: Submit the form
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <CyberPageLayout>
        <div className="pt-32 pb-20">
          <div className="max-w-2xl mx-auto px-6">
            <HudBorder className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-neon-cyan" />
              </div>
              <h1 className="font-orbitron text-4xl font-bold text-white mb-4">
                MESSAGE SENT
              </h1>
              <p className="text-gray-400 font-tech">
                Your message has been received. Our team will process your request and respond within 24 hours.
              </p>
            </HudBorder>
          </div>
        </div>
      </CyberPageLayout>
    )
  }

  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              GET IN <span className="text-neon-cyan">TOUCH</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-tech">
              Connect with our team. We'll respond within 24 hours.
            </p>
          </div>

          <HudBorder className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-orbitron text-neon-cyan mb-2 uppercase tracking-widest">
                    NAME
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-dark-card/50 border-neon-cyan/30 text-white placeholder:text-gray-500 focus:border-neon-cyan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-orbitron text-neon-cyan mb-2 uppercase tracking-widest">
                    EMAIL
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-dark-card/50 border-neon-cyan/30 text-white placeholder:text-gray-500 focus:border-neon-cyan"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-orbitron text-neon-cyan mb-2 uppercase tracking-widest">
                  CATEGORY
                </label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-dark-card/50 border-neon-cyan/30 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-card border-neon-cyan/30">
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="support">Technical Support</SelectItem>
                    <SelectItem value="sales">Sales Question</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feedback">Feedback & Comments</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-orbitron text-neon-cyan mb-2 uppercase tracking-widest">
                  SUBJECT
                </label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-dark-card/50 border-neon-cyan/30 text-white placeholder:text-gray-500 focus:border-neon-cyan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-orbitron text-neon-cyan mb-2 uppercase tracking-widest">
                  MESSAGE
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-dark-card/50 border-neon-cyan/30 text-white placeholder:text-gray-500 focus:border-neon-cyan min-h-[200px]"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 font-tech text-sm">
                  {error}
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 p-3 border border-neon-cyan/20">
                <Shield className="w-4 h-4 text-neon-cyan" />
                <span>This form is protected by reCAPTCHA Enterprise for security.</span>
              </div>

              <CyberButton
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || isValidating}
                className="w-full"
              >
                {isValidating ? 'VERIFYING...' : isSubmitting ? 'TRANSMITTING...' : 'SEND_MESSAGE'}
                <Send className="ml-2 w-5 h-5" />
              </CyberButton>
            </form>
          </HudBorder>
        </div>
      </div>
    </CyberPageLayout>
  )
}
