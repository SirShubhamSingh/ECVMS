import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { investigationService, INVESTIGATION_STATUSES } from "../services/investigationService";
import type { Investigation } from "../types";
import DataTable, { type Column } from "../components/DataTable";
import { SearchBar, FilterSelect } from "../components/Filters";
import { LoadingSpinner, ErrorState, EmptyState } from "../components/StatePanels";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { extractErrorMessage } from "../services/api";

export default function Investigations() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // The backend always scopes results to the caller: a Compliance Officer
      // only ever receives investigations assigned to themselves, regardless
      // of any filter sent from here.
      const data = await investigationService.list({ search, status });
      setInvestigations(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Could not load investigations."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const columns: Column<Investigation>[] = [
    { header: "Issue #", render: (r) => <strong>{r.issueNumber}</strong>, width: "120px" },
    { header: "Officer", render: (r) => r.officerName },
    { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { header: "Started", render: (r) => new Date(r.startDate).toLocaleDateString() },
    {
      header: "Target Completion",
      render: (r) => (r.targetCompletionDate ? new Date(r.targetCompletionDate).toLocaleDateString() : "—")
    },
    { header: "Completed", render: (r) => (r.completedDate ? new Date(r.completedDate).toLocaleDateString() : "—") }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Investigations</h1>
          <p className="page-subtitle">
            {currentUser?.role === "Compliance Officer"
              ? "Investigations assigned to you."
              : "All investigations across the organization."}
          </p>
        </div>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by issue # or officer..." />
        <FilterSelect label="Status" value={status} options={INVESTIGATION_STATUSES} onChange={setStatus} />
      </div>

      {loading && <LoadingSpinner label="Loading investigations..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && investigations.length === 0 && (
        <EmptyState title="No investigations found" message="Investigations appear here once opened from a vendor issue." />
      )}
      {!loading && !error && investigations.length > 0 && (
        <div className="card">
          <DataTable
            columns={columns}
            rows={investigations}
            keyField={(r) => r.id}
            onRowClick={(r) => navigate(`/investigations/${r.id}`)}
          />
        </div>
      )}
    </div>
  );
}
