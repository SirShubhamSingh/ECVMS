import { api } from "./api";
import type { AppNotification } from "../types";

export const notificationService = {
  async listMine(): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
    const { data } = await api.get("/notifications/me");
    return data;
  },
  async markRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },
  async markAllRead(): Promise<void> {
    await api.put("/notifications/read-all");
  }
};
