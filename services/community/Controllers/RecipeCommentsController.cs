using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using JamesThew.CommunityService.DTOs;
using JamesThew.CommunityService.Services;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.CommunityService.Controllers;

[ApiController]
[Route("api/recipes/{recipeId:int}/comments")]
[Route("api/v1/recipes/{recipeId:int}/comments")]
public sealed class RecipeCommentsController(CommunityApplicationService communityService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public Task<ApiResponse<IEnumerable<FeedbackDto>>> Get(
        [Range(1, int.MaxValue)] int recipeId,
        CancellationToken cancellationToken) =>
        communityService.GetByRecipeAsync(recipeId, cancellationToken);

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create(
        [Range(1, int.MaxValue)] int recipeId,
        [FromBody] CreateFeedbackRequest request,
        CancellationToken cancellationToken)
    {
        request.RecipeId = recipeId;
        var response = await communityService.CreateFeedbackAsync(
            request,
            GetCurrentUserId(),
            User.FindFirst("FullName")?.Value,
            User.FindFirst(ClaimTypes.Email)?.Value,
            cancellationToken);
        return response.Success ? StatusCode(StatusCodes.Status201Created, response) : BadRequest(response);
    }

    private int? GetCurrentUserId() =>
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) ? userId : null;
}
