import { useState } from 'react';
import { MarketingLayout } from './layout/MarketingLayout';
import { Check, Loader2 } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { Button } from '@/components/ui/button';
import { logError } from '@/lib/logger';

export function PricingPage() {
    const user = null; // useUser();
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const handleUpgrade = async (tier: string, priceId: string) => {
        if (!user) {
            // Redirect to login if not logged in
            window.location.href = '/sign-in';
            return;
        }

        if (!priceId) {
            logError('Price ID missing for tier:', tier);
            return;
        }

        try {
            setLoadingTier(tier);
            const response = await apiService.post('/stripe/create-checkout-session', {
                priceId,
                userId: user.id
            });

            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            logError('Upgrade failed:', error);
            alert('Failed to start checkout. Please try again.');
        } finally {
            setLoadingTier(null);
        }
    };

    const PRICE_IDS = {
        solo: process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID,
        pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        agency: process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID,
    };

    return (
        <MarketingLayout>
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 text-white uppercase tracking-wider">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-400 font-mono">
                        Start for free, upgrade as you scale. No hidden fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {/* Free Plan */}
                    <PricingCard
                        title="Free"
                        price="$0"
                        description="For the curious explorer."
                        features={[
                            "1 Business Profile",
                            "5 Saved Items (Storage)",
                            "Limited AI Credits",
                            "View-Only Advanced Tools",
                            "Community Support"
                        ]}
                        buttonText="Current Plan"
                        disabled
                        variant="ghost"
                    />

                    {/* Solo Plan */}
                    <PricingCard
                        title="Solo"
                        price="$29"
                        period="/month"
                        description="For the side-hustler."
                        isPopular
                        features={[
                            "1 Business Profile",
                            "50 Saved Items",
                            "Unlimited AI Text",
                            "5 Competitors Tracked",
                            "50 Research Credits",
                            "Full Tool Access"
                        ]}
                        onUpgrade={() => handleUpgrade('solo', PRICE_IDS.solo)}
                        isLoading={loadingTier === 'solo'}
                        variant="lime"
                    />

                    {/* Pro Plan */}
                    <PricingCard
                        title="Pro"
                        price="$49"
                        period="/month"
                        description="For the full-time founder."
                        features={[
                            "3 Business Profiles",
                            "Unlimited Storage",
                            "Unlimited AI Text",
                            "15 Competitors Tracked",
                            "200 Research Credits",
                            "Priority Support"
                        ]}
                        onUpgrade={() => handleUpgrade('pro', PRICE_IDS.pro)}
                        isLoading={loadingTier === 'pro'}
                        variant="purple"
                    />

                    {/* Agency Plan */}
                    <PricingCard
                        title="Agency"
                        price="$99"
                        period="/month"
                        description="For power users & teams."
                        features={[
                            "Unlimited Businesses",
                            "Unlimited Storage",
                            "Unlimited Everything",
                            "50 Competitors Tracked",
                            "1000 Research Credits",
                            "API Access"
                        ]}
                        onUpgrade={() => handleUpgrade('agency', PRICE_IDS.agency)}
                        isLoading={loadingTier === 'agency'}
                        variant="cyan"
                    />
                </div>
            </div>
        </MarketingLayout>
    );
}

function PricingCard({ title, price, period, description, features, isPopular, onUpgrade, isLoading, disabled, buttonText, variant = 'cyan' }: {
    title: string,
    price: string,
    period?: string,
    description: string,
    features: string[],
    isPopular?: boolean,
    onUpgrade?: () => void,
    isLoading?: boolean,
    disabled?: boolean,
    buttonText?: string,
    variant?: 'cyan' | 'lime' | 'purple' | 'magenta' | 'orange' | 'ghost'
}) {
    const borderColor = {
        cyan: 'border-neon-cyan',
        lime: 'border-neon-lime',
        purple: 'border-neon-purple',
        magenta: 'border-neon-magenta',
        orange: 'border-neon-orange',
        ghost: 'border-gray-700'
    }[variant];

    const shadowColor = {
        cyan: 'shadow-neon-cyan/20',
        lime: 'shadow-neon-lime/20',
        purple: 'shadow-neon-purple/20',
        magenta: 'shadow-neon-magenta/20',
        orange: 'shadow-neon-orange/20',
        ghost: 'shadow-none'
    }[variant];

    const textColor = {
        cyan: 'text-neon-cyan',
        lime: 'text-neon-lime',
        purple: 'text-neon-purple',
        magenta: 'text-neon-magenta',
        orange: 'text-neon-orange',
        ghost: 'text-white'
    }[variant];

    return (
        <div className={`relative p-6 rounded-sm border ${borderColor} flex flex-col bg-dark-card backdrop-blur-xl ${isPopular ? `shadow-[0_0_20px_rgba(57,255,20,0.15)]` : ''} transition-all duration-300 hover:scale-[1.01]`}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-neon-lime text-black text-xs font-bold font-mono rounded-sm uppercase tracking-wide shadow-[0_0_10px_rgba(57,255,20,0.4)]">
                    Most Popular
                </div>
            )}

            <div className="mb-6">
                <h3 className={`text-xl font-bold font-orbitron uppercase tracking-wider mb-2 ${textColor}`}>{title}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-white font-mono">{price}</span>
                    {period && <span className="text-gray-400 text-sm font-mono">{period}</span>}
                </div>
                <p className="text-gray-400 text-sm h-10 font-mono">{description}</p>
            </div>

            <div className="space-y-3 mb-8 flex-1">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 p-0.5 rounded-sm ${isPopular ? 'bg-neon-lime/10 text-neon-lime' : 'bg-dark-bg text-gray-400'}`}>
                            <Check className="w-3 h-3" />
                        </div>
                        <span className="text-gray-300 text-sm leading-tight font-mono">{feature}</span>
                    </div>
                ))}
            </div>

            <Button
                onClick={onUpgrade}
                disabled={disabled || isLoading}
                variant={variant as any}
                className={`w-full font-bold text-sm ${disabled ? 'opacity-50' : ''}`}
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (buttonText || `Choose ${title}`)}
            </Button>
        </div>
    );
}


