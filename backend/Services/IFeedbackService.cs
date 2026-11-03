using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// Feedback service managing user and guest reviews for recipes and general website feedback.
    /// </summary>
    public interface IFeedbackService
    {
        Task<ApiResponse<FeedbackDto>> CreateAsync(CreateFeedbackRequest request, int? currentUserId);
        Task<ApiResponse<IEnumerable<FeedbackDto>>> GetByRecipeIdAsync(int recipeId);
        Task<ApiResponse<IEnumerable<FeedbackDto>>> GetAllAsync();
        Task<ApiResponse> DeleteAsync(int id);
    }
}

