import React, { useState } from 'react';
import { Crown, Briefcase, Loader2, CheckCircle2, AlertOctagon, FileText, MessageSquare } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { BoardMeetingReport,} from '../types';
import { AGENTS } from '../constants';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';
import { BoardroomChat } from './boardroom/BoardroomChat';

/**
 * TheBoardroom component following Cyberpunk Design System v3
 * Holistic Quarterly Business Review (QBR) and Grading
 */

export const TheBoardroom: React.FC = () => {
    const [report, setReport] = useState<BoardMeetingReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeChat, setActiveChat] = useState(false);

    const handleConvene = async () => {
        setLoading(true);
        setReport(null);
        setActiveChat(false);
        soundService.playClick();


        // Fetch data from DB via storageService
        const context = await storageService.getContext();
        const financials = {
            currentCash: context?.currentCash || 0,
            monthlyBurn: context?.monthlyBurn || 0,
            monthlyRevenue: context?.monthlyRevenue || 0,
            growthRate: context?.growthRate || 0
        };

        const tasks = await storageService.getTasks();
        const reports = await storageService.getCompetitorReports();

        // Get contacts from backend/storage
        const contacts = await storageService.getContacts();

        // Default fallbacks if data missing
        if (!financials.currentCash) financials.currentCash = 0;

        const result = await geminiService.generateBoardReport(financials, tasks, reports, contacts);

        if (result) {
            setReport(result);
            const { leveledUp } = await addXP(150);
            showToast("BOARD MEETING ADJOURNED", "Quarterly review generated.", "xp", 150);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        } else {
            showToast("MEETING CANCELED", "Could not convene board.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'text-neon-lime border-neon-lime bg-neon-lime/10';
            case 'B': return 'text-neon-cyan border-neon-cyan bg-neon-cyan/10';
            case 'C': return 'text-neon-orange border-neon-orange bg-neon-orange/10';
            case 'D': return 'text-neon-purple border-neon-purple bg-neon-purple/10';
            default: return 'text-neon-magenta border-neon-magenta bg-neon-magenta/10';
        }
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b border-gray-700 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-neon-orange font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Crown size={14} /> Executive Review
                    </div>
                    <h2 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">THE BOARDROOM</h2>
                    <p className="font-mono text-gray-400 mt-2">Holistic Quarterly Business Review (QBR) and Grading.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveChat(!activeChat)}
                        className={`flex items-center gap-2 px-6 py-4 border-2 border-neon-purple bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 rounded-sm font-mono font-bold text-sm uppercase tracking-widest transition-all`}
                    >
                        <MessageSquare size={18} />
                        {activeChat ? 'View Report' : 'Enter Discussion'}
                    </button>
                    <button
                        onClick={handleConvene}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-4 border-2 border-neon-cyan bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(11,228,236,0.5)] rounded-sm font-mono font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Briefcase size={18} />}
                        {loading ? 'Board in Session...' : 'Convene Board'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                {activeChat ? (
                    <div className="w-full max-w-4xl">
                        <BoardroomChat sessionId="session-1" />
                    </div>
                ) : (
                    <>
                        {!report && !loading && (
                            <div className="text-center opacity-50 text-gray-500">
                                <div className="w-24 h-24 border-2 border-gray-700 rounded-sm flex items-center justify-center mx-auto mb-6">
                                    <Briefcase size={48} />
                                </div>
                                <h3 className="font-orbitron text-xl font-bold text-white mb-2">Boardroom Empty</h3>
                                <p className="font-mono uppercase tracking-widest text-sm">Call a meeting to review company performance.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="w-full max-w-2xl">
                                <div className="flex items-center justify-between mb-2 text-xs font-mono font-bold uppercase tracking-widest text-gray-500">
                                    <span>Gathering Intelligence...</span>
                                    <span className="animate-pulse text-neon-cyan">Processing</span>
                                </div>
                                <div className="h-1 w-full bg-dark-card rounded-sm overflow-hidden">
                                    <div className="h-full bg-neon-cyan animate-[width_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
                                </div>
                                <div className="mt-8 grid grid-cols-5 gap-4 opacity-50">
                                    {Object.values(AGENTS).map(a => (
                                        <div key={a.id} className="flex flex-col items-center animate-pulse">
                                            <img src={a.avatar} className="w-12 h-12 rounded-sm grayscale mb-2 border border-gray-700" alt={a.name} />
                                            <span className="text-[10px] font-mono">{a.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {report && (
                            <div className="w-full max-w-6xl animate-in slide-in-from-bottom-8 duration-700">

                                {/* CEO Score Card */}
                                <div className="bg-dark-card border-2 border-neon-cyan rounded-sm p-8 mb-8 relative overflow-hidden shadow-[0_0_30px_rgba(11,228,236,0.2)]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-neon-orange/10 to-transparent pointer-events-none"></div>
                                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                        <div className="shrink-0 text-center">
                                            <div className="text-xs font-orbitron font-bold text-neon-cyan uppercase tracking-widest mb-2">CEO Performance Score</div>
                                            <div className="relative w-40 h-40 flex items-center justify-center">
                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="8" />
                                                    <circle
                                                        cx="50" cy="50" r="45" fill="none" stroke="#0be4ec" strokeWidth="8"
                                                        strokeDasharray="283"
                                                        strokeDashoffset={283 - (283 * report.ceoScore / 100)}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute text-5xl font-orbitron font-bold text-neon-cyan">{report.ceoScore}</div>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-orbitron text-xl md:text-2xl font-bold text-white mb-2 md:mb-4">Executive Summary</h3>
                                            <p className="text-base md:text-lg font-mono text-gray-300 leading-relaxed">
                                                "{report.executiveSummary}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Department Grades */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                                    {report.grades.map((grade, i) => {
                                        const agent = AGENTS[grade.agentId];
                                        return (
                                            <div key={i} className="bg-dark-card border-2 border-gray-700 p-4 rounded-sm flex flex-col relative group hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(11,228,236,0.2)] transition-all">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <img src={agent.avatar} className="w-10 h-10 rounded-sm border-2 border-gray-700" alt={agent.name} />
                                                    <div>
                                                        <div className={`text-xs font-orbitron font-bold uppercase ${agent.color}`}>{agent.name}</div>
                                                        <div className="text-[10px] text-gray-500 font-mono">{grade.department}</div>
                                                    </div>
                                                </div>

                                                <div className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-sm border-2 font-orbitron font-bold text-xl ${getGradeColor(grade.grade)}`}>
                                                    {grade.grade}
                                                </div>

                                                <div className="text-xs font-mono text-gray-300 mb-4 min-h-[60px]">
                                                    "{grade.summary}"
                                                </div>

                                                <div className="mt-auto pt-3 border-t border-gray-700">
                                                    <div className="text-[10px] font-orbitron font-bold text-neon-magenta uppercase mb-1 flex items-center gap-1">
                                                        <AlertOctagon size={10} /> Critical Issue
                                                    </div>
                                                    <div className="text-xs font-mono text-gray-400">{grade.keyIssue}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Final Consensus - Cyberpunk styled */}
                                <div className="bg-dark-card border-2 border-neon-lime rounded-sm p-8 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
                                    <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-4">
                                        <CheckCircle2 className="text-neon-lime" size={24} />
                                        <h3 className="font-orbitron text-xl font-bold uppercase tracking-tight text-white">Board Consensus & Direction</h3>
                                    </div>
                                    <p className="text-lg font-mono text-gray-300 leading-relaxed">
                                        {report.consensus}
                                    </p>
                                    <div className="mt-6 flex justify-end">
                                        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-gray-500">
                                            <FileText size={14} /> Report Generated: {new Date(report.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
