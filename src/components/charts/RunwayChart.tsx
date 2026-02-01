import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RunwayChartProps {
    data?: Array<{ month: string; balance: number }>;
    runwayMonths?: number;
}

export const RunwayChart: React.FC<RunwayChartProps> = ({ data, runwayMonths = 8 }) => {
    // Sample data if none provided
    const chartData = data || [
        { month: 'Now', balance: 50000 },
        { month: 'M1', balance: 44000 },
        { month: 'M2', balance: 38000 },
        { month: 'M3', balance: 32000 },
        { month: 'M4', balance: 26000 },
        { month: 'M5', balance: 20000 },
        { month: 'M6', balance: 14000 },
        { month: 'M7', balance: 8000 },
        { month: 'M8', balance: 2000 }
    ];

    return (
        <div className="w-full h-64 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Cash Runway</h3>
                <span className="text-xs font-mono text-amber-500 font-bold">{runwayMonths} months</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="runwayGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis
                        dataKey="month"
                        stroke="#71717a"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#71717a"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #3f3f46',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Balance']}
                    />
                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fill="url(#runwayGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
