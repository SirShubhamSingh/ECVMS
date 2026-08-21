import { useEffect, useState } from "react";
import { riskService, LIKELIHOOD_LABELS, IMPACT_LABELS } from "../services/riskService";
import type { RiskAssessment } from "../types";
import DataTable, { type Column } from "../components/DataTable";
import { FilterSelect } from "../components/Filters";
import { LoadingSpinner, ErrorState, EmptyState } from "../components/StatePanels";
import { RiskLevelBadge } from "../components/PriorityBadge";
import { extractErrorMessage } from "../services/api";

function riskColor(score: number): string {
  if (score >= 17) return "#7a1f2b";
  if (score >= 10) return "#b5471f";
  if (score >= 5) return "#92600f";
  return "#16794a";
}

export default function RiskAssessmentPage() {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskLevel, setRiskLevel] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await riskService.list({ riskLevel: riskLevel || undefined });
      setAssessments(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Could not load risk assessments."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskLevel]);

  const columns: Column<RiskAssessment>[] = [
    { header: "Issue #", render: (r) => <strong>{r.issueNumber}</strong>, width: "120px" },
    { header: "Likelihood", render: (r) => `${r.likelihood} — ${LIKELIHOOD_LABELS[r.likelihood - 1]}` },
    { header: "Impact", render: (r) => `${r.impact} — ${IMPACT_LABELS[r.impact - 1]}` },
    { header: "Score", render: (r) => <strong>{r.riskScore}</strong> },
    { header: "Level", render: (r) => <RiskLevelBadge level={r.riskLevel} /> },
    { header: "Assessed By", render: (r) => r.assessedByName },
    { header: "Date", render: (r) => new Date(r.assessmentDate).toLocaleDateString() }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Risk Assessment</h1>
          <p className="page-subtitle">
            Available only for Vendor Issues. Risk Score = Likelihood × Impact.
          </p>
        </div>
      </div>

      <div className="card">
        <h3>Risk Matrix Reference</h3>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div className="risk-matrix">
            {[5, 4, 3, 2, 1].map((impact) =>
              [1, 2, 3, 4, 5].map((likelihood) => {
                const score = impact * likelihood;
                return (
                  <div key={`${impact}-${likelihood}`} className="risk-cell" style={{ background: riskColor(score) }}>
                    {score}
                  </div>
                );
              })
            )}
          </div>
          <ul className="activity-list" style={{ minWidth: 200 }}>
            <li><span className="badge badge-green">Low</span> <span className="activity-details">Score 1–4</span></li>
            <li><span className="badge badge-amber">Medium</span> <span className="activity-details">Score 5–9</span></li>
            <li><span className="badge badge-orange">High</span> <span className="activity-details">Score 10–16</span></li>
            <li><span className="badge badge-red">Critical</span> <span className="activity-details">Score 17–25</span></li>
          </ul>
        </div>
      </div>

      <div className="toolbar">
        <FilterSelect label="Risk Level" value={riskLevel} options={["Low", "Medium", "High", "Critical"]} onChange={setRiskLevel} />
      </div>

      {loading && <LoadingSpinner label="Loading risk assessments..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && assessments.length === 0 && (
        <EmptyState title="No risk assessments yet" message="Risk assessments are created from a vendor issue once its investigation is complete." />
      )}
      {!loading && !error && assessments.length > 0 && (
        <div className="card">
          <DataTable columns={columns} rows={assessments} keyField={(r) => r.id} />
        </div>
      )}
    </div>
  );
}
