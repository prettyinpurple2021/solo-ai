"use client"

export const dynamic = "force-dynamic"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Sparkles,
  Crown,
  Users,
  TrendingUp,
  Play,
  Target,
  Settings,
  Workflow,
  GitBranch,
  Layers,
  Activity,
  Rocket,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const workflowCategories = [
  {
    name: "Lead Generation",
    description: "Automated workflows for identifying and nurturing potential customers",
    icon: Target,
    color: "from-neon-purple to-neon-magenta",
    workflows: ["Social Media Lead Capture", "Email List Building", "Content Lead Magnets", "Referral Systems"],
  },
  {
    name: "Sales Automation",
    description: "Streamlined sales processes from prospect to close",
    icon: TrendingUp,
    color: "from-neon-cyan to-neon-blue",
    workflows: ["Follow-up Sequences", "Proposal Generation", "Contract Management", "Payment Processing"],
  },
  {
    name: "Content Marketing",
    description: "Automated content creation and distribution systems",
    icon: Sparkles,
    color: "from-neon-orange to-neon-magenta",
    workflows: ["Blog Post Automation", "Social Media Scheduling", "Email Newsletter", "Content Repurposing"],
  },
  {
    name: "Customer Success",
    description: "Automated customer onboarding and retention processes",
    icon: Users,
    color: "from-neon-lime to-neon-cyan",
    workflows: ["Onboarding Sequences", "Support Ticket Routing", "Feedback Collection", "Retention Campaigns"],
  },
]

const featuredWorkflows = [
  {
    name: "Complete Sales Funnel",
    description: "End-to-end automation from lead capture to customer success",
    steps: 12,
    estimatedTime: "2-3 hours setup",
    difficulty: "Advanced",
    icon: GitBranch,
    color: "from-neon-purple to-neon-magenta",
  },
  {
    name: "Content Marketing Machine",
    description: "Automated content creation and distribution across all channels",
    steps: 8,
    estimatedTime: "1-2 hours setup",
    difficulty: "Intermediate",
    icon: Layers,
    color: "from-neon-cyan to-neon-blue",
  },
  {
    name: "Customer Onboarding System",
    description: "Automated customer journey from signup to success",
    steps: 6,
    estimatedTime: "30-45 minutes setup",
    difficulty: "Beginner",
    icon: Activity,
    color: "from-neon-orange to-neon-magenta",
  },
]

const workflowSteps = [
  {
    step: 1,
    title: "Define Your Goals",
    description: "Identify what you want to achieve with your workflow",
    icon: Target,
  },
  {
    step: 2,
    title: "Map Your Process",
    description: "Break down your workflow into clear, actionable steps",
    icon: GitBranch,
  },
  {
    step: 3,
    title: "Configure Automation",
    description: "Set up triggers, conditions, and actions for each step",
    icon: Settings,
  },
  {
    step: 4,
    title: "Test & Deploy",
    description: "Test your workflow and deploy it for maximum impact",
    icon: Rocket,
  },
]

export default function WorkflowsPage() {
  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#b300ff22,transparent_35%),radial-gradient(circle_at_bottom,#0be4ec22,transparent_35%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neon-cyan/30 bg-dark-bg/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_15px_rgba(179,0,255,0.4)]">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="font-orbitron text-lg font-bold text-white uppercase tracking-wider">SoloSuccess AI</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-neon-cyan/40 text-gray-300 hover:text-neon-cyan">
                  Dashboard
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  variant="cyan"
                  className="shadow-[0_0_15px_rgba(11,228,236,0.3)] font-orbitron uppercase tracking-wider"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <section className="max-w-6xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1 border border-neon-purple/30 bg-neon-purple/10 rounded-sm mb-6">
              <Sparkles className="w-4 h-4 text-neon-purple" />
              <span className="text-xs font-mono tracking-widest text-neon-purple uppercase">Neural Workflow Engine</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-white mb-4 uppercase tracking-wider">
              Cyberpunk <span className="text-neon-cyan">Workflows</span>
            </h1>
            <p className="text-lg text-gray-400 font-mono max-w-3xl mx-auto">
              Deploy autonomous workflows that run 24/7. From lead generation to customer success, orchestrate every
              operation with neon-grade precision.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button
                size="lg"
                variant="cyan"
                className="font-orbitron uppercase tracking-wider shadow-[0_0_20px_rgba(11,228,236,0.3)]"
              >
                <Workflow className="w-4 h-4 mr-2" />
                Deploy Workflows
              </Button>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-neon-purple/40 text-gray-300 hover:text-neon-purple"
                >
                  View Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-white uppercase tracking-wider mb-3">
              Workflow Categories
            </h2>
            <p className="text-gray-400 font-mono">
              Organized by tactical function for maximum operational efficiency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflowCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="border border-neon-purple/30 bg-dark-card/80 backdrop-blur-xl rounded-sm p-6 shadow-[0_0_20px_rgba(179,0,255,0.15)]"
              >
                <div className="text-center mb-6">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-sm bg-gradient-to-r ${category.color} flex items-center justify-center shadow-[0_0_15px_rgba(179,0,255,0.3)]`}
                  >
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-orbitron text-xl text-white uppercase tracking-wider mb-2">{category.name}</h3>
                  <p className="text-gray-400 font-mono text-sm">{category.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-mono text-neon-cyan text-xs uppercase tracking-wider">Available Workflows</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {category.workflows.map((workflow, workflowIndex) => (
                      <div
                        key={workflow}
                        className="flex items-center gap-3 p-3 bg-dark-bg/60 border border-gray-700 rounded-sm"
                      >
                        <div className="w-8 h-8 rounded-sm bg-gradient-to-r from-neon-purple to-neon-magenta flex items-center justify-center text-white font-orbitron text-xs">
                          {workflowIndex + 1}
                        </div>
                        <span className="text-gray-300 font-mono text-sm">{workflow}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-white uppercase tracking-wider mb-3">
              Featured Workflows
            </h2>
            <p className="text-gray-400 font-mono">
              Battle-tested workflows used by successful founders in the network
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredWorkflows.map((workflow, index) => (
              <motion.div
                key={workflow.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="border border-neon-cyan/30 bg-dark-card/80 backdrop-blur-xl rounded-sm p-6 shadow-[0_0_20px_rgba(11,228,236,0.15)]"
              >
                <div className="text-center mb-6">
                  <div
                    className={`w-14 h-14 mx-auto mb-4 rounded-sm bg-gradient-to-r ${workflow.color} flex items-center justify-center shadow-[0_0_12px_rgba(179,0,255,0.25)]`}
                  >
                    <workflow.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-orbitron text-lg text-white uppercase tracking-wider mb-2">{workflow.name}</h3>
                  <p className="text-gray-400 font-mono text-sm">{workflow.description}</p>
                </div>

                <div className="space-y-3 font-mono text-sm text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Steps</span>
                    <span className="text-white font-bold">{workflow.steps}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Setup Time</span>
                    <span className="text-white font-bold">{workflow.estimatedTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Difficulty</span>
                    <span
                      className={`font-bold ${
                        workflow.difficulty === "Beginner"
                          ? "text-neon-lime"
                          : workflow.difficulty === "Intermediate"
                            ? "text-neon-orange"
                            : "text-neon-magenta"
                      }`}
                    >
                      {workflow.difficulty}
                    </span>
                  </div>
                </div>

                <Button
                  variant="purple"
                  className="w-full mt-6 font-orbitron uppercase tracking-wider shadow-[0_0_15px_rgba(179,0,255,0.3)]"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Deploy Workflow
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-white uppercase tracking-wider mb-3">
              How It Works
            </h2>
            <p className="text-gray-400 font-mono">
              Deploy cyberpunk workflows in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="border border-gray-700 bg-dark-card/80 backdrop-blur-xl rounded-sm p-5 text-center shadow-[0_0_12px_rgba(0,0,0,0.35)]"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-sm bg-gradient-to-r from-neon-purple to-neon-magenta flex items-center justify-center shadow-[0_0_12px_rgba(179,0,255,0.25)]">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <div className="w-10 h-10 mx-auto mb-3 rounded-sm bg-neon-cyan/15 border border-neon-cyan/30 flex items-center justify-center font-orbitron text-neon-cyan text-sm">
                  {step.step}
                </div>
                <h3 className="font-orbitron text-lg text-white uppercase tracking-wider mb-2">{step.title}</h3>
                <p className="text-gray-400 font-mono text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border border-neon-cyan/30 bg-dark-card/80 backdrop-blur-xl rounded-sm p-10 text-center shadow-[0_0_25px_rgba(11,228,236,0.15)]"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-sm bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center shadow-[0_0_18px_rgba(11,228,236,0.3)]">
              <Workflow className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-orbitron text-3xl text-white uppercase tracking-wider mb-4">
              Ready to Automate Your Operations?
            </h2>
            <p className="text-gray-400 font-mono max-w-3xl mx-auto mb-6">
              Launch workflows that scale with you. From lead capture to customer success, orchestrate every step with
              neon-grade automation.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                variant="cyan"
                className="font-orbitron uppercase tracking-wider shadow-[0_0_20px_rgba(11,228,236,0.3)]"
              >
                <Workflow className="w-4 h-4 mr-2" />
                Deploy Workflows
              </Button>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-neon-purple/40 text-gray-300 hover:text-neon-purple"
                >
                  View Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
