import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Handshake, Trash2, Briefcase, Crown, Megaphone, Star, User, X, Copy, Check, Loader2 } from 'lucide-react';
import { Contact, ContactCategory, NegotiationPrep } from '../types';
import { geminiService } from '../services/geminiService';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';

/**
 * TheNetwork component following Cyberpunk Design System v3
 * Relationship Intelligence & Contact Management
 */

export const TheNetwork: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'add' | 'details'>('list');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // New Contact Form State
    const [newContact, setNewContact] = useState<Partial<Contact>>({
        category: 'lead'
    });

    // AI Action State
    const [loading, setLoading] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
    const [negPrep, setNegPrep] = useState<NegotiationPrep | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('solo_network');
        if (saved) {
            try { setContacts(JSON.parse(saved)); } catch (e) { }
        }
    }, []);

    const saveContacts = (newContacts: Contact[]) => {
        setContacts(newContacts);
        localStorage.setItem('solo_network', JSON.stringify(newContacts));
    };

    const handleAddContact = async () => {
        if (!newContact.name || !newContact.company) return;

        const contact: Contact = {
            id: `contact-${Date.now()}`,
            name: newContact.name!,
            role: newContact.role || 'Unknown',
            company: newContact.company!,
            category: newContact.category as ContactCategory,
            email: newContact.email || '',
            notes: newContact.notes || '',
            lastContact: new Date().toISOString()
        };

        saveContacts([...contacts, contact]);
        setNewContact({ category: 'lead' });
        setViewMode('list');

        const { leveledUp } = await addXP(20);
        showToast("ASSET ACQUIRED", "Contact added to network.", "xp", 20);
        if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
        soundService.playSuccess();
    };

    const handleDelete = (id: string) => {
        if (confirm("Burn this contact?")) {
            saveContacts(contacts.filter(c => c.id !== id));
            if (selectedContact?.id === id) {
                setSelectedContact(null);
                setViewMode('list');
            }
            soundService.playClick();
        }
    };

    const handleGenerateEmail = async () => {
        if (!selectedContact) return;
        setLoading(true);
        setGeneratedEmail(null);
        setNegPrep(null);
        soundService.playClick();

        const email = await geminiService.generateColdEmail(selectedContact);
        if (email) {
            setGeneratedEmail(email);
            const { leveledUp } = await addXP(30);
            showToast("COMMS DRAFTED", "Cold email generated.", "xp", 30);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        }
        setLoading(false);
    };

    const handleNegPrep = async () => {
        if (!selectedContact) return;
        setLoading(true);
        setGeneratedEmail(null);
        setNegPrep(null);
        soundService.playClick();

        const prep = await geminiService.generateNegotiationPrep(selectedContact);
        if (prep) {
            setNegPrep(prep);
            const { leveledUp } = await addXP(50);
            showToast("STRATEGY READY", "Negotiation profile compiled.", "xp", 50);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        }
        setLoading(false);
    };

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        soundService.playClick();
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryColor = (cat: ContactCategory) => {
        switch (cat) {
            case 'investor': return 'text-neon-lime bg-neon-lime/10 border-neon-lime/30';
            case 'vip': return 'text-neon-orange bg-neon-orange/10 border-neon-orange/30';
            case 'media': return 'text-neon-magenta bg-neon-magenta/10 border-neon-magenta/30';
            case 'partner': return 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30';
            default: return 'text-gray-400 bg-dark-card border-gray-700';
        }
    };

    const getCategoryIcon = (cat: ContactCategory) => {
        switch (cat) {
            case 'investor': return <Briefcase size={14} />;
            case 'vip': return <Crown size={14} />;
            case 'media': return <Megaphone size={14} />;
            case 'partner': return <Handshake size={14} />;
            default: return <User size={14} />;
        }
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-700 pb-6 gap-4 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 text-neon-cyan font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Users size={14} /> Relationship Intelligence
                    </div>
                    <h2 className="font-orbitron text-3xl md:text-4xl font-bold uppercase tracking-wider text-white">THE NETWORK</h2>
                    <p className="font-mono text-gray-400 mt-2">Manage high-value assets, investors, and strategic partners.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {viewMode === 'list' && (
                        <button
                            onClick={() => setViewMode('add')}
                            className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 border-2 border-neon-cyan bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 hover:shadow-[0_0_15px_rgba(11,228,236,0.5)] rounded-sm font-mono font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            <Plus size={16} /> Add Asset
                        </button>
                    )}
                    {viewMode !== 'list' && (
                        <button
                            onClick={() => setViewMode('list')}
                            className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 border-2 border-gray-600 bg-dark-card hover:border-neon-magenta hover:text-neon-magenta text-gray-400 rounded-sm font-mono font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            <X size={16} /> Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Views */}
            {viewMode === 'list' && (
                <div className="flex-1 flex flex-col">
                    <div className="mb-6 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search network..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-dark-card border-2 border-gray-700 rounded-sm pl-10 pr-4 py-3 font-mono text-white placeholder:text-gray-500 focus:border-neon-cyan focus:outline-none focus:shadow-[0_0_10px_rgba(11,228,236,0.3)]"
                        />
                    </div>

                    {contacts.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-600 opacity-50 min-h-[300px]">
                            <Users size={64} strokeWidth={1} />
                            <p className="mt-4 font-mono uppercase tracking-widest text-sm">Network Offline</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredContacts.map(contact => (
                                <div
                                    key={contact.id}
                                    onClick={() => { setSelectedContact(contact); setViewMode('details'); }}
                                    className="bg-dark-card border-2 border-gray-700 p-4 rounded-sm hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(11,228,236,0.2)] transition-all cursor-pointer group relative"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`px-2 py-1 rounded-sm border text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${getCategoryColor(contact.category)}`}>
                                            {getCategoryIcon(contact.category)} {contact.category}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(contact.id); }}
                                            className="text-gray-600 hover:text-neon-magenta opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <h3 className="font-orbitron text-lg font-bold text-white mb-1">{contact.name}</h3>
                                    <p className="text-sm font-mono text-gray-400 mb-4">{contact.role} @ {contact.company}</p>

                                    <div className="pt-3 border-t border-gray-700 flex justify-between items-center">
                                        <span className="text-[10px] text-gray-600 font-mono uppercase">
                                            Last Contact: {new Date(contact.lastContact || '').toLocaleDateString()}
                                        </span>
                                        <ArrowIcon />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'add' && (
                <div className="max-w-2xl mx-auto w-full bg-dark-card border-2 border-neon-cyan rounded-sm p-8 shadow-[0_0_30px_rgba(11,228,236,0.2)]">
                    <h3 className="font-orbitron text-lg font-bold text-neon-cyan mb-6 border-b border-gray-700 pb-4">New Network Asset</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-mono font-bold text-gray-500 uppercase mb-1 block">Name</label>
                                <input
                                    type="text"
                                    value={newContact.name || ''}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 font-mono text-white placeholder:text-gray-500 focus:border-neon-cyan focus:outline-none focus:shadow-[0_0_10px_rgba(11,228,236,0.3)]"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-mono font-bold text-gray-500 uppercase mb-1 block">Company</label>
                                <input
                                    type="text"
                                    value={newContact.company || ''}
                                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                                    className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 font-mono text-white placeholder:text-gray-500 focus:border-neon-cyan focus:outline-none focus:shadow-[0_0_10px_rgba(11,228,236,0.3)]"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-mono font-bold text-gray-500 uppercase mb-1 block">Role</label>
                                <input
                                    type="text"
                                    value={newContact.role || ''}
                                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                                    className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 font-mono text-white placeholder:text-gray-500 focus:border-neon-cyan focus:outline-none focus:shadow-[0_0_10px_rgba(11,228,236,0.3)]"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-mono font-bold text-gray-500 uppercase mb-1 block">Category</label>
                                <select
                                    value={newContact.category}
                                    onChange={(e) => setNewContact({ ...newContact, category: e.target.value as ContactCategory })}
                                    className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 font-mono text-white focus:border-neon-cyan focus:outline-none focus:shadow-[0_0_10px_rgba(11,228,236,0.3)]"
                                >
                                    <option value="lead">Lead</option>
                                    <option value="investor">Investor</option>
                                    <option value="partner">Partner</option>
                                    <option value="media">Media</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-mono font-bold text-gray-500 uppercase mb-1 block">Email</label>
                            <input
                                type="email"
                                value={newContact.email || ''}
                                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 font-mono text-white placeholder:text-gray-500 focus:border-neon-cyan focus:outline-none focus:shadow-[0_0_10px_rgba(11,228,236,0.3)]"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-mono font-bold text-gray-500 uppercase mb-1 block">Intel Notes</label>
                            <textarea
                                value={newContact.notes || ''}
                                onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                                className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 font-mono text-white placeholder:text-gray-500 focus:border-neon-cyan focus:outline-none focus:shadow-[0_0_10px_rgba(11,228,236,0.3)] h-32 resize-none"
                                placeholder="Context, interests, pain points..."
                            />
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={handleAddContact}
                                disabled={!newContact.name || !newContact.company}
                                className="w-full py-3 border-2 border-neon-cyan bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 hover:shadow-[0_0_15px_rgba(11,228,236,0.5)] rounded-sm font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Add to Network
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'details' && selectedContact && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    {/* Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-dark-card border-2 border-gray-700 rounded-sm p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-dark-bg border-2 border-neon-purple rounded-sm flex items-center justify-center text-neon-purple">
                                    <User size={32} />
                                </div>
                                <div>
                                    <h3 className="font-orbitron text-xl font-bold text-white">{selectedContact.name}</h3>
                                    <p className="font-mono text-gray-400">{selectedContact.role} @ {selectedContact.company}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm border text-xs font-mono font-bold uppercase tracking-wider ${getCategoryColor(selectedContact.category)}`}>
                                    {getCategoryIcon(selectedContact.category)} {selectedContact.category}
                                </div>

                                {selectedContact.email && (
                                    <div className="flex items-center gap-2 text-sm font-mono text-gray-300">
                                        <Mail size={14} className="text-gray-500" /> {selectedContact.email}
                                    </div>
                                )}
                            </div>

                            <div className="bg-dark-bg rounded-sm p-4 border-2 border-gray-700 mb-6">
                                <h4 className="text-xs font-orbitron font-bold text-neon-cyan uppercase tracking-widest mb-2">Intel Notes</h4>
                                <p className="text-sm font-mono text-gray-300 leading-relaxed">{selectedContact.notes}</p>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={handleGenerateEmail}
                                    disabled={loading}
                                    className="w-full py-3 bg-dark-hover border-2 border-gray-700 hover:border-neon-magenta hover:text-neon-magenta text-white rounded-sm font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Mail size={14} /> Draft Cold Email (Echo)
                                </button>
                                <button
                                    onClick={handleNegPrep}
                                    disabled={loading}
                                    className="w-full py-3 bg-dark-hover border-2 border-gray-700 hover:border-neon-cyan hover:text-neon-cyan text-white rounded-sm font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Handshake size={14} /> Negotiation Prep (Lexi)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* AI Output Panel */}
                    <div className="lg:col-span-2 bg-dark-bg border-2 border-gray-700 rounded-sm p-8 relative overflow-hidden flex flex-col min-h-[500px]">
                        {!generatedEmail && !negPrep && !loading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-700 opacity-50">
                                <Star size={64} strokeWidth={1} />
                                <p className="mt-4 font-mono uppercase tracking-widest text-sm">Select an Intelligence Action</p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-neon-cyan">
                                <Loader2 size={48} className="animate-spin mb-4" />
                                <p className="font-mono uppercase tracking-widest animate-pulse">Analyst Agents Working...</p>
                            </div>
                        )}

                        {generatedEmail && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                                    <h3 className="font-orbitron text-lg font-bold text-white flex items-center gap-2">
                                        <Mail size={18} className="text-neon-magenta" /> Drafted Comms
                                    </h3>
                                    <button onClick={() => copyText(generatedEmail)} className="text-gray-500 hover:text-neon-cyan flex items-center gap-2 text-xs font-mono font-bold uppercase">
                                        {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Text'}
                                    </button>
                                </div>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">{generatedEmail}</p>
                                </div>
                            </div>
                        )}

                        {negPrep && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                                <div className="flex justify-between items-center mb-2 pb-4 border-b border-gray-700">
                                    <h3 className="font-orbitron text-lg font-bold text-white flex items-center gap-2">
                                        <Handshake size={18} className="text-neon-cyan" /> Negotiation Strategy
                                    </h3>
                                </div>

                                <div className="bg-dark-card border-l-4 border-neon-cyan p-4 rounded-sm">
                                    <h4 className="text-xs font-orbitron font-bold text-neon-cyan uppercase tracking-widest mb-2">Core Strategy</h4>
                                    <p className="font-mono text-gray-300">{negPrep.strategy}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-xs font-orbitron font-bold text-neon-purple uppercase tracking-widest mb-3">Leverage Points</h4>
                                        <ul className="space-y-2">
                                            {negPrep.leveragePoints.map((p, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm font-mono text-gray-300">
                                                    <span className="text-neon-cyan font-bold">›</span> {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-orbitron font-bold text-neon-orange uppercase tracking-widest mb-3">Psych Profile</h4>
                                        <p className="text-sm font-mono text-gray-400 leading-relaxed">{negPrep.psychologicalProfile}</p>
                                    </div>
                                </div>

                                <div className="bg-dark-card border-2 border-gray-700 p-4 rounded-sm">
                                    <h4 className="text-xs font-orbitron font-bold text-neon-lime uppercase tracking-widest mb-2">Recommended Opening</h4>
                                    <p className="text-white font-mono font-medium italic">"{negPrep.openingLine}"</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 12L10 8L6 4" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
