import { Brain, Target, Zap, Shield, Users, TrendingUp } from "lucide-react"

export const FEATURES = [
  {
    icon: Brain,
    title: "AI Squad Command Center",
    description:
      "Direct your 8 specialized AI agents with precision. Each agent brings unique expertise to accelerate your empire building.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Target,
    title: "Strategic Empire Planning",
    description:
      "Get personalized business strategies, market analysis, and growth roadmaps tailored to your industry and goals.",
    color: "from-blue-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "Instant Task Automation",
    description:
      "Automate repetitive tasks, streamline workflows, and focus on high-impact activities that grow your business.",
    color: "from-green-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Boss-Level Security",
    description:
      "Enterprise-grade security keeps your business data safe while you scale. Your empire is protected 24/7.",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Collaboration Hub",
    description:
      "Connect with other boss babes, share strategies, and build your network while your AI squad handles the heavy lifting.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: TrendingUp,
    title: "Growth Analytics",
    description:
      "Track your empire's growth with detailed analytics, performance insights, and predictive forecasting.",
    color: "from-indigo-500 to-purple-500",
  },
]

export const AI_SQUAD = [
  {
    id: "roxy",
    name: "Roxy",
    role: "Executive Assistant",
    description:
      "Your organized, proactive right-hand who manages schedules, workflows, and keeps your empire running smoothly.",
    mood: "💼",
    color: "from-purple-500 to-pink-500",
    image: "/images/agents/roxy.png",
  },
  {
    id: "blaze",
    name: "Blaze",
    role: "Growth & Sales Strategist",
    description:
      "High-energy sales powerhouse who validates ideas, builds funnels, and closes deals with unstoppable momentum.",
    mood: "🔥",
    color: "from-red-500 to-orange-500",
    image: "/images/agents/blaze.png",
  },
  {
    id: "echo",
    name: "Echo",
    role: "Marketing Maven",
    description:
      "Creative marketing genius who crafts viral content, builds brand presence, and creates authentic connections.",
    mood: "📢",
    color: "from-pink-500 to-purple-500",
    image: "/images/agents/echo.png",
  },
  {
    id: "lumi",
    name: "Lumi",
    role: "Legal & Documentation",
    description:
      "Sharp legal mind who navigates requirements, generates contracts, and protects your business interests.",
    mood: "⚖️",
    color: "from-blue-500 to-indigo-500",
    image: "/images/agents/lumi.png",
  },
  {
    id: "vex",
    name: "Vex",
    role: "Technical Architect",
    description:
      "Tech wizard who designs systems, recommends solutions, and builds the technical foundation of your empire.",
    mood: "⚡",
    color: "from-green-500 to-teal-500",
    image: "/images/agents/vex.png",
  },
  {
    id: "lexi",
    name: "Lexi",
    role: "Strategy & Insight Analyst",
    description:
      "Data-driven strategist who analyzes trends, tracks performance, and provides actionable business insights.",
    mood: "📊",
    color: "from-cyan-500 to-blue-500",
    image: "/images/agents/lexi.png",
  },
  {
    id: "nova",
    name: "Nova",
    role: "Product Designer",
    description:
      "Creative visionary who designs beautiful user experiences, creates brand assets, and brings ideas to life.",
    mood: "🎨",
    color: "from-violet-500 to-purple-500",
    image: "/images/agents/nova.png",
  },
  {
    id: "glitch",
    name: "Glitch",
    role: "QA & Debug Agent",
    description:
      "Detail-oriented perfectionist who identifies friction points, optimizes systems, and ensures flawless execution.",
    mood: "🔍",
    color: "from-emerald-500 to-green-500",
    image: "/images/agents/glitch.png",
  },
]

export const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "E-commerce Empire Builder",
    content:
      "My AI squad helped me scale from $10K to $100K monthly revenue in just 6 months. Roxy manages my entire workflow while Blaze optimizes my sales funnels. Game changer!",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Maria Rodriguez",
    role: "Digital Marketing Boss",
    content:
      "Echo's marketing strategies and Nova's design work transformed my brand. I went from struggling freelancer to agency owner with a team of 12. My AI squad made it possible.",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Jessica Thompson",
    role: "Tech Startup Founder",
    content:
      "Vex helped me build my SaaS platform while Lumi handled all the legal requirements. I launched in 3 months instead of 12. My AI squad is my secret weapon.",
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Amanda Foster",
    role: "Coaching Empire Queen",
    content:
      "Lexi's analytics showed me exactly where to focus my energy. My coaching business grew 400% in one year. I couldn't have done it without my AI squad's insights.",
    avatar: "/placeholder-user.jpg",
  },
]

export const PRICING_PLANS = [
  {
    name: "Launchpad",
    price: "$97",
    period: "/month",
    description: "Perfect for ambitious beginners ready to start their empire journey",
    features: [
      "Access to 4 core AI agents",
      "Basic workflow automation",
      "Standard support",
      "Monthly strategy sessions",
      "Community access",
    ],
    popular: false,
  },
  {
    name: "Accelerator",
    price: "$197",
    period: "/month",
    description: "For growing bosses ready to scale their operations",
    features: [
      "Full access to all 8 AI agents",
      "Advanced automation & integrations",
      "Priority support",
      "Weekly strategy sessions",
      "Exclusive mastermind access",
      "Custom workflow creation",
    ],
    popular: true,
  },
  {
    name: "Dominator",
    price: "$497",
    period: "/month",
    description: "For empire builders who demand the absolute best",
    features: [
      "Unlimited AI agent interactions",
      "White-glove onboarding",
      "24/7 VIP support",
      "Daily strategy optimization",
      "Private boss community",
      "Custom AI agent training",
      "Revenue optimization audits",
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
    label: "Average Revenue Growth",
  },
  {
    number: "24/7",
    label: "AI Squad Support",
  },
]
