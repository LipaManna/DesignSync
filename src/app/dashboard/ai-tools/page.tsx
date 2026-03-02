'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    Scissors, Palette, Wand2, LayoutGrid, Crop,
    ChevronRight, Sparkles, ZapOff,
    ArrowRight, CheckCircle, Clock, AlertCircle,
} from 'lucide-react';
import { projectsService } from '@/services/projectsService';
import { aiService } from '@/services/aiService';
import { AIJob, AIToolType, Asset } from '@/types';
import { cn, formatRelativeTime } from '@/lib/utils';

const TOOL_ICONS: Record<AIToolType, React.FC<{ className?: string }>> = {
    'background-removal': Scissors,
    'color-palette': Palette,
    'style-transfer': Wand2,
    'auto-layout': LayoutGrid,
    'smart-crop': Crop,
};

const STYLE_OPTIONS = ['Minimalist', 'Bauhaus', 'Cyberpunk', 'Organic', 'Retro', 'Neon Wave'];
const RATIO_OPTIONS = ['1:1', '16:9', '4:3', '9:16', '3:2', '21:9'];

function JobStatusIcon({ status }: { status: AIJob['status'] }) {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-red-400" />;
    if (status === 'processing') return <span className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin inline-block" />;
    return <Clock className="w-4 h-4 text-amber-400" />;
}

function PaletteResult({ colors }: { colors: string[] }) {
    return (
        <div className="space-y-2">
            <div className="flex rounded-lg overflow-hidden h-12">
                {colors.map((c) => <div key={c} className="flex-1" style={{ background: c }} />)}
            </div>
            <div className="flex gap-2 flex-wrap">
                {colors.map((c) => (
                    <div key={c} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer hover:scale-105 transition-transform"
                        style={{ background: `${c}22`, border: `1px solid ${c}44`, color: c }}
                        onClick={() => { navigator.clipboard.writeText(c); toast.success(`Copied ${c}`); }}>
                        <div className="w-3 h-3 rounded-full" style={{ background: c }} />
                        {c}
                    </div>
                ))}
            </div>
        </div>
    );
}

function AutoLayoutResult({ suggestions }: { suggestions: { name: string; confidence: number; description: string }[] }) {
    return (
        <div className="space-y-2">
            {suggestions.map((s) => (
                <div key={s.name} className="p-3 rounded-lg border" style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{s.name}</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--color-green)' }}>{Math.round(s.confidence * 100)}% match</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.description}</p>
                    <div className="mt-2 progress-bar">
                        <div className="progress-fill" style={{ width: `${s.confidence * 100}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AIToolsPage() {
    const [selectedTool, setSelectedTool] = useState<AIToolType>('background-removal');
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState(STYLE_OPTIONS[0]);
    const [selectedRatio, setSelectedRatio] = useState(RATIO_OPTIONS[0]);
    const [jobs, setJobs] = useState<AIJob[]>([]);
    const [activeJob, setActiveJob] = useState<{ progress: number; toolType: AIToolType } | null>(null);

    const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectsService.getProjects });
    const [selectedProjectId, setSelectedProjectId] = useState<string>('p1');
    const { data: assets = [] } = useQuery({ queryKey: ['assets', selectedProjectId], queryFn: () => projectsService.getAssets(selectedProjectId) });

    const tools = aiService.getAvailableTools();
    const selectedToolInfo = tools.find((t) => t.id === selectedTool)!;

    const runTool = async () => {
        if (selectedTool !== 'auto-layout' && !selectedAssetId) {
            toast.error('Please select an asset first');
            return;
        }
        setActiveJob({ progress: 0, toolType: selectedTool });
        const onProgress = (p: number) => setActiveJob({ progress: p, toolType: selectedTool });

        try {
            let job: AIJob;
            if (selectedTool === 'background-removal') job = await aiService.removeBackground(selectedAssetId!, onProgress);
            else if (selectedTool === 'color-palette') job = await aiService.extractPalette(selectedAssetId!, onProgress);
            else if (selectedTool === 'style-transfer') job = await aiService.styleTransfer(selectedAssetId!, selectedStyle, onProgress);
            else if (selectedTool === 'auto-layout') job = await aiService.autoLayout(selectedProjectId, onProgress);
            else job = await aiService.smartCrop(selectedAssetId!, selectedRatio, onProgress);
            setJobs((prev) => [job, ...prev.slice(0, 9)]);
            toast.success(`${selectedToolInfo.name} completed!`);
        } catch {
            toast.error('AI processing failed');
        } finally {
            setActiveJob(null);
        }
    };

    const selectedAsset = assets.find((a) => a.id === selectedAssetId);

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)' }}>
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">AI Tools</h1>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                    Apply intelligent transformations to your design assets — powered by mock AI
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Tool selector + config */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Tools */}
                    <div className="card p-4 space-y-1">
                        <p className="form-label mb-3">Select AI Tool</p>
                        {tools.map((tool) => {
                            const Icon = TOOL_ICONS[tool.id];
                            return (
                                <button key={tool.id} onClick={() => setSelectedTool(tool.id)}
                                    className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all ${selectedTool === tool.id ? 'border-indigo-500/40' : 'border-transparent hover:border-white/10'}`}
                                    style={{ background: selectedTool === tool.id ? 'rgba(99,102,241,0.12)' : 'transparent' }}>
                                    <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', selectedTool === tool.id ? 'text-indigo-400' : 'text-slate-400')} />
                                    <div>
                                        <div className={cn('text-sm font-semibold', selectedTool === tool.id ? 'text-indigo-300' : '')}>{tool.name}</div>
                                        <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{tool.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Asset picker */}
                    {selectedTool !== 'auto-layout' && (
                        <div className="card p-4 space-y-3">
                            <p className="form-label">Select Asset</p>
                            <select className="form-input" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
                                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                                {assets.slice(0, 15).map((a) => (
                                    <button key={a.id} onClick={() => setSelectedAssetId(a.id)}
                                        className={`w-full text-left flex items-center gap-2 p-2 rounded-lg transition-all text-sm ${selectedAssetId === a.id ? 'ring-1 ring-indigo-500' : ''}`}
                                        style={{ background: selectedAssetId === a.id ? 'rgba(99,102,241,0.12)' : 'transparent' }}>
                                        <img src={a.thumbnailUrl} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                                        <span className="truncate">{a.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tool-specific config */}
                    {selectedTool === 'style-transfer' && (
                        <div className="card p-4">
                            <p className="form-label mb-3">Art Style</p>
                            <div className="grid grid-cols-2 gap-2">
                                {STYLE_OPTIONS.map((s) => (
                                    <button key={s} onClick={() => setSelectedStyle(s)}
                                        className={cn('btn btn-sm text-xs', selectedStyle === s ? 'btn-secondary' : 'btn-ghost')}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedTool === 'smart-crop' && (
                        <div className="card p-4">
                            <p className="form-label mb-3">Crop Ratio</p>
                            <div className="grid grid-cols-3 gap-2">
                                {RATIO_OPTIONS.map((r) => (
                                    <button key={r} onClick={() => setSelectedRatio(r)}
                                        className={cn('btn btn-sm text-xs font-mono', selectedRatio === r ? 'btn-secondary' : 'btn-ghost')}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Run button */}
                    <button onClick={runTool} disabled={!!activeJob} className="btn btn-primary w-full btn-lg justify-center">
                        {activeJob ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing… {activeJob.progress}%
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Run {selectedToolInfo.name}
                            </>
                        )}
                    </button>
                </div>

                {/* Right: Preview + results + job history */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Preview */}
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold">Preview</h2>
                            {selectedAsset && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{selectedAsset.name}</span>}
                        </div>
                        {selectedAsset ? (
                            <div className="relative rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                <img src={selectedAsset.url} alt={selectedAsset.name} className="w-full max-h-64 object-contain" />
                                {activeJob && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4" style={{ background: 'rgba(4,4,17,0.80)', backdropFilter: 'blur(8px)' }}>
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-glow" style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}>
                                            <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse-slow" />
                                        </div>
                                        <p className="text-sm font-semibold">AI Processing…</p>
                                        <div className="w-48">
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${activeJob.progress}%` }} />
                                            </div>
                                            <p className="text-xs text-center mt-1" style={{ color: 'var(--color-text-muted)' }}>{activeJob.progress}%</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : selectedTool === 'auto-layout' ? (
                            <div className="py-16 text-center" style={{ color: 'var(--color-text-muted)' }}>
                                <div className="empty-state-icon mx-auto mb-3">
                                    <LayoutGrid className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                                </div>
                                <p className="text-sm font-medium">AI will analyze project assets and suggest layouts</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>Select a project and click Run to start</p>
                            </div>
                        ) : (
                            <div className="py-16 text-center" style={{ color: 'var(--color-text-muted)' }}>
                                <div className="empty-state-icon mx-auto mb-3" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                                    <ZapOff className="w-8 h-8" style={{ color: 'var(--color-text-dim)' }} />
                                </div>
                                <p className="text-sm font-medium">Select an asset to preview</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>Choose a project and asset from the left panel</p>
                            </div>
                        )}
                    </div>

                    {/* Latest result */}
                    {jobs[0]?.result && (
                        <div className="card p-5 animate-fade-in">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <h2 className="font-bold">Latest Result</h2>
                                <span className="text-xs ml-auto" style={{ color: 'var(--color-text-dim)' }}>{formatRelativeTime(jobs[0].completedAt!)}</span>
                            </div>
                            <div className="rounded-lg px-3 py-2 mb-4 text-sm font-semibold flex items-center gap-2" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
                                <CheckCircle className="w-4 h-4" />
                                Processing completed — {tools.find(t => t.id === jobs[0].toolType)?.name}
                            </div>
                            {jobs[0].result.type === 'color-palette' && (
                                <PaletteResult colors={(jobs[0].result.data as { colors: string[] }).colors} />
                            )}
                            {jobs[0].result.type === 'auto-layout' && (
                                <AutoLayoutResult suggestions={(jobs[0].result.data as { suggestions: { name: string; confidence: number; description: string }[] }).suggestions} />
                            )}
                            {(jobs[0].result.type === 'background-removal' || jobs[0].result.type === 'smart-crop' || jobs[0].result.type === 'style-transfer') && (
                                <div className="space-y-2">
                                    <img src={(jobs[0].result.data as { processedUrl: string }).processedUrl} alt="Result" className="w-full max-h-48 object-contain rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }} />
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(jobs[0].result.data).filter(([k]) => k !== 'processedUrl').map(([k, v]) => (
                                            <div key={k} className="text-xs px-2 py-1 rounded font-mono" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--color-accent)' }}>
                                                {k}: <span className="text-white">{String(v)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Job history */}
                    {jobs.length > 0 && (
                        <div className="card p-5">
                            <h2 className="font-bold mb-4">Job History</h2>
                            <div className="space-y-2">
                                {jobs.map((job) => {
                                    const statusColor = job.status === 'completed' ? '#22c55e' : job.status === 'failed' ? '#ef4444' : job.status === 'processing' ? '#a78bfa' : '#f59e0b';
                                    return (
                                        <div key={job.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderLeft: `3px solid ${statusColor}` }}>
                                            <JobStatusIcon status={job.status} />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold">{tools.find((t) => t.id === job.toolType)?.name}</div>
                                                <div className="text-xs truncate" style={{ color: 'var(--color-text-dim)' }}>{job.assetName}</div>
                                            </div>
                                            <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{formatRelativeTime(job.createdAt)}</span>
                                            <ChevronRight className="w-4 h-4 opacity-30" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
