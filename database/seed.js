// ECMVS demo seed script
// Run with:  mongosh < database/seed.js
// This clears and repopulates the ECMVS database with realistic demo data.
//
// Demo password for ALL seeded users: Password123!
// (Stored as its SHA-256 hex digest — see backend/Helpers/PasswordHasher.cs)

const PASSWORD_HASH = "a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea"; // Password123!

db = db.getSiblingDB("ECMVS");

db.Users.deleteMany({});
db.VendorIssues.deleteMany({});
db.Investigations.deleteMany({});
db.RiskAssessments.deleteMany({});
db.Resolutions.deleteMany({});
db.Notifications.deleteMany({});
db.AuditLogs.deleteMany({});

// ---------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------
const asmitaId = ObjectId();
const rahulId = ObjectId();
const priyaId = ObjectId();
const amitId = ObjectId();
const employeeId = ObjectId();
const nehaId = ObjectId(); // second Compliance Officer, used to prove officer-scoping

db.Users.insertMany([
  {
    _id: asmitaId,
    Name: "Asmita Baghsavar",
    Email: "asmita@ecmvs.local",
    PasswordHash: PASSWORD_HASH,
    Role: "Super Administrator",
    Department: "Enterprise Risk",
    Active: true,
    CreatedDate: new Date("2025-01-06T09:00:00Z")
  },
  {
    _id: rahulId,
    Name: "Rahul Sharma",
    Email: "rahul@ecmvs.local",
    PasswordHash: PASSWORD_HASH,
    Role: "Compliance Officer",
    Department: "Compliance",
    Active: true,
    CreatedDate: new Date("2025-01-10T09:00:00Z")
  },
  {
    _id: nehaId,
    Name: "Neha Kulkarni",
    Email: "neha@ecmvs.local",
    PasswordHash: PASSWORD_HASH,
    Role: "Compliance Officer",
    Department: "Compliance",
    Active: true,
    CreatedDate: new Date("2025-01-12T09:00:00Z")
  },
  {
    _id: priyaId,
    Name: "Priya Mehta",
    Email: "priya@ecmvs.local",
    PasswordHash: PASSWORD_HASH,
    Role: "Vendor Manager",
    Department: "Procurement",
    Active: true,
    CreatedDate: new Date("2025-01-14T09:00:00Z")
  },
  {
    _id: amitId,
    Name: "Amit Verma",
    Email: "amit@ecmvs.local",
    PasswordHash: PASSWORD_HASH,
    Role: "Approver",
    Department: "Finance",
    Active: true,
    CreatedDate: new Date("2025-01-16T09:00:00Z")
  },
  {
    _id: employeeId,
    Name: "Employee Demo",
    Email: "employee@ecmvs.local",
    PasswordHash: PASSWORD_HASH,
    Role: "Employee",
    Department: "Operations",
    Active: true,
    CreatedDate: new Date("2025-01-20T09:00:00Z")
  }
]);

// ---------------------------------------------------------------------
// Vendor Issues (VI-2026-000x)
// ---------------------------------------------------------------------
const issue12 = ObjectId();
const issue11 = ObjectId();
const issue10 = ObjectId();
const issue09 = ObjectId();
const issue08 = ObjectId();
const issue07 = ObjectId();
const issue06 = ObjectId();
const issue05 = ObjectId();
const issue04 = ObjectId();
const issue03 = ObjectId();

db.VendorIssues.insertMany([
  {
    _id: issue12,
    IssueNumber: "VI-2026-0012",
    Title: "Delayed service delivery",
    Vendor: "NovaTech Solutions",
    Category: "Service",
    Priority: "High",
    Status: "Investigation",
    AssignedOfficerId: rahulId, AssignedOfficerName: "Rahul Sharma",
    CreatedById: priyaId, CreatedByName: "Priya Mehta",
    CreatedDate: new Date("2026-07-02T10:15:00Z"),
    DueDate: new Date("2026-08-15T00:00:00Z"),
    Description: "NovaTech has repeatedly missed contracted SLA windows for infrastructure support tickets over the last quarter.",
    Attachments: [], Comments: []
  },
  {
    _id: issue11,
    IssueNumber: "VI-2026-0011",
    Title: "Invoice mismatch",
    Vendor: "Apex Industrial",
    Category: "Billing",
    Priority: "Medium",
    Status: "Pending Assignment",
    AssignedOfficerId: null, AssignedOfficerName: null,
    CreatedById: priyaId, CreatedByName: "Priya Mehta",
    CreatedDate: new Date("2026-07-05T11:30:00Z"),
    DueDate: new Date("2026-08-20T00:00:00Z"),
    Description: "Q2 invoices from Apex Industrial do not reconcile with the agreed purchase order line items.",
    Attachments: [], Comments: []
  },
  {
    _id: issue10,
    IssueNumber: "VI-2026-0010",
    Title: "Compliance document missing",
    Vendor: "BluePeak Services",
    Category: "Compliance",
    Priority: "Critical",
    Status: "Risk Assessment",
    AssignedOfficerId: rahulId, AssignedOfficerName: "Rahul Sharma",
    CreatedById: asmitaId, CreatedByName: "Asmita Baghsavar",
    CreatedDate: new Date("2026-06-28T08:45:00Z"),
    DueDate: new Date("2026-08-10T00:00:00Z"),
    Description: "BluePeak has not submitted a renewed data processing agreement required under the vendor compliance policy.",
    Attachments: [], Comments: []
  },
  {
    _id: issue09,
    IssueNumber: "VI-2026-0009",
    Title: "Packaging quality issue",
    Vendor: "Zenith Supplies",
    Category: "Quality",
    Priority: "Low",
    Status: "Resolved",
    AssignedOfficerId: nehaId, AssignedOfficerName: "Neha Kulkarni",
    CreatedById: employeeId, CreatedByName: "Employee Demo",
    CreatedDate: new Date("2026-06-10T09:00:00Z"),
    DueDate: new Date("2026-07-01T00:00:00Z"),
    Description: "Received shipment had damaged outer packaging on approximately 8% of units.",
    Attachments: [], Comments: []
  },
  {
    _id: issue08,
    IssueNumber: "VI-2026-0008",
    Title: "Security access concern",
    Vendor: "CoreServe Pvt Ltd",
    Category: "Security",
    Priority: "High",
    Status: "Open",
    AssignedOfficerId: null, AssignedOfficerName: null,
    CreatedById: priyaId, CreatedByName: "Priya Mehta",
    CreatedDate: new Date("2026-07-18T14:20:00Z"),
    DueDate: new Date("2026-08-25T00:00:00Z"),
    Description: "CoreServe support staff were found using shared login credentials to access the client portal.",
    Attachments: [], Comments: []
  },
  {
    _id: issue07,
    IssueNumber: "VI-2026-0007",
    Title: "SLA breach on incident response",
    Vendor: "NovaTech Solutions",
    Category: "SLA",
    Priority: "High",
    Status: "Investigation",
    AssignedOfficerId: nehaId, AssignedOfficerName: "Neha Kulkarni",
    CreatedById: priyaId, CreatedByName: "Priya Mehta",
    CreatedDate: new Date("2026-07-08T13:00:00Z"),
    DueDate: new Date("2026-08-05T00:00:00Z"),
    Description: "Critical incident acknowledgment took over 6 hours against a contracted 30-minute SLA.",
    Attachments: [], Comments: []
  },
  {
    _id: issue06,
    IssueNumber: "VI-2026-0006",
    Title: "Data privacy notice outdated",
    Vendor: "BluePeak Services",
    Category: "Data Privacy",
    Priority: "Medium",
    Status: "Closed",
    AssignedOfficerId: rahulId, AssignedOfficerName: "Rahul Sharma",
    CreatedById: asmitaId, CreatedByName: "Asmita Baghsavar",
    CreatedDate: new Date("2026-05-20T10:00:00Z"),
    DueDate: new Date("2026-06-15T00:00:00Z"),
    Description: "Vendor's published privacy notice referenced a regulation version superseded in Q1.",
    Attachments: [], Comments: []
  },
  {
    _id: issue05,
    IssueNumber: "VI-2026-0005",
    Title: "Missing performance report",
    Vendor: "Zenith Supplies",
    Category: "Performance",
    Priority: "Low",
    Status: "Open",
    AssignedOfficerId: null, AssignedOfficerName: null,
    CreatedById: employeeId, CreatedByName: "Employee Demo",
    CreatedDate: new Date("2026-07-22T09:10:00Z"),
    DueDate: new Date("2026-08-28T00:00:00Z"),
    Description: "Monthly performance report for June was not submitted by the contractual deadline.",
    Attachments: [], Comments: []
  },
  {
    _id: issue04,
    IssueNumber: "VI-2026-0004",
    Title: "Onboarding documentation incomplete",
    Vendor: "Apex Industrial",
    Category: "Documentation",
    Priority: "Medium",
    Status: "Resolution",
    AssignedOfficerId: rahulId, AssignedOfficerName: "Rahul Sharma",
    CreatedById: priyaId, CreatedByName: "Priya Mehta",
    CreatedDate: new Date("2026-06-15T09:30:00Z"),
    DueDate: new Date("2026-07-20T00:00:00Z"),
    Description: "Vendor onboarding packet was missing signed W-9 equivalent and insurance certificates.",
    Attachments: [], Comments: []
  },
  {
    _id: issue03,
    IssueNumber: "VI-2026-0003",
    Title: "Unclear escalation contact",
    Vendor: "CoreServe Pvt Ltd",
    Category: "Other",
    Priority: "Low",
    Status: "Resolved",
    AssignedOfficerId: nehaId, AssignedOfficerName: "Neha Kulkarni",
    CreatedById: employeeId, CreatedByName: "Employee Demo",
    CreatedDate: new Date("2026-05-02T10:00:00Z"),
    DueDate: new Date("2026-05-25T00:00:00Z"),
    Description: "Vendor's published escalation contact list was outdated, delaying an urgent support request.",
    Attachments: [], Comments: [
      { UserId: nehaId, UserName: "Neha Kulkarni", Text: "Confirmed with vendor; updated contact sheet received.", CreatedDate: new Date("2026-05-20T12:00:00Z") }
    ]
  }
]);

// ---------------------------------------------------------------------
// Investigations
// ---------------------------------------------------------------------
const inv12 = ObjectId();
const inv10 = ObjectId();
const inv09 = ObjectId();
const inv07 = ObjectId();
const inv04 = ObjectId();

db.Investigations.insertMany([
  {
    _id: inv12,
    IssueId: issue12, IssueNumber: "VI-2026-0012",
    OfficerId: rahulId, OfficerName: "Rahul Sharma",
    Status: "In Progress",
    StartDate: new Date("2026-07-03T09:00:00Z"),
    TargetCompletionDate: new Date("2026-08-01T00:00:00Z"),
    Findings: "Preliminary review shows three missed SLA windows in the last 60 days.",
    RootCause: "",
    Evidence: ["Ticket log export — July 2026", "SLA agreement v2.pdf"],
    InvestigationNotes: "Awaiting vendor response to formal query letter.",
    CompletedDate: null
  },
  {
    _id: inv10,
    IssueId: issue10, IssueNumber: "VI-2026-0010",
    OfficerId: rahulId, OfficerName: "Rahul Sharma",
    Status: "Completed",
    StartDate: new Date("2026-06-29T09:00:00Z"),
    TargetCompletionDate: new Date("2026-07-15T00:00:00Z"),
    Findings: "Vendor confirmed the data processing agreement lapsed and was not renewed on schedule.",
    RootCause: "Internal contract renewal tracker was not updated after the compliance team reorganization.",
    Evidence: ["Email correspondence — BluePeak legal", "Compliance tracker screenshot"],
    InvestigationNotes: "Vendor has committed to renewal within 10 business days.",
    CompletedDate: new Date("2026-07-14T16:00:00Z")
  },
  {
    _id: inv09,
    IssueId: issue09, IssueNumber: "VI-2026-0009",
    OfficerId: nehaId, OfficerName: "Neha Kulkarni",
    Status: "Completed",
    StartDate: new Date("2026-06-11T09:00:00Z"),
    TargetCompletionDate: new Date("2026-06-25T00:00:00Z"),
    Findings: "Damage traced to inadequate cushioning in outer cartons during transit.",
    RootCause: "Vendor changed packaging supplier without notifying quality control.",
    Evidence: ["Photos — damaged units (6)", "Shipment manifest"],
    InvestigationNotes: "Vendor agreed to revert to prior packaging supplier.",
    CompletedDate: new Date("2026-06-24T11:00:00Z")
  },
  {
    _id: inv07,
    IssueId: issue07, IssueNumber: "VI-2026-0007",
    OfficerId: nehaId, OfficerName: "Neha Kulkarni",
    Status: "In Progress",
    StartDate: new Date("2026-07-09T09:00:00Z"),
    TargetCompletionDate: new Date("2026-08-05T00:00:00Z"),
    Findings: "Reviewing incident response logs against contracted response times.",
    RootCause: "",
    Evidence: ["Incident ticket #INC-88213"],
    InvestigationNotes: "Requested on-call roster from vendor for the incident window.",
    CompletedDate: null
  },
  {
    _id: inv04,
    IssueId: issue04, IssueNumber: "VI-2026-0004",
    OfficerId: rahulId, OfficerName: "Rahul Sharma",
    Status: "Completed",
    StartDate: new Date("2026-06-16T09:00:00Z"),
    TargetCompletionDate: new Date("2026-07-01T00:00:00Z"),
    Findings: "Confirmed missing insurance certificate and unsigned onboarding forms.",
    RootCause: "Onboarding checklist was not enforced by procurement at contract signing.",
    Evidence: ["Onboarding checklist v1", "Vendor document portal export"],
    InvestigationNotes: "Procurement has since implemented a mandatory document checklist gate.",
    CompletedDate: new Date("2026-06-30T10:00:00Z")
  }
]);

// ---------------------------------------------------------------------
// Risk Assessments (Vendor Issues only)
// ---------------------------------------------------------------------
db.RiskAssessments.insertMany([
  {
    IssueId: issue10, IssueNumber: "VI-2026-0010",
    Likelihood: 4, Impact: 5, RiskScore: 20, RiskLevel: "Critical",
    Mitigation: "Escalate to legal; suspend new data transfers to vendor until agreement is renewed.",
    AssessedById: rahulId, AssessedByName: "Rahul Sharma",
    AssessmentDate: new Date("2026-07-15T10:00:00Z"),
    Comments: "High regulatory exposure given ongoing data processing activity."
  },
  {
    IssueId: issue09, IssueNumber: "VI-2026-0009",
    Likelihood: 2, Impact: 2, RiskScore: 4, RiskLevel: "Low",
    Mitigation: "Vendor reverted packaging supplier; monitor next two shipments.",
    AssessedById: nehaId, AssessedByName: "Neha Kulkarni",
    AssessmentDate: new Date("2026-06-25T09:30:00Z"),
    Comments: "Low recurrence risk based on vendor's corrective response."
  },
  {
    IssueId: issue04, IssueNumber: "VI-2026-0004",
    Likelihood: 2, Impact: 3, RiskScore: 6, RiskLevel: "Medium",
    Mitigation: "Enforce onboarding checklist gate for all new vendors going forward.",
    AssessedById: rahulId, AssessedByName: "Rahul Sharma",
    AssessmentDate: new Date("2026-07-01T09:00:00Z"),
    Comments: "Process gap now closed; residual risk limited to legacy vendors."
  },
  {
    IssueId: issue06, IssueNumber: "VI-2026-0006",
    Likelihood: 3, Impact: 3, RiskScore: 9, RiskLevel: "Medium",
    Mitigation: "Vendor issued updated privacy notice referencing current regulation.",
    AssessedById: rahulId, AssessedByName: "Rahul Sharma",
    AssessmentDate: new Date("2026-06-10T09:00:00Z"),
    Comments: "Closed after confirmation of updated notice."
  },
  {
    IssueId: issue03, IssueNumber: "VI-2026-0003",
    Likelihood: 1, Impact: 2, RiskScore: 2, RiskLevel: "Low",
    Mitigation: "Escalation contact sheet updated and distributed.",
    AssessedById: nehaId, AssessedByName: "Neha Kulkarni",
    AssessmentDate: new Date("2026-05-21T09:00:00Z"),
    Comments: "Minor process issue, fully remediated."
  }
]);

// ---------------------------------------------------------------------
// Resolutions
// ---------------------------------------------------------------------
db.Resolutions.insertMany([
  {
    IssueId: issue09, IssueNumber: "VI-2026-0009", InvestigationId: inv09,
    RootCause: "Vendor changed packaging supplier without notifying quality control.",
    CorrectiveAction: "Vendor reverted to the prior packaging supplier for all future shipments.",
    PreventiveAction: "Added a packaging-change notification clause to the vendor agreement.",
    ResolutionDescription: "Case resolved after vendor confirmed corrective packaging change and two clean shipments were received.",
    ResolvedById: nehaId, ResolvedByName: "Neha Kulkarni",
    ResolutionDate: new Date("2026-06-28T10:00:00Z"),
    Status: "Resolved", Comments: "No further damage reported.", RequiresApproval: true,
    ApprovalHistory: [
      { ApproverId: amitId, ApproverName: "Amit Verma", Decision: "Approved", Reason: "Corrective action verified.", DecisionDate: new Date("2026-06-28T09:30:00Z") }
    ]
  },
  {
    IssueId: issue03, IssueNumber: "VI-2026-0003", InvestigationId: ObjectId(),
    RootCause: "Vendor's published escalation contact list was outdated.",
    CorrectiveAction: "Vendor provided an updated, verified escalation contact sheet.",
    PreventiveAction: "Quarterly contact-sheet verification added to vendor review cycle.",
    ResolutionDescription: "Resolved after updated contact sheet was validated and distributed internally.",
    ResolvedById: nehaId, ResolvedByName: "Neha Kulkarni",
    ResolutionDate: new Date("2026-05-24T10:00:00Z"),
    Status: "Resolved", Comments: "", RequiresApproval: true,
    ApprovalHistory: [
      { ApproverId: amitId, ApproverName: "Amit Verma", Decision: "Approved", Reason: "Low-risk administrative fix.", DecisionDate: new Date("2026-05-24T09:00:00Z") }
    ]
  },
  {
    IssueId: issue06, IssueNumber: "VI-2026-0006", InvestigationId: ObjectId(),
    RootCause: "Privacy notice referenced a superseded regulation version.",
    CorrectiveAction: "Vendor published an updated privacy notice referencing current regulation.",
    PreventiveAction: "Annual privacy-notice audit added to compliance calendar.",
    ResolutionDescription: "Case closed after confirming the updated notice was published and accessible.",
    ResolvedById: rahulId, ResolvedByName: "Rahul Sharma",
    ResolutionDate: new Date("2026-06-14T10:00:00Z"),
    Status: "Resolved", Comments: "", RequiresApproval: true,
    ApprovalHistory: [
      { ApproverId: amitId, ApproverName: "Amit Verma", Decision: "Approved", Reason: "Confirmed remediation.", DecisionDate: new Date("2026-06-14T09:00:00Z") }
    ]
  },
  {
    IssueId: issue04, IssueNumber: "VI-2026-0004", InvestigationId: inv04,
    RootCause: "Onboarding checklist was not enforced by procurement at contract signing.",
    CorrectiveAction: "Collected the missing insurance certificate and signed onboarding forms from vendor.",
    PreventiveAction: "Mandatory onboarding document checklist gate implemented in procurement workflow.",
    ResolutionDescription: "Draft resolution pending final sign-off from the Approver.",
    ResolvedById: rahulId, ResolvedByName: "Rahul Sharma",
    ResolutionDate: null,
    Status: "Pending Approval", Comments: "Awaiting Finance approval before closing.", RequiresApproval: true,
    ApprovalHistory: []
  },
  {
    IssueId: issue10, IssueNumber: "VI-2026-0010", InvestigationId: inv10,
    RootCause: "Internal contract renewal tracker was not updated after team reorganization.",
    CorrectiveAction: "Vendor submitted renewed data processing agreement.",
    PreventiveAction: "Contract renewal tracker ownership reassigned with automated reminders.",
    ResolutionDescription: "Draft resolution — pending final legal sign-off before submission for approval.",
    ResolvedById: rahulId, ResolvedByName: "Rahul Sharma",
    ResolutionDate: null,
    Status: "Draft", Comments: "", RequiresApproval: true,
    ApprovalHistory: []
  }
]);

// ---------------------------------------------------------------------
// Notifications (strictly scoped per user)
// ---------------------------------------------------------------------
db.Notifications.insertMany([
  { UserId: rahulId, Title: "New issue assigned", Message: "Vendor issue VI-2026-0012 (Delayed service delivery) has been assigned to you.", Read: false, CreatedDate: new Date("2026-07-03T09:00:00Z"), RelatedEntity: "VendorIssue", RelatedEntityId: issue12.toString() },
  { UserId: rahulId, Title: "Investigation assigned", Message: "You have been assigned to investigate VI-2026-0010.", Read: true, CreatedDate: new Date("2026-06-29T09:00:00Z"), RelatedEntity: "Investigation", RelatedEntityId: inv10.toString() },
  { UserId: rahulId, Title: "Resolution rejected", Message: "Your resolution for VI-2026-0004 was rejected: needs additional evidence.", Read: false, CreatedDate: new Date("2026-07-10T09:00:00Z"), RelatedEntity: "Resolution", RelatedEntityId: issue04.toString() },
  { UserId: nehaId, Title: "Investigation assigned", Message: "You have been assigned to investigate VI-2026-0007.", Read: false, CreatedDate: new Date("2026-07-09T09:00:00Z"), RelatedEntity: "Investigation", RelatedEntityId: inv07.toString() },
  { UserId: nehaId, Title: "Case resolved", Message: "Vendor issue VI-2026-0009 has been resolved.", Read: true, CreatedDate: new Date("2026-06-28T10:05:00Z"), RelatedEntity: "VendorIssue", RelatedEntityId: issue09.toString() },
  { UserId: priyaId, Title: "Case resolved", Message: "Vendor issue VI-2026-0003 has been resolved.", Read: true, CreatedDate: new Date("2026-05-24T10:05:00Z"), RelatedEntity: "VendorIssue", RelatedEntityId: issue03.toString() },
  { UserId: priyaId, Title: "New issue created", Message: "Your reported issue VI-2026-0011 is pending officer assignment.", Read: false, CreatedDate: new Date("2026-07-05T11:30:00Z"), RelatedEntity: "VendorIssue", RelatedEntityId: issue11.toString() },
  { UserId: amitId, Title: "Approval required", Message: "Resolution for VI-2026-0004 is awaiting your approval.", Read: false, CreatedDate: new Date("2026-07-08T09:00:00Z"), RelatedEntity: "Resolution", RelatedEntityId: issue04.toString() },
  { UserId: amitId, Title: "Approval required", Message: "Resolution for VI-2026-0009 was awaiting your approval.", Read: true, CreatedDate: new Date("2026-06-27T09:00:00Z"), RelatedEntity: "Resolution", RelatedEntityId: issue09.toString() },
  { UserId: employeeId, Title: "Case resolved", Message: "Vendor issue VI-2026-0009 you reported has been resolved.", Read: false, CreatedDate: new Date("2026-06-28T10:10:00Z"), RelatedEntity: "VendorIssue", RelatedEntityId: issue09.toString() },
  { UserId: asmitaId, Title: "High risk assessment recorded", Message: "VI-2026-0010 was assessed as Critical risk.", Read: false, CreatedDate: new Date("2026-07-15T10:05:00Z"), RelatedEntity: "RiskAssessment", RelatedEntityId: issue10.toString() }
]);

// ---------------------------------------------------------------------
// Audit Logs (20 representative entries)
// ---------------------------------------------------------------------
const auditEntries = [
  { UserId: asmitaId, UserName: "Asmita Baghsavar", Action: "Login", Entity: "User", EntityId: asmitaId.toString(), Timestamp: new Date("2026-07-20T08:00:00Z"), Details: "Asmita Baghsavar logged in." },
  { UserId: priyaId, UserName: "Priya Mehta", Action: "Issue created", Entity: "VendorIssue", EntityId: issue12.toString(), Timestamp: new Date("2026-07-02T10:15:00Z"), Details: "Created issue VI-2026-0012: Delayed service delivery" },
  { UserId: priyaId, UserName: "Priya Mehta", Action: "Issue assigned", Entity: "VendorIssue", EntityId: issue12.toString(), Timestamp: new Date("2026-07-02T10:20:00Z"), Details: "Assigned VI-2026-0012 to Rahul Sharma" },
  { UserId: rahulId, UserName: "Rahul Sharma", Action: "Investigation started", Entity: "Investigation", EntityId: inv12.toString(), Timestamp: new Date("2026-07-03T09:00:00Z"), Details: "Investigation opened for VI-2026-0012, assigned to Rahul Sharma" },
  { UserId: priyaId, UserName: "Priya Mehta", Action: "Issue created", Entity: "VendorIssue", EntityId: issue11.toString(), Timestamp: new Date("2026-07-05T11:30:00Z"), Details: "Created issue VI-2026-0011: Invoice mismatch" },
  { UserId: asmitaId, UserName: "Asmita Baghsavar", Action: "Issue created", Entity: "VendorIssue", EntityId: issue10.toString(), Timestamp: new Date("2026-06-28T08:45:00Z"), Details: "Created issue VI-2026-0010: Compliance document missing" },
  { UserId: rahulId, UserName: "Rahul Sharma", Action: "Investigation started", Entity: "Investigation", EntityId: inv10.toString(), Timestamp: new Date("2026-06-29T09:00:00Z"), Details: "Investigation opened for VI-2026-0010, assigned to Rahul Sharma" },
  { UserId: rahulId, UserName: "Rahul Sharma", Action: "Investigation completed", Entity: "Investigation", EntityId: inv10.toString(), Timestamp: new Date("2026-07-14T16:00:00Z"), Details: "Investigation for VI-2026-0010 completed by Rahul Sharma" },
  { UserId: rahulId, UserName: "Rahul Sharma", Action: "Risk assessment created", Entity: "RiskAssessment", EntityId: issue10.toString(), Timestamp: new Date("2026-07-15T10:00:00Z"), Details: "Risk assessed for VI-2026-0010: score 20 (Critical)" },
  { UserId: employeeId, UserName: "Employee Demo", Action: "Issue created", Entity: "VendorIssue", EntityId: issue09.toString(), Timestamp: new Date("2026-06-10T09:00:00Z"), Details: "Created issue VI-2026-0009: Packaging quality issue" },
  { UserId: nehaId, UserName: "Neha Kulkarni", Action: "Investigation started", Entity: "Investigation", EntityId: inv09.toString(), Timestamp: new Date("2026-06-11T09:00:00Z"), Details: "Investigation opened for VI-2026-0009, assigned to Neha Kulkarni" },
  { UserId: nehaId, UserName: "Neha Kulkarni", Action: "Investigation completed", Entity: "Investigation", EntityId: inv09.toString(), Timestamp: new Date("2026-06-24T11:00:00Z"), Details: "Investigation for VI-2026-0009 completed by Neha Kulkarni" },
  { UserId: nehaId, UserName: "Neha Kulkarni", Action: "Risk assessment created", Entity: "RiskAssessment", EntityId: issue09.toString(), Timestamp: new Date("2026-06-25T09:30:00Z"), Details: "Risk assessed for VI-2026-0009: score 4 (Low)" },
  { UserId: nehaId, UserName: "Neha Kulkarni", Action: "Resolution created", Entity: "Resolution", EntityId: issue09.toString(), Timestamp: new Date("2026-06-26T09:00:00Z"), Details: "Draft resolution created for VI-2026-0009" },
  { UserId: nehaId, UserName: "Neha Kulkarni", Action: "Approval submitted", Entity: "Resolution", EntityId: issue09.toString(), Timestamp: new Date("2026-06-27T09:00:00Z"), Details: "Resolution for VI-2026-0009 submitted, status: Pending Approval" },
  { UserId: amitId, UserName: "Amit Verma", Action: "Approval approved", Entity: "Resolution", EntityId: issue09.toString(), Timestamp: new Date("2026-06-28T09:30:00Z"), Details: "VI-2026-0009: Approved — Corrective action verified." },
  { UserId: nehaId, UserName: "Neha Kulkarni", Action: "Case resolved", Entity: "VendorIssue", EntityId: issue09.toString(), Timestamp: new Date("2026-06-28T10:00:00Z"), Details: "VI-2026-0009 marked as resolved" },
  { UserId: rahulId, UserName: "Rahul Sharma", Action: "Resolution created", Entity: "Resolution", EntityId: issue04.toString(), Timestamp: new Date("2026-07-01T10:00:00Z"), Details: "Draft resolution created for VI-2026-0004" },
  { UserId: rahulId, UserName: "Rahul Sharma", Action: "Approval submitted", Entity: "Resolution", EntityId: issue04.toString(), Timestamp: new Date("2026-07-08T09:00:00Z"), Details: "Resolution for VI-2026-0004 submitted, status: Pending Approval" },
  { UserId: asmitaId, UserName: "Asmita Baghsavar", Action: "User created", Entity: "User", EntityId: nehaId.toString(), Timestamp: new Date("2025-01-12T09:00:00Z"), Details: "Created user Neha Kulkarni (Compliance Officer)" }
];
db.AuditLogs.insertMany(auditEntries);

// ---------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------
db.Users.createIndex({ Email: 1 }, { unique: true });
db.VendorIssues.createIndex({ IssueNumber: 1 }, { unique: true });
db.VendorIssues.createIndex({ Status: 1 });
db.VendorIssues.createIndex({ AssignedOfficerId: 1 });
db.Investigations.createIndex({ OfficerId: 1 });
db.Investigations.createIndex({ IssueId: 1 });
db.RiskAssessments.createIndex({ IssueId: 1 });
db.Resolutions.createIndex({ IssueId: 1 });
db.Notifications.createIndex({ UserId: 1, Read: 1 });
db.AuditLogs.createIndex({ Timestamp: -1 });

print("ECMVS seed complete:");
print("  Users: " + db.Users.countDocuments());
print("  VendorIssues: " + db.VendorIssues.countDocuments());
print("  Investigations: " + db.Investigations.countDocuments());
print("  RiskAssessments: " + db.RiskAssessments.countDocuments());
print("  Resolutions: " + db.Resolutions.countDocuments());
print("  Notifications: " + db.Notifications.countDocuments());
print("  AuditLogs: " + db.AuditLogs.countDocuments());
print("Demo login password for all accounts: Password123!");
