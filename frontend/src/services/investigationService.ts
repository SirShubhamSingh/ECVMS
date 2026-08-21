import { api } from "./api";
import type { Investigation } from "../types";

export interface CreateInvestigationPayload {
  issueId: string;
  officerId: string;
  targetCompletionDate?: string;
}

export interface UpdateInvestigationPayload {
  status: string;
  findings: string;
  rootCause: string;
  evidence?: string[];
  investigationNotes: string;
  targetCompletionDate?: string;
}

export const investigationService = {
  async list(params: { search?: string; status?: string; officerId?: string } = {}): Promise<Investigation[]> {
    const { data } = await api.get<Investigation[]>("/investigations", { params });
    return data;
  },
  async get(id: string): Promise<Investigation> {
    const { data } = await api.get<Investigation>(`/investigations/${id}`);
    return data;
  },
  async create(payload: CreateInvestigationPayload): Promise<Investigation> {
    const { data } = await api.post<Investigation>("/investigations", payload);
    return data;
  },
  async update(id: string, payload: UpdateInvestigationPayload): Promise<void> {
    await api.put(`/investigations/${id}`, payload);
  }
};

export const INVESTIGATION_STATUSES = ["Not Started", "In Progress", "Completed", "Reopened"];
