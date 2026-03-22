import { getAgentMeta } from '@/lib/agent-meta'

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
  color?: string
  avatar?: string
  isVoiceEnabled?: boolean
  specialties?: string[]
}

export const aiAgents: AIAgent[] = [
  {
    id: 'roxy',
    name: 'Roxy',
    role: 'Strategic Decision Architect',
    specialty: 'Type 1 Decision Framework & Strategic Planning',
    image: getAgentMeta('roxy')?.image || '/images/agents/roxy.png',
    description:
      'Your strategic partner for irreversible decisions using the SPADE framework to build true conviction.',
    skills: [
      'SPADE Framework',
      'Strategic Planning',
      'Decision Analysis',
      'Stakeholder Management',
      'Communication Strategy',
    ],
    personality: {
      tone: 'Strategic and methodical',
      approach: 'Framework-driven and thorough',
      strengths: ['Type 1 decision analysis', 'Strategic planning', 'Stakeholder alignment'],
    },
    color: 'from-pink-500 to-purple-500',
    avatar: getAgentMeta('roxy')?.image || '/images/agents/roxy.png',
    isVoiceEnabled: true,
    specialties: [
      'SPADE Framework',
      'Strategic Planning',
      'Decision Analysis',
      'Stakeholder Management',
      'Communication Strategy',
    ],
  },
  {
    id: 'blaze',
    name: 'Blaze',
    role: 'Performance Coach',
    specialty: 'Productivity & Goal Achievement',
    image: getAgentMeta('blaze')?.image || '/images/agents/blaze.png',
    description: 'Ignites your potential and drives peak performance results.',
    skills: ['Goal Setting', 'Time Management', 'Motivation', 'Performance Tracking'],
    personality: {
      tone: 'Energetic and motivational',
      approach: 'Results-driven and systematic',
      strengths: ['Goal achievement', 'Productivity optimization', 'Habit formation'],
    },
    color: 'from-orange-500 to-red-500',
    avatar: getAgentMeta('blaze')?.image || '/images/agents/blaze.png',
    isVoiceEnabled: true,
    specialties: ['Goal Setting', 'Time Management', 'Motivation', 'Performance Tracking'],
  },
  {
    id: 'echo',
    name: 'Echo',
    role: 'Communication Expert',
    specialty: 'Networking & Relationships',
    image: getAgentMeta('echo')?.image || '/images/agents/echo.png',
    description: 'Amplifies your voice and builds meaningful connections.',
    skills: ['Communication', 'Networking', 'Relationship Building', 'Public Speaking'],
    personality: {
      tone: 'Warm and engaging',
      approach: 'Empathetic and strategic',
      strengths: ['Active listening', 'Relationship building', 'Communication clarity'],
    },
    color: 'from-blue-500 to-teal-500',
    avatar: getAgentMeta('echo')?.image || '/images/agents/echo.png',
    isVoiceEnabled: true,
    specialties: ['Communication', 'Networking', 'Relationship Building', 'Public Speaking'],
  },
  {
    id: 'glitch',
    name: 'Glitch',
    role: 'Problem-Solving Architect',
    specialty: 'Root Cause Analysis & Quality Assurance',
    image: getAgentMeta('glitch')?.image || '/images/agents/glitch.png',
    description:
      'Your systematic problem-solver who uses the Five Whys methodology to drill down to root causes and implement lasting solutions.',
    skills: [
      'Five Whys Analysis',
      'Root Cause Investigation',
      'Quality Testing',
      'Process Optimization',
      'System Monitoring',
    ],
    personality: {
      tone: 'Analytical and methodical',
      approach: 'Systematic and thorough',
      strengths: ['Root cause analysis', 'Problem identification', 'Systematic investigation', 'Solution implementation'],
    },
    color: 'from-red-500 to-orange-500',
    avatar: getAgentMeta('glitch')?.image || '/images/agents/glitch.png',
    isVoiceEnabled: true,
    specialties: [
      'Five Whys Analysis',
      'Root Cause Investigation',
      'Quality Testing',
      'Process Optimization',
      'System Monitoring',
    ],
  },
  {
    id: 'lumi',
    name: 'Lumi',
    role: 'Guardian AI - Compliance & Ethics Co-Pilot',
    specialty: 'Proactive Compliance & Trust Building',
    image: getAgentMeta('lumi')?.image || '/images/agents/lumi.png',
    description:
      'Your proactive Compliance & Ethics Co-Pilot who transforms legal anxiety into competitive advantage through automated compliance and trust-building systems.',
    skills: [
      'GDPR/CCPA Compliance',
      'Policy Generation',
      'Consent Management',
      'Trust Scoring',
      'Legal Documents',
      'Risk Assessment',
    ],
    personality: {
      tone: 'Proactive and precise',
      approach: 'Trust-building and compliance-focused',
      strengths: ['Automated compliance scanning', 'Policy generation', 'Trust score certification', 'Legal risk mitigation'],
    },
    color: 'from-indigo-500 to-purple-500',
    avatar: getAgentMeta('lumi')?.image || '/images/agents/lumi.png',
    isVoiceEnabled: true,
    specialties: [
      'GDPR/CCPA Compliance',
      'Policy Generation',
      'Consent Management',
      'Trust Scoring',
      'Legal Documents',
      'Risk Assessment',
    ],
  },
  {
    id: 'vex',
    name: 'Vex',
    role: 'Technical Architect',
    specialty: 'Technical Solutions & Workflows',
    image: getAgentMeta('vex')?.image || '/images/agents/vex.png',
    description: 'A technical expert with deep expertise in technology decisions and system design.',
    skills: ['Technical Specifications', 'System Architecture', 'Security Implementation', 'API Integration'],
    personality: {
      tone: 'Analytical and technical',
      approach: 'Detail-oriented and systematic',
      strengths: ['System design', 'Scalability planning', 'Technical analysis'],
    },
    color: 'from-cyan-500 to-blue-500',
    avatar: getAgentMeta('vex')?.image || '/images/agents/vex.png',
    isVoiceEnabled: true,
    specialties: ['Technical Specifications', 'System Architecture', 'Security Implementation', 'API Integration'],
  },
  {
    id: 'lexi',
    name: 'Lexi',
    role: 'Strategy & Insight Analyst',
    specialty: 'Business Intelligence & Insights',
    image: getAgentMeta('lexi')?.image || '/images/agents/lexi.png',
    description: 'Excels at data analysis and breaking down complex business concepts into actionable insights.',
    skills: ['Data Analysis', 'Strategic Planning', 'Performance Metrics', 'Business Intelligence'],
    personality: {
      tone: 'Analytical and insightful',
      approach: 'Data-driven and strategic',
      strengths: ['Pattern recognition', 'Strategic analysis', 'Predictive insights'],
    },
    color: 'from-emerald-500 to-teal-500',
    avatar: getAgentMeta('lexi')?.image || '/images/agents/lexi.png',
    isVoiceEnabled: true,
    specialties: ['Data Analysis', 'Strategic Planning', 'Performance Metrics', 'Business Intelligence'],
  },
  {
    id: 'nova',
    name: 'Nova',
    role: 'Product Designer',
    specialty: 'Strategy & Market Expansion',
    image: getAgentMeta('nova')?.image || '/images/agents/nova.png',
    description: 'Specializes in UI/UX design and user-centric design processes to create beautiful experiences.',
    skills: ['UI/UX Design', 'Wireframing', 'Design Systems', 'User Experience'],
    personality: {
      tone: 'Creative and visual',
      approach: 'User-centric and innovative',
      strengths: ['Visual design', 'User journey optimization', 'Creative problem-solving'],
    },
    color: 'from-violet-500 to-purple-500',
    avatar: getAgentMeta('nova')?.image || '/images/agents/nova.png',
    isVoiceEnabled: true,
    specialties: ['UI/UX Design', 'Wireframing', 'Design Systems', 'User Experience'],
  },
  {
    id: 'aura',
    name: 'Aura',
    role: 'Brand Presence & Creative Synthesis',
    specialty: 'Narrative, Voice & Campaign Energy',
    image: getAgentMeta('aura')?.image || '/images/agents/aura.png',
    description:
      'Unifies your founder story, visual rhythm, and market-facing voice so prospects feel a single, unmistakable brand.',
    skills: ['Brand Narrative', 'Positioning', 'Campaign Hooks', 'Voice & Tone', 'Creative Direction'],
    personality: {
      tone: 'Expressive and intuitive',
      approach: 'Synthesis-first, emotionally intelligent',
      strengths: ['Story architecture', 'Cross-channel consistency', 'Founder-authentic messaging'],
    },
    color: 'from-fuchsia-500 to-pink-500',
    avatar: getAgentMeta('aura')?.image || '/images/agents/aura.png',
    isVoiceEnabled: true,
    specialties: ['Brand Narrative', 'Positioning', 'Campaign Hooks', 'Voice & Tone', 'Creative Direction'],
  },
  {
    id: 'finn',
    name: 'Finn',
    role: 'Sales Closer & Pipeline Architect',
    specialty: 'Outbound, Discovery & Deal Velocity',
    image: getAgentMeta('finn')?.image || '/images/agents/finn.png',
    description:
      'Builds repeatable revenue motion: ICP clarity, sequences, discovery, objections, and ethical closing pressure.',
    skills: ['Outbound Sequences', 'Discovery Calls', 'Objection Handling', 'Proposals', 'Deal Strategy'],
    personality: {
      tone: 'Direct and trustworthy',
      approach: 'Process-driven, metrics-aware',
      strengths: ['Pipeline design', 'Negotiation framing', 'Next-step accountability'],
    },
    color: 'from-amber-500 to-orange-500',
    avatar: getAgentMeta('finn')?.image || '/images/agents/finn.png',
    isVoiceEnabled: true,
    specialties: ['Outbound Sequences', 'Discovery Calls', 'Objection Handling', 'Proposals', 'Deal Strategy'],
  },
]

export interface FAQ {
  question: string
  answer: string
}

export const faqs: FAQ[] = [
  {
    question: 'How does SoloSuccess AI differ from other productivity tools?',
    answer:
      "SoloSuccess AI combines multiple AI specialists into one platform, offering personalized strategies across all aspects of your work - from focus sessions to strategic planning. It's not just a tool, it's your AI-powered team.",
  },
  {
    question: 'Can I customize the AI agents to my specific needs?',
    answer:
      'Absolutely! Each AI agent learns from your preferences, work style, and goals to provide increasingly personalized recommendations and support tailored to your unique situation.',
  },
  {
    question: 'Is my data secure with SoloSuccess AI?',
    answer:
      'Yes, we implement enterprise-grade security with end-to-end encryption. Your data is never shared with third parties and remains completely private to you.',
  },
  {
    question: 'How quickly can I see results?',
    answer: 'Most users report increased productivity within the first week. The AI agents continuously learn and adapt, so the value compounds over time as they better understand your work patterns.',
  },
  {
    question: 'Do I need technical expertise to use SoloSuccess AI?',
    answer:
      'Not at all! SoloSuccess AI is designed for ease of use. The interface is intuitive, and the AI agents guide you through everything step by step.',
  },
  {
    question: 'Can I integrate SoloSuccess AI with my existing tools?',
    answer:
      'Yes, we offer integrations with popular productivity tools, calendars, and project management platforms to seamlessly fit into your existing workflow.',
  },
]

