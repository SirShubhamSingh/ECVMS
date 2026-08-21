import { api } from "./api";
import type { Resolution } from "../types";

export interface CreateResolutionPayload {
  issueId: string;
  investigationId: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  resolutionDescription: string;
  comments: string;
  requiresApproval: boolean;
}

export interface UpdateResolutionPayload {
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  resolutionDescription: string;
  comments: string;
}

export const resolutionService = {
  async list(params: { issueId?: string; status?: string } = {}): Promise<Resolution[]> {
    const { data } = await api.get<Resolution[]>("/resolutions", { params });
    return data;
  },
  async get(id: string): Promise<Resolution> {
    const { data } = await api.get<Resolution>(`/resolutions/${id}`);
    return data;
  },
  async create(payload: CreateResolutionPayload): Promise<Resolution> {
    const { data } = await api.post<Resolution>("/resolutions", payload);
    return data;
  },
  async update(id: string, payload: UpdateResolutionPayload): Promise<void> {
    await api.put(`/resolutions/${id}`, payload);
  },
  async submit(id: string): Promise<void> {
    await api.put(`/resolutions/${id}/submit`, {});
  },
  async decide(id: string, decision: "Approved" | "Rejected", reason: string): Promise<void> {
    await api.put(`/resolutions/${id}/decide`, { decision, reason });
  }
};
