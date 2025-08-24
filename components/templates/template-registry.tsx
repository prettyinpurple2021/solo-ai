import { lazy } from 'react'
import { TemplateData } from './base-template'

// Template component type
export type TemplateComponent = React.ComponentType<{
  template: TemplateData
  onSave?: (data: any) => Promise<void>
  onExport?: (format: 'json' | 'pdf' | 'csv') => void
}>

// Lazy load template components
// Advanced Multi-Step Templates
const DecisionDashboard = lazy(() => import('./decision-dashboard'))
const StrategicBusinessPlan = lazy(() => import('./strategic-business-plan'))
const EmailCampaignBuilder = lazy(() => import('./email-campaign-builder'))
const SocialMediaStrategy = lazy(() => import('./social-media-strategy'))
const CustomerJourneyMapper = lazy(() => import('./customer-journey-mapper'))
const ProjectTimeline = lazy(() => import('./project-timeline'))

// Existing SoloBoss Templates
const VisionBoardGenerator = lazy(() => import('./vision-board-generator'))
const QuarterlyBizReview = lazy(() => import('./quarterly-biz-review'))
const DelegationListBuilder = lazy(() => import('./delegation-list-builder'))
const IHateThisTracker = lazy(() => import('./i-hate-this-tracker'))
const FreebieFlowBuilder = lazy(() => import('./freebie-funnel-builder'))
const DMSalesScriptGenerator = lazy(() => import('./dm-sales-script-generator'))
const OfferComparisonMatrix = lazy(() => import('./offer-comparison-matrix'))
const LiveLaunchTracker = lazy(() => import('./live-launch-tracker'))
const UpsellFlowBuilder = lazy(() => import('./upsell-flow-builder'))
const PreMortemTemplate = lazy(() => import('./pre-mortem-template'))
const ReverseEngineerRoleModels = lazy(() => import('./reverse-engineer-role-models'))
const BigLeapPlanner = lazy(() => import('./big-leap-planner'))
const OfferNamingGenerator = lazy(() => import('./offer-naming-generator'))
const FounderFeelingsTracker = lazy(() => import('./founder-feelings-tracker'))
const BragBankTemplate = lazy(() => import('./brag-bank-template'))
const AICollabPlanner = lazy(() => import('./ai-collab-planner'))
const PRPitchTemplate = lazy(() => import('./pr-pitch-template'))
const ViralHookGenerator = lazy(() => import('./viral-hook-generator'))
const ValuesAlignedBizFilter = lazy(() => import('./values-aligned-biz-filter'))

// Template registry mapping slugs to components
export const templateRegistry: Record<string, TemplateComponent> = {
  // Advanced Multi-Step Business Templates
  'decision-dashboard': DecisionDashboard,
  'strategic-business-plan': StrategicBusinessPlan,
  'email-campaign-builder': EmailCampaignBuilder,
  'social-media-strategy': SocialMediaStrategy,
  'customer-journey-mapper': CustomerJourneyMapper,
  'project-timeline': ProjectTimeline,
  
  // Existing SoloBoss Templates
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
