import { api } from "./api";
import type { VendorIssue } from "../types";

export interface IssueFilters {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  officerId?: string;
  from?: string;
  to?: string;
}

export interface CreateIssuePayload {
  title: string;
  vendor: string;
  category: string;
  priority: string;
  description: string;
  assignedOfficerId?: string;
  dueDate?: string;
}

export const issueService = {
  async list(filters: IssueFilters = {}): Promise<VendorIssue[]> {
    const { data } = await api.get<VendorIssue[]>("/vendor-issues", { params: filters });
    return data;
  },
  async get(id: string): Promise<VendorIssue> {
    const { data } = await api.get<VendorIssue>(`/vendor-issues/${id}`);
    return data;
  },
  async create(payload: CreateIssuePayload): Promise<VendorIssue> {
    const { data } = await api.post<VendorIssue>("/vendor-issues", payload);
    return data;
  },
  async update(id: string, payload: Omit<CreateIssuePayload, "assignedOfficerId">): Promise<void> {
    await api.put(`/vendor-issues/${id}`, payload);
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/vendor-issues/${id}`);
  },
  async assignOfficer(id: string, officerId: string): Promise<void> {
    await api.put(`/vendor-issues/${id}/assign`, { officerId });
  },
  async changeStatus(id: string, status: string): Promise<void> {
    await api.put(`/vendor-issues/${id}/status`, { status });
  },
  async addComment(id: string, text: string): Promise<void> {
    await api.post(`/vendor-issues/${id}/comments`, { text });
  }
};

export const ISSUE_CATEGORIES = [
  "Service", "Billing", "Compliance", "Quality", "Security",
  "Documentation", "Performance", "SLA", "Data Privacy", "Other"
];

export const ISSUE_PRIORITIES = ["Low", "Medium", "High", "Critical"];

export const ISSUE_STATUSES = [
  "Open", "Pending Assignment", "Investigation", "Risk Assessment", "Resolution", "Resolved", "Closed"
];
