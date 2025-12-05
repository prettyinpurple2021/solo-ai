
import React, { useState } from 'react';
import { Flame, Hammer, Skull, Zap, ArrowRight, Copy, Check, Thermometer } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { IncineratorResponse } from '../types';
import { addXP, showToast } from '../services/gameService';

export const IdeaIncinerator: React.FC = () => {
    const [content, setContent] = useState('');
    const [brutality, setBrutality] = useState(50);
    const [mode, setMode] = useState<'roast' | 'forge'>('forge');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<IncineratorResponse | null>(null);
    const [copied, setCopied] = useState(false);

    const handleIgnite = async () => {
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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getBrutalityLabel = () => {
        if (brutality < 25) return { text: "GENTLE", color: "text-emerald-400" };
        if (brutality < 50) return { text: "HONEST", color: "text-yellow-400" };
        if (brutality < 75) return { text: "BRUTAL", color: "text-orange-500" };
        return { text: "FATALITY", color: "text-red-600 animate-pulse" };
    };

    const label = getBrutalityLabel();

    return (
        <div className="min-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="mb-8 flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        THE INCINERATOR <Flame className="text-orange-500" size={32} fill="currentColor" />
                    </h2>
                    <p className="text-zinc-400 mt-2 font-mono">Content Validation & Refinement Engine</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

                {/* Control & Input Panel */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Mode Selection */}
                    <div className="bg-zinc-900 p-1 rounded-lg flex gap-1 border border-zinc-800">
                        <button
                            onClick={() => setMode('roast')}
                            className={`flex-1 py-3 rounded font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                            ${mode === 'roast' ? 'bg-red-900/50 text-red-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Skull size={16} /> Roast
                        </button>
                        <button
                            onClick={() => setMode('forge')}
                            className={`flex-1 py-3 rounded font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                            ${mode === 'forge' ? 'bg-orange-500 text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Hammer size={16} /> Forge
                        </button>
                    </div>

                    {/* Brutality Slider */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Thermometer size={14} /> Heat Level
                            </span>
                            <span className={`text-sm font-black uppercase tracking-widest ${label.color}`}>
                                {label.text} {'//'} {brutality}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={brutality}
                            onChange={(e) => setBrutality(parseInt(e.target.value))}
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
                        />
                    </div>

                    {/* Input Area */}
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your email draft, tweet, or elevator pitch here..."
                            className="w-full h-64 bg-black border-none rounded-lg p-4 text-zinc-300 focus:ring-0 resize-none font-mono text-sm leading-relaxed relative z-10"
                            spellCheck={false}
                        />
                        <div className="absolute bottom-6 right-6 z-20 text-xs text-zinc-600 font-mono">
                            {content.length} chars
                        </div>
                    </div>

                    <button
                        onClick={handleIgnite}
                        disabled={loading || !content.trim()}
                        className={`w-full py-4 rounded-lg font-black uppercase tracking-widest text-lg flex items-center justify-center gap-3 transition-all
                        ${loading
                                ? 'bg-zinc-800 text-zinc-500 cursor-wait'
                                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg hover:shadow-orange-900/20'
                            }`}
                    >
                        {loading ? 'Incinerating...' : 'IGNITE'} <Zap size={20} className={loading ? 'animate-pulse' : 'fill-current'} />
                    </button>
                </div>

                {/* Output Panel */}
                <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-8 relative overflow-hidden flex flex-col">

                    {!result && !loading && (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-zinc-600">
                            <Flame size={64} strokeWidth={1} />
                            <p className="mt-4 font-mono uppercase tracking-widest text-sm">Awaiting Fuel</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-orange-500">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-orange-900/30 rounded-full animate-spin-slow"></div>
                                <div className="absolute inset-0 border-t-4 border-orange-500 rounded-full animate-spin"></div>
                            </div>
                            <p className="mt-8 font-black uppercase tracking-widest animate-pulse">Applying Heat...</p>
                        </div>
                    )}

                    {result && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 h-full flex flex-col">

                            {/* Top Stats Row */}
                            <div className="flex flex-col md:flex-row gap-6 mb-8 border-b border-zinc-900 pb-6">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Analysis Summary</p>
                                    <h3 className={`text-2xl font-bold leading-tight ${brutality > 75 ? 'text-red-400' : 'text-white'}`}>
                                        "{result.roastSummary}"
                                    </h3>
                                </div>
                                <div className="shrink-0 flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Survival Score</p>
                                        <p className={`text-4xl font-black ${result.survivalScore > 80 ? 'text-emerald-500' :
                                            result.survivalScore > 50 ? 'text-yellow-500' : 'text-red-500'
                                            }`}>
                                            {result.survivalScore}
                                            <span className="text-sm text-zinc-600 font-medium">/100</span>
                                        </p>
                                    </div>
                                    <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${result.survivalScore > 80 ? 'border-emerald-900/50 bg-emerald-900/20' :
                                        result.survivalScore > 50 ? 'border-yellow-900/50 bg-yellow-900/20' : 'border-red-900/50 bg-red-900/20'
                                        }`}>
                                        {result.survivalScore > 80 ? <Check className="text-emerald-500" /> : <Skull className={result.survivalScore > 50 ? 'text-yellow-500' : 'text-red-500'} />}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {/* Split View for Forge Mode */}
                                {mode === 'forge' && result.rewrittenContent ? (
                                    <div className="grid grid-cols-1 gap-8">
                                        {/* Feedback List */}
                                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg">
                                            <h4 className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <Flame size={12} /> Critical Feedback
                                            </h4>
                                            <ul className="space-y-3">
                                                {result.feedback.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                                                        <span className="text-orange-500/50 mt-1">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Comparison */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-lg opacity-70">
                                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3">Original (Weak)</p>
                                                <p className="text-sm text-zinc-400 font-mono whitespace-pre-wrap line-through decoration-red-500/30 decoration-2">{content}</p>
                                            </div>
                                            <div className="p-4 bg-emerald-950/10 border border-emerald-900/20 rounded-lg relative group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Forged (Optimized)</p>
                                                    <button
                                                        onClick={() => copyToClipboard(result.rewrittenContent!)}
                                                        className="text-emerald-500 hover:text-white transition-colors"
                                                        title="Copy"
                                                    >
                                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                                <p className="text-sm text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed">
                                                    {result.rewrittenContent}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Roast Mode View */
                                    <div className="space-y-6">
                                        <div className="bg-red-950/10 border border-red-900/20 p-8 rounded-lg">
                                            <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <Skull size={16} /> Why It Failed
                                            </h4>
                                            <ul className="space-y-4">
                                                {result.feedback.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-4">
                                                        <span className="text-red-500 font-black text-lg leading-none mt-0.5">×</span>
                                                        <p className="text-zinc-300 leading-relaxed">{item}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="p-6 border border-dashed border-zinc-800 rounded-lg text-center">
                                            <p className="text-zinc-500 text-sm">Switch to <span className="text-orange-500 font-bold">FORGE MODE</span> to fix this mess.</p>
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
