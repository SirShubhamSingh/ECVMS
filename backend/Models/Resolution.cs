using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ECMVS.Backend.Models;

public class ApprovalRecord
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string ApproverId { get; set; } = string.Empty;
    public string ApproverName { get; set; } = string.Empty;
    public string Decision { get; set; } = string.Empty; // Approved / Rejected
    public string Reason { get; set; } = string.Empty;
    public DateTime DecisionDate { get; set; } = DateTime.UtcNow;
}

public class Resolution
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonRepresentation(BsonType.ObjectId)]
    public string IssueId { get; set; } = string.Empty;
    public string IssueNumber { get; set; } = string.Empty;

    [BsonRepresentation(BsonType.ObjectId)]
    public string InvestigationId { get; set; } = string.Empty;

    public string RootCause { get; set; } = string.Empty;
    public string CorrectiveAction { get; set; } = string.Empty;
    public string PreventiveAction { get; set; } = string.Empty;
    public string ResolutionDescription { get; set; } = string.Empty;

    [BsonRepresentation(BsonType.ObjectId)]
    public string ResolvedById { get; set; } = string.Empty;
    public string ResolvedByName { get; set; } = string.Empty;

    public DateTime? ResolutionDate { get; set; }
    public string Status { get; set; } = ResolutionStatus.Draft;
    public string Comments { get; set; } = string.Empty;
    public bool RequiresApproval { get; set; } = true;
    public List<ApprovalRecord> ApprovalHistory { get; set; } = new();
}
