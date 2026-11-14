using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// Recipe service handling recipe cataloging, search, content gatekeeping, and ownership enforcement.
    /// </summary>
    public interface IRecipeService
    {
        Task<ApiResponse<IEnumerable<RecipeDto>>> GetAllAsync(string? search, int? categoryId, int? currentUserId, string? userRole, bool? isFreeOnly = null, string? contentType = null);
        Task<ApiResponse<JamesThew.Shared.Contracts.DTOs.Common.PagedResult<RecipeDto>>> GetPagedAsync(int page, int pageSize, string? search, int? categoryId, int? currentUserId, string? userRole, bool? isFreeOnly = null, string? contentType = null);
        Task<ApiResponse<RecipeDto>> GetByIdAsync(int id, int? currentUserId, string? userRole);
        Task<ApiResponse<IEnumerable<RecipeDto>>> GetMyRecipesAsync(int currentUserId);
        Task<ApiResponse<RecipeDto>> CreateAsync(CreateRecipeRequest request, int currentUserId, string userRole);
        Task<ApiResponse<RecipeDto>> UpdateAsync(int id, UpdateRecipeRequest request, int currentUserId, string userRole);
        Task<ApiResponse> DeleteAsync(int id, int currentUserId, string userRole);
        Task<ApiResponse<int>> IncrementShareCountAsync(int id);
    }
}

