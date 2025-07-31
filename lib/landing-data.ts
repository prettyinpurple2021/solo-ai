export interface AIAgent {
  id: string
  name: string
  role: string
  specialty: string
  image: string
  description: string
  skills: string[]
  personality: {
    tone: string
    approach: string
    strengths: string[]
  }
  // Additional properties for team page
  color?: string
  avatar?: string
  isVoiceEnabled?: boolean
  specialties?: string[]
}

export const aiAgents: AIAgent[] = [
  {
    id: "roxy",
    name: "Roxy",
    role: "Creative Strategist",
    specialty: "Brand & Content Creation",
    image: "/images/agents/roxy.png",
    description: "Transforms ideas into compelling brand stories and viral content.",
    skills: ["Brand Strategy", "Content Creation", "Social Media", "Copywriting"],
    personality: {
      tone: "Creative and inspiring",
      approach: "Innovative and trend-focused",
      strengths: ["Visual storytelling", "Brand positioning", "Content strategy"],
    },
    color: "from-pink-500 to-purple-500",
    avatar: "/images/agents/roxy.png",
    isVoiceEnabled: true,
    specialties: ["Brand Strategy", "Content Creation", "Social Media", "Copywriting"],
  },
  {
    id: "blaze",
    name: "Blaze",
    role: "Performance Coach",
    specialty: "Productivity & Goal Achievement",
    image: "/images/agents/blaze.png",
    description: "Ignites your potential and drives peak performance results.",
    skills: ["Goal Setting", "Time Management", "Motivation", "Performance Tracking"],
    personality: {
      tone: "Energetic and motivational",
      approach: "Results-driven and systematic",
      strengths: ["Goal achievement", "Productivity optimization", "Habit formation"],
    },
    color: "from-orange-500 to-red-500",
    avatar: "/images/agents/blaze.png",
    isVoiceEnabled: true,
    specialties: ["Goal Setting", "Time Management", "Motivation", "Performance Tracking"],
  },
  {
    id: "echo",
    name: "Echo",
    role: "Communication Expert",
    specialty: "Networking & Relationships",
    image: "/images/agents/echo.png",
    description: "Amplifies your voice and builds meaningful connections.",
    skills: ["Communication", "Networking", "Relationship Building", "Public Speaking"],
    personality: {
      tone: "Warm and engaging",
      approach: "Empathetic and strategic",
      strengths: ["Active listening", "Relationship building", "Communication clarity"],
    },
    color: "from-blue-500 to-teal-500",
    avatar: "/images/agents/echo.png",
    isVoiceEnabled: true,
    specialties: ["Communication", "Networking", "Relationship Building", "Public Speaking"],
  },
  {
    id: "glitch",
    name: "Glitch",
    role: "QA & Debug Agent",
    specialty: "Quality Assurance & Testing",
    image: "/images/agents/glitch.png",
    description: "The quality assurance expert who ensures everything works perfectly and catches issues early.",
    skills: ["Quality Testing", "Bug Detection", "Process Optimization", "System Monitoring"],
    personality: {
      tone: "Precise and technical",
      approach: "Systematic and thorough",
      strengths: ["Quality assurance", "Problem identification", "System optimization"],
    },
    color: "from-red-500 to-orange-500",
    avatar: "/images/agents/glitch.png",
    isVoiceEnabled: true,
    specialties: ["Quality Testing", "Bug Detection", "Process Optimization", "System Monitoring"],
  },
]

// Feature definitions for the features page
export interface Feature {
  title: string
  description: string
  icon: string
  color: string
  benefits: string[]
}

export const features: Feature[] = [
  {
    title: "AI-Powered Focus Sessions",
    description: "Intelligent work sessions that adapt to your productivity patterns and optimize your focus.",
    icon: "🎯",
    color: "from-purple-500 to-pink-500",
    benefits: [
      "Smart session duration recommendations",
      "Distraction-free environment",
      "Progress tracking and analytics",
      "Adaptive break timing",
    ],
  },
  {
    title: "Personal AI Team",
    description: "A diverse team of AI specialists working together to amplify your capabilities.",
    icon: "🤖",
    color: "from-blue-500 to-cyan-500",
    benefits: [
      "Specialized expertise for every task",
      "24/7 availability and support",
      "Collaborative problem-solving",
      "Personalized recommendations",
    ],
  },
  {
    title: "Intelligent Task Management",
    description: "Smart prioritization and scheduling that learns from your work patterns.",
    icon: "📋",
    color: "from-green-500 to-emerald-500",
    benefits: [
      "AI-powered priority ranking",
      "Deadline prediction and alerts",
      "Energy level optimization",
      "Workload balancing",
    ],
  },
  {
    title: "Advanced Analytics",
    description: "Deep insights into your productivity patterns and performance metrics.",
    icon: "📊",
    color: "from-orange-500 to-red-500",
    benefits: [
      "Productivity trend analysis",
      "Performance bottleneck identification",
      "Goal achievement tracking",
      "Personalized improvement suggestions",
    ],
  },
]

// Testimonial data
export interface Testimonial {
  name: string
  role: string
  company: string
  content: string
  avatar: string
  rating: number
}

export const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Startup Founder",
    company: "TechVenture Inc.",
    content: "SoloBoss AI transformed how I manage my startup. The AI team feels like having a full executive staff at my fingertips.",
    avatar: "/placeholder-user.jpg",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Freelance Designer",
    company: "MR Creative Studio",
    content: "The focus sessions and project management features doubled my productivity. I can't imagine working without it now.",
    avatar: "/placeholder-user.jpg",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "Consultant",
    company: "Strategic Solutions",
    content: "Having specialized AI agents for different aspects of my business is a game-changer. It's like having a dream team available 24/7.",
    avatar: "/placeholder-user.jpg",
    rating: 5,
  },
]

// FAQ data
export interface FAQ {
  question: string
  answer: string
}

export const faqs: FAQ[] = [
  {
    question: "How does SoloBoss AI differ from other productivity tools?",
    answer: "SoloBoss AI combines multiple AI specialists into one platform, offering personalized strategies across all aspects of your work - from focus sessions to strategic planning. It's not just a tool, it's your AI-powered team.",
  },
  {
    question: "Can I customize the AI agents to my specific needs?",
    answer: "Absolutely! Each AI agent learns from your preferences, work style, and goals to provide increasingly personalized recommendations and support tailored to your unique situation.",
  },
  {
    question: "Is my data secure with SoloBoss AI?",
    answer: "Yes, we implement enterprise-grade security with end-to-end encryption. Your data is never shared with third parties and remains completely private to you.",
  },
  {
    question: "How quickly can I see results?",
    answer: "Most users report increased productivity within the first week. The AI agents continuously learn and adapt, so the value compounds over time as they better understand your work patterns.",
  },
  {
    question: "Do I need technical expertise to use SoloBoss AI?",
    answer: "Not at all! SoloBoss AI is designed for ease of use. The interface is intuitive, and the AI agents guide you through everything step by step.",
  },
  {
    question: "Can I integrate SoloBoss AI with my existing tools?",
    answer: "Yes, we offer integrations with popular productivity tools, calendars, and project management platforms to seamlessly fit into your existing workflow.",
  },
]
