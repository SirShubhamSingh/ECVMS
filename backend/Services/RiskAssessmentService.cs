using ECMVS.Backend.Data;
using ECMVS.Backend.DTOs;
using ECMVS.Backend.Models;
using MongoDB.Driver;

namespace ECMVS.Backend.Services;

public class RiskAssessmentService
{
    private readonly MongoDbContext _db;
    private readonly NotificationService _notificationService;
    private readonly AuditLogService _auditLogService;

    public RiskAssessmentService(MongoDbContext db, NotificationService notificationService, AuditLogService auditLogService)
    {
        _db = db;
        _notificationService = notificationService;
        _auditLogService = auditLogService;
    }

    public async Task<List<RiskAssessment>> GetAllAsync(string? issueId, string? riskLevel)
    {
        var filter = Builders<RiskAssessment>.Filter.Empty;
        if (!string.IsNullOrWhiteSpace(issueId))
            filter &= Builders<RiskAssessment>.Filter.Eq(r => r.IssueId, issueId);
        if (!string.IsNullOrWhiteSpace(riskLevel))
            filter &= Builders<RiskAssessment>.Filter.Eq(r => r.RiskLevel, riskLevel);

        return await _db.RiskAssessments.Find(filter).SortByDescending(r => r.AssessmentDate).ToListAsync();
    }

    public async Task<RiskAssessment?> GetByIdAsync(string id) =>
        await _db.RiskAssessments.Find(r => r.Id == id).FirstOrDefaultAsync();

    public async Task<(RiskAssessment? assessment, string? error)> CreateAsync(CreateRiskAssessmentRequest request,
        string userId, string userName)
    {
        // Business rule: Risk Assessment is only ever applicable to Vendor Issues (Section 15 / RULE 5).
        // Since this collection only ever references VendorIssues, we simply verify the issue exists.
        var issue = await _db.VendorIssues.Find(i => i.Id == request.IssueId).FirstOrDefaultAsync();
        if (issue is null) return (null, "Vendor issue not found. Risk assessment is only available for vendor issues.");

        if (request.Likelihood is < 1 or > 5 || request.Impact is < 1 or > 5)
            return (null, "Likelihood and Impact must each be between 1 and 5.");

        var score = request.Likelihood * request.Impact;

        var assessment = new RiskAssessment
        {
            IssueId = issue.Id,
            IssueNumber = issue.IssueNumber,
            Likelihood = request.Likelihood,
            Impact = request.Impact,
            RiskScore = score,
            RiskLevel = Models.RiskLevel.FromScore(score),
            Mitigation = request.Mitigation,
            AssessedById = userId,
            AssessedByName = userName,
            AssessmentDate = DateTime.UtcNow,
            Comments = request.Comments
        };

        await _db.RiskAssessments.InsertOneAsync(assessment);

        if (issue.Status == IssueStatus.RiskAssessment)
            await _db.VendorIssues.UpdateOneAsync(i => i.Id == issue.Id,
                Builders<VendorIssue>.Update.Set(i => i.Status, IssueStatus.Resolution));

        await _auditLogService.LogAsync(userId, userName, "Risk assessment created", "RiskAssessment", assessment.Id,
            $"Risk assessed for {issue.IssueNumber}: score {score} ({assessment.RiskLevel})");

        if (assessment.RiskLevel is "High" or "Critical" && !string.IsNullOrWhiteSpace(issue.AssignedOfficerId))
            await _notificationService.NotifyAsync(issue.AssignedOfficerId, "High risk assessment recorded",
                $"{issue.IssueNumber} was assessed as {assessment.RiskLevel} risk.", "RiskAssessment", assessment.Id);

        return (assessment, null);
    }

    public async Task<bool> UpdateAsync(string id, UpdateRiskAssessmentRequest request, string userId, string userName)
    {
        var score = request.Likelihood * request.Impact;
        var update = Builders<RiskAssessment>.Update
            .Set(r => r.Likelihood, request.Likelihood)
            .Set(r => r.Impact, request.Impact)
            .Set(r => r.RiskScore, score)
            .Set(r => r.RiskLevel, Models.RiskLevel.FromScore(score))
            .Set(r => r.Mitigation, request.Mitigation)
            .Set(r => r.Comments, request.Comments);

        var result = await _db.RiskAssessments.UpdateOneAsync(r => r.Id == id, update);
        if (result.ModifiedCount > 0)
            await _auditLogService.LogAsync(userId, userName, "Risk assessment updated", "RiskAssessment", id,
                $"Risk assessment updated, new score {score}");
        return result.ModifiedCount > 0;
    }
}
