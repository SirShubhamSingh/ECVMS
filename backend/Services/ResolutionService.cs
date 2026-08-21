using ECMVS.Backend.Data;
using ECMVS.Backend.DTOs;
using ECMVS.Backend.Models;
using MongoDB.Driver;

namespace ECMVS.Backend.Services;

public class ResolutionService
{
    private readonly MongoDbContext _db;
    private readonly NotificationService _notificationService;
    private readonly AuditLogService _auditLogService;

    public ResolutionService(MongoDbContext db, NotificationService notificationService, AuditLogService auditLogService)
    {
        _db = db;
        _notificationService = notificationService;
        _auditLogService = auditLogService;
    }

    public async Task<List<Resolution>> GetAllAsync(string? issueId, string? status)
    {
        var filter = Builders<Resolution>.Filter.Empty;
        if (!string.IsNullOrWhiteSpace(issueId))
            filter &= Builders<Resolution>.Filter.Eq(r => r.IssueId, issueId);
        if (!string.IsNullOrWhiteSpace(status))
            filter &= Builders<Resolution>.Filter.Eq(r => r.Status, status);

        return await _db.Resolutions.Find(filter).SortByDescending(r => r.ResolutionDate).ToListAsync();
    }

    public async Task<Resolution?> GetByIdAsync(string id) =>
        await _db.Resolutions.Find(r => r.Id == id).FirstOrDefaultAsync();

    public async Task<Resolution> CreateAsync(CreateResolutionRequest request, string userId, string userName)
    {
        var issue = await _db.VendorIssues.Find(i => i.Id == request.IssueId).FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("Vendor issue not found.");

        var resolution = new Resolution
        {
            IssueId = issue.Id,
            IssueNumber = issue.IssueNumber,
            InvestigationId = request.InvestigationId,
            RootCause = request.RootCause,
            CorrectiveAction = request.CorrectiveAction,
            PreventiveAction = request.PreventiveAction,
            ResolutionDescription = request.ResolutionDescription,
            ResolvedById = userId,
            ResolvedByName = userName,
            Status = ResolutionStatus.Draft,
            Comments = request.Comments,
            RequiresApproval = request.RequiresApproval
        };

        await _db.Resolutions.InsertOneAsync(resolution);

        await _db.VendorIssues.UpdateOneAsync(i => i.Id == issue.Id,
            Builders<VendorIssue>.Update.Set(i => i.Status, IssueStatus.Resolution));

        await _auditLogService.LogAsync(userId, userName, "Resolution created", "Resolution", resolution.Id,
            $"Draft resolution created for {issue.IssueNumber}");

        return resolution;
    }

    public async Task<bool> UpdateAsync(string id, UpdateResolutionRequest request, string userId, string userName)
    {
        var update = Builders<Resolution>.Update
            .Set(r => r.RootCause, request.RootCause)
            .Set(r => r.CorrectiveAction, request.CorrectiveAction)
            .Set(r => r.PreventiveAction, request.PreventiveAction)
            .Set(r => r.ResolutionDescription, request.ResolutionDescription)
            .Set(r => r.Comments, request.Comments);

        var result = await _db.Resolutions.UpdateOneAsync(r => r.Id == id, update);
        if (result.ModifiedCount > 0)
            await _auditLogService.LogAsync(userId, userName, "Resolution updated", "Resolution", id, "Resolution details updated");
        return result.ModifiedCount > 0;
    }

    public async Task<(bool success, string? error)> SubmitForApprovalAsync(string id, string userId, string userName)
    {
        var resolution = await GetByIdAsync(id);
        if (resolution is null) return (false, "Resolution not found.");

        var nextStatus = resolution.RequiresApproval ? ResolutionStatus.PendingApproval : ResolutionStatus.Resolved;

        var update = Builders<Resolution>.Update.Set(r => r.Status, nextStatus);
        if (!resolution.RequiresApproval)
            update = update.Set(r => r.ResolutionDate, DateTime.UtcNow);

        await _db.Resolutions.UpdateOneAsync(r => r.Id == id, update);
        await _auditLogService.LogAsync(userId, userName, "Approval submitted", "Resolution", id,
            $"Resolution for {resolution.IssueNumber} submitted, status: {nextStatus}");

        if (resolution.RequiresApproval)
        {
            var approvers = await _db.Users.Find(u => u.Role == Roles.Approver && u.Active).ToListAsync();
            foreach (var approver in approvers)
                await _notificationService.NotifyAsync(approver.Id, "Approval required",
                    $"Resolution for {resolution.IssueNumber} is awaiting your approval.", "Resolution", id);
        }
        else
        {
            await CloseOutIssueAsync(resolution);
        }

        return (true, null);
    }

    public async Task<(bool success, string? error)> DecideApprovalAsync(string id, ApprovalDecisionRequest request,
        string userId, string userName)
    {
        var resolution = await GetByIdAsync(id);
        if (resolution is null) return (false, "Resolution not found.");
        if (resolution.Status != ResolutionStatus.PendingApproval) return (false, "Resolution is not pending approval.");

        var isApproved = request.Decision == "Approved";
        var record = new ApprovalRecord
        {
            ApproverId = userId,
            ApproverName = userName,
            Decision = request.Decision,
            Reason = request.Reason,
            DecisionDate = DateTime.UtcNow
        };

        var newStatus = isApproved ? ResolutionStatus.Resolved : ResolutionStatus.Rejected;
        var update = Builders<Resolution>.Update
            .Set(r => r.Status, newStatus)
            .Push(r => r.ApprovalHistory, record);
        if (isApproved)
            update = update.Set(r => r.ResolutionDate, DateTime.UtcNow);

        await _db.Resolutions.UpdateOneAsync(r => r.Id == id, update);
        await _auditLogService.LogAsync(userId, userName, isApproved ? "Approval approved" : "Approval rejected",
            "Resolution", id, $"{resolution.IssueNumber}: {request.Decision} — {request.Reason}");

        await _notificationService.NotifyAsync(resolution.ResolvedById,
            isApproved ? "Resolution approved" : "Resolution rejected",
            isApproved
                ? $"Your resolution for {resolution.IssueNumber} was approved."
                : $"Your resolution for {resolution.IssueNumber} was rejected: {request.Reason}",
            "Resolution", id);

        if (isApproved)
            await CloseOutIssueAsync(resolution);

        return (true, null);
    }

    private async Task CloseOutIssueAsync(Resolution resolution)
    {
        var issue = await _db.VendorIssues.Find(i => i.Id == resolution.IssueId).FirstOrDefaultAsync();
        if (issue is null) return;

        await _db.VendorIssues.UpdateOneAsync(i => i.Id == issue.Id,
            Builders<VendorIssue>.Update.Set(i => i.Status, IssueStatus.Resolved));

        await _auditLogService.LogAsync(resolution.ResolvedById, resolution.ResolvedByName, "Case resolved",
            "VendorIssue", issue.Id, $"{issue.IssueNumber} marked as resolved");

        await _notificationService.NotifyAsync(issue.CreatedById, "Case resolved",
            $"Vendor issue {issue.IssueNumber} has been resolved.", "VendorIssue", issue.Id);
    }
}
