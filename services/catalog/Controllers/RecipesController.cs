using System.Security.Claims;
using JamesThew.CatalogService.DTOs;
using JamesThew.CatalogService.Services;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.CatalogService.Controllers;

[ApiController]
[Route("api/recipes")]
[Route("api/v1/recipes")]
public sealed class RecipesController(RecipeCatalogService catalog) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] bool? isFreeOnly,
        [FromQuery] string? contentType,
        [FromQuery] int? page = null,
        [FromQuery] int? pageSize = null,
        CancellationToken cancellationToken = default)
    {
        var actor = GetCurrentActor();
        if (page.HasValue)
        {
            return Ok(await catalog.GetPagedAsync(page.Value, pageSize ?? 12, search, categoryId,
                contentType, isFreeOnly, actor, cancellationToken));
        }

        return Ok(await catalog.GetAllAsync(search, categoryId, contentType, isFreeOnly, actor, cancellationToken));
    }

    [HttpGet("paged")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12,
        [FromQuery] string? search = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] bool? isFreeOnly = null,
        [FromQuery] string? contentType = null,
        CancellationToken cancellationToken = default) =>
        Ok(await catalog.GetPagedAsync(page, pageSize, search, categoryId, contentType,
            isFreeOnly, GetCurrentActor(), cancellationToken));

    [HttpGet("my-recipes")]
    [Authorize(Roles = "MEMBER,ADMIN")]
    public async Task<IActionResult> GetMyRecipes(CancellationToken cancellationToken)
    {
        var userId = GetCurrentActor().UserId;
        if (userId is null) return Unauthorized(ApiResponse<IEnumerable<RecipeDto>>.Fail("Unauthorized access."));
        return Ok(await catalog.GetMyRecipesAsync(userId.Value, cancellationToken));
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
    public async Task<IActionResult> Create([FromBody] CreateRecipeRequest request, CancellationToken cancellationToken)
    {
        var actor = GetCurrentActor();
        if (actor.UserId is null || string.IsNullOrWhiteSpace(actor.Role))
            return Unauthorized(ApiResponse<RecipeDto>.Fail("Unauthorized access."));

        var response = await catalog.CreateAsync(request, actor, cancellationToken);
        return response.Success ? StatusCode(StatusCodes.Status201Created, response) : BadRequest(response);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "MEMBER,ADMIN")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateRecipeRequest request,
        CancellationToken cancellationToken)
    {
        var actor = GetCurrentActor();
        if (actor.UserId is null || string.IsNullOrWhiteSpace(actor.Role))
            return Unauthorized(ApiResponse<RecipeDto>.Fail("Unauthorized access."));

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
