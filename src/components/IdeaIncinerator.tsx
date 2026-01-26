
import React, { useState } from 'react';
import { Flame, Hammer, Skull, Zap, Copy, Check, Thermometer } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { IncineratorResponse } from '../types';
import { addXP, showToast } from '../services/gameService';

export const IdeaIncinerator: React.FC = () => {
    const [content, setContent] = useState('');
    const [brutality, setBrutality] = useState(50);
    const [mode, setMode] = useState<'roast' | 'forge'>('forge');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<IncineratorResponse (null);
    const [copied, setCopied] = useState(false);

    const handleIgnite = async (): Promise<void> => {
        if (!content.trim()) return;
        setLoading(true);
        setResult(null);

        const response = await geminiService.generateIncineratorFeedback(content, mode, brutality.toString());
        setResult(response);
        setLoading(false);

        // Gamification
        const { leveledUp } = await addXP(30);
        showToast("IDEA INCINERATED", "Feedback generated.", "xp", 30);
        if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
    };

    const copyToClipboard = (text: string): void => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getBrutalityLabel = (): { text: string; color: string } => {
        if (brutality < 25) return { text: "GENTLE", color: "text-neon-lime" };
        if (brutality < 50) return { text: "HONEST", color: "text-neon-orange" };
        if (brutality < 75) return { text: "BRUTAL", color: "text-neon-magenta" };
        return { text: "FATALITY", color: "text-neon-magenta animate-pulse" };
    };

    const label = getBrutalityLabel();

    return (
        <div className="min-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="mb-8 flex items-end justify-between border-b-2 border-gray-700 pb-6">
                <div>
                    <h2 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white flex items-center gap-3">
                        THE INCINERATOR <Flame className="text-neon-orange" size={32} fill="currentColor" />
                    </h2>
                    <p className="text-gray-400 mt-2 font-mono">Content Validation & Refinement Engine</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

                {/* Control & Input Panel */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Mode Selection */}
                    <div className="bg-dark-card p-1 rounded-sm flex gap-1 border-2 border-gray-700">
                        <button
                            onClick={() => setMode('roast')}
                            className={`flex-1 py-3 rounded-sm font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                            ${mode === 'roast' ? 'bg-neon-magenta/20 text-neon-magenta shadow-[0_0_15px_rgba(255,0,110,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Skull size={16} /> Roast
                        </button>
                        <button
                            onClick={() => setMode('forge')}
                            className={`flex-1 py-3 rounded-sm font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                            ${mode === 'forge' ? 'bg-neon-orange/20 text-neon-orange shadow-[0_0_15px_rgba(255,102,0,0.3)]' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Hammer size={16} /> Forge
                        </button>
                    </div>

                    {/* Brutality Slider */}
                    <div className="bg-dark-card border-2 border-gray-700 p-6 rounded-sm">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Thermometer size={14} /> Heat Level
                            </span>
                            <span className={`text-sm font-mono font-bold uppercase tracking-widest ${label.color}`}>
                                {label.text} // {brutality}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={brutality}
                            onChange={(e) => setBrutality(parseInt(e.target.value))}
                            className="w-full h-2 bg-dark-bg rounded-sm appearance-none cursor-pointer accent-neon-orange transition-all"
                        />
                    </div>

                    {/* Input Area */}
                    <div className="bg-dark-card border-2 border-gray-700 p-4 rounded-sm relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-orange to-neon-magenta rounded-sm blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your email draft, tweet, or elevator pitch here..."
                            className="w-full h-64 bg-dark-bg border-none rounded-sm p-4 text-gray-300 focus:ring-0 resize-none font-mono text-sm leading-relaxed relative z-10"
                            spellCheck={false}
                        />
                        <div className="absolute bottom-6 right-6 z-20 text-xs text-gray-600 font-mono">
                            {content.length} chars
                        </div>
                    </div>

                    <button
                        onClick={handleIgnite}
                        disabled={loading || !content.trim()}
                        className={`w-full py-4 rounded-sm font-mono font-bold uppercase tracking-widest text-lg flex items-center justify-center gap-3 transition-all
                        ${loading
                                ? 'bg-dark-hover text-gray-500 cursor-wait'
                                : 'border-2 border-neon-orange bg-neon-orange/10 text-neon-orange hover:bg-neon-orange/20 hover:shadow-[0_0_20px_rgba(255,102,0,0.4)]'
                            }`}
                    >
                        {loading ? 'Incinerating...' : 'IGNITE'} <Zap size={20} className={loading ? 'animate-pulse' : 'fill-current'} />
                    </button>
                </div>

                {/* Output Panel */}
                <div className="lg:col-span-2 bg-dark-bg border-2 border-gray-700 rounded-sm p-8 relative overflow-hidden flex flex-col">

                    {!result && !loading && (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-gray-600">
                            <Flame size={64} strokeWidth={1} />
                            <p className="mt-4 font-mono uppercase tracking-widest text-sm">Awaiting Fuel</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-neon-orange">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-neon-orange/30 rounded-full animate-spin-slow"></div>
                                <div className="absolute inset-0 border-t-4 border-neon-orange rounded-full animate-spin"></div>
                            </div>
                            <p className="mt-8 font-mono font-bold uppercase tracking-widest animate-pulse">Applying Heat...</p>
                        </div>
                    )}

                    {result && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 h-full flex flex-col">

                            {/* Top Stats Row */}
                            <div className="flex flex-col md:flex-row gap-6 mb-8 border-b-2 border-gray-700 pb-6">
                                <div className="flex-1">
                                    <p className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Analysis Summary</p>
                                    <h3 className={`font-orbitron text-2xl font-bold leading-tight ${brutality > 75 ? 'text-neon-magenta' : 'text-white'}`}>
                                        &quot;{result.roastSummary}&quot;
                                    </h3>
                                </div>
                                <div className="shrink-0 flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Survival Score</p>
                                        <p className={`text-4xl font-mono font-bold ${result.survivalScore > 80 ? 'text-neon-lime' :
                                            result.survivalScore > 50 ? 'text-neon-orange' : 'text-neon-magenta'
                                            }`}>
                                            {result.survivalScore}
                                            <span className="text-sm text-gray-600 font-medium">/100</span>
                                        </p>
                                    </div>
                                    <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${result.survivalScore > 80 ? 'border-neon-lime/50 bg-neon-lime/10' :
                                        result.survivalScore > 50 ? 'border-neon-orange/50 bg-neon-orange/10' : 'border-neon-magenta/50 bg-neon-magenta/10'
                                        }`}>
                                        {result.survivalScore > 80 ? <Check className="text-neon-lime" /> : <Skull className={result.survivalScore > 50 ? 'text-neon-orange' : 'text-neon-magenta'} />}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {/* Split View for Forge Mode */}
                                {mode === 'forge' && result.rewrittenContent ? (
                                    <div className="grid grid-cols-1 gap-8">
                                        {/* Feedback List */}
                                        <div className="bg-dark-card border-2 border-gray-700 p-6 rounded-sm">
                                            <h4 className="text-xs font-mono font-bold text-neon-orange uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Flame size={12} /> Critical Feedback
                                            </h4>
                                            <ul className="space-y-3">
                                                {result.feedback.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300 font-mono">
                                                        <span className="text-neon-orange/50 mt-1">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Comparison */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-neon-magenta/5 border-2 border-neon-magenta/20 rounded-sm opacity-70">
                                                <p className="text-[10px] font-mono font-bold text-neon-magenta uppercase tracking-widest mb-3">Original (Weak)</p>
                                                <p className="text-sm text-gray-400 font-mono whitespace-pre-wrap line-through decoration-neon-magenta/30 decoration-2">{content}</p>
                                            </div>
                                            <div className="p-4 bg-neon-lime/5 border-2 border-neon-lime/20 rounded-sm relative group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <p className="text-[10px] font-mono font-bold text-neon-lime uppercase tracking-widest">Forged (Optimized)</p>
                                                    <button
                                                        onClick={() => copyToClipboard(result.rewrittenContent!)}
                                                        className="text-neon-lime hover:text-white transition-colors"
                                                        title="Copy"
                                                    >
                                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-200 font-mono whitespace-pre-wrap leading-relaxed">
                                                    {result.rewrittenContent}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Roast Mode View */
                                    <div className="space-y-6">
                                        <div className="bg-neon-magenta/5 border-2 border-neon-magenta/20 p-8 rounded-sm">
                                            <h4 className="text-sm font-mono font-bold text-neon-magenta uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <Skull size={16} /> Why It Failed
                                            </h4>
                                            <ul className="space-y-4">
                                                {result.feedback.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-4">
                                                        <span className="text-neon-magenta font-bold text-lg leading-none mt-0.5">×</span>
                                                        <p className="text-gray-300 font-mono leading-relaxed">{item}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="p-6 border-2 border-dashed border-gray-700 rounded-sm text-center">
                                            <p className="text-gray-500 font-mono text-sm">Switch to <span className="text-neon-orange font-bold">FORGE MODE</span> to fix this mess.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
