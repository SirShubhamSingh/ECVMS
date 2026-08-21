import { useEffect, useState } from "react";
import { userService, ROLES } from "../services/userService";
import type { AppUser, Role } from "../types";
import DataTable, { type Column } from "../components/DataTable";
import { SearchBar, FilterSelect } from "../components/Filters";
import { LoadingSpinner, ErrorState, EmptyState } from "../components/StatePanels";
import { Modal } from "../components/Modal";
import { useToast } from "../components/Toast";
import { extractErrorMessage } from "../services/api";

export default function Users() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.list({ search, role });
      setUsers(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Could not load users."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role]);

  async function toggleActive(user: AppUser) {
    try {
      await userService.setActive(user.id, !user.active);
      showToast(`${user.name} ${user.active ? "deactivated" : "activated"}.`, "success");
      load();
    } catch (err) {
      showToast(extractErrorMessage(err, "Failed to update user status."), "error");
    }
  }

  const columns: Column<AppUser>[] = [
    { header: "Name", render: (u) => <strong>{u.name}</strong> },
    { header: "Email", render: (u) => u.email },
    { header: "Role", render: (u) => u.role },
    { header: "Department", render: (u) => u.department },
    { header: "Status", render: (u) => <span className={`badge ${u.active ? "badge-green" : "badge-gray"}`}>{u.active ? "Active" : "Inactive"}</span> },
    {
      header: "Actions",
      render: (u) => (
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setEditing(u); }}>Edit</button>
          <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); toggleActive(u); }}>
            {u.active ? "Deactivate" : "Activate"}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="page-subtitle">Manage accounts, roles, and departments. Admin only.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add User</button>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." />
        <FilterSelect label="Role" value={role} options={ROLES} onChange={setRole} />
      </div>

      {loading && <LoadingSpinner label="Loading users..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && users.length === 0 && <EmptyState title="No users found" />}
      {!loading && !error && users.length > 0 && (
        <div className="card">
          <DataTable columns={columns} rows={users} keyField={(u) => u.id} />
        </div>
      )}

      {showCreate && (
        <UserFormModal
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); showToast("User created.", "success"); load(); }}
        />
      )}
      {editing && (
        <UserFormModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); showToast("User updated.", "success"); load(); }}
        />
      )}
    </div>
  );
}

function UserFormModal({ user, onClose, onSaved }: { user?: AppUser; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(user?.role ?? "Employee");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [active, setActive] = useState(user?.active ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name || !department || (!user && (!email || !password))) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (user) {
        await userService.update(user.id, { name, role, department, active, password: password || undefined });
      } else {
        await userService.create({ name, email, password, role, department });
      }
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err, "Could not save user."));
      showToast("Failed to save user.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={user ? "Edit User" : "Add User"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <label className="span-2">
          Full Name *
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="span-2">
          Email {user ? "" : "*"}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!user} />
        </label>
        <label>
          Role *
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label>
          Department *
          <input value={department} onChange={(e) => setDepartment(e.target.value)} />
        </label>
        <label className="span-2">
          {user ? "New Password (leave blank to keep unchanged)" : "Password *"}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {user && (
          <label className="checkbox-label span-2">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Account active
          </label>
        )}
      </div>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}
