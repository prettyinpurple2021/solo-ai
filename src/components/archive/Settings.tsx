
import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, Save, AlertTriangle, RefreshCcw, Monitor, Database, Trash2, Download, Upload, CreditCard } from 'lucide-react';
import { BusinessContext } from '../types';
import { showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { logError } from '../lib/logger';

export const Settings: React.FC = () => {
    const user = useUser();
    const router = useRouter();
    const [context, setContext] = useState<BusinessContext>({
        founderName: '',
        companyName: '',
        industry: '',
        description: '',
        goals: []
    });
    const [saved, setSaved] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadContext = async () => {
            const savedCtx = await storageService.getContext();
            if (savedCtx) {
                setContext(savedCtx);
            }
        };
        loadContext();

        const loadSubscription = async (): Promise<void> => {
            if (user) {
                try {
                    const sub = await apiService.get(`/stripe/subscription?userId=${user.id}`);
                    setSubscription(sub);
                } catch (error) {
                    logError('Failed to load subscription', error);
                }
            }
        };
        loadSubscription();
    }, [user]);

    const handleSave = async () => {
        await storageService.saveContext(context);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        // Force reload to update global context in app
        setTimeout(() => window.location.reload(), 500);
    };

    const handleFactoryReset = async () => {
        if (confirm("CRITICAL WARNING: This will delete ALL data (Tasks, Reports, History, Settings). Are you sure?")) {
            await storageService.clearAll();
            window.location.reload();
        }
    };

    const handleExportData = async () => {
        const allData = await storageService.exportData();

        const blob = new Blob([JSON.stringify(allData)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `solo_success_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("BACKUP CREATED", "Workspace data exported successfully.", "success");
        soundService.playSuccess();
    };

    const handleImportClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                await storageService.importData(data);
                showToast("RESTORE COMPLETE", "System data restored. Rebooting...", "success");
                soundService.playSuccess();
                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                showToast("RESTORE FAILED", "Invalid backup file.", "error");
                soundService.playError();
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="mb-8 border-b-2 border-gray-700 pb-6">
                <div className="flex items-center gap-2 text-gray-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                    <SettingsIcon size={14} /> System Configuration
                </div>
                <h2 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">HQ SETTINGS</h2>
                <p className="text-gray-400 mt-2 font-mono">Modify business parameters and manage system data.</p>
            </div>

            <div className="grid gap-8">

                {/* Subscription Management */}
                <div className="bg-dark-card border-2 border-gray-700 rounded-sm overflow-hidden">
                    <div className="bg-dark-bg p-4 border-b-2 border-gray-700 flex items-center gap-3">
                        <CreditCard className="text-neon-purple" size={18} />
                        <h3 className="font-mono font-bold text-sm text-white uppercase tracking-widest">Subscription</h3>
                    </div>
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-mono font-bold text-gray-500 uppercase mb-1">Current Plan</div>
                            <div className="font-orbitron text-2xl font-bold text-white capitalize">{subscription?.tier || 'Free'} Tier</div>
                            {subscription?.currentPeriodEnd && (
                                <div className="text-xs text-gray-400 font-mono mt-1">
                                    Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => router.push('/pricing')}
                            className="px-6 py-3 border-2 border-neon-cyan bg-neon-cyan/10 text-neon-cyan font-mono font-bold rounded-sm hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(11,228,236,0.4)] transition-all uppercase text-xs tracking-wider"
                        >
                            Upgrade Plan
                        </button>
                    </div>
                </div>

                {/* Business Profile */}
                <div className="bg-dark-card border-2 border-gray-700 rounded-sm overflow-hidden">
                    <div className="bg-dark-bg p-4 border-b-2 border-gray-700 flex items-center gap-3">
                        <Monitor className="text-neon-lime" size={18} />
                        <h3 className="font-mono font-bold text-sm text-white uppercase tracking-widest">Business Context</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono font-bold text-gray-500 uppercase">Founder Name</label>
                                <input
                                    type="text"
                                    value={context.founderName}
                                    onChange={(e) => setContext({ ...context, founderName: e.target.value })}
                                    className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 text-white font-mono focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(11,228,236,0.3)] transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono font-bold text-gray-500 uppercase">Company Name</label>
                                <input
                                    type="text"
                                    value={context.companyName}
                                    onChange={(e) => setContext({ ...context, companyName: e.target.value })}
                                    className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 text-white font-mono focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(11,228,236,0.3)] transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-bold text-gray-500 uppercase">Industry / Sector</label>
                            <input
                                type="text"
                                value={context.industry}
                                onChange={(e) => setContext({ ...context, industry: e.target.value })}
                                className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 text-white font-mono focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(11,228,236,0.3)] transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-bold text-gray-500 uppercase">Mission / Description</label>
                            <textarea
                                value={context.description}
                                onChange={(e) => setContext({ ...context, description: e.target.value })}
                                rows={4}
                                className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-3 text-white font-mono focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(11,228,236,0.3)] transition-all resize-none"
                            />
                        </div>
                        <div className="flex justify-end pt-4 border-t-2 border-gray-700">
                            <button
                                onClick={handleSave}
                                disabled={saved}
                                className={`flex items-center gap-2 px-6 py-3 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all
                                    ${saved ? 'bg-neon-lime text-dark-bg' : 'border-2 border-neon-lime bg-neon-lime/10 text-neon-lime hover:bg-neon-lime/20 hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]'}`}
                            >
                                {saved ? 'Changes Applied' : 'Save Configuration'} <Save size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-dark-card border-2 border-gray-700 rounded-sm overflow-hidden">
                    <div className="bg-dark-bg p-4 border-b-2 border-gray-700 flex items-center gap-3">
                        <Database className="text-neon-orange" size={18} />
                        <h3 className="font-mono font-bold text-sm text-white uppercase tracking-widest">Data Management</h3>
                    </div>
                    <div className="p-6">

                        {/* Backup/Restore */}
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleExportData}
                                className="px-4 py-4 bg-dark-bg border-2 border-gray-700 hover:border-neon-lime hover:text-neon-lime rounded-sm flex flex-col items-center gap-2 transition-all group"
                            >
                                <Download size={24} className="text-gray-500 group-hover:text-neon-lime" />
                                <div className="text-center">
                                    <div className="text-xs font-mono font-bold uppercase tracking-widest">Export Workspace</div>
                                    <div className="text-[10px] text-gray-500 font-mono mt-1">Download JSON Backup</div>
                                </div>
                            </button>

                            <button
                                onClick={handleImportClick}
                                className="px-4 py-4 bg-dark-bg border-2 border-gray-700 hover:border-neon-cyan hover:text-neon-cyan rounded-sm flex flex-col items-center gap-2 transition-all group"
                            >
                                <Upload size={24} className="text-gray-500 group-hover:text-neon-cyan" />
                                <div className="text-center">
                                    <div className="text-xs font-mono font-bold uppercase tracking-widest">Restore Workspace</div>
                                    <div className="text-[10px] text-gray-500 font-mono mt-1">Upload JSON Backup</div>
                                </div>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".json"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Factory Reset */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 p-4 bg-neon-magenta/5 border-2 border-neon-magenta/30 rounded-sm">
                            <div>
                                <h4 className="text-neon-magenta font-mono font-bold text-sm uppercase flex items-center gap-2 mb-2">
                                    <AlertTriangle size={16} /> Factory Reset
                                </h4>
                                <p className="text-gray-400 font-mono text-sm">
                                    Irreversible. Clears all local storage data including Tasks, Reports, War Room History, and Business Context.
                                </p>
                            </div>
                            <button
                                onClick={handleFactoryReset}
                                className="w-full md:w-auto px-4 py-2 bg-neon-magenta/10 text-neon-magenta border-2 border-neon-magenta/50 hover:bg-neon-magenta/20 rounded-sm text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap flex items-center justify-center gap-2 transition-colors"
                            >
                                <Trash2 size={14} /> Wipe System
                            </button>
                        </div>

                        {/* Replay Onboarding */}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => router.push('/app/onboarding')}
                                className="text-gray-500 hover:text-neon-cyan text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
                            >
                                <RefreshCcw size={14} /> Replay Onboarding
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
