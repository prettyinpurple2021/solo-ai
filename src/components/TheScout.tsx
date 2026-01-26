import React, { useState } from 'react';
import { UserPlus, Users, CheckCircle2, Copy, Loader2, Briefcase, ListTodo, Ear } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { JobDescription, InterviewGuide, SOP } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';

/**
 * TheScout component following Cyberpunk Design System v3
 * Recruit, Vet, and Delegate with military precision
 */

export const TheScout: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'recruit' | 'vet' | 'delegate'>('recruit');
    const [loading, setLoading] = useState(false);
    const [ setCopied] = useState(false);

    // Recruit State
    const [roleTitle, setRoleTitle] = useState('');
    const [employmentType, setEmploymentType] = useState('Freelance');
    const [jd, setJd] = useState<JobDescription (null);

    // Vet State
    const [vetRole, setVetRole] = useState('');
    const [vetFocus, setVetFocus] = useState('');
    const [guide, setGuide] = useState<InterviewGuide (null);

    // Delegate State
    const [taskName, setTaskName] = useState('');
    const [sop, setSop] = useState<SOP (null);

    const handleRecruit = async () => {
        if (!roleTitle.trim()) return;
        setLoading(true);
        setJd(null);
        soundService.playClick();
        const result = await geminiService.generateJobDescription(roleTitle, employmentType);
        if (result) {
            setJd(result);

            // Save to Vault
            await storageService.saveJobDescription(result);

            addXP(40);
            showToast("JD GENERATED", "Recruitment beacon lit.", "xp", 40);
            soundService.playSuccess();
        }
        setLoading(false);
    };

    const handleVet = async () => {
        if (!vetRole.trim() || !vetFocus.trim()) return;
        setLoading(true);
        setGuide(null);
        soundService.playClick();
        const result = await geminiService.generateInterviewGuide(vetRole, vetFocus);
        if (result) {
            setGuide(result);
            addXP(40);
            showToast("GUIDE COMPILED", "Interrogation protocols ready.", "xp", 40);
            soundService.playSuccess();
        }
        setLoading(false);
    };

    const handleDelegate = async () => {
        if (!taskName.trim()) return;
        setLoading(true);
        setSop(null);
        soundService.playClick();
        const result = await geminiService.generateSOP(taskName);
        if (result) {
            setSop(result);
            addXP(50);
            showToast("SOP CODIFIED", "Delegation protocol established.", "xp", 50);
            soundService.playSuccess();
        }
        setLoading(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        soundService.playClick();
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b border-gray-700 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-neon-purple font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <UserPlus size={14} /> Talent Operations
                    </div>
                    <h2 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">THE SCOUT</h2>
                    <p className="font-mono text-gray-400 mt-2">Recruit, Vet, and Delegate with military precision.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-gray-700 overflow-x-auto pb-1 scrollbar-hide">
                <button onClick={() => setActiveTab('recruit')} className={`pb-4 px-4 text-sm font-mono font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === 'recruit' ? 'border-neon-purple text-neon-purple' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                    <span className="flex items-center gap-2"><Briefcase size={16} /> Recruit</span>
                </button>
                <button onClick={() => setActiveTab('vet')} className={`pb-4 px-4 text-sm font-mono font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === 'vet' ? 'border-neon-purple text-neon-purple' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                    <span className="flex items-center gap-2"><Ear size={16} /> Vet</span>
                </button>
                <button onClick={() => setActiveTab('delegate')} className={`pb-4 px-4 text-sm font-mono font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === 'delegate' ? 'border-neon-purple text-neon-purple' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                    <span className="flex items-center gap-2"><ListTodo size={16} /> Delegate</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

                {/* Input Column */}
                <div className="bg-dark-card border-2 border-gray-700 rounded-sm p-6 h-fit">
                    {activeTab === 'recruit' && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-orbitron font-bold text-neon-cyan uppercase tracking-widest mb-4">Job Configuration</h3>
                            <div>
                                <label className="block text-xs font-mono text-gray-400 font-bold mb-1">Role Title</label>
                                <input type="text" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 font-mono text-white placeholder:text-gray-500 focus:border-neon-purple focus:outline-none focus:shadow-[0_0_10px_rgba(179,0,255,0.3)]" placeholder="e.g. Social Media Manager" />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-gray-400 font-bold mb-1">Type</label>
                                <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 font-mono text-white focus:border-neon-purple focus:outline-none focus:shadow-[0_0_10px_rgba(179,0,255,0.3)]">
                                    <option>Freelance / Contract</option>
                                    <option>Full-Time Employee</option>
                                    <option>Part-Time</option>
                                </select>
                            </div>
                            <button onClick={handleRecruit} disabled={loading || !roleTitle.trim()} className="w-full py-3 border-2 border-neon-purple bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 hover:shadow-[0_0_15px_rgba(179,0,255,0.5)] rounded-sm font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-4">
                                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Generate JD'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'vet' && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-orbitron font-bold text-neon-orange uppercase tracking-widest mb-4">Interview Setup</h3>
                            <div>
                                <label className="block text-xs font-mono text-gray-400 font-bold mb-1">Role</label>
                                <input type="text" value={vetRole} onChange={(e) => setVetRole(e.target.value)} className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 font-mono text-white placeholder:text-gray-500 focus:border-neon-purple focus:outline-none focus:shadow-[0_0_10px_rgba(179,0,255,0.3)]" placeholder="e.g. React Developer" />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-gray-400 font-bold mb-1">Primary Focus</label>
                                <input type="text" value={vetFocus} onChange={(e) => setVetFocus(e.target.value)} className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 font-mono text-white placeholder:text-gray-500 focus:border-neon-purple focus:outline-none focus:shadow-[0_0_10px_rgba(179,0,255,0.3)]" placeholder="e.g. Speed, Attention to Detail, Culture Fit" />
                            </div>
                            <button onClick={handleVet} disabled={loading || !vetRole.trim()} className="w-full py-3 border-2 border-neon-purple bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 hover:shadow-[0_0_15px_rgba(179,0,255,0.5)] rounded-sm font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-4">
                                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Compile Questions'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'delegate' && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-orbitron font-bold text-neon-lime uppercase tracking-widest mb-4">SOP Builder</h3>
                            <div>
                                <label className="block text-xs font-mono text-gray-400 font-bold mb-1">Task Name</label>
                                <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 font-mono text-white placeholder:text-gray-500 focus:border-neon-purple focus:outline-none focus:shadow-[0_0_10px_rgba(179,0,255,0.3)]" placeholder="e.g. Weekly Newsletter Formatting" />
                            </div>
                            <button onClick={handleDelegate} disabled={loading || !taskName.trim()} className="w-full py-3 border-2 border-neon-purple bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 hover:shadow-[0_0_15px_rgba(179,0,255,0.5)] rounded-sm font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-4">
                                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Codify Process'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Output Column */}
                <div className="lg:col-span-2 bg-dark-bg border-2 border-gray-700 rounded-sm p-8 min-h-[500px] relative overflow-y-auto custom-scrollbar">
                    {!jd && !guide && !sop && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                            <Users size={64} strokeWidth={1} />
                            <p className="mt-4 font-mono uppercase tracking-widest text-sm">Awaiting Personnel Directives</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-neon-purple">
                            <Loader2 size={48} className="animate-spin mb-4" />
                            <p className="font-mono uppercase tracking-widest animate-pulse">Consulting HR Matrix...</p>
                        </div>
                    )}

                    {activeTab === 'recruit' && jd && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start border-b border-gray-700 pb-4">
                                <div>
                                    <h2 className="font-orbitron text-2xl font-bold text-white">{jd.roleTitle}</h2>
                                    <p className="font-mono text-neon-purple italic text-lg mt-2">"{jd.hook}"</p>
                                </div>
                                <button onClick={() => copyToClipboard(JSON.stringify(jd, null, 2))} className="text-gray-500 hover:text-neon-cyan transition-colors"><Copy size={16} /></button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-xs font-orbitron font-bold text-neon-cyan uppercase tracking-widest mb-3">Responsibilities</h4>
                                    <ul className="space-y-2">
                                        {jd.responsibilities.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm font-mono text-gray-300"><span className="text-neon-cyan">›</span> {item}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-orbitron font-bold text-neon-orange uppercase tracking-widest mb-3">Requirements</h4>
                                    <ul className="space-y-2">
                                        {jd.requirements.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm font-mono text-gray-300"><span className="text-neon-orange">•</span> {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-neon-purple/10 border-2 border-neon-purple/20 p-4 rounded-sm">
                                <h4 className="text-xs font-orbitron font-bold text-neon-purple uppercase tracking-widest mb-3">The Perks (Why Us?)</h4>
                                <ul className="space-y-2">
                                    {jd.perks.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm font-mono text-gray-300"><CheckCircle2 size={14} className="text-neon-lime mt-0.5" /> {item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vet' && guide && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="font-orbitron text-2xl font-bold text-white border-b border-gray-700 pb-4">Interview Protocol: {guide.roleTitle}</h2>
                            <div className="space-y-6">
                                {guide.questions.map((q, i) => (
                                    <div key={i} className="bg-dark-card border-2 border-gray-700 p-4 rounded-sm">
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="bg-neon-purple text-dark-bg w-6 h-6 flex items-center justify-center rounded-sm font-mono font-bold text-xs shrink-0">{i + 1}</span>
                                            <p className="text-white font-mono font-medium">{q.question}</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pl-9">
                                            <div className="text-neon-lime">
                                                <span className="font-orbitron font-bold text-xs uppercase block mb-1 text-neon-lime">Green Flag</span>
                                                <span className="font-mono text-gray-300">{q.whatToLookFor}</span>
                                            </div>
                                            <div className="text-neon-magenta">
                                                <span className="font-orbitron font-bold text-xs uppercase block mb-1 text-neon-magenta">Red Flag</span>
                                                <span className="font-mono text-gray-300">{q.redFlag}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'delegate' && sop && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="border-b border-gray-700 pb-4">
                                <h2 className="font-orbitron text-2xl font-bold text-white">{sop.taskName}</h2>
                                <p className="font-mono text-gray-400 text-sm mt-1">Goal: {sop.goal}</p>
                            </div>

                            <div className="space-y-4">
                                {sop.steps.map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-sm bg-dark-card border-2 border-gray-700 flex items-center justify-center font-mono font-bold text-neon-cyan">{step.step}</div>
                                            {i < sop.steps.length - 1 && <div className="w-0.5 flex-1 bg-gray-700 my-2"></div>}
                                        </div>
                                        <div className="pb-4">
                                            <h4 className="font-orbitron text-white font-bold mb-1">{step.action}</h4>
                                            <p className="text-sm font-mono text-gray-400 leading-relaxed">{step.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-neon-lime/10 border-2 border-neon-lime/20 p-4 rounded-sm flex items-start gap-3">
                                <CheckCircle2 className="text-neon-lime mt-0.5" size={18} />
                                <div>
                                    <h4 className="text-xs font-orbitron font-bold text-neon-lime uppercase tracking-widest mb-1">Definition of Done</h4>
                                    <p className="text-sm font-mono text-gray-300">{sop.successCriteria}</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
