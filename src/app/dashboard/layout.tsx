'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    Zap, LayoutDashboard, FolderOpen, Wand2, Users2,
    BarChart2, Settings, LogOut, ChevronLeft, ChevronRight,
    Bell, Moon, Sun,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { logout } from '@/store/authSlice';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Projects', roles: ['admin', 'designer', 'viewer'] },
    { href: '/dashboard/ai-tools', icon: Wand2, label: 'AI Tools', roles: ['admin', 'designer'] },
    { href: '/dashboard/collaboration', icon: Users2, label: 'Collaboration', roles: ['admin', 'designer', 'viewer'] },
    { href: '/dashboard/analytics', icon: BarChart2, label: 'Analytics', roles: ['admin', 'designer', 'viewer'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { isAuthenticated, user, role } = useAppSelector((s) => s.auth);
    const [collapsed, setCollapsed] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    // Initialize theme from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (saved) {
            setTheme(saved);
            applyTheme(saved);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) router.replace('/login');
    }, [isAuthenticated, router]);

    const applyTheme = (t: 'dark' | 'light') => {
        document.documentElement.classList.toggle('light-mode', t === 'light');
    };

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        applyTheme(next);
        localStorage.setItem('theme', next);
    };

    if (!isAuthenticated || !user) return null;

    const handleLogout = async () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        router.replace('/login');
    };

    const allowedItems = NAV_ITEMS.filter((item) => item.roles.includes(role ?? 'viewer'));

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-base)' }}>
            {/* Sidebar */}
            <aside
                className={cn('flex flex-col transition-all duration-300 ease-in-out border-r flex-shrink-0', collapsed ? 'w-[64px]' : 'w-[220px]')}
                style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid var(--color-border)', minHeight: '68px' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 animate-glow" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && <span className="font-bold text-base gradient-text whitespace-nowrap">DesignSync</span>}
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {allowedItems.map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href} className={cn('sidebar-link', pathname === href && 'active')} data-tooltip={collapsed ? label : undefined}>
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {!collapsed && <span>{label}</span>}
                        </Link>
                    ))}

                    {role === 'admin' && (
                        <Link href="/dashboard/settings" className={cn('sidebar-link', pathname === '/dashboard/settings' && 'active')} data-tooltip={collapsed ? 'Settings' : undefined}>
                            <Settings className="w-4 h-4 flex-shrink-0" />
                            {!collapsed && <span>Settings</span>}
                        </Link>
                    )}
                </nav>

                {/* Footer */}
                <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <button
                        className="sidebar-link w-full"
                        onClick={handleLogout}
                        data-tooltip={collapsed ? 'Sign Out' : undefined}
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="flex items-center gap-4 px-6 h-[68px] flex-shrink-0" style={{ background: 'var(--color-bg-surface)', borderBottom: '1px solid var(--color-border)' }}>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="btn btn-ghost btn-icon"
                        aria-label="Toggle sidebar"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>

                    <div className="flex-1" />

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm hidden sm:flex" style={{ color: 'var(--color-text-muted)' }}>
                        <FolderOpen className="w-4 h-4" />
                        <span>
                            {NAV_ITEMS.find((n) => pathname.startsWith(n.href) && (n.href !== '/dashboard' || pathname === '/dashboard'))?.label ?? 'Settings'}
                        </span>
                    </div>

                    <div className="flex-1" />

                    {/* Theme toggle */}
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={toggleTheme}
                        data-tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {/* Notifications */}
                    <button className="btn btn-ghost btn-icon relative" aria-label="Notifications">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-ping" style={{ background: '#ef4444', opacity: 0.6 }} />
                    </button>

                    {/* User */}
                    <div className="flex items-center gap-2 pl-3" style={{ borderLeft: '1px solid var(--color-border)' }}>
                        <div style={{
                            borderRadius: '50%',
                            padding: '2px',
                            background: role === 'admin' ? 'linear-gradient(135deg,#a78bfa,#6366f1)' : role === 'designer' ? 'linear-gradient(135deg,#ec4899,#f9a8d4)' : 'linear-gradient(135deg,#14b8a6,#5eead4)',
                            boxShadow: role === 'admin' ? '0 0 10px rgba(167,139,250,0.4)' : role === 'designer' ? '0 0 10px rgba(236,72,153,0.4)' : '0 0 10px rgba(20,184,166,0.4)',
                        }}>
                            <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full block" style={{ border: '2px solid var(--color-bg-surface)' }} />
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-sm font-semibold leading-none mb-1">{user.name}</div>
                            <span className={`badge badge-${role}`}>{role}</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
