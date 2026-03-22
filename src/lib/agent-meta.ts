// Centralized agent metadata loader — provides agent metadata with fallbacks.
// Components may import this module to get canonical per-agent metadata (image path, alt text).
// Keep the exports minimal: `AgentMeta`, `agentMetaMap`, and `getAgentMeta(id)`.

export interface AgentMeta {
  image: string
  alt?: string
  sizes?: Record<string, any>
}

// Fallback metadata for agents - optimized images in /public/images/optimized/agents/
// Used when dynamic loading fails or agent is not found in meta.json files
// This is client-safe and works in both server and client components
const fallbackAgentMeta: Record<string, AgentMeta> = {
  roxy: {
    image: '/images/optimized/agents/roxy.jpg',
    alt: 'Roxy - Executive Assistant & Strategic Planner',
  },
  blaze: {
    image: '/images/optimized/agents/blaze.jpg',
    alt: 'Blaze - Growth & Sales Strategist',
  },
  echo: {
    image: '/images/optimized/agents/echo.jpg',
    alt: 'Echo - Marketing & Brand Strategist',
  },
  glitch: {
    image: '/images/optimized/agents/glitch.jpg',
    alt: 'Glitch - Tech & Systems Architect',
  },
  lumi: {
    image: '/images/optimized/agents/lumi.jpg',
    alt: 'Lumi - Compliance & Legal Guardian',
  },
  vex: {
    image: '/images/optimized/agents/vex.jpg',
    alt: 'Vex - Technical Development Lead',
  },
  lexi: {
    image: '/images/optimized/agents/lexi.jpg',
    alt: 'Lexi - Analytics & Insights Specialist',
  },
  nova: {
    image: '/images/optimized/agents/nova.jpg',
    alt: 'Nova - Product Innovation Strategist',
  },
  aurara: {
    image: '/images/optimized/agents/echo.jpg',
    alt: 'Aurara - Brand Presence & Creative Synthesis',
  },
  ace: {
    image: '/images/optimized/agents/blaze.jpg',
    alt: 'Ace - Sales Closer & Pipeline Architect',
  },
}

// Load agent metadata dynamically from public/agents directory.
// This works at build time and runtime, avoiding static import issues.
// Only runs on server-side to avoid fs module issues in client bundles
function loadAgentMetaMap(): Record<string, AgentMeta> {
  // To ensure zero warnings on serverless/edge builds, we avoid any use
  // of Node core modules like `fs` during bundling. Rely on fallbacks.
  return {}
}

// Load dynamic metadata and merge with fallback
// Dynamic loading takes precedence, fallback is used for missing agents
// For client-side, this will only use fallbacks
const loadedMeta = typeof window === 'undefined' ? loadAgentMetaMap() : {}
export const agentMetaMap: Record<string, AgentMeta> = {
  ...fallbackAgentMeta,
  ...loadedMeta,
}

export function getAgentMeta(agentId: string): AgentMeta | null {
  return agentMetaMap[agentId] ?? null
}

export function getAgentImage(agentId: string): string {
  const meta = getAgentMeta(agentId)
  if (meta?.image) return meta.image
  // Fallback to legacy images directory pattern
  return `/images/agents/${agentId}.png`
}

export default agentMetaMap
