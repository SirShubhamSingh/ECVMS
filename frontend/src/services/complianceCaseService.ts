import { api } from "./api";

export const CASE_TYPES = ["Grievance", "Fraud", "Health & Safety", "Conflict of Interest", "Vendor Risk", "Employee"] as const;
export const CASE_STATUSES = ["New", "Under Review", "Investigation", "Action Required", "Closed"] as const;
export const CASE_SEVERITIES = ["Low", "Medium", "High", "Critical"] as const;

export type CaseType = typeof CASE_TYPES[number];
export type CaseStatus = typeof CASE_STATUSES[number];
export type CaseSeverity = typeof CASE_SEVERITIES[number];

export interface ComplianceCase {
  id: string;
  caseNumber: string;
  caseType: CaseType;
  title: string;
  description: string;
  status: CaseStatus;
  severity: CaseSeverity;
  confidentiality: string;
  subject?: string;
  location?: string;
  anonymousReporter: boolean;
  assignedToId?: string;
  assignedToName?: string;
  createdByName: string;
  createdDate: string;
  dueDate?: string;
  closedDate?: string;
  tags: string[];
}

export interface CreateComplianceCasePayload {
  caseType: CaseType;
  title: string;
  description: string;
  severity: CaseSeverity;
  confidentiality: string;
  subject?: string;
  location?: string;
  anonymousReporter: boolean;
  dueDate?: string;
  tags?: string[];
}

export const complianceCaseService = {
  async list(params: { type?: string; status?: string; search?: string } = {}) {
    const { data } = await api.get<ComplianceCase[]>("/compliance-cases", { params });
    return data;
  },
  async create(payload: CreateComplianceCasePayload) {
    const { data } = await api.post<ComplianceCase>("/compliance-cases", payload);
    return data;
  },
  async assign(id: string, officerId: string) {
    await api.put(`/compliance-cases/${id}/assign`, { officerId });
  }
};
