import { useNotifications } from "../hooks/useNotifications";
import { LoadingSpinner, EmptyState } from "../components/StatePanels";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(15000);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="page-subtitle">
            Only notifications addressed to you are shown here — {unreadCount} unread.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await markAllRead();
              setBusy(false);
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="You're all caught up" message="New notifications will appear here as they arrive." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-page-item ${n.read ? "" : "unread"}`}
              onClick={() => {
                if (!n.read) markRead(n.id);
                if (n.relatedEntity === "Resolution") navigate(`/resolutions?resolutionId=${n.relatedEntityId}`);
              }}
              style={{ cursor: n.read ? "default" : "pointer" }}
            >
              <div>
                <strong>{n.title}</strong>
                <p className="muted" style={{ margin: "4px 0 0" }}>{n.message}</p>
              </div>
              <span className="activity-time" style={{ whiteSpace: "nowrap" }}>
                {new Date(n.createdDate).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
