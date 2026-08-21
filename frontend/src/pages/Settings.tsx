import { useAuth } from "../hooks/useAuth";

export default function Settings() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-subtitle">Your account details for this ECMVS session.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <h3>Account</h3>
        <dl className="detail-list">
          <div><dt>Name</dt><dd>{currentUser.name}</dd></div>
          <div><dt>Email</dt><dd>{currentUser.email}</dd></div>
          <div><dt>Role</dt><dd>{currentUser.role}</dd></div>
          <div><dt>Department</dt><dd>{currentUser.department}</dd></div>
          <div><dt>Status</dt><dd>{currentUser.active ? "Active" : "Inactive"}</dd></div>
        </dl>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <h3>About ECMVS</h3>
        <p className="muted">
          Enterprise Compliance &amp; Vendor Management System — v1.0.0.
          Vendor issue tracking, investigation, risk assessment, resolution, notifications, audit, and reporting.
        </p>
      </div>
    </div>
  );
}
