import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, FileText, MessageSquare, Users, Flag, TrendingUp, Filter } from 'lucide-react';
import { searchService, SearchResult } from '../services/searchService';

interface UniversalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (path: string) => void;
}

export function UniversalSearch({ isOpen, onClose, onNavigate }: UniversalSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setRecentSearches(searchService.getRecentSearches());
        } else {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        const searchDebounced = setTimeout(async () => {
            setIsLoading(true);
            const searchResults = await searchService.search(query);
            setResults(searchResults);
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(searchDebounced);
    }, [query]);

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery);
        if (searchQuery.trim()) {
            searchService.saveRecentSearch(searchQuery);
        }
    };

    const handleSelect = (result: SearchResult) => {
        onNavigate(result.path);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    const getIconForType = (type: SearchResult['type']) => {
        switch (type) {
            case 'task': return <Flag size={16} />;
            case 'chat': return <MessageSquare size={16} />;
            case 'contact': return <Users size={16} />;
            case 'report': return <TrendingUp size={16} />;
            default: return <FileText size={16} />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4 font-mono">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Search Modal */}
            <div
                className="relative w-full max-w-2xl bg-dark-bg border-2 border-neon-cyan/30 rounded-sm shadow-[0_0_30px_rgba(11,228,236,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onKeyDown={handleKeyDown}
            >
                {/* Search Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-gray-800 bg-dark-card/50">
                    <Search className="text-neon-cyan" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search tasks, chats, contacts, reports..."
                        className="flex-1 bg-transparent border-none text-lg text-white placeholder-gray-600 focus:outline-none font-mono"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-2 hover:bg-neon-cyan/10 hover:text-neon-cyan text-gray-500 rounded-sm transition-colors"
                        title="Filters"
                    >
                        <Filter size={18} className={showFilters ? 'text-neon-cyan' : 'text-gray-500'} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neon-magenta/10 hover:text-neon-magenta text-gray-500 rounded-sm transition-colors"
                        title="Close (Esc)"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-dark-bg">
                    {isLoading ? (
                        <div className="py-12 text-center">
                            <div className="inline-block w-6 h-6 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-500 text-sm mt-4 font-mono">SCANNING...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="p-2">
                            {results.map((result, index) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`w-full flex items-start gap-4 p-4 rounded-sm transition-all text-left ${index === selectedIndex
                                            ? 'bg-neon-cyan/10 border-l-2 border-neon-cyan'
                                            : 'hover:bg-dark-hover border-l-2 border-transparent'
                                        }`}
                                >
                                    <div className={`p-2 rounded-sm ${index === selectedIndex ? 'bg-dark-bg text-neon-cyan' : 'bg-dark-card text-gray-500'
                                        }`}>
                                        {getIconForType(result.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`font-bold text-sm font-mono ${index === selectedIndex ? 'text-white' : 'text-gray-300'}`}>{result.title}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-dark-card px-2 py-0.5 rounded-sm border border-gray-800">
                                                {result.type}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2 font-mono">{result.snippet}</p>
                                        <p className="text-xs text-gray-600 mt-1 font-mono">{new Date(result.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : query.trim().length >= 2 ? (
                        <div className="py-12 text-center text-gray-600">
                            <Search size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-mono uppercase tracking-widest text-sm">No results found for "{query}"</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <p className="text-xs uppercase tracking-wider text-neon-cyan font-bold mb-4 font-mono">Recent Protocols</p>
                            {recentSearches.length > 0 ? (
                                <div className="space-y-2">
                                    {recentSearches.map((search, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSearch(search)}
                                            className="flex items-center gap-3 w-full p-3 rounded-sm hover:bg-dark-hover border border-transparent hover:border-gray-700 transition-all text-left group"
                                        >
                                            <Clock size={14} className="text-gray-600 group-hover:text-neon-cyan" />
                                            <span className="text-sm text-gray-400 group-hover:text-white font-mono">{search}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600 text-center py-8 font-mono">
                                    Initiate search query...
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t-2 border-gray-800 px-6 py-3 bg-dark-card flex items-center justify-between text-xs text-gray-500 font-mono">
                    <div className="flex gap-4">
                        <span><strong className="text-neon-cyan">↑↓</strong> Navigate</span>
                        <span><strong className="text-neon-cyan">↵</strong> Select</span>
                        <span><strong className="text-neon-cyan">Esc</strong> Close</span>
                    </div>
                    <div>
                        <strong>Cmd+/</strong> to open
                    </div>
                </div>
            </div>
        </div>
    );
}
