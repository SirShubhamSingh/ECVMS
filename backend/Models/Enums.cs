namespace ECMVS.Backend.Models;

public static class Roles
{
    public const string SuperAdministrator = "Super Administrator";
    public const string ComplianceOfficer = "Compliance Officer";
    public const string VendorManager = "Vendor Manager";
    public const string Approver = "Approver";
    public const string Employee = "Employee";
}

public static class IssueCategories
{
    public static readonly string[] All =
    {
        "Service", "Billing", "Compliance", "Quality", "Security",
        "Documentation", "Performance", "SLA", "Data Privacy", "Other"
    };
}

public static class Priority
{
    public const string Low = "Low";
    public const string Medium = "Medium";
    public const string High = "High";
    public const string Critical = "Critical";
}

public static class IssueStatus
{
    public const string Open = "Open";
    public const string PendingAssignment = "Pending Assignment";
    public const string Investigation = "Investigation";
    public const string RiskAssessment = "Risk Assessment";
    public const string Resolution = "Resolution";
    public const string Resolved = "Resolved";
    public const string Closed = "Closed";

    // Valid forward transitions for the case lifecycle.
    public static readonly Dictionary<string, string[]> AllowedTransitions = new()
    {
        [Open] = new[] { PendingAssignment, Investigation, Closed },
        [PendingAssignment] = new[] { Investigation, Open, Closed },
        [Investigation] = new[] { RiskAssessment, Resolution, Closed },
        [RiskAssessment] = new[] { Resolution, Closed },
        [Resolution] = new[] { Resolved, Closed },
        [Resolved] = new[] { Closed },
        [Closed] = Array.Empty<string>()
    };
}

public static class InvestigationStatus
{
    public const string NotStarted = "Not Started";
    public const string InProgress = "In Progress";
    public const string Completed = "Completed";
    public const string Reopened = "Reopened";
}

public static class ResolutionStatus
{
    public const string Draft = "Draft";
    public const string PendingApproval = "Pending Approval";
    public const string Approved = "Approved";
    public const string Rejected = "Rejected";
    public const string Resolved = "Resolved";
}

public static class RiskLevel
{
    public static string FromScore(int score) => score switch
    {
        >= 1 and <= 4 => "Low",
        >= 5 and <= 9 => "Medium",
        >= 10 and <= 16 => "High",
        >= 17 and <= 25 => "Critical",
        _ => "Low"
    };
}
