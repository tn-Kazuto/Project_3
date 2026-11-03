using System.Security.Claims;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Cooking tips controller managing culinary advice, content gatekeeping, and member authoring.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class TipsController : ControllerBase
    {
        private readonly ITipService _tipService;

        public TipsController(ITipService tipService)
        {
            _tipService = tipService;
        }

        private (int? UserId, string? Role) GetCurrentUser()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            int? userId = int.TryParse(idClaim, out var id) ? id : null;
            return (userId, roleClaim);
        }

        /// <summary>
        /// Retrieves tips with keyword search.
        /// Content Gatekeeping: Unauthenticated guests only receive free tips (IsFree == true).
        /// Registered members and Admins receive all tips.
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<TipDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var (userId, role) = GetCurrentUser();
            var result = await _tipService.GetAllAsync(search, userId, role);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves a tip by ID.
        /// Content Gatekeeping: Returns 403 Forbidden if tip is premium and user is a guest.
        /// </summary>
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<TipDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var (userId, role) = GetCurrentUser();
            var result = await _tipService.GetByIdAsync(id, userId, role);

            if (!result.Success)
            {
                if (result.Message.Contains("MEMBERS_ONLY", StringComparison.OrdinalIgnoreCase) ||
                    result.Message.Contains("SUBSCRIPTION_EXPIRED", StringComparison.OrdinalIgnoreCase))
                {
                    return StatusCode(StatusCodes.Status403Forbidden, result);
                }
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Retrieves all tips authored by the logged-in user.
        /// </summary>
        [HttpGet("my-tips")]
        [Authorize(Roles = "MEMBER,ADMIN")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<TipDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetMyTips()
        {
            var (userId, _) = GetCurrentUser();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<IEnumerable<TipDto>>.Fail("Unauthorized access."));
            }

            var result = await _tipService.GetMyTipsAsync(userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Publishes a new tip. Requires Member or Admin role.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "MEMBER,ADMIN")]
        [ProducesResponseType(typeof(ApiResponse<TipDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Create([FromBody] CreateTipRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<TipDto>.Fail("Validation failed", errors));
            }

            var (userId, role) = GetCurrentUser();
            if (userId == null || role == null)
            {
                return Unauthorized(ApiResponse<TipDto>.Fail("Unauthorized access."));
            }

            var result = await _tipService.CreateAsync(request, userId.Value, role);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Updates an existing cooking tip.
        /// Ownership Authorization: Only the author can update their own tip.
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "MEMBER,ADMIN")]
        [ProducesResponseType(typeof(ApiResponse<TipDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTipRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<TipDto>.Fail("Validation failed", errors));
            }

            var (userId, role) = GetCurrentUser();
            if (userId == null || role == null)
            {
                return Unauthorized(ApiResponse<TipDto>.Fail("Unauthorized access."));
            }

            var result = await _tipService.UpdateAsync(id, request, userId.Value, role);
            if (!result.Success)
            {
                if (result.Message.Contains("FORBIDDEN", StringComparison.OrdinalIgnoreCase))
                {
                    return StatusCode(StatusCodes.Status403Forbidden, result);
                }
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Deletes an existing cooking tip.
        /// Ownership Authorization: Only the author can delete their own tip.
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "MEMBER,ADMIN")]
        [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var (userId, role) = GetCurrentUser();
            if (userId == null || role == null)
            {
                return Unauthorized(ApiResponse.Fail("Unauthorized access."));
            }

            var result = await _tipService.DeleteAsync(id, userId.Value, role);
            if (!result.Success)
            {
                if (result.Message.Contains("FORBIDDEN", StringComparison.OrdinalIgnoreCase))
                {
                    return StatusCode(StatusCodes.Status403Forbidden, result);
                }
                return NotFound(result);
            }

            return Ok(result);
        }
    }
}

