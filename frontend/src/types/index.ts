export type Role =
  | "Super Administrator"
  | "Compliance Officer"
  | "Vendor Manager"
  | "Approver"
  | "Employee";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  active: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  active: boolean;
  createdDate: string;
}

export interface IssueComment {
  userId: string;
  userName: string;
  text: string;
  createdDate: string;
}

export interface VendorIssue {
  id: string;
  issueNumber: string;
  title: string;
  vendor: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status:
    | "Open"
    | "Pending Assignment"
    | "Investigation"
    | "Risk Assessment"
    | "Resolution"
    | "Resolved"
    | "Closed";
  assignedOfficerId?: string | null;
  assignedOfficerName?: string | null;
  createdById: string;
  createdByName: string;
  createdDate: string;
  dueDate?: string | null;
  description: string;
  attachments: string[];
  comments: IssueComment[];
}

export interface Investigation {
  id: string;
  issueId: string;
  issueNumber: string;
  officerId: string;
  officerName: string;
  status: "Not Started" | "In Progress" | "Completed" | "Reopened";
  startDate: string;
  targetCompletionDate?: string | null;
  findings: string;
  rootCause: string;
  evidence: string[];
  investigationNotes: string;
  completedDate?: string | null;
}

export interface RiskAssessment {
  id: string;
  issueId: string;
  issueNumber: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  mitigation: string;
  assessedById: string;
  assessedByName: string;
  assessmentDate: string;
  comments: string;
}

export interface ApprovalRecord {
  approverId: string;
  approverName: string;
  decision: string;
  reason: string;
  decisionDate: string;
}

export interface Resolution {
  id: string;
  issueId: string;
  issueNumber: string;
  investigationId: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  resolutionDescription: string;
  resolvedById: string;
  resolvedByName: string;
  resolutionDate?: string | null;
  status: "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Resolved";
  comments: string;
  requiresApproval: boolean;
  approvalHistory: ApprovalRecord[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdDate: string;
  relatedEntity: string;
  relatedEntityId: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  details: string;
}

export const ISSUE_CATEGORIES = [
  "Service",
  "Billing",
  "Compliance",
  "Quality",
  "Security",
  "Documentation",
  "Performance",
  "SLA",
  "Data Privacy",
  "Other"
];

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export const ISSUE_STATUSES = [
  "Open",
  "Pending Assignment",
  "Investigation",
  "Risk Assessment",
  "Resolution",
  "Resolved",
  "Closed"
];
