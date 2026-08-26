using ECMVS.Backend.DTOs;
using ECMVS.Backend.Helpers;
using ECMVS.Backend.Models;
using ECMVS.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECMVS.Backend.Controllers;

[ApiController]
[Route("api/risk-assessments")]
[Authorize]
public class RiskAssessmentsController : ControllerBase
{
    private readonly RiskAssessmentService _riskService;
    private readonly CurrentUserAccessor _currentUser;

    public RiskAssessmentsController(RiskAssessmentService riskService, CurrentUserAccessor currentUser)
    {
        _riskService = riskService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? issueId, [FromQuery] string? riskLevel) =>
        Ok(await _riskService.GetAllAsync(_currentUser.UserId, _currentUser.Role, issueId, riskLevel));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var assessment = await _riskService.GetByIdAsync(id, _currentUser.UserId, _currentUser.Role);
        if (assessment is null) return NotFound();
        return Ok(assessment);
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdministrator},{Roles.ComplianceOfficer}")]
    public async Task<IActionResult> Create(CreateRiskAssessmentRequest request)
    {
        var (assessment, error) = await _riskService.CreateAsync(request, _currentUser.UserId, _currentUser.UserName, _currentUser.Role);
        if (assessment is null) return BadRequest(new { message = error });
        return CreatedAtAction(nameof(GetById), new { id = assessment.Id }, assessment);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = $"{Roles.SuperAdministrator},{Roles.ComplianceOfficer}")]
    public async Task<IActionResult> Update(string id, UpdateRiskAssessmentRequest request)
    {
        var success = await _riskService.UpdateAsync(id, request, _currentUser.UserId, _currentUser.UserName, _currentUser.Role);
        if (!success) return NotFound();
        return Ok(new { message = "Risk assessment updated." });
    }
}
