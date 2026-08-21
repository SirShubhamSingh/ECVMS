import { useEffect, useState } from "react";
import { auditService } from "../services/auditService";
import type { AuditLog } from "../types";
import DataTable, { type Column } from "../components/DataTable";
import { LoadingSpinner, ErrorState, EmptyState } from "../components/StatePanels";
import { extractErrorMessage } from "../services/api";

const ENTITIES = ["User", "VendorIssue", "Investigation", "RiskAssessment", "Resolution"];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entity, setEntity] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await auditService.list({ entity: entity || undefined });
      setLogs(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Could not load the audit log."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity]);

  const columns: Column<AuditLog>[] = [
    { header: "Timestamp", render: (l) => new Date(l.timestamp).toLocaleString(), width: "180px" },
    { header: "User", render: (l) => l.userName },
    { header: "Action", render: (l) => l.action },
    { header: "Entity", render: (l) => l.entity },
    { header: "Details", render: (l) => l.details }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Audit Log</h1>
          <p className="page-subtitle">Complete history of significant actions across ECMVS. Admin only.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-select">
          <label>Entity</label>
          <select value={entity} onChange={(e) => setEntity(e.target.value)}>
            <option value="">All</option>
            {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      {loading && <LoadingSpinner label="Loading audit log..." />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && logs.length === 0 && <EmptyState title="No audit entries found" />}
      {!loading && !error && logs.length > 0 && (
        <div className="card">
          <DataTable columns={columns} rows={logs} keyField={(l) => l.id} pageSize={15} />
        </div>
      )}
    </div>
  );
}
