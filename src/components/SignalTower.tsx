
import React, { useState } from 'react';
import { Radio, Globe, ExternalLink, RefreshCw, Zap, Search, Rss } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';

export const SignalTower: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [briefing, setBriefing] = useState<string (null);
    const [sources, setSources] = useState<any[]>([]);
    const [industry, setIndustry] = useState('');

    const handleScan = async () => {
        if (!industry.trim()) return;

        setLoading(true);
        setBriefing(null);
        setSources([]);
        soundService.playClick();

        const result = await geminiService.generateMarketPulse(industry);
        if (result) {
            setBriefing(result.content);
            setSources(result.sources);

            const { leveledUp } = await addXP(40);
            showToast("SIGNAL ACQUIRED", "Market intelligence updated.", "xp", 40);
            if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
            soundService.playSuccess();
        } else {
            showToast("SIGNAL LOST", "Could not connect to external feeds.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">

            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b-2 border-gray-700 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-neon-cyan font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Radio size={14} className={loading ? 'animate-pulse' : ''} /> External Uplink
                    </div>
                    <h2 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">SIGNAL TOWER</h2>
                    <p className="text-gray-400 font-mono mt-2">Real-time market intelligence via Global Network.</p>
                </div>
                <button
                    onClick={handleScan}
                    disabled={loading || !industry.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-neon-cyan/10 hover:bg-neon-cyan/20 border-2 border-neon-cyan/50 text-neon-cyan rounded-sm font-mono font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(11,228,236,0.2)]"
                >
                    {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                    {loading ? 'Scanning Frequencies...' : 'Scan Market'}
                </button>
            </div>

            {/* Industry Input */}
            <div className="mb-6">
                <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="ENTER TARGET INDUSTRY / TOPIC (e.g. SaaS AI, FinTech, BioTech)..."
                    className="w-full bg-dark-card border-2 border-gray-700 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(11,228,236,0.3)] font-mono text-sm placeholder:text-gray-600 transition-all"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

                {/* Main Briefing */}
                <div className="lg:col-span-2 bg-dark-card border-2 border-neon-cyan/30 rounded-sm p-8 relative min-h-[400px] flex flex-col shadow-[0_0_20px_rgba(11,228,236,0.15)]">

                    {!briefing && !loading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 opacity-50">
                            <Globe size={64} strokeWidth={1} />
                            <p className="mt-6 font-mono uppercase tracking-widest text-sm">No active signal</p>
                            <p className="text-xs mt-2 font-mono">Initiate scan to intercept market trends.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 border-4 border-neon-cyan/30 rounded-full animate-ping"></div>
                                <div className="absolute inset-0 m-auto w-16 h-16 border-4 border-neon-cyan rounded-full animate-spin"></div>
                                <div className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <div className="font-mono text-neon-cyan text-xs uppercase tracking-widest space-y-2 text-center">
                                <p>Accessing Global Nodes...</p>
                                <p className="text-gray-500">Parsing Grounding Data...</p>
                            </div>
                        </div>
                    )}

                    {briefing && (
                        <div className="prose prose-invert max-w-none">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-700">
                                <div className="p-2 bg-neon-cyan/10 rounded-sm text-neon-cyan">
                                    <Rss size={20} />
                                </div>
                                <div>
                                    <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider">Incoming Transmission</h3>
                                    <p className="text-xs text-gray-500 font-mono">Source: Echo (CMO) // {new Date().toLocaleTimeString()}</p>
                                </div>
                            </div>
                            <div className="text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                                {briefing}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sources Sidebar */}
                <div className="bg-dark-bg border-2 border-gray-700 rounded-sm overflow-hidden flex flex-col h-[400px] lg:h-auto">
                    <div className="p-4 bg-dark-card border-b-2 border-gray-700 flex items-center justify-between">
                        <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <ExternalLink size={14} /> Verified Sources
                        </h3>
                        <span className="bg-neon-cyan/20 text-neon-cyan text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm">
                            {sources.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {sources.length === 0 ? (
                            <div className="text-center py-10 text-gray-600 text-xs font-mono">
                                WAITING FOR DATA...
                            </div>
                        ) : (
                            sources.map((source, i) => (
                                <a
                                    key={i}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block p-4 bg-dark-card border-2 border-gray-700 rounded-sm hover:bg-dark-hover hover:border-neon-cyan/50 transition-all group"
                                >
                                    <h4 className="text-xs font-mono font-bold text-gray-300 group-hover:text-neon-cyan mb-2 line-clamp-2 leading-normal">
                                        {source.title || 'Unknown Source'}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono truncate">
                                        <Globe size={10} />
                                        <span className="truncate">{new URL(source.uri).hostname}</span>
                                    </div>
                                </a>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t-2 border-gray-700 bg-dark-card">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                            <Zap size={12} className="text-neon-orange" />
                            <span>POWERED BY GOOGLE SEARCH GROUNDING</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
