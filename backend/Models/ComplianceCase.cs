using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ECMVS.Backend.Models;

public static class ComplianceCaseTypes
{
    public const string Grievance = "Grievance";
    public const string Fraud = "Fraud";
    public const string HealthAndSafety = "Health & Safety";
    public const string ConflictOfInterest = "Conflict of Interest";
    public const string VendorRisk = "Vendor Risk";
    public const string Employee = "Employee";
}

public class ComplianceCase
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    public string CaseNumber { get; set; } = string.Empty;
    public string CaseType { get; set; } = ComplianceCaseTypes.Grievance;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "New";
    public string Severity { get; set; } = "Medium";
    public string Confidentiality { get; set; } = "Restricted";
    public string? Subject { get; set; }
    public string? Location { get; set; }
    public bool AnonymousReporter { get; set; }
    [BsonRepresentation(BsonType.ObjectId)]
    public string? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    [BsonRepresentation(BsonType.ObjectId)]
    public string CreatedById { get; set; } = string.Empty;
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public DateTime? ClosedDate { get; set; }
    public List<string> Tags { get; set; } = new();
}
