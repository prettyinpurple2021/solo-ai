import React, { useEffect } from 'react';
import { X, Command, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsOverlayProps {
    onClose: () => void;
}

export const KeyboardShortcutsOverlay: React.FC<KeyboardShortcutsOverlayProps> = ({ onClose }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const shortcuts = [
        {
            category: "Navigation",
            items: [
                { keys: ["Cmd", "/"], description: "Open Universal Search" },
                { keys: ["Cmd", "K"], description: "Open Command Palette" },
                { keys: ["?"], description: "Show Keyboard Shortcuts" },
                { keys: ["Esc"], description: "Close Overlays/Modals" }
            ]
        },
        {
            category: "Actions",
            items: [
                { keys: ["Enter"], description: "Submit Input / Execute Command" },
                { keys: ["Cmd", "S"], description: "Save Current Item" },
                { keys: ["Cmd", "E"], description: "Export Current View" }
            ]
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-dark-card border-2 border-neon-cyan/50 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-[0_0_30px_rgba(11,228,236,0.3)] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b-2 border-gray-700 flex items-center justify-between bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neon-purple/20 rounded-sm flex items-center justify-center">
                            <HelpCircle className="text-neon-purple" size={20} />
                        </div>
                        <div>
                            <h2 className="font-orbitron text-xl font-bold uppercase tracking-wider text-white">Keyboard Shortcuts</h2>
                            <p className="text-xs text-gray-500 font-mono">Productivity at your fingertips</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-sm hover:bg-neon-magenta/10 text-gray-400 hover:text-neon-magenta transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
                    {shortcuts.map((section, idx) => (
                        <div key={idx}>
                            <h3 className="text-xs font-mono font-bold text-neon-cyan uppercase tracking-widest mb-4">{section.category}</h3>
                            <div className="space-y-3">
                                {section.items.map((shortcut, itemIdx) => (
                                    <div key={itemIdx} className="flex items-center justify-between p-3 bg-dark-bg border-2 border-gray-700 rounded-sm hover:border-neon-cyan/30 transition-colors">
                                        <span className="text-sm text-gray-300 font-mono">{shortcut.description}</span>
                                        <div className="flex items-center gap-1">
                                            {shortcut.keys.map((key, keyIdx) => (
                                                <React.Fragment key={keyIdx}>
                                                    <kbd className="px-2 py-1 bg-dark-card border-2 border-gray-700 rounded-sm text-xs font-mono text-neon-cyan shadow-sm min-w-[28px] text-center">
                                                        {key === "Cmd" ? <Command size={12} className="inline" /> : key}
                                                    </kbd>
                                                    {keyIdx < shortcut.keys.length - 1 && <span className="text-gray-600">+</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t-2 border-gray-700 bg-dark-bg text-center">
                    <p className="text-xs text-gray-500 font-mono">
                        Press <kbd className="px-2 py-0.5 bg-dark-card border-2 border-gray-700 rounded-sm text-xs text-neon-cyan mx-1">Esc</kbd> to close
                    </p>
                </div>
            </div>
        </div>
    );
};
