
import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, Save, AlertTriangle, RefreshCcw, Monitor, Database, Trash2, Download, Upload, CreditCard } from 'lucide-react';
import { BusinessContext } from '../types';
import { showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';

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

        const loadSubscription = async () => {
            if (user) {
                try {
                    const sub = await apiService.get(`/stripe/subscription?userId=${user.id}`);
                    setSubscription(sub);
                } catch (error) {
                    console.error('Failed to load subscription', error);
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

            <div className="mb-8 border-b border-zinc-800 pb-6">
                <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                    <SettingsIcon size={14} /> System Configuration
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter">HQ SETTINGS</h2>
                <p className="text-zinc-400 mt-2">Modify business parameters and manage system data.</p>
            </div>

            <div className="grid gap-8">

                {/* Subscription Management */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center gap-3">
                        <CreditCard className="text-purple-500" size={18} />
                        <h3 className="font-bold text-sm text-white uppercase tracking-widest">Subscription</h3>
                    </div>
                    <div className="p-6 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-bold text-zinc-500 uppercase mb-1">Current Plan</div>
                            <div className="text-2xl font-bold text-white capitalize">{subscription?.tier || 'Free'} Tier</div>
                            {subscription?.currentPeriodEnd && (
                                <div className="text-xs text-zinc-400 mt-1">
                                    Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => router.push('/pricing')}
                            className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors uppercase text-xs tracking-wider"
                        >
                            Upgrade Plan
                        </button>
                    </div>
                </div>

                {/* Business Profile */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center gap-3">
                        <Monitor className="text-emerald-500" size={18} />
                        <h3 className="font-bold text-sm text-white uppercase tracking-widest">Business Context</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Founder Name</label>
                                <input
                                    type="text"
                                    value={context.founderName}
                                    onChange={(e) => setContext({ ...context, founderName: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Company Name</label>
                                <input
                                    type="text"
                                    value={context.companyName}
                                    onChange={(e) => setContext({ ...context, companyName: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Industry / Sector</label>
                            <input
                                type="text"
                                value={context.industry}
                                onChange={(e) => setContext({ ...context, industry: e.target.value })}
                                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Mission / Description</label>
                            <textarea
                                value={context.description}
                                onChange={(e) => setContext({ ...context, description: e.target.value })}
                                rows={4}
                                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                            />
                        </div>
                        <div className="flex justify-end pt-4 border-t border-zinc-800/50">
                            <button
                                onClick={handleSave}
                                disabled={saved}
                                className={`flex items-center gap-2 px-6 py-3 rounded font-bold text-xs uppercase tracking-wider transition-all
                                    ${saved ? 'bg-emerald-500 text-black' : 'bg-white text-black hover:bg-zinc-200'}`}
                            >
                                {saved ? 'Changes Applied' : 'Save Configuration'} <Save size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center gap-3">
                        <Database className="text-amber-500" size={18} />
                        <h3 className="font-bold text-sm text-white uppercase tracking-widest">Data Management</h3>
                    </div>
                    <div className="p-6">

                        {/* Backup/Restore */}
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={handleExportData}
                                className="px-4 py-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500 hover:text-emerald-500 rounded-lg flex flex-col items-center gap-2 transition-all group"
                            >
                                <Download size={24} className="text-zinc-500 group-hover:text-emerald-500" />
                                <div className="text-center">
                                    <div className="text-xs font-bold uppercase tracking-widest">Export Workspace</div>
                                    <div className="text-[10px] text-zinc-500 mt-1">Download JSON Backup</div>
                                </div>
                            </button>

                            <button
                                onClick={handleImportClick}
                                className="px-4 py-4 bg-zinc-950 border border-zinc-800 hover:border-blue-500 hover:text-blue-500 rounded-lg flex flex-col items-center gap-2 transition-all group"
                            >
                                <Upload size={24} className="text-zinc-500 group-hover:text-blue-500" />
                                <div className="text-center">
                                    <div className="text-xs font-bold uppercase tracking-widest">Restore Workspace</div>
                                    <div className="text-[10px] text-zinc-500 mt-1">Upload JSON Backup</div>
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
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 p-4 bg-red-950/10 border border-red-900/30 rounded-lg">
                            <div>
                                <h4 className="text-red-500 font-bold text-sm uppercase flex items-center gap-2 mb-2">
                                    <AlertTriangle size={16} /> Factory Reset
                                </h4>
                                <p className="text-zinc-400 text-sm">
                                    Irreversible. Clears all local storage data including Tasks, Reports, War Room History, and Business Context.
                                </p>
                            </div>
                            <button
                                onClick={handleFactoryReset}
                                className="w-full md:w-auto px-4 py-2 bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-900/50 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center justify-center gap-2 transition-colors"
                            >
                                <Trash2 size={14} /> Wipe System
                            </button>
                        </div>

                        {/* Replay Onboarding */}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => router.push('/app/onboarding')}
                                className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
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
