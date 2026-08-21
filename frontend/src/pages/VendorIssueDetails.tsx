import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { issueService, ISSUE_STATUSES } from "../services/issueService";
import { investigationService } from "../services/investigationService";
import { riskService } from "../services/riskService";
import { resolutionService } from "../services/resolutionService";
import { userService } from "../services/userService";
import type { VendorIssue, Investigation, RiskAssessment, Resolution, AppUser } from "../types";
import { LoadingSpinner, ErrorState } from "../components/StatePanels";
import StatusBadge from "../components/StatusBadge";
import { PriorityBadge, RiskLevelBadge } from "../components/PriorityBadge";
import { Modal } from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/Toast";
import { extractErrorMessage } from "../services/api";

export default function VendorIssueDetails() {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [issue, setIssue] = useState<VendorIssue | null>(null);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [officers, setOfficers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAssign, setShowAssign] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [showInvestigate, setShowInvestigate] = useState(false);
  const [showRisk, setShowRisk] = useState(false);
  const [showResolution, setShowResolution] = useState(false);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [issueData, investigationData, riskData, resolutionData, officerData] = await Promise.all([
        issueService.get(id),
        investigationService.list({}),
        riskService.list({ issueId: id }),
        resolutionService.list({ issueId: id }),
        userService.officers()
      ]);
      setIssue(issueData);
      setInvestigations(investigationData.filter((i) => i.issueId === id));
      setRisks(riskData);
      setResolutions(resolutionData);
      setOfficers(officerData);
    } catch (err) {
      setError(extractErrorMessage(err, "Could not load this issue."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading issue details..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!issue) return null;

  const role = currentUser?.role;
  const canAssign = role === "Super Administrator" || role === "Vendor Manager";
  const canChangeStatus = role === "Super Administrator" || role === "Vendor Manager" || role === "Compliance Officer";
  const canInvestigate =
    (role === "Super Administrator" || role === "Compliance Officer") &&
    investigations.length === 0;
  const activeInvestigation = investigations.find((i) => i.status !== "Completed");
  const canAssessRisk =
    (role === "Super Administrator" || role === "Compliance Officer") &&
    issue.status === "Risk Assessment";
  const canCreateResolution =
    (role === "Super Administrator" || role === "Compliance Officer") &&
    (issue.status === "Resolution" || issue.status === "Risk Assessment") &&
    resolutions.length === 0;

  const allowedNextStatuses: string[] = ISSUE_STATUSES; // backend enforces valid transitions

  return (
    <div className="page">
      <button className="link-button" onClick={() => navigate("/vendor-issues")}>‹ Back to Vendor Issues</button>

      <div className="page-header">
        <div>
          <h1>{issue.issueNumber} — {issue.title}</h1>
          <p className="page-subtitle">
            {issue.vendor} · {issue.category} · Created {new Date(issue.createdDate).toLocaleDateString()} by {issue.createdByName}
          </p>
        </div>
        <div className="badge-row">
          <PriorityBadge priority={issue.priority} />
          <StatusBadge status={issue.status} />
        </div>
      </div>

      <div className="detail-grid">
        <div className="card">
          <h3>Issue Information</h3>
          <dl className="detail-list">
            <div><dt>Vendor</dt><dd>{issue.vendor}</dd></div>
            <div><dt>Category</dt><dd>{issue.category}</dd></div>
            <div><dt>Assigned Officer</dt><dd>{issue.assignedOfficerName ?? "Unassigned"}</dd></div>
            <div><dt>Due Date</dt><dd>{issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "—"}</dd></div>
          </dl>
          <h4>Description</h4>
          <p>{issue.description}</p>

          <div className="action-row">
            {canAssign && <button className="btn btn-secondary" onClick={() => setShowAssign(true)}>Assign Officer</button>}
            {canChangeStatus && <button className="btn btn-secondary" onClick={() => setShowStatus(true)}>Change Status</button>}
            <button className="btn btn-ghost" onClick={() => setShowComment(true)}>Add Comment</button>
          </div>
        </div>

        <div className="card">
          <h3>Comments</h3>
          {issue.comments.length === 0 && <p className="muted">No comments yet.</p>}
          <ul className="comment-list">
            {issue.comments.map((c, idx) => (
              <li key={idx}>
                <strong>{c.userName}</strong>
                <span className="activity-time">{new Date(c.createdDate).toLocaleString()}</span>
                <p>{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="card">
        <div className="section-header">
          <h3>Investigation</h3>
          {canInvestigate && <button className="btn btn-primary" onClick={() => setShowInvestigate(true)}>Start Investigation</button>}
        </div>
        {investigations.length === 0 && <p className="muted">No investigation opened yet.</p>}
        {investigations.map((inv) => (
          <div key={inv.id} className="sub-card">
            <div className="sub-card-header">
              <span>Officer: <strong>{inv.officerName}</strong></span>
              <StatusBadge status={inv.status} />
            </div>
            <p><strong>Findings:</strong> {inv.findings || "—"}</p>
            <p><strong>Root Cause:</strong> {inv.rootCause || "—"}</p>
            <button className="link-button" onClick={() => navigate(`/investigations/${inv.id}`)}>Open investigation ›</button>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="section-header">
          <h3>Risk Assessment</h3>
          {canAssessRisk && <button className="btn btn-primary" onClick={() => setShowRisk(true)}>Assess Risk</button>}
        </div>
        {risks.length === 0 && (
          <p className="muted">
            No risk assessment yet. Risk Assessment is only available for Vendor Issues once investigation is complete.
          </p>
        )}
        {risks.map((r) => (
          <div key={r.id} className="sub-card">
            <div className="sub-card-header">
              <span>Score: <strong>{r.riskScore}</strong> (Likelihood {r.likelihood} × Impact {r.impact})</span>
              <RiskLevelBadge level={r.riskLevel} />
            </div>
            <p><strong>Mitigation:</strong> {r.mitigation || "—"}</p>
            <p className="muted">Assessed by {r.assessedByName} on {new Date(r.assessmentDate).toLocaleDateString()}</p>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="section-header">
          <h3>Resolution</h3>
          {canCreateResolution && (
            <button className="btn btn-primary" onClick={() => setShowResolution(true)}>Create Resolution</button>
          )}
        </div>
        {resolutions.length === 0 && <p className="muted">No resolution created yet.</p>}
        {resolutions.map((r) => (
          <div key={r.id} className="sub-card">
            <div className="sub-card-header">
              <span>Resolved by <strong>{r.resolvedByName}</strong></span>
              <StatusBadge status={r.status} />
            </div>
            <p><strong>Corrective Action:</strong> {r.correctiveAction || "—"}</p>
            <button className="link-button" onClick={() => navigate(`/resolutions?issueId=${issue.id}`)}>Open resolution ›</button>
          </div>
        ))}
      </section>

      {showAssign && (
        <AssignOfficerModal
          issue={issue}
          officers={officers}
          onClose={() => setShowAssign(false)}
          onSaved={() => { setShowAssign(false); showToast("Officer assigned.", "success"); load(); }}
        />
      )}
      {showStatus && (
        <ChangeStatusModal
          issue={issue}
          statuses={allowedNextStatuses}
          onClose={() => setShowStatus(false)}
          onSaved={() => { setShowStatus(false); showToast("Status updated.", "success"); load(); }}
        />
      )}
      {showComment && (
        <AddCommentModal
          issueId={issue.id}
          onClose={() => setShowComment(false)}
          onSaved={() => { setShowComment(false); showToast("Comment added.", "success"); load(); }}
        />
      )}
      {showInvestigate && (
        <StartInvestigationModal
          issueId={issue.id}
          officers={officers}
          onClose={() => setShowInvestigate(false)}
          onSaved={() => { setShowInvestigate(false); showToast("Investigation started.", "success"); load(); }}
        />
      )}
      {showRisk && (
        <AssessRiskModal
          issueId={issue.id}
          onClose={() => setShowRisk(false)}
          onSaved={() => { setShowRisk(false); showToast("Risk assessment recorded.", "success"); load(); }}
        />
      )}
      {showResolution && (
        <CreateResolutionModal
          issueId={issue.id}
          investigationId={activeInvestigation?.id ?? investigations[0]?.id ?? ""}
          onClose={() => setShowResolution(false)}
          onSaved={() => { setShowResolution(false); showToast("Resolution created.", "success"); load(); }}
        />
      )}
    </div>
  );
}

function AssignOfficerModal({ issue, officers, onClose, onSaved }: {
  issue: VendorIssue; officers: AppUser[]; onClose: () => void; onSaved: () => void;
}) {
  const [officerId, setOfficerId] = useState(issue.assignedOfficerId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function handleSubmit() {
    if (!officerId) { setError("Please select an officer."); return; }
    setSubmitting(true);
    try {
      await issueService.assignOfficer(issue.id, officerId);
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
      showToast("Failed to assign officer.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Assign Officer" onClose={onClose} footer={
      <>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Assigning..." : "Assign"}
        </button>
      </>
    }>
      <label>
        Compliance Officer
        <select value={officerId} onChange={(e) => setOfficerId(e.target.value)}>
          <option value="">Select officer</option>
          {officers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </label>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}

function ChangeStatusModal({ issue, statuses, onClose, onSaved }: {
  issue: VendorIssue; statuses: string[]; onClose: () => void; onSaved: () => void;
}) {
  const [status, setStatus] = useState(issue.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await issueService.changeStatus(issue.id, status);
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err, "Invalid status transition."));
      showToast("Failed to update status.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Change Status" onClose={onClose} footer={
      <>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Updating..." : "Update"}
        </button>
      </>
    }>
      <label>
        New Status
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}

function AddCommentModal({ issueId, onClose, onSaved }: { issueId: string; onClose: () => void; onSaved: () => void }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function handleSubmit() {
    if (!text.trim()) { setError("Comment cannot be empty."); return; }
    setSubmitting(true);
    try {
      await issueService.addComment(issueId, text.trim());
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
      showToast("Failed to add comment.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add Comment" onClose={onClose} footer={
      <>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </>
    }>
      <label>
        Comment
        <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}

function StartInvestigationModal({ issueId, officers, onClose, onSaved }: {
  issueId: string; officers: AppUser[]; onClose: () => void; onSaved: () => void;
}) {
  const { currentUser } = useAuth();
  const [officerId, setOfficerId] = useState(
    currentUser?.role === "Compliance Officer" ? currentUser.id : ""
  );
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function handleSubmit() {
    if (!officerId) { setError("Please select an officer."); return; }
    setSubmitting(true);
    try {
      await investigationService.create({ issueId, officerId, targetCompletionDate: targetDate || undefined });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
      showToast("Failed to start investigation.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Start Investigation" onClose={onClose} footer={
      <>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Starting..." : "Start Investigation"}
        </button>
      </>
    }>
      <label>
        Assigned Officer
        <select value={officerId} onChange={(e) => setOfficerId(e.target.value)}>
          <option value="">Select officer</option>
          {officers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </label>
      <label>
        Target Completion Date
        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </label>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}

function AssessRiskModal({ issueId, onClose, onSaved }: { issueId: string; onClose: () => void; onSaved: () => void }) {
  const [likelihood, setLikelihood] = useState(3);
  const [impact, setImpact] = useState(3);
  const [mitigation, setMitigation] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const score = likelihood * impact;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await riskService.create({ issueId, likelihood, impact, mitigation, comments });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
      showToast("Failed to record risk assessment.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Risk Assessment" onClose={onClose} footer={
      <>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save Assessment"}
        </button>
      </>
    }>
      <div className="form-grid">
        <label>
          Likelihood (1–5)
          <input type="number" min={1} max={5} value={likelihood} onChange={(e) => setLikelihood(Number(e.target.value))} />
        </label>
        <label>
          Impact (1–5)
          <input type="number" min={1} max={5} value={impact} onChange={(e) => setImpact(Number(e.target.value))} />
        </label>
      </div>
      <p>Risk Score: <strong>{score}</strong></p>
      <label>
        Mitigation
        <textarea rows={3} value={mitigation} onChange={(e) => setMitigation(e.target.value)} />
      </label>
      <label>
        Comments
        <textarea rows={2} value={comments} onChange={(e) => setComments(e.target.value)} />
      </label>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}

function CreateResolutionModal({ issueId, investigationId, onClose, onSaved }: {
  issueId: string; investigationId: string; onClose: () => void; onSaved: () => void;
}) {
  const [rootCause, setRootCause] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [resolutionDescription, setResolutionDescription] = useState("");
  const [comments, setComments] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await resolutionService.create({
        issueId, investigationId, rootCause, correctiveAction, preventiveAction,
        resolutionDescription, comments, requiresApproval
      });
      onSaved();
    } catch (err) {
      setError(extractErrorMessage(err));
      showToast("Failed to create resolution.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Create Resolution" onClose={onClose} wide footer={
      <>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Saving..." : "Save Draft"}
        </button>
      </>
    }>
      <div className="form-grid">
        <label className="span-2">
          Root Cause
          <textarea rows={2} value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
        </label>
        <label>
          Corrective Action
          <textarea rows={2} value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)} />
        </label>
        <label>
          Preventive Action
          <textarea rows={2} value={preventiveAction} onChange={(e) => setPreventiveAction(e.target.value)} />
        </label>
        <label className="span-2">
          Resolution Description
          <textarea rows={3} value={resolutionDescription} onChange={(e) => setResolutionDescription(e.target.value)} />
        </label>
        <label className="span-2">
          Comments
          <textarea rows={2} value={comments} onChange={(e) => setComments(e.target.value)} />
        </label>
        <label className="checkbox-label span-2">
          <input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} />
          Requires Approver sign-off before closing the case
        </label>
      </div>
      {error && <div className="form-error">{error}</div>}
    </Modal>
  );
}
