using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// Cooking tips service handling tip listings, search, content gatekeeping, and ownership enforcement.
    /// </summary>
    public interface ITipService
    {
        Task<ApiResponse<IEnumerable<TipDto>>> GetAllAsync(string? search, int? currentUserId, string? userRole);
        Task<ApiResponse<TipDto>> GetByIdAsync(int id, int? currentUserId, string? userRole);
        Task<ApiResponse<IEnumerable<TipDto>>> GetMyTipsAsync(int currentUserId);
        Task<ApiResponse<TipDto>> CreateAsync(CreateTipRequest request, int currentUserId, string userRole);
        Task<ApiResponse<TipDto>> UpdateAsync(int id, UpdateTipRequest request, int currentUserId, string userRole);
        Task<ApiResponse> DeleteAsync(int id, int currentUserId, string userRole);
    }
}

