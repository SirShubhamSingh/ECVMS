using ECMVS.Backend.Helpers;
using ECMVS.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECMVS.Backend.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly NotificationService _notificationService;
    private readonly CurrentUserAccessor _currentUser;

    public NotificationsController(NotificationService notificationService, CurrentUserAccessor currentUser)
    {
        _notificationService = notificationService;
        _currentUser = currentUser;
    }

    // Section 18/27: userId always comes from the JWT, never from the client —
    // this is the only way a user's notifications can be retrieved.
    [HttpGet("me")]
    public async Task<IActionResult> GetMine()
    {
        var notifications = await _notificationService.GetMyNotificationsAsync(_currentUser.UserId, _currentUser.Role);
        var unreadCount = await _notificationService.GetUnreadCountAsync(_currentUser.UserId, _currentUser.Role);
        return Ok(new { notifications, unreadCount });
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkRead(string id)
    {
        var success = await _notificationService.MarkReadAsync(id, _currentUser.UserId);
        if (!success) return NotFound();
        return Ok(new { message = "Notification marked as read." });
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        await _notificationService.MarkAllReadAsync(_currentUser.UserId);
        return Ok(new { message = "All notifications marked as read." });
    }
}
