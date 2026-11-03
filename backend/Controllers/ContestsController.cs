using System.Security.Claims;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Contests controller managing culinary competitions, entry submissions (Guest & Member), and winner declarations.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ContestsController : ControllerBase
    {
        private readonly IContestService _contestService;

        public ContestsController(IContestService contestService)
        {
            _contestService = contestService;
        }

        private int? GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : null;
        }

        /// <summary>
        /// Retrieves all contests with optional active-only filter.
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<ContestDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll([FromQuery] bool? activeOnly)
        {
            var result = await _contestService.GetAllAsync(activeOnly);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves contest details by ID.
        /// </summary>
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<ContestDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _contestService.GetByIdAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Creates a new contest. Restricted to Admin (Chef James Thew).
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        [ProducesResponseType(typeof(ApiResponse<ContestDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Create([FromBody] CreateContestRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<ContestDto>.Fail("Validation failed", errors));
            }

            var adminId = GetCurrentUserId();
            if (adminId == null)
            {
                return Unauthorized(ApiResponse<ContestDto>.Fail("Unauthorized access."));
            }

            var result = await _contestService.CreateAsync(request, adminId.Value);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Deletes a contest. Restricted to Admin.
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _contestService.DeleteAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Submits an entry to a contest.
        /// Per SRS: Accessible to BOTH registered members AND unauthenticated guests.
        /// </summary>
        [HttpPost("{id:int}/entries")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<ContestEntryDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> SubmitEntry(int id, [FromBody] SubmitEntryRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<ContestEntryDto>.Fail("Validation failed", errors));
            }

            var currentUserId = GetCurrentUserId();
            var result = await _contestService.SubmitEntryAsync(id, request, currentUserId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Retrieves all submissions for a contest. Restricted to Admin.
        /// </summary>
        [HttpGet("{id:int}/entries")]
        [Authorize(Roles = "ADMIN")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<ContestEntryDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetEntries(int id, [FromQuery] bool? orderByVotes)
        {
            var userId = GetCurrentUserId();
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var result = await _contestService.GetEntriesByContestAsync(id, userId, clientIp, orderByVotes);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Retrieves contest submissions for public community viewing and voting.
        /// Open to both general visitors and registered members.
        /// </summary>
        [HttpGet("{id:int}/community-entries")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<ContestEntryDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCommunityEntries(int id, [FromQuery] bool? orderByVotes)
        {
            var userId = GetCurrentUserId();
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var result = await _contestService.GetEntriesByContestAsync(id, userId, clientIp, orderByVotes);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Casts a community vote for a contest entry.
        /// Supported for both authenticated members (1 vote per user) and unauthenticated guests (1 vote per email/IP).
        /// </summary>
        [HttpPost("entries/{entryId:int}/vote")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<ContestVoteResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> VoteEntry(int entryId, [FromBody] VoteContestEntryRequest? request)
        {
            var userId = GetCurrentUserId();
            var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var result = await _contestService.VoteEntryAsync(entryId, request ?? new VoteContestEntryRequest(), userId, clientIp);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        /// <summary>
        /// Marks a contest entry as the winner. Restricted to Admin.
        /// </summary>
        [HttpPut("entries/{entryId:int}/winner")]
        [Authorize(Roles = "ADMIN")]
        [ProducesResponseType(typeof(ApiResponse<ContestEntryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SelectWinner(int entryId)
        {
            var result = await _contestService.SelectWinnerAsync(entryId);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
    }
}

