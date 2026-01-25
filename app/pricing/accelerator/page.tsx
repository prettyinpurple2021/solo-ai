'use client'
import Script from 'next/script'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  ArrowRight, 
,
  Crown,
  Zap,
,
,
  Users,
  TrendingUp,
  Star,
,
,
,
,
  Rocket,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent,} from '@/components/ui/card'
import FaqSection from '@/components/faq/faq-section'
const features = [
  {
    category: "AI Agents",
    items: [
      "5 Elite AI Agents",
      "Workflow Automation AI",
      "Founder AI Tools",
      "Marketing AI Assistant",
      "Sales AI Co-pilot"
    ]
  },
  {
    category: "Automation",
    items: [
      "Advanced Workflow Automation",
      "Custom AI Training",
      "API Integrations",
      "Team Collaboration Tools",
      "Priority Support"
    ]
  },
  {
    category: "Analytics",
    items: [
      "Advanced Analytics Dashboard",
      "Performance Tracking",
      "ROI Analysis",
      "Custom Reports",
      "Real-time Insights"
    ]
  }
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "E-commerce Founder",
    content: "The Accelerator plan transformed my business operations. The AI agents handle complex workflows I never had time for.",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "SaaS Founder",
    content: "Finally, AI that actually understands my business. The automation features saved me 20+ hours per week.",
    rating: 5
  },
  {
    name: "Emily Watson",
    role: "Consultant",
    content: "The team collaboration features are game-changing. My virtual team is more productive than ever.",
    rating: 5
  }
]

export default function AcceleratorPricingPage() {
  return (
    <>
      <Script
        id="stripe-pricing-accelerator"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Stripe pricing integration for Accelerator plan
            window.stripePricingConfig = {
              plan: 'accelerator',
              priceId: 'price_1S46LyPpYfwm37m7M5nOAYW7',
              features: ${JSON.stringify(features)}
            };
          `,
        }}
      />
      
      <div className="min-h-screen bg-dark-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#b300ff22,transparent_35%),radial-gradient(circle_at_bottom,#ff006e22,transparent_35%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
        <div className="relative z-10">
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-xl border-b border-neon-purple/30">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center justify-between h-16">
                <Link href="/" className="flex items-center gap-3">
                  <motion.div 
                    className="w-10 h-10 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_20px_rgba(179,0,255,0.3)]"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Crown className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="font-orbitron text-lg font-bold text-white uppercase tracking-wider">SoloSuccess AI</span>
                </Link>
                
                <div className="flex items-center gap-3">
                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="border-neon-cyan/40 text-gray-300 hover:text-neon-cyan font-mono">
                      All Plans
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" variant="purple" className="shadow-[0_0_15px_rgba(179,0,255,0.3)] font-orbitron uppercase tracking-wider">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="pt-28 pb-16">
            <div className="max-w-6xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1 border border-neon-purple/30 bg-neon-purple/10 rounded-sm mb-6">
                  <Star className="w-4 h-4 text-neon-purple" />
                  <span className="text-neon-purple font-orbitron text-xs uppercase tracking-wider">
                    Growth Tier
                  </span>
                </div>
                
                <h1 className="font-orbitron text-4xl md:text-6xl font-bold text-white mb-4 uppercase tracking-wider">
                  <span className="text-neon-purple">Accelerator</span> Plan
                </h1>
                
                <p className="text-lg text-gray-400 max-w-3xl mx-auto font-mono">
                  Scale your business with 5 elite AI agents, advanced automation, 
                  and team collaboration tools. Perfect for growing entrepreneurs.
                </p>
                
                <div className="flex items-center justify-center gap-4 my-8">
                  <div className="text-5xl md:text-6xl font-bold text-neon-purple font-orbitron">$19</div>
                  <div className="text-gray-400 font-mono">
                    <div className="text-xl">/month</div>
                    <div className="text-sm">or $190/year</div>
                  </div>
                </div>
                
                <Button size="lg" variant="purple" className="font-orbitron uppercase tracking-wider shadow-[0_0_20px_rgba(179,0,255,0.3)]">
                  <Zap className="w-5 h-5 mr-2" />
                  Start Accelerating Now
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="font-orbitron text-5xl font-bold text-white mb-6 uppercase tracking-wider">
                  Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">Features</span>
                </h2>
                <p className="text-xl text-gray-400 font-mono max-w-2xl mx-auto">
                  Everything you need to scale your business with cyberpunk precision
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {features.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full bg-dark-card border-neon-purple/30 shadow-[0_0_20px_rgba(179,0,255,0.1)]">
                      <CardContent className="p-8">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_20px_rgba(179,0,255,0.3)]">
                          {index === 0 && <Users className="w-8 h-8 text-white" />}
                          {index === 1 && <Zap className="w-8 h-8 text-white" />}
                          {index === 2 && <TrendingUp className="w-8 h-8 text-white" />}
                        </div>
                        
                        <h3 className="font-orbitron text-2xl font-bold text-white mb-6 text-center uppercase tracking-wider">
                          {category.category}
                        </h3>
                        
                        <div className="space-y-4">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-neon-lime flex-shrink-0" />
                              <span className="text-gray-400 font-mono">{item}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="font-orbitron text-5xl font-bold text-white mb-6 uppercase tracking-wider">
                  Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">Testimonials</span>
                </h2>
                <p className="text-xl text-gray-400 font-mono max-w-2xl mx-auto">
                  Hear from successful entrepreneurs who've accelerated their growth
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full bg-dark-card border-neon-purple/30 shadow-[0_0_20px_rgba(179,0,255,0.1)]">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-neon-orange fill-current" />
                          ))}
                        </div>
                        
                        <p className="text-gray-400 font-mono mb-6 leading-relaxed">
                          "{testimonial.content}"
                        </p>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_15px_rgba(179,0,255,0.3)]">
                            <span className="text-white font-bold text-sm font-orbitron">
                              {testimonial.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium font-orbitron">{testimonial.name}</div>
                            <div className="text-gray-400 font-mono text-sm">{testimonial.role}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
                </div>
          </div>

          {/* CTA Section */}
          <div className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <Card className="max-w-4xl mx-auto bg-dark-card border-neon-purple/30 shadow-[0_0_30px_rgba(179,0,255,0.2)]">
                  <CardContent className="p-12">
                    <div className="w-20 h-20 mx-auto mb-8 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_25px_rgba(179,0,255,0.4)]">
                      <Rocket className="w-10 h-10 text-white" />
                    </div>
                    
                    <h2 className="font-orbitron text-4xl font-bold text-white mb-6 text-center uppercase tracking-wider">
                      Ready to Accelerate Your Business?
                    </h2>
                    
                    <p className="text-xl text-gray-400 font-mono mb-8 max-w-2xl mx-auto text-center">
                      Join thousands of successful entrepreneurs who've scaled their businesses 
                      with our elite AI agents and automation tools.
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                      <Button size="lg" variant="purple" className="font-orbitron uppercase tracking-wider shadow-[0_0_20px_rgba(179,0,255,0.3)] group">
                        <Zap className="w-5 h-5 mr-2" />
                        Start Accelerating Now
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      
                      <Link href="/pricing">
                        <Button variant="outline" size="lg" className="border-neon-cyan/40 text-gray-300 hover:text-neon-cyan font-mono">
                          Compare All Plans
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="py-20">
            <div className="container mx-auto px-4">
              <FaqSection />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}