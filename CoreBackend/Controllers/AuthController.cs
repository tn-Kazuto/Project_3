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

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result.Success) return BadRequest(result);

        if (result.Data != null)
        {
            SetRefreshTokenCookie(result.Data.RefreshToken, result.Data.ExpiresAt);
        }
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();
        var result = await _authService.LoginAsync(request, ip, userAgent);
        if (!result.Success) return BadRequest(result);

        if (result.Data != null)
        {
            SetRefreshTokenCookie(result.Data.RefreshToken, result.Data.ExpiresAt);
        }
        return Ok(result);
    }

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
            return BadRequest(ApiResponse<AuthResponse>.Fail("Refresh token is required (either in body or via HttpOnly cookie)."));
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

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _authService.ChangePasswordAsync(userId, request);
        if (!result.Success) return BadRequest(result);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        var result = await _authService.GetCurrentUserProfileAsync(userId);
        if (!result.Success) return NotFound(result);
        return Ok(result);
    }

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
