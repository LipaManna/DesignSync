import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OnlineUser, EditingIndicator, Comment, ActivityEvent } from '@/types';

interface CollaborationState {
    onlineUsers: OnlineUser[];
    editingIndicators: EditingIndicator[];
    comments: Comment[];
    activityFeed: ActivityEvent[];
    isSimulationRunning: boolean;
}

const initialState: CollaborationState = {
    onlineUsers: [],
    editingIndicators: [],
    comments: [],
    activityFeed: [],
    isSimulationRunning: false,
};

const collaborationSlice = createSlice({
    name: 'collaboration',
    initialState,
    reducers: {
        setOnlineUsers(state, action: PayloadAction<OnlineUser[]>) {
            state.onlineUsers = action.payload;
        },
        updatePresence(state, action: PayloadAction<OnlineUser[]>) {
            state.onlineUsers = action.payload;
        },
        setEditingIndicators(state, action: PayloadAction<EditingIndicator[]>) {
            state.editingIndicators = action.payload;
        },
        addEditingIndicator(state, action: PayloadAction<EditingIndicator>) {
            state.editingIndicators = [
                action.payload,
                ...state.editingIndicators.filter((e) => e.userId !== action.payload.userId).slice(0, 2),
            ];
        },
        removeEditingIndicator(state, action: PayloadAction<string>) {
            state.editingIndicators = state.editingIndicators.filter((e) => e.userId !== action.payload);
        },
        setComments(state, action: PayloadAction<Comment[]>) {
            state.comments = action.payload;
        },
        addComment(state, action: PayloadAction<Comment>) {
            if (!state.comments.some((c) => c.id === action.payload.id)) {
                state.comments = [action.payload, ...state.comments];
            }
        },
        setActivityFeed(state, action: PayloadAction<ActivityEvent[]>) {
            state.activityFeed = action.payload;
        },
        addActivityEvent(state, action: PayloadAction<ActivityEvent>) {
            if (!state.activityFeed.some((e) => e.id === action.payload.id)) {
                state.activityFeed = [action.payload, ...state.activityFeed.slice(0, 29)];
            }
        },
        setSimulationRunning(state, action: PayloadAction<boolean>) {
            state.isSimulationRunning = action.payload;
        },
    },
});

export const {
    setOnlineUsers, updatePresence, setEditingIndicators, addEditingIndicator,
    removeEditingIndicator, setComments, addComment, setActivityFeed,
    addActivityEvent, setSimulationRunning,
} = collaborationSlice.actions;
export default collaborationSlice.reducer;
