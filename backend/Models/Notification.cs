using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ECMVS.Backend.Models;

public class Notification
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool Read { get; set; } = false;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public string RelatedEntity { get; set; } = string.Empty; // e.g. "VendorIssue"
    public string RelatedEntityId { get; set; } = string.Empty;
}
