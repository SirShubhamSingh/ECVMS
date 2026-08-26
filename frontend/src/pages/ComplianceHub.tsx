import { useEffect, useState } from "react";
import { Modal } from "../components/Modal";
import { useToast } from "../components/Toast";
import { extractErrorMessage } from "../services/api";
import { userService } from "../services/userService";
import { useAuth } from "../hooks/useAuth";
import type { AppUser } from "../types";
import { CASE_SEVERITIES, CASE_STATUSES, CASE_TYPES, complianceCaseService, type CaseSeverity, type CaseType, type ComplianceCase } from "../services/complianceCaseService";

const TYPE_META: Record<CaseType, { description: string; tone: string }> = {
  "Grievance": { description: "Speak-up, workplace concerns and protected complaints", tone: "blue" },
  "Fraud": { description: "Allegations, investigations and financial integrity", tone: "red" },
  "Health & Safety": { description: "Incidents, hazards, injuries and corrective action", tone: "green" },
  "Conflict of Interest": { description: "Disclosures, recusals and ethical decisions", tone: "purple" },
  "Vendor Risk": { description: "Due diligence, third-party exposure and remediation", tone: "amber" },
  "Employee": { description: "Employee compliance, conduct and attestations", tone: "teal" }
};

export default function ComplianceHub() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [cases, setCases] = useState<ComplianceCase[]>([]);
  const [officers, setOfficers] = useState<AppUser[]>([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try { setCases(await complianceCaseService.list({ type, status, search })); }
    catch (err) { setError(extractErrorMessage(err, "Could not load compliance cases.")); }
    finally { setLoading(false); }
  }
  useEffect(() => { const timer = setTimeout(load, 180); return () => clearTimeout(timer); }, [type, status, search]);
  useEffect(() => {
    if (currentUser?.role === "Super Administrator") userService.officers().then(setOfficers).catch(() => setOfficers([]));
  }, [currentUser?.role]);

  async function assign(item: ComplianceCase, officerId: string) {
    try {
      await complianceCaseService.assign(item.id, officerId);
      showToast("Officer assigned.", "success");
      load();
    } catch (err) {
      showToast(extractErrorMessage(err, "Could not assign officer."), "error");
    }
  }

  const counts = CASE_TYPES.map((item) => ({ type: item, count: cases.filter((itemCase) => itemCase.caseType === item).length }));

  return <div className="page compliance-hub">
    <div className="page-header">
      <div><div className="eyebrow">Enterprise compliance operations</div><h1>Compliance Hub</h1><p className="page-subtitle">One controlled workspace for speak-up, integrity, safety, third-party and employee risk.</p></div>
      {(currentUser?.role === "Employee" || currentUser?.role === "Super Administrator") && <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New case</button>}
    </div>

    <section className="hub-hero">
      <div><span className="hero-kicker">CONTROL CENTER</span><h2>Make every concern actionable.</h2><p>Capture sensitive matters with clear ownership, confidentiality and an auditable path from intake to closure.</p></div>
      <div className="hero-metric"><strong>{cases.length}</strong><span>visible cases</span></div>
    </section>

    <div className="domain-grid">{counts.map(({ type: item, count }) => <button className={`domain-card domain-${TYPE_META[item].tone}`} key={item} onClick={() => setType(type === item ? "" : item)}><span className="domain-count">{count}</span><strong>{item}</strong><span>{TYPE_META[item].description}</span><small>{type === item ? "Showing this domain" : "Open workspace"} &rarr;</small></button>)}</div>

    <div className="section-header hub-list-header"><div><h2>Case register</h2><p className="muted">Search and triage all authorized compliance matters.</p></div><div className="hub-filters"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search case, subject or title" /><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{CASE_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></div></div>
    {loading && <div className="state-panel">Loading case register...</div>}
    {!loading && error && <div className="state-panel state-panel-error"><h4>{error}</h4><button className="btn btn-secondary" onClick={load}>Retry</button></div>}
    {!loading && !error && <div className="card case-register"><table className="data-table"><thead><tr><th>Case</th><th>Domain</th><th>Status</th><th>Severity</th><th>Owner</th><th>Created</th></tr></thead><tbody>{cases.map((item) => <tr key={item.id}><td><strong>{item.caseNumber}</strong><div className="table-secondary">{item.title}</div></td><td><span className={`domain-pill pill-${TYPE_META[item.caseType].tone}`}>{item.caseType}</span></td><td><span className={`status-dot status-${item.status.toLowerCase().replace(/ /g, "-")}`}>{item.status}</span></td><td><span className={`severity severity-${item.severity.toLowerCase()}`}>{item.severity}</span></td><td>{currentUser?.role === "Super Administrator" ? <select value={item.assignedToId ?? ""} onChange={(e) => assign(item, e.target.value)}><option value="">Unassigned</option>{officers.map((officer) => <option key={officer.id} value={officer.id}>{officer.name}</option>)}</select> : item.assignedToName ?? "Unassigned"}</td><td>{new Date(item.createdDate).toLocaleDateString()}</td></tr>)}</tbody></table>{cases.length === 0 && <div className="empty-inline">No cases match the current filters.</div>}</div>}
    {showCreate && <CreateCaseModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); showToast("Compliance case created.", "success"); load(); }} />}
  </div>;
}

function CreateCaseModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [caseType, setCaseType] = useState<CaseType>("Grievance");
  const [severity, setSeverity] = useState<CaseSeverity>("Medium");
  const [title, setTitle] = useState(""); const [description, setDescription] = useState("");
  const [subject, setSubject] = useState(""); const [location, setLocation] = useState("");
  const [confidentiality, setConfidentiality] = useState("Restricted"); const [anonymousReporter, setAnonymousReporter] = useState(false);
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState<string | null>(null);
  async function submit() { if (!title.trim() || !description.trim()) { setError("Title and description are required."); return; } setSubmitting(true); setError(null); try { await complianceCaseService.create({ caseType, severity, title, description, subject, location, confidentiality, anonymousReporter }); onSaved(); } catch (err) { setError(extractErrorMessage(err, "Could not create case.")); } finally { setSubmitting(false); } }
  return <Modal title="Open compliance case" onClose={onClose} wide footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit} disabled={submitting}>{submitting ? "Creating..." : "Create case"}</button></>}><div className="form-grid"><label>Domain *<select value={caseType} onChange={(e) => setCaseType(e.target.value as CaseType)}>{CASE_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Severity *<select value={severity} onChange={(e) => setSeverity(e.target.value as CaseSeverity)}>{CASE_SEVERITIES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="span-2">Title *<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Describe the matter clearly" /></label><label className="span-2">Description *<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Record the facts, impact and immediate context" /></label><label>Subject / vendor / employee<input value={subject} onChange={(e) => setSubject(e.target.value)} /></label><label>Location / jurisdiction<input value={location} onChange={(e) => setLocation(e.target.value)} /></label><label>Confidentiality<select value={confidentiality} onChange={(e) => setConfidentiality(e.target.value)}><option>Restricted</option><option>Confidential</option><option>Highly Confidential</option></select></label><label className="checkbox-label"><input type="checkbox" checked={anonymousReporter} onChange={(e) => setAnonymousReporter(e.target.checked)} /> Anonymous reporter</label></div>{error && <div className="form-error">{error}</div>}</Modal>;
}
