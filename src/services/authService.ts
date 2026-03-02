import { generateMockJWT, sleep } from '@/lib/utils';
import { MOCK_USERS } from '@/lib/mockData';
import { User } from '@/types';

interface LoginResult {
    success: boolean;
    message: string;
    pendingEmail?: string;
}

interface OTPVerifyResult {
    success: boolean;
    user?: User;
    token?: string;
    message: string;
}

const VALID_OTP = '123456';

export const authService = {
    async login(email: string, password: string): Promise<LoginResult> {
        await sleep(1200);
        const user = MOCK_USERS.find((u) => u.email === email);
        if (!user) {
            return { success: false, message: 'No account found with that email.' };
        }
        if (password.length < 6) {
            return { success: false, message: 'Invalid password.' };
        }
        // Store pending email in sessionStorage for OTP step
        sessionStorage.setItem('pending_otp_email', email);
        return { success: true, message: 'OTP sent to your email.', pendingEmail: email };
    },

    async verifyOTP(email: string, otp: string): Promise<OTPVerifyResult> {
        await sleep(1000);
        if (otp !== VALID_OTP) {
            return { success: false, message: `Invalid OTP. Hint: use ${VALID_OTP}` };
        }
        const user = MOCK_USERS.find((u) => u.email === email);
        if (!user) {
            return { success: false, message: 'Session expired. Please login again.' };
        }
        const token = generateMockJWT({ sub: user.id, email: user.email, role: user.role });
        sessionStorage.removeItem('pending_otp_email');
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', token);
        }
        return { success: true, user, token, message: 'Login successful.' };
    },

    async logout(): Promise<void> {
        await sleep(300);
        sessionStorage.clear();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
        }
    },

    getPendingEmail(): string | null {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem('pending_otp_email');
    },
};
