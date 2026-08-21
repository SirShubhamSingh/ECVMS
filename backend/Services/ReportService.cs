using ECMVS.Backend.Data;
using ECMVS.Backend.Models;
using MongoDB.Driver;

namespace ECMVS.Backend.Services;

public class ReportService
{
    private readonly MongoDbContext _db;

    public ReportService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<object> GetDashboardAsync(string callerId, string callerRole)
    {
        switch (callerRole)
        {
            case Roles.SuperAdministrator:
                return await AdminDashboardAsync();
            case Roles.ComplianceOfficer:
                return await OfficerDashboardAsync(callerId);
            case Roles.VendorManager:
                return await VendorManagerDashboardAsync();
            case Roles.Approver:
                return await ApproverDashboardAsync(callerId);
            default:
                return await EmployeeDashboardAsync(callerId);
        }
    }

    private async Task<object> AdminDashboardAsync()
    {
        var issues = await _db.VendorIssues.Find(FilterDefinition<VendorIssue>.Empty).ToListAsync();
        var recentAudit = await _db.AuditLogs.Find(FilterDefinition<AuditLog>.Empty)
            .SortByDescending(a => a.Timestamp).Limit(10).ToListAsync();

        var officerWorkload = issues.Where(i => !string.IsNullOrEmpty(i.AssignedOfficerName))
            .GroupBy(i => i.AssignedOfficerName)
            .Select(g => new { officer = g.Key, count = g.Count() })
            .OrderByDescending(g => g.count).ToList();

        return new
        {
            totalVendorIssues = issues.Count,
            openCases = issues.Count(i => i.Status == IssueStatus.Open),
            underInvestigation = issues.Count(i => i.Status == IssueStatus.Investigation),
            riskAssessmentPending = issues.Count(i => i.Status == IssueStatus.RiskAssessment),
            pendingResolution = issues.Count(i => i.Status == IssueStatus.Resolution),
            resolvedCases = issues.Count(i => i.Status is IssueStatus.Resolved or IssueStatus.Closed),
            criticalHighRiskCases = issues.Count(i => i.Priority is Priority.Critical or Priority.High),
            statusChart = issues.GroupBy(i => i.Status).Select(g => new { status = g.Key, count = g.Count() }),
            priorityDistribution = issues.GroupBy(i => i.Priority).Select(g => new { priority = g.Key, count = g.Count() }),
            officerWorkload,
            recentActivities = recentAudit.Select(a => new { a.Action, a.UserName, a.Timestamp, a.Details })
        };
    }

    private async Task<object> OfficerDashboardAsync(string officerId)
    {
        var investigations = await _db.Investigations.Find(i => i.OfficerId == officerId).ToListAsync();
        var issueIds = investigations.Select(i => i.IssueId).Distinct().ToList();
        var issues = await _db.VendorIssues.Find(i => i.AssignedOfficerId == officerId).ToListAsync();
        var riskAssessments = await _db.RiskAssessments.Find(r => r.AssessedById == officerId).ToListAsync();
        var notifications = await _db.Notifications.Find(n => n.UserId == officerId)
            .SortByDescending(n => n.CreatedDate).Limit(10).ToListAsync();

        return new
        {
            myAssignedInvestigations = investigations.Count,
            myOpenCases = issues.Count(i => i.Status != IssueStatus.Resolved && i.Status != IssueStatus.Closed),
            pendingInvestigations = investigations.Count(i => i.Status != InvestigationStatus.Completed),
            pendingResolution = issues.Count(i => i.Status == IssueStatus.Resolution),
            myRiskAssessments = riskAssessments.Count,
            recentNotifications = notifications.Select(n => new { n.Title, n.Message, n.CreatedDate, n.Read }),
            myCaseStatistics = investigations.GroupBy(i => i.Status).Select(g => new { status = g.Key, count = g.Count() })
        };
    }

    private async Task<object> VendorManagerDashboardAsync()
    {
        var issues = await _db.VendorIssues.Find(FilterDefinition<VendorIssue>.Empty).ToListAsync();
        var risks = await _db.RiskAssessments.Find(FilterDefinition<RiskAssessment>.Empty).ToListAsync();

        return new
        {
            vendorIssues = issues.Count,
            openVendorIssues = issues.Count(i => i.Status != IssueStatus.Resolved && i.Status != IssueStatus.Closed),
            vendorRelatedRisks = risks.Count(r => r.RiskLevel is "High" or "Critical"),
            pendingAssignments = issues.Count(i => i.Status == IssueStatus.PendingAssignment),
            recentVendorActivity = issues.OrderByDescending(i => i.CreatedDate).Take(10)
                .Select(i => new { i.IssueNumber, i.Title, i.Vendor, i.Status, i.CreatedDate })
        };
    }

    private async Task<object> ApproverDashboardAsync(string approverId)
    {
        var resolutions = await _db.Resolutions.Find(FilterDefinition<Resolution>.Empty).ToListAsync();
        var pending = resolutions.Where(r => r.Status == ResolutionStatus.PendingApproval).ToList();
        var decided = resolutions.Where(r => r.ApprovalHistory.Any(a => a.ApproverId == approverId)).ToList();

        return new
        {
            pendingApprovals = pending.Count,
            approvedItems = decided.Count(r => r.Status == ResolutionStatus.Resolved),
            rejectedItems = decided.Count(r => r.Status == ResolutionStatus.Rejected),
            recentApprovalActivity = decided.OrderByDescending(r => r.ResolutionDate).Take(10)
                .Select(r => new { r.IssueNumber, r.Status, r.ResolutionDate })
        };
    }

    private async Task<object> EmployeeDashboardAsync(string employeeId)
    {
        var myIssues = await _db.VendorIssues.Find(i => i.CreatedById == employeeId).ToListAsync();
        var notifications = await _db.Notifications.Find(n => n.UserId == employeeId)
            .SortByDescending(n => n.CreatedDate).Limit(10).ToListAsync();

        return new
        {
            myReportedIssues = myIssues.Count,
            openIssues = myIssues.Count(i => i.Status != IssueStatus.Resolved && i.Status != IssueStatus.Closed),
            resolvedIssues = myIssues.Count(i => i.Status is IssueStatus.Resolved or IssueStatus.Closed),
            recentNotifications = notifications.Select(n => new { n.Title, n.Message, n.CreatedDate, n.Read })
        };
    }

    public async Task<object> GetIssueReportAsync()
    {
        var issues = await _db.VendorIssues.Find(FilterDefinition<VendorIssue>.Empty).ToListAsync();
        return new
        {
            byStatus = issues.GroupBy(i => i.Status).Select(g => new { status = g.Key, count = g.Count() }),
            byPriority = issues.GroupBy(i => i.Priority).Select(g => new { priority = g.Key, count = g.Count() }),
            byCategory = issues.GroupBy(i => i.Category).Select(g => new { category = g.Key, count = g.Count() }),
            byVendor = issues.GroupBy(i => i.Vendor).Select(g => new { vendor = g.Key, count = g.Count() }),
            monthlyTrend = issues.GroupBy(i => new { i.CreatedDate.Year, i.CreatedDate.Month })
                .Select(g => new { month = $"{g.Key.Year}-{g.Key.Month:D2}", count = g.Count() })
                .OrderBy(g => g.month)
        };
    }

    public async Task<object> GetInvestigationReportAsync()
    {
        var investigations = await _db.Investigations.Find(FilterDefinition<Investigation>.Empty).ToListAsync();
        return new
        {
            byStatus = investigations.GroupBy(i => i.Status).Select(g => new { status = g.Key, count = g.Count() }),
            byOfficer = investigations.GroupBy(i => i.OfficerName).Select(g => new { officer = g.Key, count = g.Count() })
        };
    }

    public async Task<object> GetRiskReportAsync()
    {
        var risks = await _db.RiskAssessments.Find(FilterDefinition<RiskAssessment>.Empty).ToListAsync();
        return new
        {
            byLevel = risks.GroupBy(r => r.RiskLevel).Select(g => new { level = g.Key, count = g.Count() }),
            distribution = risks.Select(r => new { r.IssueNumber, r.Likelihood, r.Impact, r.RiskScore, r.RiskLevel })
        };
    }

    public async Task<object> GetResolutionReportAsync()
    {
        var resolutions = await _db.Resolutions.Find(FilterDefinition<Resolution>.Empty).ToListAsync();
        return new
        {
            byStatus = resolutions.GroupBy(r => r.Status).Select(g => new { status = g.Key, count = g.Count() }),
            trend = resolutions.Where(r => r.ResolutionDate.HasValue)
                .GroupBy(r => new { r.ResolutionDate!.Value.Year, r.ResolutionDate!.Value.Month })
                .Select(g => new { month = $"{g.Key.Year}-{g.Key.Month:D2}", count = g.Count() })
                .OrderBy(g => g.month)
        };
    }
}
