using ECMVS.Backend.DTOs;
using ECMVS.Backend.Helpers;
using ECMVS.Backend.Models;

namespace ECMVS.Backend.Services;

public class AuthService
{
    private readonly UserService _userService;
    private readonly JwtTokenGenerator _tokenGenerator;
    private readonly AuditLogService _auditLogService;

    public AuthService(UserService userService, JwtTokenGenerator tokenGenerator, AuditLogService auditLogService)
    {
        _userService = userService;
        _tokenGenerator = tokenGenerator;
        _auditLogService = auditLogService;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _userService.GetByEmailAsync(request.Email);
        if (user is null || !user.Active) return null;
        if (!PasswordHasher.Verify(request.Password, user.PasswordHash)) return null;

        var token = _tokenGenerator.GenerateToken(user);
        await _auditLogService.LogAsync(user.Id, user.Name, "Login", "User", user.Id, $"{user.Name} logged in.");

        return new LoginResponse
        {
            Token = token,
            User = ToCurrentUserDto(user)
        };
    }

    public static CurrentUserDto ToCurrentUserDto(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role,
        Department = user.Department,
        Active = user.Active
    };
}
