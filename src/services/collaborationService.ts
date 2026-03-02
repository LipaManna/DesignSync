import { sleep, generateId } from '@/lib/utils';
import { MOCK_USERS, MOCK_ACTIVITY, MOCK_COMMENTS } from '@/lib/mockData';
import { OnlineUser, EditingIndicator, Comment, ActivityEvent } from '@/types';
import { globalEmitter } from '@/lib/eventEmitter';

const USER_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6', '#22c55e'];

function makeOnlineUsers(): OnlineUser[] {
    return MOCK_USERS.slice(0, 4).map((u, i) => ({
        userId: u.id,
        name: u.name,
        avatar: u.avatar,
        color: USER_COLORS[i],
        lastSeen: new Date().toISOString(),
        currentPage: ['Projects', 'AI Tools', 'Analytics', 'Collaboration'][i],
    }));
}

let onlineUsers: OnlineUser[] = makeOnlineUsers();
let comments: Comment[] = [...MOCK_COMMENTS];
let activityFeed: ActivityEvent[] = [...MOCK_ACTIVITY];
let editingIndicators: EditingIndicator[] = [];
let simulationInterval: ReturnType<typeof setInterval> | null = null;

const EDIT_SCENARIOS = [
    { userId: 'u2', userName: 'Sarah Chen', resourceType: 'asset' as const, resourceId: 'a1', resourceName: 'Hero Banner v3.png' },
    { userId: 'u3', userName: 'Marco Silva', resourceType: 'project' as const, resourceId: 'p1', resourceName: 'Nebula Design System' },
    { userId: 'u5', userName: 'Tom Walker', resourceType: 'asset' as const, resourceId: 'a2', resourceName: 'Color Palette Guide' },
];

const COMMENT_TEMPLATES = [
    'This looks amazing! Love the color choice.',
    'Can we try a slightly darker shade here?',
    'The typography is spot on. Let\'s keep it.',
    'I think we should export this at 2x for retina.',
    'Great progress! Ready for client review?',
    'Let\'s align this with the brand guidelines.',
];

export const collaborationService = {
    async getOnlineUsers(): Promise<OnlineUser[]> {
        await sleep(200);
        return [...onlineUsers];
    },

    async getEditingIndicators(): Promise<EditingIndicator[]> {
        await sleep(200);
        return [...editingIndicators];
    },

    async getComments(projectId: string): Promise<Comment[]> {
        await sleep(300);
        return comments.filter((c) => c.projectId === projectId);
    },

    async getActivityFeed(): Promise<ActivityEvent[]> {
        await sleep(200);
        return [...activityFeed];
    },

    async addComment(projectId: string, content: string, authorId: string = 'u1'): Promise<Comment> {
        await sleep(400);
        const author = MOCK_USERS.find((u) => u.id === authorId) ?? MOCK_USERS[0];
        const comment: Comment = {
            id: `c-${generateId()}`,
            projectId,
            authorId,
            authorName: author.name,
            authorAvatar: author.avatar,
            content,
            createdAt: new Date().toISOString(),
            resolved: false,
        };
        comments = [comment, ...comments];
        globalEmitter.emit('comment:added', comment);
        return comment;
    },

    startSimulation(): void {
        if (simulationInterval) return;
        simulationInterval = setInterval(() => {
            const eventType = Math.random();
            if (eventType < 0.3) {
                // Toggle editing indicator
                const scenario = EDIT_SCENARIOS[Math.floor(Math.random() * EDIT_SCENARIOS.length)];
                const existing = editingIndicators.find((e) => e.userId === scenario.userId);
                if (existing) {
                    editingIndicators = editingIndicators.filter((e) => e.userId !== scenario.userId);
                    globalEmitter.emit('editing:stopped', { userId: scenario.userId });
                } else {
                    const indicator: EditingIndicator = { ...scenario, startedAt: new Date().toISOString() };
                    editingIndicators = [indicator, ...editingIndicators.slice(0, 2)];
                    globalEmitter.emit('editing:started', indicator);
                }
            } else if (eventType < 0.55) {
                // Auto-comment
                const user = MOCK_USERS[Math.floor(Math.random() * 3) + 1];
                const comment: Comment = {
                    id: `c-${generateId()}`,
                    projectId: 'p1',
                    authorId: user.id,
                    authorName: user.name,
                    authorAvatar: user.avatar,
                    content: COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)],
                    createdAt: new Date().toISOString(),
                    resolved: false,
                };
                comments = [comment, ...comments.slice(0, 19)];
                globalEmitter.emit('comment:added', comment);
            } else if (eventType < 0.75) {
                // Activity event
                const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
                const actions = [
                    { action: 'uploaded', target: `Design_v${Math.floor(Math.random() * 10)}.png`, targetType: 'asset' as const },
                    { action: 'updated', target: 'Project settings', targetType: 'project' as const },
                    { action: 'ran AI Smart Crop on', target: 'Banner_final.jpg', targetType: 'ai-job' as const },
                ];
                const actionData = actions[Math.floor(Math.random() * actions.length)];
                const event: ActivityEvent = {
                    id: `a-${generateId()}`,
                    userId: user.id,
                    userName: user.name,
                    userAvatar: user.avatar,
                    ...actionData,
                    createdAt: new Date().toISOString(),
                };
                activityFeed = [event, ...activityFeed.slice(0, 29)];
                globalEmitter.emit('activity:new', event);
            } else {
                // User presence update
                onlineUsers = onlineUsers.map((u) => ({
                    ...u,
                    lastSeen: new Date().toISOString(),
                    currentPage: ['Projects', 'AI Tools', 'Analytics', 'Collaboration', 'Settings'][Math.floor(Math.random() * 5)],
                }));
                globalEmitter.emit('presence:updated', onlineUsers);
            }
        }, 4000);
    },

    stopSimulation(): void {
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
        }
    },
};
