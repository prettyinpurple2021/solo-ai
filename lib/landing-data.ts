import { Crown, Zap, Brain, Target, BarChart3, Shield } from "lucide-react"

export const FEATURES = [
  {
    icon: Crown,
    title: "AI Squad Leadership",
    description:
      "Command your personal army of 8 specialized AI agents, each with unique personalities and boss-level skills.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Brain,
    title: "Smart Task Slaying",
    description:
      "AI-powered task management that learns your style and automatically prioritizes your empire-building moves.",
    color: "from-teal-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "Instant Automation",
    description:
      "Automate the boring stuff so you can focus on what matters - building your legendary business empire.",
    color: "from-pink-500 to-purple-500",
  },
  {
    icon: Target,
    title: "Goal Crushing System",
    description: "Set ambitious goals and watch our AI help you demolish them with strategic planning and execution.",
    color: "from-purple-500 to-teal-500",
  },
  {
    icon: BarChart3,
    title: "Boss Analytics",
    description:
      "Get insights that would make Fortune 500 CEOs jealous. Track everything that matters to your success.",
    color: "from-teal-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Fortress Security",
    description: "Your empire's data is protected with enterprise-grade security that even hackers would respect.",
    color: "from-purple-500 to-pink-500",
  },
]

export const AI_SQUAD = [
  {
    name: "Victoria",
    role: "Strategic Mastermind",
    description: "The queen of planning and execution. She'll turn your wildest business dreams into actionable roadmaps.",
    mood: "👑",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Maxine",
    role: "Content Empress",
    description: "Words are her weapons. She crafts content that converts and copy that commands attention.",
    mood: "✨",
    color: "from-pink-500 to-purple-500",
  },
  {
    name: "Samantha",
    role: "Sales Sorceress",
    description: "She doesn't just close deals, she creates raving fans who can't wait to buy from you again.",
    mood: "💎",
    color: "from-teal-500 to-purple-500",
  },
  {
    name: "Diana",
    role: "Data Diva",
    description: "Numbers whisper secrets to her. She'll reveal insights that skyrocket your success.",
    mood: "📊",
    color: "from-purple-500 to-teal-500",
  },
  {
    name: "Aurora",
    role: "Creative Catalyst",
    description: "Innovation is her superpower. She'll spark ideas that disrupt industries.",
    mood: "🎨",
    color: "from-pink-500 to-teal-500",
  },
  {
    name: "Stella",
    role: "Support Specialist",
    description: "Customer happiness is her mission. She'll turn every interaction into a love story.",
    mood: "💫",
    color: "from-teal-500 to-pink-500",
  },
  {
    name: "Isabella",
    role: "Integration Icon",
    description: "She connects everything seamlessly, making your tech stack work like a symphony.",
    mood: "🔗",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Nova",
    role: "Innovation Navigator",
    description: "She spots trends before they happen and keeps you ahead of the competition.",
    mood: "🚀",
    color: "from-pink-500 to-purple-500",
  },
]

export const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "CEO, TechFlow",
    content:
      "SoloBoss AI transformed my chaotic startup into a well-oiled machine. My AI squad handles everything while I focus on the big picture. Revenue up 300%!",
    avatar: "/images/testimonials/sarah.jpg",
  },
  {
    name: "Maria Rodriguez",
    role: "Founder, Creative Studio",
    content:
      "I was drowning in tasks until I found SoloBoss AI. Now my AI team manages my entire workflow. I actually have time to be creative again!",
    avatar: "/images/testimonials/maria.jpg",
  },
  {
    name: "Jessica Kim",
    role: "E-commerce Boss",
    content:
      "The AI agents are like having 8 brilliant employees who never sleep. My online store runs itself now. Best investment I've ever made!",
    avatar: "/images/testimonials/jessica.jpg",
  },
  {
    name: "Amanda Foster",
    role: "Marketing Maverick",
    content:
      "From content creation to campaign optimization, my AI squad does it all. I've scaled my agency 10x in just 6 months. Absolutely game-changing!",
    avatar: "/images/testimonials/amanda.jpg",
  },
]

export const PRICING_PLANS = [
  {
    name: "Starter Boss",
    price: "Free",
    period: "",
    description: "Perfect for new bosses getting started",
    features: [
      "2 AI Squad Members",
      "Basic Task Management",
      "Limited Analytics",
      "Community Support",
      "5 Projects",
    ],
    popular: false,
  },
  {
    name: "Accelerator",
    price: "$20",
    period: "/month",
    description: "Perfect for ambitious bosses ready to scale",
    features: [
      "5 AI Squad Members",
      "Advanced Task Management",
      "Full Analytics Suite",
      "Priority Support",
      "Unlimited Projects",
      "Team Collaboration",
      "Advanced Integrations",
    ],
    popular: true,
  },
  {
    name: "Dominator",
    price: "$49",
    period: "/month",
    description: "For empire builders who want it all",
    features: [
      "All 8 AI Squad Members",
      "Enterprise Task Management",
      "Custom Analytics",
      "White-glove Support",
      "Everything Unlimited",
      "Advanced Team Features",
      "Custom AI Training",
      "API Access",
    ],
    popular: false,
  },
]

export const STATS = [
  {
    number: "10,000+",
    label: "Boss Babes Empowered",
  },
  {
    number: "300%",
    label: "Average Revenue Increase",
  },
  {
    number: "24/7",
    label: "AI Squad Support",
  },
]