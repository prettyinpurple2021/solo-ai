'use client'

import Link from 'next/link'
import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { CyberButton } from '@/components/cyber/CyberButton'


const pricingPlans = [
  {
    id: 'launch',
    title: 'ESSENTIAL',
    price: 'FREE',
    subtitle: 'No Validation Required',
    features: [
      'Basic Agent Access',
      'Neural Hub Lite',
      'Network Support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'accelerator',
    title: 'SCALE',
    price: 'SCALE',
    subtitle: 'Full System Suite',
    features: [
      '10 Specialized Agents',
      'Unlimited Processes',
      'Priority Data Streams',
      'Quantum Encryption+',
    ],
    cta: 'Upgrade',
    popular: true,
  },
]

export default function PricingPage() {
  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-orbitron font-bold text-white">CHOOSE YOUR PLAN</h1>
            <p className="text-neon-cyan mt-4 font-mono tracking-widest uppercase">
              Join the network of innovative founders.
            </p>
            <div className="w-24 h-1 bg-neon-purple mx-auto mt-4 shadow-[0_0_15px_#bd00ff]"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {pricingPlans.map((plan) => (
              <HudBorder
                key={plan.id}
                className={`p-8 flex flex-col items-center text-center relative overflow-hidden ${
                  plan.popular ? 'border-neon-purple/50' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-neon-purple text-white text-[10px] font-bold px-3 py-1 font-orbitron">
                    RECOMMENDED
                  </div>
                )}
                
                <h3 className={`font-orbitron text-xl ${plan.popular ? 'text-neon-purple' : 'text-gray-400'}`}>
                  {plan.title}
                </h3>
                <div className="text-4xl font-orbitron font-bold text-white mt-4 mb-2">{plan.price}</div>
                <span className={`text-xs font-mono uppercase tracking-widest mb-8 ${
                  plan.popular ? 'text-neon-purple' : 'text-neon-cyan'
                }`}>
                  {plan.subtitle}
                </span>
                
                <ul className="space-y-3 mb-8 text-sm font-mono text-gray-400 w-full text-left pl-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <span className={`mr-2 ${plan.popular ? 'text-neon-purple' : 'text-neon-cyan'}`}>
                        {'>>'}
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="w-full">
                  <CyberButton
                    variant={plan.popular ? 'ghost' : 'secondary'}
                    size="md"
                    className={`w-full ${
                      plan.popular
                        ? 'bg-neon-purple/20 border-neon-purple hover:bg-neon-purple hover:text-white text-neon-purple shadow-[0_0_15px_rgba(189,0,255,0.2)]'
                        : ''
                    }`}
                  >
                    {plan.cta}
                  </CyberButton>
                </Link>
              </HudBorder>
            ))}
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}
