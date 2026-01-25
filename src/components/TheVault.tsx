import React, { useState, useEffect } from 'react';
import { Archive, Search, Eye, Swords, Presentation, Palette, Clock, Trash2, Download, LayoutGrid, List as ListIcon, Code } from 'lucide-react';
import { CompetitorReport, SavedWarRoomSession, PitchDeck, CreativeAsset, SavedCodeSnippet } from '../types';
import { soundService } from '../services/soundService';
import { generateCompetitorMarkdown, generateWarRoomMarkdown, downloadMarkdown } from '../services/exportService';
import { logError } from '@/lib/logger';

/**
 * TheVault component following Cyberpunk Design System v3
 * Centralized archive for intelligence, strategy, and assets
 */


// Allowed MIME type prefixes for base64 images
// Note: SVG is intentionally excluded because SVG can contain script tags and other active content
// which makes it unsafe for direct rendering from untrusted sources
const SAFE_IMAGE_PREFIXES = [
    'data:image/png;base64,',
    'data:image/jpeg;base64,',
    'data:image/jpg;base64,',
    'data:image/gif;base64,',
    'data:image/webp;base64,'
] as const;

// Validate that a string is a safe base64 image data URL
// Returns the sanitized URL if valid, or empty string if invalid
function getSafeImageSrc(src: unknown): string {
    if (typeof src !== 'string' || !src) {
        return '';
    }
    
    // Check if the source starts with one of the allowed prefixes
    const matchedPrefix = SAFE_IMAGE_PREFIXES.find(prefix => src.startsWith(prefix));
    if (!matchedPrefix) {
        return '';
    }
    
    // Extract the base64 content and validate it contains only valid base64 characters
    const base64Content = src.slice(matchedPrefix.length);
    // Base64 characters are A-Z, a-z, 0-9, +, /, and = for padding
    // Require at least one character before optional padding
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64Content)) {
        return '';
    }
    
    // Return the validated and reconstructed URL
    return matchedPrefix + base64Content;
}

type VaultTab = 'all' | 'intel' | 'strategy' | 'visuals' | 'decks' | 'code';

export const TheVault: React.FC = () => {
    const [activeTab, setActiveTab] = useState<VaultTab>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Data States
    const [reports, setReports] = useState<CompetitorReport[]>([]);
    const [sessions, setSessions] = useState<SavedWarRoomSession[]>([]);
    const [decks, setDecks] = useState<PitchDeck[]>([]);
    const [images, setImages] = useState<CreativeAsset[]>([]);
    const [snippets, setSnippets] = useState<SavedCodeSnippet[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        try {
            const r = localStorage.getItem('solo_competitor_reports');
            if (r) setReports(JSON.parse(r));

            const s = localStorage.getItem('solo_war_room_sessions');
            if (s) setSessions(JSON.parse(s));

            const d = localStorage.getItem('solo_pitch_decks');
            if (d) setDecks(JSON.parse(d));

            const i = localStorage.getItem('solo_creative_assets');
            if (i) setImages(JSON.parse(i));

            const c = localStorage.getItem('solo_code_snippets');
            if (c) setSnippets(JSON.parse(c));
        } catch (e) {
            logError('Vault load error', e);
        }
    };

    const handleDelete = (key: string, id: string, type: string) => {
        if (!confirm("Permanently delete this asset?")) return;

        const updatedData = (data: any[]) => data.filter((item: any) => {
            if (type === 'report') return item.generatedAt !== id;
            return item.id !== id;
        });

        let newData;
        if (type === 'report') {
            newData = updatedData(reports);
            setReports(newData);
            localStorage.setItem(key, JSON.stringify(newData));
        } else if (type === 'session') {
            newData = updatedData(sessions);
            setSessions(newData);
            localStorage.setItem(key, JSON.stringify(newData));
        } else if (type === 'deck') {
            newData = updatedData(decks);
            setDecks(newData);
            localStorage.setItem(key, JSON.stringify(newData));
        } else if (type === 'image') {
            newData = updatedData(images);
            setImages(newData);
            localStorage.setItem(key, JSON.stringify(newData));
        } else if (type === 'code') {
            newData = updatedData(snippets);
            setSnippets(newData);
            localStorage.setItem(key, JSON.stringify(newData));
        }
        soundService.playClick();
    };

    const handleDownload = (item: any, type: string) => {
        if (type === 'report') {
            const md = generateCompetitorMarkdown(item);
            downloadMarkdown(`Intel_${item.competitorName}`, md);
        } else if (type === 'session') {
            const md = generateWarRoomMarkdown(item.topic, item);
            downloadMarkdown(`WarRoom_${item.id}`, md);
        } else if (type === 'deck') {
            let content = `# ${item.title}\n\n`;
            item.slides.forEach((s: any, i: number) => {
                content += `## ${i + 1}. ${s.title}\n${s.keyPoint}\n\n`;
            });
            downloadMarkdown(`Deck_${item.title}`, content);
        } else if (type === 'image') {
            const safeImageSrc = getSafeImageSrc(item.imageBase64);
            if (!safeImageSrc) {
                logError('Invalid image source, download aborted');
                return;
            }
            const a = document.createElement('a');
            a.href = safeImageSrc;
            a.download = `asset_${item.id}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else if (type === 'code') {
            const blob = new Blob([item.code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `snippet_${item.id}.${item.language === 'python' ? 'py' : item.language === 'javascript' ? 'js' : 'txt'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    // Combined & Filtered Data
    const getFilteredItems = () => {
        let items: any[] = [];

        if (activeTab === 'all' || activeTab === 'intel') {
            items = [...items, ...reports.map(r => ({ ...r, _type: 'report', _id: r.generatedAt, _title: r.competitorName, _date: r.generatedAt }))];
        }
        if (activeTab === 'all' || activeTab === 'strategy') {
            items = [...items, ...sessions.map(s => ({ ...s, _type: 'session', _id: s.id, _title: s.topic, _date: s.timestamp }))];
        }
        if (activeTab === 'all' || activeTab === 'decks') {
            items = [...items, ...decks.map(d => ({ ...d, _type: 'deck', _id: d.id, _title: d.title, _date: d.generatedAt }))];
        }
        if (activeTab === 'all' || activeTab === 'visuals') {
            items = [...items, ...images.map(i => ({ ...i, _type: 'image', _id: i.id, _title: i.prompt, _date: i.generatedAt }))];
        }
        if (activeTab === 'all' || activeTab === 'code') {
            items = [...items, ...snippets.map(c => ({ ...c, _type: 'code', _id: c.id, _title: c.title, _date: c.timestamp }))];
        }

        return items.filter(item =>
            item._title.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime());
    };

    const filteredItems = getFilteredItems();

    const TypeIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'report': return <Eye size={16} className="text-neon-lime" />;
            case 'session': return <Swords size={16} className="text-neon-cyan" />;
            case 'deck': return <Presentation size={16} className="text-neon-purple" />;
            case 'image': return <Palette size={16} className="text-neon-magenta" />;
            case 'code': return <Code size={16} className="text-neon-orange" />;
            default: return <Archive size={16} />;
        }
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-700 pb-6 gap-4 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 text-neon-cyan font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Archive size={14} /> Secure Storage
                    </div>
                    <h2 className="font-orbitron text-3xl md:text-4xl font-bold uppercase tracking-wider text-white">THE VAULT</h2>
                    <p className="font-mono text-gray-400 mt-2">Centralized archive for intelligence, strategy, and assets.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-sm border-2 transition-all ${viewMode === 'grid' ? 'bg-dark-card border-neon-cyan text-neon-cyan' : 'border-gray-700 text-gray-500 hover:text-white hover:border-gray-600'}`}>
                        <LayoutGrid size={18} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-sm border-2 transition-all ${viewMode === 'list' ? 'bg-dark-card border-neon-cyan text-neon-cyan' : 'border-gray-700 text-gray-500 hover:text-white hover:border-gray-600'}`}>
                        <ListIcon size={18} />
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search archives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-dark-card border-2 border-gray-700 rounded-sm pl-10 pr-4 py-3 font-mono text-white placeholder:text-gray-500 focus:border-neon-cyan focus:outline-none focus:shadow-[0_0_10px_rgba(11,228,236,0.3)]"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {[
                        { id: 'all', label: 'All Assets' },
                        { id: 'intel', label: 'Intelligence' },
                        { id: 'strategy', label: 'War Rooms' },
                        { id: 'visuals', label: 'Studio' },
                        { id: 'decks', label: 'Pitch Decks' },
                        { id: 'code', label: 'Code' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as VaultTab)}
                            className={`px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all border-2 ${activeTab === tab.id
                                ? 'bg-dark-card border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(11,228,236,0.3)]'
                                : 'bg-dark-bg border-gray-700 text-gray-500 hover:text-white hover:border-gray-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid/List View */}
            {filteredItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-600 opacity-50 min-h-[300px]">
                    <Archive size={64} strokeWidth={1} />
                    <p className="mt-4 font-mono uppercase tracking-widest text-sm">Vault Empty</p>
                </div>
            ) : (
                <div className={`
                    ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}
                `}>
                    {filteredItems.map((item) => (
                        <div
                            key={item._id}
                            className={`bg-dark-card border-2 border-gray-700 rounded-sm p-4 group hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(11,228,236,0.2)] transition-all relative overflow-hidden
                                ${viewMode === 'list' ? 'flex items-center gap-4' : 'flex flex-col'}
                            `}
                        >
                            {/* Image Preview for Visuals */}
                            {item._type === 'image' && viewMode === 'grid' && (() => {
                                const safeImageSrc = getSafeImageSrc(item.imageBase64);
                                return (
                                    <div className="aspect-video w-full bg-dark-bg mb-4 rounded-sm overflow-hidden border-2 border-gray-700">
                                        {safeImageSrc ? (
                                            <img src={safeImageSrc} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="asset" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 bg-dark-bg font-mono">
                                                Invalid image source
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-sm bg-dark-bg border-2 border-gray-700`}>
                                        <TypeIcon type={item._type} />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold uppercase text-gray-500 tracking-wider">{item._type}</span>
                                </div>
                                {viewMode === 'grid' && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDownload(item, item._type)} className="p-1.5 text-gray-400 hover:text-neon-cyan bg-dark-hover border border-gray-700 rounded-sm"><Download size={14} /></button>
                                        <button onClick={() => handleDelete(
                                            item._type === 'report' ? 'solo_competitor_reports' :
                                                item._type === 'session' ? 'solo_war_room_sessions' :
                                                    item._type === 'deck' ? 'solo_pitch_decks' :
                                                        item._type === 'code' ? 'solo_code_snippets' : 'solo_creative_assets',
                                            item._id,
                                            item._type
                                        )} className="p-1.5 text-gray-400 hover:text-neon-magenta bg-dark-hover border border-gray-700 rounded-sm"><Trash2 size={14} /></button>
                                    </div>
                                )}
                            </div>

                            <h3 className={`font-orbitron font-bold text-gray-200 leading-tight mb-1 ${viewMode === 'grid' ? 'text-sm' : 'text-sm flex-1 truncate'}`}>
                                {item._title.length > 60 ? item._title.substring(0, 60) + '...' : item._title}
                            </h3>

                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-auto pt-2">
                                <Clock size={10} /> {new Date(item._date).toLocaleDateString()}
                            </div>

                            {viewMode === 'list' && (
                                <div className="flex gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDownload(item, item._type)} className="p-2 text-gray-400 hover:text-neon-cyan bg-dark-hover border border-gray-700 rounded-sm"><Download size={14} /></button>
                                    <button onClick={() => handleDelete(
                                        item._type === 'report' ? 'solo_competitor_reports' :
                                            item._type === 'session' ? 'solo_war_room_sessions' :
                                                item._type === 'deck' ? 'solo_pitch_decks' :
                                                    item._type === 'code' ? 'solo_code_snippets' : 'solo_creative_assets',
                                        item._id,
                                        item._type
                                    )} className="p-2 text-gray-400 hover:text-neon-magenta bg-dark-hover border border-gray-700 rounded-sm"><Trash2 size={14} /></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
