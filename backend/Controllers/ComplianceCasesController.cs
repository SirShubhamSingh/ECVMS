using ECMVS.Backend.DTOs;
using ECMVS.Backend.Helpers;
using ECMVS.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECMVS.Backend.Controllers;

[ApiController]
[Route("api/compliance-cases")]
[Authorize]
public class ComplianceCasesController : ControllerBase
{
    private readonly ComplianceCaseService _service;
    private readonly CurrentUserAccessor _currentUser;

    public ComplianceCasesController(ComplianceCaseService service, CurrentUserAccessor currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? type, [FromQuery] string? status, [FromQuery] string? search) =>
        Ok(await _service.ListAsync(type, status, search));

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var item = await _service.GetAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateComplianceCaseRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description))
            return BadRequest(new { message = "Title and description are required." });
        try
        {
            return Ok(await _service.CreateAsync(request, _currentUser.UserId, _currentUser.UserName));
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, UpdateComplianceCaseRequest request)
    {
        try
        {
            return await _service.UpdateAsync(id, request, _currentUser.UserId, _currentUser.UserName)
                ? Ok(new { message = "Case updated." }) : NotFound();
        }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
