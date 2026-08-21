using ECMVS.Backend.DTOs;
using ECMVS.Backend.Helpers;
using ECMVS.Backend.Models;
using ECMVS.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECMVS.Backend.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly AuditLogService _auditLogService;
    private readonly CurrentUserAccessor _currentUser;

    public UsersController(UserService userService, AuditLogService auditLogService, CurrentUserAccessor currentUser)
    {
        _userService = userService;
        _auditLogService = auditLogService;
        _currentUser = currentUser;
    }

    // Any authenticated user can fetch the list of active compliance officers
    // (used to populate "assign officer" dropdowns).
    [HttpGet("officers")]
    public async Task<IActionResult> GetOfficers() => Ok(await _userService.GetOfficersAsync());

    [HttpGet]
    [Authorize(Roles = Roles.SuperAdministrator)]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? role, [FromQuery] string? department)
    {
        var users = await _userService.GetAllAsync(search, role, department);
        return Ok(users.Select(u => new { u.Id, u.Name, u.Email, u.Role, u.Department, u.Active, u.CreatedDate }));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = Roles.SuperAdministrator)]
    public async Task<IActionResult> GetById(string id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user is null) return NotFound();
        return Ok(new { user.Id, user.Name, user.Email, user.Role, user.Department, user.Active, user.CreatedDate });
    }

    [HttpPost]
    [Authorize(Roles = Roles.SuperAdministrator)]
    public async Task<IActionResult> Create(CreateUserRequest request)
    {
        var existing = await _userService.GetByEmailAsync(request.Email);
        if (existing is not null) return Conflict(new { message = "A user with this email already exists." });

        var user = await _userService.CreateAsync(request);
        await _auditLogService.LogAsync(_currentUser.UserId, _currentUser.UserName, "User created", "User", user.Id,
            $"Created user {user.Name} ({user.Role})");
        return Ok(new { user.Id, user.Name, user.Email, user.Role, user.Department, user.Active });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Roles.SuperAdministrator)]
    public async Task<IActionResult> Update(string id, UpdateUserRequest request)
    {
        var success = await _userService.UpdateAsync(id, request);
        if (!success) return NotFound();
        await _auditLogService.LogAsync(_currentUser.UserId, _currentUser.UserName, "User updated", "User", id,
            $"Updated user {request.Name}");
        return Ok(new { message = "User updated." });
    }

    [HttpPut("{id}/active")]
    [Authorize(Roles = Roles.SuperAdministrator)]
    public async Task<IActionResult> SetActive(string id, [FromBody] bool active)
    {
        var success = await _userService.SetActiveAsync(id, active);
        if (!success) return NotFound();
        await _auditLogService.LogAsync(_currentUser.UserId, _currentUser.UserName,
            active ? "User activated" : "User deactivated", "User", id, string.Empty);
        return Ok(new { message = "User status updated." });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.SuperAdministrator)]
    public async Task<IActionResult> Delete(string id)
    {
        var success = await _userService.DeleteAsync(id);
        if (!success) return NotFound();
        await _auditLogService.LogAsync(_currentUser.UserId, _currentUser.UserName, "User deleted", "User", id, string.Empty);
        return Ok(new { message = "User deleted." });
    }
}
