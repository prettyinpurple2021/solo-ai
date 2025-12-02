
import React, { useState, useEffect } from 'react';
import { Megaphone, Repeat, Twitter, Linkedin, Video, Mail, Copy, Check, Loader2, FileText, Map, Lightbulb, Target, Hash } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ContentAmplification, SocialStrategy } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';

export const TheAmplifier: React.FC = () => {
    const [mode, setMode] = useState<'multiplier' | 'strategy'>('multiplier');

    // Multiplier State
    const [source, setSource] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ContentAmplification | null>(null);
    const [activeTab, setActiveTab] = useState<'twitter' | 'linkedin' | 'tiktok' | 'email'>('twitter');
    const [copied, setCopied] = useState(false);

    // Strategy State
    const [strategy, setStrategy] = useState<SocialStrategy | null>(null);
    const [loadingStrategy, setLoadingStrategy] = useState(false);

    useEffect(() => {
        const savedStrat = localStorage.getItem('solo_social_strategy');
        if (savedStrat) {
            try { setStrategy(JSON.parse(savedStrat)); } catch (e) { }
        }
    }, []);

    // --- Handlers for Multiplier ---

    const handleAmplify = async () => {
        if (!source.trim()) return;
        setLoading(true);
        setResult(null);
        soundService.playClick();

        const data = await geminiService.generateAmplifiedContent(source);
        if (data) {
            setResult(data);

            // Save to Vault
            await storageService.saveCampaign(data);

            const { leveledUp } = await addXP(50);
            showToast("CONTENT AMPLIFIED", "Omni-channel assets generated.", "xp", 50);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        } else {
            showToast("AMPLIFICATION FAILED", "Could not process source material.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    const copyContent = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        soundService.playClick();
    };

    // --- Handlers for Strategy ---

    const handleGenerateStrategy = async () => {
        setLoadingStrategy(true);
        setStrategy(null);
        soundService.playClick();

        const result = await geminiService.generateSocialStrategy();
        if (result) {
            setStrategy(result);
            localStorage.setItem('solo_social_strategy', JSON.stringify(result));

            const { leveledUp } = await addXP(100);
            showToast("STRATEGY DEPLOYED", "Social roadmap initialized.", "xp", 100);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        } else {
            showToast("STRATEGY FAILED", "Could not map social terrain.", "error");
            soundService.playError();
        }
        setLoadingStrategy(false);
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-pink-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Megaphone size={14} /> Viral Engineering
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">THE AMPLIFIER</h2>
                    <p className="text-zinc-400 mt-2">Content distribution and social media command center.</p>
                </div>

                {/* Mode Switcher */}
                <div className="bg-zinc-900 p-1 rounded-lg border border-zinc-800 flex">
                    <button
                        onClick={() => setMode('multiplier')}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${mode === 'multiplier' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Multiplier
                    </button>
                    <button
                        onClick={() => setMode('strategy')}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${mode === 'strategy' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Strategy Engine
                    </button>
                </div>
            </div>

            {mode === 'multiplier' ? (
                // === MULTIPLIER VIEW ===
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-in fade-in duration-300">

                    {/* Input */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex-1 flex flex-col">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <FileText size={14} /> Source Material
                            </h3>
                            <textarea
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                className="flex-1 w-full bg-black border border-zinc-700 rounded p-4 text-zinc-300 focus:border-pink-500 focus:ring-0 resize-none mb-4 min-h-[300px] font-mono text-sm"
                                placeholder="Paste your blog post, core idea, rant, or rough notes here..."
                            />
                            <button
                                onClick={handleAmplify}
                                disabled={loading || !source.trim()}
                                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-bold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-900/20"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Repeat size={18} /> Amplify Signal</>}
                            </button>
                        </div>
                    </div>

                    {/* Output */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 relative flex flex-col min-h-[500px]">
                        {!result && !loading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 opacity-50">
                                <Megaphone size={64} strokeWidth={1} />
                                <p className="mt-4 font-mono uppercase tracking-widest text-sm">Awaiting Input Signal</p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-pink-500">
                                <div className="w-16 h-16 border-4 border-pink-900/30 rounded-full border-t-pink-500 animate-spin mb-4"></div>
                                <p className="font-mono uppercase tracking-widest animate-pulse">Multiplying Content...</p>
                            </div>
                        )}

                        {result && (
                            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">

                                <h3 className="text-white font-bold text-lg mb-6 truncate">{result.sourceTitle}</h3>

                                {/* Platform Tabs */}
                                <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4 overflow-x-auto scrollbar-hide">
                                    <button
                                        onClick={() => setActiveTab('twitter')}
                                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'twitter' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        <Twitter size={14} /> Thread
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('linkedin')}
                                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'linkedin' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        <Linkedin size={14} /> LinkedIn
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('tiktok')}
                                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'tiktok' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        <Video size={14} /> Script
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('email')}
                                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'email' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                                    >
                                        <Mail size={14} /> Email
                                    </button>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 relative bg-black border border-zinc-800 rounded-lg p-6 overflow-y-auto custom-scrollbar">
                                    <button
                                        onClick={() => copyContent(
                                            activeTab === 'twitter' ? result.twitterThread?.join('\n\n') || '' :
                                                activeTab === 'linkedin' ? result.linkedinPost || '' :
                                                    activeTab === 'tiktok' ? result.tiktokScript || '' :
                                                        result.newsletterSection || ''
                                        )}
                                        className="absolute top-4 right-4 text-zinc-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase"
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                                    </button>

                                    {activeTab === 'twitter' && (
                                        <div className="space-y-4">
                                            {result.twitterThread?.map((tweet, i) => (
                                                <div key={i} className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">{i + 1}</div>
                                                        {i < (result.twitterThread?.length || 0) - 1 && <div className="w-0.5 flex-1 bg-zinc-800 my-2"></div>}
                                                    </div>
                                                    <p className="text-zinc-300 text-sm leading-relaxed pt-1.5">{tweet}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'linkedin' && (
                                        <div className="whitespace-pre-wrap text-zinc-300 text-sm leading-relaxed font-sans">
                                            {result.linkedinPost}
                                        </div>
                                    )}

                                    {activeTab === 'tiktok' && (
                                        <div className="whitespace-pre-wrap text-zinc-300 text-sm leading-relaxed font-mono">
                                            {result.tiktokScript}
                                        </div>
                                    )}

                                    {activeTab === 'email' && (
                                        <div className="whitespace-pre-wrap text-zinc-300 text-sm leading-relaxed font-serif">
                                            {result.newsletterSection}
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // === STRATEGY VIEW ===
                <div className="h-full flex flex-col animate-in fade-in duration-300">

                    {/* Generator Button */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center mb-8">
                        <h3 className="text-2xl font-black text-white mb-2">Social Media Roadmap</h3>
                        <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
                            Generate a comprehensive strategy based on your Brand DNA, including content pillars, posting cadence, and persona-specific tactics.
                        </p>
                        <button
                            onClick={handleGenerateStrategy}
                            disabled={loadingStrategy}
                            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-bold uppercase tracking-widest transition-all shadow-lg shadow-pink-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                        >
                            {loadingStrategy ? <Loader2 size={18} className="animate-spin" /> : <><Map size={18} /> Generate Roadmap</>}
                        </button>
                    </div>

                    {strategy && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700 pb-20">

                            {/* Pillars */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Hash size={14} /> Content Pillars
                                </h4>
                                {strategy.pillars.map((pillar, i) => (
                                    <div key={i} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg hover:border-pink-500/50 transition-colors">
                                        <h5 className="font-bold text-white mb-1 text-sm">{pillar.title}</h5>
                                        <p className="text-xs text-zinc-400 leading-relaxed">{pillar.description}</p>
                                    </div>
                                ))}
                                <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                                    <h5 className="font-bold text-pink-400 mb-1 text-xs uppercase tracking-wider">Cadence</h5>
                                    <p className="text-xs text-zinc-300">{strategy.cadence}</p>
                                </div>
                            </div>

                            {/* Tactics */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Target size={14} /> Persona Tactics
                                </h4>
                                {strategy.personaTactics.map((tactic, i) => (
                                    <div key={i} className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg hover:border-purple-500/50 transition-colors">
                                        <h5 className="font-bold text-white mb-1 text-sm flex items-center gap-2">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                            {tactic.persona}
                                        </h5>
                                        <p className="text-xs text-zinc-400 leading-relaxed">{tactic.tactic}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Hooks */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Lightbulb size={14} /> Sample Hooks
                                </h4>
                                <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                                    {strategy.sampleHooks.map((hook, i) => (
                                        <div key={i} className="p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-900 transition-colors">
                                            <p className="text-sm text-zinc-300 italic">"{hook}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
