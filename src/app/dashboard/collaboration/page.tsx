'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    Users2, MessageSquare, Activity, Edit3,
    Send, Circle, Wifi, AlertTriangle,
} from 'lucide-react';
import { collaborationService } from '@/services/collaborationService';
import { globalEmitter } from '@/lib/eventEmitter';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
    setOnlineUsers, addComment, addActivityEvent,
    addEditingIndicator, removeEditingIndicator, setComments, setActivityFeed,
} from '@/store/collaborationSlice';
import { Comment, ActivityEvent, EditingIndicator, OnlineUser } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

function PresenceAvatar({ user }: { user: OnlineUser }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-white/15 transition-all" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderLeft: `3px solid ${user.color}` }}>
            <div className="relative">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" style={{ border: `2px solid ${user.color}55` }} />
                <div className="presence-dot absolute -bottom-0.5 -right-0.5" style={{ background: user.color, boxShadow: `0 0 6px ${user.color}` }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{user.name}</div>
                <div className="text-xs truncate flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <span>On {user.currentPage}</span>
                </div>
            </div>
            <div className="w-2 h-2 rounded-full animate-pulse-slow" style={{ background: user.color }} />
        </div>
    );
}

function EditingBanner({ indicator }: { indicator: EditingIndicator }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg animate-fade-in border" style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: '#f59e0b' }} />
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${indicator.userName}`} alt="" className="w-7 h-7 rounded-full" />
            <div className="flex-1 text-sm">
                <span className="font-semibold">{indicator.userName}</span>
                <span style={{ color: 'var(--color-text-muted)' }}> is editing </span>
                <span className="font-semibold" style={{ color: '#fbbf24' }}>{indicator.resourceName}</span>
            </div>
            <Edit3 className="w-3.5 h-3.5 animate-bounce-sm" style={{ color: '#f59e0b' }} />
        </div>
    );
}

function CommentItem({ comment }: { comment: Comment }) {
    return (
        <div className="flex gap-3 animate-fade-in">
            <img src={comment.authorAvatar} alt={comment.authorName} className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{comment.authorName}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <div className="text-sm p-3 rounded-lg" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)', color: 'var(--color-text-muted)', borderTopLeftRadius: '2px' }}>
                    {comment.content}
                </div>
            </div>
        </div>
    );
}

function ActivityItem({ event }: { event: ActivityEvent }) {
    return (
        <div className="flex items-start gap-3 py-3 animate-slide-in border-b border-white/5 last:border-none">
            <div className="relative flex-col items-center flex-shrink-0" style={{ width: '32px' }}>
                <img src={event.userAvatar} alt={event.userName} className="w-8 h-8 rounded-full" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-px bg-white/10" style={{ height: '12px' }} />
            </div>
            <div className="flex-1 min-w-0 text-sm pt-0.5">
                <span className="font-semibold">{event.userName}</span>
                <span style={{ color: 'var(--color-text-muted)' }}> {event.action} </span>
                <span className="font-medium" style={{ color: 'var(--color-accent)' }}>{event.target}</span>
            </div>
            <span className="text-xs flex-shrink-0 pt-0.5" style={{ color: 'var(--color-text-dim)' }}>{formatRelativeTime(event.createdAt)}</span>
        </div>
    );
}

export default function CollaborationPage() {
    const dispatch = useAppDispatch();
    const { onlineUsers, editingIndicators, comments, activityFeed } = useAppSelector((s) => s.collaboration);
    const { user } = useAppSelector((s) => s.auth);
    const [newComment, setNewComment] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');

    // Load initial data
    const { data: initialUsers, isLoading: usersLoading } = useQuery({ queryKey: ['online-users'], queryFn: collaborationService.getOnlineUsers });
    const { data: initialComments, isLoading: commentsLoading } = useQuery({ queryKey: ['comments', 'p1'], queryFn: () => collaborationService.getComments('p1') });
    const { data: initialActivity } = useQuery({ queryKey: ['activity'], queryFn: collaborationService.getActivityFeed });

    useEffect(() => {
        if (initialUsers) dispatch(setOnlineUsers(initialUsers));
    }, [initialUsers, dispatch]);

    useEffect(() => {
        if (initialComments) dispatch(setComments(initialComments));
    }, [initialComments, dispatch]);

    useEffect(() => {
        if (initialActivity) dispatch(setActivityFeed(initialActivity));
    }, [initialActivity, dispatch]);

    // Subscribe to simulation events
    useEffect(() => {
        collaborationService.startSimulation();

        const unsubComment = globalEmitter.on('comment:added', (c) => dispatch(addComment(c as Comment)));
        const unsubActivity = globalEmitter.on('activity:new', (e) => dispatch(addActivityEvent(e as ActivityEvent)));
        const unsubPresence = globalEmitter.on('presence:updated', (u) => dispatch(setOnlineUsers(u as OnlineUser[])));
        const unsubEditStart = globalEmitter.on('editing:started', (e) => dispatch(addEditingIndicator(e as EditingIndicator)));
        const unsubEditStop = globalEmitter.on('editing:stopped', (e) => dispatch(removeEditingIndicator((e as { userId: string }).userId)));

        return () => {
            collaborationService.stopSimulation();
            unsubComment();
            unsubActivity();
            unsubPresence();
            unsubEditStart();
            unsubEditStop();
        };
    }, [dispatch]);

    const sendComment = async () => {
        if (!newComment.trim() || isSending) return;
        setIsSending(true);
        try {
            const comment = await collaborationService.addComment('p1', newComment.trim(), user?.id ?? 'u1');
            dispatch(addComment(comment));
            setNewComment('');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#14b8a6,#3b82f6)' }}>
                    <Users2 className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Collaboration</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Live presence simulation — updates every 4 seconds</p>
                </div>
                <div className="ml-auto relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <span className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(34,197,94,0.12)', animationDuration: '2.5s' }} />
                    <Wifi className="w-3 h-3" /> LIVE
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Online', value: onlineUsers.length, color: '#22c55e', icon: Circle },
                    { label: 'Editing', value: editingIndicators.length, color: '#f59e0b', icon: Edit3 },
                    { label: 'Messages', value: comments.length, color: '#6366f1', icon: MessageSquare },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="card p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                            <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <div>
                            <div className="text-xl font-bold">{value}</div>
                            <div className="section-title">{label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Presence + Editing */}
                <div className="space-y-5">
                    {/* Online users */}
                    <div className="card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Circle className="w-3 h-3 text-green-400 fill-green-400 animate-pulse-slow" />
                            <h2 className="font-bold text-sm">Online Now</h2>
                            <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>{onlineUsers.length} members</span>
                        </div>
                        <div className="space-y-2">
                            {usersLoading
                                ? Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                        <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 skeleton w-3/4" />
                                            <div className="h-2.5 skeleton w-1/2" />
                                        </div>
                                    </div>
                                ))
                                : onlineUsers.map((u) => <PresenceAvatar key={u.userId} user={u} />)
                            }
                        </div>
                    </div>

                    {/* Editing indicators */}
                    <div className="card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Edit3 className="w-4 h-4" style={{ color: '#f59e0b' }} />
                            <h2 className="font-bold text-sm">Currently Editing</h2>
                        </div>
                        {usersLoading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
                                        <div className="w-2 h-2 rounded-full skeleton flex-shrink-0" />
                                        <div className="w-7 h-7 rounded-full skeleton flex-shrink-0" />
                                        <div className="flex-1 h-3 skeleton" />
                                    </div>
                                ))}
                            </div>
                        ) : editingIndicators.length === 0 ? (
                            <div className="text-center py-6 text-sm" style={{ color: 'var(--color-text-dim)' }}>
                                <AlertTriangle className="w-6 h-6 mx-auto mb-2 opacity-30" />
                                No active editors right now
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {editingIndicators.map((e) => <EditingBanner key={e.userId} indicator={e} />)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Comments + Activity */}
                <div className="lg:col-span-2 card flex flex-col" style={{ minHeight: '500px' }}>
                    {/* Tabs */}
                    <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="tab-list">
                            <button className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab('comments')}>
                                <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                                Comments ({comments.length})
                            </button>
                            <button className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
                                <Activity className="w-3.5 h-3.5 inline mr-1" />
                                Activity ({activityFeed.length})
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {activeTab === 'comments' ? (
                            commentsLoading ? (
                                <div className="space-y-5">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full skeleton flex-shrink-0 mt-1" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 skeleton w-1/4" />
                                                <div className="h-12 skeleton rounded-lg" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {comments.slice(0, 20).map((c) => <CommentItem key={c.id} comment={c} />)}
                                </div>
                            )
                        ) : (
                            <div>
                                {activityFeed.slice(0, 30).map((e) => <ActivityItem key={e.id} event={e} />)}
                            </div>
                        )}
                    </div>

                    {/* Comment input */}
                    {activeTab === 'comments' && (
                        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="flex gap-3 items-end">
                                {user && <img src={user.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />}
                                <div className="flex-1 relative">
                                    <textarea
                                        rows={2}
                                        placeholder="Add a comment…"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); } }}
                                        className="form-input resize-none pr-12"
                                    />
                                    <button
                                        onClick={sendComment}
                                        disabled={isSending || !newComment.trim()}
                                        className="absolute right-3 bottom-3 btn btn-primary btn-icon"
                                        style={{ padding: '6px' }}
                                    >
                                        {isSending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs mt-2" style={{ color: 'var(--color-text-dim)' }}>Press Enter to send, Shift+Enter for new line</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
