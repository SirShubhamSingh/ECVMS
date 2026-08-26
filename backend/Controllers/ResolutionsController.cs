using ECMVS.Backend.DTOs;
using ECMVS.Backend.Helpers;
using ECMVS.Backend.Models;
using ECMVS.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECMVS.Backend.Controllers;

[ApiController]
[Route("api/resolutions")]
[Authorize]
public class ResolutionsController : ControllerBase
{
    private readonly ResolutionService _resolutionService;
    private readonly CurrentUserAccessor _currentUser;

    public ResolutionsController(ResolutionService resolutionService, CurrentUserAccessor currentUser)
    {
        _resolutionService = resolutionService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? issueId, [FromQuery] string? status) =>
        Ok(await _resolutionService.GetAllAsync(_currentUser.UserId, _currentUser.Role, issueId, status));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var resolution = await _resolutionService.GetByIdAsync(id, _currentUser.UserId, _currentUser.Role);
        if (resolution is null) return NotFound();
        return Ok(resolution);
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdministrator},{Roles.ComplianceOfficer}")]
    public async Task<IActionResult> Create(CreateResolutionRequest request)
    {
        var resolution = await _resolutionService.CreateAsync(request, _currentUser.UserId, _currentUser.UserName, _currentUser.Role);
        return CreatedAtAction(nameof(GetById), new { id = resolution.Id }, resolution);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = $"{Roles.SuperAdministrator},{Roles.ComplianceOfficer}")]
    public async Task<IActionResult> Update(string id, UpdateResolutionRequest request)
    {
        var success = await _resolutionService.UpdateAsync(id, request, _currentUser.UserId, _currentUser.UserName, _currentUser.Role);
        if (!success) return NotFound();
        return Ok(new { message = "Resolution updated." });
    }

    [HttpPut("{id}/submit")]
    [Authorize(Roles = $"{Roles.SuperAdministrator},{Roles.ComplianceOfficer}")]
    public async Task<IActionResult> Submit(string id)
    {
        var (success, error) = await _resolutionService.SubmitForApprovalAsync(id, _currentUser.UserId, _currentUser.UserName, _currentUser.Role);
        if (!success) return NotFound(new { message = error });
        return Ok(new { message = "Resolution submitted." });
    }

    [HttpPut("{id}/decide")]
    [Authorize(Roles = $"{Roles.SuperAdministrator},{Roles.Approver}")]
    public async Task<IActionResult> Decide(string id, ApprovalDecisionRequest request)
    {
        var (success, error) = await _resolutionService.DecideApprovalAsync(id, request, _currentUser.UserId, _currentUser.UserName);
        if (!success) return BadRequest(new { message = error });
        return Ok(new { message = "Decision recorded." });
    }
}
