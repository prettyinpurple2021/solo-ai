import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
    data?: Array<{ month: string; revenue: number }>;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    // Sample data if none provided
    const chartData = data || [
        { month: 'Jan', revenue: 12000 },
        { month: 'Feb', revenue: 19000 },
        { month: 'Mar', revenue: 15000 },
        { month: 'Apr', revenue: 25000 },
        { month: 'May', revenue: 32000 },
        { month: 'Jun', revenue: 28000 }
    ];

    return (
        <div className="w-full h-64 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
