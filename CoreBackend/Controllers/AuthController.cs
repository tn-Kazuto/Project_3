using System.Security.Claims;
using CoreBackend.DTOs;
using CoreBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Đăng ký tài khoản Người dùng (Client / User)
    /// Tự động lưu vào bảng Users, UserProfiles, gán role User, tạo UserSessions và AuditLogs
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> RegisterUser([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result.Success) return BadRequest(result);

        if (result.Data != null)
        {
            SetRefreshTokenCookie(result.Data.RefreshToken, result.Data.ExpiresAt);
        }
        return Ok(result);
    }

    /// <summary>
    /// Đăng ký tài khoản Quản trị viên (Admin / Manager)
    /// Yêu cầu Secret Key để xác thực quyền quản trị hệ thống
    /// </summary>
    [HttpPost("admin/register")]
    public async Task<IActionResult> RegisterAdmin([FromBody] AdminRegisterRequest request)
    {
        var result = await _authService.RegisterAdminAsync(request);
        if (!result.Success) return BadRequest(result);

        if (result.Data != null)
        {
            SetRefreshTokenCookie(result.Data.RefreshToken, result.Data.ExpiresAt);
        }
        return Ok(result);
    }

    /// <summary>
    /// Đăng nhập Cổng Người dùng thông thường (Client Portal)
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> LoginUser([FromBody] LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();
        var result = await _authService.LoginAsync(request, ip, userAgent, requireAdminRole: false);
        if (!result.Success) return BadRequest(result);

        if (result.Data != null)
        {
            SetRefreshTokenCookie(result.Data.RefreshToken, result.Data.ExpiresAt);
        }
        return Ok(result);
    }

    /// <summary>
    /// Đăng nhập Cổng Quản trị viên (Admin Portal)
    /// Kiểm tra nghiêm ngặt: Tài khoản bắt buộc phải có Role là Admin hoặc Manager
    /// </summary>
    [HttpPost("admin/login")]
    public async Task<IActionResult> LoginAdmin([FromBody] LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();
        var result = await _authService.LoginAsync(request, ip, userAgent, requireAdminRole: true);
        if (!result.Success) return BadRequest(result);

        if (result.Data != null)
        {
            SetRefreshTokenCookie(result.Data.RefreshToken, result.Data.ExpiresAt);
        }
        return Ok(result);
    }

    /// <summary>
    /// Cấp lại Access Token mới bằng Refresh Token (Token Rotation)
    /// Tự động đọc từ HttpOnly Cookie (nếu duyệt Web) hoặc từ Request Body (nếu Mobile App)
    /// </summary>
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest? request)
    {
        var token = request?.RefreshToken;
        if (string.IsNullOrWhiteSpace(token))
        {
            token = Request.Cookies["refreshToken"];
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(ApiResponse<AuthResponse>.Fail("Vui lòng cung cấp Refresh Token (qua Request Body hoặc HttpOnly Cookie)."));
        }

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();
        var result = await _authService.RefreshTokenAsync(new RefreshTokenRequest { RefreshToken = token }, ip, userAgent);
        if (!result.Success) return BadRequest(result);

        if (result.Data != null)
        {
            SetRefreshTokenCookie(result.Data.RefreshToken, result.Data.ExpiresAt);
        }
        return Ok(result);
    }

    /// <summary>
    /// Đăng xuất / Thu hồi phiên đăng nhập trong bảng UserSessions
    /// </summary>
    [Authorize]
    [HttpPost("revoke-token")]
    public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequest? request)
    {
        var token = request?.RefreshToken ?? Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(token)) return BadRequest(ApiResponse<bool>.Fail("RefreshToken is required."));
        var result = await _authService.RevokeTokenAsync(token);
        Response.Cookies.Delete("refreshToken");
        return Ok(result);
    }

    /// <summary>
    /// Đổi mật khẩu tài khoản
    /// </summary>
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _authService.ChangePasswordAsync(userId, request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    /// <summary>
    /// Xem thông tin hồ sơ tài khoản hiện tại (khớp đầy đủ bảng Users và UserProfiles)
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        var result = await _authService.GetCurrentUserProfileAsync(userId);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

    /// <summary>
    /// Cập nhật thông tin hồ sơ tài khoản cá nhân
    /// </summary>
    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _authService.UpdateCurrentUserProfileAsync(userId, request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    private void SetRefreshTokenCookie(string refreshToken, DateTime expiresAt)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = expiresAt,
            SameSite = SameSiteMode.Lax,
            Secure = Request.IsHttps
        };
        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(claim, out var id) ? id : 0;
    }
}
