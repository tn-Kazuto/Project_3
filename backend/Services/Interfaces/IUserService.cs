using backend.DTOs;

namespace backend.Services
{
    /// <summary>
    /// Service for profile retrieval, profile updates, and password changes.
    /// </summary>
    public interface IUserService
    {
        Task<ApiResponse<UserDto>> GetProfileAsync(int userId);
        Task<ApiResponse<UserDto>> UpdateProfileAsync(int userId, UpdateProfileRequest request);
        Task<ApiResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request);
        Task<ApiResponse<UserDto>> RenewSubscriptionAsync(int userId, RenewSubscriptionRequest request);
    }
}

