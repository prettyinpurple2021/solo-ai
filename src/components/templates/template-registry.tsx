import { lazy} from 'react'
import { TemplateData} from './base-template'

// Template component type
export type TemplateComponent = React.ComponentType<any>

// Lazy load template components
// Advanced Multi-Step Templates
const DecisionDashboard = lazy(() => import('./decision-dashboard'))
const StrategicBusinessPlan = lazy(() => import('./strategic-business-plan'))
const EmailCampaignBuilder = lazy(() => import('./email-campaign-builder'))
const SocialMediaStrategy = lazy(() => import('./social-media-strategy'))
const CustomerJourneyMapper = lazy(() => import('./customer-journey-mapper'))
const ProjectTimeline = lazy(() => import('./project-timeline'))

// Existing SoloSuccess Templates (named exports -> wrap as default for React.lazy)
const VisionBoardGenerator = lazy(() => import('./vision-board-generator').then(m => ({ default: m.VisionBoardGenerator })))
const QuarterlyBizReview = lazy(() => import('./quarterly-biz-review').then(m => ({ default: m.QuarterlyBizReview })))
const DelegationListBuilder = lazy(() => import('./delegation-list-builder').then(m => ({ default: m.DelegationListBuilder })))
const IHateThisTracker = lazy(() => import('./i-hate-this-tracker').then(m => ({ default: m.IHateThisTracker })))
const FreebieFlowBuilder = lazy(() => import('./freebie-funnel-builder').then(m => ({ default: m.FreebieFunnelBuilder })))
const DMSalesScriptGenerator = lazy(() => import('./dm-sales-script-generator').then(m => ({ default: m.DmSalesScriptGenerator })))
const OfferComparisonMatrix = lazy(() => import('./offer-comparison-matrix').then(m => ({ default: m.OfferComparisonMatrix })))
const LiveLaunchTracker = lazy(() => import('./live-launch-tracker').then(m => ({ default: m.LiveLaunchTracker })))
const UpsellFlowBuilder = lazy(() => import('./upsell-flow-builder').then(m => ({ default: m.UpsellFlowBuilder })))
const PreMortemTemplate = lazy(() => import('./pre-mortem-template').then(m => ({ default: m.PreMortemTemplate })))
const ReverseEngineerRoleModels = lazy(() => import('./reverse-engineer-role-models').then(m => ({ default: m.ReverseEngineerRoleModels })))
const BigLeapPlanner = lazy(() => import('./big-leap-planner').then(m => ({ default: m.BigLeapPlanner })))
const OfferNamingGenerator = lazy(() => import('./offer-naming-generator').then(m => ({ default: m.OfferNamingGenerator })))
const FounderFeelingsTracker = lazy(() => import('./founder-feelings-tracker').then(m => ({ default: m.FounderFeelingsTracker })))
const BragBankTemplate = lazy(() => import('./brag-bank-template').then(m => ({ default: m.BragBankTemplate })))
const AICollabPlanner = lazy(() => import('./ai-collab-planner').then(m => ({ default: m.AiCollabPlanner })))
const PRPitchTemplate = lazy(() => import('./pr-pitch-template').then(m => ({ default: m.PrPitchTemplate })))
const ViralHookGenerator = lazy(() => import('./viral-hook-generator').then(m => ({ default: m.ViralHookGenerator })))
const ValuesAlignedBizFilter = lazy(() => import('./values-aligned-biz-filter').then(m => ({ default: m.ValuesAlignedBizFilter })))

// Template registry mapping slugs to components
export const templateRegistry: Record<string, TemplateComponent> = {
  // Advanced Multi-Step Business Templates
  'decision-dashboard': DecisionDashboard,
  'strategic-business-plan': StrategicBusinessPlan,
  'email-campaign-builder': EmailCampaignBuilder,
  'social-media-strategy': SocialMediaStrategy,
  'customer-journey-mapper': CustomerJourneyMapper,
  'project-timeline': ProjectTimeline,
  
  // Existing SoloSuccess Templates
  'vision-board-generator': VisionBoardGenerator,
  'quarterly-biz-review': QuarterlyBizReview,
  'delegation-list-builder': DelegationListBuilder,
  'i-hate-this-tracker': IHateThisTracker,
  'freebie-funnel-builder': FreebieFlowBuilder,
  'dm-sales-script-generator': DMSalesScriptGenerator,
  'offer-comparison-matrix': OfferComparisonMatrix,
  'live-launch-tracker': LiveLaunchTracker,
  'upsell-flow-builder': UpsellFlowBuilder,
  'pre-mortem-template': PreMortemTemplate,
  'reverse-engineer-role-models': ReverseEngineerRoleModels,
  'big-leap-planner': BigLeapPlanner,
  'offer-naming-generator': OfferNamingGenerator,
  'founder-feelings-tracker': FounderFeelingsTracker,
  'brag-bank-template': BragBankTemplate,
  'ai-collab-planner': AICollabPlanner,
  'pr-pitch-template': PRPitchTemplate,
  'viral-hook-generator': ViralHookGenerator,
  'values-aligned-biz-filter': ValuesAlignedBizFilter,
}

// Helper function to get template component
export function getTemplateComponent(slug: string): TemplateComponent | null {
  return templateRegistry[slug] || null
}

// Helper function to check if template exists
export function templateExists(slug: string): boolean {
  return slug in templateRegistry
}

// Get all available template slugs
export function getAllTemplateSlugs(): string[] {
  return Object.keys(templateRegistry)
}
