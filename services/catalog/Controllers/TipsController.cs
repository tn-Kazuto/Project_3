using System.Security.Claims;
using JamesThew.CatalogService.DTOs;
using JamesThew.CatalogService.Services;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.CatalogService.Controllers;

[ApiController]
[Route("api/tips")]
[Route("api/v1/tips")]
public sealed class TipsController(TipCatalogService catalog) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? page = null,
        [FromQuery] int? pageSize = null,
        CancellationToken cancellationToken = default)
    {
        if (page.HasValue)
        {
            return Ok(await catalog.GetPagedAsync(page.Value, pageSize ?? 12, search,
                GetCurrentActor(), cancellationToken));
        }

        return Ok(await catalog.GetAllAsync(search, GetCurrentActor(), cancellationToken));
    }

    [HttpGet("paged")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? search = null,
        [FromQuery] bool? isFreeOnly = null,
        CancellationToken cancellationToken = default) =>
        Ok(await catalog.GetPagedAsync(page, pageSize, search, GetCurrentActor(), cancellationToken, isFreeOnly));

    [HttpGet("my-tips")]
    [Authorize(Roles = "MEMBER,ADMIN")]
    public async Task<IActionResult> GetMyTips(CancellationToken cancellationToken)
    {
        var userId = GetCurrentActor().UserId;
        if (userId is null) return Unauthorized(ApiResponse<IEnumerable<TipDto>>.Fail("Unauthorized access."));
        return Ok(await catalog.GetMyTipsAsync(userId.Value, cancellationToken));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var response = await catalog.GetByIdAsync(id, GetCurrentActor(), cancellationToken);
        if (response.Success) return Ok(response);
        if (response.Message.Contains("MEMBERS_ONLY", StringComparison.OrdinalIgnoreCase) ||
            response.Message.Contains("SUBSCRIPTION_EXPIRED", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, response);
        }

        return response.Message.Contains("SUBSCRIPTION_STATUS_UNAVAILABLE", StringComparison.OrdinalIgnoreCase)
            ? StatusCode(StatusCodes.Status503ServiceUnavailable, response)
            : NotFound(response);
    }

    [HttpPost]
    [Authorize(Roles = "MEMBER,ADMIN")]
    public async Task<IActionResult> Create([FromBody] CreateTipRequest request, CancellationToken cancellationToken)
    {
        var actor = GetCurrentActor();
        if (actor.UserId is null || string.IsNullOrWhiteSpace(actor.Role))
            return Unauthorized(ApiResponse<TipDto>.Fail("Unauthorized access."));

        var response = await catalog.CreateAsync(request, actor, cancellationToken);
        return response.Success ? StatusCode(StatusCodes.Status201Created, response) : BadRequest(response);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "MEMBER,ADMIN")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateTipRequest request,
        CancellationToken cancellationToken)
    {
        var actor = GetCurrentActor();
        if (actor.UserId is null || string.IsNullOrWhiteSpace(actor.Role))
            return Unauthorized(ApiResponse<TipDto>.Fail("Unauthorized access."));

        var response = await catalog.UpdateAsync(id, request, actor, cancellationToken);
        if (response.Success) return Ok(response);
        if (response.Message.Contains("FORBIDDEN", StringComparison.OrdinalIgnoreCase))
            return StatusCode(StatusCodes.Status403Forbidden, response);
        return NotFound(response);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "MEMBER,ADMIN")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var actor = GetCurrentActor();
        if (actor.UserId is null || string.IsNullOrWhiteSpace(actor.Role))
            return Unauthorized(ApiResponse<bool>.Fail("Unauthorized access."));

        var response = await catalog.DeleteAsync(id, actor, cancellationToken);
        if (response.Success) return Ok(response);
        if (response.Message.Contains("FORBIDDEN", StringComparison.OrdinalIgnoreCase))
            return StatusCode(StatusCodes.Status403Forbidden, response);
        return NotFound(response);
    }

    private CatalogActor GetCurrentActor() => new(
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) ? userId : null,
        User.FindFirst(ClaimTypes.Role)?.Value,
        User.FindFirst("FullName")?.Value ?? User.FindFirst(ClaimTypes.Name)?.Value,
        Request.Headers.Authorization.ToString());
}
