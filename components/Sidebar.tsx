import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Eye, ShieldAlert, Swords, Flame, KanbanSquare, Power, Search, Command, Settings, Trophy, ChevronUp, NotebookPen, X, Menu, Coins, Radio, Palette, Presentation, BookTemplate, Archive, Terminal, GitBranch, Scale, Mic, Crown, Compass, Moon, Box, GraduationCap, Flag, Megaphone, Rocket, UserPlus } from 'lucide-react';
import { AGENTS } from '../constants';
import { AgentId, BusinessContext } from '../types';
import { getUserProgress, subscribeToToasts, getXPForLevel } from '../services/gameService';
import { soundService } from '../services/soundService';

interface SidebarProps {
    currentView: string;
    setCurrentView: (view: string) => void;
    activeAgent: AgentId | null;
    setActiveAgent: (id: AgentId | null) => void;
    onOpenPalette: () => void;
    isMobileOpen: boolean;
    onCloseMobile: () => void;
    onToggleScratchpad: () => void;
}

type NavCategory = {
    title: string;
    items: {
        id: string;
        label: string;
        icon: React.ReactNode;
        colorClass: string; // Text color class for active state or icon
        onClick?: () => void;
    }[];
};

export const Sidebar: React.FC<SidebarProps> = ({
    currentView,
    setCurrentView,
    activeAgent,
    setActiveAgent,
    onOpenPalette,
    isMobileOpen,
    onCloseMobile,
    onToggleScratchpad
}) => {
    const router = useRouter();
    const [companyName, setCompanyName] = useState('SOLO_SUCCESS');
    const [progress, setProgress] = useState({
        level: 1,
        currentXP: 0,
        nextLevelXP: 100,
        rankTitle: 'Garage Hacker',
        totalActions: 0
    });
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

    const toggleCategory = (title: string) => {
        setCollapsedCategories(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Load initial progress
        const loadProgress = async () => {
            const p = await getUserProgress();
            setProgress(p);
        };
        loadProgress();

        const checkAdmin = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                const res = await fetch(`${API_URL}/api/user`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const user = await res.json();
                if (user.role === 'admin') {
                    setIsAdmin(true);
                }
            } catch (e) {
                console.error('Failed to check admin status', e);
            }
        };
        checkAdmin();

        const saved = localStorage.getItem('solo_business_context');
        if (saved) {
            try {
                const ctx: BusinessContext = JSON.parse(saved);
                if (ctx && ctx.companyName) {
                    setCompanyName(ctx.companyName.toUpperCase().replace(/\s/g, '_'));
                }
            } catch (e) {
                console.error('Failed to parse business context', e);
            }
        }

        return subscribeToToasts(async (toast) => {
            if (toast.newProgress) {
                setProgress(toast.newProgress);
            } else {
                const p = await getUserProgress();
                setProgress(p);
            }
            soundService.playSuccess();
        });
    }, []);

    const navCategories: NavCategory[] = [
        {
            title: "Command",
            items: [
                { id: 'dashboard', label: 'Mission Control', icon: <LayoutDashboard size={18} />, colorClass: 'text-white' },
                { id: 'chat', label: 'Agent Uplink', icon: <Users size={18} />, colorClass: 'text-white' } // Special handling for chat below
            ]
        },
        {
            title: "Intelligence",
            items: [
                { id: 'stalker', label: 'Competitor Stalker', icon: <Eye size={18} />, colorClass: 'text-white' },
                { id: 'signal', label: 'Signal Tower', icon: <Radio size={18} className="text-cyan-500" />, colorClass: 'text-cyan-400' },
                { id: 'pivot', label: 'The Pivot', icon: <Compass size={18} className="text-cyan-400" />, colorClass: 'text-cyan-400' }
            ]
        },
        {
            title: "Strategy",
            items: [
                { id: 'war-room', label: 'The War Room', icon: <Swords size={18} />, colorClass: 'text-white' },
                { id: 'simulator', label: 'The Simulator', icon: <GitBranch size={18} className="text-indigo-400" />, colorClass: 'text-indigo-400' },
                { id: 'codex', label: 'The Codex', icon: <BookTemplate size={18} className="text-indigo-500" />, colorClass: 'text-indigo-500' },
                { id: 'tribe', label: 'The Tribe', icon: <Flag size={18} className="text-pink-400" />, colorClass: 'text-pink-400' },
                { id: 'boardroom', label: 'The Boardroom', icon: <Crown size={18} className="text-amber-200" />, colorClass: 'text-amber-100' }
            ]
        },
        {
            title: "Product & Tech",
            items: [
                { id: 'architect', label: 'The Architect', icon: <Box size={18} className="text-blue-300" />, colorClass: 'text-blue-300' },
                { id: 'mainframe', label: 'The Mainframe', icon: <Terminal size={18} className="text-yellow-500" />, colorClass: 'text-yellow-500' },
                { id: 'studio', label: 'The Studio', icon: <Palette size={18} className="text-pink-500" />, colorClass: 'text-pink-500' },
                { id: 'amplifier', label: 'The Amplifier', icon: <Megaphone size={18} className="text-pink-500" />, colorClass: 'text-pink-500' },
                { id: 'incinerator', label: 'Idea Incinerator', icon: <Flame size={18} className="text-orange-500" />, colorClass: 'text-orange-500' },
                { id: 'deck', label: 'The Deck', icon: <Presentation size={18} className="text-purple-500" />, colorClass: 'text-purple-500' }
            ]
        },
        {
            title: "Operations",
            items: [
                { id: 'roadmap', label: 'Tactical Roadmap', icon: <KanbanSquare size={18} />, colorClass: 'text-white' },
                { id: 'launchpad', label: 'The Launchpad', icon: <Rocket size={18} className="text-orange-500" />, colorClass: 'text-orange-500' },
                { id: 'network', label: 'The Network', icon: <Users size={18} className="text-blue-500" />, colorClass: 'text-blue-500' },
                { id: 'scout', label: 'The Scout', icon: <UserPlus size={18} className="text-indigo-400" />, colorClass: 'text-indigo-400' },
                { id: 'treasury', label: 'The Treasury', icon: <Coins size={18} className="text-amber-500" />, colorClass: 'text-amber-500' },
                { id: 'ironclad', label: 'The Ironclad', icon: <Scale size={18} className="text-slate-400" />, colorClass: 'text-slate-300' }
            ]
        },
        {
            title: "System",
            items: [
                { id: 'uplink', label: 'Voice Uplink', icon: <Mic size={18} className="text-red-500" />, colorClass: 'text-red-400' },
                { id: 'academy', label: 'The Academy', icon: <GraduationCap size={18} className="text-white" />, colorClass: 'text-white' },
                { id: 'sanctuary', label: 'The Sanctuary', icon: <Moon size={18} className="text-zinc-300" />, colorClass: 'text-zinc-200' },
                { id: 'billing', label: 'Billing & Plan', icon: <Coins size={18} className="text-emerald-400" />, colorClass: 'text-emerald-400' },
                { id: 'vault', label: 'The Vault', icon: <Archive size={18} />, colorClass: 'text-white' },
                ...(isAdmin ? [{
                    id: 'admin-dashboard',
                    label: 'Admin Control',
                    icon: <ShieldAlert size={18} className="text-emerald-500" />,
                    colorClass: 'text-emerald-500',
                    onClick: () => router.push('/app/admin/login')
                }] : [])
            ]
        }
    ];

    const navItemClass = (isActive: boolean, colorClass: string = 'text-white', label: string) => `
    flex items-center gap-3 px-4 py-2.5 min-h-[44px] text-base md:text-sm font-medium transition-all duration-200 cursor-pointer group rounded-lg mr-2 relative overflow-hidden
    ${isActive
            ? `glass-subtle ${colorClass} shadow-lg border-l-2 border-${colorClass.split('-')[1]}-500`
            : 'text-zinc-400 hover:glass-subtle hover:text-white border-l-2 border-transparent hover-lift'}
  `;

    const handleNavClick = (action: () => void) => {
        soundService.playClick();
        action();
        if (window.innerWidth < 768) onCloseMobile();
    };

    const handleMouseEnter = () => soundService.playHover();

    const handleLogout = () => {
        soundService.playClick();
        if (confirm("Reboot System? This will clear your session context.")) {

            localStorage.removeItem('solo_business_context');
            window.location.reload();
        }
    }

    const levelBase = getXPForLevel(progress.level);
    const levelCap = progress.nextLevelXP;
    const percent = Math.min(100, Math.max(0, ((progress.currentXP - levelBase) / (levelCap - levelBase)) * 100));

    return (
        <>
            {isMobileOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 md:hidden animate-fade-in" onClick={onCloseMobile} />
            )}

            <div className={`
          w-64 glass-strong border-r border-white/10 flex flex-col h-full fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out shadow-2xl
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
                {/* Branding */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center shrink-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-violet-900/5 relative overflow-hidden">
                    {/* Animated background accent */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />

                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tighter truncate max-w-[160px] text-shadow-glow animate-slide-in-left">
                            {companyName}<span className="text-gradient">_AI</span>
                        </h1>
                        <p className="text-[10px] text-emerald-500/60 mt-1 font-mono tracking-widest uppercase">V2.0.0 • Online</p>
                    </div>
                    <button
                        onClick={onCloseMobile}
                        className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all hover-scale active:scale-90"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Enhanced Rank Widget */}
                <div className="px-4 py-4 border-b border-white/5 shrink-0 animate-slide-in-bottom">
                    <div className="glass-card hover-lift hover-glow rounded-lg p-4 relative overflow-hidden group cursor-pointer">
                        {/* Animated background decoration */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-all duration-300 text-emerald-500 group-hover:scale-110">
                            <Trophy size={36} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gradient uppercase tracking-widest">Level {progress.level}</span>
                                <span className="text-xs font-mono text-zinc-400">{progress.currentXP.toLocaleString()} XP</span>
                            </div>
                            <div className="text-sm font-bold text-white mb-3 truncate flex items-center gap-2">
                                {progress.rankTitle}
                                <ChevronUp size={14} className="text-emerald-400 opacity-50" />
                            </div>

                            {/* Animated Progress Bar */}
                            <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden relative">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.6)] relative"
                                    style={{ width: `${percent}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                                </div>
                            </div>

                            {/* XP to next level */}
                            <div className="mt-2 text-[10px] text-zinc-500 text-right font-mono">
                                {(levelCap - progress.currentXP).toLocaleString()} to Lvl {progress.level + 1}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Quick Actions */}
                <div className="px-4 py-3 flex gap-2 shrink-0 border-b border-white/5">
                    <button
                        onClick={() => handleNavClick(onOpenPalette)}
                        onMouseEnter={handleMouseEnter}
                        className="flex-1 glass-subtle hover:glass-panel border border-zinc-700/50 hover:border-emerald-500/50 text-zinc-400 hover:text-white rounded-lg px-3 py-2.5 text-xs font-mono flex items-center justify-between transition-all group hover-lift"
                    >
                        <div className="flex items-center gap-2">
                            <Search size={14} className="group-hover:text-emerald-400 transition-colors" />
                            <span>Search...</span>
                        </div>
                        <div className="hidden md:block opacity-50 group-hover:opacity-100 text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">⌘K</div>
                    </button>
                    <button
                        onClick={() => handleNavClick(onToggleScratchpad)}
                        onMouseEnter={handleMouseEnter}
                        className="w-11 glass-subtle hover:glass-panel border border-zinc-700/50 hover:border-white text-zinc-400 hover:text-white rounded-lg flex items-center justify-center transition-all hover-scale active:scale-90"
                        title="Toggle Scratchpad"
                        aria-label="Toggle scratchpad"
                    >
                        <NotebookPen size={16} />
                    </button>
                </div>

                {/* Navigation List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 pt-3">
                    {navCategories.map((cat, i) => (
                        <div key={i} className="mb-4 md:mb-6 animate-slide-in-left" style={{ animationDelay: `${i * 50}ms` }}>
                            <button
                                onClick={() => toggleCategory(cat.title)}
                                className="w-full px-4 py-2 flex items-center justify-between group"
                            >
                                <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-2 group-hover:text-zinc-400 transition-colors">
                                    <div className="w-2 h-[2px] bg-zinc-700 rounded" />
                                    {cat.title}
                                </h3>
                                <ChevronUp
                                    size={12}
                                    className={`text-zinc-600 transition-transform duration-300 ${collapsedCategories[cat.title] ? 'rotate-180' : ''}`}
                                />
                            </button>

                            <div className={`space-y-0.5 overflow-hidden transition-all duration-300 ${collapsedCategories[cat.title] ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                                {cat.items.map(item => {
                                    if (item.id === 'chat') {
                                        return (
                                            <div key={item.id} className="relative">
                                                <div
                                                    onClick={() => handleNavClick(() => setCurrentView(item.id))}
                                                    onMouseEnter={handleMouseEnter}
                                                    className={navItemClass(currentView === item.id, item.colorClass, item.label)}
                                                >
                                                    <div className={`transition-colors duration-300 ${currentView === item.id ? item.colorClass : 'text-zinc-500 group-hover:text-white'}`}>
                                                        {item.icon}
                                                    </div>
                                                    <span className="truncate">{item.label}</span>
                                                </div>
                                                {/* Sub-menu for Agents */}
                                                {currentView === 'chat' && (
                                                    <div className="ml-9 mt-1 space-y-1 border-l border-white/10 pl-2 animate-fade-in">
                                                        {Object.values(AGENTS).map(agent => (
                                                            <button
                                                                key={agent.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveAgent(agent.id);
                                                                    soundService.playClick();
                                                                }}
                                                                className={`
                                                                    w-full text-left px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-2
                                                                    ${activeAgent === agent.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                                                                `}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full ${agent.color.replace('text-', 'bg-')}`} />
                                                                {agent.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleNavClick(item.onClick || (() => setCurrentView(item.id)))}
                                            onMouseEnter={handleMouseEnter}
                                            className={navItemClass(currentView === item.id, item.colorClass, item.label)}
                                        >
                                            <div className={`transition-colors duration-300 ${currentView === item.id ? item.colorClass : 'text-zinc-500 group-hover:text-white'}`}>
                                                {item.icon}
                                            </div>
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-white/5 shrink-0 bg-black/20">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-zinc-500 transition-all group"
                    >
                        <Power size={16} className="group-hover:rotate-90 transition-transform" />
                        <span className="text-xs font-medium">System Reboot</span>
                    </button>
                </div>
            </div>
        </>
    );
};