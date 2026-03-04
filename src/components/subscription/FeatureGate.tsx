import React from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { UpgradePrompt } from './UpgradePrompt';

export type Tier = 'launch' | 'accelerator' | 'dominator';

export type FeatureKey = 
    | 'war-room'
    | 'competitor-stalker'
    | 'legal-tools'
    | 'advanced-incinerator'
    | 'multi-agent-collaboration'
    | 'strategy-nexus'
    | 'unlimited-agents'
    | 'pro-agents'
    | 'elite-agents'
    | 'custom-agent-builder';

const FEATURE_REQUIREMENTS: Record<FeatureKey, Tier> = {
    'war-room': 'dominator',
    'competitor-stalker': 'accelerator',
    'legal-tools': 'dominator',
    'advanced-incinerator': 'accelerator',
    'multi-agent-collaboration': 'dominator',
    'strategy-nexus': 'dominator',
    'unlimited-agents': 'accelerator',
    'pro-agents': 'accelerator',
    'elite-agents': 'dominator',
    'custom-agent-builder': 'accelerator'
};

const TIER_LEVELS: Record<Tier, number> = {
    'launch': 0,
    'accelerator': 1,
    'dominator': 2
};

interface FeatureGateProps {
    feature: FeatureKey;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
    const { subscription, isLoading } = useSubscription();

    if (isLoading) {
        return <div className="w-full h-32 flex items-center justify-center text-muted-foreground animate-pulse font-mono">Verifying authentication...</div>;
    }

    const requiredTier = FEATURE_REQUIREMENTS[feature];
    const currentTier = (subscription?.plan || 'launch') as Tier;

    const currentLevel = TIER_LEVELS[currentTier] || 0;
    const requiredLevel = TIER_LEVELS[requiredTier] || 0;

    if (currentLevel >= requiredLevel) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className="w-full py-12 flex justify-center items-center p-4">
            <UpgradePrompt 
                requiredTier={requiredTier} 
                featureName={formatFeatureName(feature)} 
            />
        </div>
    );
}

function formatFeatureName(key: string): string {
    return key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
