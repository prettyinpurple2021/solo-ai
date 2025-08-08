"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, X, ArrowLeft, Crown, Rocket, Zap, MessageCircle } from "lucide-react"
import Link from "next/link"

// AuthModal removed - using Clerk authentication instead
import { ScheduleDemoModal } from "@/components/schedule/schedule-demo-modal"


const PRICING_PLANS = [
  {
    name: "Launch",
    description: "Perfect for ambitious beginners ready to start their empire",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    popular: false,
    icon: Rocket,
    color: "from-blue-500 to-cyan-500",
    cta: "Start Free",
    ctaType: "signup",
    features: [
      "Access to 2 AI agents (Nova & Echo)",
      "5 AI conversations per day",
      "Basic task automation",
      "Email support",
      "Community access",
      "Mobile app access",
    ],
    limitations: ["Limited to 2 AI agents", "5 daily conversation limit", "Basic features only", "No priority support"],
  },
  {
    name: "Accelerator",
    description: "For growing boss babes scaling their operations",
    monthlyPrice: "$19",
    yearlyPrice: "$190",
    popular: true,
    icon: Zap,
    color: "from-purple-500 to-pink-500",
    cta: "Get Started",
    ctaType: "signup",
    features: [
      "Access to 5 AI agents",
      "100 AI conversations per day",
      "Advanced automation workflows",
      "Priority email support",
      "Analytics dashboard",
      "Integration with 50+ tools",
      "Custom branding options",
      "Team collaboration (up to 3 members)",
    ],
    limitations: ["Limited to 5 AI agents", "100 daily conversation limit", "Basic analytics only"],
  },
  {
    name: "Dominator",
    description: "For empire builders who demand unlimited power",
    monthlyPrice: "$29",
    yearlyPrice: "$290",
    popular: false,
    icon: Crown,
    color: "from-yellow-500 to-orange-500",
    cta: "Contact Sales",
    ctaType: "contact",
    features: [
      "Access to all 8 AI agents",
      "Unlimited AI conversations",
      "Advanced automation + custom workflows",
      "24/7 priority support + phone support",
      "Advanced analytics + custom reports",
      "Unlimited integrations",
      "White-label options",
      "Unlimited team members",
      "API access",
      "Custom AI agent training",
    ],
    limitations: [],
  },
]

const FAQ_ITEMS = [
  {
    question: "Can I switch plans anytime?",
    answer:
      "You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
  },
  {
    question: "What happens if I exceed my conversation limits?",
    answer:
      "Don't worry, boss babe! If you hit your limits, you can either upgrade your plan or wait until the next billing cycle. We'll never cut you off mid-conversation.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee on all paid plans. If you're not completely satisfied, we'll refund your payment, no questions asked.",
  },
  {
    question: "Can I use SoloBoss AI for my team?",
    answer:
      "Yes! The Accelerator plan includes up to 3 team members, and the Dominator plan supports unlimited team members. Perfect for growing empires!",
  },
  {
    question: "What kind of support do you provide?",
    answer:
      "We provide email support for all plans, priority email support for Accelerator users, and 24/7 priority support plus phone support for Dominator users. We're here to help you succeed!",
  },
  {
    question: "Are there any setup fees or hidden costs?",
    answer:
      "Nope! What you see is what you pay. No setup fees, no hidden costs, no surprises. Just transparent pricing for transparent boss babes.",
  },
]

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState("Accelerator")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const router = useRouter()


  const calculateSavings = (monthly: string, yearly: string) => {
    if (monthly === "Free" || yearly === "Free") return 0
    const monthlyNum = Number.parseInt(monthly.replace("$", ""))
    const yearlyNum = Number.parseInt(yearly.replace("$", ""))
    return Math.round(((monthlyNum * 12 - yearlyNum * 12) / (monthlyNum * 12)) * 100)
  }

  const handleCTAClick = (plan: typeof PRICING_PLANS[0]) => {
    if (plan.ctaType === "signup") {
      router.push('/sign-up')
    } else if (plan.ctaType === "contact") {
      // For now, we'll scroll to the contact section or show a simple alert
      // In a real app, this could open a contact modal or navigate to a contact page
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      // You could also implement: router.push('/contact') if a contact page exists
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <div className="text-2xl">👑</div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SoloBoss AI
                </span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Features
              </Link>
              <Link href="/#testimonials" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Success Stories
              </Link>
              <Link href="/pricing" className="text-purple-600 font-medium">
                Pricing
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-full">
                Start Building Empire
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 text-lg px-6 py-2 bg-purple-100 text-purple-700 border-purple-200 rounded-full">
            ✨ Choose Your Empire Level
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Pricing That Scales
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              With Your Ambition
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start free and scale as you grow. Every plan is designed to give you the tools you need to build your
            empire, no matter where you are in your journey.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`font-medium ${billingCycle === "monthly" ? "text-purple-600" : "text-gray-500"}`}>Monthly</span>
            <Switch checked={billingCycle === "yearly"} onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")} className="data-[state=checked]:bg-purple-600" />
            <span className={`font-medium ${billingCycle === "yearly" ? "text-purple-600" : "text-gray-500"}`}>Yearly</span>
            <Badge className="bg-green-100 text-green-700 border-green-200">Save up to 20%</Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan, index) => {
              const savings = calculateSavings(plan.monthlyPrice, plan.yearlyPrice)
              const currentPrice = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice

              return (
                <Card
                  key={index}
                  className={`relative border-2 transition-all duration-200 hover:scale-105 ${
                    plan.popular
                      ? "border-purple-300 ring-4 ring-purple-100 scale-105"
                      : "border-gray-200 hover:border-purple-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-sm px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}
                    >
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-600 mb-4">{plan.description}</CardDescription>

                    <div className="mb-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {currentPrice}
                        </span>
                        {currentPrice !== "Free" && (
                          <span className="text-gray-600 ml-2">/{billingCycle === "yearly" ? "year" : "month"}</span>
                        )}
                      </div>
                      {billingCycle === "yearly" && savings > 0 && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 mt-2">Save {savings}%</Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="flex items-start space-x-3">
                          <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-400 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full font-bold py-3 rounded-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white animate-pulse"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white"
                      }`}
                      onClick={() => handleCTAClick(plan)}
                    >
                      {plan.ctaType === "contact" && <MessageCircle className="w-4 h-4 mr-2" />}
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Compare All Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See exactly what you get with each plan. Every feature is designed to accelerate your empire building
              journey.
            </p>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-bold text-gray-800">Features</th>
                    <th className="text-center p-4 font-bold text-gray-800">Launch</th>
                    <th className="text-center p-4 font-bold text-gray-800">Accelerator</th>
                    <th className="text-center p-4 font-bold text-gray-800">Dominator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-4 font-medium text-gray-800">AI Agents Access</td>
                    <td className="p-4 text-center">2 agents</td>
                    <td className="p-4 text-center">5 agents</td>
                    <td className="p-4 text-center">All 8 agents</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">Daily Conversations</td>
                    <td className="p-4 text-center">5</td>
                    <td className="p-4 text-center">100</td>
                    <td className="p-4 text-center">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-800">Automation Workflows</td>
                    <td className="p-4 text-center">Basic</td>
                    <td className="p-4 text-center">Advanced</td>
                    <td className="p-4 text-center">Advanced + Custom</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">Support Level</td>
                    <td className="p-4 text-center">Email</td>
                    <td className="p-4 text-center">Priority Email</td>
                    <td className="p-4 text-center">24/7 Priority + Phone</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-800">Team Members</td>
                    <td className="p-4 text-center">1</td>
                    <td className="p-4 text-center">3</td>
                    <td className="p-4 text-center">Unlimited</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">API Access</td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    </td>
                    <td className="p-4 text-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Boss Babe FAQ
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers. Here are the most common questions from ambitious entrepreneurs like
              you.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-purple-600">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Choose Your Empire Level?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of boss babes who are already scaling their businesses with SoloBoss AI. Your empire is
            waiting.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200"
              onClick={() => router.push('/sign-up')}
            >
              Start for free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowScheduleModal(true)}
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold px-8 py-4 rounded-full transform hover:scale-105 transition-all duration-200 bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>


      {/* Schedule Demo Modal */}
      <ScheduleDemoModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}

      />

      {/* Auth Modal removed - using Clerk authentication */}
    </div>
  )
}
