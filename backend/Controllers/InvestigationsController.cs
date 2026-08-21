using ECMVS.Backend.DTOs;
using ECMVS.Backend.Helpers;
using ECMVS.Backend.Models;
using ECMVS.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECMVS.Backend.Controllers;

[ApiController]
[Route("api/investigations")]
[Authorize]
public class InvestigationsController : ControllerBase
{
    private readonly InvestigationService _investigationService;
    private readonly CurrentUserAccessor _currentUser;

    public InvestigationsController(InvestigationService investigationService, CurrentUserAccessor currentUser)
    {
        _investigationService = investigationService;
        _currentUser = currentUser;
    }

    // RULE 3 / Section 13 & 47: results are always scoped server-side by the
    // authenticated caller's id and role — a Compliance Officer can never
    // retrieve another officer's investigations, including via the
    // officerId/search query parameters.
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? status, [FromQuery] string? officerId)
    {
        var investigations = await _investigationService.GetAllAsync(
            _currentUser.UserId, _currentUser.Role, search, status, officerId);
        return Ok(investigations);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var investigation = await _investigationService.GetByIdForCallerAsync(id, _currentUser.UserId, _currentUser.Role);
        if (investigation is null) return NotFound();
        return Ok(investigation);
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdministrator},{Roles.ComplianceOfficer}")]
    public async Task<IActionResult> Create(CreateInvestigationRequest request)
    {
        var investigation = await _investigationService.CreateAsync(request, _currentUser.UserId, _currentUser.UserName);
        return CreatedAtAction(nameof(GetById), new { id = investigation.Id }, investigation);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = $"{Roles.SuperAdministrator},{Roles.ComplianceOfficer}")]
    public async Task<IActionResult> Update(string id, UpdateInvestigationRequest request)
    {
        var (success, error) = await _investigationService.UpdateAsync(
            id, request, _currentUser.UserId, _currentUser.Role, _currentUser.UserName);
        if (!success) return NotFound(new { message = error ?? "Investigation not found or not authorized." });
        return Ok(new { message = "Investigation updated." });
    }
}
