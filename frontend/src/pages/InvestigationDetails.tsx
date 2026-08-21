import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { investigationService, INVESTIGATION_STATUSES } from "../services/investigationService";
import type { Investigation } from "../types";
import { LoadingSpinner, ErrorState } from "../components/StatePanels";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../components/Toast";
import { extractErrorMessage } from "../services/api";

export default function InvestigationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState("");
  const [findings, setFindings] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [notes, setNotes] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await investigationService.get(id);
      setInvestigation(data);
      setStatus(data.status);
      setFindings(data.findings);
      setRootCause(data.rootCause);
      setNotes(data.investigationNotes);
      setEvidenceText(data.evidence.join("\n"));
      setTargetDate(data.targetCompletionDate ? data.targetCompletionDate.slice(0, 10) : "");
    } catch (err) {
      setError(extractErrorMessage(err, "Could not load this investigation, or you're not authorized to view it."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    setSaveError(null);
    try {
      await investigationService.update(id, {
        status,
        findings,
        rootCause,
        investigationNotes: notes,
        evidence: evidenceText.split("\n").map((s) => s.trim()).filter(Boolean),
        targetCompletionDate: targetDate || undefined
      });
      showToast(
        status === "Completed" ? "Investigation completed — case moved to Risk Assessment." : "Investigation updated.",
        "success"
      );
      load();
    } catch (err) {
      setSaveError(extractErrorMessage(err));
      showToast("Failed to update investigation.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading investigation..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!investigation) return null;

  return (
    <div className="page">
      <button className="link-button" onClick={() => navigate(-1)}>‹ Back</button>

      <div className="page-header">
        <div>
          <h1>Investigation — {investigation.issueNumber}</h1>
          <p className="page-subtitle">
            Officer: {investigation.officerName} · Started {new Date(investigation.startDate).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={investigation.status} />
      </div>

      <div className="card">
        <h3>Investigation Details</h3>
        <div className="form-grid">
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {INVESTIGATION_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Target Completion Date
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </label>
          <label className="span-2">
            Findings
            <textarea rows={3} value={findings} onChange={(e) => setFindings(e.target.value)} />
          </label>
          <label className="span-2">
            Root Cause
            <textarea rows={2} value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
          </label>
          <label className="span-2">
            Evidence (one item per line — references, file names, links)
            <textarea rows={2} value={evidenceText} onChange={(e) => setEvidenceText(e.target.value)} />
          </label>
          <label className="span-2">
            Investigation Notes
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
        {saveError && <div className="form-error">{saveError}</div>}
        <div className="action-row">
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : status === "Completed" ? "Complete Investigation" : "Save Changes"}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(`/vendor-issues/${investigation.issueId}`)}>
            View Vendor Issue
          </button>
        </div>
      </div>
    </div>
  );
}
