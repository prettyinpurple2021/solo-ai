import React, { useState, useEffect } from 'react';
import { Terminal, ArrowRight, Check, Save, SkipForward, Target, Briefcase, User, Building, Zap } from 'lucide-react';
import { BusinessContext, AgentId } from '../types';
import { storageService } from '../services/storageService';
import { logError } from '../lib/logger';

interface SystemBootProps {
    onComplete: () => void;
}

export const SystemBoot: React.FC<SystemBootProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0); // 0: Boot, 1: Identity, 2: Mission, 3: Goals, 4: Preview, 5: Success
    const [bootLogs, setBootLogs] = useState<string[]>([]);
    const [formData, setFormData] = useState<BusinessContext>({
        founderName: '',
        companyName: '',
        industry: '',
        description: '',
        goals: ['', '', ''], // 3 empty goals
        brandDna: { 
            onboardingStatus: 'draft',
            tone: { formalVsCasual: 50, playfulVsSerious: 50, modernVsClassic: 50 },
            personas: [],
            coreValues: [],
            bannedWords: []
        } // Initialize with draft status
    });

    // Load saved progress from DB on mount
    useEffect(() => {
        const loadProgress = async (): Promise<void> => {
            try {
                const context = await storageService.getContext();
                if (context) {
                    setFormData(prev => ({
                        ...prev,
                        ...context,
                        goals: context.goals && context.goals.length > 0 ? context.goals : ['', '', ''],
                        brandDna: { ...prev.brandDna, ...context.brandDna, personas: context.brandDna?.personas || [], coreValues: context.brandDna?.coreValues || [], bannedWords: context.brandDna?.bannedWords || [] }
                    }));

                    // If we have saved data (founder name or company name), skip the boot animation
                    // This improves the experience when resuming from "Save and Exit"
                    if (context.founderName || context.companyName) {
                        setStep(1);
                    }
                }
            } catch (e) {
                logError("Failed to load saved progress", e);
            }
        };
        loadProgress();
    }, []);

    useEffect(() => {
        // Initial Boot Sequence Simulation
        if (step === 0) {
            const logs = [
                "SOLO_SUCCESS_AI BIOS V2.1.0",
                "CHECKING_MEMORY... OK",
                "LOADING_NEURAL_ENGINE... OK",
                "INITIALIZING_AGENTS... [ROXY, ECHO, LEXI, GLITCH]... ONLINE",
                "MOUNTING_DRIVE... OK",
                "CONNECTING_SECURE_LAYER... ESTABLISHED"
            ];

            let delay = 0;
            logs.forEach((log, i) => {
                delay += Math.random() * 300 + 100;
                setTimeout(() => {
                    setBootLogs(prev => [...prev, log]);
                    if (i === logs.length - 1) {
                        setTimeout(() => setStep(1), 800);
                    }
                }, delay);
            });
        }
    }, [step]);

    const saveProgress = async (status: 'draft' | 'completed' = 'draft') => {
        const updatedData: BusinessContext = {
            ...formData,
            brandDna: { 
                personas: [],
                coreValues: [],
                bannedWords: [],
                ...(formData.brandDna || {}),
                onboardingStatus: status 
            }
        };
        await storageService.saveContext(updatedData);
        return updatedData;
    };

    const completeOnboarding = async () => {
        // Save context as completed
        const finalData = await saveProgress('completed');

        // Create initial tasks from goals
        for (const goal of finalData.goals) {
            if (goal && typeof goal === 'string' && goal.trim()) {
                await storageService.addTask({
                    id: crypto.randomUUID(),
                    title: goal,
                    description: 'Initial onboarding goal',
                    status: 'todo',
                    priority: 'high',
                    assignee: AgentId.ROXY,
                    estimatedTime: '1h',
                    createdAt: new Date().toISOString()
                });
            }
        }

        // We don't use localStorage for persistence anymore, but we can set a flag for the current session
        // to avoid re-checking DB immediately if we wanted, but App.tsx will handle the check.
        setTimeout(onComplete, 2000);
    };

    const handleNext = async () => {
        await saveProgress('draft');
        if (step < 5) {
            setStep(step + 1);
        } else {
            // Finalize
            await completeOnboarding();
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSkip = async () => {
        if (confirm("Skip onboarding? You can configure your profile later in Settings.")) {
            // Mark as completed (skipped is effectively completed for the purpose of not showing it again)
            // We could add a 'skipped' status if we wanted to distinguish.
            await saveProgress('completed');
            onComplete();
        }
    };

    const handleSaveAndExit = async () => {
        await saveProgress('draft');
        // Mark as temporarily skipped for this session only
        sessionStorage.setItem('solo_onboarding_temp_skip', 'true');
        alert("Progress saved to database. You can resume later.");
        onComplete();
    };

    const updateGoal = (index: number, value: string) => {
        const newGoals = [...formData.goals];
        newGoals[index] = value;
        setFormData({ ...formData, goals: newGoals });
    };

    // Render Steps
    if (step === 0) {
        return (
            <div className="h-screen bg-dark-bg text-neon-cyan font-mono p-8 flex flex-col justify-end pb-20">
                {bootLogs.map((log, i) => (
                    <div key={i} className="mb-1 text-sm opacity-80">{log}</div>
                ))}
                <div className="animate-pulse">_</div>
            </div>
        );
    }

    if (step === 5) {
        return (
            <div className="h-screen bg-dark-bg flex items-center justify-center">
                <div className="text-center animate-in zoom-in duration-500">
                    <div className="w-24 h-24 border-4 border-neon-lime rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-[0_0_30px_rgba(57,255,20,0.4)]">
                        <Check size={48} className="text-neon-lime" />
                    </div>
                    <h1 className="font-orbitron text-3xl font-bold uppercase tracking-wider text-white mb-2">SYSTEM INITIALIZED</h1>
                    <p className="text-neon-cyan font-mono">WELCOME TO MISSION CONTROL, {formData.founderName.toUpperCase()}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-3xl z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <Terminal className="text-neon-cyan" />
                        <h2 className="font-orbitron text-xl text-white font-bold tracking-widest uppercase">System Configuration</h2>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={handleSaveAndExit} className="text-gray-500 hover:text-neon-cyan text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors">
                            <Save size={14} /> Save Progress
                        </button>
                        <button onClick={handleSkip} className="text-gray-500 hover:text-neon-orange text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors">
                            <SkipForward size={14} /> Skip Setup
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 mb-12">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`h-1 flex-1 rounded-sm transition-all duration-500 ${step >= s ? 'bg-neon-cyan shadow-[0_0_10px_rgba(11,228,236,0.5)]' : 'bg-gray-700'}`} />
                    ))}
                </div>

                {/* Step Content */}
                <div className="min-h-[400px]">
                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right duration-500">
                            <div className="space-y-2">
                                <p className="text-neon-cyan font-mono text-sm uppercase tracking-widest">Step 1: Identity Protocol</p>
                                <h1 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">Who is taking command?</h1>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-gray-400 text-sm font-mono font-bold uppercase"><User size={16} /> Founder Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={formData.founderName}
                                        onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                                        className="w-full bg-dark-card border-2 border-gray-700 rounded-sm p-4 text-xl text-white font-mono focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(11,228,236,0.3)] transition-all"
                                        placeholder="e.g. Sarah Connor"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-gray-400 text-sm font-mono font-bold uppercase"><Building size={16} /> Company Name</label>
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full bg-dark-card border-2 border-gray-700 rounded-sm p-4 text-xl text-white font-mono focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(11,228,236,0.3)] transition-all"
                                        placeholder="e.g. Skynet Systems"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right duration-500">
                            <div className="space-y-2">
                                <p className="text-neon-cyan font-mono text-sm uppercase tracking-widest">Step 2: Mission Parameters</p>
                                <h1 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">Define your battlefield.</h1>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-gray-400 text-sm font-mono font-bold uppercase"><Briefcase size={16} /> Industry / Sector</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                        className="w-full bg-dark-card border-2 border-gray-700 rounded-sm p-4 text-xl text-white font-mono focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(11,228,236,0.3)] transition-all"
                                        placeholder="e.g. Artificial Intelligence"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-gray-400 text-sm font-mono font-bold uppercase"><Target size={16} /> Mission Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full bg-dark-card border-2 border-gray-700 rounded-sm p-4 text-xl text-white font-mono focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(11,228,236,0.3)] transition-all resize-none"
                                        placeholder="What is your primary objective?"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right duration-500">
                            <div className="space-y-2">
                                <p className="text-neon-cyan font-mono text-sm uppercase tracking-widest">Step 3: Tactical Objectives</p>
                                <h1 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">Set your first 3 targets.</h1>
                                <p className="text-gray-400 font-mono">These will be converted into your initial Task List.</p>
                            </div>
                            <div className="space-y-4">
                                {formData.goals.map((goal, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-sm bg-neon-cyan/20 flex items-center justify-center text-neon-cyan font-mono font-bold">{i + 1}</div>
                                        <input
                                            autoFocus={i === 0}
                                            type="text"
                                            value={goal}
                                            onChange={(e) => updateGoal(i, e.target.value)}
                                            className="flex-1 bg-dark-card border-2 border-gray-700 rounded-sm p-4 text-lg text-white font-mono focus:border-neon-cyan focus:shadow-[0_0_15px_rgba(11,228,236,0.3)] transition-all"
                                            placeholder={`Objective #${i + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-in slide-in-from-right duration-500">
                            <div className="space-y-2">
                                <p className="text-neon-cyan font-mono text-sm uppercase tracking-widest">Step 4: System Preview</p>
                                <h1 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">Your arsenal is ready.</h1>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-dark-card border-2 border-gray-700 rounded-sm hover:border-neon-lime/50 transition-colors">
                                    <div className="flex items-center gap-2 mb-2 text-neon-lime font-mono font-bold uppercase text-xs tracking-wider">
                                        <Zap size={14} /> The War Room
                                    </div>
                                    <p className="text-sm text-gray-400 font-mono">AI-powered strategy sessions to break down your goals into actionable plans.</p>
                                </div>
                                <div className="p-4 bg-dark-card border-2 border-gray-700 rounded-sm hover:border-neon-cyan/50 transition-colors">
                                    <div className="flex items-center gap-2 mb-2 text-neon-cyan font-mono font-bold uppercase text-xs tracking-wider">
                                        <Target size={14} /> Competitor Stalker
                                    </div>
                                    <p className="text-sm text-gray-400 font-mono">Deep-dive analysis of your competition to find gaps and opportunities.</p>
                                </div>
                                <div className="p-4 bg-dark-card border-2 border-gray-700 rounded-sm hover:border-neon-purple/50 transition-colors">
                                    <div className="flex items-center gap-2 mb-2 text-neon-purple font-mono font-bold uppercase text-xs tracking-wider">
                                        <Briefcase size={14} /> The Boardroom
                                    </div>
                                    <p className="text-sm text-gray-400 font-mono">Simulated advisory board of AI experts (CEO, CFO, CMO, CTO) for holistic advice.</p>
                                </div>
                                <div className="p-4 bg-dark-card border-2 border-gray-700 rounded-sm hover:border-neon-orange/50 transition-colors">
                                    <div className="flex items-center gap-2 mb-2 text-neon-orange font-mono font-bold uppercase text-xs tracking-wider">
                                        <Terminal size={14} /> Universal Search
                                    </div>
                                    <p className="text-sm text-gray-400 font-mono">Instant access to all your tasks, contacts, reports, and system knowledge.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-12 pt-8 border-t-2 border-gray-700">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`text-gray-400 hover:text-neon-cyan font-mono font-bold uppercase tracking-wider transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 border-2 border-neon-cyan bg-neon-cyan/10 text-neon-cyan px-8 py-4 rounded-sm font-mono font-bold uppercase tracking-wider hover:bg-neon-cyan/20 hover:shadow-[0_0_30px_rgba(11,228,236,0.4)] transition-all"
                    >
                        {step === 4 ? 'INITIALIZE SYSTEM' : 'NEXT'} <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
