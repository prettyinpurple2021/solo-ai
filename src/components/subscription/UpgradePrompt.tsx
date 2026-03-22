import React from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { Rocket, Shield, Zap, Lock, Terminal as TerminalIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CyberButton } from '@/components/cyber/CyberButton';
import { HudBorder } from '@/components/cyber/HudBorder';

export type Tier = 'launch' | 'accelerator' | 'dominator';

interface UpgradePromptProps {
    requiredTier: Tier;
    featureName: string;
    className?: string;
}

const TIER_DETAILS: Record<Tier, { name: string; icon: any; color: string; benefits: string[] }> = {
    launch: { 
        name: 'Launch', 
        icon: Rocket, 
        color: 'text-neon-cyan',
        benefits: ['100 Conversations/day', 'Aurara AI Agent', '50MB Storage']
    },
    accelerator: { 
        name: 'Accelerator', 
        icon: Zap, 
        color: 'text-neon-purple',
        benefits: ['Unlimited Conversations', '10 AI Agents', 'Advanced Incinerator', '1GB Storage']
    },
    dominator: { 
        name: 'Dominator', 
        icon: Shield, 
        color: 'text-neon-magenta',
        benefits: ['Unlimited Everything', 'War Room Access', 'Competitor Stalker', 'Legal Tools', '100GB Storage']
    }
};

export function UpgradePrompt({ requiredTier, featureName, className }: UpgradePromptProps) {
    const { upgradePlan, isLoading } = useSubscription();
    const tier = TIER_DETAILS[requiredTier];

    if (!tier) return null;

    const handleUpgrade = () => {
        upgradePlan(requiredTier as any);
    };

    return (
        <HudBorder className={cn("w-full max-w-md mx-auto bg-dark-card/80 backdrop-blur-sm", className)}>
            <div className="text-center p-8 space-y-6">
                <div className="flex justify-center">
                    <div className="p-4 bg-dark-bg border border-neon-cyan/20 rounded-none relative group">
                        <div className="absolute inset-0 bg-neon-cyan/5 blur-lg group-hover:bg-neon-cyan/10 transition-all" />
                        <Lock className="w-8 h-8 text-neon-cyan relative z-10" />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-orbitron font-bold text-white uppercase tracking-tight">
                        Unlock {featureName}
                    </h2>
                    <p className="text-sm text-gray-400 font-mono">
                        This module requires <span className={cn("font-bold uppercase", tier.color)}>{tier.name}</span> authorization.
                    </p>
                </div>

                <div className="space-y-4 py-4 border-y border-white/5">
                    <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-[0.2em]">
                        Tier Benefits
                    </p>
                    <ul className="space-y-3 text-left">
                        {tier.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm font-mono text-gray-300">
                                <tier.icon className={cn("w-4 h-4 shrink-0", tier.color)} />
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <CyberButton 
                    onClick={handleUpgrade} 
                    className="w-full font-orbitron font-bold uppercase" 
                    variant={requiredTier === 'dominator' ? 'magenta' : 'purple'}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : `Upgrade to ${tier.name}`}
                </CyberButton>
                
                <p className="text-[9px] text-gray-600 font-mono uppercase tracking-widest animate-pulse">
                    Secure Connection Established // Tier Check Required
                </p>
            </div>
        </HudBorder>
    );
}
