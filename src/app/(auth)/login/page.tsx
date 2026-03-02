'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useRedux';
import { setOTPPending } from '@/store/authSlice';
import { authService } from '@/services/authService';
import { MOCK_USERS } from '@/lib/mockData';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [showPass, setShowPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            const result = await authService.login(data.email, data.password);
            if (result.success && result.pendingEmail) {
                dispatch(setOTPPending({ email: result.pendingEmail }));
                toast.success('OTP sent! Check your email.');
                router.push('/otp');
            } else {
                toast.error(result.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const quickLogin = (email: string) => {
        setValue('email', email);
        setValue('password', 'password123');
    };

    return (
        <div className="min-h-screen bg-grid flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--color-bg-base)' }}>
            {/* Background orbs */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-8 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)' }} />

            <div className="relative z-10 w-full max-w-md px-4">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-glow" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">DesignSync</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Sign in to your design workspace</p>
                </div>

                {/* Card */}
                <div className="card p-8 animate-fade-in">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="form-label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-dim)' }} />
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`form-input pl-10 ${errors.email ? 'error' : ''}`}
                                    placeholder="you@design.io"
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && <p className="form-error">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="form-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-dim)' }} />
                                <input
                                    {...register('password')}
                                    type={showPass ? 'text' : 'password'}
                                    className={`form-input pl-10 pr-10 ${errors.password ? 'error' : ''}`}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost btn-icon" style={{ padding: '4px' }}>
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="form-error">{errors.password.message}</p>}
                        </div>

                        <button type="submit" disabled={isLoading} className="btn btn-primary w-full btn-lg justify-center mt-2">
                            {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            {isLoading ? 'Authenticating…' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--color-text-dim)' }}>Quick Login</span>
                        <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                    </div>

                    {/* Demo accounts */}
                    <div className="space-y-2">
                        <p className="text-xs text-center mb-3" style={{ color: 'var(--color-text-dim)' }}>
                            <Sparkles className="inline w-3 h-3 mr-1" /> Try a demo account — OTP is <code className="px-1 py-0.5 rounded text-xs" style={{ background: 'rgba(99,102,241,0.15)', color: '#a78bfa' }}>123456</code>
                        </p>
                        {MOCK_USERS.slice(0, 3).map((u) => (
                            <button key={u.id} onClick={() => quickLogin(u.email)} className="btn btn-ghost w-full text-left justify-start gap-3 border" style={{ borderColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full" />
                                <div className="min-w-0">
                                    <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{u.name}</div>
                                    <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{u.email}</div>
                                </div>
                                <span className={`badge badge-${u.role} ml-auto`}>{u.role}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
