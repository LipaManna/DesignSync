import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, Asset, ViewMode } from '@/types';

interface ProjectsState {
    projects: Project[];
    selectedProjectId: string | null;
    assets: Record<string, Asset[]>;
    viewMode: ViewMode;
    searchQuery: string;
    filterCategory: string;
    filterStatus: string;
    isLoading: boolean;
}

const initialState: ProjectsState = {
    projects: [],
    selectedProjectId: null,
    assets: {},
    viewMode: 'grid',
    searchQuery: '',
    filterCategory: 'all',
    filterStatus: 'all',
    isLoading: false,
};

const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        setProjects(state, action: PayloadAction<Project[]>) {
            state.projects = action.payload;
        },
        addProject(state, action: PayloadAction<Project>) {
            state.projects.unshift(action.payload);
        },
        updateProject(state, action: PayloadAction<Project>) {
            state.projects = state.projects.map((p) =>
                p.id === action.payload.id ? action.payload : p
            );
        },
        removeProject(state, action: PayloadAction<string>) {
            state.projects = state.projects.filter((p) => p.id !== action.payload);
            if (state.selectedProjectId === action.payload) state.selectedProjectId = null;
        },
        setSelectedProject(state, action: PayloadAction<string | null>) {
            state.selectedProjectId = action.payload;
        },
        setAssets(state, action: PayloadAction<{ projectId: string; assets: Asset[] }>) {
            state.assets[action.payload.projectId] = action.payload.assets;
        },
        addAsset(state, action: PayloadAction<Asset>) {
            const pid = action.payload.projectId;
            if (!state.assets[pid]) state.assets[pid] = [];
            state.assets[pid].unshift(action.payload);
        },
        updateAsset(state, action: PayloadAction<Asset>) {
            const pid = action.payload.projectId;
            if (state.assets[pid]) {
                state.assets[pid] = state.assets[pid].map((a) =>
                    a.id === action.payload.id ? action.payload : a
                );
            }
        },
        removeAsset(state, action: PayloadAction<{ projectId: string; assetId: string }>) {
            const { projectId, assetId } = action.payload;
            if (state.assets[projectId]) {
                state.assets[projectId] = state.assets[projectId].filter((a) => a.id !== assetId);
            }
        },
        reorderAssets(state, action: PayloadAction<{ projectId: string; assets: Asset[] }>) {
            state.assets[action.payload.projectId] = action.payload.assets;
        },
        setViewMode(state, action: PayloadAction<ViewMode>) {
            state.viewMode = action.payload;
        },
        setSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
        },
        setFilterCategory(state, action: PayloadAction<string>) {
            state.filterCategory = action.payload;
        },
        setFilterStatus(state, action: PayloadAction<string>) {
            state.filterStatus = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
    },
});

export const {
    setProjects, addProject, updateProject, removeProject,
    setSelectedProject, setAssets, addAsset, updateAsset, removeAsset,
    reorderAssets, setViewMode, setSearchQuery, setFilterCategory, setFilterStatus, setLoading,
} = projectsSlice.actions;
export default projectsSlice.reducer;
