using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ECMVS.Backend.Models;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // SHA-256 hex digest. Demo/local-dev auth only — see README.
    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = Roles.Employee;
    public string Department { get; set; } = string.Empty;
    public bool Active { get; set; } = true;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
}
