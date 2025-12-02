import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    CreditCard,
    Activity,
    Server,
    LogOut,
    Shield,
    Search
} from 'lucide-react';
import { UserTable } from './UserTable';
import { SubscriptionMetrics } from './SubscriptionMetrics';
import { Analytics } from './Analytics';
import { SystemHealth } from './SystemHealth';

type AdminView = 'overview' | 'users' | 'subscriptions' | 'health';

export function AdminDashboard() {
    const [currentView, setCurrentView] = useState<AdminView>('overview');
    const router = useRouter();

    const handleLogout = () => {
        // Clear admin session
        sessionStorage.removeItem('admin_session');
        sessionStorage.removeItem('admin_session_expires');
        router.push('/app');
    };

    const renderView = () => {
        switch (currentView) {
            case 'overview':
                return <Analytics />;
            case 'users':
                return <UserTable />;
            case 'subscriptions':
                return <SubscriptionMetrics />;
            case 'health':
                return <SystemHealth />;
            default:
                return <Analytics />;
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Admin Sidebar */}
            <div className="w-64 border-r border-white/10 bg-black/50 flex flex-col">
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                        <Shield className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">Admin</h1>
                        <p className="text-xs text-zinc-500">Control Center</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem
                        icon={<Activity size={20} />}
                        label="Overview"
                        active={currentView === 'overview'}
                        onClick={() => setCurrentView('overview')}
                    />
                    <NavItem
                        icon={<Users size={20} />}
                        label="Users"
                        active={currentView === 'users'}
                        onClick={() => setCurrentView('users')}
                    />
                    <NavItem
                        icon={<CreditCard size={20} />}
                        label="Subscriptions"
                        active={currentView === 'subscriptions'}
                        onClick={() => setCurrentView('subscriptions')}
                    />
                    <NavItem
                        icon={<Server size={20} />}
                        label="System Health"
                        active={currentView === 'health'}
                        onClick={() => setCurrentView('health')}
                    />
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                        <LogOut size={20} />
                        <span>Exit Admin</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md sticky top-0 z-10">
                    <h2 className="text-xl font-semibold capitalize">{currentView}</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-zinc-500">
                            Logged in as <span className="text-emerald-500">support@solosuccessai.fun</span>
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    {renderView()}
                </main>
            </div>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );
}
