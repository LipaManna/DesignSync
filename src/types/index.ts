// ─── User & Auth ─────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'designer' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  otpPending: boolean;
  pendingEmail: string | null;
}

// ─── Project & Asset ──────────────────────────────────────────────────────────
export type AssetType = 'image' | 'video' | 'document' | 'font' | 'icon';
export type AssetCategory = 'brand' | 'illustration' | 'photography' | 'ui' | 'other';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: AssetType;
  category: AssetCategory;
  url: string;
  thumbnailUrl: string;
  size: number; // bytes
  tags: Tag[];
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  order: number;
  aiProcessed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  coverUrl: string;
  ownerId: string;
  members: string[];
  assetCount: number;
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

// ─── AI Jobs ──────────────────────────────────────────────────────────────────
export type AIToolType =
  | 'background-removal'
  | 'color-palette'
  | 'style-transfer'
  | 'auto-layout'
  | 'smart-crop';

export type AIJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AIJob {
  id: string;
  toolType: AIToolType;
  assetId: string;
  assetName: string;
  status: AIJobStatus;
  progress: number; // 0–100
  result: AIJobResult | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AIJobResult {
  type: AIToolType;
  data: Record<string, unknown>;
}

// ─── Collaboration ────────────────────────────────────────────────────────────
export interface OnlineUser {
  userId: string;
  name: string;
  avatar: string;
  color: string;
  lastSeen: string;
  currentPage: string;
}

export interface EditingIndicator {
  userId: string;
  userName: string;
  resourceType: 'project' | 'asset';
  resourceId: string;
  resourceName: string;
  startedAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  assetId?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  resolved: boolean;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  targetType: 'project' | 'asset' | 'comment' | 'ai-job';
  createdAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface AnalyticsData {
  assetUsage: TimeSeriesPoint[];
  userActivity: TimeSeriesPoint[];
  projectPerformance: { name: string; value: number; fill: string }[];
  aiUsageStats: { tool: string; count: number; fill: string }[];
  kpis: {
    totalAssets: number;
    activeUsers: number;
    aiCalls: number;
    totalProjects: number;
  };
}

// ─── UI State ─────────────────────────────────────────────────────────────────
export type ViewMode = 'grid' | 'list';
export type Theme = 'dark' | 'light';
