using ECMVS.Backend.DTOs;
using ECMVS.Backend.Helpers;
using ECMVS.Backend.Models;
using ECMVS.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECMVS.Backend.Controllers;

[ApiController]
[Route("api/vendor-issues")]
[Authorize]
public class VendorIssuesController : ControllerBase
{
    private readonly VendorIssueService _issueService;
    private readonly CurrentUserAccessor _currentUser;

    public VendorIssuesController(VendorIssueService issueService, CurrentUserAccessor currentUser)
    {
        _issueService = issueService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? status,
        [FromQuery] string? priority, [FromQuery] string? category, [FromQuery] string? officerId,
        [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var issues = await _issueService.GetAllAsync(search, status, priority, category, officerId, from, to);
        return Ok(issues);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var issue = await _issueService.GetByIdAsync(id);
        if (issue is null) return NotFound();
        return Ok(issue);
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdministrator},{Roles.VendorManager},{Roles.Employee},{Roles.ComplianceOfficer}")]
    public async Task<IActionResult> Create(CreateVendorIssueRequest request)
    {
        var issue = await _issueService.CreateAsync(request, _currentUser.UserId, _currentUser.UserName);
        return CreatedAtAction(nameof(GetById), new { id = issue.Id }, issue);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = $"{Roles.SuperAdministrator},{Roles.VendorManager},{Roles.ComplianceOfficer}")]
    public async Task<IActionResult> Update(string id, UpdateVendorIssueRequest request)
    {
        var success = await _issueService.UpdateAsync(id, request, _currentUser.UserId, _currentUser.UserName);
        if (!success) return NotFound();
        return Ok(new { message = "Issue updated." });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.SuperAdministrator)]
    public async Task<IActionResult> Delete(string id)
    {
        var success = await _issueService.DeleteAsync(id, _currentUser.UserId, _currentUser.UserName);
        if (!success) return NotFound();
        return Ok(new { message = "Issue deleted." });
    }

    [HttpPut("{id}/assign")]
    [Authorize(Roles = $"{Roles.SuperAdministrator},{Roles.VendorManager}")]
    public async Task<IActionResult> AssignOfficer(string id, AssignOfficerRequest request)
    {
        var success = await _issueService.AssignOfficerAsync(id, request.OfficerId, _currentUser.UserId, _currentUser.UserName);
        if (!success) return NotFound();
        return Ok(new { message = "Officer assigned." });
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = $"{Roles.SuperAdministrator},{Roles.VendorManager},{Roles.ComplianceOfficer}")]
    public async Task<IActionResult> ChangeStatus(string id, ChangeStatusRequest request)
    {
        var (success, error) = await _issueService.ChangeStatusAsync(id, request.Status, _currentUser.UserId, _currentUser.UserName);
        if (!success) return BadRequest(new { message = error ?? "Issue not found." });
        return Ok(new { message = "Status updated." });
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(string id, AddCommentRequest request)
    {
        var success = await _issueService.AddCommentAsync(id, request.Text, _currentUser.UserId, _currentUser.UserName);
        if (!success) return NotFound();
        return Ok(new { message = "Comment added." });
    }
}
