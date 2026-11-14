using System.Security.Claims;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Recipes controller managing culinary recipe browsing, content gatekeeping, and member authoring.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class RecipesController : ControllerBase
    {
        private readonly IRecipeService _recipeService;

        public RecipesController(IRecipeService recipeService)
        {
            _recipeService = recipeService;
        }

        private (int? UserId, string? Role) GetCurrentUser()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            int? userId = int.TryParse(idClaim, out var id) ? id : null;
            return (userId, roleClaim);
        }

        /// <summary>
        /// Retrieves recipes with keyword search and category filtering.
        /// Content Gatekeeping: Unauthenticated guests only receive free recipes (IsFree == true).
        /// Registered members and Admins receive all recipes.
        /// Supports optional pagination via 'page' (default 1) and 'pageSize' (default 12, max 50).
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<RecipeDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<JamesThew.Shared.Contracts.DTOs.Common.PagedResult<RecipeDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search, 
            [FromQuery] int? categoryId,
            [FromQuery] bool? isFreeOnly,
            [FromQuery] string? contentType,
            [FromQuery] int? page = null,
            [FromQuery] int? pageSize = null)
        {
            var (userId, role) = GetCurrentUser();
            if (page.HasValue)
            {
                var pagedResult = await _recipeService.GetPagedAsync(
                    page.Value, pageSize ?? 12, search, categoryId, userId, role, isFreeOnly, contentType);
                return Ok(pagedResult);
            }

            var result = await _recipeService.GetAllAsync(search, categoryId, userId, role, isFreeOnly, contentType);
            return Ok(result);
        }

        /// <summary>
        /// Dedicated paginated recipe catalog endpoint adhering strictly to PERF-09 (default 12, max 50).
        /// </summary>
        [HttpGet("paged")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<JamesThew.Shared.Contracts.DTOs.Common.PagedResult<RecipeDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? search = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] bool? isFreeOnly = null,
            [FromQuery] string? contentType = null)
        {
            var (userId, role) = GetCurrentUser();
            var pagedResult = await _recipeService.GetPagedAsync(
                page, pageSize, search, categoryId, userId, role, isFreeOnly, contentType);
            return Ok(pagedResult);
        }

        /// <summary>
        /// Retrieves a recipe by ID with full cooking procedure, ingredients, and feedback.
        /// Content Gatekeeping: If the recipe is premium and user is not logged in, returns 403 Forbidden.
        /// </summary>
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<RecipeDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var (userId, role) = GetCurrentUser();
            var result = await _recipeService.GetByIdAsync(id, userId, role);

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
        /// Retrieves all recipes authored by the logged-in user.
        /// </summary>
        [HttpGet("my-recipes")]
        [Authorize(Roles = "MEMBER,ADMIN")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<RecipeDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetMyRecipes()
        {
            var (userId, _) = GetCurrentUser();
            if (userId == null)
            {
                return Unauthorized(ApiResponse<IEnumerable<RecipeDto>>.Fail("Unauthorized access."));
            }

            var result = await _recipeService.GetMyRecipesAsync(userId.Value);
            return Ok(result);
        }

        /// <summary>
        /// Publishes a new recipe. Requires Member or Admin role.
        /// Admin users can mark recipes as Free or Members Only; Member submissions default to Members Only.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "MEMBER,ADMIN")]
        [ProducesResponseType(typeof(ApiResponse<RecipeDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Create([FromBody] CreateRecipeRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<RecipeDto>.Fail("Validation failed", errors));
            }

            var (userId, role) = GetCurrentUser();
            if (userId == null || role == null)
            {
                return Unauthorized(ApiResponse<RecipeDto>.Fail("Unauthorized access."));
            }

            var result = await _recipeService.CreateAsync(request, userId.Value, role);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Updates an existing recipe.
        /// Ownership Authorization: Only the original author can edit this recipe.
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "MEMBER,ADMIN")]
        [ProducesResponseType(typeof(ApiResponse<RecipeDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRecipeRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<RecipeDto>.Fail("Validation failed", errors));
            }

            var (userId, role) = GetCurrentUser();
            if (userId == null || role == null)
            {
                return Unauthorized(ApiResponse<RecipeDto>.Fail("Unauthorized access."));
            }

            var result = await _recipeService.UpdateAsync(id, request, userId.Value, role);
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
        /// Deletes a recipe.
        /// Ownership Authorization: Only the original author can delete this recipe.
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

            var result = await _recipeService.DeleteAsync(id, userId.Value, role);
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
        /// Increments the social share count for a recipe (e.g. when shared to Facebook or copied).
        /// </summary>
        [HttpPost("{id:int}/share")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Share(int id)
        {
            var result = await _recipeService.IncrementShareCountAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }
            return Ok(result);
        }
    }
}

