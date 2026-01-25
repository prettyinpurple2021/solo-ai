'use client'
import Script from 'next/script'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  ArrowRight, 
,
  Crown,
,
  Target,
  Shield,
  Users,
  TrendingUp,
  Star,
,
,
,
,
  Rocket,
,
  Gift,
  Heart,
  Play
} from 'lucide-react'
import { 
  TacticalButton, 
  GlassCard, 
  RankStars, 
  CamoBackground, 
,
,
  TacticalGrid,
  TacticalGridItem
} from '@/components/military'
import FaqSection from '@/components/faq/faq-section'
const features = [
  {
    category: "AI Co-founder",
    items: [
      "2 Elite AI Agents",
      "5 Daily Conversations",
      "Basic Templates",
      "Email Support",
      "Community Access"
    ]
  },
  {
    category: "Getting Started",
    items: [
      "Basic Automation",
      "Template Library",
      "Learning Resources",
      "Progress Tracking",
      "Basic Analytics"
    ]
  },
  {
    category: "Community",
    items: [
      "Founder Community",
      "Weekly Workshops",
      "Peer Networking",
      "Success Stories",
      "Expert Tips"
    ]
  }
]

const testimonials = [
  {
    name: "Jessica Park",
    role: "Solo Founder",
    content: "The Launch plan gave me the perfect start. The AI agents helped me validate my idea and create my first business plan.",
    rating: 5
  },
  {
    name: "David Kim",
    role: "Solopreneur",
    content: "Free access to AI business tools? This is a game-changer for solo entrepreneurs just starting out.",
    rating: 5
  },
  {
    name: "Maria Santos",
    role: "Content Creator",
    content: "The community and learning resources in the Launch plan helped me understand business fundamentals.",
    rating: 5
  }
]

export default function LaunchPricingPage() {
  return (
    <>
      <Script
        id="stripe-pricing-launch"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Stripe pricing integration for Launch plan
            window.stripePricingConfig = {
              plan: 'launch',
              priceId: 'price_1S46IjPpYfwm37m7EKFi7H4C',
              features: ${JSON.stringify(features)}
            };
          `,
        }}
      />
      
      <div className="min-h-screen bg-military-midnight relative overflow-hidden">
        <CamoBackground opacity={0.1} withGrid>
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 glass-panel-strong border-b border-neon-purple/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-20">
                <Link href="/" className="flex items-center gap-3">
                  <motion.div 
                    className="w-12 h-12 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_20px_rgba(179,0,255,0.3)]"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Crown className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className="font-heading text-xl font-bold text-white">SoloSuccess AI</span>
                </Link>
                
                <div className="flex items-center gap-4">
                  <Link href="/pricing">
                    <TacticalButton variant="outline" size="sm">
                      All Plans
                    </TacticalButton>
                  </Link>
                  <Link href="/signup">
                    <TacticalButton size="sm">
                      Get Started
                    </TacticalButton>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="pt-32 pb-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <div className="flex items-center justify-center gap-2 mb-6">
                  <RankStars count={5} size="lg" />
                  <span className="text-neon-purple font-tactical text-sm uppercase tracking-wider">
                    Elite Starter Tier
                  </span>
                </div>
                
                <h1 className="font-heading text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">
                    Launch
                  </span> Plan
            </h1>
                
                <p className="text-2xl text-military-storm-grey max-w-3xl mx-auto mb-8 leading-relaxed">
                  Start your entrepreneurial journey with 2 elite AI agents, basic automation, 
                  and community access. Perfect for solo founders getting started.
                </p>
                
                <div className="flex items-center justify-center gap-4 mb-12">
                  <div className="text-6xl font-bold text-neon-purple">Free</div>
                  <div className="text-military-storm-grey">
                    <div className="text-2xl">forever</div>
                    <div className="text-sm">no credit card required</div>
                  </div>
                </div>
                
                <TacticalButton size="lg" className="group">
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch Your Mission
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </TacticalButton>
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
                <h2 className="font-heading text-5xl font-bold text-white mb-6">
                  Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">Starting Point</span>
                </h2>
                <p className="text-xl text-military-storm-grey max-w-2xl mx-auto">
                  Everything you need to begin your entrepreneurial journey
                </p>
              </motion.div>

              <TacticalGrid className="max-w-6xl mx-auto">
                {features.map((category, index) => (
                  <TacticalGridItem key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <GlassCard className="h-full p-8">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center">
                          {index === 0 && <Users className="w-8 h-8 text-white" />}
                          {index === 1 && <Play className="w-8 h-8 text-white" />}
                          {index === 2 && <Heart className="w-8 h-8 text-white" />}
                        </div>
                        
                        <h3 className="font-heading text-2xl font-bold text-white mb-6 text-center">
                          {category.category}
                        </h3>
                        
                        <div className="space-y-4">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                              <span className="text-military-storm-grey">{item}</span>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </motion.div>
                  </TacticalGridItem>
                ))}
              </TacticalGrid>
            </div>
          </div>

          {/* Why Free Section */}
          <div className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="font-heading text-5xl font-bold text-white mb-6">
                  Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">Free?</span>
                </h2>
                <p className="text-xl text-military-storm-grey max-w-2xl mx-auto">
                  We believe every entrepreneur deserves access to AI-powered business tools
                </p>
              </motion.div>

              <div className="max-w-4xl mx-auto">
                <GlassCard className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-heading text-xl font-bold text-white">No Barriers</h3>
                          <p className="text-military-storm-grey">Start your entrepreneurial journey without financial barriers</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-heading text-xl font-bold text-white">Community First</h3>
                          <p className="text-military-storm-grey">Build a supportive community of fellow entrepreneurs</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-heading text-xl font-bold text-white">Prove Value</h3>
                          <p className="text-military-storm-grey">Experience the power of AI before upgrading</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-heading text-xl font-bold text-white">Risk-Free</h3>
                          <p className="text-military-storm-grey">No credit card required, no hidden fees</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-heading text-xl font-bold text-white">Growth Path</h3>
                          <p className="text-military-storm-grey">Clear upgrade path as your business grows</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-heading text-xl font-bold text-white">Quality First</h3>
                          <p className="text-military-storm-grey">Same high-quality AI agents as paid plans</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
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
                <h2 className="font-heading text-5xl font-bold text-white mb-6">
                  Success <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-magenta">Stories</span>
                </h2>
                <p className="text-xl text-military-storm-grey max-w-2xl mx-auto">
                  Hear from entrepreneurs who started with the Launch plan
                </p>
              </motion.div>

              <TacticalGrid className="max-w-6xl mx-auto">
                {testimonials.map((testimonial, index) => (
                  <TacticalGridItem key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <GlassCard className="h-full p-8">
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        
                        <p className="text-military-storm-grey mb-6 leading-relaxed">
                          "{testimonial.content}"
                        </p>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {testimonial.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium">{testimonial.name}</div>
                            <div className="text-military-storm-grey text-sm">{testimonial.role}</div>
                          </div>
                </div>
                      </GlassCard>
                    </motion.div>
                  </TacticalGridItem>
                ))}
              </TacticalGrid>
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
                <GlassCard className="max-w-4xl mx-auto p-12">
                  <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  
                  <h2 className="font-heading text-4xl font-bold text-white mb-6">
                    Ready to Launch Your Mission?
              </h2>
                  
                  <p className="text-xl text-military-storm-grey mb-8 max-w-2xl mx-auto">
                    Join thousands of entrepreneurs who've started their journey with our free AI co-founder. 
                    Your entrepreneurial adventure begins now.
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <TacticalButton size="lg" className="group">
                      <Rocket className="w-5 h-5 mr-2" />
                      Launch Your Mission
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </TacticalButton>
                    
                    <Link href="/pricing">
                      <TacticalButton variant="outline" size="lg">
                        Compare All Plans
                      </TacticalButton>
              </Link>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="py-20">
            <div className="container mx-auto px-4">
              <FaqSection />
          </div>
        </div>
        </CamoBackground>
      </div>
    </>
  )
}