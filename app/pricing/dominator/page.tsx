'use client'
import Script from 'next/script'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  ArrowRight, 
  Crown,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Star,
  Infinity,
,
,
  Flame,
  Globe,
  Cpu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import FaqSection from '@/components/faq/faq-section'

const features = [
  {
    category: "Unlimited Power",
    items: [
      "8 Elite AI Agents",
      "Unlimited Conversations",
      "Custom AI Training",
      "White-label Options",
      "Dedicated Account Manager"
    ]
  },
  {
    category: "Empire Building",
    items: [
      "Advanced Workflow Automation",
      "Custom Integrations",
      "API Access",
      "Priority Support",
      "24/7 Elite Support"
    ]
  },
  {
    category: "Domination Tools",
    items: [
      "Real-time Analytics",
      "Custom Reports",
      "Team Management",
      "Advanced Security",
      "Unlimited Storage"
    ]
  }
]

const testimonials = [
  {
    name: "Alexandra Chen",
    role: "Tech Empire Builder",
    content: "The Dominator plan gave me unlimited power to scale my empire. The custom AI training is revolutionary.",
    rating: 5
  },
  {
    name: "Marcus Thompson",
    role: "Serial Entrepreneur",
    content: "Finally, a plan that matches my ambition. The white-label options helped me dominate multiple markets.",
    rating: 5
  },
  {
    name: "Isabella Rodriguez",
    role: "Business Mogul",
    content: "The dedicated account manager and unlimited features transformed my business operations completely.",
    rating: 5
  }
]

export default function DominatorPricingPage() {
  return (
    <>
      <Script
        id="stripe-pricing-dominator"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Stripe pricing integration for Dominator plan
            window.stripePricingConfig = {
              plan: 'dominator',
              priceId: 'price_1S46P6PpYfwm37m76hqohIw0',
              features: ${JSON.stringify(features)}
            };
          `,
        }}
      />
      
      <div className="min-h-screen bg-dark-bg relative overflow-hidden text-white selection:bg-neon-purple selection:text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-neon-purple/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-magenta/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_15px_rgba(179,0,255,0.3)] group-hover:shadow-[0_0_25px_rgba(179,0,255,0.5)] transition-all duration-300">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="font-orbitron text-xl font-bold tracking-widest text-white uppercase">SoloSuccess AI</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link href="/pricing">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    All Plans
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="purple" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="pt-32 pb-20 relative z-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/30 backdrop-blur-sm">
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-neon-magenta fill-neon-magenta" />
                    ))}
                </div>
                <span className="text-neon-purple font-mono text-xs uppercase tracking-widest">
                  Elite Empire Tier
                </span>
              </div>
              
              <h1 className="font-orbitron text-6xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-wider uppercase">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-magenta to-neon-purple animate-gradient-x">
                  Dominator
                </span> Plan
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
                Unlimited power for empire builders. 8 elite AI agents, unlimited conversations, 
                and white-label options for complete industry domination.
              </p>
              
              <div className="flex flex-col items-center justify-center gap-2 mb-12">
                <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold text-white">$29</span>
                    <span className="text-xl text-gray-400">/month</span>
                </div>
                <div className="text-sm text-neon-purple/80 font-mono">
                  Billed annually ($290/year)
                </div>
              </div>
              
              <Link href="/register?plan=dominator">
                <Button size="lg" variant="purple" className="group text-lg px-8 py-6 h-auto">
                  <Crown className="w-5 h-5 mr-3" />
                  Start Dominating Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 relative z-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Unlimited <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">Power</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Everything you need to build and dominate your empire without limits.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {features.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="h-full p-8 rounded-sm bg-dark-card backdrop-blur-sm border-2 border-gray-700 hover:border-neon-purple/50 transition-colors duration-300">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-magenta/20 border border-neon-purple/30 flex items-center justify-center">
                      {index === 0 && <Infinity className="w-8 h-8 text-neon-purple" />}
                      {index === 1 && <Globe className="w-8 h-8 text-neon-magenta" />}
                      {index === 2 && <Cpu className="w-8 h-8 text-neon-cyan" />}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">
                      {category.category}
                    </h3>
                    
                    <ul className="space-y-4">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-neon-purple flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="py-20 bg-dark-card/50 relative z-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">Advantages</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Why Top 1% founders choose the Dominator plan.
              </p>
            </motion.div>

            <div className="max-w-5xl mx-auto bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-sm bg-neon-purple/10 flex items-center justify-center flex-shrink-0">
                                <Crown className="w-6 h-6 text-neon-purple" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Unlimited AI Agents</h3>
                                <p className="text-gray-400">Access to all 8 specialized AI agents with unlimited conversations and context retention.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-lg bg-neon-magenta/10 flex items-center justify-center flex-shrink-0">
                                <Shield className="w-6 h-6 text-neon-magenta" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">White-label Options</h3>
                                <p className="text-gray-400">Remove SoloSuccess branding and use your own logo and colors for client-facing reports.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                                <Users className="w-6 h-6 text-neon-cyan" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Dedicated Support</h3>
                                <p className="text-gray-400">Direct access to a personal account manager and priority 24/7 technical support.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-sm bg-neon-purple/10 flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-neon-purple" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Custom AI Training</h3>
                                <p className="text-gray-400">Feed the AI your specific business data, documents, and brand voice guidelines.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-lg bg-neon-magenta/10 flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-6 h-6 text-neon-magenta" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics</h3>
                                <p className="text-gray-400">Deep insights into team performance, task completion rates, and market trends.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                                <Flame className="w-6 h-6 text-neon-cyan" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">First Access</h3>
                                <p className="text-gray-400">Be the first to test beta features and new agent capabilities before they launch.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-20 relative z-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Empire <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">Builders</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Hear from successful entrepreneurs scaling with SoloSuccess.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="h-full p-8 rounded-sm bg-dark-card border-2 border-gray-700 hover:bg-dark-hover transition-colors">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-neon-purple fill-neon-purple" />
                      ))}
                    </div>
                    
                    <p className="text-gray-300 mb-6 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-white">{testimonial.name}</div>
                        <div className="text-sm text-neon-cyan">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-3xl p-12 relative overflow-hidden text-center border border-neon-purple/30 bg-black/60 backdrop-blur-xl">
               <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 to-neon-magenta/10 z-0" />
               <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-8 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center p-4 shadow-[0_0_20px_rgba(179,0,255,0.3)]">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Ready to Dominate Your Market?
                  </h2>
                  
                  <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                    Join the elite entrepreneurs who've built empires with unlimited AI power. 
                    Your competition won't know what hit them.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/register?plan=dominator">
                        <Button size="lg" variant="purple" className="text-lg px-8 h-14">
                        Start Dominating Now
                        <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/pricing">
                        <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                            Compare All Plans
                        </Button>
                    </Link>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-20 relative z-10 bg-black/20">
          <div className="container mx-auto px-4">
            <FaqSection />
          </div>
        </div>
      </div>
    </>
  )
}