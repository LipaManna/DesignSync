'use client';

import { useEffect, useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
    DndContext, DragEndEvent, closestCenter,
    KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, sortableKeyboardCoordinates, useSortable,
    verticalListSortingStrategy, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Upload, Search, Tag, Trash2, Grid3X3, List,
    GripVertical, ImageIcon, FileText, Package, Star, X, Plus, Layers,
} from 'lucide-react';
import Link from 'next/link';
import { projectsService } from '@/services/projectsService';
import { useAppSelector } from '@/hooks/useRedux';
import { useDebounce } from '@/hooks/useDebounce';
import { formatBytes, formatRelativeTime, cn } from '@/lib/utils';
import { Asset } from '@/types';
import { MOCK_TAGS } from '@/lib/mockData';
import { useRef, useState as useStateReact, useCallback } from 'react';

function SortableAssetCard({ asset, viewMode, selected, onSelect, onDelete, role }: {
    asset: Asset; viewMode: string; selected: boolean; onSelect: () => void; onDelete: () => void; role: string | null;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: asset.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 1 };

    if (viewMode === 'list') {
        return (
            <div ref={setNodeRef} style={{ ...style, background: 'var(--color-bg-card)', borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)' }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 ${selected ? 'ring-2 ring-inset' : ''}`}>
                <div {...attributes} {...listeners} className="cursor-grab opacity-30 hover:opacity-100">
                    <GripVertical className="w-4 h-4" />
                </div>
                <input type="checkbox" checked={selected} onChange={onSelect} className="w-4 h-4 accent-indigo-500 cursor-pointer" onClick={(e) => e.stopPropagation()} />
                <img src={asset.thumbnailUrl} alt={asset.name} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{asset.name}</div>
                    <div className="text-xs flex items-center gap-2" style={{ color: 'var(--color-text-dim)' }}>
                        <span>{formatBytes(asset.size)}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(asset.uploadedAt)}</span>
                    </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                    {asset.tags.slice(0, 2).map((t) => (
                        <span key={t.id} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${t.color}22`, color: t.color }}>{t.name}</span>
                    ))}
                </div>
                <span className={`badge ${asset.aiProcessed ? 'badge-active' : 'badge-draft'} hidden sm:inline-flex`}>
                    {asset.aiProcessed ? 'AI ✓' : asset.category}
                </span>
                {(role === 'admin' || role === 'designer') && (
                    <button onClick={onDelete} className="btn btn-ghost btn-icon opacity-0 group-hover:opacity-100" style={{ color: '#f87171' }}>
                        <Trash2 className="w-3 h-3" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={{ ...style }}
            className={`asset-card group ${selected ? 'ring-2 ring-inset' : ''}`}>
            <div className="relative">
                <div {...attributes} {...listeners} className="absolute top-2 left-2 z-10 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-1 rounded glass">
                        <GripVertical className="w-3 h-3" />
                    </div>
                </div>
                <input type="checkbox" checked={selected} onChange={onSelect}
                    className="absolute top-2 right-2 z-10 w-4 h-4 accent-indigo-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()} />
                <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-36 object-cover" />
                {asset.aiProcessed && (
                    <div className="absolute bottom-2 left-2">
                        <span className="badge badge-active text-xs"><Star className="w-2.5 h-2.5" /> AI</span>
                    </div>
                )}
            </div>
            <div className="p-3">
                <p className="text-sm font-semibold truncate mb-1">{asset.name}</p>
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-dim)' }}>{formatBytes(asset.size)}</p>
                <div className="flex gap-1 flex-wrap">
                    {asset.tags.slice(0, 2).map((t) => (
                        <span key={t.id} className="px-1.5 py-0.5 rounded text-xs" style={{ background: `${t.color}22`, color: t.color }}>{t.name}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DropZone({ onFilesSelect }: { onFilesSelect: (files: FileList) => void }) {
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className={`drop-zone ${dragging ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) onFilesSelect(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}>
            <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => { if (e.target.files) onFilesSelect(e.target.files); }} />
            <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-primary)' }} />
            <p className="font-semibold mb-1">Drop files here or click to browse</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>PNG, JPG, SVG, GIF · Max 50MB each</p>
        </div>
    );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const qc = useQueryClient();
    const { role } = useAppSelector((s) => s.auth);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showUpload, setShowUpload] = useState(false);
    const [showTagModal, setShowTagModal] = useState<string | null>(null);
    const debouncedSearch = useDebounce(search, 300);
    const parentRef = useRef<HTMLDivElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const { data: project } = useQuery({ queryKey: ['project', id], queryFn: () => projectsService.getProject(id) });
    const { data: assets = [], isLoading } = useQuery({ queryKey: ['assets', id], queryFn: () => projectsService.getAssets(id) });

    const uploadMutation = useMutation({
        mutationFn: (file: File) => projectsService.uploadAsset(id, file),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['assets', id] }); toast.success('Asset uploaded!'); },
        onError: () => toast.error('Upload failed'),
    });

    const deleteMutation = useMutation({
        mutationFn: (assetId: string) => projectsService.deleteAsset(id, assetId),
        onMutate: async (assetId) => {
            await qc.cancelQueries({ queryKey: ['assets', id] });
            const prev = qc.getQueryData<Asset[]>(['assets', id]);
            qc.setQueryData<Asset[]>(['assets', id], (old) => (old ?? []).filter((a) => a.id !== assetId));
            return { prev };
        },
        onError: (_, __, ctx) => { qc.setQueryData(['assets', id], ctx?.prev); toast.error('Delete failed'); },
        onSuccess: () => toast.success('Asset deleted'),
    });

    const tagMutation = useMutation({
        mutationFn: ({ assetId, tagId }: { assetId: string; tagId: string }) => {
            const tag = MOCK_TAGS.find((t) => t.id === tagId)!;
            return projectsService.addTagToAsset(id, assetId, tag);
        },
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['assets', id] }); setShowTagModal(null); toast.success('Tag added!'); },
    });

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = assets.findIndex((a) => a.id === active.id);
        const newIdx = assets.findIndex((a) => a.id === over.id);
        const reordered = [...assets];
        const [moved] = reordered.splice(oldIdx, 1);
        reordered.splice(newIdx, 0, moved);
        qc.setQueryData<Asset[]>(['assets', id], reordered);
        await projectsService.reorderAssets(id, reordered.map((a) => a.id));
    }, [assets, id, qc]);

    const handleFilesSelect = (files: FileList) => {
        Array.from(files).forEach((f) => uploadMutation.mutate(f));
        setShowUpload(false);
    };

    const filtered = assets.filter((a) => {
        const matchSearch = a.name.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchCat = filterCategory === 'all' || a.category === filterCategory;
        return matchSearch && matchCat;
    });

    const rowVirtualizer = useVirtualizer({
        count: filtered.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 72,
        overscan: 5,
    });

    const toggleSelect = (aid: string) => setSelectedIds((prev) => {
        const next = new Set(prev);
        next.has(aid) ? next.delete(aid) : next.add(aid);
        return next;
    });

    const deleteSelected = () => {
        selectedIds.forEach((aid) => deleteMutation.mutate(aid));
        setSelectedIds(new Set());
    };

    if (!project) return (
        <div className="p-6 text-center pt-24">
            <div className="skeleton h-8 w-48 mx-auto mb-4" />
            <div className="skeleton h-4 w-64 mx-auto" />
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
                <Link href="/dashboard" className="btn btn-ghost btn-icon mt-1">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: project.color }} />
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold truncate">{project.name}</h1>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{project.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge badge-${project.status}`}>{project.status}</span>
                    {(role === 'admin' || role === 'designer') && (
                        <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(!showUpload)}>
                            <Upload className="w-3 h-3" /> Upload
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Assets', value: assets.length, icon: Layers },
                    { label: 'AI Processed', value: assets.filter((a) => a.aiProcessed).length, icon: Star },
                    { label: 'Members', value: project.members.length, icon: Package },
                    { label: 'Categories', value: new Set(assets.map((a) => a.category)).size, icon: FileText },
                ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="kpi-card flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                            <Icon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                            <div className="text-xl font-bold">{value}</div>
                            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upload zone */}
            {showUpload && (
                <div className="mb-6 animate-fade-in">
                    <DropZone onFilesSelect={handleFilesSelect} />
                    {uploadMutation.isPending && (
                        <div className="mt-2 p-3 rounded-lg flex items-center gap-3" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                            <span className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                            <span className="text-sm">Uploading assets…</span>
                        </div>
                    )}
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="relative flex-1 min-w-40">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-dim)' }} />
                    <input type="text" placeholder="Search assets…" className="form-input pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="form-input" style={{ width: 'auto' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="all">All Categories</option>
                    {['brand', 'illustration', 'photography', 'ui', 'other'].map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                </select>
                <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)' }}>
                    <button className={cn('btn btn-sm', viewMode === 'grid' ? 'btn-secondary' : 'btn-ghost')} onClick={() => setViewMode('grid')}><Grid3X3 className="w-4 h-4" /></button>
                    <button className={cn('btn btn-sm', viewMode === 'list' ? 'btn-secondary' : 'btn-ghost')} onClick={() => setViewMode('list')}><List className="w-4 h-4" /></button>
                </div>
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>{selectedIds.size} selected</span>
                        <button className="btn btn-danger btn-sm" onClick={deleteSelected}><Trash2 className="w-3 h-3" /> Delete</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setSelectedIds(new Set())}><X className="w-3 h-3" /></button>
                    </div>
                )}
            </div>

            {/* Asset grid/list with DnD */}
            {isLoading ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-2'}>
                    {Array.from({ length: 10 }).map((_, i) => <div key={i} className={`skeleton ${viewMode === 'grid' ? 'h-48' : 'h-16'} w-full rounded-xl`} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-24">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-semibold mb-1">No assets found</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Upload assets or change your search.</p>
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filtered.map((a) => a.id)} strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
                        <div
                            ref={viewMode === 'list' ? parentRef : undefined}
                            className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 relative' : 'overflow-auto relative min-h-[400px] max-h-[700px] w-full group pr-2'}
                        >
                            {viewMode === 'list' ? (
                                <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                                    {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                                        const asset = filtered[virtualItem.index];
                                        return (
                                            <div key={asset.id} style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: `${virtualItem.size}px`,
                                                transform: `translateY(${virtualItem.start}px)`,
                                                paddingBottom: '8px'
                                            }}>
                                                <SortableAssetCard
                                                    asset={asset} viewMode={viewMode}
                                                    selected={selectedIds.has(asset.id)}
                                                    onSelect={() => toggleSelect(asset.id)}
                                                    onDelete={() => deleteMutation.mutate(asset.id)}
                                                    role={role}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                filtered.map((asset) => (
                                    <SortableAssetCard key={asset.id} asset={asset} viewMode={viewMode}
                                        selected={selectedIds.has(asset.id)}
                                        onSelect={() => toggleSelect(asset.id)}
                                        onDelete={() => deleteMutation.mutate(asset.id)}
                                        role={role}
                                    />
                                ))
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Tag modal */}
            {showTagModal && (
                <div className="modal-overlay" onClick={() => setShowTagModal(null)}>
                    <div className="modal-box p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold mb-4">Add Tag</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {MOCK_TAGS.map((t) => (
                                <button key={t.id} onClick={() => tagMutation.mutate({ assetId: showTagModal, tagId: t.id })}
                                    className="flex items-center gap-2 p-3 rounded-lg border text-left transition-all hover:scale-105"
                                    style={{ background: `${t.color}15`, borderColor: `${t.color}30`, color: t.color }}>
                                    <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
