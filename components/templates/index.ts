export { DecisionDashboard } from './decision-dashboard';
export { DelegationListBuilder } from './delegation-list-builder';
export { DmSalesScriptGenerator } from './dm-sales-script-generator';
export { FreebieFunnelBuilder } from './freebie-funnel-builder';
export { IHateThisTracker } from './i-hate-this-tracker';
export { LiveLaunchTracker } from './live-launch-tracker';
export { OfferComparisonMatrix } from './offer-comparison-matrix';
export { QuarterlyBizReview } from './quarterly-biz-review';
export { UpsellFlowBuilder } from './upsell-flow-builder';
export { VisionBoardGenerator } from './vision-board-generator';

// Thinking & Planning Tools
export { PreMortemTemplate } from './pre-mortem-template';
export { ReverseEngineerRoleModels } from './reverse-engineer-role-models';
export { BigLeapPlanner } from './big-leap-planner';
export { OfferNamingGenerator } from './offer-naming-generator';
export { BragBankTemplate } from './brag-bank-template';
export { FounderFeelingsTracker } from './founder-feelings-tracker';
export { ViralHookGenerator } from './viral-hook-generator';
export { ValuesAlignedBizFilter } from './values-aligned-biz-filter';
export { AiCollabPlanner } from './ai-collab-planner';
export { PrPitchTemplate } from './pr-pitch-template';

// Import components for slug-based mapping
import { DecisionDashboard } from './decision-dashboard';
import { DelegationListBuilder } from './delegation-list-builder';
import { DmSalesScriptGenerator } from './dm-sales-script-generator';
import { FreebieFunnelBuilder } from './freebie-funnel-builder';
import { IHateThisTracker } from './i-hate-this-tracker';
import { LiveLaunchTracker } from './live-launch-tracker';
import { OfferComparisonMatrix } from './offer-comparison-matrix';
import { QuarterlyBizReview } from './quarterly-biz-review';
import { UpsellFlowBuilder } from './upsell-flow-builder';
import { VisionBoardGenerator } from './vision-board-generator';
import { PreMortemTemplate } from './pre-mortem-template';
import { ReverseEngineerRoleModels } from './reverse-engineer-role-models';
import { BigLeapPlanner } from './big-leap-planner';
import { OfferNamingGenerator } from './offer-naming-generator';
import { BragBankTemplate } from './brag-bank-template';
import { FounderFeelingsTracker } from './founder-feelings-tracker';
import { ViralHookGenerator } from './viral-hook-generator';
import { ValuesAlignedBizFilter } from './values-aligned-biz-filter';
import { AiCollabPlanner } from './ai-collab-planner';
import { PrPitchTemplate } from './pr-pitch-template';

// Slug-based mapping for dynamic component loading
export const templateComponents: Record<string, React.ComponentType> = {
  'decision-dashboard': DecisionDashboard,
  'delegation-list-builder': DelegationListBuilder,
  'dm-sales-script-generator': DmSalesScriptGenerator,
  'freebie-funnel-builder': FreebieFunnelBuilder,
  'i-hate-this-tracker': IHateThisTracker,
  'live-launch-tracker': LiveLaunchTracker,
  'offer-comparison-matrix': OfferComparisonMatrix,
  'quarterly-biz-review': QuarterlyBizReview,
  'upsell-flow-builder': UpsellFlowBuilder,
  'vision-board-generator': VisionBoardGenerator,
  'pre-mortem-template': PreMortemTemplate,
  'reverse-engineer-role-models': ReverseEngineerRoleModels,
  'big-leap-planner': BigLeapPlanner,
  'offer-naming-generator': OfferNamingGenerator,
  'brag-bank-template': BragBankTemplate,
  'founder-feelings-tracker': FounderFeelingsTracker,
  'viral-hook-generator': ViralHookGenerator,
  'values-aligned-biz-filter': ValuesAlignedBizFilter,
  'ai-collab-planner': AiCollabPlanner,
  'pr-pitch-template': PrPitchTemplate,
};