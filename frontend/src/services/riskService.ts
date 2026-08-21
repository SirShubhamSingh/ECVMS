import { api } from "./api";
import type { RiskAssessment } from "../types";

export interface CreateRiskPayload {
  issueId: string;
  likelihood: number;
  impact: number;
  mitigation: string;
  comments: string;
}

export const riskService = {
  async list(params: { issueId?: string; riskLevel?: string } = {}): Promise<RiskAssessment[]> {
    const { data } = await api.get<RiskAssessment[]>("/risk-assessments", { params });
    return data;
  },
  async get(id: string): Promise<RiskAssessment> {
    const { data } = await api.get<RiskAssessment>(`/risk-assessments/${id}`);
    return data;
  },
  async create(payload: CreateRiskPayload): Promise<RiskAssessment> {
    const { data } = await api.post<RiskAssessment>("/risk-assessments", payload);
    return data;
  },
  async update(id: string, payload: Omit<CreateRiskPayload, "issueId">): Promise<void> {
    await api.put(`/risk-assessments/${id}`, payload);
  }
};

export function riskLevelFromScore(score: number): string {
  if (score >= 17) return "Critical";
  if (score >= 10) return "High";
  if (score >= 5) return "Medium";
  return "Low";
}

export const LIKELIHOOD_LABELS = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
export const IMPACT_LABELS = ["Insignificant", "Minor", "Moderate", "Major", "Severe"];
