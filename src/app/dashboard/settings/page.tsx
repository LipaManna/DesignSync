'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, ShieldAlert, UserCog, Users, Wand2, Plug, CreditCard, ChevronRight, Check } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { updateRole } from '@/store/authSlice';
import { UserRole } from '@/types';
import toast from 'react-hot-toast';

const ROLE_INFO: Record<UserRole, { label: string; description: string; color: string }> = {
    admin: { label: 'Admin', description: 'Full access — create, edit, delete projects, manage members, access settings', color: '#a78bfa' },
    designer: { label: 'Designer', description: 'Can create/edit projects and assets, use AI tools. Cannot delete workspace or manage roles', color: '#f9a8d4' },
    viewer: { label: 'Viewer', description: 'Read-only access to projects and analytics. Cannot create or modify content', color: '#5eead4' },
};

const SETTINGS_ITEMS = [
    { title: 'Workspace Settings', description: 'Manage your team workspace name, logo, and defaults.', icon: Settings },
    { title: 'Member Management', description: 'Invite members, change roles from Admin, Designer, Viewer.', icon: Users },
    { title: 'AI Quota & Usage', description: 'View and manage monthly AI API call limits per user.', icon: Wand2 },
    { title: 'Integrations', description: 'Connect to Figma, Slack, GitHub, and other tools.', icon: Plug },
    { title: 'Billing', description: 'View invoices, upgrade plan, manage payment methods.', icon: CreditCard },
];

export default function SettingsPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { role, user } = useAppSelector((s) => s.auth);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        if (role !== 'admin') router.replace('/dashboard');
    }, [role, router]);

    if (role !== 'admin') return null;

    const handleRoleSwitch = (newRole: UserRole) => {
        dispatch(updateRole(newRole));
        toast.success(`Switched to ${newRole} role — UI updated!`, { duration: 3000 });
        if (newRole !== 'admin') router.replace('/dashboard');
    };

    return (
        <div className="p-6 max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    <Settings className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Settings</h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Admin workspace configuration</p>
                </div>
                <span className="badge badge-admin ml-auto">Admin only</span>
            </div>

            {/* Demo: Role Switcher */}
            <div className="card p-5 mb-6" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
                <div className="flex items-center gap-2 mb-4">
                    <UserCog className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                    <h2 className="font-bold">Role Switcher</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold ml-1" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
                        Demo
                    </span>
                    <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>Simulate role-based UI</span>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    Switch roles to see how the UI adapts in real time — navigation items, permissions, and access controls all update immediately.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(ROLE_INFO) as UserRole[]).map((r) => {
                        const info = ROLE_INFO[r];
                        const isActive = role === r;
                        return (
                            <button
                                key={r}
                                onClick={() => handleRoleSwitch(r)}
                                className="p-4 rounded-xl border text-left transition-all hover:scale-[1.02] relative"
                                style={{
                                    background: isActive ? `${info.color}15` : 'rgba(255,255,255,0.03)',
                                    borderColor: isActive ? `${info.color}50` : 'var(--color-border)',
                                    boxShadow: isActive ? `0 0 15px ${info.color}20` : 'none',
                                }}
                            >
                                {isActive && (
                                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center animate-scale-in" style={{ background: info.color }}>
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                <span className={`badge badge-${r} mb-2 inline-flex`}>{info.label}</span>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{info.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Settings Items */}
            <div className="space-y-3">
                {SETTINGS_ITEMS.map(({ title, description, icon: Icon }) => (
                    <div key={title} className="card p-5 flex items-center justify-between cursor-pointer group"
                        style={{ transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)', borderLeft: '3px solid transparent' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderLeftColor = 'var(--color-primary)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent'; }}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.1)' }}>
                                <Icon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-0.5">{title}</h3>
                                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            <button className="btn btn-secondary btn-sm opacity-0 group-hover:opacity-100 transition-opacity">Configure</button>
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-dim)' }} />
                        </div>
                    </div>
                ))}

                {/* Danger Zone */}
                <div className="card p-5" style={{ borderColor: 'rgba(239,68,68,0.25)' }}>
                    <div className="flex items-center gap-2 mb-3" style={{ color: '#f87171' }}>
                        <ShieldAlert className="w-5 h-5" />
                        <h3 className="font-semibold">Danger Zone</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Delete Workspace</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>This will permanently remove all projects and assets.</p>
                        </div>
                        {deleteConfirm ? (
                            <div className="flex items-center gap-2 ml-4">
                                <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                                <button className="btn btn-danger btn-sm animate-scale-in" onClick={() => { toast.error('Workspace deleted (demo)'); setDeleteConfirm(false); }}>Confirm Delete</button>
                            </div>
                        ) : (
                            <button className="btn btn-danger btn-sm ml-4 flex-shrink-0" onClick={() => setDeleteConfirm(true)}>Delete</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
