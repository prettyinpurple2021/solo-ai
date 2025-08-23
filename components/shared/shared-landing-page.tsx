"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { BossButton, EmpowermentButton, ZapButton } from "@/components/ui/boss-button"
import { BossCard, EmpowermentCard, PremiumCard } from "@/components/ui/boss-card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Users,
  TrendingUp,
  Shield,
  Star,
  CheckCircle,
  X,
  Menu,
  Play,
  Crown,
  Flame,
  Rocket,
  Award,
  Heart,
  Gem
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ScheduleDemoModal } from "@/components/schedule/schedule-demo-modal"

interface SharedLandingPageProps {
  showAuthModal?: boolean
  onShowAuthModal?: () => void
  styleVariant?: string
}

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Productivity",
    description: "Leverage cutting-edge AI to automate tasks, generate insights, and boost your efficiency by 300%.",
    gradient: "gradient-primary"
  },
  {
    icon: Target,
    title: "Goal Achievement System",
    description: "Set, track, and crush your goals with our intelligent goal-setting framework and progress analytics.",
    gradient: "gradient-secondary"
  },
  {
    icon: Zap,
    title: "Instant Automation",
    description: "Automate repetitive tasks and workflows with our no-code automation engine.",
    gradient: "gradient-accent"
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Get detailed insights into your productivity patterns and optimize your workflow.",
    gradient: "gradient-empowerment"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Seamlessly collaborate with your team using our advanced collaboration tools.",
    gradient: "gradient-success"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with end-to-end encryption and compliance certifications.",
    gradient: "gradient-warning"
  },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO, TechStart",
    content: "SoloBoss AI transformed how I manage my business. I've increased productivity by 250% in just 3 months.",
    rating: 5,
    avatar: "/default-user.svg",
    crown: true
  },
  {
    name: "Marcus Rodriguez",
    role: "Freelance Designer",
    content:
      "The AI agents are like having a full team. I can focus on creative work while they handle everything else.",
    rating: 5,
    avatar: "/default-user.svg",
    crown: false
  },
  {
    name: "Emily Watson",
    role: "Marketing Director",
    content: "Game-changer for our agency. Client satisfaction up 40%, team stress down 60%. Incredible ROI.",
    rating: 5,
    avatar: "/default-user.svg",
    crown: true
  },
]

const pricingPlans = [
  {
    name: "Launch",
    price: "$0",
    period: "/month",
    description: "Perfect for ambitious beginners ready to start their empire",
    features: ["Access to 2 AI agents (Nova & Echo)", "5 AI conversations per day", "Basic task automation", "Email support", "Community access", "Mobile app access"],
    popular: false,
    gradient: "gradient-primary",
    crown: false
  },
  {
    name: "Empire",
    price: "$29",
    period: "/month",
    description: "For serious entrepreneurs building their business empire",
    features: ["All Launch features", "Access to all 8 AI agents", "Unlimited AI conversations", "Advanced automation", "Priority support", "Custom integrations", "Analytics dashboard", "Team collaboration"],
    popular: true,
    gradient: "gradient-empowerment",
    crown: true
  },
  {
    name: "Legacy",
    price: "$99",
    period: "/month",
    description: "For established businesses ready to scale to the next level",
    features: ["All Empire features", "White-label solutions", "API access", "Dedicated account manager", "Custom AI training", "Advanced analytics", "Multi-team management", "Enterprise security"],
    popular: false,
    gradient: "gradient-boss",
    crown: true
  },
]

export function SharedLandingPage({ showAuthModal, onShowAuthModal, styleVariant }: SharedLandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const router = useRouter()

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
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
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 gradient-empowerment rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient font-boss">SoloBoss AI</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-700 dark:text-gray-300 hover:text-gradient transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-gradient transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-gradient transition-colors">
              Testimonials
            </Link>
            <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-gradient transition-colors">
              Contact
            </Link>
            <ThemeToggle />
            <BossButton 
              onClick={() => router.push('/signin')}
              variant="primary"
              size="sm"
            >
              Sign In
            </BossButton>
            <EmpowermentButton 
              onClick={() => router.push('/signup')}
              size="sm"
            >
              Get Started
            </EmpowermentButton>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <BossButton
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="primary"
              size="sm"
            >
              <Menu className="w-4 h-4" />
            </BossButton>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 glass rounded-xl p-4"
            >
              <div className="space-y-4">
                <Link href="#features" className="block text-gray-700 dark:text-gray-300 hover:text-gradient">
                  Features
                </Link>
                <Link href="#pricing" className="block text-gray-700 dark:text-gray-300 hover:text-gradient">
                  Pricing
                </Link>
                <Link href="#testimonials" className="block text-gray-700 dark:text-gray-300 hover:text-gradient">
                  Testimonials
                </Link>
                <Link href="/contact" className="block text-gray-700 dark:text-gray-300 hover:text-gradient">
                  Contact
                </Link>
                <div className="flex space-x-2">
                  <BossButton 
                    onClick={() => router.push('/signin')}
                    variant="primary"
                    size="sm"
                    fullWidth
                  >
                    Sign In
                  </BossButton>
                  <EmpowermentButton 
                    onClick={() => router.push('/signup')}
                    size="sm"
                    fullWidth
                  >
                    Get Started
                  </EmpowermentButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="relative px-6 py-20 text-center"
      >
        <div className="max-w-4xl mx-auto">
          {/* Animated background elements */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 left-20 w-32 h-32 gradient-primary rounded-full opacity-20 blur-xl"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-40 right-20 w-40 h-40 gradient-secondary rounded-full opacity-20 blur-xl"
          />
          
          <div className="relative z-10">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-flex items-center space-x-2 mb-6"
            >
              <Crown className="w-8 h-8 text-yellow-500" />
              <span className="crown-badge">Bad Ass Girl Boss Platform</span>
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">Build Your Empire</span>
              <br />
              <span className="text-gray-800 dark:text-gray-200">With AI Power</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              The ultimate AI-powered platform for ambitious entrepreneurs. 
              Automate tasks, crush goals, and scale your business like a true boss.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
              <EmpowermentButton 
                onClick={() => router.push('/signup')}
                size="lg"
                crown
                icon={<Rocket className="w-5 h-5" />}
              >
                Start Your Empire
              </EmpowermentButton>
              
              <BossButton
                onClick={() => setIsDemoModalOpen(true)}
                variant="accent"
                size="lg"
                icon={<Play className="w-5 h-5" />}
              >
                Watch Demo
              </BossButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-gradient mb-2">10,000+</div>
                <div className="text-gray-600 dark:text-gray-400">Active Users</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-gradient mb-2">300%</div>
                <div className="text-gray-600 dark:text-gray-400">Productivity Boost</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-gradient mb-2">24/7</div>
                <div className="text-gray-600 dark:text-gray-400">AI Support</div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-6 py-20"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
              Everything You Need to Rule
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Powerful features designed for ambitious entrepreneurs who want to build their empire
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group"
              >
                <EmpowermentCard className="h-full">
                  <div className={`w-16 h-16 ${feature.gradient} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gradient">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </EmpowermentCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section 
        id="testimonials"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-6 py-20"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
              What Our Bosses Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join thousands of entrepreneurs who've transformed their businesses
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <BossCard variant={testimonial.crown ? "premium" : "default"} className="h-full">
                  {testimonial.crown && (
                    <div className="flex justify-center mb-4">
                      <motion.div
                        animate={{
                          rotate: [0, 5, -5, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Crown className="w-8 h-8 text-yellow-500" />
                      </motion.div>
                    </div>
                  )}
                  
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </BossCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section 
        id="pricing"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-6 py-20"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
              Choose Your Empire Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="relative"
              >
                {plan.popular && (
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                  >
                    <div className="crown-badge">
                      Most Popular
                    </div>
                  </motion.div>
                )}
                
                <PremiumCard className="h-full">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-gradient mb-2">
                      {plan.price}
                      <span className="text-lg text-gray-600 dark:text-gray-400">{plan.period}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <EmpowermentButton 
                    onClick={() => router.push('/signup')}
                    fullWidth
                    crown={plan.crown}
                  >
                    Get Started
                  </EmpowermentButton>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-6 py-20"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
              Ready to Build Your Empire?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of entrepreneurs who've already transformed their businesses with SoloBoss AI
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <EmpowermentButton 
                onClick={() => router.push('/signup')}
                size="lg"
                crown
                icon={<Rocket className="w-5 h-5" />}
              >
                Start Free Trial
              </EmpowermentButton>
              
              <BossButton
                onClick={() => setIsDemoModalOpen(true)}
                variant="accent"
                size="lg"
                icon={<Play className="w-5 h-5" />}
              >
                Schedule Demo
              </BossButton>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-6 py-12 border-t border-purple-200/20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 gradient-empowerment rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient font-boss">SoloBoss AI</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                The ultimate AI-powered platform for ambitious entrepreneurs.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="#features" className="hover:text-gradient">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-gradient">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-gradient">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/about" className="hover:text-gradient">About</Link></li>
                <li><Link href="/contact" className="hover:text-gradient">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-gradient">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/help" className="hover:text-gradient">Help Center</Link></li>
                <li><Link href="/docs" className="hover:text-gradient">Documentation</Link></li>
                <li><Link href="/status" className="hover:text-gradient">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-purple-200/20 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 SoloBoss AI. All rights reserved. Built for bad ass girl bosses everywhere. 👑</p>
          </div>
        </div>
      </motion.footer>

      {/* Demo Modal */}
      <ScheduleDemoModal 
        open={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </div>
  )
}