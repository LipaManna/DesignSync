'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Zap, ShieldCheck, RotateCcw, ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { loginSuccess } from '@/store/authSlice';
import { authService } from '@/services/authService';

export default function OTPPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { pendingEmail, isAuthenticated } = useAppSelector((s) => s.auth);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const email = pendingEmail ?? authService.getPendingEmail() ?? '';

    useEffect(() => {
        if (isAuthenticated) return;
        if (!email) router.replace('/login');
        inputRefs.current[0]?.focus();
    }, [email, router, isAuthenticated]);

    const handleChange = (i: number, val: string) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...otp];
        next[i] = val.slice(-1);
        setOtp(next);
        if (val && i < 5) inputRefs.current[i + 1]?.focus();
        if (next.every(Boolean)) handleVerify(next.join(''));
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        }
    };

    const handleVerify = async (code: string) => {
        setIsLoading(true);
        try {
            const result = await authService.verifyOTP(email, code);
            if (result.success && result.user && result.token) {
                dispatch(loginSuccess({ user: result.user, token: result.token }));
                toast.success(`Welcome back, ${result.user.name}! 🎉`);
                router.push('/dashboard');
            } else {
                toast.error(result.message);
                setShake(true);
                setOtp(['', '', '', '', '', '']);
                setTimeout(() => { setShake(false); inputRefs.current[0]?.focus(); }, 500);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
        const next = [...otp];
        pasted.forEach((ch, i) => { next[i] = ch; });
        setOtp(next);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
        if (pasted.length === 6) handleVerify(pasted.join(''));
        e.preventDefault();
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-grid" style={{ background: 'var(--color-bg-base)' }}>
            <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">DesignSync</span>
                    </div>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                        <ShieldCheck className="w-8 h-8" style={{ color: '#a78bfa' }} />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Verify your identity</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Enter the 6-digit code sent to<br />
                        <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>{email}</span>
                    </p>
                </div>

                <div className="card p-8 animate-fade-in">
                    <div className="p-3 rounded-lg mb-6 text-sm text-center" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--color-text-muted)' }}>
                        💡 Demo hint: OTP is <span className="font-bold" style={{ color: '#a78bfa' }}>123456</span>
                    </div>

                    <div className={`flex gap-3 justify-center mb-8 ${shake ? 'animate-bounce-sm' : ''}`} onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => { inputRefs.current[i] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className="w-12 h-14 text-center text-xl font-bold rounded-lg border outline-none transition-all duration-150"
                                style={{
                                    background: digit ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                                    borderColor: digit ? '#6366f1' : 'var(--color-border)',
                                    color: 'var(--color-text)',
                                    boxShadow: digit ? '0 0 12px rgba(99,102,241,0.3)' : 'none',
                                }}
                                disabled={isLoading}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => handleVerify(otp.join(''))}
                        disabled={isLoading || otp.some(Boolean) === false}
                        className="btn btn-primary w-full btn-lg justify-center"
                    >
                        {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        {isLoading ? 'Verifying…' : 'Verify & Continue'}
                    </button>

                    <div className="flex items-center justify-between mt-6 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
                        <button onClick={() => router.push('/login')} className="btn btn-ghost btn-sm">
                            <ArrowLeft className="w-3 h-3" /> Back
                        </button>
                        <button onClick={() => toast.success('OTP resent!')} className="btn btn-ghost btn-sm" style={{ color: 'var(--color-accent)' }}>
                            <RotateCcw className="w-3 h-3" /> Resend OTP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
