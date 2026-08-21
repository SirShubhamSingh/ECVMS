import { api } from "./api";
import type { AuditLog } from "../types";

export const auditService = {
  async list(params: { entity?: string; userId?: string; from?: string; to?: string } = {}): Promise<AuditLog[]> {
    const { data } = await api.get<AuditLog[]>("/audit-logs", { params });
    return data;
  }
};
