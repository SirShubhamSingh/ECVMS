using ECMVS.Backend.Data;
using ECMVS.Backend.Models;
using MongoDB.Driver;

namespace ECMVS.Backend.Services;

public class NotificationService
{
    private readonly MongoDbContext _db;

    public NotificationService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task NotifyAsync(string userId, string title, string message, string relatedEntity, string relatedEntityId)
    {
        if (string.IsNullOrWhiteSpace(userId)) return;

        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            RelatedEntity = relatedEntity,
            RelatedEntityId = relatedEntityId,
            Read = false,
            CreatedDate = DateTime.UtcNow
        };
        await _db.Notifications.InsertOneAsync(notification);
    }

    // Always scoped to the authenticated caller's own user id — never accepts
    // an arbitrary userId from the client. See RULE 4 / section 18 & 27.
    public async Task<List<Notification>> GetMyNotificationsAsync(string userId)
    {
        return await _db.Notifications.Find(n => n.UserId == userId)
            .SortByDescending(n => n.CreatedDate)
            .ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(string userId)
    {
        return (int)await _db.Notifications.CountDocumentsAsync(n => n.UserId == userId && !n.Read);
    }

    public async Task<bool> MarkReadAsync(string notificationId, string userId)
    {
        var result = await _db.Notifications.UpdateOneAsync(
            n => n.Id == notificationId && n.UserId == userId,
            Builders<Notification>.Update.Set(n => n.Read, true));
        return result.ModifiedCount > 0;
    }

    public async Task MarkAllReadAsync(string userId)
    {
        await _db.Notifications.UpdateManyAsync(
            n => n.UserId == userId && !n.Read,
            Builders<Notification>.Update.Set(n => n.Read, true));
    }
}
