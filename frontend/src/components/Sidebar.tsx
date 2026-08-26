import { NavLink } from "react-router-dom";
import type { Role } from "../types";

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[]; // undefined = visible to all authenticated roles
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/", icon: "📊" },
  { label: "Compliance Hub", path: "/compliance", icon: "◈", roles: ["Super Administrator", "Compliance Officer", "Employee"] },
  { label: "Vendor Issues", path: "/vendor-issues", icon: "🗂️" },
  {
    label: "Investigations",
    path: "/investigations",
    icon: "🔎",
    roles: ["Super Administrator", "Compliance Officer"]
  },
  {
    label: "Risk Assessment",
    path: "/risk-assessment",
    icon: "⚠️",
    roles: ["Super Administrator", "Compliance Officer", "Vendor Manager"]
  },
  {
    label: "Resolution",
    path: "/resolutions",
    icon: "✅",
    roles: ["Super Administrator", "Compliance Officer", "Approver"]
  },
  { label: "Notifications", path: "/notifications", icon: "🔔" },
  { label: "Reports", path: "/reports", icon: "📈", roles: ["Super Administrator", "Compliance Officer"] },
  { label: "Users", path: "/users", icon: "👤", roles: ["Super Administrator"] },
  { label: "Audit Log", path: "/audit-log", icon: "🧾", roles: ["Super Administrator"] },
  { label: "Settings", path: "/settings", icon: "⚙️" }
];

export default function Sidebar({
  role,
  isOpen,
  onNavigate
}: {
  role: Role;
  isOpen: boolean;
  onNavigate: () => void;
}) {
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <img src="/assets/logo.jpeg" alt="ECMVS" />
        <div>
          <div className="brand-title">ECMVS</div>
          <div className="brand-subtitle">Compliance &amp; Vendor Mgmt</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
            onClick={onNavigate}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
