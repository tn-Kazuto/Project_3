using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using JamesThew.CommunityService.Services;
using JamesThew.CommunityService.DTOs;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace JamesThew.CommunityService.Controllers;

[ApiController]
[Route("api/recipes/{recipeId:int}")]
public sealed class RecipeSharesController(CommunityApplicationService communityService) : ControllerBase
{
    [HttpPost("share")]
    [AllowAnonymous]
    public Task<ApiResponse<int>> RecordShare(
        [Range(1, int.MaxValue)] int recipeId,
        [FromBody(EmptyBodyBehavior = EmptyBodyBehavior.Allow)] ShareRequest? request,
        CancellationToken cancellationToken) =>
        communityService.RecordShareAsync(recipeId, GetCurrentUserId(), request?.Channel, cancellationToken);

    [HttpGet("shares")]
    [AllowAnonymous]
    public Task<ApiResponse<int>> GetShareCount([Range(1, int.MaxValue)] int recipeId, CancellationToken cancellationToken) =>
        communityService.GetShareCountAsync(recipeId, cancellationToken);

    private int? GetCurrentUserId() =>
        int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) ? userId : null;
}
