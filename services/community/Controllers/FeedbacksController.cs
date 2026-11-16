using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using JamesThew.CommunityService.DTOs;
using JamesThew.CommunityService.Services;
using JamesThew.Shared.Contracts.Constants;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.CommunityService.Controllers;

[ApiController]
[Route("api/feedbacks")]
[Route("api/v1/feedbacks")]
public sealed class FeedbacksController(CommunityApplicationService communityService) : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreateFeedbackRequest request, CancellationToken cancellationToken)
    {
        var response = await communityService.CreateFeedbackAsync(
            request,
            GetCurrentUserId(),
            User.FindFirst("FullName")?.Value,
            User.FindFirst(ClaimTypes.Email)?.Value,
            cancellationToken);
        return response.Success ? StatusCode(StatusCodes.Status201Created, response) : BadRequest(response);
    }

    [HttpGet("recipe/{recipeId:int}")]
    [AllowAnonymous]
    public Task<ApiResponse<IEnumerable<FeedbackDto>>> GetByRecipe([Range(1, int.MaxValue)] int recipeId, CancellationToken cancellationToken) =>
        communityService.GetByRecipeAsync(recipeId, cancellationToken);

    [HttpGet("recipe/{recipeId:int}/rating-summary")]
    [AllowAnonymous]
    public Task<ApiResponse<RecipeRatingSummaryDto>> GetRatingSummary([Range(1, int.MaxValue)] int recipeId, CancellationToken cancellationToken) =>
        communityService.GetRatingSummaryAsync(recipeId, cancellationToken);

    [HttpGet]
    [Authorize(Roles = AppConstants.Roles.Admin)]
    public Task<ApiResponse<IEnumerable<FeedbackDto>>> GetAll(CancellationToken cancellationToken) =>
        communityService.GetAllAsync(cancellationToken);

    [HttpGet("paged")]
    [Authorize(Roles = AppConstants.Roles.Admin)]
    public Task<ApiResponse<PagedResult<FeedbackDto>>> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? feedbackType = null,
        CancellationToken cancellationToken = default) =>
        communityService.GetPagedAsync(page, pageSize, feedbackType, cancellationToken);

    [HttpDelete("{id:int}")]
    [Authorize(Roles = AppConstants.Roles.Admin)]
    public async Task<IActionResult> Delete([Range(1, int.MaxValue)] int id, CancellationToken cancellationToken)
    {
        var response = await communityService.DeleteAsync(id, cancellationToken);
        return response.Success ? Ok(response) : NotFound(response);
    }

    private int? GetCurrentUserId() =>
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) ? userId : null;
}
