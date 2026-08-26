using ECMVS.Backend.Data;
using ECMVS.Backend.DTOs;
using ECMVS.Backend.Helpers;
using ECMVS.Backend.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ECMVS.Backend.Services;

public class VendorIssueService
{
    private readonly MongoDbContext _db;
    private readonly NotificationService _notificationService;
    private readonly AuditLogService _auditLogService;
    private readonly RecordScopeService _scope;

    public VendorIssueService(MongoDbContext db, NotificationService notificationService, AuditLogService auditLogService,
        RecordScopeService scope)
    {
        _db = db;
        _notificationService = notificationService;
        _auditLogService = auditLogService;
        _scope = scope;
    }

    public async Task<List<VendorIssue>> GetAllAsync(string callerId, string callerRole, string? search, string? status, string? priority,
        string? category, string? officerId, DateTime? from, DateTime? to)
    {
        var filter = Builders<VendorIssue>.Filter.Empty;
        var accessibleIds = await _scope.GetAccessibleIssueIdsAsync(callerId, callerRole);
        if (accessibleIds is not null)
            filter &= Builders<VendorIssue>.Filter.In(i => i.Id, accessibleIds);

        if (!string.IsNullOrWhiteSpace(status))
            filter &= Builders<VendorIssue>.Filter.Eq(i => i.Status, status);
        if (!string.IsNullOrWhiteSpace(priority))
            filter &= Builders<VendorIssue>.Filter.Eq(i => i.Priority, priority);
        if (!string.IsNullOrWhiteSpace(category))
            filter &= Builders<VendorIssue>.Filter.Eq(i => i.Category, category);
        if (!string.IsNullOrWhiteSpace(officerId))
            filter &= Builders<VendorIssue>.Filter.Eq(i => i.AssignedOfficerId, officerId);
        if (from.HasValue)
            filter &= Builders<VendorIssue>.Filter.Gte(i => i.CreatedDate, from.Value);
        if (to.HasValue)
            filter &= Builders<VendorIssue>.Filter.Lte(i => i.CreatedDate, to.Value);
        if (!string.IsNullOrWhiteSpace(search))
            filter &= Builders<VendorIssue>.Filter.Or(
                Builders<VendorIssue>.Filter.Regex(i => i.IssueNumber, new BsonRegularExpression(search, "i")),
                Builders<VendorIssue>.Filter.Regex(i => i.Title, new BsonRegularExpression(search, "i")),
                Builders<VendorIssue>.Filter.Regex(i => i.Vendor, new BsonRegularExpression(search, "i")),
                Builders<VendorIssue>.Filter.Regex(i => i.Category, new BsonRegularExpression(search, "i")));

        return await _db.VendorIssues.Find(filter).SortByDescending(i => i.CreatedDate).ToListAsync();
    }

    public async Task<VendorIssue?> GetByIdAsync(string id, string callerId, string callerRole)
    {
        if (!await _scope.CanAccessIssueAsync(id, callerId, callerRole)) return null;
        return await _db.VendorIssues.Find(i => i.Id == id).FirstOrDefaultAsync();
    }

    // private async Task<string> NextIssueNumberAsync()
    // {
    //     var year = DateTime.UtcNow.Year;
    //     var prefix = $"VI-{year}-";
    //     var count = await _db.VendorIssues.CountDocumentsAsync(
    //         Builders<VendorIssue>.Filter.Regex(i => i.IssueNumber, new BsonRegularExpression("^" + prefix)));
    //     return IssueNumberGenerator.Generate((int)count + 1, year);
    // }
private async Task<string> NextIssueNumberAsync()
{
    var year = DateTime.UtcNow.Year;
    var prefix = $"VI-{year}-";

    var lastIssue = await _db.VendorIssues
        .Find(Builders<VendorIssue>.Filter.Regex(
            i => i.IssueNumber,
            new BsonRegularExpression("^" + prefix)
        ))
        .SortByDescending(i => i.IssueNumber)
        .FirstOrDefaultAsync();

    var nextNumber = 1;

    if (lastIssue != null && !string.IsNullOrWhiteSpace(lastIssue.IssueNumber))
    {
        var numberPart = lastIssue.IssueNumber.Substring(prefix.Length);

        if (int.TryParse(numberPart, out var lastNumber))
        {
            nextNumber = lastNumber + 1;
        }
    }

    return IssueNumberGenerator.Generate(nextNumber, year);
}
    public async Task<VendorIssue> CreateAsync(CreateVendorIssueRequest request, string createdById, string createdByName, string callerRole)
    {
        User? officer = null;
        if (callerRole != Roles.Employee && !string.IsNullOrWhiteSpace(request.AssignedOfficerId))
            officer = await _db.Users.Find(u => u.Id == request.AssignedOfficerId).FirstOrDefaultAsync();

        var issue = new VendorIssue
        {
            IssueNumber = await NextIssueNumberAsync(),
            Title = request.Title,
            Vendor = request.Vendor,
            Category = request.Category,
            Priority = request.Priority,
            Status = officer is null ? IssueStatus.PendingAssignment : IssueStatus.Open,
            AssignedOfficerId = officer?.Id,
            AssignedOfficerName = officer?.Name,
            CreatedById = createdById,
            CreatedByName = createdByName,
            CreatedDate = DateTime.UtcNow,
            DueDate = request.DueDate,
            Description = request.Description
        };

        await _db.VendorIssues.InsertOneAsync(issue);
        await _auditLogService.LogAsync(createdById, createdByName, "Issue created", "VendorIssue", issue.Id,
            $"Created issue {issue.IssueNumber}: {issue.Title}");

        if (officer is not null)
        {
            await _notificationService.NotifyAsync(officer.Id, "New issue assigned",
                $"Vendor issue {issue.IssueNumber} ({issue.Title}) has been assigned to you.", "VendorIssue", issue.Id);
            await _auditLogService.LogAsync(createdById, createdByName, "Issue assigned", "VendorIssue", issue.Id,
                $"Assigned {issue.IssueNumber} to {officer.Name}");
        }

        return issue;
    }

    public async Task<bool> UpdateAsync(string id, UpdateVendorIssueRequest request, string userId, string userName, string callerRole)
    {
        if (!await _scope.CanAccessIssueAsync(id, userId, callerRole)) return false;
        var update = Builders<VendorIssue>.Update
            .Set(i => i.Title, request.Title)
            .Set(i => i.Vendor, request.Vendor)
            .Set(i => i.Category, request.Category)
            .Set(i => i.Priority, request.Priority)
            .Set(i => i.Description, request.Description)
            .Set(i => i.DueDate, request.DueDate);

        var result = await _db.VendorIssues.UpdateOneAsync(i => i.Id == id, update);
        if (result.ModifiedCount > 0)
            await _auditLogService.LogAsync(userId, userName, "Issue updated", "VendorIssue", id, "Issue details updated");
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id, string userId, string userName, string callerRole)
    {
        if (!await _scope.CanAccessIssueAsync(id, userId, callerRole)) return false;
        var result = await _db.VendorIssues.DeleteOneAsync(i => i.Id == id);
        if (result.DeletedCount > 0)
            await _auditLogService.LogAsync(userId, userName, "Issue deleted", "VendorIssue", id, "Issue removed");
        return result.DeletedCount > 0;
    }

    public async Task<bool> AssignOfficerAsync(string id, string officerId, string userId, string userName, string callerRole)
    {
        var officer = await _db.Users.Find(u => u.Id == officerId).FirstOrDefaultAsync();
        if (officer is null) return false;

        var issue = await GetByIdAsync(id, userId, callerRole);
        if (issue is null) return false;

        var newStatus = issue.Status == IssueStatus.PendingAssignment ? IssueStatus.Open : issue.Status;

        var update = Builders<VendorIssue>.Update
            .Set(i => i.AssignedOfficerId, officer.Id)
            .Set(i => i.AssignedOfficerName, officer.Name)
            .Set(i => i.Status, newStatus);

        var result = await _db.VendorIssues.UpdateOneAsync(i => i.Id == id, update);
        if (result.ModifiedCount > 0)
        {
            await _notificationService.NotifyAsync(officer.Id, "New issue assigned",
                $"Vendor issue {issue.IssueNumber} ({issue.Title}) has been assigned to you.", "VendorIssue", id);
            await _auditLogService.LogAsync(userId, userName, "Issue assigned", "VendorIssue", id,
                $"Assigned {issue.IssueNumber} to {officer.Name}");
        }
        return result.ModifiedCount > 0;
    }

    public async Task<(bool success, string? error)> ChangeStatusAsync(string id, string newStatus, string userId, string userName, string callerRole)
    {
        var issue = await GetByIdAsync(id, userId, callerRole);
        if (issue is null) return (false, "Issue not found.");

        if (issue.Status == newStatus) return (true, null);

        if (!IssueStatus.AllowedTransitions.TryGetValue(issue.Status, out var allowed) || !allowed.Contains(newStatus))
            return (false, $"Cannot transition from '{issue.Status}' to '{newStatus}'.");

        var result = await _db.VendorIssues.UpdateOneAsync(i => i.Id == id,
            Builders<VendorIssue>.Update.Set(i => i.Status, newStatus));

        if (result.ModifiedCount > 0)
            await _auditLogService.LogAsync(userId, userName, "Issue status changed", "VendorIssue", id,
                $"{issue.IssueNumber}: {issue.Status} -> {newStatus}");

        return (result.ModifiedCount > 0, null);
    }

    public async Task<bool> AddCommentAsync(string id, string text, string userId, string userName, string callerRole)
    {
        if (!await _scope.CanAccessIssueAsync(id, userId, callerRole)) return false;
        var comment = new IssueComment { UserId = userId, UserName = userName, Text = text, CreatedDate = DateTime.UtcNow };
        var result = await _db.VendorIssues.UpdateOneAsync(i => i.Id == id,
            Builders<VendorIssue>.Update.Push(i => i.Comments, comment));
        return result.ModifiedCount > 0;
    }
}
