/**
 * AI Service — Abstracted layer for all AI-powered transformations.
 * All methods simulate async AI processing with realistic delays.
 * Replace implementations here to connect real AI APIs (e.g., Replicate, OpenAI, etc.)
 */

import { sleep, generateId, randomBetween } from '@/lib/utils';
import { AIJob, AIToolType, AIJobResult } from '@/types';

// ─── Result Generators ────────────────────────────────────────────────────────
function generateBackgroundRemovalResult(): AIJobResult {
    return {
        type: 'background-removal',
        data: { processedUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80&sat=-100', format: 'PNG', transparencySupported: true },
    };
}

function generateColorPaletteResult(): AIJobResult {
    const palettes = [
        ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
        ['#2d1b69', '#11998e', '#38ef7d', '#f7971e'],
        ['#fc466b', '#3f5efb', '#11998e', '#38ef7d'],
        ['#667eea', '#764ba2', '#f093fb', '#c471ed'],
        ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
    ];
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    return {
        type: 'color-palette',
        data: { colors: palette, dominant: palette[0], accent: palette[1], complement: palette[2] },
    };
}

function generateStyleTransferResult(style: string): AIJobResult {
    return {
        type: 'style-transfer',
        data: {
            style,
            processedUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80',
            confidence: (Math.random() * 0.2 + 0.8).toFixed(2),
        },
    };
}

function generateAutoLayoutResult(): AIJobResult {
    return {
        type: 'auto-layout',
        data: {
            suggestions: [
                { name: 'Hero + 3-col grid', confidence: 0.94, description: 'Large hero image followed by three equal-width columns' },
                { name: 'Masonry flow', confidence: 0.87, description: 'Pinterest-style masonry layout optimized for image ratios' },
                { name: 'Full-bleed editorial', confidence: 0.72, description: 'Magazine-style full-width layout with pull quotes' },
            ],
            recommendedGrid: { columns: 3, gap: 24, padding: 32 },
        },
    };
}

function generateSmartCropResult(ratio: string): AIJobResult {
    return {
        type: 'smart-crop',
        data: {
            ratio,
            cropBox: { x: 120, y: 80, width: 640, height: 480 },
            focusPoints: [{ x: 320, y: 240, weight: 0.92 }],
            processedUrl: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=400&q=80',
        },
    };
}

// ─── Progress Simulator ───────────────────────────────────────────────────────
async function simulateProgress(
    onProgress: (progress: number) => void,
    durationMs: number
): Promise<void> {
    const steps = 10;
    const stepMs = durationMs / steps;
    for (let i = 1; i <= steps; i++) {
        await sleep(stepMs);
        onProgress(i * 10);
    }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const aiService = {
    async removeBackground(assetId: string, onProgress?: (p: number) => void): Promise<AIJob> {
        const job: AIJob = {
            id: `job-${generateId()}`,
            toolType: 'background-removal',
            assetId,
            assetName: `Asset ${assetId.slice(-4)}`,
            status: 'processing',
            progress: 0,
            result: null,
            createdAt: new Date().toISOString(),
            completedAt: null,
        };
        const duration = randomBetween(2000, 3500);
        await simulateProgress((p) => { job.progress = p; onProgress?.(p); }, duration);
        job.status = 'completed';
        job.progress = 100;
        job.result = generateBackgroundRemovalResult();
        job.completedAt = new Date().toISOString();
        return job;
    },

    async extractPalette(assetId: string, onProgress?: (p: number) => void): Promise<AIJob> {
        const job: AIJob = {
            id: `job-${generateId()}`,
            toolType: 'color-palette',
            assetId,
            assetName: `Asset ${assetId.slice(-4)}`,
            status: 'processing',
            progress: 0,
            result: null,
            createdAt: new Date().toISOString(),
            completedAt: null,
        };
        const duration = randomBetween(1500, 2500);
        await simulateProgress((p) => { job.progress = p; onProgress?.(p); }, duration);
        job.status = 'completed';
        job.progress = 100;
        job.result = generateColorPaletteResult();
        job.completedAt = new Date().toISOString();
        return job;
    },

    async styleTransfer(assetId: string, style: string, onProgress?: (p: number) => void): Promise<AIJob> {
        const job: AIJob = {
            id: `job-${generateId()}`,
            toolType: 'style-transfer',
            assetId,
            assetName: `Asset ${assetId.slice(-4)}`,
            status: 'processing',
            progress: 0,
            result: null,
            createdAt: new Date().toISOString(),
            completedAt: null,
        };
        const duration = randomBetween(3000, 5000);
        await simulateProgress((p) => { job.progress = p; onProgress?.(p); }, duration);
        job.status = 'completed';
        job.progress = 100;
        job.result = generateStyleTransferResult(style);
        job.completedAt = new Date().toISOString();
        return job;
    },

    async autoLayout(projectId: string, onProgress?: (p: number) => void): Promise<AIJob> {
        const job: AIJob = {
            id: `job-${generateId()}`,
            toolType: 'auto-layout',
            assetId: projectId,
            assetName: `Project ${projectId.slice(-4)}`,
            status: 'processing',
            progress: 0,
            result: null,
            createdAt: new Date().toISOString(),
            completedAt: null,
        };
        const duration = randomBetween(2000, 3000);
        await simulateProgress((p) => { job.progress = p; onProgress?.(p); }, duration);
        job.status = 'completed';
        job.progress = 100;
        job.result = generateAutoLayoutResult();
        job.completedAt = new Date().toISOString();
        return job;
    },

    async smartCrop(assetId: string, ratio: string, onProgress?: (p: number) => void): Promise<AIJob> {
        const job: AIJob = {
            id: `job-${generateId()}`,
            toolType: 'smart-crop',
            assetId,
            assetName: `Asset ${assetId.slice(-4)}`,
            status: 'processing',
            progress: 0,
            result: null,
            createdAt: new Date().toISOString(),
            completedAt: null,
        };
        const duration = randomBetween(1500, 2500);
        await simulateProgress((p) => { job.progress = p; onProgress?.(p); }, duration);
        job.status = 'completed';
        job.progress = 100;
        job.result = generateSmartCropResult(ratio);
        job.completedAt = new Date().toISOString();
        return job;
    },

    getAvailableTools(): { id: AIToolType; name: string; description: string; icon: string }[] {
        return [
            { id: 'background-removal', name: 'Background Removal', description: 'Intelligently remove image backgrounds with edge-aware masking', icon: 'Scissors' },
            { id: 'color-palette', name: 'Color Palette Extraction', description: 'Extract dominant colors, accents, and complementary tones', icon: 'Palette' },
            { id: 'style-transfer', name: 'Style Transfer', description: 'Apply artistic styles: Minimalist, Bauhaus, Neon, Organic', icon: 'Wand2' },
            { id: 'auto-layout', name: 'Auto-Layout Suggestions', description: 'AI analyzes your assets and suggests optimal grid layouts', icon: 'LayoutGrid' },
            { id: 'smart-crop', name: 'Smart Crop', description: 'Focus-aware cropping preserving the most important subject areas', icon: 'Crop' },
        ];
    },
};
