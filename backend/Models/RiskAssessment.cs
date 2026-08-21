using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ECMVS.Backend.Models;

public class RiskAssessment
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonRepresentation(BsonType.ObjectId)]
    public string IssueId { get; set; } = string.Empty;
    public string IssueNumber { get; set; } = string.Empty;

    public int Likelihood { get; set; } // 1-5
    public int Impact { get; set; }     // 1-5
    public int RiskScore { get; set; }  // Likelihood * Impact
    public string RiskLevel { get; set; } = string.Empty;
    public string Mitigation { get; set; } = string.Empty;

    [BsonRepresentation(BsonType.ObjectId)]
    public string AssessedById { get; set; } = string.Empty;
    public string AssessedByName { get; set; } = string.Empty;

    public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;
    public string Comments { get; set; } = string.Empty;
}
