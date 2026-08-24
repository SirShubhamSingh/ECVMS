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

    public ComplianceCaseService(MongoDbContext db, AuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<List<ComplianceCase>> ListAsync(string? type, string? status, string? search)
    {
        var filter = Builders<ComplianceCase>.Filter.Empty;
        if (!string.IsNullOrWhiteSpace(type)) filter &= Builders<ComplianceCase>.Filter.Eq(c => c.CaseType, type);
        if (!string.IsNullOrWhiteSpace(status)) filter &= Builders<ComplianceCase>.Filter.Eq(c => c.Status, status);
        if (!string.IsNullOrWhiteSpace(search))
            filter &= Builders<ComplianceCase>.Filter.Or(
                Builders<ComplianceCase>.Filter.Regex(c => c.CaseNumber, new BsonRegularExpression(search, "i")),
                Builders<ComplianceCase>.Filter.Regex(c => c.Title, new BsonRegularExpression(search, "i")),
                Builders<ComplianceCase>.Filter.Regex(c => c.Subject, new BsonRegularExpression(search, "i")));
        return await _db.ComplianceCases.Find(filter).SortByDescending(c => c.CreatedDate).ToListAsync();
    }

    public async Task<ComplianceCase?> GetAsync(string id) =>
        await _db.ComplianceCases.Find(c => c.Id == id).FirstOrDefaultAsync();

    public async Task<ComplianceCase> CreateAsync(CreateComplianceCaseRequest request, string userId, string userName)
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
        if (!string.IsNullOrWhiteSpace(request.AssignedToId))
        {
            var assignee = await _db.Users.Find(u => u.Id == request.AssignedToId).FirstOrDefaultAsync();
            item.AssignedToId = assignee?.Id;
            item.AssignedToName = assignee?.Name;
        }
        await _db.ComplianceCases.InsertOneAsync(item);
        await _audit.LogAsync(userId, userName, "Compliance case created", "ComplianceCase", item.Id,
            $"Created {item.CaseType} {item.CaseNumber}");
        return item;
    }

    public async Task<bool> UpdateAsync(string id, UpdateComplianceCaseRequest request, string userId, string userName)
    {
        if (!Statuses.Contains(request.Status)) throw new ArgumentException("Invalid compliance case status.");
        var update = Builders<ComplianceCase>.Update.Set(c => c.Status, request.Status);
        if (!string.IsNullOrWhiteSpace(request.AssignedToId))
        {
            var assignee = await _db.Users.Find(u => u.Id == request.AssignedToId).FirstOrDefaultAsync();
            if (assignee is null) return false;
            update = update.Set(c => c.AssignedToId, assignee.Id).Set(c => c.AssignedToName, assignee.Name);
        }
        if (DateTime.TryParse(request.DueDate, out var dueDate)) update = update.Set(c => c.DueDate, dueDate);
        if (request.Status == "Closed") update = update.Set(c => c.ClosedDate, DateTime.UtcNow);
        var result = await _db.ComplianceCases.UpdateOneAsync(c => c.Id == id, update);
        if (result.ModifiedCount > 0) await _audit.LogAsync(userId, userName, "Compliance case updated", "ComplianceCase", id, $"Status: {request.Status}");
        return result.ModifiedCount > 0;
    }
}
