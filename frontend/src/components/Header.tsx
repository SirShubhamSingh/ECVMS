import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NotificationDropdown from "./NotificationDropdown";

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initials = currentUser?.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="app-header">
      <button className="mobile-menu-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
        ☰
      </button>
      <div className="header-spacer" />
      <div className="header-actions">
        <NotificationDropdown />
        <div className="user-menu">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{currentUser?.name}</div>
            <div className="user-role">{currentUser?.role}</div>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
