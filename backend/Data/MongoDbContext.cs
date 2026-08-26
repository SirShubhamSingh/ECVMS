using ECMVS.Backend.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace ECMVS.Backend.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var clientSettings = MongoClientSettings.FromConnectionString(settings.Value.ConnectionString);
        clientSettings.ConnectTimeout = TimeSpan.FromSeconds(5);
        clientSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(5);
        var client = new MongoClient(clientSettings);
        _database = client.GetDatabase(settings.Value.DatabaseName);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
    public IMongoCollection<VendorIssue> VendorIssues => _database.GetCollection<VendorIssue>("VendorIssues");
    public IMongoCollection<Investigation> Investigations => _database.GetCollection<Investigation>("Investigations");
    public IMongoCollection<RiskAssessment> RiskAssessments => _database.GetCollection<RiskAssessment>("RiskAssessments");
    public IMongoCollection<Resolution> Resolutions => _database.GetCollection<Resolution>("Resolutions");
    public IMongoCollection<Notification> Notifications => _database.GetCollection<Notification>("Notifications");
    public IMongoCollection<AuditLog> AuditLogs => _database.GetCollection<AuditLog>("AuditLogs");
    public IMongoCollection<ComplianceCase> ComplianceCases => _database.GetCollection<ComplianceCase>("ComplianceCases");
}
