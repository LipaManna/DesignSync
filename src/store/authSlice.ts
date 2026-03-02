import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, UserRole } from '@/types';

const initialState: AuthState = {
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
    otpPending: false,
    pendingEmail: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setOTPPending(state, action: PayloadAction<{ email: string }>) {
            state.otpPending = true;
            state.pendingEmail = action.payload.email;
        },
        loginSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.role = action.payload.user.role;
            state.isAuthenticated = true;
            state.otpPending = false;
            state.pendingEmail = null;
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;
            state.otpPending = false;
            state.pendingEmail = null;
        },
        updateRole(state, action: PayloadAction<UserRole>) {
            state.role = action.payload;
            if (state.user) state.user.role = action.payload;
        },
    },
});

export const { setOTPPending, loginSuccess, logout, updateRole } = authSlice.actions;
export default authSlice.reducer;
