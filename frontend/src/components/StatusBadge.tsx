const STATUS_CLASS: Record<string, string> = {
  "Open": "badge badge-blue",
  "Pending Assignment": "badge badge-amber",
  "Investigation": "badge badge-purple",
  "Risk Assessment": "badge badge-orange",
  "Resolution": "badge badge-teal",
  "Resolved": "badge badge-green",
  "Closed": "badge badge-gray",
  "Not Started": "badge badge-gray",
  "In Progress": "badge badge-purple",
  "Completed": "badge badge-green",
  "Reopened": "badge badge-red",
  "Draft": "badge badge-gray",
  "Pending Approval": "badge badge-amber",
  "Approved": "badge badge-green",
  "Rejected": "badge badge-red"
};

export default function StatusBadge({ status }: { status: string }) {
  return <span className={STATUS_CLASS[status] ?? "badge badge-gray"}>{status}</span>;
}
