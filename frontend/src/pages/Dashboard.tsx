import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../hooks/useAuth";
import { reportService } from "../services/reportService";
import StatCard from "../components/StatCard";
import { LoadingSpinner, ErrorState } from "../components/StatePanels";

const COLORS = ["#1C7C93", "#0F3D5C", "#E08E45", "#C0392B", "#2E8B57", "#7D5BA6"];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await reportService.dashboard();
      setData(result);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const role = currentUser?.role;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {currentUser?.name}</h1>
          <p className="page-subtitle">{role} · {currentUser?.department}</p>
        </div>
      </div>

      {role === "Super Administrator" && <AdminDashboard data={data} />}
      {role === "Compliance Officer" && <OfficerDashboard data={data} />}
      {role === "Vendor Manager" && <VendorManagerDashboard data={data} />}
      {role === "Approver" && <ApproverDashboard data={data} />}
      {role === "Employee" && <EmployeeDashboard data={data} />}
    </div>
  );
}

function AdminDashboard({ data }: { data: any }) {
  return (
    <>
      <div className="stat-grid">
        <StatCard label="Total Vendor Issues" value={data.totalVendorIssues} accent="blue" />
        <StatCard label="Open Cases" value={data.openCases} accent="teal" />
        <StatCard label="Under Investigation" value={data.underInvestigation} accent="purple" />
        <StatCard label="Risk Assessment Pending" value={data.riskAssessmentPending} accent="amber" />
        <StatCard label="Pending Resolution" value={data.pendingResolution} accent="amber" />
        <StatCard label="Resolved Cases" value={data.resolvedCases} accent="green" />
        <StatCard label="Critical / High Risk" value={data.criticalHighRiskCases} accent="red" />
      </div>

      <div className="chart-grid">
        <div className="card chart-card">
          <h3>Case Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.statusChart}>
              <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1C7C93" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.priorityDistribution} dataKey="count" nameKey="priority" outerRadius={90} label>
                {data.priorityDistribution.map((_: any, idx: number) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Officer Workload</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.officerWorkload} layout="vertical">
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="officer" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0F3D5C" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3>Recent Activities</h3>
        <ul className="activity-list">
          {data.recentActivities.map((a: any, idx: number) => (
            <li key={idx}>
              <strong>{a.userName}</strong> — {a.action}
              <span className="activity-details">{a.details}</span>
              <span className="activity-time">{new Date(a.timestamp).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function OfficerDashboard({ data }: { data: any }) {
  return (
    <>
      <div className="stat-grid">
        <StatCard label="My Assigned Investigations" value={data.myAssignedInvestigations} accent="purple" />
        <StatCard label="My Open Cases" value={data.myOpenCases} accent="blue" />
        <StatCard label="Pending Investigations" value={data.pendingInvestigations} accent="amber" />
        <StatCard label="Pending Resolution" value={data.pendingResolution} accent="amber" />
        <StatCard label="My Risk Assessments" value={data.myRiskAssessments} accent="orange" />
      </div>
      <div className="card">
        <h3>Recent Notifications</h3>
        <ul className="activity-list">
          {data.recentNotifications.map((n: any, idx: number) => (
            <li key={idx}>
              <strong>{n.title}</strong>
              <span className="activity-details">{n.message}</span>
              <span className="activity-time">{new Date(n.createdDate).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function VendorManagerDashboard({ data }: { data: any }) {
  return (
    <>
      <div className="stat-grid">
        <StatCard label="Vendor Issues" value={data.vendorIssues} accent="blue" />
        <StatCard label="Open Vendor Issues" value={data.openVendorIssues} accent="teal" />
        <StatCard label="Vendor-related Risks" value={data.vendorRelatedRisks} accent="red" />
        <StatCard label="Pending Assignments" value={data.pendingAssignments} accent="amber" />
      </div>
      <div className="card">
        <h3>Recent Vendor Activity</h3>
        <ul className="activity-list">
          {data.recentVendorActivity.map((i: any, idx: number) => (
            <li key={idx}>
              <strong>{i.issueNumber}</strong> — {i.title}
              <span className="activity-details">{i.vendor} · {i.status}</span>
              <span className="activity-time">{new Date(i.createdDate).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ApproverDashboard({ data }: { data: any }) {
  return (
    <>
      <div className="stat-grid">
        <StatCard label="Pending Approvals" value={data.pendingApprovals} accent="amber" />
        <StatCard label="Approved Items" value={data.approvedItems} accent="green" />
        <StatCard label="Rejected Items" value={data.rejectedItems} accent="red" />
      </div>
      <div className="card">
        <h3>Recent Approval Activity</h3>
        <ul className="activity-list">
          {data.recentApprovalActivity.map((r: any, idx: number) => (
            <li key={idx}>
              <strong>{r.issueNumber}</strong>
              <span className="activity-details">{r.status}</span>
              {r.resolutionDate && <span className="activity-time">{new Date(r.resolutionDate).toLocaleDateString()}</span>}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function EmployeeDashboard({ data }: { data: any }) {
  return (
    <>
      <div className="stat-grid">
        <StatCard label="My Reported Issues" value={data.myReportedIssues} accent="blue" />
        <StatCard label="Open Issues" value={data.openIssues} accent="amber" />
        <StatCard label="Resolved Issues" value={data.resolvedIssues} accent="green" />
      </div>
      <div className="card">
        <h3>Recent Notifications</h3>
        <ul className="activity-list">
          {data.recentNotifications.map((n: any, idx: number) => (
            <li key={idx}>
              <strong>{n.title}</strong>
              <span className="activity-details">{n.message}</span>
              <span className="activity-time">{new Date(n.createdDate).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
