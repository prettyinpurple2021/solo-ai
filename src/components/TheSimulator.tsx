
import React, { useState } from 'react';
import { Spline, GitBranch, AlertTriangle, ThumbsUp, Activity, Loader2, Crosshair } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { SimulationResult, ScenarioOutcome } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';

export const TheSimulator: React.FC = () => {
    const [scenario, setScenario] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);

    const handleSimulate = async () => {
        if (!scenario.trim()) return;
        setLoading(true);
        setResult(null);
        soundService.playClick();

        const sim = await geminiService.runSimulation(scenario);
        if (sim) {
            setResult(sim);

            // Save to Vault
            await storageService.saveSimulation(sim);

            const { leveledUp } = await addXP(80);
            showToast("SIMULATION COMPLETE", "Timeline branches projected.", "xp", 80);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        } else {
            showToast("SIMULATION FAILED", "Could not project timelines.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    const TimelineCard = ({ outcome, type }: { outcome: ScenarioOutcome, type: 'likely' | 'best' | 'worst' }) => {
        const colors =
            type === 'best' ? 'border-neon-lime/50 bg-neon-lime/10 text-neon-lime' :
                type === 'worst' ? 'border-neon-magenta/50 bg-neon-magenta/10 text-neon-magenta' :
                    'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan';

        const Icon =
            type === 'best' ? ThumbsUp :
                type === 'worst' ? AlertTriangle :
                    Activity;

        return (
            <div className={`border-2 rounded-sm p-6 flex flex-col h-full transition-all hover:bg-dark-hover ${colors}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 font-mono font-bold uppercase tracking-widest text-xs">
                        <Icon size={14} /> {type} Case
                    </div>
                    <div className="text-2xl font-mono font-bold">{outcome.probability}%</div>
                </div>

                <h3 className="font-orbitron text-lg font-bold uppercase tracking-wider text-white mb-2">{outcome.title}</h3>
                <p className="text-sm text-gray-300 font-mono mb-4 flex-1">{outcome.description}</p>

                <div className="space-y-3 border-t-2 border-gray-700 pt-4">
                    <div className="text-[10px] font-mono uppercase text-gray-500">Timeline: {outcome.timeline}</div>
                    {outcome.keyEvents.map((event, i) => (
                        <div key={i} className="flex gap-3 items-start text-xs">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-50"></div>
                            <span className="text-gray-300 font-mono">{event}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b-2 border-gray-700 pb-6 gap-4 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 text-neon-purple font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <GitBranch size={14} /> Predictive Modeling
                    </div>
                    <h2 className="font-orbitron text-3xl md:text-4xl font-bold uppercase tracking-wider text-white">THE SIMULATOR</h2>
                    <p className="text-gray-400 font-mono mt-2">Analyze potential futures and risk timelines.</p>
                </div>
            </div>

            {/* Input */}
            <div className="max-w-3xl mx-auto w-full mb-12">
                <div className="bg-dark-card border-2 border-gray-700 p-2 rounded-sm flex gap-2 shadow-[0_0_15px_rgba(179,0,255,0.15)] relative group focus-within:border-neon-purple transition-all">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
                        <Spline size={20} />
                    </div>
                    <input
                        type="text"
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
                        placeholder="What if... (e.g. 'We lose our biggest client' or 'We pivot to AI')"
                        className="w-full bg-transparent border-none pl-12 pr-4 py-4 text-lg text-white font-mono focus:ring-0 placeholder-gray-600"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSimulate}
                        disabled={loading || !scenario.trim()}
                        className="bg-neon-purple hover:bg-neon-purple/80 text-white px-8 rounded-sm font-mono font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-[0_0_15px_rgba(179,0,255,0.3)]"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Simulate'}
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="flex-1">
                {!result && !loading && (
                    <div className="flex flex-col items-center justify-center text-gray-600 opacity-50 h-64">
                        <GitBranch size={64} strokeWidth={1} />
                        <p className="mt-4 font-mono uppercase tracking-widest text-sm">No Active Simulation</p>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center text-neon-purple h-64">
                        <div className="w-16 h-16 border-4 border-neon-purple/30 rounded border-t-neon-purple animate-spin mb-4"></div>
                        <p className="font-mono uppercase tracking-widest animate-pulse">Calculating Probability Matrices...</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        {/* Timeline Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <TimelineCard outcome={result.likelyCase} type="likely" />
                            <TimelineCard outcome={result.bestCase} type="best" />
                            <TimelineCard outcome={result.worstCase} type="worst" />
                        </div>

                        {/* Strategic Advice */}
                        <div className="bg-dark-bg border-2 border-gray-700 rounded-sm p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-neon-purple"></div>
                            <h3 className="text-xs font-mono font-bold text-neon-purple uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Crosshair size={14} /> Strategic Recommendation
                            </h3>
                            <p className="text-xl text-gray-200 font-mono leading-relaxed">
                                &quot;{result.strategicAdvice}&quot;
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
