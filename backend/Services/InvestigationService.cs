using ECMVS.Backend.Data;
using ECMVS.Backend.DTOs;
using ECMVS.Backend.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ECMVS.Backend.Services;

public class InvestigationService
{
    private readonly MongoDbContext _db;
    private readonly NotificationService _notificationService;
    private readonly AuditLogService _auditLogService;

    public InvestigationService(MongoDbContext db, NotificationService notificationService, AuditLogService auditLogService)
    {
        _db = db;
        _notificationService = notificationService;
        _auditLogService = auditLogService;
    }

    /// <summary>
    /// RULE 3 / Section 13: Super Administrator sees all investigations.
    /// Compliance Officer sees ONLY investigations assigned to themselves.
    /// This filter is applied server-side and cannot be bypassed by the client,
    /// including via search — callerRole/callerId always come from the
    /// authenticated JWT claims, never from client-supplied parameters.
    /// </summary>
    public async Task<List<Investigation>> GetAllAsync(string callerId, string callerRole, string? search,
        string? status, string? officerId)
    {
        var filter = Builders<Investigation>.Filter.Empty;

        if (callerRole == Roles.ComplianceOfficer)
        {
            // Hard server-side restriction — overrides any officerId filter supplied by the client.
            filter &= Builders<Investigation>.Filter.Eq(inv => inv.OfficerId, callerId);
        }
        else if (!string.IsNullOrWhiteSpace(officerId))
        {
            filter &= Builders<Investigation>.Filter.Eq(inv => inv.OfficerId, officerId);
        }

        if (!string.IsNullOrWhiteSpace(status))
            filter &= Builders<Investigation>.Filter.Eq(inv => inv.Status, status);

        if (!string.IsNullOrWhiteSpace(search))
            filter &= Builders<Investigation>.Filter.Or(
                Builders<Investigation>.Filter.Regex(inv => inv.IssueNumber, new BsonRegularExpression(search, "i")),
                Builders<Investigation>.Filter.Regex(inv => inv.OfficerName, new BsonRegularExpression(search, "i")));

        return await _db.Investigations.Find(filter).SortByDescending(inv => inv.StartDate).ToListAsync();
    }

    /// <summary>Single-record fetch that also enforces the officer-scoping rule.</summary>
    public async Task<Investigation?> GetByIdForCallerAsync(string id, string callerId, string callerRole)
    {
        var investigation = await _db.Investigations.Find(inv => inv.Id == id).FirstOrDefaultAsync();
        if (investigation is null) return null;

        if (callerRole == Roles.ComplianceOfficer && investigation.OfficerId != callerId)
            return null; // Not authorized to view — treated as not found.

        return investigation;
    }

    public async Task<Investigation> CreateAsync(CreateInvestigationRequest request, string userId, string userName)
    {
        var issue = await _db.VendorIssues.Find(i => i.Id == request.IssueId).FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("Vendor issue not found.");
        var officer = await _db.Users.Find(u => u.Id == request.OfficerId).FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("Officer not found.");

        var investigation = new Investigation
        {
            IssueId = issue.Id,
            IssueNumber = issue.IssueNumber,
            OfficerId = officer.Id,
            OfficerName = officer.Name,
            Status = InvestigationStatus.NotStarted,
            StartDate = DateTime.UtcNow,
            TargetCompletionDate = request.TargetCompletionDate
        };
        await _db.Investigations.InsertOneAsync(investigation);

        await _db.VendorIssues.UpdateOneAsync(i => i.Id == issue.Id,
            Builders<VendorIssue>.Update.Set(i => i.Status, IssueStatus.Investigation)
                .Set(i => i.AssignedOfficerId, officer.Id).Set(i => i.AssignedOfficerName, officer.Name));

        await _notificationService.NotifyAsync(officer.Id, "Investigation assigned",
            $"You have been assigned to investigate {issue.IssueNumber}.", "Investigation", investigation.Id);
        await _auditLogService.LogAsync(userId, userName, "Investigation started", "Investigation", investigation.Id,
            $"Investigation opened for {issue.IssueNumber}, assigned to {officer.Name}");

        return investigation;
    }

    public async Task<(bool success, string? error)> UpdateAsync(string id, UpdateInvestigationRequest request,
        string callerId, string callerRole, string callerName)
    {
        var investigation = await GetByIdForCallerAsync(id, callerId, callerRole);
        if (investigation is null) return (false, "Investigation not found or not authorized.");

        var wasCompleted = investigation.Status == InvestigationStatus.Completed;
        var nowCompleting = request.Status == InvestigationStatus.Completed && !wasCompleted;

        var update = Builders<Investigation>.Update
            .Set(inv => inv.Status, request.Status)
            .Set(inv => inv.Findings, request.Findings)
            .Set(inv => inv.RootCause, request.RootCause)
            .Set(inv => inv.InvestigationNotes, request.InvestigationNotes)
            .Set(inv => inv.TargetCompletionDate, request.TargetCompletionDate ?? investigation.TargetCompletionDate);

        if (request.Evidence is not null)
            update = update.Set(inv => inv.Evidence, request.Evidence);

        if (nowCompleting)
            update = update.Set(inv => inv.CompletedDate, DateTime.UtcNow);

        var result = await _db.Investigations.UpdateOneAsync(inv => inv.Id == id, update);

        if (nowCompleting)
        {
            var issue = await _db.VendorIssues.Find(i => i.Id == investigation.IssueId).FirstOrDefaultAsync();
            if (issue is not null)
            {
                // Vendor issue moves to Risk Assessment (its default eligibility) or Resolution.
                await _db.VendorIssues.UpdateOneAsync(i => i.Id == issue.Id,
                    Builders<VendorIssue>.Update.Set(i => i.Status, IssueStatus.RiskAssessment));

                await _auditLogService.LogAsync(callerId, callerName, "Investigation completed", "Investigation", id,
                    $"Investigation for {issue.IssueNumber} completed by {callerName}");

                if (!string.IsNullOrWhiteSpace(issue.CreatedById))
                    await _notificationService.NotifyAsync(issue.CreatedById, "Investigation completed",
                        $"Investigation for {issue.IssueNumber} has been completed.", "VendorIssue", issue.Id);
            }
        }
        else
        {
            await _auditLogService.LogAsync(callerId, callerName, "Investigation updated", "Investigation", id,
                $"Investigation updated, status: {request.Status}");
        }

        return (result.ModifiedCount > 0, null);
    }
}
