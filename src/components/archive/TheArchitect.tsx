import React, { useState, useEffect } from 'react';
import { Box, Plus, FileCode, CheckCircle2, Loader2, Database, Layers, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ProductSpec, Task, AgentId } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';

/**
 * TheArchitect component following Cyberpunk Design System v3
 * Transform ideas into technical requirements and PRDs
 */

export const TheArchitect: React.FC = () => {
    const [idea, setIdea] = useState('');
    const [specs, setSpecs] = useState<ProductSpec[]>([]);
    const [activeSpec, setActiveSpec] = useState<ProductSpec | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
    const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);

    useEffect(() => {
        if (activeSpec) {
            // Select all by default when loading a spec
            setSelectedFeatures(activeSpec.features.map((_, i) => i));
        }
    }, [activeSpec]);

    useEffect(() => {
        const loadSpecs = async () => {
            const saved = await storageService.getProductSpecs();
            setSpecs(saved);
        };
        loadSpecs();
    }, []);

    const saveSpecs = async (newSpecs: ProductSpec[]) => {
        setSpecs(newSpecs);
        await storageService.saveProductSpecs(newSpecs);
    };

    const handleGenerate = async () => {
        if (!idea.trim()) return;
        setLoading(true);
        setActiveSpec(null);
        soundService.playClick();

        const result = await geminiService.generateProductSpec(idea);
        if (result) {
            const newSpecs = [result, ...specs];
            saveSpecs(newSpecs);
            setActiveSpec(result);
            setIdea('');

            const { leveledUp } = await addXP(100);
            showToast("PRD GENERATED", "Specs drafted successfully.", "xp", 100);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        } else {
            showToast("GENERATION FAILED", "Could not create specs.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    const handleDelete = (id: string) => {
        if (confirm("Delete this specification?")) {
            const newSpecs = specs.filter(s => s.id !== id);
            saveSpecs(newSpecs);
            if (activeSpec?.id === id) setActiveSpec(null);
            soundService.playClick();
        }
    };

    const handleDeployToRoadmap = async (spec: ProductSpec) => {
        const currentTasks = await storageService.getTasks();

        const featuresToDeploy = spec.features.filter((_, i) => selectedFeatures.includes(i));

        if (featuresToDeploy.length === 0) {
            showToast("NO FEATURES SELECTED", "Please select at least one feature to deploy.", "error");
            return;
        }

        const newTasks: Task[] = featuresToDeploy.map((feat, i) => ({
            id: `task-spec-${spec.id}-${Date.now()}-${i}`,
            title: `Build: ${feat.name}`,
            description: `User Story: ${feat.userStory}\n\nAcceptance Criteria:\n${feat.acceptanceCriteria.join('\n')}\n\nTech Notes: ${feat.techNotes}`,
            assignee: AgentId.GLITCH, // Default to Tech
            status: 'backlog', // Default to Backlog to avoid clutter
            priority: 'medium',
            estimatedTime: '4h',
            createdAt: new Date().toISOString(),
            rewrittenContent: ''
        }));

        const updatedTasks = [...currentTasks, ...newTasks];
        await storageService.saveTasks(updatedTasks);

        const { leveledUp } = await addXP(50);
        showToast("SPECS DEPLOYED", "Features added to Roadmap.", "xp", 50);
        if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
        soundService.playSuccess();
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b border-gray-700 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-neon-cyan font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Box size={14} /> Product Specification
                    </div>
                    <h2 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">THE ARCHITECT</h2>
                    <p className="font-mono text-gray-400 mt-2">Transform ideas into technical requirements and PRDs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

                {/* Sidebar / History */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Plus size={14} /> New Specification
                        </h3>
                        <textarea
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="Describe the feature (e.g. 'A referral system where users get 10% off for inviting friends')..."
                            className="w-full h-32 bg-black border border-zinc-700 rounded p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-mono text-sm mb-4"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !idea.trim()}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <><FileCode size={16} /> Generate PRD</>}
                        </button>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-y-auto max-h-[300px] md:max-h-[400px] custom-scrollbar">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 ml-2">Spec Archive</h3>
                        <div className="space-y-2">
                            {specs.map(spec => (
                                <div
                                    key={spec.id}
                                    onClick={() => setActiveSpec(spec)}
                                    className={`p-3 rounded border cursor-pointer transition-all group relative
                                        ${activeSpec?.id === spec.id
                                            ? 'bg-blue-900/20 border-blue-500/50 text-white'
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                                        }
                                    `}
                                >
                                    <div className="font-bold text-sm mb-1 truncate pr-6">{spec.featureName}</div>
                                    <div className="text-[10px] font-mono opacity-60">{new Date(spec.generatedAt).toLocaleDateString()}</div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(spec.id); }}
                                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {specs.length === 0 && <div className="text-center text-zinc-600 text-xs py-8">No specs archived.</div>}
                        </div>
                    </div>
                </div>

                {/* Main Spec View */}
                <div className="lg:col-span-2">
                    {!activeSpec && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50 min-h-[400px] border-2 border-dashed border-zinc-800 rounded-xl">
                            <Layers size={64} strokeWidth={1} />
                            <p className="mt-4 font-mono uppercase tracking-widest text-sm">Select or Generate a Spec</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-blue-400 min-h-[400px]">
                            <Loader2 size={48} className="animate-spin mb-4" />
                            <p className="font-mono uppercase tracking-widest animate-pulse">Architecting Solution...</p>
                        </div>
                    )}

                    {activeSpec && (
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start mb-6 pb-6 border-b border-zinc-800">
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-2">{activeSpec.featureName}</h2>
                                    <p className="text-zinc-400 text-sm">{activeSpec.summary}</p>
                                </div>
                                <button
                                    onClick={() => handleDeployToRoadmap(activeSpec)}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-all"
                                >
                                    <CheckCircle2 size={14} /> Deploy {selectedFeatures.length} Tasks
                                </button>
                            </div>

                            {/* Features List */}
                            <div className="space-y-4 mb-8">
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Layers size={14} /> Functional Requirements
                                </h3>
                                {activeSpec.features.map((feat, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="pt-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedFeatures.includes(i)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedFeatures([...selectedFeatures, i]);
                                                    } else {
                                                        setSelectedFeatures(selectedFeatures.filter(f => f !== i));
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900"
                                            />
                                        </div>
                                        <div className="flex-1 border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden">
                                            <button
                                                onClick={() => setExpandedFeature(expandedFeature === i ? null : i)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-zinc-900 transition-colors text-left"
                                            >
                                                <div className="font-bold text-zinc-200 text-sm">{feat.name}</div>
                                                {expandedFeature === i ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                                            </button>

                                            {expandedFeature === i && (
                                                <div className="p-4 border-t border-zinc-800 bg-black/20 space-y-4">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">User Story</span>
                                                        <p className="text-sm text-zinc-300 italic">"{feat.userStory}"</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Acceptance Criteria</span>
                                                        <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                                                            {feat.acceptanceCriteria.map((ac, idx) => (
                                                                <li key={idx}>{ac}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="bg-zinc-900 p-3 rounded border border-zinc-800">
                                                        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider block mb-1">Tech Notes</span>
                                                        <p className="text-xs text-zinc-400 font-mono">{feat.techNotes}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Data Model */}
                            <div>
                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Database size={14} /> Proposed Data Model
                                </h3>
                                <div className="bg-black border border-zinc-800 p-4 rounded-lg font-mono text-xs text-emerald-400 leading-relaxed">
                                    {activeSpec.dataModel.map((line, i) => (
                                        <div key={i}>{line}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
