using ECMVS.Backend.DTOs;
using ECMVS.Backend.Helpers;
using ECMVS.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECMVS.Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly UserService _userService;
    private readonly CurrentUserAccessor _currentUser;

    public AuthController(AuthService authService, UserService userService, CurrentUserAccessor currentUser)
    {
        _authService = authService;
        _userService = userService;
        _currentUser = currentUser;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (result is null) return Unauthorized(new { message = "Invalid email or password, or account is inactive." });
        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var user = await _userService.GetByIdAsync(_currentUser.UserId);
        if (user is null) return Unauthorized();
        return Ok(AuthService.ToCurrentUserDto(user));
    }
}
