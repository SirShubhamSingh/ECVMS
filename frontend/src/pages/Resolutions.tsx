import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { resolutionService } from "../services/resolutionService";
import type { Resolution } from "../types";
import DataTable, { type Column } from "../components/DataTable";
import { FilterSelect } from "../components/Filters";
import { LoadingSpinner, ErrorState, EmptyState } from "../components/StatePanels";
import StatusBadge from "../components/StatusBadge";
import { Modal } from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/Toast";
import { extractErrorMessage } from "../services/api";

const RESOLUTION_STATUSES = ["Draft", "Pending Approval", "Approved", "Rejected", "Resolved"];

export default function Resolutions() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const issueId = searchParams.get("issueId") ?? undefined;

  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<Resolution | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await resolutionService.list({ status: status || undefined, issueId });
      setResolutions(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Could not load resolutions."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, issueId]);

  const canManage = currentUser?.role === "Super Administrator" || currentUser?.role === "Compliance Officer";
  const canApprove = currentUser?.role === "Super Administrator" || currentUser?.role === "Approver";

  const columns: Column<Resolution>[] = [
    { header: "Issue #", render: (r) => <strong>{r.issueNumber}</strong>, width: "120px" },
    { header: "Resolved By", render: (r) => r.resolvedByName },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { header: "Requires Approval", render: (r) => (r.requiresApproval ? "Yes" : "No") },
    { header: "Resolution Date", render: (r) => (r.resolutionDate ? new Date(r.resolutionDate).toLocaleDateString() : "—") }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Resolutions</h1>
          <p className="page-subtitle">Track resolution drafting, submission, and approval.</p>
        </div>
      </div>

      <div className="toolbar">
        <FilterSelect label="Status" value={status} options={RESOLUTION_STATUSES} onChange={setStatus} />
      </div>

      {loading && <LoadingSpinner label="Loading resolutions..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && resolutions.length === 0 && (
        <EmptyState title="No resolutions found" message="Resolutions are created from a vendor issue once investigation and risk assessment are complete." />
      )}
      {!loading && !error && resolutions.length > 0 && (
        <div className="card">
          <DataTable columns={columns} rows={resolutions} keyField={(r) => r.id} onRowClick={(r) => setSelected(r)} />
        </div>
      )}

      {selected && (
        <ResolutionModal
          resolution={selected}
          canManage={canManage}
          canApprove={canApprove}
          onClose={() => setSelected(null)}
          onChanged={() => {
            setSelected(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ResolutionModal({
  resolution,
  canManage,
  canApprove,
  onClose,
  onChanged
}: {
  resolution: Resolution;
  canManage: boolean;
  canApprove: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  async function handleSubmitForApproval() {
    setSubmitting(true);
    setError(null);
    try {
      await resolutionService.submit(resolution.id);
      showToast("Resolution submitted.", "success");
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
      showToast("Failed to submit resolution.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDecide(decision: "Approved" | "Rejected") {
    if (decision === "Rejected" && !showReject) {
      setShowReject(true);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await resolutionService.decide(resolution.id, decision, rejectReason);
      showToast(decision === "Approved" ? "Resolution approved." : "Resolution rejected.", "success");
      onChanged();
    } catch (err) {
      setError(extractErrorMessage(err));
      showToast("Failed to record decision.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Resolution — ${resolution.issueNumber}`} onClose={onClose} wide>
      <dl className="detail-list">
        <div><dt>Status</dt><dd><StatusBadge status={resolution.status} /></dd></div>
        <div><dt>Resolved By</dt><dd>{resolution.resolvedByName}</dd></div>
      </dl>
      <h4>Root Cause</h4>
      <p>{resolution.rootCause || "—"}</p>
      <h4>Corrective Action</h4>
      <p>{resolution.correctiveAction || "—"}</p>
      <h4>Preventive Action</h4>
      <p>{resolution.preventiveAction || "—"}</p>
      <h4>Resolution Description</h4>
      <p>{resolution.resolutionDescription || "—"}</p>

      {resolution.approvalHistory.length > 0 && (
        <>
          <h4>Approval History</h4>
          <ul className="activity-list">
            {resolution.approvalHistory.map((a, idx) => (
              <li key={idx}>
                <strong>{a.approverName}</strong> — {a.decision}
                {a.reason && <span className="activity-details">Reason: {a.reason}</span>}
                <span className="activity-time">{new Date(a.decisionDate).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {showReject && (
        <label>
          Rejection Reason
          <textarea rows={2} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
        </label>
      )}

      {error && <div className="form-error">{error}</div>}

      <div className="action-row">
        {canManage && resolution.status === "Draft" && (
          <button className="btn btn-primary" onClick={handleSubmitForApproval} disabled={submitting}>
            {submitting ? "Submitting..." : resolution.requiresApproval ? "Submit for Approval" : "Mark Resolved"}
          </button>
        )}
        {canApprove && resolution.status === "Pending Approval" && (
          <>
            <button className="btn btn-primary" onClick={() => handleDecide("Approved")} disabled={submitting}>
              Approve
            </button>
            <button className="btn btn-danger" onClick={() => handleDecide("Rejected")} disabled={submitting}>
              {showReject ? "Confirm Reject" : "Reject"}
            </button>
          </>
        )}
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
