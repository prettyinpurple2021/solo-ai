import React, { useState } from 'react';
import { Terminal, Code, Cpu, Bug, CheckCircle2, AlertTriangle, Copy, Check, Loader2, Save } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { TechStackAudit, CodeSnippet, SavedCodeSnippet } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';

export const TheMainframe: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'audit' | 'fabricator'>('audit');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [auditResult, setAuditResult] = useState<TechStackAudit | null>(null);
    const [codeResult, setCodeResult] = useState<CodeSnippet | null>(null);
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleExecute = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setSaved(false);
        soundService.playClick();

        if (activeTab === 'audit') {
            setAuditResult(null);
            const result = await geminiService.conductTechAudit(input);
            if (result) {
                setAuditResult(result);
                const { leveledUp } = await addXP(75);
                showToast("SYSTEM AUDITED", "Technical analysis complete.", "xp", 75);
                if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
                soundService.playSuccess();
            }
        } else {
            setCodeResult(null);
            const result = await geminiService.generateCodeSolution(input);
            if (result) {
                setCodeResult(result);
                const { leveledUp } = await addXP(60);
                showToast("CODE COMPILED", "Snippet generated successfully.", "xp", 60);
                if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
                soundService.playSuccess();
            }
        }
        setLoading(false);
    };

    const handleCopy = () => {
        if (codeResult) {
            navigator.clipboard.writeText(codeResult.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            soundService.playClick();
        }
    };

    const handleSaveToVault = async () => {
        if (!codeResult || saved) return;

        const newSnippet: SavedCodeSnippet = {
            ...codeResult,
            description: codeResult.explanation,
            tags: [],
            id: `code-${Date.now()}`,
            title: input.length > 30 ? input.substring(0, 30) + '...' : input,
            timestamp: new Date().toISOString()
        };

        // Save to Vault
        await storageService.saveCodeSnippet(newSnippet);

        setSaved(true);
        showToast("SNIPPET ARCHIVED", "Code saved to The Vault.", "success");
        soundService.playSuccess();
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-yellow-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Terminal size={14} /> Technical Ops
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">THE MAINFRAME</h2>
                    <p className="text-zinc-400 mt-2">CTO-Level Architecture Analysis & Code Fabrication.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-zinc-800 overflow-x-auto pb-1 scrollbar-hide">
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === 'audit' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    <span className="flex items-center gap-2"><Bug size={16} /> Stack Audit</span>
                </button>
                <button
                    onClick={() => setActiveTab('fabricator')}
                    className={`pb-4 px-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === 'fabricator' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    <span className="flex items-center gap-2"><Code size={16} /> Code Fabricator</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

                {/* Input Panel */}
                <div className="flex flex-col gap-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex-1 flex flex-col">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Cpu size={14} /> Input Terminal
                        </h3>
                        <div className="flex-1 bg-black border border-zinc-800 rounded-lg p-4 font-mono text-sm text-yellow-500 relative group">
                            <div className="absolute top-4 left-4 opacity-50 select-none">{">"}</div>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full h-full bg-transparent border-none resize-none focus:ring-0 pl-6 custom-scrollbar"
                                placeholder={activeTab === 'audit' ? "Describe your tech stack (e.g., Next.js, Tailwind, MongoDB...)" : "Describe the function or component you need (e.g., 'A React hook for debouncing search input')..."}
                                spellCheck={false}
                            />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleExecute}
                                disabled={loading || !input.trim()}
                                className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase tracking-widest rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-yellow-900/20"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : 'RUN_PROCESS'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Panel */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 relative overflow-hidden flex flex-col min-h-[400px]">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

                    {!auditResult && !codeResult && !loading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-700 opacity-50">
                            <Terminal size={64} strokeWidth={1} />
                            <p className="mt-4 font-mono uppercase tracking-widest text-sm">Awaiting Input...</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-yellow-500">
                            <div className="w-16 h-16 border-4 border-yellow-900/30 rounded border-t-yellow-500 animate-spin mb-4"></div>
                            <p className="font-mono uppercase tracking-widest animate-pulse">Processing Logic...</p>
                        </div>
                    )}

                    {/* Audit Result */}
                    {auditResult && activeTab === 'audit' && (
                        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
                                <div>
                                    <h3 className="text-lg font-bold text-white">System Diagnostics</h3>
                                    <p className="text-zinc-400 text-sm italic">"{auditResult.verdict}"</p>
                                </div>
                                <div className="text-center bg-zinc-900 p-3 rounded border border-zinc-800">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase">Stability</div>
                                    <div className={`text-3xl font-black ${auditResult.score > 70 ? 'text-emerald-500' : auditResult.score > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                                        {auditResult.score}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2"><CheckCircle2 size={12} /> Structural Integrity</h4>
                                    <ul className="space-y-2">
                                        {auditResult.pros.map((p, i) => (
                                            <li key={i} className="text-sm text-zinc-300 flex gap-2"><span className="text-emerald-500/50">OK</span> {p}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2"><AlertTriangle size={12} /> Critical Failures</h4>
                                    <ul className="space-y-2">
                                        {auditResult.cons.map((c, i) => (
                                            <li key={i} className="text-sm text-zinc-300 flex gap-2"><span className="text-red-500/50">ERR</span> {c}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-yellow-900/10 border border-yellow-500/20 p-4 rounded">
                                    <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">Optimization Protocol</h4>
                                    <ul className="space-y-2">
                                        {auditResult.recommendations.map((r, i) => (
                                            <li key={i} className="text-sm text-zinc-300 flex gap-2"><span className="text-yellow-500/50">::</span> {r}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Code Result */}
                    {codeResult && activeTab === 'fabricator' && (
                        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">
                                    {codeResult.language}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveToVault}
                                        disabled={saved}
                                        className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded transition-colors ${saved ? 'text-emerald-500 bg-emerald-900/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                                    >
                                        {saved ? <Check size={14} /> : <Save size={14} />}
                                        {saved ? 'SAVED' : 'SAVE TO VAULT'}
                                    </button>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white px-3 py-1.5 hover:bg-zinc-800 rounded transition-colors"
                                    >
                                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                        {copied ? 'COPIED' : 'COPY SOURCE'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 bg-black border border-zinc-800 rounded-lg overflow-hidden relative group">
                                <pre className="p-4 text-sm font-mono text-emerald-400 h-full overflow-auto custom-scrollbar">
                                    <code>{codeResult.code}</code>
                                </pre>
                            </div>

                            <div className="mt-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Logic Explanation</h4>
                                <p className="text-sm text-zinc-300 leading-relaxed">{codeResult.explanation}</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};