using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ECMVS.Backend.Models;

public class Investigation
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonRepresentation(BsonType.ObjectId)]
    public string IssueId { get; set; } = string.Empty;
    public string IssueNumber { get; set; } = string.Empty;

    [BsonRepresentation(BsonType.ObjectId)]
    public string OfficerId { get; set; } = string.Empty;
    public string OfficerName { get; set; } = string.Empty;

    public string Status { get; set; } = InvestigationStatus.NotStarted;
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? TargetCompletionDate { get; set; }
    public string Findings { get; set; } = string.Empty;
    public string RootCause { get; set; } = string.Empty;
    public List<string> Evidence { get; set; } = new();
    public string InvestigationNotes { get; set; } = string.Empty;
    public DateTime? CompletedDate { get; set; }
}
