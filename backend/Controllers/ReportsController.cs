using ECMVS.Backend.Helpers;
using ECMVS.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECMVS.Backend.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly ReportService _reportService;
    private readonly CurrentUserAccessor _currentUser;

    public ReportsController(ReportService reportService, CurrentUserAccessor currentUser)
    {
        _reportService = reportService;
        _currentUser = currentUser;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard() =>
        Ok(await _reportService.GetDashboardAsync(_currentUser.UserId, _currentUser.Role));

    [HttpGet("issues")]
    public async Task<IActionResult> Issues() => Ok(await _reportService.GetIssueReportAsync());

    [HttpGet("investigations")]
    public async Task<IActionResult> Investigations() => Ok(await _reportService.GetInvestigationReportAsync());

    [HttpGet("risk")]
    public async Task<IActionResult> Risk() => Ok(await _reportService.GetRiskReportAsync());

    [HttpGet("resolutions")]
    public async Task<IActionResult> Resolutions() => Ok(await _reportService.GetResolutionReportAsync());
}
