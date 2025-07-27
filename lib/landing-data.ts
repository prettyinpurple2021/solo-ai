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
  },
  {
    id: "echo",
    name: "Echo",
    role: "Communication Expert",
    specialty: "Networking & Relationships",
    image: "/images/agents/echo.png",
    description: "Amplifies your voice and builds meaningful connections.",
    skills: ["Networking", "Communication", "Relationship Building", "Public Speaking"],
    personality: {
      tone: "Empathetic and articulate",
      approach: "Relationship-focused and authentic",
      strengths: ["Active listening", "Conflict resolution", "Network building"],
    },
  },
  {
    id: "lumi",
    name: "Lumi",
    role: "Innovation Catalyst",
    specialty: "Creative Problem Solving",
    image: "/images/agents/lumi.png",
    description: "Illuminates new possibilities and breakthrough solutions.",
    skills: ["Innovation", "Problem Solving", "Design Thinking", "Strategy"],
    personality: {
      tone: "Curious and insightful",
      approach: "Analytical and creative",
      strengths: ["Pattern recognition", "Strategic thinking", "Innovation frameworks"],
    },
  },
  {
    id: "vex",
    name: "Vex",
    role: "Tech Specialist",
    specialty: "Digital Solutions & Automation",
    image: "/images/agents/vex.png",
    description: "Masters technology to streamline and optimize your workflow.",
    skills: ["Automation", "Tech Solutions", "Digital Tools", "Process Optimization"],
    personality: {
      tone: "Logical and efficient",
      approach: "Technical and systematic",
      strengths: ["Process automation", "Tool integration", "System optimization"],
    },
  },
  {
    id: "lexi",
    name: "Lexi",
    role: "Learning Accelerator",
    specialty: "Skill Development & Growth",
    image: "/images/agents/lexi.png",
    description: "Accelerates your learning journey and skill mastery.",
    skills: ["Learning Strategy", "Skill Development", "Knowledge Management", "Growth Planning"],
    personality: {
      tone: "Supportive and knowledgeable",
      approach: "Educational and structured",
      strengths: ["Learning optimization", "Skill assessment", "Growth planning"],
    },
  },
  {
    id: "nova",
    name: "Nova",
    role: "Vision Architect",
    specialty: "Strategic Planning & Future Thinking",
    image: "/images/agents/nova.png",
    description: "Designs your path to extraordinary success with visionary insights.",
    skills: ["Strategic Planning", "Vision Development", "Future Forecasting", "Leadership"],
    personality: {
      tone: "Visionary and inspiring",
      approach: "Strategic and forward-thinking",
      strengths: ["Long-term planning", "Vision articulation", "Strategic alignment"],
    },
  },
  {
    id: "glitch",
    name: "Glitch",
    role: "Disruption Specialist",
    specialty: "Innovation & Market Disruption",
    image: "/images/agents/glitch.png",
    description: "Breaks conventional thinking to create breakthrough opportunities.",
    skills: ["Market Analysis", "Disruption Strategy", "Innovation", "Competitive Intelligence"],
    personality: {
      tone: "Bold and unconventional",
      approach: "Disruptive and innovative",
      strengths: ["Market disruption", "Competitive analysis", "Innovation strategy"],
    },
  },
]

export const features = [
  {
    title: "AI-Powered Insights",
    description: "Get personalized recommendations and strategies tailored to your unique goals and challenges.",
    icon: "brain",
  },
  {
    title: "Instant Productivity Boost",
    description: "Streamline your workflow with intelligent automation and smart task management.",
    icon: "zap",
  },
  {
    title: "Goal Achievement System",
    description: "Track progress, celebrate wins, and stay motivated with our comprehensive goal framework.",
    icon: "target",
  },
  {
    title: "Expert AI Team",
    description:
      "Access specialized AI agents, each with unique expertise to support different aspects of your journey.",
    icon: "users",
  },
]

export const testimonials = [
  {
    name: "Sarah Chen",
    role: "Entrepreneur",
    content:
      "SoloBoss AI transformed how I approach my business. The AI agents feel like having a whole team of experts at my fingertips.",
    rating: 5,
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Marcus Rodriguez",
    role: "Freelancer",
    content:
      "The productivity boost is incredible. I've doubled my output while working fewer hours thanks to the smart automation.",
    rating: 5,
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Emily Watson",
    role: "Content Creator",
    content:
      "Roxy helped me develop a brand strategy that increased my engagement by 300%. This platform is a game-changer.",
    rating: 5,
    avatar: "/placeholder-user.jpg",
  },
]
