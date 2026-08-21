using ECMVS.Backend.Models;
using ECMVS.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECMVS.Backend.Controllers;

[ApiController]
[Route("api/audit-logs")]
[Authorize(Roles = Roles.SuperAdministrator)]
public class AuditLogsController : ControllerBase
{
    private readonly AuditLogService _auditLogService;

    public AuditLogsController(AuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? entity, [FromQuery] string? userId,
        [FromQuery] DateTime? from, [FromQuery] DateTime? to) =>
        Ok(await _auditLogService.GetAllAsync(entity, userId, from, to));
}
