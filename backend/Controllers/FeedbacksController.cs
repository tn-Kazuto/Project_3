using System.Security.Claims;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    /// <summary>
    /// Feedbacks controller managing reviews on recipes and general feedback for the website.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbacksController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbacksController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        private int? GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(idClaim, out var id) ? id : null;
        }

        /// <summary>
        /// Submits feedback for a recipe or general website experience.
        /// Per SRS: Both guests and registered members can submit feedback.
        /// </summary>
        [HttpPost]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<FeedbackDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateFeedbackRequest request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(ApiResponse<FeedbackDto>.Fail("Validation failed", errors));
            }

            var currentUserId = GetCurrentUserId();
            var result = await _feedbackService.CreateAsync(request, currentUserId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return StatusCode(StatusCodes.Status201Created, result);
        }

        /// <summary>
        /// Retrieves all feedback comments left on a specific recipe.
        /// </summary>
        [HttpGet("recipe/{recipeId:int}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<FeedbackDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByRecipe(int recipeId)
        {
            var result = await _feedbackService.GetByRecipeIdAsync(recipeId);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves all feedback submitted across the entire website.
        /// Restricted to Admin (Chef James Thew).
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<FeedbackDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAll()
        {
            var result = await _feedbackService.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Deletes a feedback item. Restricted to Admin (Chef James Thew).
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _feedbackService.DeleteAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }
    }
}

