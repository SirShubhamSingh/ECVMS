interface StatCardProps {
  label: string;
  value: number | string;
  accent?: "blue" | "green" | "amber" | "red" | "purple" | "teal" | "orange";
  hint?: string;
}

export default function StatCard({ label, value, accent = "blue", hint }: StatCardProps) {
  return (
    <div className={`stat-card stat-card-${accent}`}>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {hint && <div className="stat-card-hint">{hint}</div>}
    </div>
  );
}
