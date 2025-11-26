"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface ExpertDistributionProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
}

export function ExpertDistribution({ data }: ExpertDistributionProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center text-white/50 text-sm">
                Veri bulunamadı.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.1)" />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(20, 20, 30, 0.9)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#fff'
                    }}
                    itemStyle={{ color: '#fff' }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
