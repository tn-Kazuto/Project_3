using System.Security.Claims;
using System.Security.Cryptography;
using JamesThew.ContestService.DTOs;
using JamesThew.ContestService.Services;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.ContestService.Controllers;

[ApiController]
[Route("api/contests")]
public sealed class ContestsController(
    ContestApplicationService contestService,
    AnnouncementApplicationService announcementService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public Task<ApiResponse<IEnumerable<ContestDto>>> GetAll([FromQuery] bool? activeOnly, CancellationToken cancellationToken) =>
        contestService.GetContestsAsync(activeOnly, cancellationToken);

    [HttpGet("summary")]
    [AllowAnonymous]
    public Task<ApiResponse<ContestSummaryDto>> GetSummary(CancellationToken cancellationToken) =>
        contestService.GetSummaryAsync(cancellationToken);

    [HttpGet("paged")]
    [AllowAnonymous]
    public Task<ApiResponse<PagedResult<ContestDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? activeOnly = null,
        CancellationToken cancellationToken = default) =>
        contestService.GetPagedContestsAsync(page, pageSize, activeOnly, cancellationToken);

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var response = await contestService.GetContestAsync(id, cancellationToken);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateContestRequest request, CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var adminId))
        {
            return Unauthorized(ApiResponse<ContestDto>.Fail("Unauthorized access."));
        }

        var response = await contestService.CreateContestAsync(
            request, adminId, User.FindFirst("FullName")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value ?? "Admin", cancellationToken);
        return response.Success ? StatusCode(StatusCodes.Status201Created, response) : BadRequest(response);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var response = await contestService.DeleteContestAsync(id, cancellationToken);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPost("{id:int}/entries")]
    [AllowAnonymous]
    public async Task<IActionResult> SubmitEntry(int id, [FromBody] SubmitEntryRequest request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var response = await contestService.SubmitEntryAsync(
            id,
            request,
            userId,
            User.FindFirst("FullName")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value ?? "Member",
            User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
            cancellationToken);
        return response.Success ? StatusCode(StatusCodes.Status201Created, response) : BadRequest(response);
    }

    [HttpGet("{id:int}/entries")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> GetEntries(
        int id,
        [FromQuery] bool? orderByVotes,
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        CancellationToken cancellationToken)
    {
        if (!page.HasValue)
        {
            return await GetEntriesResponse(id, orderByVotes, includePrivateDetails: true, cancellationToken);
        }

        var userId = GetCurrentUserId();
        var guestVoteToken = userId.HasValue ? string.Empty : GetGuestVoteToken();
        var response = await contestService.GetPagedEntriesAsync(
            id, page.Value, pageSize ?? 10, userId, guestVoteToken, orderByVotes, cancellationToken);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpGet("{id:int}/community-entries")]
    [AllowAnonymous]
    public Task<IActionResult> GetCommunityEntries(int id, [FromQuery] bool? orderByVotes, CancellationToken cancellationToken) =>
        GetEntriesResponse(id, orderByVotes, includePrivateDetails: false, cancellationToken);

    [HttpPost("entries/{entryId:int}/vote")]
    [AllowAnonymous]
    public async Task<IActionResult> VoteEntry(int entryId, [FromBody] VoteContestEntryRequest? request, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var guestVoteToken = userId.HasValue ? string.Empty : GetGuestVoteToken();
        var response = await contestService.VoteAsync(
            entryId, request ?? new VoteContestEntryRequest(), userId, guestVoteToken, cancellationToken);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPut("entries/{entryId:int}/winner")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> SelectWinner(int entryId, CancellationToken cancellationToken)
    {
        var response = await announcementService.SelectWinnerAsync(entryId, cancellationToken);
        return response.Success ? Ok(response) : NotFound(response);
    }

    private async Task<IActionResult> GetEntriesResponse(
        int contestId, bool? orderByVotes, bool includePrivateDetails, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var guestVoteToken = userId.HasValue ? string.Empty : GetGuestVoteToken();
        var response = await contestService.GetEntriesAsync(
            contestId, userId, guestVoteToken, orderByVotes, includePrivateDetails, cancellationToken);
        return response.Success ? Ok(response) : NotFound(response);
    }

    private int? GetCurrentUserId() =>
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) ? userId : null;

    private string GetGuestVoteToken()
    {
        const string cookieName = "jamesthew_guest_vote";
        if (Request.Cookies.TryGetValue(cookieName, out var currentToken) &&
            currentToken.Length == 64 && currentToken.All(Uri.IsHexDigit))
        {
            return currentToken;
        }

        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLowerInvariant();
        Response.Cookies.Append(cookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/api/contests",
            MaxAge = TimeSpan.FromDays(365)
        });
        return token;
    }
}
