using ECMVS.Backend.Data;
using ECMVS.Backend.Models;
using MongoDB.Driver;

namespace ECMVS.Backend.Services;

public class NotificationService
{
    private readonly MongoDbContext _db;
    private readonly RecordScopeService _scope;

    public NotificationService(MongoDbContext db, RecordScopeService scope)
    {
        _db = db;
        _scope = scope;
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
    public async Task<List<Notification>> GetMyNotificationsAsync(string userId, string callerRole)
    {
        var notifications = await _db.Notifications.Find(n => n.UserId == userId)
            .SortByDescending(n => n.CreatedDate)
            .ToListAsync();
        if (callerRole is Roles.SuperAdministrator or Roles.VendorManager or Roles.Approver)
            return notifications;

        var visible = new List<Notification>();
        foreach (var notification in notifications)
        {
            var canAccess = notification.RelatedEntity switch
            {
                "ComplianceCase" => await CanAccessComplianceCaseAsync(notification.RelatedEntityId, userId, callerRole),
                "VendorIssue" => await _scope.CanAccessIssueAsync(notification.RelatedEntityId, userId, callerRole),
                "Investigation" => await CanAccessInvestigationAsync(notification.RelatedEntityId, userId, callerRole),
                "RiskAssessment" => await CanAccessRiskAssessmentAsync(notification.RelatedEntityId, userId, callerRole),
                "Resolution" => await CanAccessResolutionAsync(notification.RelatedEntityId, userId, callerRole),
                _ => true
            };
            if (canAccess) visible.Add(notification);
        }
        return visible;
    }

    public async Task<int> GetUnreadCountAsync(string userId, string callerRole)
    {
        return (await GetMyNotificationsAsync(userId, callerRole)).Count(n => !n.Read);
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

    private async Task<bool> CanAccessComplianceCaseAsync(string id, string userId, string role)
    {
        var item = await _db.ComplianceCases.Find(c => c.Id == id).FirstOrDefaultAsync();
        return item is not null && await _scope.CanAccessCaseAsync(item, userId, role);
    }

    private async Task<bool> CanAccessInvestigationAsync(string id, string userId, string role)
    {
        var item = await _db.Investigations.Find(i => i.Id == id).FirstOrDefaultAsync();
        return item is not null && await _scope.CanAccessInvestigationAsync(item, userId, role);
    }

    private async Task<bool> CanAccessRiskAssessmentAsync(string id, string userId, string role)
    {
        var item = await _db.RiskAssessments.Find(r => r.Id == id).FirstOrDefaultAsync();
        return item is not null && await _scope.CanAccessIssueAsync(item.IssueId, userId, role);
    }

    private async Task<bool> CanAccessResolutionAsync(string id, string userId, string role)
    {
        var item = await _db.Resolutions.Find(r => r.Id == id).FirstOrDefaultAsync();
        return item is not null && await _scope.CanAccessIssueAsync(item.IssueId, userId, role);
    }
}
