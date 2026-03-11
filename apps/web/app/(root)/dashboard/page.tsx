'use client';

import { useEffect, useState } from 'react';
import type { Stat } from './_components';
import { StatCard } from './_components';

const stats: Stat[] = [
    {
        id: 'STAT-001',
        label: 'Total Repositories',
        value: 48,
        change: '+3 this month',
        status: 'Active',
        statusColor: '#4ade80',
        tag: 'VCS',
        tagIcon: '⬡',
        tagColor: '#38bdf8',
        accentColor: '#f97316',
        trend: [20, 25, 22, 30, 35, 40, 44, 48],
    },
    {
        id: 'STAT-002',
        label: 'Total Commits',
        value: 1_284,
        change: '+92 this week',
        status: 'Live',
        statusColor: '#818cf8',
        tag: 'Activity',
        tagIcon: '◈',
        tagColor: '#f472b6',
        accentColor: '#38bdf8',
        trend: [400, 520, 610, 700, 820, 950, 1100, 1284],
    },
    // {
    //     id: 'STAT-003',
    //     label: 'Repositories Connected',
    //     value: 31,
    //     change: 'of 48 repos',
    //     status: 'Syncing',
    //     statusColor: '#fbbf24',
    //     tag: 'Integrations',
    //     tagIcon: '⬡',
    //     tagColor: '#4ade80',
    //     accentColor: '#a78bfa',
    //     trend: [10, 14, 18, 21, 25, 27, 29, 31],
    // },
];

export default function Dashboard() {
    const [headerVisible, setHeaderVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setHeaderVisible(true), 50);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="min-h-screen bg-neutral-950 p-0 text-neutral-300">
            <div className="px-7 py-8">
                <div
                    className={`mb-7 transition-all duration-500 ease-out ${
                        headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                    }`}
                >
                    <h1 className="mb-1.5 text-[22px] font-semibold tracking-wide text-neutral-200">
                        Dashboard Overview
                    </h1>
                    <p className="font-mono text-xs text-neutral-500">
                        Tracking your codebase activity across all connected sources.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat, i) => (
                        <StatCard key={stat.id} stat={stat} index={i} />
                    ))}
                </div>

                <div
                    className={`mt-5 flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-[18px] py-3.5 transition-all duration-700 ease-out ${
                        headerVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <div className="flex gap-6">
                        {[
                            { label: 'Last sync', value: '2 min ago' },
                            { label: 'Active branches', value: '12' },
                            { label: 'Open PRs', value: '7' },
                            { label: 'Pending reviews', value: '3' },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <div className="mb-0.5 font-mono text-[10px] text-neutral-600">{label}</div>
                                <div className="font-mono text-[13px] text-neutral-400">{value}</div>
                            </div>
                        ))}
                    </div>
                    <div className="text-right font-mono text-[10px] text-neutral-600">
                        <div>MF-DASH · v2.4.1</div>
                        <div className="mt-0.5 text-neutral-500">Auto-refresh enabled</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
