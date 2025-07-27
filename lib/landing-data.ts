export interface AIAgent {
  id: string
  name: string
  role: string
  description: string
  image: string
  specialties: string[]
  personality: string
  voiceEnabled: boolean
}

export const aiAgents: AIAgent[] = [
  {
    id: "roxy",
    name: "Roxy",
    role: "Marketing Maverick",
    description: "Your bold marketing strategist who creates viral campaigns and builds unstoppable brand presence.",
    image: "/images/agents/roxy.png",
    specialties: ["Social Media Strategy", "Content Creation", "Brand Building", "Viral Marketing"],
    personality: "Bold, creative, and trend-savvy with an eye for what makes content go viral.",
    voiceEnabled: true,
  },
  {
    id: "blaze",
    name: "Blaze",
    role: "Sales Powerhouse",
    description: "The ultimate sales closer who turns prospects into loyal customers with irresistible offers.",
    image: "/images/agents/blaze.png",
    specialties: ["Sales Funnels", "Conversion Optimization", "Customer Psychology", "Revenue Growth"],
    personality: "High-energy, persuasive, and results-driven with a passion for closing deals.",
    voiceEnabled: true,
  },
  {
    id: "echo",
    name: "Echo",
    role: "Content Creator",
    description: "Your creative genius who crafts compelling stories and engaging content across all platforms.",
    image: "/images/agents/echo.png",
    specialties: ["Copywriting", "Storytelling", "Blog Posts", "Email Campaigns"],
    personality: "Creative, articulate, and emotionally intelligent with a gift for words.",
    voiceEnabled: true,
  },
  {
    id: "lumi",
    name: "Lumi",
    role: "Analytics Oracle",
    description: "Data-driven insights expert who transforms numbers into actionable business intelligence.",
    image: "/images/agents/lumi.png",
    specialties: ["Data Analysis", "Performance Metrics", "Market Research", "Growth Tracking"],
    personality: "Analytical, precise, and insightful with a talent for spotting trends.",
    voiceEnabled: true,
  },
  {
    id: "vex",
    name: "Vex",
    role: "Tech Wizard",
    description: "Your technical mastermind who handles all the complex tech stuff so you can focus on growing.",
    image: "/images/agents/vex.png",
    specialties: ["Automation", "Integrations", "Technical Setup", "System Optimization"],
    personality: "Logical, efficient, and solution-oriented with a love for automation.",
    voiceEnabled: true,
  },
  {
    id: "lexi",
    name: "Lexi",
    role: "Customer Success Champion",
    description: "The relationship builder who ensures every customer becomes a raving fan and brand advocate.",
    image: "/images/agents/lexi.png",
    specialties: ["Customer Support", "Relationship Building", "Retention Strategies", "Community Management"],
    personality: "Empathetic, patient, and nurturing with exceptional people skills.",
    voiceEnabled: true,
  },
  {
    id: "nova",
    name: "Nova",
    role: "Innovation Catalyst",
    description: "Your forward-thinking strategist who spots opportunities and drives breakthrough innovations.",
    image: "/images/agents/nova.png",
    specialties: ["Strategic Planning", "Innovation", "Market Opportunities", "Business Development"],
    personality: "Visionary, strategic, and forward-thinking with an eye for the future.",
    voiceEnabled: true,
  },
  {
    id: "glitch",
    name: "Glitch",
    role: "Problem Solver",
    description:
      "The troubleshooter who finds creative solutions to any challenge and keeps everything running smoothly.",
    image: "/images/agents/glitch.png",
    specialties: ["Problem Solving", "Crisis Management", "Process Improvement", "Quality Assurance"],
    personality: "Resourceful, calm under pressure, and exceptionally good at finding solutions.",
    voiceEnabled: true,
  },
]

export const features = [
  {
    title: "AI Squad Command Center",
    description: "Manage your entire team of 8 specialized AI agents from one powerful dashboard.",
    icon: "👑",
  },
  {
    title: "Voice-Activated Collaboration",
    description: "Talk directly to your AI agents and get instant responses through advanced voice technology.",
    icon: "🎤",
  },
  {
    title: "24/7 Business Operations",
    description: "Your AI squad works around the clock, handling tasks while you sleep and scale.",
    icon: "⚡",
  },
  {
    title: "Intelligent Task Distribution",
    description: "Smart routing ensures each task goes to the most qualified AI agent automatically.",
    icon: "🧠",
  },
  {
    title: "Real-Time Performance Analytics",
    description: "Track your empire's growth with detailed insights and actionable recommendations.",
    icon: "📊",
  },
  {
    title: "Seamless Integration Hub",
    description: "Connect with 100+ tools and platforms to create your ultimate business ecosystem.",
    icon: "🔗",
  },
]

export const testimonials = [
  {
    name: "Sarah Chen",
    role: "E-commerce Empire Builder",
    content:
      "SoloBoss AI transformed my one-person business into a $2M empire. My AI squad handles everything while I focus on strategy.",
    avatar: "/placeholder-user.jpg",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Digital Marketing Boss",
    content:
      "The voice chat feature is game-changing. I literally talk to my AI team like they're sitting next to me. Incredible!",
    avatar: "/placeholder-user.jpg",
    rating: 5,
  },
  {
    name: "Emma Thompson",
    role: "Content Creation Queen",
    content:
      "From struggling freelancer to industry leader in 6 months. My AI squad creates content faster than I ever imagined.",
    avatar: "/placeholder-user.jpg",
    rating: 5,
  },
]

export const stats = [
  {
    number: "10,000+",
    label: "Boss Babes Empowered",
    description: "Solo entrepreneurs who've built their empires",
  },
  {
    number: "300%",
    label: "Average Revenue Growth",
    description: "Typical increase in first 6 months",
  },
  {
    number: "24/7",
    label: "AI Squad Support",
    description: "Your team never sleeps, never quits",
  },
]
