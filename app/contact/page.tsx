"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Crown, Mail, MessageCircle, Phone, MapPin, Clock, Send, CheckCircle, Sparkles, Shield } from "lucide-react"
import { BossButton, EmpowermentButton } from "@/components/ui/boss-button"
import { BossCard, EmpowermentCard } from "@/components/ui/boss-card"
import { RecaptchaContactButton } from "@/components/ui/recaptcha-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: "", email: "", subject: "", category: "", message: "" })
    }, 3000)
    
    return { success: true }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  return (
    <div className="min-h-screen gradient-background">
      {/* Navigation */}
      <motion.nav 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="relative z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
            <div className="w-8 h-8 gradient-empowerment rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient font-boss">SoloBoss AI</span>
          </Link>
          <EmpowermentButton 
            onClick={() => window.location.href = '/signup'}
            size="sm"
            crown
          >
            Start Building Empire
          </EmpowermentButton>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-20 px-6 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={itemVariants} className="flex items-center justify-center mb-6">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-20 h-20 gradient-empowerment rounded-2xl flex items-center justify-center shadow-lg"
            >
              <MessageCircle className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center space-x-2 mb-6">
              <Crown className="w-6 h-6 text-yellow-500" />
              <span className="crown-badge">Let's Connect</span>
            </div>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Contact the Boss</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Ready to rule your empire? Have questions? Need support? The boss is here to help! 
            Reach out and let's build something amazing together. 🚀
          </motion.p>
        </div>
      </motion.section>

      {/* Contact Content */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-20 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <motion.div variants={itemVariants}>
              <EmpowermentCard>
                <div className="text-center mb-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="inline-flex items-center space-x-2 mb-4"
                  >
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-gradient">Send a Message</h2>
                  </motion.div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Got a question, suggestion, or just want to say hi? Drop us a line!
                  </p>
                </div>
                
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gradient mb-2">Message Sent! 🎉</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Thanks for reaching out, boss! We'll get back to you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Your Name *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter your boss name"
                          className="glass"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="your.email@empire.com"
                          className="glass"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger className="glass">
                          <SelectValue placeholder="What's this about?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Question</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing & Subscriptions</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="partnership">Partnership Opportunity</SelectItem>
                          <SelectItem value="press">Press & Media</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Subject *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="Brief subject line"
                        className="glass"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                      </label>
                      <Textarea
                        required
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Tell us how we can help you build your empire! Be as detailed as you'd like..."
                        className="glass min-h-[120px]"
                      />
                    </div>

                    <RecaptchaContactButton
                      onSubmit={handleSubmit}
                      fullWidth
                      size="lg"
                      disabled={!formData.name || !formData.email || !formData.subject || !formData.message}
                    >
                      Send Message 🚀
                    </RecaptchaContactButton>
                  </div>
                )}
              </EmpowermentCard>
            </motion.div>

            {/* Contact Information */}
            <motion.div variants={itemVariants} className="space-y-8">
              {/* Direct Contact */}
              <BossCard variant="accent">
                <div className="flex items-center space-x-2 mb-4">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gradient">Direct Contact</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">Email the Boss</p>
                      <a 
                        href="mailto:psychedelic.creator@enchantednightmare.com"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        psychedelic.creator@enchantednightmare.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">Home Office</p>
                      <p className="text-gray-600 dark:text-gray-400">Albany, GA, United States</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">Response Time</p>
                      <p className="text-gray-600 dark:text-gray-400">Usually within 24 hours</p>
                    </div>
                  </div>
                </div>
              </BossCard>

              {/* Support Resources */}
              <BossCard variant="success">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-bold text-gradient">Quick Resources</h3>
                </div>
                <div className="space-y-4">
                  <Link 
                    href="/help" 
                    className="block p-4 glass rounded-lg hover-lift transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">Help Center</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Find answers to common questions</p>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                    </div>
                  </Link>

                  <Link 
                    href="/docs" 
                    className="block p-4 glass rounded-lg hover-lift transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">API Documentation</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Technical docs and guides</p>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                    </div>
                  </Link>

                  <Link 
                    href="/status" 
                    className="block p-4 glass rounded-lg hover-lift transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">System Status</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Check service availability</p>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
                    </div>
                  </Link>
                </div>
              </BossCard>

              {/* Community */}
              <BossCard variant="premium">
                <h3 className="text-xl font-bold mb-3 text-gradient">Join the Boss Community! 👑</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  Connect with other ambitious entrepreneurs building their empires. Share wins, get support, and level up together!
                </p>
                <EmpowermentButton 
                  onClick={() => window.location.href = '/community'}
                  crown
                >
                  Join Community
                </EmpowermentButton>
              </BossCard>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Emergency Support Notice */}
      <motion.section 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="py-12 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <BossCard variant="warning" className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Phone className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">Need Urgent Help?</h3>
            </div>
            <p className="text-yellow-700 max-w-2xl mx-auto">
              For critical issues affecting your business operations, please mark your message as "Technical Support" 
              and we'll prioritize your request. We typically respond to urgent matters within 4-6 hours during business days.
            </p>
          </BossCard>
        </div>
      </motion.section>
    </div>
  )
} 