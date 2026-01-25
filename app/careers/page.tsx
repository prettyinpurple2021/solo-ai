'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { CyberPageLayout } from '@/components/cyber/CyberPageLayout'
import { HudBorder } from '@/components/cyber/HudBorder'
import { CyberButton } from '@/components/cyber/CyberButton'
import { Briefcase, Users, Zap, Heart, Rocket, ArrowRight } from 'lucide-react'

const values = [
  {
    icon: Rocket,
    title: 'Innovation First',
    description: 'We push boundaries and embrace cutting-edge technology to solve real problems',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'We believe in the power of teamwork and diverse perspectives',
  },
  {
    icon: Heart,
    title: 'User-Centric',
    description: 'Everything we do is focused on delivering value to our users',
  },
  {
    icon: Zap,
    title: 'Speed & Agility',
    description: 'We move fast, iterate quickly, and adapt to changing needs',
  },
]

const openPositions = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
  },
]

export default function CareersPage() {
  return (
    <CyberPageLayout>
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-cyan/30 bg-neon-cyan/5 rounded-none mb-6">
              <Briefcase className="w-4 h-4 text-neon-cyan" />
              <span className="text-xs font-bold tracking-widest text-neon-cyan uppercase">Join The Network</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-6">
              CAREERS <span className="text-neon-cyan">AT SOLOSUCCESS</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-mono">
              Build the future of AI-powered business automation with us.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {values.map((value, index) => (
              <HudBorder key={index} variant="hover" className="p-6">
                <value.icon className="w-8 h-8 text-neon-purple mb-4" />
                <h3 className="font-orbitron text-lg text-white mb-2">{value.title}</h3>
                <p className="text-sm text-gray-400 font-mono leading-relaxed">{value.description}</p>
              </HudBorder>
            ))}
          </div>

          <div className="mb-16">
            <h2 className="font-orbitron text-3xl text-white mb-8 text-center">OPEN_POSITIONS</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {openPositions.map((position, index) => (
                <HudBorder key={index} variant="hover" className="p-6">
                  <h3 className="font-orbitron text-xl text-white mb-2">{position.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 font-mono mb-4">
                    <span>{position.department}</span>
                    <span>•</span>
                    <span>{position.location}</span>
                    <span>•</span>
                    <span>{position.type}</span>
                  </div>
                  <Link href={`/careers/${position.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CyberButton variant="secondary" size="sm">
                      View Details
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </CyberButton>
                  </Link>
                </HudBorder>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CyberPageLayout>
  )
}
