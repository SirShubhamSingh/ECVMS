using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ECMVS.Backend.Models;

public class IssueComment
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}

public class VendorIssue
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public string IssueNumber { get; set; } = string.Empty; // e.g. VI-2026-0012
    public string Title { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = Models.Priority.Medium;
    public string Status { get; set; } = IssueStatus.Open;

    [BsonRepresentation(BsonType.ObjectId)]
    public string? AssignedOfficerId { get; set; }
    public string? AssignedOfficerName { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string CreatedById { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<string> Attachments { get; set; } = new();
    public List<IssueComment> Comments { get; set; } = new();

    // Risk Assessment is only ever applicable to Vendor Issues (this entity),
    // so every record here is eligible; no separate flag is needed.
}
