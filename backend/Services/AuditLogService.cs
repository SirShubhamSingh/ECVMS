using ECMVS.Backend.Data;
using ECMVS.Backend.Models;
using MongoDB.Driver;

namespace ECMVS.Backend.Services;

public class AuditLogService
{
    private readonly MongoDbContext _db;

    public AuditLogService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task LogAsync(string userId, string userName, string action, string entity, string entityId, string details)
    {
        var log = new AuditLog
        {
            UserId = userId,
            UserName = userName,
            Action = action,
            Entity = entity,
            EntityId = entityId,
            Details = details,
            Timestamp = DateTime.UtcNow
        };
        await _db.AuditLogs.InsertOneAsync(log);
    }

    public async Task<List<AuditLog>> GetAllAsync(string? entity, string? userId, DateTime? from, DateTime? to)
    {
        var filter = Builders<AuditLog>.Filter.Empty;
        if (!string.IsNullOrWhiteSpace(entity))
            filter &= Builders<AuditLog>.Filter.Eq(a => a.Entity, entity);
        if (!string.IsNullOrWhiteSpace(userId))
            filter &= Builders<AuditLog>.Filter.Eq(a => a.UserId, userId);
        if (from.HasValue)
            filter &= Builders<AuditLog>.Filter.Gte(a => a.Timestamp, from.Value);
        if (to.HasValue)
            filter &= Builders<AuditLog>.Filter.Lte(a => a.Timestamp, to.Value);

        return await _db.AuditLogs.Find(filter).SortByDescending(a => a.Timestamp).ToListAsync();
    }
}
