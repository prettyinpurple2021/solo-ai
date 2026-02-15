import { useState, useEffect } from 'react';
import { Search, Ban, CheckCircle,} from 'lucide-react';
import { logError } from '@/lib/logger';
import { API_URL } from '@/lib/api-client';

interface User {
    id: number;
    email: string;
    role: string;
    createdAt: string;
    lastActive: string;
    subscription: string | null;
    status: string | null;
}

export function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            logError('Failed to fetch users', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuspend = async (userId: number) => {
        if (!confirm('Are you sure you want to suspend this user?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/admin/users/${userId}/suspend`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: 'Admin manual suspension' })
            });
            // Refresh list
            fetchUsers();
        } catch (error) {
            logError('Failed to suspend user', { userId }, error instanceof Error ? error : new Error(String(error)));
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toString().includes(search)
    );

    if (isLoading) {
        return <div className="text-zinc-500">Loading users...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search users by email or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500/50"
                    />
                </div>
                <div className="text-sm text-zinc-500">
                    Showing {filteredUsers.length} users
                </div>
            </div>

            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-zinc-400 text-sm font-medium">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Subscription</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">{user.email}</span>
                                        <span className="text-xs text-zinc-500">ID: {user.id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs border ${user.role === 'admin'
                                        ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.subscription ? (
                                        <span className="capitalize text-emerald-400">{user.subscription}</span>
                                    ) : (
                                        <span className="text-zinc-600">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {user.status === 'active' ? (
                                            <CheckCircle size={14} className="text-emerald-500" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-zinc-600" />
                                        )}
                                        <span className="capitalize text-sm text-zinc-400">
                                            {user.status || 'Inactive'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-zinc-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleSuspend(user.id)}
                                        className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 rounded-lg transition-colors"
                                        title="Suspend User"
                                    >
                                        <Ban size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
