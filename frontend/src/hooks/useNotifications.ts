import { useCallback, useEffect, useState } from "react";
import { notificationService } from "../services/notificationService";
import type { AppNotification } from "../types";
import { useAuth } from "./useAuth";

export function useNotifications(pollMs = 30000) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!currentUser) return;
    try {
      const { notifications, unreadCount } = await notificationService.listMine();
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    } catch {
      // Non-fatal: notification polling failures shouldn't disrupt the UI.
    }
  }, [currentUser]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, pollMs);
    return () => clearInterval(interval);
  }, [refresh, pollMs]);

  async function markRead(id: string) {
    await notificationService.markRead(id);
    await refresh();
  }

  async function markAllRead() {
    await notificationService.markAllRead();
    await refresh();
  }

  return { notifications, unreadCount, refresh, markRead, markAllRead };
}
