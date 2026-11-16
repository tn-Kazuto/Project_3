using System.Security.Claims;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Authentication controller managing customer registration with subscription payment, login,
    /// and secure refresh token lifecycle via HttpOnly cookies.
    /// </summary>
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
        /// Registers a new member account with an initial subscription payment ($10/month or $100/year).
        /// Issues a short-lived Access Token and sets an HttpOnly Refresh Token cookie.
        /// </summary>
        /// <param name="request">Registration credentials, plan type, and mock payment details.</param>
        /// <returns>Auth token and created user info.</returns>
        [HttpPost("register")]
        [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<AuthResponseDto>.Fail("Validation failed", errors));
            }

            var result = await _authService.RegisterAsync(request, GetIpAddress());
            if (!result.Success)
            {
                if (result.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase) ||
                    result.Message.Contains("already taken", StringComparison.OrdinalIgnoreCase))
                {
                    return Conflict(result);
                }

                return BadRequest(result);
            }

            if (!string.IsNullOrEmpty(result.Data?.RefreshToken))
            {
                SetRefreshTokenCookie(result.Data.RefreshToken, DateTime.UtcNow.AddDays(7));
            }

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Authenticates an existing user (Admin or Member) and returns a signed JWT token.
        /// Also sets a secure HttpOnly cookie containing the cryptographic Refresh Token.
        /// </summary>
        /// <param name="request">Email/Username and password.</param>
        /// <returns>JWT authentication token.</returns>
        [HttpPost("login")]
        [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<AuthResponseDto>.Fail("Validation failed", errors));
            }

            var result = await _authService.LoginAsync(request, GetIpAddress());
            if (!result.Success)
            {
                return Unauthorized(result);
            }

            if (!string.IsNullOrEmpty(result.Data?.RefreshToken))
            {
                SetRefreshTokenCookie(result.Data.RefreshToken, DateTime.UtcNow.AddDays(7));
            }

            return Ok(result);
        }

        /// <summary>
        /// Renews an expired access token using the HttpOnly refresh token cookie (or optional request body).
        /// Applies Token Rotation: the old refresh token is revoked and a new pair is issued.
        /// </summary>
        [HttpPost("refresh-token")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest? request = null)
        {
            var refreshToken = Request.Cookies["refreshToken"] ?? request?.RefreshToken;
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return BadRequest(ApiResponse<AuthResponseDto>.Fail("Refresh token is required in HttpOnly cookie or request body."));
            }

            var result = await _authService.RefreshTokenAsync(refreshToken, GetIpAddress());
            if (!result.Success)
            {
                Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/api/auth" });
                return Unauthorized(result);
            }

            if (!string.IsNullOrEmpty(result.Data?.RefreshToken))
            {
                SetRefreshTokenCookie(result.Data.RefreshToken, DateTime.UtcNow.AddDays(7));
            }

            return Ok(result);
        }

        /// <summary>
        /// Revokes an active refresh token to immediately cut off access upon suspicious activity or logout.
        /// </summary>
        [HttpPost("revoke-token")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequest? request = null)
        {
            var token = Request.Cookies["refreshToken"] ?? request?.RefreshToken;
            if (string.IsNullOrWhiteSpace(token))
            {
                return BadRequest(ApiResponse<bool>.Fail("Refresh token is required."));
            }

            var result = await _authService.RevokeTokenAsync(token, GetIpAddress());
            Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/api/auth" });

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Logs out the user by revoking the refresh token and clearing the HttpOnly cookie.
        /// </summary>
        [HttpPost("logout")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Logout([FromBody] RevokeTokenRequest? request = null)
        {
            var token = Request.Cookies["refreshToken"] ?? request?.RefreshToken;
            if (!string.IsNullOrWhiteSpace(token))
            {
                await _authService.RevokeTokenAsync(token, GetIpAddress());
            }

            Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/api/auth" });
            return Ok(ApiResponse<bool>.Ok(true, "Logged out and refresh token cleared successfully."));
        }

        /// <summary>
        /// Gets the profile of the currently authenticated user.
        /// </summary>
        /// <returns>User profile and subscription status.</returns>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(ApiResponse<UserDto>.Fail("Invalid user token."));
            }

            var result = await _authService.GetCurrentUserAsync(userId);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        // ── Helper Methods ──

        private void SetRefreshTokenCookie(string token, DateTime expiresAt)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Expires = expiresAt,
                SameSite = SameSiteMode.Lax,
                Secure = Request.IsHttps,
                Path = "/api/auth"
            };
            Response.Cookies.Append("refreshToken", token, cookieOptions);
        }

        private string? GetIpAddress()
        {
            if (Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedHeader))
            {
                var ip = forwardedHeader.FirstOrDefault()?.Split(',').FirstOrDefault()?.Trim();
                if (!string.IsNullOrEmpty(ip)) return ip;
            }
            return HttpContext.Connection.RemoteIpAddress?.ToString();
        }
    }
}
