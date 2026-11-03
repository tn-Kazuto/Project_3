using System.Security.Claims;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Authentication controller managing customer registration with subscription payment and login.
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

            var result = await _authService.RegisterAsync(request);
            if (!result.Success)
            {
                if (result.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase) ||
                    result.Message.Contains("already taken", StringComparison.OrdinalIgnoreCase))
                {
                    return Conflict(result);
                }

                return BadRequest(result);
            }

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Authenticates an existing user (Admin or Member) and returns a signed JWT token.
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

            var result = await _authService.LoginAsync(request);
            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
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
    }
}

