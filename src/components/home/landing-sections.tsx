"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, Target, Zap, TrendingUp, Users, Shield, 
  CheckCircle, Plus, Minus, ArrowRight 
} from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

// --- Shared Types ---
interface SectionProps {
  className?: string
}

// --- Features Section ---
const features = [
  {
    icon: Sparkles,
    title: "8 Specialized AI Agents",
    description: "Meet Roxy, Blaze, Echo, Lumi, Vex, Lexi, Nova, and Glitch - your personal AI team that never sleeps.",
  },
  {
    icon: Target,
    title: "Intelligent Goal & Task Management",
    description: "Set, track, and crush your goals with AI-powered prioritization and progress analytics.",
  },
  {
    icon: Zap,
    title: "Competitive Intelligence",
    description: "Monitor competitors, track market changes, and get automated alerts with our AI system.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description: "Get detailed insights into your productivity patterns and business performance with live analytics.",
  },
  {
    icon: Users,
    title: "AI-Powered Briefcase",
    description: "Upload, organize, and analyze documents with AI-powered content parsing and file management.",
  },
  {
    icon: Shield,
    title: "Guardian AI Compliance",
    description: "Automated GDPR/CCPA compliance scanning, policy generation, and trust score certification.",
  },
]

export const FeaturesSection = ({ className }: SectionProps) => {
  return (
    <section id="features" className={`py-24 relative z-10 ${className}`}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-3 py-1 border border-neon-cyan/30 bg-neon-cyan/5">
            <span className="font-mono text-[10px] text-neon-cyan tracking-[0.2em] uppercase">
              System Capabilities
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-sci text-white">
            INTELLIGENCE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">MODULES</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative p-6 bg-dark-bg/80 border border-white/10 hover:border-neon-cyan/50 transition-all duration-300"
            >
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-neon-cyan transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-neon-cyan transition-colors" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-neon-cyan transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-neon-cyan transition-colors" />

              <div className="mb-4 inline-flex p-3 rounded-lg bg-white/5 group-hover:bg-neon-cyan/10 transition-colors">
                <feature.icon className="w-6 h-6 text-neon-purple group-hover:text-neon-cyan transition-colors" />
              </div>
              <h3 className="text-xl font-bold font-sci text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- AI Agents Section ---
const agents = [
  { name: "Roxy", role: "Creative Strategist", color: "text-neon-purple" },
  { name: "Blaze", role: "Performance Coach", color: "text-neon-orange" },
  { name: "Echo", role: "Communication Expert", color: "text-neon-cyan" },
  { name: "Glitch", role: "QA & Debug Agent", color: "text-red-500" },
  { name: "Lumi", role: "Legal & Docs Agent", color: "text-blue-400" },
  { name: "Vex", role: "Tech & Automation", color: "text-green-400" },
  { name: "Lexi", role: "Data & Analytics", color: "text-yellow-400" },
  { name: "Nova", role: "Innovation & Growth", color: "text-pink-500" }
]

export const AgentsSection = ({ className }: SectionProps) => {
  return (
    <section id="agents" className={`py-24 bg-white/5 relative z-10 ${className}`}>
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-3 py-1 border border-neon-purple/30 bg-neon-purple/5">
            <span className="font-mono text-[10px] text-neon-purple tracking-[0.2em] uppercase">
              Neural Network
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold font-sci text-white">
            MEET THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">SQUAD</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            8 specialized AI agents working in perfect sync to accelerate your business growth.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {agents.map((agent, index) => (
            <div 
              key={index}
              className="relative group p-6 bg-black border border-white/10 hover:border-neon-purple/50 transition-all duration-300 text-center overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-neon-purple/50 group-hover:scale-110 transition-all">
                  <span className={`text-2xl font-bold font-sci ${agent.color}`}>
                    {agent.name[0]}
                  </span>
               </div>
               
               <h3 className="text-lg font-bold font-sci text-white relative z-10">{agent.name}</h3>
               <p className="text-xs text-gray-400 uppercase tracking-wider relative z-10">{agent.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Pricing Section ---
const pricingPlans = [
  {
    name: "Launch",
    price: "$0",
    period: "/month",
    description: "For ambitious beginners",
    features: ["2 AI Agents", "Basic Automation", "Community Access"],
    highlight: false,
    cta: "Start Free"
  },
  {
    name: "Accelerator",
    price: "$19",
    period: "/month",
    description: "For growing founders",
    features: ["5 AI Agents", "Advanced Workflows", "Priority Support", "Analytics Dashboard"],
    highlight: true,
    cta: "Get Started"
  },
  {
    name: "Dominator",
    price: "$29",
    period: "/month",
    description: "For empire builders",
    features: ["All 8 Agents", "Unlimited Automations", "24/7 Priority Support", "Custom API Access"],
    highlight: false,
    cta: "Contact Sales"
  },
]

export const PricingSection = ({ className }: SectionProps) => {
  return (
    <section id="pricing" className={`py-24 relative z-10 ${className}`}>
       <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-sci text-white mb-4">
            CHOOSE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-cyan">POWER LEVEL</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index}
              className={`relative p-8 border ${plan.highlight ? 'border-neon-cyan bg-neon-cyan/5 scale-105 z-10 shadow-[0_0_30px_rgba(0,240,255,0.1)]' : 'border-white/10 bg-black/50'} backdrop-blur-sm transition-all duration-300 hover:border-neon-cyan/50`}
            >
              <h3 className="text-xl font-bold font-sci text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400 ml-2 text-sm">{plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm mb-8 pb-8 border-b border-white/10">{plan.description}</p>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-neon-cyan mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href={plan.cta === "Contact Sales" ? "/contact" : "/signup"} className="block">
                <Button 
                  className={`w-full font-sci uppercase tracking-widest ${
                    plan.highlight 
                      ? 'bg-neon-cyan text-black hover:bg-neon-cyan/80' 
                      : 'bg-transparent border border-white/20 text-white hover:border-white'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- FAQ Section ---
const faqs = [
  { q: "What is SoloSuccess AI?", a: "An AI Co-founder and AI Business Co-pilot designed to automate workflows and accelerate growth for solopreneurs." },
  { q: "Who is it for?", a: "Solo Founders, Freelancers, Creators, and Small Business Owners who need to scale without hiring a human team." },
  { q: "Can I cancel anytime?", a: "Yes. You can upgrade, downgrade, or cancel your subscription at any time without penalties." },
]

export const FAQSection = ({ className }: SectionProps) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  return (
    <section id="faq" className={`py-24 bg-white/5 relative z-10 ${className}`}>
      <div className="max-w-[800px] mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold font-sci text-white mb-12 text-center">Protocol Queries</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-white/10 bg-black/50 overflow-hidden"
            >
              <button
                className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-sci text-white">{faq.q}</span>
                {openIndex === index ? <Minus className="text-neon-cyan" /> : <Plus className="text-gray-500" />}
              </button>
              {openIndex === index && (
                <div className="p-6 pt-0 text-gray-400 text-sm border-t border-white/5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- Footer ---
export const CyberFooter = () => {
  return (
    <footer className="border-t border-white/10 bg-black py-12 relative z-10">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-neon-cyan/20 rounded-sm border border-neon-cyan flex items-center justify-center">
                <span className="font-bold text-neon-cyan">S</span>
              </div>
              <span className="font-sci font-bold text-white">SOLOSUCCESS.AI</span>
            </div>
            <p className="text-xs text-gray-500">Autonomous Business Infrastructure for the next generation of founders.</p>
          </div>
          
          <div>
            <h4 className="font-sci font-bold text-white mb-4">PLATFORM</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link href="#features" className="hover:text-neon-cyan">Features</Link></li>
              <li><Link href="#agents" className="hover:text-neon-cyan">AI Squad</Link></li>
              <li><Link href="#pricing" className="hover:text-neon-cyan">Pricing</Link></li>
              <li><Link href="/contact" className="hover:text-neon-cyan">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sci font-bold text-white mb-4">LEGAL</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link href="/terms" className="hover:text-neon-cyan">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-neon-cyan">Privacy Policy</Link></li>
              <li><Link href="/security" className="hover:text-neon-cyan">Security</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="font-sci font-bold text-white mb-4">STATUS</h4>
             <div className="flex items-center gap-2 text-xs text-neon-cyan">
               <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
               All Systems Operational
             </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>&copy; 2025 SoloSuccess AI. All rights reserved.</p>
          <p className="font-mono mt-2 md:mt-0">EST. 2025 // SECTOR 7</p>
        </div>
      </div>
    </footer>
  )
}
