using System.Security.Claims;

namespace ECMVS.Backend.Helpers;

public class CurrentUserAccessor
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUserAccessor(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    public string UserId => _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
    public string UserName => _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
    public string Role => _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
    public bool IsAdmin => Role == Models.Roles.SuperAdministrator;
}
