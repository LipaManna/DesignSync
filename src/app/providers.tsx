'use client';

import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store/store';
import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useRedux';
import { loginSuccess } from '@/store/authSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const [init, setInit] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token');
        if (userStr && token) {
            try {
                const user = JSON.parse(userStr);
                dispatch(loginSuccess({ user, token }));
            } catch (e) {
                // Ignore parsing errors
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_token');
            }
        }
        setInit(true);
    }, [dispatch]);

    if (!init) return null; // Wait for auth check before rendering UI to prevent flickers

    return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: { staleTime: 30 * 1000, retry: 1 },
                    mutations: { retry: 0 },
                },
            })
    );

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <AuthInitializer>
                    {children}
                </AuthInitializer>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#1e1b2e',
                            color: '#e2e8f0',
                            border: '1px solid rgba(99,102,241,0.3)',
                            borderRadius: '12px',
                            fontSize: '14px',
                        },
                        success: { iconTheme: { primary: '#22c55e', secondary: '#1e1b2e' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#1e1b2e' } },
                    }}
                />
            </QueryClientProvider>
        </Provider>
    );
}
