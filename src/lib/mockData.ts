import { Project, Asset, User, Tag, ActivityEvent, Comment } from '@/types';

export const MOCK_TAGS: Tag[] = [
    { id: 'tag-1', name: 'Brand', color: '#6366f1' },
    { id: 'tag-2', name: 'UI Kit', color: '#8b5cf6' },
    { id: 'tag-3', name: 'Hero', color: '#ec4899' },
    { id: 'tag-4', name: 'Icons', color: '#14b8a6' },
    { id: 'tag-5', name: 'Typography', color: '#f59e0b' },
    { id: 'tag-6', name: 'Dark Mode', color: '#3b82f6' },
    { id: 'tag-7', name: 'Export Ready', color: '#22c55e' },
    { id: 'tag-8', name: 'WIP', color: '#ef4444' },
];

export const MOCK_USERS: User[] = [
    { id: 'u1', email: 'admin@design.io', name: 'Alex Rivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', role: 'admin', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'u2', email: 'sarah@design.io', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', role: 'designer', createdAt: '2024-01-15T00:00:00Z' },
    { id: 'u3', email: 'marco@design.io', name: 'Marco Silva', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marco', role: 'designer', createdAt: '2024-02-01T00:00:00Z' },
    { id: 'u4', email: 'priya@design.io', name: 'Priya Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', role: 'viewer', createdAt: '2024-02-15T00:00:00Z' },
    { id: 'u5', email: 'tom@design.io', name: 'Tom Walker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom', role: 'designer', createdAt: '2024-03-01T00:00:00Z' },
];

export const MOCK_PROJECTS: Project[] = [
    { id: 'p1', name: 'Nebula Design System', description: 'Core component library and design tokens for the main product', color: '#6366f1', coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', ownerId: 'u1', members: ['u1', 'u2', 'u3'], assetCount: 24, status: 'active', createdAt: '2024-01-10T00:00:00Z', updatedAt: '2024-03-20T10:00:00Z', tags: [MOCK_TAGS[0], MOCK_TAGS[1]] },
    { id: 'p2', name: 'Aurora Brand Kit', description: 'Brand identity assets including logos, color palettes, and typography', color: '#ec4899', coverUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80', ownerId: 'u2', members: ['u1', 'u2', 'u4'], assetCount: 47, status: 'active', createdAt: '2024-02-05T00:00:00Z', updatedAt: '2024-03-18T14:30:00Z', tags: [MOCK_TAGS[0], MOCK_TAGS[6]] },
    { id: 'p3', name: 'Quantum Mobile App', description: 'Mobile UI screens and interaction prototypes for iOS & Android', color: '#14b8a6', coverUrl: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800&q=80', ownerId: 'u3', members: ['u2', 'u3', 'u5'], assetCount: 89, status: 'active', createdAt: '2024-02-20T00:00:00Z', updatedAt: '2024-03-22T09:15:00Z', tags: [MOCK_TAGS[1], MOCK_TAGS[2]] },
    { id: 'p4', name: 'Vertex E-Commerce', description: 'Product pages, cart flows, and checkout experience designs', color: '#f59e0b', coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', ownerId: 'u1', members: ['u1', 'u4', 'u5'], assetCount: 35, status: 'draft', createdAt: '2024-03-01T00:00:00Z', updatedAt: '2024-03-21T16:00:00Z', tags: [MOCK_TAGS[7]] },
    { id: 'p5', name: 'Zenith Dashboard', description: 'Analytics and data visualization dashboard components', color: '#3b82f6', coverUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80', ownerId: 'u2', members: ['u2', 'u3'], assetCount: 18, status: 'active', createdAt: '2024-03-10T00:00:00Z', updatedAt: '2024-03-23T11:00:00Z', tags: [MOCK_TAGS[5], MOCK_TAGS[1]] },
    { id: 'p6', name: 'Pulse Marketing Site', description: 'Landing pages and marketing collateral for product launch', color: '#22c55e', coverUrl: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&q=80', ownerId: 'u5', members: ['u1', 'u5'], assetCount: 12, status: 'archived', createdAt: '2023-12-01T00:00:00Z', updatedAt: '2024-01-30T08:00:00Z', tags: [MOCK_TAGS[2], MOCK_TAGS[6]] },
];

const PLACEHOLDER_IMAGES = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80',
    'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=400&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
    'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400&q=80',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
];

export function generateMockAssets(projectId: string, count: number = 20): Asset[] {
    const categories = ['brand', 'illustration', 'photography', 'ui', 'other'] as const;
    const types = ['image', 'image', 'image', 'image', 'document', 'icon'] as const;
    return Array.from({ length: count }, (_, i) => ({
        id: `asset-${projectId}-${i + 1}`,
        projectId,
        name: `Asset ${i + 1} — ${['Hero Banner', 'Icon Set', 'Color Palette', 'Typography', 'Logo Variant', 'Pattern', 'Illustration', 'UI Component'][i % 8]}`,
        type: types[i % types.length],
        category: categories[i % categories.length],
        url: PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length],
        thumbnailUrl: PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length],
        size: Math.floor(Math.random() * 5000000) + 50000,
        tags: [MOCK_TAGS[i % MOCK_TAGS.length]],
        uploadedBy: MOCK_USERS[i % MOCK_USERS.length].id,
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
        order: i,
        aiProcessed: i % 3 === 0,
    }));
}

export const MOCK_ACTIVITY: ActivityEvent[] = [
    { id: 'a1', userId: 'u2', userName: 'Sarah Chen', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', action: 'uploaded', target: 'Hero Banner v3.png', targetType: 'asset', createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 'a2', userId: 'u3', userName: 'Marco Silva', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marco', action: 'applied AI background removal to', target: 'Product Shot.jpg', targetType: 'ai-job', createdAt: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: 'a3', userId: 'u1', userName: 'Alex Rivera', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', action: 'created project', target: 'Zenith Dashboard', targetType: 'project', createdAt: new Date(Date.now() - 45 * 60000).toISOString() },
    { id: 'a4', userId: 'u5', userName: 'Tom Walker', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom', action: 'commented on', target: 'Color System Guidelines', targetType: 'comment', createdAt: new Date(Date.now() - 90 * 60000).toISOString() },
    { id: 'a5', userId: 'u4', userName: 'Priya Patel', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', action: 'tagged', target: 'Icon Set Final', targetType: 'asset', createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
];

export const MOCK_COMMENTS: Comment[] = [
    { id: 'c1', projectId: 'p1', authorId: 'u2', authorName: 'Sarah Chen', authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', content: 'The primary purple looks great! Should we also test it on dark backgrounds?', createdAt: new Date(Date.now() - 30 * 60000).toISOString(), resolved: false },
    { id: 'c2', projectId: 'p1', authorId: 'u3', authorName: 'Marco Silva', authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marco', content: 'Agreed. I\'ll run the contrast ratio check on all text/background combos tonight.', createdAt: new Date(Date.now() - 25 * 60000).toISOString(), resolved: false },
    { id: 'c3', projectId: 'p1', authorId: 'u1', authorName: 'Alex Rivera', authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', content: 'Let\'s also make sure the brand guide PDF is updated before Thursday\'s review.', createdAt: new Date(Date.now() - 15 * 60000).toISOString(), resolved: false },
];

export function generateAnalyticsData(days: number) {
    const now = Date.now();
    const assetUsage = Array.from({ length: days }, (_, i) => ({
        date: new Date(now - (days - 1 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.floor(Math.random() * 40) + 5,
    }));
    const userActivity = Array.from({ length: days }, (_, i) => ({
        date: new Date(now - (days - 1 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.floor(Math.random() * 20) + 2,
    }));
    const collaborationRate = Array.from({ length: days }, (_, i) => ({
        date: new Date(now - (days - 1 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        comments: Math.floor(Math.random() * 15) + 1,
        edits: Math.floor(Math.random() * 25) + 3,
    }));
    return {
        assetUsage,
        userActivity,
        projectPerformance: [
            { name: 'Nebula Design System', value: 78, fill: '#6366f1' },
            { name: 'Aurora Brand Kit', value: 92, fill: '#ec4899' },
            { name: 'Quantum Mobile App', value: 65, fill: '#14b8a6' },
            { name: 'Vertex E-Commerce', value: 45, fill: '#f59e0b' },
            { name: 'Zenith Dashboard', value: 83, fill: '#3b82f6' },
        ],
        aiUsageStats: [
            { tool: 'BG Removal', count: 142, fill: '#6366f1' },
            { tool: 'Color Palette', count: 98, fill: '#ec4899' },
            { tool: 'Style Transfer', count: 74, fill: '#14b8a6' },
            { tool: 'Auto Layout', count: 56, fill: '#f59e0b' },
            { tool: 'Smart Crop', count: 113, fill: '#3b82f6' },
        ],
        kpis: {
            totalAssets: 225,
            activeUsers: 5,
            aiCalls: 483,
            totalProjects: 6,
        },
        assetTypeDistribution: [
            { name: 'Images', value: 142, fill: '#6366f1' },
            { name: 'Icons', value: 38, fill: '#ec4899' },
            { name: 'Documents', value: 25, fill: '#14b8a6' },
            { name: 'Videos', value: 13, fill: '#f59e0b' },
            { name: 'Fonts', value: 7, fill: '#3b82f6' },
        ],
        collaborationRate,
    };
}

