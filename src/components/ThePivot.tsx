
import React, { useState } from 'react';
import { Compass, Map, Anchor, ArrowRight, Loader2, Target, AlertCircle } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { PivotAnalysis } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';

export const ThePivot: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<PivotAnalysis (null);

    const handleScan = async () => {
        setLoading(true);
        setAnalysis(null);
        soundService.playClick();

        const result = await geminiService.findBlueOceans();
        if (result) {
            setAnalysis(result);

            const { leveledUp } = await addXP(100);
            showToast("OCEAN MAPPED", "Market gaps identified.", "xp", 100);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        } else {
            showToast("SCAN FAILED", "Could not map market data.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b-2 border-gray-700 pb-6 gap-4 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 text-neon-cyan font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Compass size={14} /> Market Explorer
                    </div>
                    <h2 className="font-orbitron text-3xl md:text-4xl font-bold uppercase tracking-wider text-white">THE PIVOT</h2>
                    <p className="text-gray-400 font-mono mt-2">Identify low-competition &quot;Blue Ocean&quot; opportunities.</p>
                </div>
                <button
                    onClick={handleScan}
                    disabled={loading}
                    className="flex items-center justify-center w-full md:w-auto gap-2 px-8 py-4 bg-neon-cyan/10 hover:bg-neon-cyan/20 border-2 border-neon-cyan/50 text-neon-cyan rounded-sm font-mono font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(11,228,236,0.2)]"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Map size={18} />}
                    {loading ? 'Scanning Sectors...' : 'Find Blue Oceans'}
                </button>
            </div>

            <div className="flex-1 flex flex-col">
                {!analysis && !loading && (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600 opacity-50 min-h-[400px]">
                        <Anchor size={64} strokeWidth={1} />
                        <p className="mt-4 font-mono uppercase tracking-widest text-sm">Awaiting Navigation Data</p>
                        <p className="text-xs mt-2 text-gray-500 font-mono">Launch scan to find underserved niches.</p>
                    </div>
                )}

                {loading && (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-neon-cyan/30 rounded-full animate-spin-slow"></div>
                            <div className="absolute inset-0 m-auto w-16 h-16 border-4 border-neon-cyan rounded-full animate-spin"></div>
                        </div>
                        <p className="mt-8 font-mono text-neon-cyan uppercase tracking-widest animate-pulse">Triangulating Market Gaps...</p>
                    </div>
                )}

                {analysis && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-gray-500 text-sm font-mono font-bold uppercase tracking-widest">Sector Analysis:</span>
                            <span className="text-white text-lg font-mono font-bold">{analysis.currentIndustry}</span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {analysis.gaps.map((gap, i) => (
                                <div key={i} className="bg-dark-card border-2 border-gray-700 rounded-sm p-6 hover:border-neon-cyan/50 transition-all group flex flex-col relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan to-neon-purple transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                                    <h3 className="font-orbitron text-xl font-bold uppercase tracking-wider text-white mb-2 group-hover:text-neon-cyan transition-colors">{gap.name}</h3>
                                    <p className="text-sm text-gray-400 font-mono mb-6 flex-1">{gap.description}</p>

                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                        <div className="bg-dark-bg p-3 rounded-sm border-2 border-gray-700 text-center">
                                            <div className="text-[10px] text-gray-500 font-mono font-bold uppercase mb-1">Competition</div>
                                            <div className={`text-lg font-mono font-bold ${gap.competitionScore < 30 ? 'text-neon-lime' : gap.competitionScore < 60 ? 'text-neon-orange' : 'text-neon-magenta'}`}>
                                                {gap.competitionScore}
                                            </div>
                                        </div>
                                        <div className="bg-dark-bg p-3 rounded-sm border-2 border-gray-700 text-center">
                                            <div className="text-[10px] text-gray-500 font-mono font-bold uppercase mb-1">Profit</div>
                                            <div className={`text-lg font-mono font-bold ${gap.profitabilityScore > 70 ? 'text-neon-lime' : 'text-neon-orange'}`}>
                                                {gap.profitabilityScore}
                                            </div>
                                        </div>
                                        <div className="bg-dark-bg p-3 rounded-sm border-2 border-gray-700 text-center">
                                            <div className="text-[10px] text-gray-500 font-mono font-bold uppercase mb-1">Solo Fit</div>
                                            <div className={`text-lg font-mono font-bold ${gap.soloFitScore > 80 ? 'text-neon-lime' : 'text-neon-cyan'}`}>
                                                {gap.soloFitScore}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-neon-cyan/10 border-2 border-neon-cyan/30 p-3 rounded-sm">
                                            <h4 className="text-xs font-mono font-bold text-neon-cyan uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <Target size={12} /> Why It Works
                                            </h4>
                                            <p className="text-xs text-neon-cyan/80 font-mono leading-relaxed">{gap.whyItWorks}</p>
                                        </div>

                                        <div className="flex items-start gap-3 text-sm text-gray-300 font-mono">
                                            <ArrowRight size={16} className="mt-1 text-neon-lime shrink-0" />
                                            <div>
                                                <span className="text-neon-lime font-bold text-xs uppercase tracking-wider block mb-1">First Step</span>
                                                {gap.firstStep}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-dark-bg border-2 border-gray-700 p-4 rounded-sm flex items-start gap-3">
                            <AlertCircle className="text-neon-orange mt-1" size={16} />
                            <p className="text-xs text-gray-400 font-mono">
                                NOTE: Success in Blue Oceans requires rapid execution. Use the Tactical Roadmap to deploy a test immediately.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
