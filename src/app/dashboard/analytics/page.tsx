'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar, Cell,
    RadialBarChart, RadialBar, PieChart, Pie, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend,
    ComposedChart,
} from 'recharts';
import { LucideIcon, BarChart2, TrendingUp, Users, Layers, Wand2, Calendar, PieChart as PieIcon, MessageSquare } from 'lucide-react';
import { generateAnalyticsData } from '@/lib/mockData';

const DATE_RANGES = [
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 },
];

const CHART_THEME = {
    grid: 'rgba(99,102,241,0.08)',
    text: '#64748b',
    tooltip: {
        contentStyle: { background: '#13112a', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0' },
        cursor: { fill: 'rgba(99,102,241,0.06)' },
    },
};

function KPICard({ label, value, icon: Icon, color, delta }: { label: string; value: number | string; icon: LucideIcon; color: string; delta?: string }) {
    return (
        <div className="kpi-card">
            <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
                {delta && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
                        {delta}
                    </span>
                )}
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>{value.toLocaleString()}</div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
        </div>
    );
}

// Custom label renderer for the pie chart
function renderCustomLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: {
    cx?: number; cy?: number; midAngle?: number; innerRadius?: number; outerRadius?: number; percent?: number;
}) {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}

export default function AnalyticsPage() {
    const [range, setRange] = useState(30);
    const data = generateAnalyticsData(range);

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
                        <BarChart2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
                        <div className="h-0.5 w-16 rounded-full mt-1" style={{ background: 'linear-gradient(90deg,#3b82f6,#6366f1,transparent)' }} />
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Performance insights across your design workspace</p>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    <div className="tab-list">
                        {DATE_RANGES.map(({ label, value }) => (
                            <button key={value} className={`tab-btn ${range === value ? 'active' : ''}`} onClick={() => setRange(value)}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KPICard label="Total Projects" value={data.kpis.totalProjects} icon={Layers} color="#6366f1" delta="+2 this month" />
                <KPICard label="Total Assets" value={data.kpis.totalAssets} icon={Layers} color="#ec4899" delta="+34 this week" />
                <KPICard label="Active Users" value={data.kpis.activeUsers} icon={Users} color="#14b8a6" />
                <KPICard label="AI Calls" value={data.kpis.aiCalls} icon={Wand2} color="#f59e0b" delta="+12% vs last period" />
            </div>

            {/* Charts — Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Asset Uploads Over Time */}
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="w-4 h-4" style={{ color: '#6366f1' }} />
                        <h2 className="font-bold">Asset Uploads</h2>
                        <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>past {range} days</span>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }} onClick={() => toast('Export coming soon 📊', { icon: '📁' })}>Export CSV</button>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={data.assetUsage}>
                            <defs>
                                <linearGradient id="assetGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                            <XAxis dataKey="date" tick={{ fill: CHART_THEME.text, fontSize: 11 }} tickLine={false} axisLine={false}
                                tickFormatter={(v, i) => i % Math.ceil(range / 7) === 0 ? v : ''} />
                            <YAxis tick={{ fill: CHART_THEME.text, fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip {...CHART_THEME.tooltip} />
                            <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#assetGrad)" name="Uploads" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* User Activity */}
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <Users className="w-4 h-4" style={{ color: '#14b8a6' }} />
                        <h2 className="font-bold">Daily Active Users</h2>
                        <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>past {range} days</span>
                        <button className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }} onClick={() => toast('Export coming soon 📊', { icon: '📁' })}>Export CSV</button>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={data.userActivity}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                            <XAxis dataKey="date" tick={{ fill: CHART_THEME.text, fontSize: 11 }} tickLine={false} axisLine={false}
                                tickFormatter={(v, i) => i % Math.ceil(range / 7) === 0 ? v : ''} />
                            <YAxis tick={{ fill: CHART_THEME.text, fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip {...CHART_THEME.tooltip} />
                            <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2.5} dot={false} name="Active Users"
                                activeDot={{ r: 5, fill: '#14b8a6', strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts — Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* AI Usage by Tool */}
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <Wand2 className="w-4 h-4" style={{ color: '#f59e0b' }} />
                        <h2 className="font-bold">AI Usage by Tool</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data.aiUsageStats} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                            <XAxis dataKey="tool" tick={{ fill: CHART_THEME.text, fontSize: 10 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: CHART_THEME.text, fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip {...CHART_THEME.tooltip} />
                            <Bar dataKey="count" name="API Calls" radius={[6, 6, 0, 0]}>
                                {data.aiUsageStats.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {data.aiUsageStats.map((s) => (
                            <div key={s.tool} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                <div className="w-2 h-2 rounded-full" style={{ background: s.fill }} />
                                {s.tool}: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Asset Type Distribution — Pie Chart */}
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <PieIcon className="w-4 h-4" style={{ color: '#6366f1' }} />
                        <h2 className="font-bold">Asset Type Distribution</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={data.assetTypeDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                                labelLine={false}
                                label={renderCustomLabel}
                            >
                                {data.assetTypeDistribution.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ payload }) => payload?.[0] ? (
                                    <div className="px-3 py-2 rounded-lg text-sm" style={{ background: '#13112a', border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
                                        <div className="font-semibold">{payload[0].name}</div>
                                        <div style={{ color: payload[0].payload.fill }}>{payload[0].value} assets</div>
                                    </div>
                                ) : null}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                        {data.assetTypeDistribution.map((d) => {
                            const total = data.assetTypeDistribution.reduce((s, x) => s + x.value, 0);
                            return (
                                <div key={d.name} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.fill }} />
                                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--color-text-muted)' }}>{d.name}</span>
                                    <span className="text-xs font-bold" style={{ color: d.fill }}>{d.value}</span>
                                    <div className="w-12 progress-bar" style={{ height: '3px' }}>
                                        <div className="progress-fill" style={{ width: `${(d.value / total) * 100}%`, background: d.fill }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Project Completion Radial */}
                <div className="card p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <BarChart2 className="w-4 h-4" style={{ color: '#ec4899' }} />
                        <h2 className="font-bold">Project Completion</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={data.projectPerformance} startAngle={90} endAngle={-270}>
                            <RadialBar
                                dataKey="value"
                                cornerRadius={4}
                                background={{ fill: 'rgba(255,255,255,0.04)' }}
                                label={{ position: 'insideStart', fill: 'transparent' }}
                            />
                            <Tooltip
                                content={({ payload }) => payload?.[0] ? (
                                    <div className="px-3 py-2 rounded-lg text-sm" style={{ background: '#13112a', border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
                                        <div className="font-semibold">{payload[0].payload.name}</div>
                                        <div style={{ color: payload[0].payload.fill }}>{payload[0].value}% complete</div>
                                    </div>
                                ) : null}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-1">
                        {data.projectPerformance.map((p) => (
                            <div key={p.name} className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill }} />
                                <div className="flex-1 text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{p.name}</div>
                                <div className="text-xs font-bold" style={{ color: p.fill }}>{p.value}%</div>
                                <div className="w-16 progress-bar" style={{ height: '3px' }}>
                                    <div className="progress-fill" style={{ width: `${p.value}%`, background: p.fill }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts — Row 3: Collaboration Rate */}
            <div className="card p-5">
                <div className="flex items-center gap-2 mb-5">
                    <MessageSquare className="w-4 h-4" style={{ color: '#22c55e' }} />
                    <h2 className="font-bold">Collaboration Rate</h2>
                    <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>comments &amp; edits — past {range} days</span>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: '12px' }} onClick={() => toast('Export coming soon 📊', { icon: '📁' })}>Export CSV</button>
                    <div className="flex items-center gap-4 text-xs ml-4">
                        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#22c55e', opacity: 0.7 }} />Edits</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-1 rounded" style={{ background: '#a78bfa' }} />Comments</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={data.collaborationRate}>
                        <defs>
                            <linearGradient id="editsGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                        <XAxis dataKey="date" tick={{ fill: CHART_THEME.text, fontSize: 11 }} tickLine={false} axisLine={false}
                            tickFormatter={(v, i) => i % Math.ceil(range / 7) === 0 ? v : ''} />
                        <YAxis yAxisId="left" tick={{ fill: CHART_THEME.text, fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: CHART_THEME.text, fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip
                            content={({ payload, label }) => payload && payload.length ? (
                                <div className="px-3 py-2 rounded-lg text-sm" style={{ background: '#13112a', border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
                                    <div className="font-semibold mb-1">{label}</div>
                                    {payload.map((p) => (
                                        <div key={String(p.dataKey)} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                                            <span style={{ color: 'var(--color-text-muted)' }}>{p.name}:</span>
                                            <span className="font-semibold">{p.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        />
                        <Bar yAxisId="left" dataKey="edits" name="Edits" fill="url(#editsGrad)" stroke="#22c55e" strokeWidth={1} radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="comments" name="Comments" stroke="#a78bfa" strokeWidth={2.5} dot={false}
                            activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
