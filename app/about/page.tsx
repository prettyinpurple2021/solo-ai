"use client"

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Crown,
  Target,
  Users,
  Zap,
  Trophy,
  Brain,
  ArrowRight,
  Shield
} from "lucide-react"
import {
  TacticalButton,
  GlassCard,
  RankStars,
  CamoBackground,
  StatsBadge,
  TacticalGrid,
  TacticalGridItem
} from '@/components/military'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-military-midnight relative overflow-hidden">
      <CamoBackground opacity={0.1} withGrid>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass-panel-strong border-b border-military-hot-pink/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link href="/" className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-military-hot-pink to-military-blush-pink flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown className="w-6 h-6 text-white" />
                </motion.div>
                <span className="font-heading text-xl font-bold text-white">SoloSuccess AI</span>
              </Link>

              <div className="flex items-center gap-4">
                <Link href="/signin">
                  <TacticalButton variant="outline" size="sm">
                    Sign In
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
        <section className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <RankStars count={5} size="lg" />
                <span className="text-military-hot-pink font-tactical text-sm uppercase tracking-wider">
                  Elite Business Platform
                </span>
              </div>

              <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-military-hot-pink to-military-blush-pink">SoloSuccess AI</span>
              </h1>

              <p className="text-xl text-military-storm-grey mb-8 max-w-3xl mx-auto leading-relaxed">
                The ultimate military-grade platform for solo entrepreneurs who refuse to settle for mediocrity.
                Built for the elite, designed for domination.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <TacticalButton size="lg" className="group">
                  Start Your Mission
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </TacticalButton>
                <TacticalButton variant="outline" size="lg">
                  View Pricing
                </TacticalButton>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <GlassCard className="max-w-4xl mx-auto p-12">
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-military-hot-pink to-military-blush-pink flex items-center justify-center"
                >
                  <Target className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="font-heading text-4xl font-bold text-white mb-6">
                  Our Mission
                </h2>

                <p className="text-lg text-military-storm-grey leading-relaxed mb-8">
                  We believe every solo entrepreneur deserves access to military-grade tools and AI-powered intelligence
                  that can transform their business from struggling startup to market-dominating empire. No more settling
                  for generic solutions or amateur tools.
                </p>

                <div className="grid md:grid-cols-3 gap-8 mt-12">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-military-hot-pink/20 to-military-blush-pink/20 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-military-hot-pink" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-white mb-2">Elite Standards</h3>
                    <p className="text-military-storm-grey">Military-grade security and performance</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-military-hot-pink/20 to-military-blush-pink/20 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-military-hot-pink" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-white mb-2">AI-Powered</h3>
                    <p className="text-military-storm-grey">Cutting-edge artificial intelligence</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-military-hot-pink/20 to-military-blush-pink/20 flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-military-hot-pink" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-white mb-2">Results Focused</h3>
                    <p className="text-military-storm-grey">Proven strategies that deliver</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold text-white mb-4">
                Our Core Values
              </h2>
              <p className="text-xl text-military-storm-grey max-w-2xl mx-auto">
                The principles that drive everything we do
              </p>
            </div>

            <TacticalGrid className="max-w-6xl mx-auto">
              <TacticalGridItem>
                <GlassCard className="h-full p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-military-hot-pink to-military-blush-pink flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white">Excellence</h3>
                  </div>
                  <p className="text-military-storm-grey leading-relaxed">
                    We never settle for &quot;good enough.&quot; Every feature, every interaction, every result
                    must meet the highest standards of excellence.
                  </p>
                </GlassCard>
              </TacticalGridItem>

              <TacticalGridItem>
                <GlassCard className="h-full p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-military-hot-pink to-military-blush-pink flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white">Innovation</h3>
                  </div>
                  <p className="text-military-storm-grey leading-relaxed">
                    We constantly push the boundaries of what&apos;s possible, leveraging cutting-edge
                    technology to give you the ultimate competitive advantage.
                  </p>
                </GlassCard>
              </TacticalGridItem>

              <TacticalGridItem>
                <GlassCard className="h-full p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-military-hot-pink to-military-blush-pink flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white">Community</h3>
                  </div>
                  <p className="text-military-storm-grey leading-relaxed">
                    We&apos;re building a community of elite entrepreneurs who support each other&apos;s
                    success and share the drive for domination.
                  </p>
                </GlassCard>
              </TacticalGridItem>

              <TacticalGridItem>
                <GlassCard className="h-full p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-military-hot-pink to-military-blush-pink flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white">Results</h3>
                  </div>
                  <p className="text-military-storm-grey leading-relaxed">
                    We measure success by the results we deliver for our users. No fluff, no
                    empty promises - just measurable business growth.
                  </p>
                </GlassCard>
              </TacticalGridItem>
            </TacticalGrid>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl font-bold text-white mb-4">
                Elite Performance Metrics
              </h2>
              <p className="text-xl text-military-storm-grey">
                The numbers that prove our dominance
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <StatsBadge value="99.9%" label="Uptime" className="text-4xl font-bold text-military-hot-pink" />
              </div>
              <div className="text-center">
                <StatsBadge value="10K+" label="Active Users" className="text-4xl font-bold text-military-hot-pink" />
              </div>
              <div className="text-center">
                <StatsBadge value="$50M+" label="Revenue Generated" className="text-4xl font-bold text-military-hot-pink" />
              </div>
              <div className="text-center">
                <StatsBadge value="24/7" label="Support" className="text-4xl font-bold text-military-hot-pink" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <GlassCard className="max-w-4xl mx-auto p-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-heading text-4xl font-bold text-white mb-6">
                  Ready to Join the Elite?
                </h2>
                <p className="text-xl text-military-storm-grey mb-8 max-w-2xl mx-auto">
                  Stop settling for amateur tools. Get access to military-grade AI and
                  start dominating your market today.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/signup">
                    <TacticalButton size="lg" className="group">
                      Start Your Mission
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </TacticalButton>
                  </Link>
                  <Link href="/pricing">
                    <TacticalButton variant="outline" size="lg">
                      View Plans
                    </TacticalButton>
                  </Link>
                </div>
              </motion.div>
            </GlassCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-military-hot-pink/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-military-hot-pink to-military-blush-pink flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading text-lg font-bold text-white">SoloSuccess AI</span>
              </div>

              <div className="flex items-center gap-6 text-military-storm-grey">
                <Link href="/privacy" className="hover:text-military-hot-pink transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-military-hot-pink transition-colors">Terms</Link>
                <Link href="/contact" className="hover:text-military-hot-pink transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </CamoBackground>
    </div>
  )
}