using System.Globalization;
using JamesThew.CommunityService.Services;
using JamesThew.Shared.Contracts.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JamesThew.CommunityService.Controllers;

[ApiController]
[Route("api/recipes")]
public sealed class RecipeShareCountsController(CommunityApplicationService communityService) : ControllerBase
{
    private const int MaxRecipeIds = 100;

    [HttpGet("share-counts")]
    [AllowAnonymous]
    public async Task<IActionResult> Get([FromQuery] string? ids, CancellationToken cancellationToken)
    {
        var values = ids?.Split(',', StringSplitOptions.TrimEntries);
        if (values is null || values.Length is 0 or > MaxRecipeIds)
        {
            return BadRequest(ApiResponse<Dictionary<int, int>>.Fail(
                $"Provide between 1 and {MaxRecipeIds} recipe IDs."));
        }

        var recipeIds = new List<int>(values.Length);
        foreach (var value in values)
        {
            if (!int.TryParse(value, NumberStyles.None, CultureInfo.InvariantCulture, out var recipeId) || recipeId <= 0)
            {
                return BadRequest(ApiResponse<Dictionary<int, int>>.Fail(
                    "Recipe IDs must be positive integers."));
            }

            recipeIds.Add(recipeId);
        }

        var response = await communityService.GetShareCountsAsync(recipeIds, cancellationToken);
        return Ok(response);
    }
}
