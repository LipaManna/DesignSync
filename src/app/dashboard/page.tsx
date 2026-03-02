'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
    Plus, Search, Grid3X3, List, X, FolderOpen, Layers,
    Clock, Users, ChevronRight, Sparkles, MoreVertical, Trash2, Edit2,
} from 'lucide-react';
import { projectsService } from '@/services/projectsService';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { addProject, setViewMode, setSearchQuery, setFilterStatus } from '@/store/projectsSlice';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Project } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

const projectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(50),
    description: z.string().max(200).optional(),
    color: z.string().default('#6366f1'),
    status: z.enum(['active', 'draft', 'archived']).default('active'),
});
type ProjectForm = z.infer<typeof projectSchema>;

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6', '#22c55e', '#ef4444', '#a78bfa'];
const STATUSES = [
    { value: 'all', label: 'All Projects' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
];

function ProjectSkeleton({ mode }: { mode: string }) {
    if (mode === 'list') {
        return (
            <div className="h-20 skeleton w-full" style={{ borderRadius: 'var(--radius-md)' }} />
        );
    }
    return (
        <div className="card overflow-hidden">
            <div className="h-36 skeleton" />
            <div className="p-4 space-y-2">
                <div className="h-4 skeleton w-3/4" />
                <div className="h-3 skeleton w-1/2" />
            </div>
        </div>
    );
}

function ProjectCard({ project, onOpen, onDelete, role }: { project: Project; onOpen: () => void; onDelete: () => void; role: string | null }) {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <div className="asset-card group relative" onClick={onOpen}>
            <div className="h-36 relative overflow-hidden">
                <img src={project.coverUrl} alt={project.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, ${project.color}60)` }} />
                <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
                    {project.tags.slice(0, 2).map((t) => (
                        <span key={t.id} className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: `${t.color}aa` }}>{t.name}</span>
                    ))}
                </div>
                <div className="absolute top-3 right-3">
                    <span className={`badge badge-${project.status}`}>{project.status}</span>
                </div>
                <div className="absolute left-3 bottom-3 w-4 h-4 rounded-full border-2 border-white/40" style={{ background: project.color }} />
            </div>
            <div className="p-4">
                <h3 className="font-bold text-sm mb-1 truncate" style={{ color: 'var(--color-text)' }}>{project.name}</h3>
                <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{project.description}</p>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--color-text-dim)' }}>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{project.assetCount}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{project.members.length}</span>
                    </div>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeTime(project.updatedAt)}</span>
                </div>
            </div>
            {(role === 'admin' || role === 'designer') && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}>
                    <button className="btn btn-ghost btn-icon glass" style={{ padding: '4px' }}>
                        <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-1 w-36 rounded-lg overflow-hidden z-20 shadow-xl" style={{ background: 'var(--color-bg-card2)', border: '1px solid var(--color-border)' }}>
                            <button onClick={(e) => { e.stopPropagation(); onOpen(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                <Edit2 className="w-3 h-3" /> Open
                            </button>
                            {role === 'admin' && (
                                <button onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-red-500/10 flex items-center gap-2" style={{ color: '#f87171' }}>
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ProjectListRow({ project, onOpen, onDelete, role }: { project: Project; onOpen: () => void; onDelete: () => void; role: string | null }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl cursor-pointer group transition-all duration-150 border"
            style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)', borderLeft: `3px solid ${project.color}44` }}
            onClick={onOpen}
            onMouseEnter={e => (e.currentTarget.style.borderLeftColor = project.color)}
            onMouseLeave={e => (e.currentTarget.style.borderLeftColor = `${project.color}44`)}>
            <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden">
                <img src={project.coverUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </div>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: project.color }} />
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{project.name}</div>
                <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{project.description}</div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{project.assetCount}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{project.members.length}</span>
            </div>
            <span className={`badge badge-${project.status} hidden sm:inline-flex`}>{project.status}</span>
            <span className="text-xs hidden md:block" style={{ color: 'var(--color-text-dim)' }}>{formatRelativeTime(project.updatedAt)}</span>
            {role === 'admin' && (
                <button className="btn btn-ghost btn-icon opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                    <Trash2 className="w-3 h-3 text-red-400" />
                </button>
            )}
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-dim)' }} />
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const qc = useQueryClient();
    const { role } = useAppSelector((s) => s.auth);
    const { viewMode, searchQuery, filterStatus } = useAppSelector((s) => s.projects);
    const [showModal, setShowModal] = useState(false);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: projectsService.getProjects,
    });

    const createMutation = useMutation({
        mutationFn: projectsService.createProject,
        onMutate: async (data) => {
            await qc.cancelQueries({ queryKey: ['projects'] });
            const prev = qc.getQueryData<Project[]>(['projects']);
            const optimistic = { ...data, id: `temp-${Date.now()}`, assetCount: 0, members: ['u1'], ownerId: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: [] } as Project;
            qc.setQueryData<Project[]>(['projects'], (old) => [optimistic, ...(old ?? [])]);
            dispatch(addProject(optimistic));
            return { prev };
        },
        onError: (_, __, ctx) => {
            qc.setQueryData(['projects'], ctx?.prev);
            toast.error('Failed to create project');
        },
        onSuccess: (project) => {
            qc.setQueryData<Project[]>(['projects'], (old) =>
                (old ?? []).map((p) => (p.id.startsWith('temp-') ? project : p))
            );
            toast.success('Project created!');
            setShowModal(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: projectsService.deleteProject,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project deleted'); },
        onError: () => toast.error('Failed to delete project'),
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectForm>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(projectSchema) as any,
        defaultValues: { color: COLORS[0], status: 'active' },
    });

    const onSubmit = (data: ProjectForm) => {
        createMutation.mutate({ ...data, color: selectedColor });
        reset();
    };

    const filtered = projects.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            p.description.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text mb-1">Projects</h1>
                    <div className="h-0.5 w-16 rounded-full mb-2" style={{ background: 'linear-gradient(90deg,#6366f1,#a78bfa,transparent)' }} />
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                        {projects.length} workspace{projects.length !== 1 ? 's' : ''} · {projects.filter((p) => p.status === 'active').length} active
                    </p>
                </div>
                {(role === 'admin' || role === 'designer') && (
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-dim)' }} />
                    <input
                        type="text"
                        placeholder="Search projects…"
                        className="form-input pl-9"
                        value={searchQuery}
                        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    />
                </div>
                <div className="tab-list" style={{ minWidth: '260px' }}>
                    {STATUSES.map((s) => (
                        <button key={s.value} className={`tab-btn ${filterStatus === s.value ? 'active' : ''}`} onClick={() => dispatch(setFilterStatus(s.value))}>
                            {s.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)' }}>
                    <button className={cn('btn btn-sm', viewMode === 'grid' ? 'btn-secondary' : 'btn-ghost')} onClick={() => dispatch(setViewMode('grid'))}>
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button className={cn('btn btn-sm', viewMode === 'list' ? 'btn-secondary' : 'btn-ghost')} onClick={() => dispatch(setViewMode('list'))}>
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Grid / List */}
            {isLoading ? (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
                    {Array.from({ length: 6 }).map((_, i) => <ProjectSkeleton key={i} mode={viewMode} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <FolderOpen className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <h3 className="font-bold text-lg">No projects found</h3>
                    <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-muted)' }}>Try a different search or filter, or create a new project to get started.</p>
                    {(role === 'admin' || role === 'designer') && (
                        <button className="btn btn-primary mt-2" onClick={() => setShowModal(true)}>
                            <Plus className="w-4 h-4" /> New Project
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((p, idx) => (
                        <div key={p.id} className="animate-stagger-in" style={{ animationDelay: `${idx * 55}ms` }}>
                            <ProjectCard project={p} role={role}
                                onOpen={() => router.push(`/dashboard/projects/${p.id}`)}
                                onDelete={() => deleteMutation.mutate(p.id)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((p, idx) => (
                        <div key={p.id} className="animate-stagger-in" style={{ animationDelay: `${idx * 40}ms` }}>
                            <ProjectListRow project={p} role={role}
                                onOpen={() => router.push(`/dashboard/projects/${p.id}`)}
                                onDelete={() => deleteMutation.mutate(p.id)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                                <h2 className="text-xl font-bold">New Project</h2>
                            </div>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                            <div>
                                <label className="form-label">Project Name</label>
                                <input {...register('name')} className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g. Nebula Design System" />
                                {errors.name && <p className="form-error">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="form-label">Description</label>
                                <textarea {...register('description')} rows={3} className="form-input resize-none" placeholder="Brief description of this project…" />
                            </div>
                            <div>
                                <label className="form-label">Status</label>
                                <select {...register('status')} className="form-input">
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Accent Color</label>
                                <div className="flex gap-2">
                                    {COLORS.map((c) => (
                                        <button key={c} type="button" onClick={() => setSelectedColor(c)}
                                            className="w-8 h-8 rounded-lg transition-transform"
                                            style={{ background: c, transform: selectedColor === c ? 'scale(1.25)' : 'scale(1)', boxShadow: selectedColor === c ? `0 0 12px ${c}` : 'none' }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" className="btn btn-ghost flex-1" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" disabled={createMutation.isPending} className="btn btn-primary flex-1 justify-center">
                                    {createMutation.isPending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
