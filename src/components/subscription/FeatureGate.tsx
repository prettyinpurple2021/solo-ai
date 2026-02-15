import React from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { UpgradePrompt, Tier } from './UpgradePrompt';

export type FeatureKey = 
    | 'war-room'
    | 'competitor-stalker'
    | 'legal-tools'
    | 'advanced-incinerator'
    | 'unlimited-agents'
    | 'pro-agents'
    | 'elite-agents';

const FEATURE_REQUIREMENTS: Record<FeatureKey, Tier> = {
    'war-room': 'dominator',
    'competitor-stalker': 'dominator',
    'legal-tools': 'dominator',
    'advanced-incinerator': 'accelerator',
    'unlimited-agents': 'accelerator',
    'pro-agents': 'accelerator',
    'elite-agents': 'dominator'
};

const TIER_LEVELS: Record<Tier, number> = {
    'free': 0,
    'launchpad': 1,
    'accelerator': 2,
    'dominator': 3
};

interface FeatureGateProps {
    feature: FeatureKey;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
    const { subscription, isLoading } = useSubscription();

    if (isLoading) {
        // Show a simple loading state or nothing while checking
        return <div className="w-full h-32 flex items-center justify-center text-muted-foreground animate-pulse">Checking access rights...</div>;
    }

    const requiredTier = FEATURE_REQUIREMENTS[feature];
    const currentTier = subscription.plan;

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
