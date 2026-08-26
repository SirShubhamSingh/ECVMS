import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationDropdown() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="notif-dropdown" ref={ref}>
      <button className="icon-button" onClick={() => setOpen((v) => !v)} aria-label="Notifications">
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button className="link-button" onClick={() => markAllRead()}>
                Mark all as read
              </button>
            )}
          </div>
          <div className="notif-list">
            {notifications.length === 0 && <div className="notif-empty">You're all caught up.</div>}
            {notifications.slice(0, 8).map((n) => (
              <div
                key={n.id}
                className={`notif-item ${n.read ? "" : "notif-item-unread"}`}
                onClick={() => {
                  if (!n.read) markRead(n.id);
                  setOpen(false);
                  navigate(n.relatedEntity === "Resolution"
                    ? `/resolutions?resolutionId=${n.relatedEntityId}`
                    : "/notifications");
                }}
              >
                <div className="notif-item-title">{n.title}</div>
                <div className="notif-item-message">{n.message}</div>
                <div className="notif-item-time">{timeAgo(n.createdDate)}</div>
              </div>
            ))}
          </div>
          <button className="notif-view-all" onClick={() => { setOpen(false); navigate("/notifications"); }}>
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
