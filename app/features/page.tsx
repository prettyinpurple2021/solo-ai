'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { CyberButton } from '@/components/cyber/CyberButton'
import { 
  Brain, 
, 
, 
, 
, 
, 
, 
, 
, 
, 
,
  ArrowRight,
  Server,
  Lock,
  Bolt,
  Crosshair,
  Building2
} from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    {
      number: '01',
      icon: Server,
      title: 'Intelligence Hub',
      description: '8 specialized AI agents ready for input. Centralized control for all data streams.',
    },
    {
      number: '02',
      icon: Lock,
      title: 'Advanced Encryption',
      description: 'Enterprise-grade security protocols. Your proprietary data is secured behind layers of digital protection.',
    },
    {
      number: '03',
      icon: Bolt,
      title: 'Rapid Deployment',
      description: 'Launch protocols in under 60 seconds. Zero latency. Instant execution of business logic.',
    },
    {
      number: '04',
      icon: Crosshair,
      title: 'Intelligent Targeting',
      description: 'Achieve business objectives with calculated accuracy. Optimize compute and effort.',
    },
    {
      number: '05',
      icon: Brain,
      title: 'Predictive Analytics',
      description: 'Real-time market intelligence streams. Analyze the dataset clearly before you execute.',
    },
    {
      number: '06',
      icon: Building2,
      title: 'Ecosystem Scaling',
      description: 'Scale from single node to full network seamlessly. The system adapts as you expand.',
    },
  ]

  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-neon-purple font-orbitron text-sm tracking-widest">/// CAPABILITIES</span>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mt-4">
              INTELLIGENCE_MODULES <span className="text-neon-cyan blinking">_</span>
            </h1>
            <p className="text-lg text-gray-400 mt-6 max-w-2xl mx-auto font-mono">
              Deploy AI agents with intelligent precision to optimize every aspect of your operation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature) => (
              <HudBorder key={feature.number} variant="hover" className="p-6 group cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-orbitron text-2xl font-bold text-white/20 group-hover:text-neon-cyan transition-colors">
                    {feature.number}
                  </span>
                  <feature.icon className="w-6 h-6 text-neon-purple" />
                </div>
                <h3 className="font-orbitron text-lg text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 font-mono leading-relaxed">{feature.description}</p>
              </HudBorder>
            ))}
          </div>

          <div className="text-center">
            <Link href="/signup">
              <CyberButton variant="primary" size="lg">
                INITIALIZE_SYSTEM
                <ArrowRight className="ml-2 w-5 h-5" />
              </CyberButton>
            </Link>
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}
