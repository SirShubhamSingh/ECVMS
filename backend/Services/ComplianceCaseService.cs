using ECMVS.Backend.Data;
using ECMVS.Backend.DTOs;
using ECMVS.Backend.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ECMVS.Backend.Services;

public class ComplianceCaseService
{
    private static readonly string[] CaseTypes =
    {
        ComplianceCaseTypes.Grievance, ComplianceCaseTypes.Fraud, ComplianceCaseTypes.HealthAndSafety,
        ComplianceCaseTypes.ConflictOfInterest, ComplianceCaseTypes.VendorRisk, ComplianceCaseTypes.Employee
    };
    private static readonly string[] Statuses = { "New", "Under Review", "Investigation", "Action Required", "Closed" };
    private static readonly string[] Severities = { "Low", "Medium", "High", "Critical" };
    private readonly MongoDbContext _db;
    private readonly AuditLogService _audit;
    private readonly NotificationService _notificationService;
    private readonly RecordScopeService _scope;

    public ComplianceCaseService(MongoDbContext db, AuditLogService audit, NotificationService notificationService,
        RecordScopeService scope)
    {
        _db = db;
        _audit = audit;
        _notificationService = notificationService;
        _scope = scope;
    }

    public async Task<List<ComplianceCase>> ListAsync(string callerId, string callerRole, string? type, string? status, string? search)
    {
        var filter = Builders<ComplianceCase>.Filter.Empty;
        if (callerRole == Roles.Employee)
            filter &= Builders<ComplianceCase>.Filter.Eq(c => c.CreatedById, callerId);
        else if (callerRole == Roles.ComplianceOfficer)
            filter &= Builders<ComplianceCase>.Filter.Eq(c => c.AssignedToId, callerId);
        else if (callerRole != Roles.SuperAdministrator)
            return new List<ComplianceCase>();
        if (!string.IsNullOrWhiteSpace(type)) filter &= Builders<ComplianceCase>.Filter.Eq(c => c.CaseType, type);
        if (!string.IsNullOrWhiteSpace(status)) filter &= Builders<ComplianceCase>.Filter.Eq(c => c.Status, status);
        if (!string.IsNullOrWhiteSpace(search))
            filter &= Builders<ComplianceCase>.Filter.Or(
                Builders<ComplianceCase>.Filter.Regex(c => c.CaseNumber, new BsonRegularExpression(search, "i")),
                Builders<ComplianceCase>.Filter.Regex(c => c.Title, new BsonRegularExpression(search, "i")),
                Builders<ComplianceCase>.Filter.Regex(c => c.Subject, new BsonRegularExpression(search, "i")));
        return await _db.ComplianceCases.Find(filter).SortByDescending(c => c.CreatedDate).ToListAsync();
    }

    public async Task<ComplianceCase?> GetAsync(string id, string callerId, string callerRole)
    {
        var item = await _db.ComplianceCases.Find(c => c.Id == id).FirstOrDefaultAsync();
        return item is not null && await _scope.CanAccessCaseAsync(item, callerId, callerRole) ? item : null;
    }

    public async Task<ComplianceCase> CreateAsync(CreateComplianceCaseRequest request, string userId, string userName, string callerRole)
    {
        if (!CaseTypes.Contains(request.CaseType) || !Severities.Contains(request.Severity))
            throw new ArgumentException("Invalid compliance case type or severity.");
        var year = DateTime.UtcNow.Year;
        var count = await _db.ComplianceCases.CountDocumentsAsync(Builders<ComplianceCase>.Filter.Regex(
            c => c.CaseNumber, new BsonRegularExpression($"^CC-{year}-")));
        var item = new ComplianceCase
        {
            CaseNumber = $"CC-{year}-{count + 1:0000}", CaseType = request.CaseType, Title = request.Title.Trim(),
            Description = request.Description.Trim(), Severity = request.Severity, Confidentiality = request.Confidentiality,
            Subject = request.Subject, Location = request.Location, AnonymousReporter = request.AnonymousReporter,
            CreatedById = userId, CreatedByName = userName, DueDate = request.DueDate, Tags = request.Tags ?? new()
        };
        if (callerRole == Roles.SuperAdministrator && !string.IsNullOrWhiteSpace(request.AssignedToId))
        {
            var assignee = await _db.Users.Find(u => u.Id == request.AssignedToId
                && u.Role == Roles.ComplianceOfficer && u.Active).FirstOrDefaultAsync();
            item.AssignedToId = assignee?.Id;
            item.AssignedToName = assignee?.Name;
        }
        await _db.ComplianceCases.InsertOneAsync(item);
        var administrator = await _db.Users.Find(u => u.Role == Roles.SuperAdministrator && u.Active)
            .FirstOrDefaultAsync();
        if (administrator is not null)
            await _notificationService.NotifyAsync(administrator.Id, "New compliance case submitted",
                $"Compliance case {item.CaseNumber} ({item.Title}) requires review.", "ComplianceCase", item.Id);
        await _audit.LogAsync(userId, userName, "Compliance case created", "ComplianceCase", item.Id,
            $"Created {item.CaseType} {item.CaseNumber}");
        return item;
    }

    public async Task<bool> UpdateAsync(string id, UpdateComplianceCaseRequest request, string userId, string userName, string callerRole)
    {
        if (callerRole != Roles.SuperAdministrator) return false;
        var item = await GetAsync(id, userId, callerRole);
        if (item is null) return false;
        if (!Statuses.Contains(request.Status)) throw new ArgumentException("Invalid compliance case status.");
        var update = Builders<ComplianceCase>.Update.Set(c => c.Status, request.Status);
        if (!string.IsNullOrWhiteSpace(request.AssignedToId))
        {
            var assignee = await _db.Users.Find(u => u.Id == request.AssignedToId
                && u.Role == Roles.ComplianceOfficer && u.Active).FirstOrDefaultAsync();
            if (assignee is null) return false;
            update = update.Set(c => c.AssignedToId, assignee.Id).Set(c => c.AssignedToName, assignee.Name);
        }
        if (DateTime.TryParse(request.DueDate, out var dueDate)) update = update.Set(c => c.DueDate, dueDate);
        if (request.Status == "Closed") update = update.Set(c => c.ClosedDate, DateTime.UtcNow);
        var result = await _db.ComplianceCases.UpdateOneAsync(c => c.Id == id, update);
        if (result.ModifiedCount > 0)
        {
            if (!string.IsNullOrWhiteSpace(request.AssignedToId) && item.AssignedToId != request.AssignedToId)
            {
                var assignee = await _db.Users.Find(u => u.Id == request.AssignedToId).FirstOrDefaultAsync();
                if (assignee is not null)
                    await _notificationService.NotifyAsync(assignee.Id, "Compliance case assigned",
                        $"Compliance case {item.CaseNumber} ({item.Title}) has been assigned to you.", "ComplianceCase", item.Id);
            }
            await _audit.LogAsync(userId, userName, "Compliance case updated", "ComplianceCase", id, $"Status: {request.Status}");
        }
        return result.ModifiedCount > 0;
    }

    public async Task<bool> AssignAsync(string id, string officerId, string userId, string userName, string callerRole)
    {
        if (callerRole != Roles.SuperAdministrator) return false;

        var officer = await _db.Users.Find(u => u.Id == officerId && u.Role == Roles.ComplianceOfficer && u.Active)
            .FirstOrDefaultAsync();
        if (officer is null) return false;

        var item = await _db.ComplianceCases.Find(c => c.Id == id).FirstOrDefaultAsync();
        if (item is null) return false;

        var result = await _db.ComplianceCases.UpdateOneAsync(c => c.Id == id,
            Builders<ComplianceCase>.Update.Set(c => c.AssignedToId, officer.Id)
                .Set(c => c.AssignedToName, officer.Name)
                .Set(c => c.Status, "Under Review"));
        if (result.ModifiedCount == 0) return false;

        if (item.AssignedToId != officer.Id)
            await _notificationService.NotifyAsync(officer.Id, "Compliance case assigned",
                $"Compliance case {item.CaseNumber} ({item.Title}) has been assigned to you.", "ComplianceCase", item.Id);

        await _audit.LogAsync(userId, userName, "Compliance case assigned", "ComplianceCase", id,
            $"Assigned {item.CaseNumber} to {officer.Name}");
        return true;
    }
}
