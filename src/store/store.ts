import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import projectsReducer from './projectsSlice';
import collaborationReducer from './collaborationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        projects: projectsReducer,
        collaboration: collaborationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
