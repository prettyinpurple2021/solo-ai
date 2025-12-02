import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, Shield, Target, Cpu, BarChart3, Users, Brain, Rocket, MessageSquare, Briefcase, TrendingUp, Network } from 'lucide-react';
import { MarketingLayout } from './marketing/layout/MarketingLayout';

export function LandingPage() {
    const router = useRouter();
    const featuresRef = useRef<HTMLDivElement>(null);

    const scrollToFeatures = () => {
        featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <MarketingLayout>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
                <div className="text-center max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-400 mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Now in Beta - Join the First Cohort
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                        Your AI-Powered <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
                            Operating System for Business
                        </span>
                    </h1>

                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Replace 10+ tools with one platform. Get 5 specialized AI agents, 30+ business tools,
                        and compete like you have a full team—while staying solo.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <button
                            onClick={() => router.push('/signup')}
                            className="group relative px-8 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25 w-full sm:w-auto"
                        >
                            Start Free Trial
                            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={scrollToFeatures}
                            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all w-full sm:w-auto backdrop-blur-sm"
                        >
                            Explore Features
                        </button>
                    </div>

                    <p className="text-sm text-zinc-500 pt-2">14-day free trial · No credit card required</p>
                </div>

                {/* Feature Grid */}
                <div ref={featuresRef} className="grid md:grid-cols-3 gap-6 mt-32 scroll-mt-20">
                    <FeatureCard
                        icon={<Brain className="w-6 h-6 text-emerald-400" />}
                        title="5 AI Agents"
                        description="Your virtual C-suite: COO, CMO, CFO, CTO, and Legal—ready 24/7 to strategize, analyze, and advise."
                    />
                    <FeatureCard
                        icon={<Target className="w-6 h-6 text-cyan-400" />}
                        title="Strategic Planning"
                        description="AI-powered roadmaps, multi-agent brainstorming sessions, and scenario modeling for every decision."
                    />
                    <FeatureCard
                        icon={<Shield className="w-6 h-6 text-violet-400" />}
                        title="Competitive Intel"
                        description="Automated competitor tracking, threat analysis, and market opportunity identification."
                    />
                    <FeatureCard
                        icon={<BarChart3 className="w-6 h-6 text-pink-400" />}
                        title="Financial Command"
                        description="Revenue tracking, runway calculations, cash flow forecasting, and budget optimization."
                    />
                    <FeatureCard
                        icon={<Network className="w-6 h-6 text-yellow-400" />}
                        title="Smart CRM"
                        description="AI-enhanced contact management, negotiation prep, and relationship intelligence."
                    />
                    <FeatureCard
                        icon={<Rocket className="w-6 h-6 text-orange-400" />}
                        title="Launch & Scale"
                        description="Go-to-market strategies, content amplification, pitch deck generation, and growth playbooks."
                    />
                </div>

                {/* Tools Showcase */}
                <div className="mt-20 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">30+ Specialized Tools</h2>
                    <p className="text-zinc-400 mb-12 max-w-2xl mx-auto">Everything you need to build, launch, and scale—all in one place.</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        <ToolBadge name="War Room" subtitle="Multi-Agent Brainstorm" />
                        <ToolBadge name="Treasury" subtitle="Financial Tracking" />
                        <ToolBadge name="Competitor Stalker" subtitle="Market Intelligence" />
                        <ToolBadge name="The Architect" subtitle="Product Specs" />
                        <ToolBadge name="The Studio" subtitle="AI Image Gen" />
                        <ToolBadge name="The Deck" subtitle="Pitch Decks" />
                        <ToolBadge name="The Network" subtitle="CRM & Contacts" />
                        <ToolBadge name="The Launchpad" subtitle="GTM Strategy" />
                        <ToolBadge name="Idea Incinerator" subtitle="Idea Validation" />
                        <ToolBadge name="The Academy" subtitle="Skill Training" />
                        <ToolBadge name="The Sanctuary" subtitle="Mental Wellness" />
                        <ToolBadge name="Voice AI" subtitle="Real-time Chat" />
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-32 p-12 rounded-3xl bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/5 blur-3xl" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Compete Like a Team?</h2>
                        <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                            Join solo founders who are building faster, deciding smarter, and scaling further—all with AI.
                        </p>
                        <button
                            onClick={() => router.push('/signup')}
                            className="px-8 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25"
                        >
                            Start Your Free Trial
                        </button>
                        <p className="text-sm text-zinc-500 mt-4">14 days free · Cancel anytime</p>
                    </div>
                </div>
            </div>
        </MarketingLayout>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 group">
            <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">{description}</p>
        </div>
    );
}

function ToolBadge({ name, subtitle }: { name: string, subtitle: string }) {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all hover:bg-white/10 text-left">
            <div className="font-bold text-white text-sm">{name}</div>
            <div className="text-xs text-zinc-500">{subtitle}</div>
        </div>
    );
}
