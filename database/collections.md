# ECMVS — MongoDB Collections Reference

Database name: **ECMVS**

## Users
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| Name | string | |
| Email | string | unique, used for login |
| PasswordHash | string | SHA-256 hex digest (demo/local-dev auth only) |
| Role | string | Super Administrator \| Compliance Officer \| Vendor Manager \| Approver \| Employee |
| Department | string | |
| Active | bool | inactive users cannot log in |
| CreatedDate | date | |

## VendorIssues
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| IssueNumber | string | unique, format `VI-YYYY-NNNN`, auto-generated |
| Title, Vendor, Category, Priority, Status, Description | string | |
| AssignedOfficerId | ObjectId? | → Users._id |
| AssignedOfficerName | string? | denormalized for display |
| CreatedById | ObjectId | → Users._id |
| CreatedByName | string | denormalized for display |
| CreatedDate, DueDate | date | |
| Attachments | string[] | file names / references |
| Comments | IssueComment[] | { UserId, UserName, Text, CreatedDate } |

## Investigations
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| IssueId | ObjectId | → VendorIssues._id |
| IssueNumber | string | denormalized |
| OfficerId | ObjectId | → Users._id — used for strict officer-scoped access |
| OfficerName | string | denormalized |
| Status | string | Not Started \| In Progress \| Completed \| Reopened |
| StartDate, TargetCompletionDate, CompletedDate | date | |
| Findings, RootCause, InvestigationNotes | string | |
| Evidence | string[] | |

## RiskAssessments
Only ever created against a VendorIssue (Risk Assessment is not applicable to any other entity in ECMVS).

| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| IssueId | ObjectId | → VendorIssues._id |
| IssueNumber | string | denormalized |
| Likelihood, Impact | int | 1–5 |
| RiskScore | int | Likelihood × Impact |
| RiskLevel | string | Low (1-4) \| Medium (5-9) \| High (10-16) \| Critical (17-25) |
| Mitigation, Comments | string | |
| AssessedById | ObjectId | → Users._id |
| AssessedByName | string | denormalized |
| AssessmentDate | date | |

## Resolutions
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| IssueId | ObjectId | → VendorIssues._id |
| InvestigationId | ObjectId | → Investigations._id |
| RootCause, CorrectiveAction, PreventiveAction, ResolutionDescription, Comments | string | |
| ResolvedById | ObjectId | → Users._id |
| ResolvedByName | string | denormalized |
| ResolutionDate | date? | |
| Status | string | Draft \| Pending Approval \| Approved \| Rejected \| Resolved |
| RequiresApproval | bool | |
| ApprovalHistory | ApprovalRecord[] | { ApproverId, ApproverName, Decision, Reason, DecisionDate } |

## Notifications
Always queried scoped to the authenticated caller's own `UserId` — never accepts an arbitrary user id from the client.

| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| UserId | ObjectId | → Users._id |
| Title, Message | string | |
| Read | bool | |
| CreatedDate | date | |
| RelatedEntity | string | e.g. "VendorIssue", "Investigation", "Resolution" |
| RelatedEntityId | string | id of the related record |

## AuditLogs
| Field | Type | Notes |
|---|---|---|
| _id | ObjectId | |
| UserId | ObjectId | → Users._id |
| UserName | string | denormalized |
| Action, Entity, EntityId, Details | string | |
| Timestamp | date | |

## ComplianceCases
The Compliance Hub stores domain-aware matters in `ComplianceCases`. Supported `CaseType` values
are `Grievance`, `Fraud`, `Health & Safety`, `Conflict of Interest`, `Vendor Risk`, and `Employee`.
Records include `CaseNumber`, `Title`, `Description`, `Status`, `Severity`, `Confidentiality`,
`Subject`, `Location`, `AnonymousReporter`, ownership, dates, and `Tags`. Cases are searchable by
number, title, and subject and write to `AuditLogs` when created or updated.

## Indexes created by `seed.js`
- `Users.Email` (unique)
- `VendorIssues.IssueNumber` (unique)
- `VendorIssues.Status`
- `VendorIssues.AssignedOfficerId`
- `Investigations.OfficerId`
- `Investigations.IssueId`
- `RiskAssessments.IssueId`
- `Resolutions.IssueId`
- `Notifications.UserId, Read`
- `AuditLogs.Timestamp` (descending)
- `ComplianceCases.CaseNumber` (unique)
- `ComplianceCases.CaseType, Status`

Contract Management is intentionally **not** modeled anywhere in this schema — it is out of scope for ECMVS.
