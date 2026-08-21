import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";
import { reportService } from "../services/reportService";
import { LoadingSpinner, ErrorState } from "../components/StatePanels";
import { extractErrorMessage } from "../services/api";

const COLORS = ["#1C7C93", "#0F3D5C", "#E08E45", "#C0392B", "#2E8B57", "#7D5BA6", "#2D9CDB"];

type ReportTab = "issues" | "investigations" | "risk" | "resolutions";

export default function Reports() {
  const [tab, setTab] = useState<ReportTab>("issues");
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [issues, investigations, risk, resolutions] = await Promise.all([
        reportService.issues(),
        reportService.investigations(),
        reportService.risk(),
        reportService.resolutions()
      ]);
      setData({ issues, investigations, risk, resolutions });
    } catch (err) {
      setError(extractErrorMessage(err, "Could not load reports."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading reports..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="page-subtitle">Vendor issue, investigation, risk, and resolution analytics.</p>
        </div>
      </div>

      <div className="toolbar">
        {(["issues", "investigations", "risk", "resolutions"] as ReportTab[]).map((t) => (
          <button
            key={t}
            className={tab === t ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
            onClick={() => setTab(t)}
          >
            {t[0].toUpperCase() + t.slice(1)} Report
          </button>
        ))}
      </div>

      {tab === "issues" && <IssueReport data={data.issues} />}
      {tab === "investigations" && <InvestigationReport data={data.investigations} />}
      {tab === "risk" && <RiskReport data={data.risk} />}
      {tab === "resolutions" && <ResolutionReport data={data.resolutions} />}
    </div>
  );
}

function IssueReport({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="chart-grid">
      <div className="card chart-card">
        <h3>Cases by Status</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.byStatus}>
            <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#1C7C93" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card chart-card">
        <h3>Cases by Priority</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data.byPriority} dataKey="count" nameKey="priority" outerRadius={90} label>
              {data.byPriority.map((_: any, idx: number) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="card chart-card">
        <h3>Cases by Category</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.byCategory} layout="vertical">
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="category" width={110} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#0F3D5C" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card chart-card">
        <h3>Cases by Vendor</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.byVendor} layout="vertical">
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="vendor" width={130} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#E08E45" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card chart-card" style={{ gridColumn: "1 / -1" }}>
        <h3>Monthly Case Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#1C7C93" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function InvestigationReport({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="chart-grid">
      <div className="card chart-card">
        <h3>Investigations by Status</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.byStatus}>
            <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#7D5BA6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card chart-card">
        <h3>Officer Workload Report</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.byOfficer} layout="vertical">
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="officer" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#0F3D5C" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RiskReport({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="chart-grid">
      <div className="card chart-card">
        <h3>Risk Distribution by Level</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data.byLevel} dataKey="count" nameKey="level" outerRadius={90} label>
              {data.byLevel.map((_: any, idx: number) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="card chart-card">
        <h3>Score Distribution</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.distribution}>
            <XAxis dataKey="issueNumber" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} domain={[0, 25]} />
            <Tooltip />
            <Bar dataKey="riskScore" fill="#C0392B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ResolutionReport({ data }: { data: any }) {
  if (!data) return null;
  return (
    <div className="chart-grid">
      <div className="card chart-card">
        <h3>Resolutions by Status</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.byStatus}>
            <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#1A9C5B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="card chart-card">
        <h3>Resolution Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#1A9C5B" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
