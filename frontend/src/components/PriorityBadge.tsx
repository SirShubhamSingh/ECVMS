const PRIORITY_CLASS: Record<string, string> = {
  Low: "badge badge-green",
  Medium: "badge badge-blue",
  High: "badge badge-orange",
  Critical: "badge badge-red"
};

export function PriorityBadge({ priority }: { priority: string }) {
  return <span className={PRIORITY_CLASS[priority] ?? "badge badge-gray"}>{priority}</span>;
}

const RISK_CLASS: Record<string, string> = {
  Low: "badge badge-green",
  Medium: "badge badge-blue",
  High: "badge badge-orange",
  Critical: "badge badge-red"
};

export function RiskLevelBadge({ level }: { level: string }) {
  return <span className={RISK_CLASS[level] ?? "badge badge-gray"}>{level}</span>;
}

export default PriorityBadge;
