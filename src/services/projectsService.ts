import { sleep, generateId } from "@/lib/utils";
import { MOCK_PROJECTS, generateMockAssets, MOCK_TAGS } from "@/lib/mockData";
import { Project, Asset, Tag } from "@/types";

// In-memory store for mock persistence
let projects = [...MOCK_PROJECTS];
const assetStore: Record<string, Asset[]> = {};

export const projectsService = {
  // ─── Projects ────────────────────────────────────────────────────────────────
  async getProjects(): Promise<Project[]> {
    await sleep(600);
    return [...projects];
  },

  async getProject(id: string): Promise<Project | null> {
    await sleep(300);
    return projects.find((p) => p.id === id) ?? null;
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    await sleep(800);
    const newProject: Project = {
      id: `p-${generateId()}`,
      name: data.name ?? "Untitled Project",
      description: data.description ?? "",
      color: data.color ?? "#6366f1",
      coverUrl:
        data.coverUrl ??
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
      ownerId: "u1",
      members: ["u1"],
      assetCount: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: data.tags ?? [],
    };
    projects = [newProject, ...projects];
    return newProject;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    await sleep(500);
    projects = projects.map((p) =>
      p.id === id
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p,
    );
    return projects.find((p) => p.id === id)!;
  },

  async deleteProject(id: string): Promise<void> {
    await sleep(500);
    projects = projects.filter((p) => p.id !== id);
    delete assetStore[id];
  },

  // ─── Assets ──────────────────────────────────────────────────────────────────
  async getAssets(projectId: string): Promise<Asset[]> {
    await sleep(400);
    if (!assetStore[projectId]) {
      const project = projects.find((p) => p.id === projectId);
      assetStore[projectId] = generateMockAssets(
        projectId,
        project?.assetCount ?? 20,
      );
    }
    return [...assetStore[projectId]];
  },

  async uploadAsset(projectId: string, file: File): Promise<Asset> {
    await sleep(1500);
    // Create a local URL for visual preview (mocking the upload result)
    const previewUrl = URL.createObjectURL(file);
    const newAsset: Asset = {
      id: `asset-${generateId()}`,
      projectId,
      name: file.name,
      type: "image",
      category: "other",
      url: previewUrl,
      thumbnailUrl: previewUrl,
      size: file.size,
      tags: [],
      uploadedBy: "u1",
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: assetStore[projectId]?.length ?? 0,
      aiProcessed: false,
    };
    if (!assetStore[projectId]) assetStore[projectId] = [];
    assetStore[projectId] = [newAsset, ...assetStore[projectId]];
    // Update project asset count
    projects = projects.map((p) =>
      p.id === projectId ? { ...p, assetCount: p.assetCount + 1 } : p,
    );
    return newAsset;
  },

  async updateAsset(
    projectId: string,
    assetId: string,
    updates: Partial<Asset>,
  ): Promise<Asset> {
    await sleep(400);
    if (!assetStore[projectId])
      assetStore[projectId] = generateMockAssets(projectId, 20);
    assetStore[projectId] = assetStore[projectId].map((a) =>
      a.id === assetId
        ? { ...a, ...updates, updatedAt: new Date().toISOString() }
        : a,
    );
    return assetStore[projectId].find((a) => a.id === assetId)!;
  },

  async deleteAsset(projectId: string, assetId: string): Promise<void> {
    await sleep(400);
    if (assetStore[projectId]) {
      assetStore[projectId] = assetStore[projectId].filter(
        (a) => a.id !== assetId,
      );
    }
    projects = projects.map((p) =>
      p.id === projectId
        ? { ...p, assetCount: Math.max(0, p.assetCount - 1) }
        : p,
    );
  },

  async reorderAssets(projectId: string, orderedIds: string[]): Promise<void> {
    await sleep(300);
    if (!assetStore[projectId]) return;
    const assetMap = new Map(assetStore[projectId].map((a) => [a.id, a]));
    assetStore[projectId] = orderedIds.map((id, index) => ({
      ...assetMap.get(id)!,
      order: index,
    }));
  },

  async addTagToAsset(
    projectId: string,
    assetId: string,
    tag: Tag,
  ): Promise<Asset> {
    await sleep(300);
    if (!assetStore[projectId])
      assetStore[projectId] = generateMockAssets(projectId, 20);
    assetStore[projectId] = assetStore[projectId].map((a) =>
      a.id === assetId && !a.tags.find((t) => t.id === tag.id)
        ? { ...a, tags: [...a.tags, tag] }
        : a,
    );
    return assetStore[projectId].find((a) => a.id === assetId)!;
  },

  getTags(): Tag[] {
    return MOCK_TAGS;
  },
};
