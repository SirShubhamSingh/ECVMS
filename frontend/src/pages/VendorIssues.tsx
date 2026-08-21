import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { issueService, ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from "../services/issueService";
import { userService } from "../services/userService";
import type { VendorIssue, AppUser } from "../types";
import DataTable, { type Column } from "../components/DataTable";
import { SearchBar, FilterSelect } from "../components/Filters";
import { LoadingSpinner, ErrorState, EmptyState } from "../components/StatePanels";
import StatusBadge from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { Modal } from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/Toast";
import { extractErrorMessage } from "../services/api";

export default function VendorIssues() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [issues, setIssues] = useState<VendorIssue[]>([]);
  const [officers, setOfficers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const canCreate = currentUser && ["Super Administrator", "Vendor Manager", "Employee", "Compliance Officer"].includes(currentUser.role);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [issueData, officerData] = await Promise.all([
        issueService.list({ search, status, priority, category }),
        userService.officers()
      ]);
      setIssues(issueData);
      setOfficers(officerData);
    } catch (err) {
      setError(extractErrorMessage(err, "Could not load vendor issues."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, priority, category]);

  const columns: Column<VendorIssue>[] = [
    { header: "Issue #", render: (r) => <strong>{r.issueNumber}</strong>, width: "120px" },
    { header: "Title", render: (r) => r.title },
    { header: "Vendor", render: (r) => r.vendor },
    { header: "Category", render: (r) => r.category },
    { header: "Priority", render: (r) => <PriorityBadge priority={r.priority} /> },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { header: "Officer", render: (r) => r.assignedOfficerName ?? <span className="muted">Unassigned</span> },
    { header: "Created", render: (r) => new Date(r.createdDate).toLocaleDateString() }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Vendor Issues</h1>
          <p className="page-subtitle">Register, assign, and track vendor-related compliance issues.</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Create Issue
          </button>
        )}
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by issue #, title, vendor..." />
        <FilterSelect label="Status" value={status} options={ISSUE_STATUSES} onChange={setStatus} />
        <FilterSelect label="Priority" value={priority} options={ISSUE_PRIORITIES} onChange={setPriority} />
        <FilterSelect label="Category" value={category} options={ISSUE_CATEGORIES} onChange={setCategory} />
      </div>

      {loading && <LoadingSpinner label="Loading issues..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && issues.length === 0 && (
        <EmptyState title="No vendor issues found" message="Try adjusting your filters, or create a new issue." />
      )}
      {!loading && !error && issues.length > 0 && (
        <div className="card">
          <DataTable
            columns={columns}
            rows={issues}
            keyField={(r) => r.id}
            onRowClick={(r) => navigate(`/vendor-issues/${r.id}`)}
          />
        </div>
      )}

      {showCreate && (
        <CreateIssueModal
          officers={officers}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            showToast("Vendor issue created.", "success");
            load();
          }}
        />
      )}
    </div>
  );
}

function CreateIssueModal({
  officers,
  onClose,
  onCreated
}: {
  officers: AppUser[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState(ISSUE_CATEGORIES[0]);
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [assignedOfficerId, setAssignedOfficerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title || !vendor || !category || !priority || !description) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await issueService.create({
        title,
        vendor,
        category,
        priority,
        description,
        assignedOfficerId: assignedOfficerId || undefined,
        dueDate: dueDate || undefined
      });
      onCreated();
    } catch (err) {
      setFormError(extractErrorMessage(err, "Could not create the issue."));
      showToast("Failed to create issue.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Create Vendor Issue"
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : "Create Issue"}
          </button>
        </>
      }
    >
      <div className="form-grid">
        <label className="span-2">
          Issue Title *
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary of the issue" />
        </label>
        <label>
          Vendor *
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendor name" />
        </label>
        <label>
          Category *
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {ISSUE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          Priority *
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            {ISSUE_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label>
          Assigned Officer
          <select value={assignedOfficerId} onChange={(e) => setAssignedOfficerId(e.target.value)}>
            <option value="">Unassigned</option>
            {officers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </label>
        <label>
          Due Date
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <label className="span-2">
          Description *
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue in detail" />
        </label>
      </div>
      {formError && <div className="form-error">{formError}</div>}
    </Modal>
  );
}
